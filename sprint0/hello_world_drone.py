import olympe
import time
from olympe.messages.ardrone3.Piloting import TakeOff, Landing
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged

# TRY SKYCONTROLLER IP FIRST (Most common setup)
# If you are connected directly to the drone, change this to "192.168.42.1"
DRONE_IP = "192.168.42.1" 

def main():
    print(f"--- EcoDrone LIVE: Connecting to {DRONE_IP} ---")
    
    drone = olympe.Drone(DRONE_IP)

    # Increased timeout for real-world WiFi interference
    if not drone.connect(retry=5, timeout=10):
        print(f"ERROR: Failed to connect to {DRONE_IP}.")
        print("1. Did you run 'sudo systemctl stop firmwared'?")
        print("2. Are you on the correct WiFi?")
        print("3. Try changing DRONE_IP to '192.168.42.1' in the script.")
        return

    print("SUCCESS: Connected to Drone!")
    print("Battery level: ", drone.get_state(olympe.messages.common.CommonState.BatteryStateChanged)["percent"])

    # SAFETY: 5 Second countdown
    print("!!! TAKING OFF IN 5 SECONDS - HOLD CONTROLLER !!!")
    for i in range(5, 0, -1):
        print(i)
        time.sleep(1)

    # Take Off
    print("Taking Off...")
    assert drone(TakeOff() >> FlyingStateChanged(state="hovering", _timeout=10)).wait().success()
    print("Hovering...")
    
    time.sleep(4)

    # Land
    print("Landing...")
    assert drone(Landing() >> FlyingStateChanged(state="landed", _timeout=10)).wait().success()
    print("Landed.")
    
    drone.disconnect()

if __name__ == "__main__":
    main()