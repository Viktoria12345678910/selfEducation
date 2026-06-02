import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="logo">SelfEducation</span>
      <div className="nav-links">
        <NavLink to="/courses">Курси</NavLink>
	  {user && (
		  <>
        		<NavLink to="/">Профіль</NavLink>
        		<NavLink to="/reading">Читання</NavLink>
		  	<NavLink to="/notes">Нотатки</NavLink>
        			<span style={{ color: '#aaa', fontSize: '0.9rem', padding: '5px' }}>
          				{user?.displayName || user?.username}
        			</span>
        			<button onClick={logout}>Вийти</button>
		  </>
	  )}
	  {!user && (
		  <>
		  	<NavLink to='/login'>Увійти</NavLink>
		  	<NavLink to='/register'>Зареєструватись</NavLink>
		  </>
	  )}
      </div>
    </nav>
  );
}
