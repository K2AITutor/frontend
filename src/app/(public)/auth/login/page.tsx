'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:4000/auth/login', {
        email,
        password,
      });

      // Save JWT token
      localStorage.setItem('token', response.data.access_token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h1>Login</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />

      <button onClick={handleLogin} style={{ width: '100%' }}>
        Login
      </button>
    </div>
  );
}