import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  courseName: '', siteUrl: '', completed: false,
  certificate: false, modules: '', modulesdone: '', price: ''
};

export default function Courses() {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchCourses = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/courses?page=${p}&limit=6`);
      const data = await res.json();
      setCourses(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(page); }, [page]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await authFetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchCourses(page);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // щоб не відкривався курс при видаленні
    if (!window.confirm('Видалити курс?')) return;
    await authFetch(`/api/courses/${id}`, { method: 'DELETE' });
    fetchCourses(page);
  };

  const progress = (done, total) =>
    total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Kурси <span style={{ color: '#aaa', fontSize: '1rem' }}>({total})</span></h1>
	  {user && (
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати курс'}
        </button>
	  )}
      </div>

      {/* ФОРМА ДОДАВАННЯ */}
      	{showForm && (
        	<div className="form-panel" style={{ marginTop: '1.5rem' }}>
          		<h3>Новий курс</h3>
          		<form onSubmit={handleSubmit}>
            			<div className="form-row">
              				<input name="courseName" placeholder="Назва курсу *" value={form.courseName} onChange={handleChange} required />
              				<input name="siteUrl" placeholder="Посилання на курс" value={form.siteUrl} onChange={handleChange} />
            			</div>
            			<div className="form-row">
              				<input name="modules" type="number" placeholder="Кількість модулів" value={form.modules} onChange={handleChange} min="0" />
              				<input name="modulesdone" type="number" placeholder="Пройдено модулів" value={form.modulesdone} onChange={handleChange} min="0" />
            			</div>
            			<div className="form-row">
              				<input name="price" type="number" placeholder="Ціна (0 = безкоштовно)" value={form.price} onChange={handleChange} min="0" />
            			</div>
            			<div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0' }}>
              				<label>
                				<input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} />
                				{' '}Завершено
              				</label>
              				<label>
                				<input type="checkbox" name="certificate" checked={form.certificate} onChange={handleChange} />
                				{' '}Є сертифікат
              				</label>
            			</div>

            			<div className="form-actions">
              				<button type="submit" className="btn-primary">Зберегти</button>
              				<button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Скасувати</button>
            			</div>
          		</form>
        	</div>
      	)}
	

      {/* СПИСОК КУРСІВ */}
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p style={{ marginTop: '2rem', color: '#aaa' }}>Завантаження...</p>
      ) : courses.length === 0 ? (
        <p style={{ marginTop: '2rem', color: '#aaa' }}>Ще немає курсів. Додай перший!</p>
      ) : (
        <div className="cards-grid">
	{courses.map(course => (
  	<div
    		key={course._id}
    		className="course-card"
    		onClick={() => {
      			if (user) {
        	navigate(`/courses/${course._id}`);
      		} else {
        		setShowAuthModal(true);
      		}
    		}}
  	>
    <h3>{course.courseName}</h3>
              <div className="card-meta">
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
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Модулі: {course.modulesdone}/{course.modules}
                  </p>
                  <div className="progress-bar">
                    <div className="progress-fill"
                      style={{ width: `${progress(course.modulesdone, course.modules)}%` }} />
                  </div>
                </>
              )}

              {course.siteUrl && (
                <a href={course.siteUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: '#4f7ef8', display: 'block', marginTop: '0.75rem' }}
                  onClick={e => e.stopPropagation()}>
                  🔗 Перейти на курс
                </a>
              )}

		  {user && (
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button className="btn-danger"
                  onClick={e => handleDelete(e, course._id)}>
                  Видалити
                </button>
              </div>
		  )}
            </div>
          ))}
        </div>
      )}

	  {showAuthModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowAuthModal(false)}
  >
    <div
      className="auth-modal"
      onClick={e => e.stopPropagation()}
    >
      <h2>Потрібна авторизація</h2>

      <p>
        Щоб переглядати деталі курсу,
        увійдіть або створіть акаунт.
      </p>

      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={() => navigate('/login')}
        >
          Увійти
        </button>

        <button
          className="btn-secondary"
          onClick={() => navigate('/register')}
        >
          Реєстрація
        </button>
      </div>

      <button
        className="modal-close"
        onClick={() => setShowAuthModal(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}

      {/* ПАГІНАЦІЯ */}
      {pages > 1 && (
        <div className="pagination">
          <button className="btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i + 1} className={`btn-secondary ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button className="btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page === pages}>→</button>
        </div>
      )}
    </div>
  );
}
