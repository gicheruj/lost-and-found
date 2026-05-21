import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMapPin, FiMenu, FiX, FiUser, FiLogOut, FiPlusCircle } from 'react-icons/fi'

function Navbar({ onPostClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <FiMapPin />
          <span>Lost<span className="logo-accent">&</span>Found</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Browse Items
          </Link>

          {token ? (
            <>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <FiUser size={15} /> Profile
              </Link>
              <button className="nav-post-btn" onClick={() => {
                onPostClick?.()
                setMenuOpen(false)
              }}>
                <FiPlusCircle size={15} /> Post Item
              </button>
              <button className="nav-logout-btn" onClick={handleLogout}>
                <FiLogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="nav-register-btn"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
          height: 70px;
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 800;
          color: var(--primary);
        }
        .logo-accent {
          color: var(--secondary);
          margin: 0 2px;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          background: var(--primary-light);
          color: var(--primary);
        }
        .nav-post-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: var(--primary);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .nav-post-btn:hover {
          background: var(--primary-dark);
        }
        .nav-logout-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          background: transparent;
          color: var(--gray-500);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-logout-btn:hover {
          background: #fee2e2;
          color: var(--danger);
        }
        .nav-register-btn {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: var(--primary);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .nav-register-btn:hover {
          background: var(--primary-dark);
        }
        .navbar-toggle {
          display: none;
          background: none;
          color: var(--gray-700);
          padding: 6px;
        }
        @media (max-width: 768px) {
          .navbar-toggle { display: flex; }
          .navbar-links {
            display: none;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--white);
            flex-direction: column;
            padding: 16px;
            border-bottom: 1px solid var(--gray-200);
            box-shadow: var(--shadow-md);
            gap: 8px;
          }
          .navbar-links.open { display: flex; }
          .nav-link, .nav-post-btn, .nav-logout-btn, .nav-register-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar