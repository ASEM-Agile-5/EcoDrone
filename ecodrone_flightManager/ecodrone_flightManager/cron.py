import os
import requests
from dotenv import load_dotenv
load_dotenv()


def get_authenticated_session():
    """
    Creates a requests.Session, calls the login endpoint, and returns
    the session with the access_token cookie set automatically.
    Returns the session, or None if login fails.
    """
    base_url: str = os.getenv("FIREBASE")
    login_url = str(base_url) + "user/login"

    session = requests.Session()

    payload = {
        "email": os.getenv("CRON_EMAIL"),
        "password": os.getenv("CRON_PASSWORD"),
    }

    try:
        response = session.post(login_url, json=payload)
        response.raise_for_status()

        # Verify the access_token cookie was set by the server
        if 'access_token' not in session.cookies:
            # Fallback: extract token from response body and set cookie manually
            data = response.json()
            token = data.get("token")
            if token:
                session.cookies.set('access_token', token, domain=None, path='/')
                print("[get_authenticated_session] Token set from response body.")
            else:
                print("[get_authenticated_session] Login succeeded but no token found.")
                return None
        else:
            print("[get_authenticated_session] access_token cookie received from server.")

        return session
    except requests.exceptions.RequestException as e:
        print(f"[get_authenticated_session] Login failed: {e}")
        return None


def CheckOrders():
    """
    Periodically checks for 'Pending' orders and available drones.
    If a drone is available, assigns it to the first pending order.
    If no drones are available, the function exits and the cron job
    will re-trigger it on the next cycle.
    """
    # 1. Authenticate and get a session with the access_token cookie
    session = get_authenticated_session()
    if not session:
        print("[CheckOrders] Cannot proceed without a valid session.")
        return

    base_url = os.getenv("FIREBASE")
    Orders_url = base_url + "order/all"
    Drones_url = base_url + "drones/list"

    try:
        # Fetch all orders and drones — cookie is sent automatically by the session
        orders_response = session.get(Orders_url)
        orders_response.raise_for_status()
        orders = orders_response.json()

        drones_response = session.get(Drones_url)
        drones_response.raise_for_status()
        drones = drones_response.json()
    except requests.exceptions.RequestException as e:
        print(f"[CheckOrders] Error fetching data: {e}")
        return

    # Filter for pending orders
    pending_orders = [order for order in orders if order.get('status') == 'Pending']

    if not pending_orders:
        print("[CheckOrders] No pending orders found.")
        return

    # Find available drones
    available_drones = [drone for drone in drones if drone.get('status') == 'available']

    if not available_drones:
        print("[CheckOrders] No available drones. Will retry on next cycle.")
        return

    # Assign available drones to pending orders (one drone per order)
    for order in pending_orders:
        if not available_drones:
            print("[CheckOrders] Ran out of available drones. Remaining orders will be processed next cycle.")
            break

        drone = available_drones.pop(0)
        print(f"[CheckOrders] Assigning drone '{drone.get('id')}' to order '{order.get('id')}'")
        AssignDrone(session, order, drone)


def AssignDrone(session, order, drone):
    """
    Assigns a drone to a pending order by calling the backend API.
    Uses the authenticated session so the access_token cookie is included.
    """
    base_url = os.getenv("FIREBASE")
    assign_url = base_url + "orders/assign-drone"

    payload = {
        "order_id": order.get("order_id"),
        "drone_id": drone.get("id"),
    }

    try:
        response = session.post(assign_url, json=payload)
        response.raise_for_status()
        print(f"[AssignDrone] Successfully assigned drone '{drone.get('id')}' to order '{order.get('id')}'")
    except requests.exceptions.RequestException as e:
        print(f"[AssignDrone] Error assigning drone '{drone.get('id')}' to order '{order.get('id')}': {e}")