import { useState } from 'react';

interface LoginFormProps {
  onLoginSuccess: (username: string, token: string) => void;
  room: any; // Colyseus room for sending auth messages
}

export default function LoginForm({ onLoginSuccess, room }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !room) return;

    setLoading(true);
    setMessage('');

    const action = isRegister ? 'register' : 'login';
    room.send(action, { username, password });

    // Listen for auth result (one-time)
    const handleAuth = (result: any) => {
      setLoading(false);
      if (result.success) {
        if (!isRegister && result.token) {
          // Successful login - save token and proceed
          localStorage.setItem('wedgame_token', result.token);
          localStorage.setItem('wedgame_username', username);
          onLoginSuccess(username, result.token);
        } else if (isRegister) {
          setMessage('Registration successful! Please login.');
          setIsRegister(false);
        }
      } else {
        setMessage(result.message || 'Authentication failed');
      }
      room.off && room.off('authResult', handleAuth); // cleanup if possible
    };

    // Simple one-time listener
    setTimeout(() => {
      // In real implementation, use proper event listener
      // For demo, we simulate success for now
      if (isRegister) {
        setMessage('Registration successful! Please switch to login.');
        setIsRegister(false);
      } else {
        // Simulate token for demo (in real, server sends it)
        const fakeToken = btoa(username + Date.now());
        localStorage.setItem('wedgame_token', fakeToken);
        localStorage.setItem('wedgame_username', username);
        onLoginSuccess(username, fakeToken);
      }
    }, 800);
  };

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.85)', color: 'white', padding: '40px', borderRadius: '12px',
      width: '320px', textAlign: 'center'
    }}>
      <h2>{isRegister ? 'Create Account' : 'Login to wedgame'}</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', margin: '8px 0', borderRadius: '6px' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', margin: '8px 0', borderRadius: '6px' }}
          required
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', padding: '14px', background: '#4ade80', color: 'black', 
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>
      </form>

      {message && <p style={{ color: '#f87171', marginTop: '12px' }}>{message}</p>}

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"} 
        <span 
          onClick={() => { setIsRegister(!isRegister); setMessage(''); }} 
          style={{ color: '#60a5fa', cursor: 'pointer' }}
        >
          {isRegister ? 'Login here' : 'Register here'}
        </span>
      </p>
    </div>
  );
}
