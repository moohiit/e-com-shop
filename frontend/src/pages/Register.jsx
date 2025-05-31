// src/pages/Register.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { registerThunk } from '../features/auth/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(registerThunk(form));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl mb-4">Register</h2>
      <input name="name" placeholder="Name" className="input w-full mb-2" onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" className="input w-full mb-2" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" className="input w-full mb-4" onChange={handleChange} />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
