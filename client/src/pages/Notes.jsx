/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Notes() {
  const { authFetch } = useAuth();

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    text: '',
    courseId: null
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

    const payload = {...form, courseId: form.courseId || null};
    try {
      const res = await authFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const newNote = await res.json();

      setNotes(prev => [newNote, ...prev]);

      setForm({
        title: '',
        text: '',
        courseId: null
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

	  const filteredNotes = notes.filter(note =>
  note.title?.toLowerCase().includes(search.toLowerCase()) ||
  note.text?.toLowerCase().includes(search.toLowerCase()) ||
  note.tags?.join(' ').toLowerCase().includes(search.toLowerCase())
);
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
            name="text"
            placeholder="Текст нотатки"
            value={form.text}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="tags"
            placeholder="Теги"
            value={form.tags}
            onChange={handleChange}
          />
          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
          >
            <option value="">Без курсу</option>

            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseName}
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

	  <input
	  	type="text"
	  	placeholder="Пошук нотаток..."
	  	value={search}
	  	onChange={e => setSearch(e.target.value)}
	  	className="search-input"
	  />
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>

            <p>{note.text}</p>
	    <p>{note.tags}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
