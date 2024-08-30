import React, { useEffect, useState } from 'react';

function HealthCheck() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/health');
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
        } else {
          setStatus('DOWN');
        }
      } catch (err) {
        setError(err);
        setStatus('DOWN');
      }
    };

    checkHealth();
  }, []);

  return (
    <div>
      <h1>Health Check</h1>
      {error && <p>Error: {error.message}</p>}
      <p>Status: {status}</p>
    </div>
  );
}

export default HealthCheck;
