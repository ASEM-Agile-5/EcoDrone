# run_hello_with_logging.py – run with CSV flight logging + cautious 5 m forward/back between take off and land
import threading
import time
from datetime import datetime

import olympe
from olympe.messages.ardrone3.Piloting import TakeOff, Landing, moveBy
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged

from flight_logger import FLIGHT_LOG_CSV, log_flight_row

DRONE_IP = "192.168.42.1"
MOVE_TIMEOUT = 25  # cautious: allow time for 5 m move to complete

# Generate one run_id for this flight
_run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
_RealDrone = olympe.Drone


class _DroneLoggerWrapper:
    """Wraps the real Drone and logs to flight_log.csv on connect, during flight, and on disconnect."""

    def __init__(self, real_drone, run_id):
        self._drone = real_drone
        self._run_id = run_id
        self._connected = False
        self._stop_thread = False
        self._log_thread = None

    def connect(self, *args, **kwargs):
        result = self._drone.connect(*args, **kwargs)
        if result:
            self._connected = True
            # Give the drone time to push initial states before first log
            time.sleep(2.0)
            log_flight_row(self._drone, "connected", self._run_id)
            self._stop_thread = False
            self._log_thread = threading.Thread(target=self._log_loop, daemon=True)
            self._log_thread.start()
        return result

    def _log_loop(self):
        while not self._stop_thread and self._connected:
            time.sleep(2)
            if self._stop_thread or not self._connected:
                break
            try:
                log_flight_row(self._drone, "in_flight", self._run_id)
            except Exception:
                pass

    def disconnect(self):
        self._connected = False
        self._stop_thread = True
        if self._log_thread is not None:
            self._log_thread.join(timeout=3)
        try:
            log_flight_row(self._drone, "disconnected", self._run_id)
        except Exception:
            pass
        self._drone.disconnect()

    def __call__(self, *args, **kwargs):
        """Forward drone(command) to the real drone (e.g. TakeOff, Landing)."""
        return self._drone(*args, **kwargs)

    def __getattr__(self, name):
        return getattr(self._drone, name)


def _patched_drone(ip):
    return _DroneLoggerWrapper(_RealDrone(ip), _run_id)


olympe.Drone = _patched_drone


def _run_flight():
    """Connect, take off, move 5 m forward, 5 m back, land, disconnect. Very cautious."""
    print(f"--- EcoDrone LIVE with logging: Connecting to {DRONE_IP} ---")
    drone = olympe.Drone(DRONE_IP)
    if not drone.connect(retry=5, timeout=10):
        print(f"ERROR: Failed to connect to {DRONE_IP}.")
        return
    print("SUCCESS: Connected to Drone!")
    try:
        bat = drone.get_state(olympe.messages.common.CommonState.BatteryStateChanged)
        pct = bat["percent"] if isinstance(bat, dict) else getattr(bat, "percent", None)
        print("Battery level:", pct)
    except Exception:
        pass
    print("!!! TAKING OFF IN 5 SECONDS - HOLD CONTROLLER !!!")
    for i in range(5, 0, -1):
        print(i)
        time.sleep(1)
    print("Taking Off...")
    takeoff_expectation = drone(TakeOff() >> FlyingStateChanged(state="hovering", _timeout=15))
    if not takeoff_expectation.wait().success():
        print("ERROR: TakeOff failed (timeout or connection lost). Check WiFi and drone.")
        try:
            drone.disconnect()
        except Exception:
            pass
        return
    print("Hovering...")
    time.sleep(2)
    # Cautious: 5 m forward only
    print(">>> MOVING FORWARD (5 m) <<<")
    move_fwd = drone(
        moveBy(5.0, 0.0, 0.0, 0.0)
        >> FlyingStateChanged(state="hovering", _timeout=MOVE_TIMEOUT)
    )
    if not move_fwd.wait().success():
        print("ERROR: Move forward failed. Landing...")
        try:
            drone(Landing() >> FlyingStateChanged(state="landed", _timeout=10)).wait()
        except Exception:
            pass
        try:
            drone.disconnect()
        except Exception:
            pass
        return
    print("Holding position...")
    time.sleep(3)
    # 5 m back to start
    print("<<< MOVING BACKWARD (5 m, return) <<<")
    move_back = drone(
        moveBy(-5.0, 0.0, 0.0, 0.0)
        >> FlyingStateChanged(state="hovering", _timeout=MOVE_TIMEOUT)
    )
    if not move_back.wait().success():
        print("ERROR: Move back failed. Landing...")
        try:
            drone(Landing() >> FlyingStateChanged(state="landed", _timeout=10)).wait()
        except Exception:
            pass
        try:
            drone.disconnect()
        except Exception:
            pass
        return
    time.sleep(2)
    print("Landing...")
    land_expectation = drone(Landing() >> FlyingStateChanged(state="landed", _timeout=15))
    if not land_expectation.wait().success():
        print("ERROR: Landing failed. Disconnecting.")
    try:
        drone.disconnect()
    except Exception:
        pass
    print("Landed.")


if __name__ == "__main__":
    print(f"--- Running with flight logging (run_id={_run_id}) ---")
    _run_flight()
    print(f"--- Logged to {FLIGHT_LOG_CSV} ---")
