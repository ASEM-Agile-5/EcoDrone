const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return { success: true, message: 'Backend connected!' };
    } else {
      return { success: false, message: `Status: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getUsersAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/user/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};