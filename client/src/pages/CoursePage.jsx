import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function CoursePage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', text: '', tags: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`);
      if (!res.ok) return navigate('/courses');
      setCourse(await res.json());
    } catch {
      setError('Помилка завантаження курсу');
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/${id}`);
      setNotes(await res.json());
    } catch {
      setError('Помилка завантаження нотаток');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchNotes();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await authFetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        courseId: id,
        title: form.title,
        text: form.text,
        // Zettelkasten: теги через кому → масив
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
    });
    if (res.ok) {
      setForm({ title: '', text: '', tags: '' });
      setShowForm(false);
      fetchNotes();
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Видалити нотатку?')) return;
    await authFetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    fetchNotes();
  };

  const handleToggleComplete = async () => {
    await authFetch(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !course.completed })
    });
    fetchCourse();
  };

  if (loading) return <p className="loading">Завантаження...</p>;
  if (!course) return null;

  const progress = course.modules > 0
    ? Math.round((course.modulesdone / course.modules) * 100)
    : 0;

  return (
    <div>
      {/* ХЕДЕР КУРСУ */}
      <div style={{ marginBottom: '0.5rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/courses')}
          style={{ marginBottom: '1rem' }}>
          ← Назад до курсів
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{course.courseName}</h1>
            {course.siteUrl && (
              <a href={course.siteUrl} target="_blank" rel="noreferrer"
                style={{ color: '#4f7ef8', fontSize: '0.9rem' }}>
                🔗 {course.siteUrl}
              </a>
            )}
          </div>
	  {user &&(
          <button
            className={course.completed ? 'btn-secondary' : 'btn-primary'}
            onClick={handleToggleComplete}>
            {course.completed ? '↩ Позначити як незавершений' : '✅ Позначити як завершений'}
          </button>
	  )}
        </div>
      </div>

      {/* ІНФО КАРТКА */}
{user && (
      <div className="form-panel" style={{ marginBottom: '2rem' }}>
        <div className="card-meta" style={{ marginBottom: '0.75rem' }}>
          {course.completed
            ? <span className="badge badge-green">✅ Завершено</span>
            : <span className="badge badge-yellow">⏳ В процесі</span>}
          {course.certificate &&
            <span className="badge badge-blue">🎓 Сертифікат</span>}
          {course.price === 0
            ? <span className="badge badge-gray">Безкоштовно</span>
            : <span className="badge badge-gray">💰 {course.price} грн</span>}
        </div>

        {course.modules > 0 && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Прогрес: {course.modulesdone}/{course.modules} модулів ({progress}%)
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </div>
)}

      {/* НОТАТКИ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📝 Нотатки <span style={{ color: '#aaa', fontSize: '1rem' }}>({notes.length})</span></h2>
	{user &&(
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати нотатку'}
        </button>
	)}
      </div>

      {/* ФОРМА НОТАТКИ — Zettelkasten стиль */}
      {showForm && (
        <div className="form-panel">
          <h3>Нова нотатка</h3>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
            💡 Zettelkasten: одна нотатка — одна ідея. Використовуй теги для зв'язків між нотатками.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <input
                placeholder="Заголовок нотатки *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <textarea
                placeholder="Текст нотатки..."
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
                required
                rows={5}
                style={{
                  padding: '0.65rem 1rem', border: '1px solid #ddd',
                  borderRadius: '8px', fontSize: '0.95rem',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                }}
              />
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <input
                placeholder="Теги через кому: js, async, promises"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Зберегти</button>
              <button type="button" className="btn-secondary"
                onClick={() => setShowForm(false)}>Скасувати</button>
            </div>
          </form>
        </div>
      )}

      {/* СПИСОК НОТАТОК */}
      {error && <p className="error">{error}</p>}
      {notes.length === 0 ? (
        <p style={{ color: '#aaa' }}>Ще немає нотаток до цього курсу.</p>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{note.title}</h3>
		  {user && (
                <button className="btn-danger" onClick={() => handleDelete(note._id)}>
                  Видалити
                </button>
		  )}
              </div>
              <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                {note.text}
              </p>
              {note.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {note.tags.map(tag => (
                    <span key={tag} className="badge badge-blue">#{tag}</span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '0.5rem' }}>
                {new Date(note.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
