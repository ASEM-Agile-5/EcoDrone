import React, { useState, useEffect } from 'react';
import './App.css';
import { testBackendConnection } from './api';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [backendColor, setBackendColor] = useState('orange');

  useEffect(() => {
    // Test backend connection when component loads
    const checkBackend = async () => {
      const result = await testBackendConnection();
      if (result.success) {
        setBackendStatus('✅ Backend Connected!');
        setBackendColor('green');
      } else {
        setBackendStatus(`❌ Backend Error: ${result.message}`);
        setBackendColor('red');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚁 EcoDrone - Drone Management System</h1>
        <p style={{ color: backendColor, fontSize: '1.2em', fontWeight: 'bold' }}>
          {backendStatus}
        </p>
        <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
          <h3>System Status:</h3>
          <ul>
            <li>✅ Frontend: Deployed on Firebase</li>
            <li style={{ color: backendColor }}>
              {backendStatus.includes('Connected') ? '✅' : '❌'} Backend: Django on Cloud Run
            </li>
            <li>🔗 API URL: {process.env.REACT_APP_API_URL || 'Not set'}</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;