import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, authFetch, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0, completedCourses: 0,
    totalNotes: 0, totalReading: 0, finishedReading: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentReading, setRecentReading] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [loading, setLoading] = useState(true);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) setForm({ displayName: user.displayName || '', bio: user.bio || '' });
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const coursesRes = await authFetch('/api/courses?page=1&limit=100');
      const coursesData = await coursesRes.json();
      const readingRes = await authFetch('/api/reading?page=1&limit=100');
      const readingData = await readingRes.json();

      let totalNotes = 0;
      for (const course of coursesData.data.slice(0, 5)) {
        const notesRes = await authFetch(`/api/notes/${course._id}`);
        const notes = await notesRes.json();
        totalNotes += notes.length;
      }

      setStats({
        totalCourses: coursesData.total,
        completedCourses: coursesData.data.filter(c => c.completed).length,
        totalNotes,
        totalReading: readingData.total,
        finishedReading: readingData.data.filter(r => r.finished).length
      });
      setRecentCourses(coursesData.data.slice(0, 3));
      setRecentReading(readingData.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const res = await authFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(form)
    });
    if (res.ok) setEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Видалити акаунт? Всі нотатки будуть видалені.')) return;
    await authFetch('/api/auth/profile', { method: 'DELETE' });
    logout();
  };

  if (loading) return <p className="loading">Завантаження...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      <div className="form-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#4f7ef8', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: '700', flexShrink: 0
            }}>
              {(user?.displayName || user?.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.displayName || user?.username}</h2>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>@{user?.username}</p>
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? 'Скасувати' : 'Редагувати'}
            </button>
            <button className="btn-danger" onClick={handleDeleteAccount}>Видалити акаунт</button>
          </div>
        </div>

        {editing ? (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <input placeholder="Відображуване ім'я"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <textarea placeholder="Про себе..." value={form.bio} rows={3}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ padding: '0.65rem 1rem', border: '1px solid #ddd',
                  borderRadius: '8px', fontSize: '0.95rem',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button className="btn-primary" onClick={handleSave}>Зберегти</button>
          </div>
        ) : (
          user?.bio && <p style={{ marginTop: '1rem', color: '#555', lineHeight: '1.6' }}>{user.bio}</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Курсів всього', value: stats.totalCourses, icon: '📚' },
          { label: 'Завершено', value: stats.completedCourses, icon: '✅' },
          { label: 'Нотаток', value: stats.totalNotes, icon: '📝' },
          { label: 'Матеріалів', value: stats.totalReading, icon: '📖' },
          { label: 'Прочитано', value: stats.finishedReading, icon: '🎯' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', cursor: 'default' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#4f7ef8' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Останні курси</h2>
          <button className="btn-secondary" onClick={() => navigate('/courses')} style={{ fontSize: '0.85rem' }}>
            Всі курси →
          </button>
        </div>
        {recentCourses.length === 0 ? (
          <p style={{ color: '#aaa' }}>Ще немає курсів.</p>
        ) : (
          <div className="cards-grid">
            {recentCourses.map(course => (
              <div key={course._id} className="card" onClick={() => navigate(`/courses/${course._id}`)}>
                <h3 style={{ fontSize: '1rem' }}>{course.courseName}</h3>
                <div className="card-meta" style={{ marginTop: '0.5rem' }}>
                  {course.completed
                    ? <span className="badge badge-green">Завершено</span>
                    : <span className="badge badge-yellow">В процесі</span>}
                </div>
                {course.modules > 0 && (
                  <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                    <div className="progress-fill" style={{
                      width: `${Math.round((course.modulesdone / course.modules) * 100)}%`
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Останні матеріали</h2>
          <button className="btn-secondary" onClick={() => navigate('/reading')} style={{ fontSize: '0.85rem' }}>
            Всі матеріали →
          </button>
        </div>
        {recentReading.length === 0 ? (
          <p style={{ color: '#aaa' }}>Ще немає матеріалів.</p>
        ) : (
          <div className="cards-grid">
            {recentReading.map(item => (
              <div key={item._id} className="card" style={{ cursor: 'default' }}>
                <h3 style={{ fontSize: '1rem' }}>{item.title}</h3>
                <div className="card-meta" style={{ marginTop: '0.5rem' }}>
                  {item.finished
                    ? <span className="badge badge-green">Прочитано</span>
                    : <span className="badge badge-gray">Не прочитано</span>}
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.8rem', color: '#4f7ef8', display: 'block', marginTop: '0.5rem' }}>
                    Відкрити
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
