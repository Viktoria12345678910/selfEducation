import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', displayName: '', email: '',
    password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword)
      return setError('Паролі не співпадають');
    if (form.password.length < 6)
      return setError('Пароль мінімум 6 символів');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          displayName: form.displayName,
          email: form.email,
          password: form.password
        })
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
        <h2>Реєстрація</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username"
            value={form.username} onChange={handleChange} required />
          <input name="displayName" placeholder="Ім'я (як тебе бачать інші)"
            value={form.displayName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль"
            value={form.password} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Підтвердити пароль"
            value={form.confirmPassword} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Завантаження...' : 'Зареєструватись'}
          </button>
        </form>
        <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
      </div>
    </div>
  );
}
