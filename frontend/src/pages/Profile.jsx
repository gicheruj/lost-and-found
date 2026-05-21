import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiUser, FiMail, FiPhone, FiLogOut, FiPackage } from 'react-icons/fi'
import ItemCard from '../components/ItemCard'

function Profile() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchMyItems()
  }, [])

  const fetchMyItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/items/my-items', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(res.data.items || [])
    } catch (err) {
      setError('Failed to load your items.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(items.filter(item => item._id !== itemId))
    } catch (err) {
      alert('Failed to delete item.')
    }
  }

  const lostItems = items.filter(i => i.item_type === 'lost')
  const foundItems = items.filter(i => i.item_type === 'found')
  const resolvedItems = items.filter(i => i.status === 'Claimed' || i.status === 'Matched')

  if (loading) {
    return <div className="loading">Loading your profile...</div>
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <p><FiMail size={14} /> {user?.email}</p>
          {user?.phone && <p><FiPhone size={14} /> {user?.phone}</p>}
        </div>
        <button className="profile-logout-btn" onClick={handleLogout}>
          <FiLogOut size={16} /> Logout
        </button>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-number">{items.length}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{lostItems.length}</div>
          <div className="stat-label">Lost Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{foundItems.length}</div>
          <div className="stat-label">Found Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{resolvedItems.length}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="error-msg">{error}</div>}

      {/* My Posts */}
      <div className="profile-posts">
        <h2><FiPackage size={20} /> My Posts</h2>

        {items.length === 0 ? (
          <div className="empty-profile">
            <FiPackage size={48} />
            <h3>No posts yet</h3>
            <p>You haven't posted any lost or found items yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Browse Items
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item._id} className="profile-item-wrap">
                <ItemCard item={item} />
                <div className="profile-item-actions">
                  <select
                    className="status-select"
                    value={item.status}
                    onChange={async (e) => {
                      try {
                        const token = localStorage.getItem('token')
                        await axios.patch(
                          `http://localhost:5000/api/items/${item._id}/status`,
                          { status: e.target.value },
                          { headers: { Authorization: `Bearer ${token}` } }
                        )
                        setItems(items.map(i =>
                          i._id === item._id ? { ...i, status: e.target.value } : i
                        ))
                      } catch {
                        alert('Failed to update status.')
                      }
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="Matched">Matched</option>
                    <option value="Claimed">Claimed</option>
                  </select>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .profile-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: rgba(255,255,255,0.2);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          margin-left: auto;
          transition: all 0.2s;
        }
        .profile-logout-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .empty-profile {
          text-align: center;
          padding: 60px 20px;
          color: var(--gray-400);
          background: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
        }
        .empty-profile svg {
          margin-bottom: 16px;
        }
        .empty-profile h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-500);
          margin-bottom: 8px;
        }
        .empty-profile p {
          font-size: 14px;
          margin-bottom: 24px;
        }
        .profile-item-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .profile-item-actions {
          display: flex;
          gap: 8px;
        }
        .status-select {
          flex: 1;
          padding: 8px 12px;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
          background: var(--white);
          cursor: pointer;
        }
        .status-select:focus {
          border-color: var(--primary);
          outline: none;
        }
        .delete-btn {
          padding: 8px 16px;
          background: #fee2e2;
          color: var(--danger);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          background: var(--danger);
          color: var(--white);
        }
        @media (max-width: 768px) {
          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .profile-header {
            flex-wrap: wrap;
          }
          .profile-logout-btn {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile