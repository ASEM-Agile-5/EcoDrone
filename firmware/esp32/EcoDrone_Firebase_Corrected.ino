/*
 * EcoDrone — DHT11 + MQ2 → Firebase RTDB
 * Buffers samples in RAM when offline (no Wi‑Fi or Firebase not ready), uploads FIFO when back online.
 *
 * Before upload: set FIREBASE_API_KEY, WIFI credentials. Do not commit real secrets.
 */

#include <DHT.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <string.h>

// ── Wi-Fi (edit) ─────────────────────────────────────────────
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ── Firebase (edit) ──────────────────────────────────────────
#define FIREBASE_API_KEY  "YOUR_FIREBASE_WEB_API_KEY"
#define FIREBASE_DB_URL   "https://ecodrone-dev-default-rtdb.firebaseio.com"

#define FIREBASE_USE_ANONYMOUS 1
#define FIREBASE_EMAIL    "ecodrone-esp32@example.com"
#define FIREBASE_PASSWORD "change-this-strong-password"

// ── DHT11 ──────────────────────────────────────────────────────
#define DHTPIN   23
#define DHTTYPE  DHT11

// ── MQ2 ────────────────────────────────────────────────────────
#define MQ2_PIN               34
#define GAS_THRESHOLD_WARNING 228
#define GAS_THRESHOLD_DANGER  342

#define READ_INTERVAL_MS 5000

// ── Offline buffer (RAM). Oldest sample is dropped if full. ───
#ifndef SAMPLE_BUF_LEN
#define SAMPLE_BUF_LEN 40
#endif
#define FLUSH_DELAY_MS 120  // pause between RTDB batches while flushing

struct StoredSample {
  uint32_t deviceSec;  // millis()/1000 at capture time (relative to this boot)
  float    temp;
  float    humidity;
  int      gasRaw;
  int      gasPPM;
  char     alert[16];
  bool     dhtOk;
};

static StoredSample sampleQ[SAMPLE_BUF_LEN];
static int          qHead = 0;
static int          qCount = 0;

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;
DHT dht(DHTPIN, DHTTYPE);

bool firebaseReady     = false;
bool firebaseStarted   = false;
bool wifiIpPrinted     = false;
unsigned long lastSendTime    = 0;
unsigned long nextWiFiAttempt = 0;
const unsigned long WIFI_RETRY_MS = 5000;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 20000;

int rawToPPM(int raw) {
  return map(raw, 0, 4095, 100, 10000);
}

String gasStatus(int raw) {
  if (raw >= GAS_THRESHOLD_DANGER)  return "DANGER";
  if (raw >= GAS_THRESHOLD_WARNING) return "WARNING";
  return "OK";
}

void logRtdb(const char* tag, bool ok, bool* allOk) {
  if (ok) return;
  if (allOk) *allOk = false;
  Serial.printf("[FB FAIL] %s: %s\n", tag, fbdo.errorReason().c_str());
}

// FIFO: enqueue; if full, overwrite oldest (advance head).
void bufferEnqueue(const StoredSample& s) {
  if (qCount < SAMPLE_BUF_LEN) {
    int tail = (qHead + qCount) % SAMPLE_BUF_LEN;
    sampleQ[tail] = s;
    qCount++;
  } else {
    sampleQ[qHead] = s;
    qHead = (qHead + 1) % SAMPLE_BUF_LEN;
  }
}

bool bufferPeekOldest(StoredSample* out) {
  if (qCount == 0) return false;
  *out = sampleQ[qHead];
  return true;
}

void bufferDropOldest() {
  if (qCount == 0) return;
  qHead = (qHead + 1) % SAMPLE_BUF_LEN;
  qCount--;
}

bool canUploadToFirebase() {
  return WiFi.status() == WL_CONNECTED && firebaseStarted && firebaseReady;
}

