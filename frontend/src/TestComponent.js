import React, { useEffect, useState } from 'react';

function TestComponent() {
  const [getResponse, setGetResponse] = useState(null);
  const [postResponse, setPostResponse] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Test the GET endpoint
    console.log('Attempting GET request to test endpoint...');
    fetch('http://localhost:5000/api/test')
      .then(response => {
        console.log('GET Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('GET Test endpoint response:', data);
        setGetResponse(data);
      })
      .catch(error => {
        console.error('Error fetching GET test endpoint:', error);
        setError('GET Error: ' + error.message);
      });
      
    // Test the POST endpoint
    console.log('Attempting POST request to test endpoint...');
    fetch('http://localhost:5000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    })
      .then(response => {
        console.log('POST Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('POST Test endpoint response:', data);
        setPostResponse(data);
      })
      .catch(error => {
        console.error('Error with POST test:', error);
        setError(prev => (prev ? prev + ' | POST Error: ' + error.message : 'POST Error: ' + error.message));
      });
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>CORS Test Page</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffeeee', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ff6666',
          marginBottom: '20px',
          color: '#cc0000'
        }}>
          <h3>Error Occurred:</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          backgroundColor: getResponse ? '#eeffee' : '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          border: getResponse ? '1px solid #66cc66' : '1px solid #dddddd'
        }}>
          <h2>GET Test</h2>
          {getResponse ? (
            <div>
              <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Successful!</p>
              <h3>Response:</h3>
              <pre style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(getResponse, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Waiting for response...</p>
          )}
        </div>
        
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          backgroundColor: postResponse ? '#eeffee' : '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          border: postResponse ? '1px solid #66cc66' : '1px solid #dddddd'
        }}>
          <h2>POST Test</h2>
          {postResponse ? (
            <div>
              <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Successful!</p>
              <h3>Response:</h3>
              <pre style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(postResponse, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Waiting for response...</p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>What This Means:</h3>
        <ul>
          <li>If both tests are successful, CORS is configured correctly for basic requests.</li>
          <li>If only GET works but POST fails, there might be an issue with CORS for non-GET requests.</li>
          <li>If both fail, there's likely a fundamental CORS configuration issue.</li>
        </ul>
        <p>Check your browser console for more detailed error messages.</p>
      </div>
    </div>
  );
}

export default TestComponent;