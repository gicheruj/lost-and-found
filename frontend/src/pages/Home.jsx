import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiSearch, FiPlusCircle, FiFilter } from 'react-icons/fi'
import ItemCard from '../components/ItemCard'
import PostModal from '../components/PostModal'
import MatchSuggestion from '../components/MatchSuggestion'

function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchItems()
  }, [filterType, filterCategory, filterStatus])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType !== 'all') params.item_type = filterType
      if (filterCategory !== 'all') params.category = filterCategory
      if (filterStatus !== 'all') params.status = filterStatus
      if (search) params.search = search

      const res = await axios.get('http://localhost:5000/api/items', { params })
      setItems(res.data.items || [])
    } catch (err) {
      setError('Failed to load items.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  const handleMatchClick = (item) => {
    setSelectedMatch(item)
  }

  const filteredItems = items.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="home-hero">
        <h1>Lost Something? Found Something?</h1>
        <p>Connect with your community to reunite lost items with their owners.</p>
        <div className="hero-buttons">
          {token ? (
            <button
              className="hero-btn-primary"
              onClick={() => setShowPostModal(true)}
            >
              <FiPlusCircle size={18} /> Post an Item
            </button>
          ) : (
            <a href="/register" className="hero-btn-primary">
              Get Started
            </a>
          )}
          <a href="#items" className="hero-btn-outline">
            Browse Items
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-inner">
          <form onSubmit={handleSearch} className="search-input-wrap">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Search items, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="phone">Phone</option>
            <option value="wallet">Wallet</option>
            <option value="keys">Keys</option>
            <option value="id">ID</option>
            <option value="bag">Bag</option>
            <option value="laptop">Laptop</option>
            <option value="jewelry">Jewelry</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Matched">Matched</option>
            <option value="Claimed">Claimed</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={fetchItems}
          >
            <FiFilter size={15} /> Filter
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="items-section" id="items">
        <div className="items-header">
          <h2>
            {filterType === 'all' ? 'All Items' :
             filterType === 'lost' ? 'Lost Items' : 'Found Items'}
          </h2>
          <span className="items-count">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="items-grid">
            <div className="empty-state">
              <FiSearch size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your filters or be the first to post!</p>
              {token && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => setShowPostModal(true)}
                >
                  <FiPlusCircle size={15} /> Post an Item
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                onMatchClick={handleMatchClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            fetchItems()
            setShowPostModal(false)
          }}
        />
      )}

      {/* Match Modal */}
      {selectedMatch && (
        <MatchSuggestion
          item={selectedMatch}
          matches={selectedMatch.matches || []}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

export default Home