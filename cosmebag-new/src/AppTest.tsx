import React from 'react';

function AppTest() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(to br, #9333ea, #ec4899)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1>CosmeBag App Test</h1>
        <p>If you see this, React is working!</p>
      </div>
    </div>
  );
}

export default AppTest;