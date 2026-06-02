import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Notes() {
  const { authFetch } = useAuth();

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    courseId: ''
  });

  useEffect(() => {
    fetchNotes();
    fetchCourses();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await authFetch('/api/notes');
      const data = await res.json();

      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await authFetch('/api/courses');
      const data = await res.json();

      setCourses(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await authFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      const newNote = await res.json();

      setNotes(prev => [newNote, ...prev]);

      setForm({
        title: '',
        content: '',
        courseId: ''
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>Мої нотатки</h1>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Закрити' : '+ Додати нотатку'}
        </button>
      </div>

      {showForm && (
        <form className="note-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Назва"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="content"
            placeholder="Текст нотатки"
            value={form.content}
            onChange={handleChange}
            required
          />

          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
          >
            <option value="">Без курсу</option>

            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-secondary">
              Зберегти
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
	      className="btn-secondary"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      <div className="notes-grid">
        {notes.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>

            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
