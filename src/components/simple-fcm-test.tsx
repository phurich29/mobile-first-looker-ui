import React from 'react';

export function SimpleFCMTest() {
  const handleTestClick = () => {
    console.log('FCM Test Component is working!');
    alert('FCM Test Component is working!');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #22c55e',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#22c55e' }}>FCM Test</h3>
      <button 
        onClick={handleTestClick}
        style={{
          background: '#22c55e',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test FCM Component
      </button>
    </div>
  );
}
