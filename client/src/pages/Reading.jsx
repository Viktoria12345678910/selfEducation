import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TYPES = ['book', 'article', 'paper', 'other'];
const TYPE_LABELS = { book: '📖 Книга', article: '📰 Стаття', paper: '📄 Наукова праця', other: '🔖 Інше' };
const TYPE_BADGES = { book: 'badge-blue', article: 'badge-green', paper: 'badge-yellow', other: 'badge-gray' };

const EMPTY_FORM = { title: '', type: 'article', url: '', finished: false };

export default function Reading() {
  const { authFetch } = useAuth();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all | book | article | paper | other
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async (p = 1) => {
    setLoading(true);
    try {
      const query = filter !== 'all'
        ? `/api/reading?page=${p}&limit=6&type=${filter}`
        : `/api/reading?page=${p}&limit=6`;
      const res = await authFetch(query);
      const data = await res.json();
      setItems(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchItems(1);
  }, [filter]);

  useEffect(() => { fetchItems(page); }, [page]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await authFetch('/api/reading', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchItems(page);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити матеріал?')) return;
    await authFetch(`/api/reading/${id}`, { method: 'DELETE' });
    fetchItems(page);
  };

  const handleToggleFinished = async (item) => {
    await authFetch(`/api/reading/${item._id}`, {
      method: 'PUT',
      body: JSON.stringify({ finished: !item.finished })
    });
    fetchItems(page);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Читання <span style={{ color: '#aaa', fontSize: '1rem' }}>({total})</span></h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати матеріал'}
        </button>
      </div>

      {/* ФІЛЬТР */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0', flexWrap: 'wrap' }}>
        {['all', ...TYPES].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={filter === t ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            {t === 'all' ? '📚 Всі' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ФОРМА */}
      {showForm && (
        <div className="form-panel" style={{ marginBottom: '2rem' }}>
          <h3>Новий матеріал</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                name="title"
                placeholder="Назва *"
                value={form.title}
                onChange={handleChange}
                required
              />
              <select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <input
                name="url"
                placeholder="Посилання (необов'язково)"
                value={form.url}
                onChange={handleChange}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              <input
                type="checkbox"
                name="finished"
                checked={form.finished}
                onChange={handleChange}
              />
              Вже прочитано
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Зберегти</button>
              <button type="button" className="btn-secondary"
                onClick={() => setShowForm(false)}>Скасувати</button>
            </div>
          </form>
        </div>
      )}

      {/* СПИСОК */}
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p style={{ color: '#aaa' }}>Завантаження...</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#aaa' }}>Нічого немає. Додай перший матеріал!</p>
      ) : (
        <div className="cards-grid">
          {items.map(item => (
            <div key={item._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', flex: 1, marginRight: '1rem' }}>{item.title}</h3>
                <button className="btn-danger" onClick={() => handleDelete(item._id)}>✕</button>
              </div>

              <div className="card-meta" style={{ margin: '0.75rem 0' }}>
                <span className={`badge ${TYPE_BADGES[item.type]}`}>
                  {TYPE_LABELS[item.type]}
                </span>
                {item.finished
                  ? <span className="badge badge-green">✅ Прочитано</span>
                  : <span className="badge badge-gray">⏳ Не прочитано</span>}
              </div>

              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: '#4f7ef8', display: 'block', marginBottom: '0.75rem' }}>
                  🔗 Відкрити матеріал
                </a>
              )}

              <p style={{ fontSize: '0.75rem', color: '#bbb', marginBottom: '0.75rem' }}>
                Додано: {new Date(item.addedAt).toLocaleDateString('uk-UA')}
              </p>

              <button
                className={item.finished ? 'btn-secondary' : 'btn-primary'}
                style={{ width: '100%', fontSize: '0.85rem' }}
                onClick={() => handleToggleFinished(item)}>
                {item.finished ? '↩ Позначити як непрочитане' : '✅ Позначити як прочитане'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ПАГІНАЦІЯ */}
      {pages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i + 1} className={page === i + 1 ? 'active' : ''}
              onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>→</button>
        </div>
      )}
    </div>
  );
}
