import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CoursePage from './pages/CoursePage';
import Reading from './pages/Reading';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';

// Захищений роут
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />

      <main className="container">
        <Routes>
          {/* Головна */}
          <Route
            path="/"
            element={user ? <Profile /> : <Courses />}
          />

          {/* Публічні */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
	  <Route path="/notes" element= { <PrivateRoute> <Notes /> </PrivateRoute> } />

          {/* Захищені */}
          <Route
            path="/reading"
            element={
              <PrivateRoute>
                <Reading />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to="/courses" />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
