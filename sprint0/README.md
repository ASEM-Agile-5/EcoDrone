## EcoDrone Hello World – Parrot ANAFI Ai (Olympe)

This README documents `hello_world_drone.py`, a **minimal “hello world” flight script** for the **Parrot ANAFI Ai** drone using the **Parrot Olympe** Python SDK.

The script:
- Connects to the drone over Wi‑Fi
- Prints the current **battery percentage**
- Performs a **safe vertical takeoff**
- Hovers briefly
- Then **lands and disconnects**

---

## 1. Prerequisites

### 1.1 Operating system

Olympe 7.x is officially supported on:

- **Ubuntu 20.04 LTS or newer** (x86_64 desktop)
- **Debian 10 or newer** (x86_64)

Other Debian‑based distros may work but are not officially documented.

> Tip: If you are on a bare/minimal server install, you may need extra system packages such as `libgl1` (see the Olympe installation docs).

### 1.2 Hardware

- **Parrot ANAFI Ai** drone (up‑to‑date firmware)
- Optional: **SkyController** (recommended for range and stability)
- Linux laptop/PC (x86_64) with Wi‑Fi

### 1.3 Python & Olympe

- **Python:** 3.8+ recommended
- **Parrot Olympe SDK** installed in your Python environment

Basic setup example:

```bash
sudo apt update
sudo apt install python3-venv python3-pip

python3 -m venv venv
source venv/bin/activate

# Install Olympe from Parrot’s wheels / PyPI
pip install parrot-olympe
```

Always refer to the official Olympe installation guide for the exact commands and latest versions  
`https://developer.parrot.com/docs/olympe/installation.html`

---

## 2. Script overview

File: `hello_world_drone.py`

Key imports:

- `olympe` – Parrot Olympe SDK
- `TakeOff`, `Landing` from `olympe.messages.ardrone3.Piloting`
- `FlyingStateChanged` from `olympe.messages.ardrone3.PilotingState`
- `common.CommonState.BatteryStateChanged` for battery %

High‑level flow:

1. **Connect** to the drone at `DRONE_IP`
2. **Retry** connection with a 10s timeout
3. Read and print **battery level (%)**
4. Run a **5‑second safety countdown**
5. **Take off** and wait for `FlyingStateChanged(state="hovering")`
6. Hover for a few seconds
7. **Land** and wait for `FlyingStateChanged(state="landed")`
8. Cleanly **disconnect**

---

## 3. Network & connection setup

At the top of `hello_world_drone.py`:

```python
# TRY SKYCONTROLLER IP FIRST (Most common setup)
# If you are connected directly to the drone, change this to "192.168.42.1"
DRONE_IP = "192.168.42.1"
```

### 3.1 Connecting via SkyController (recommended)

1. Power on the **SkyController**.
2. Power on the **ANAFI Ai** and let it link to the controller.
3. On your Ubuntu machine, connect to the **SkyController Wi‑Fi** network.
4. Set `DRONE_IP` in the script to the SkyController IP (commonly something like `192.168.53.1` – check your network settings).

### 3.2 Connecting directly to the ANAFI Ai

1. Power on the **ANAFI Ai**.
2. On your Ubuntu machine, connect to the **drone’s Wi‑Fi** network.
3. Set `DRONE_IP` in the script to:

```python
DRONE_IP = "192.168.42.1"
```

### 3.3 Simulator vs. real drone

If you previously used the **Sphinx simulator**, make sure its firmware daemon is stopped before talking to a real drone:

```bash
sudo systemctl stop firmwared
```

The script explicitly reminds you of this if connection fails.

---

## 4. How to run the script

1. Activate your Python environment (where Olympe is installed):

   ```bash
   source venv/bin/activate
   ```

2. Ensure:
   - ANAFI Ai is **powered on**
   - You are connected to the **correct Wi‑Fi** (SkyController or drone)
   - `DRONE_IP` in `hello_world_drone.py` matches your connection method

3. From the project directory, run:

   ```bash
   python hello_world_drone.py
   ```

4. You should see:
   - Connection attempt logs
   - “SUCCESS: Connected to Drone!”
   - Battery percentage
   - A **5‑second countdown**
   - “Taking Off…”, “Hovering…”
   - “Landing…”, “Landed.”

The drone will simply take off, hover briefly, and land vertically.

---

## 5. Safety notes

- Always fly in a **clear, open area** free of people, vehicles, trees, and wires.
- Maintain **visual line‑of‑sight** with the drone at all times.
- Keep the **controller in your hands** so you can take over manually if needed.
- Ensure the **battery level is sufficient** before running the script; the script prints the % but does not enforce any minimum.
- This script:
  - Uses **no obstacle avoidance**
  - Performs **only** a simple takeoff, short hover, and landing  
    (but real‑world conditions can cause unexpected behavior).

Use at your own risk; always comply with local regulations.

---

## 6. Troubleshooting

### 6.1 “ERROR: Failed to connect to DRONE_IP”

The script prints:

```text
ERROR: Failed to connect to 192.168.42.1.
1. Did you run 'sudo systemctl stop firmwared'?
2. Are you on the correct WiFi?
3. Try changing DRONE_IP to '192.168.42.1' in the script.
```

Checklist:

- Run `sudo systemctl stop firmwared` if you previously used Sphinx.
- Confirm you are on the **correct Wi‑Fi network** (SkyController vs drone).
- Double‑check `DRONE_IP` in the script:
  - SkyController IP if using the controller
  - `192.168.42.1` if connected directly to the drone

### 6.2 Script hangs or times out on takeoff / landing

This usually indicates:

- Weak / unstable Wi‑Fi link
- Drone or controller not fully initialized

Actions:

- Move closer to the drone / controller.
- Power‑cycle the drone (and controller, if used).
- Retry running the script.

### 6.3 Olympe import errors

If you see errors like:

```text
ModuleNotFoundError: No module named 'olympe'
```

Make sure:

- Your virtual environment is **activated** (`source venv/bin/activate`).
- Olympe is installed in that environment (`pip install parrot-olympe`).

---

## 7. Next steps

Once `hello_world_drone.py` works reliably, you can:

- Add **position and battery logging** using the shared `flight_logger.py` module.
- Introduce simple **horizontal movements** using `moveBy` for short trajectories.
- Build more advanced **missions** like in `sprint0_mission.py` and run them with logging.

