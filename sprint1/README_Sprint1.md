# run_hello_with_logging.py — EcoDrone flight with CSV logging

This document describes **`run_hello_with_logging.py`**: a script that flies a Parrot ANAFI Ai drone (connect → take off → move **5 m forward** → move **5 m back** → land) and **logs every phase to a CSV file** using the shared **`flight_logger`** module. It includes dependency details, configuration, flight flow, and a full section on **`flight_logger.py`**.

---

## Table of contents

1. [Overview](#1-overview)
2. [Dependencies](#2-dependencies)
3. [flight_logger.py — detailed reference](#3-flight_loggerpy--detailed-reference)
4. [How run_hello_with_logging.py works](#4-how-run_hello_with_loggingpy-works)
5. [Configuration](#5-configuration)
6. [How to run](#6-how-to-run)
7. [Output: flight_log.csv](#7-output-flight_logcsv)
8. [Safety and error handling](#8-safety-and-error-handling)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

**Purpose:** Run a single, repeatable flight with **automatic CSV logging** of position and battery at connection, during flight (every 2 seconds), and at disconnect.

**Flight sequence:**

1. Connect to the drone at `DRONE_IP`.
2. Print battery level.
3. 5‑second safety countdown.
4. Take off and wait for hovering (15 s timeout).
5. Hover 2 s, then **move 5 m forward** (body frame).
6. Hold 3 s, then **move 5 m backward** (return).
7. Hold 2 s, then land (15 s timeout).
8. Disconnect.

**Logging:** A wrapper around `olympe.Drone` calls `flight_logger.log_flight_row()` on connect, every 2 s while connected, and on disconnect. All rows are appended to **`flight_log.csv`** (same directory as the scripts).

**Dependency:** The script **requires `flight_logger.py`** in the same directory (or on `PYTHONPATH`). It does **not** use `hello.py`.

---

## 2. Dependencies

### 2.1 Project file (required)

| File              | Role |
|-------------------|------|
| **`flight_logger.py`** | Defines `log_flight_row`, `FLIGHT_LOG_CSV`, and the CSV format. Must be importable (same folder or `PYTHONPATH`). |

### 2.2 External package

- **Parrot Olympe** (e.g. `pip install parrot-olympe`). Used for:
  - `olympe.Drone`
  - `TakeOff`, `Landing`, `moveBy` from `olympe.messages.ardrone3.Piloting`
  - `FlyingStateChanged` from `olympe.messages.ardrone3.PilotingState`
  - `olympe.messages.common.CommonState.BatteryStateChanged`

### 2.3 Standard library

- `threading`, `time`, `datetime` (no extra install).

---

## 3. flight_logger.py — detailed reference

`flight_logger.py` is the **shared logging backend** used by `run_hello_with_logging.py` (and optionally by `sprint0_mission.py` / `run_sprint0_with_logging.py`). It provides append‑only CSV logging of drone state (position, altitude, battery) with a single, consistent column layout.

### 3.1 Purpose and design

- **Single log file:** All flights append to one file, **`flight_log.csv`**, in the same directory as `flight_logger.py`.
- **Append‑only:** Headers are written only when the file is missing or empty; every call to `log_flight_row()` appends one row.
- **Shared format:** Any script that imports `log_flight_row` and calls it with a phase and optional `run_id` produces rows that can be merged and analyzed together.

### 3.2 File location and constant

- **`FLIGHT_LOG_CSV`**  
  Path to the CSV file. Set in `flight_logger.py` as:
  ```python
  LOG_DIR = os.path.dirname(os.path.abspath(__file__))
  FLIGHT_LOG_CSV = os.path.join(LOG_DIR, "flight_log.csv")
  ```
  So the file is always next to `flight_logger.py` (typically the project root).

### 3.3 CSV format and columns

**Headers** (in order):

| Column                     | Description |
|----------------------------|-------------|
| `timestamp`                | UTC time when the row was written (`YYYY-MM-DD HH:MM:SS`). |
| `run_id`                   | Identifier for the flight (e.g. `20260202_185514`). Same run_id for one flight. |
| `phase`                    | Logging phase: e.g. `connected`, `in_flight`, `disconnected`. |
| `latitude`                 | GPS latitude (degrees), 6 decimals. Empty if unavailable. |
| `longitude`                | GPS longitude (degrees), 6 decimals. Empty if unavailable. |
| `altitude_m`               | Altitude from GPS (meters), 2 decimals. Empty if unavailable. |
| `altitude_above_takeoff_m` | Altitude above takeoff point (meters), 2 decimals. Empty if unavailable. |
| `battery_pct`              | Battery percentage (0–100), 1 decimal. |
| `battery_remaining_mah`    | Remaining capacity in mAh (ANAFI Ai `battery.capacity`). Empty if not reported. |
| `battery_full_mah`         | Full charge capacity in mAh (ANAFI Ai `battery.capacity`). Empty if not reported. |

Empty cells mean the value was not available at log time (e.g. GPS not fixed, or capacity not sent).

### 3.4 Public API

**`log_flight_row(drone, phase, run_id=None)`**

- **`drone`** — Connected `olympe.Drone` instance (or wrapper that forwards `get_state()`).
- **`phase`** — String describing the moment (e.g. `"connected"`, `"in_flight"`, `"disconnected"`).
- **`run_id`** — Optional. If provided, all rows for that flight should use the same `run_id` for grouping.

Behavior:

1. Ensures the CSV file exists and has headers (if new or empty).
2. Reads current drone state (GPS, altitude, battery) via internal `_read_drone_state(drone)`.
3. Builds one record with `timestamp`, `run_id`, `phase`, and the state columns.
4. Appends the row to `flight_log.csv` (UTF‑8, newline‑safe).

**`FLIGHT_LOG_CSV`**

- Import this constant if you need to print or use the log path (e.g. “Logged to …”).

### 3.5 How state is read (_read_drone_state)

Internally, `flight_logger` uses Olympe’s **`drone.get_state(MessageClass)`** (message **classes**, not instances). It tries several sources and retries so that logging works even when states are not yet available.

**GPS and altitude:**

- **`GpsLocationChanged`** — latitude, longitude, altitude (GPS). Invalid sentinel values (e.g. 500.0) are skipped.
- **`AltitudeChanged`** — altitude above takeoff.

**Battery:**

- **`common.CommonState.BatteryStateChanged`** — `percent` (0–100). Used first.
- **`battery.capacity`** (ANAFI Ai) — `full_charge` and `remaining` in mAh. Fills `battery_full_mah` and `battery_remaining_mah`; if `battery_pct` is still empty, it is computed from remaining/full_charge.

**Retries:** Up to 3 attempts with 0.5 s delay between attempts so that early logs (e.g. right after connect) still get values once the drone has pushed state.

**Compatibility:** A small helper normalizes both dict‑like and attribute‑like state objects returned by `get_state()` so the same code works across Olympe versions.

### 3.6 When rows are written in run_hello_with_logging

- **Once** right after connect (after a 2 s delay so initial state is available).
- **Every 2 seconds** in a background thread while the drone is connected (`phase="in_flight"`).
- **Once** on disconnect (`phase="disconnected"`).

So for a short flight you get: one “connected” row, several “in_flight” rows, and one “disconnected” row, all with the same `run_id`.

---

## 4. How run_hello_with_logging.py works

### 4.1 Drone wrapper and patching

Before any flight code runs, the script **replaces** `olympe.Drone` with a custom factory that returns a **`_DroneLoggerWrapper`** instance:

- **Constructor:** Wraps the real `olympe.Drone(ip)` and stores a single `run_id` for the session.
- **`connect()`:** Calls the real `connect()`; on success, waits 2 s, logs one row with phase `"connected"`, then starts a **daemon thread** that calls `log_flight_row(..., "in_flight", run_id)` every 2 s.
- **`disconnect()`:** Stops the thread, logs one row with phase `"disconnected"`, then calls the real `disconnect()`.
- **Commands:** `__call__` and `__getattr__` forward all other calls (e.g. `TakeOff()`, `Landing()`, `moveBy()`) to the real drone.

So from the rest of the script’s point of view, `olympe.Drone(DRONE_IP)` is still used as usual, but every connect/disconnect and every 2 s in flight is logged via **`flight_logger.log_flight_row`**.

### 4.2 Flight sequence (_run_flight)

1. **Connect** — `drone.connect(retry=5, timeout=10)`. On failure, print error and return.
2. **Battery** — Print battery % from `get_state(CommonState.BatteryStateChanged)`.
3. **Countdown** — 5 s countdown (5, 4, 3, 2, 1).
4. **Take off** — `TakeOff() >> FlyingStateChanged(state="hovering", _timeout=15)`. On failure, print error, disconnect, return.
5. **Hover** — `time.sleep(2)`.
6. **Move forward 5 m** — `moveBy(5.0, 0.0, 0.0, 0.0)` with `FlyingStateChanged(state="hovering", _timeout=MOVE_TIMEOUT)`. On failure, attempt land, disconnect, return.
7. **Hold** — `time.sleep(3)`.
8. **Move back 5 m** — `moveBy(-5.0, 0.0, 0.0, 0.0)` with same timeout. On failure, attempt land, disconnect, return.
9. **Hold** — `time.sleep(2)`.
10. **Land** — `Landing() >> FlyingStateChanged(state="landed", _timeout=15)`. On failure, print message but still disconnect.
11. **Disconnect** — `drone.disconnect()` (wrapper logs `"disconnected"` then disconnects the real drone).

All of this uses the **same** `run_id` generated at script start, so every log row for this run shares that id.

---

## 5. Configuration

At the top of `run_hello_with_logging.py`:

| Variable        | Default           | Meaning |
|-----------------|-------------------|--------|
| **`DRONE_IP`**  | `"192.168.42.1"`  | Drone or SkyController IP. Use the drone’s Wi‑Fi IP (e.g. 192.168.42.1) or the SkyController’s IP if connected via controller. |
| **`MOVE_TIMEOUT`** | `25`           | Seconds to wait for the 5 m forward/back move to complete and the drone to report hovering again. |

Change `DRONE_IP` to match your network (direct drone vs SkyController). Increase `MOVE_TIMEOUT` only if 25 s is too short for your environment.

---

## 6. How to run

**Prerequisites:** Olympe installed, `flight_logger.py` in the same directory (or on path), drone powered and on the correct Wi‑Fi.

```bash
cd /path/to/agile_ecodrone
source venv/bin/activate   # if you use a venv
python run_hello_with_logging.py
```

Expected console output (summary):

- “Running with flight logging (run_id=…)”
- Connection attempt and “SUCCESS: Connected to Drone!”
- Battery level
- 5‑second countdown
- “Taking Off…” → “Hovering…”
- “>>> MOVING FORWARD (5 m) <<<” → “Holding position…”
- “<<< MOVING BACKWARD (5 m, return) <<<”
- “Landing…” → “Landed.”
- “Logged to …/flight_log.csv”

---

## 7. Output: flight_log.csv

After a run, open **`flight_log.csv`** (same folder as `flight_logger.py`). You’ll see:

- One row with `phase=connected` (and optionally later phases from the same run).
- Multiple rows with `phase=in_flight` (every 2 s).
- One row with `phase=disconnected`.

Columns will include timestamp, run_id, phase, and—when the drone provides them—latitude, longitude, altitude_m, altitude_above_takeoff_m, battery_pct, and optionally battery_remaining_mah and battery_full_mah. Empty cells mean that value was not available at that time.

---

## 8. Safety and error handling

- **No asserts:** Takeoff, move forward, move back, and landing use `.wait().success()` checks. On failure, the script prints an error, attempts to land/disconnect where appropriate, and exits instead of raising.
- **Timeouts:** Takeoff and landing use 15 s; each 5 m move uses `MOVE_TIMEOUT` (25 s).
- **Recovery:** If forward or back move fails, the script tries to land and then disconnect.

Always fly in an open area, keep line‑of‑sight, and have the controller ready to take over.

---

## 9. Troubleshooting

**“ModuleNotFoundError: No module named 'flight_logger'”**  
- Run the script from the directory that contains `flight_logger.py`, or ensure that directory is on `PYTHONPATH`.

**“ERROR: Failed to connect to …”**  
- Check Wi‑Fi (drone or SkyController).  
- Confirm `DRONE_IP`.  
- If you use Sphinx, run `sudo systemctl stop firmwared`.

**“ERROR: TakeOff failed (timeout or connection lost)”**  
- Connection was lost during or before takeoff. Improve Wi‑Fi, reduce distance, power‑cycle drone/controller, and retry.

**“ERROR: Move forward failed” / “Move back failed”**  
- Script will attempt to land and disconnect. Check link quality and obstacles; retry with a stable connection.

**CSV has empty latitude/longitude/battery**  
- First rows after connect may be empty if state wasn’t ready; later “in_flight” rows usually fill in. Ensure you’re using Olympe message **classes** (e.g. `GpsLocationChanged`) in `flight_logger` as in the current implementation.

**Changing log file location**  
- Edit `LOG_DIR` or `FLIGHT_LOG_CSV` in **`flight_logger.py`**; all callers (including `run_hello_with_logging.py`) will then use the new path.

---

## Summary

- **`run_hello_with_logging.py`** runs a single flight (connect → take off → 5 m forward → 5 m back → land) and logs to CSV via a drone wrapper.
- **`flight_logger.py`** provides the CSV file path, column layout, state reading from the drone (GPS, altitude, battery), and the single function **`log_flight_row(drone, phase, run_id=None)`** used to append each row.
- You need **`flight_logger.py`** next to the script (or on path) and **Olympe** installed. The log file is **`flight_log.csv`** in the same directory as `flight_logger.py`.
