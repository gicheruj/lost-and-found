import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiMapPin, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <FiMapPin size={32} color="#4f46e5" />
          <h1>Lost & Found</h1>
          <p>Reuniting people with their belongings</p>
        </div>

        <div className="auth-form">
          <h2>Create Account</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-icon-wrap">
                <FiUser size={16} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-icon-wrap">
                <FiMail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-icon-wrap">
                <FiPhone size={16} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254 700 000 000"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="input-with-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

      <style>{`
        .input-icon-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          pointer-events: none;
        }
        .input-with-icon {
          padding-left: 38px !important;
        }
        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default Register