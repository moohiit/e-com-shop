// src/pages/Login.jsx
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { loginThunk } from '../features/auth/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        className="input w-full mb-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="input w-full mb-4"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit" className="btn btn-primary w-full">Login</button>
    </form>
  );
}