// Upload one stored sample to RTDB (paths match live streaming sketch).
bool uploadSample(const StoredSample& s) {
  bool batchOk = true;

  if (s.dhtOk) {
    logRtdb("temp", Firebase.RTDB.setFloat(&fbdo, "/sensors/temperature", s.temp), &batchOk);
    logRtdb("humidity", Firebase.RTDB.setFloat(&fbdo, "/sensors/humidity", s.humidity), &batchOk);
  }

  String alertStr = String(s.alert);
  logRtdb("gas/raw",   Firebase.RTDB.setInt(&fbdo, "/sensors/gas/raw", s.gasRaw), &batchOk);
  logRtdb("gas/ppm",   Firebase.RTDB.setInt(&fbdo, "/sensors/gas/ppm", s.gasPPM), &batchOk);
  logRtdb("gas/alert", Firebase.RTDB.setString(&fbdo, "/sensors/gas/alert", alertStr), &batchOk);
  logRtdb("lastUpdated", Firebase.RTDB.setInt(&fbdo, "/sensors/lastUpdated", (int)s.deviceSec), &batchOk);

  return batchOk;  // false if any write failed
}

// Upload queued samples in order (oldest first). Stops if a batch fails (e.g. lost link).
void flushSampleBuffer() {
  if (qCount == 0) return;
  Serial.printf("[Buffer] Flushing %d queued sample(s)...\n", qCount);

  while (qCount > 0) {
    StoredSample next;
    if (!bufferPeekOldest(&next)) break;

    if (!uploadSample(next)) {
      Serial.println("[Buffer] Flush stopped (upload failed). Remaining samples kept.");
      break;
    }
    bufferDropOldest();
    delay(FLUSH_DELAY_MS);
  }

  if (qCount == 0) {
    Serial.println("[Buffer] Queue empty.");
  } else {
    Serial.printf("[Buffer] %d sample(s) still queued.\n", qCount);
  }
}

void startFirebase() {
  if (firebaseStarted || WiFi.status() != WL_CONNECTED) return;

  config.api_key               = FIREBASE_API_KEY;
  config.database_url          = FIREBASE_DB_URL;
  config.token_status_callback = tokenStatusCallback;

#if FIREBASE_USE_ANONYMOUS
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase anonymous sign-up OK");
  } else {
    Serial.printf("Firebase sign-up FAILED: %s\n",
                  config.signer.signupError.message.c_str());
    Serial.println("Enable Anonymous in Firebase Console → Authentication.");
  }
#else
  if (Firebase.signUp(&config, &auth, FIREBASE_EMAIL, FIREBASE_PASSWORD)) {
    Serial.println("Firebase email sign-up OK");
  } else {
    Serial.printf("Firebase sign-up FAILED: %s\n",
                  config.signer.signupError.message.c_str());
  }
#endif

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  firebaseStarted = true;
  Serial.println("Firebase initialized. Waiting for auth...\n");
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi already connected: " + WiFi.localIP().toString());
    wifiIpPrinted = true;
    return;
  }

  Serial.printf("Connecting to %s...\n", ssid);
  WiFi.begin(ssid, password);

  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < WIFI_CONNECT_TIMEOUT_MS) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connected! IP: " + WiFi.localIP().toString());
    wifiIpPrinted = true;
  } else {
    Serial.printf("WiFi timeout (status %d). Retrying from loop every %lu ms.\n",
                  (int)WiFi.status(), WIFI_RETRY_MS);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=====================================");
  Serial.println("  EcoDrone | DHT11 + MQ2 → Firebase ");
  Serial.println("  (offline buffer enabled)");
  Serial.println("=====================================\n");

  dht.begin();
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  connectWiFi();
  startFirebase();

  if (!firebaseStarted) {
    Serial.println("Firebase will start when WiFi connects.\n");
  }
}

