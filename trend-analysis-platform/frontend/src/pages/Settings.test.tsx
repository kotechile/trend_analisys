import React from 'react'

const SettingsTest: React.FC = () => {
  console.log('SettingsTest component rendering')
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '200px' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>SETTINGS TEST PAGE</h1>
      <p style={{ color: 'blue', fontSize: '18px' }}>If you can see this, the Settings component is loading!</p>
      <p style={{ color: 'green', fontSize: '14px' }}>Check browser console for debug messages</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'green', 
          color: 'white', 
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px'
        }}
        onClick={() => {
          console.log('Settings button clicked!')
          alert('Settings button clicked!')
        }}
      >
        Test Button
      </button>
    </div>
  )
}

export default SettingsTest
