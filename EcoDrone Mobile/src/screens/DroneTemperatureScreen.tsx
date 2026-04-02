import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { get, ref } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, firebaseAuth } from '../lib/firebase';

const { width } = Dimensions.get('window');
const MAX_POINTS = 10;

type ChartPoint = { time: string; value: number };

type SensorsPayload = {
  temperature?: number;
  humidity?: number;
  gas?: { raw?: number; ppm?: number; alert?: string };
  lastUpdated?: number;
};

function alertToLevel(alert?: string): 'Safe' | 'Warning' | 'Critical' {
  const a = (alert || '').toUpperCase();
  if (a === 'DANGER') return 'Critical';
  if (a === 'WARNING') return 'Warning';
  return 'Safe';
}

export default function DroneTemperatureScreen() {
  const insets = useSafeAreaInsets();
  const [sensors, setSensors] = useState<SensorsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempSeries, setTempSeries] = useState<ChartPoint[]>([]);
  const [humSeries, setHumSeries] = useState<ChartPoint[]>([]);
  const [gasSeries, setGasSeries] = useState<ChartPoint[]>([]);
  const lastUpdatedSeen = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!db || !firebaseAuth) {
      setError('Firebase not available.');
      setLoading(false);
      return;
    }

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const sensorsRef = ref(db, 'sensors');

    const applyCharts = (v: SensorsPayload | null) => {
      const lu = v?.lastUpdated;
      if (lu === undefined || lu === lastUpdatedSeen.current) return;
      lastUpdatedSeen.current = lu;

      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (v?.temperature != null) {
        setTempSeries(prev => [...prev, { time: t, value: v.temperature! }].slice(-MAX_POINTS));
      }
      if (v?.humidity != null) {
        setHumSeries(prev => [...prev, { time: t, value: v.humidity! }].slice(-MAX_POINTS));
      }
      if (v?.gas?.ppm != null) {
        setGasSeries(prev => [...prev, { time: t, value: v.gas!.ppm! }].slice(-MAX_POINTS));
      }
    };

    const pullOnce = async () => {
      try {
        const snap = await get(sensorsRef);
        if (!active) return;
        const v = snap.val() as SensorsPayload | null;
        setSensors(v);
        setLoading(false);
        setError(null);
        applyCharts(v);
      } catch (e: unknown) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to fetch sensor data.');
        setLoading(false);
      }
    };

    (async () => {
      setLoading(true);
      try {
        await signInAnonymously(firebaseAuth!);
      } catch (e) {
        console.warn('[Firebase] anon auth failed:', e);
      }
      if (!active) return;
      await pullOnce();
      intervalId = setInterval(() => { void pullOnce(); }, 1500);
    })();

    return () => {
      active = false;
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, []);

  const tempLevel: 'Safe' | 'Warning' =
    sensors?.temperature != null && (sensors.temperature < 18 || sensors.temperature > 35)
      ? 'Warning'
      : 'Safe';
  const gasLevel = alertToLevel(sensors?.gas?.alert);

  const tempDisplay = sensors?.temperature != null ? `${sensors.temperature.toFixed(1)}°C` : '—';
  const humDisplay = sensors?.humidity != null ? `${sensors.humidity.toFixed(1)}%` : '—';
  const gasPpmDisplay = sensors?.gas?.ppm != null ? `${sensors.gas.ppm} ppm` : '—';

  const makeChartConfig = (color: string) => ({
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: () => color,
    labelColor: () => colors.gray500,
    propsForDots: { r: '3', strokeWidth: '2', stroke: color },
    propsForBackgroundLines: { stroke: colors.gray100 },
  });

  const fallback = [{ time: '—', value: 0 }];

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Climate Analytics</Text>
        <Text style={styles.headerSubtitle}>Live sensor readings from Firebase</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Connecting to sensors…</Text>
          </View>
        )}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!loading && !error && sensors == null && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>No sensor data yet. Is the ESP32 online?</Text>
          </View>
        )}

        {/* Sensor Cards */}
        <View style={styles.cardsRow}>
          {/* Temperature */}
          <View style={[styles.sensorCard, tempLevel === 'Warning' ? styles.warnCard : styles.safeCard]}>
            <View style={styles.cardIconRow}>
              <View style={[styles.iconBox, { backgroundColor: '#16a34a' }]}>
                <Ionicons name="thermometer" size={20} color="#fff" />
              </View>
              <View style={[styles.badge, { backgroundColor: tempLevel === 'Warning' ? '#d97706' : '#16a34a' }]}>
                <Text style={styles.badgeText}>{tempLevel}</Text>
              </View>
            </View>
            <Text style={styles.sensorLabel}>Temperature</Text>
            <Text style={[styles.sensorValue, tempLevel === 'Warning' ? styles.warnText : styles.safeText]}>
              {tempDisplay}
            </Text>
          </View>

          {/* Humidity */}
          <View style={[styles.sensorCard, styles.blueCard]}>
            <View style={styles.cardIconRow}>
              <View style={[styles.iconBox, { backgroundColor: '#0284c7' }]}>
                <Ionicons name="water" size={20} color="#fff" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#0284c7' }]}>
                <Text style={styles.badgeText}>Humidity</Text>
              </View>
            </View>
            <Text style={styles.sensorLabel}>Relative Humidity</Text>
            <Text style={[styles.sensorValue, { color: '#0369a1' }]}>{humDisplay}</Text>
          </View>
        </View>

        {/* Gas Card */}
        <View style={[
          styles.sensorCardFull,
          gasLevel === 'Critical' ? styles.critCard : gasLevel === 'Warning' ? styles.warnCard : styles.safeCard,
        ]}>
          <View style={styles.cardIconRow}>
            <View style={[styles.iconBox, {
              backgroundColor: gasLevel === 'Critical' ? '#dc2626' : gasLevel === 'Warning' ? '#d97706' : '#16a34a',
            }]}>
              <Ionicons name="warning" size={20} color="#fff" />
            </View>
            <View style={[styles.badge, {
              backgroundColor: gasLevel === 'Critical' ? '#dc2626' : gasLevel === 'Warning' ? '#d97706' : '#16a34a',
            }]}>
              <Text style={styles.badgeText}>{gasLevel}</Text>
            </View>
          </View>
          <Text style={styles.sensorLabel}>Gas (MQ2 est.)</Text>
          <Text style={[styles.sensorValue,
            gasLevel === 'Critical' ? { color: '#991b1b' } : gasLevel === 'Warning' ? styles.warnText : styles.safeText,
          ]}>{gasPpmDisplay}</Text>
          <Text style={styles.sensorSub}>
            Alert: {sensors?.gas?.alert ?? '—'} · Raw: {sensors?.gas?.raw ?? '—'}
          </Text>
        </View>

        {/* Temperature Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Temperature (live)</Text>
          <LineChart
            data={{
              labels: (tempSeries.length ? tempSeries : fallback).map(p => p.time),
              datasets: [{ data: (tempSeries.length ? tempSeries : fallback).map(p => p.value) }],
            }}
            width={width - 64}
            height={180}
            yAxisSuffix="°"
            chartConfig={makeChartConfig('#10b981')}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Humidity Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Humidity (live)</Text>
          <LineChart
            data={{
              labels: (humSeries.length ? humSeries : fallback).map(p => p.time),
              datasets: [{ data: (humSeries.length ? humSeries : fallback).map(p => p.value) }],
            }}
            width={width - 64}
            height={180}
            yAxisSuffix="%"
            chartConfig={makeChartConfig('#38bdf8')}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Gas Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Gas PPM (live)</Text>
          <LineChart
            data={{
              labels: (gasSeries.length ? gasSeries : fallback).map(p => p.time),
              datasets: [{ data: (gasSeries.length ? gasSeries : fallback).map(p => p.value) }],
            }}
            width={width - 64}
            height={180}
            yAxisSuffix=" ppm"
            chartConfig={makeChartConfig('#f59e0b')}
            bezier
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 16, gap: 14 },
  centered: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  loadingText: { fontSize: 14, color: colors.gray500 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { fontSize: 13, color: '#b91c1c', flex: 1 },
  cardsRow: { flexDirection: 'row', gap: 12 },
  sensorCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 2, gap: 6 },
  sensorCardFull: { borderRadius: 14, padding: 14, borderWidth: 2, gap: 6 },
  safeCard: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  warnCard: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  critCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  blueCard: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  cardIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  sensorLabel: { fontSize: 12, color: colors.gray500 },
  sensorValue: { fontSize: 28, fontWeight: '700' },
  sensorSub: { fontSize: 11, color: colors.gray500 },
  safeText: { color: '#166534' },
  warnText: { color: '#92400e' },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  chart: { borderRadius: 10, marginLeft: -8 },
});
