import { useEffect, useState } from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  isDead?: boolean;
}

export default function HealthBar({ health, maxHealth, isDead = false }: HealthBarProps) {
  const percent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  const getColor = () => {
    if (percent > 60) return '#22c55e'; // green
    if (percent > 30) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      width: '280px',
      background: 'rgba(0,0,0,0.7)',
      borderRadius: '8px',
      padding: '8px 12px',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
        <span>HP</span>
        <span>{Math.floor(health)} / {maxHealth}</span>
      </div>
      
      <div style={{
        height: '18px',
        background: '#374151',
        borderRadius: '9999px',
        overflow: 'hidden',
        border: '1px solid #4b5563'
      }}>
        <div 
          style={{
            height: '100%',
            width: `${percent}%`,
            background: getColor(),
            transition: 'width 0.3s ease-out, background 0.3s ease',
            borderRadius: '9999px'
          }} 
        />
      </div>

      {isDead && (
        <div style={{ 
          marginTop: '8px', 
          color: '#f87171', 
          fontWeight: 'bold', 
          fontSize: '13px',
          textAlign: 'center'
        }}>
          YOU ARE DEAD
        </div>
      )}
    </div>
  );
}
