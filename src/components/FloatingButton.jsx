import React from 'react';
import sirenIcon from '../siren.svg';

export default function FloatingButton() {
  const handleClick = () => {
    window.open('https://forms.gle/YR8ScHbFAHecfRg68', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: 'calc(60px + 50px)',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#FF6B6B',
        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
      }}
    >
      <img 
        src={sirenIcon} 
        alt="긴급 설문" 
        style={{
          width: '30px',
          height: '30px',
          objectFit: 'contain'
        }}
      />
    </button>
  );
}
