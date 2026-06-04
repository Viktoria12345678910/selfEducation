import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      login(data.user, data.token);
      navigate('/');
    } catch {
      setError('Помилка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Вхід</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль"
            value={form.password} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>
        <p>Немає акаунту? <Link to="/register">Зареєструватись</Link></p>
      </div>
    </div>
  );
}