void loop() {

  if (WiFi.status() != WL_CONNECTED && millis() >= nextWiFiAttempt) {
    wifiIpPrinted   = false;
    firebaseReady   = false;
    nextWiFiAttempt = millis() + WIFI_RETRY_MS;
    Serial.println("WiFi lost — retrying...");
    WiFi.disconnect(false);
    WiFi.begin(ssid, password);
  }

  if (WiFi.status() == WL_CONNECTED && !wifiIpPrinted) {
    Serial.println("WiFi reconnected: " + WiFi.localIP().toString());
    wifiIpPrinted = true;
  }

  startFirebase();

  if (!firebaseStarted) return;

  if (!firebaseReady && Firebase.ready()) {
    firebaseReady = true;
    Serial.println("Firebase ready! Sending / draining buffer...\n");
  }

  if (!firebaseReady) return;

  if (millis() - lastSendTime < READ_INTERVAL_MS) return;
  lastSendTime = millis();

  float humidity = dht.readHumidity();
  float tempC    = dht.readTemperature();
  int   gasRaw   = analogRead(MQ2_PIN);
  int   gasPPM   = rawToPPM(gasRaw);
  String alert   = gasStatus(gasRaw);

  StoredSample sample;
  sample.deviceSec = (uint32_t)(millis() / 1000);
  sample.gasRaw  = gasRaw;
  sample.gasPPM  = gasPPM;
  strncpy(sample.alert, alert.c_str(), sizeof(sample.alert) - 1);
  sample.alert[sizeof(sample.alert) - 1] = '\0';

  if (isnan(humidity) || isnan(tempC)) {
    sample.dhtOk = false;
    sample.temp = sample.humidity = NAN;
  } else {
    sample.dhtOk = true;
    sample.temp = tempC;
    sample.humidity = humidity;
  }

  Serial.println("========== Sensor Readings ==========");

  if (sample.dhtOk) {
    Serial.printf("[DHT11] Temp     : %.1f C\n", sample.temp);
    Serial.printf("[DHT11] Humidity : %.1f %%\n", sample.humidity);
  } else {
    Serial.println("[DHT11] ERROR: Failed to read!");
  }

  Serial.printf("[MQ2]   Raw ADC  : %d\n",      gasRaw);
  Serial.printf("[MQ2]   PPM      : ~%d ppm\n", gasPPM);
  Serial.printf("[MQ2]   Status   : %s\n",      alert.c_str());

  if (alert == "DANGER") {
    Serial.println("\n  !! DANGER: HIGH GAS — EVACUATE !!\n");
  } else if (alert == "WARNING") {
    Serial.println("\n  [WARNING] Elevated gas — ventilate.\n");
  }

  if (canUploadToFirebase()) {
    flushSampleBuffer();

    bool batchOk = true;
    if (sample.dhtOk) {
      logRtdb("temp", Firebase.RTDB.setFloat(&fbdo, "/sensors/temperature", sample.temp), &batchOk);
      logRtdb("humidity", Firebase.RTDB.setFloat(&fbdo, "/sensors/humidity", sample.humidity), &batchOk);
    }
    logRtdb("gas/raw",   Firebase.RTDB.setInt(&fbdo, "/sensors/gas/raw", sample.gasRaw), &batchOk);
    logRtdb("gas/ppm",   Firebase.RTDB.setInt(&fbdo, "/sensors/gas/ppm", sample.gasPPM), &batchOk);
    logRtdb("gas/alert", Firebase.RTDB.setString(&fbdo, "/sensors/gas/alert", alert), &batchOk);
    logRtdb("lastUpdated", Firebase.RTDB.setInt(&fbdo, "/sensors/lastUpdated", (int)sample.deviceSec), &batchOk);

    if (batchOk) {
      Serial.println("[Firebase] All RTDB writes OK for this cycle.");
    } else {
      Serial.println("[Firebase] Upload failed — queuing this sample.");
      bufferEnqueue(sample);
    }
  } else {
    bufferEnqueue(sample);
    Serial.printf("[Offline] Sample buffered (%d in queue, max %d).\n", qCount, SAMPLE_BUF_LEN);
  }

  Serial.println("=====================================\n");
}
