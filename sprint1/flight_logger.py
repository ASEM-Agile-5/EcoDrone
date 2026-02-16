# flight_logger.py – shared CSV flight logging (append-only, same format for all scripts)
import csv
import os
import time
from datetime import datetime

import olympe
from olympe.messages.ardrone3.PilotingState import GpsLocationChanged, AltitudeChanged
from olympe.messages.battery import capacity

# CSV log file: project directory, append across all runs
LOG_DIR = os.path.dirname(os.path.abspath(__file__))
FLIGHT_LOG_CSV = os.path.join(LOG_DIR, "flight_log.csv")

CSV_HEADERS = [
    "timestamp", "run_id", "phase",
    "latitude", "longitude", "altitude_m",
    "altitude_above_takeoff_m",
    "battery_pct", "battery_remaining_mah", "battery_full_mah",
]


def _ensure_csv_headers():
    """Write CSV headers only if the file is new or empty (keeps append-only)."""
    if not os.path.exists(FLIGHT_LOG_CSV) or os.path.getsize(FLIGHT_LOG_CSV) == 0:
        with open(FLIGHT_LOG_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
            writer.writeheader()


def _get_value(obj, key, default=None):
    """Get key from dict or attribute from object (get_state may return either)."""
    if obj is None:
        return default
    try:
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)
    except Exception:
        return default


def _read_drone_state(drone, retries=3):
    """Read current position and battery from drone. Retries so we don't read before states arrive."""
    row = {
        "latitude": "",
        "longitude": "",
        "altitude_m": "",
        "altitude_above_takeoff_m": "",
        "battery_pct": "",
        "battery_remaining_mah": "",
        "battery_full_mah": "",
    }
    # get_state() expects message *classes* (no parentheses), same as hello.py
    BatteryStateChanged = olympe.messages.common.CommonState.BatteryStateChanged

    for attempt in range(retries):
        # GPS / position
        try:
            gps = drone.get_state(GpsLocationChanged)
            if gps:
                lat = _get_value(gps, "latitude")
                lon = _get_value(gps, "longitude")
                if lat not in (None, 500.0) and lon not in (None, 500.0):
                    row["latitude"] = round(float(lat), 6)
                    row["longitude"] = round(float(lon), 6)
                alt_gps = _get_value(gps, "altitude")
                if alt_gps is not None:
                    row["altitude_m"] = round(float(alt_gps), 2)
        except Exception:
            pass
        try:
            alt = drone.get_state(AltitudeChanged)
            a = _get_value(alt, "altitude")
            if alt and a is not None:
                row["altitude_above_takeoff_m"] = round(float(a), 2)
        except Exception:
            pass
        # Battery: CommonState (same as hello.py – class, not instance)
        try:
            bat = drone.get_state(BatteryStateChanged)
            pct = _get_value(bat, "percent")
            if pct is not None:
                row["battery_pct"] = round(float(pct), 1)
        except Exception:
            pass
        # Battery: capacity (Anafi AI – full_charge/remaining mAh); run after pct so we don't skip it
        try:
            cap = drone.get_state(capacity)
            full = _get_value(cap, "full_charge")
            rem = _get_value(cap, "remaining")
            if full is not None and rem is not None and full > 0:
                row["battery_full_mah"] = int(full)
                row["battery_remaining_mah"] = int(rem)
                if not row["battery_pct"]:
                    row["battery_pct"] = round(100.0 * rem / full, 1)
        except Exception:
            pass
        if row["battery_pct"]:
            break
        if attempt < retries - 1:
            time.sleep(0.5)
    return row


def log_flight_row(drone, phase, run_id=None):
    """Append one row to the flight CSV. Use same run_id for one flight."""
    _ensure_csv_headers()
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    state = _read_drone_state(drone)
    record = {
        "timestamp": ts,
        "run_id": run_id or ts,
        "phase": phase,
        **state,
    }
    with open(FLIGHT_LOG_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writerow(record)
