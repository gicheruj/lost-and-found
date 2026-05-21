import { useState } from 'react'
import axios from 'axios'
import { FiX, FiUpload, FiMapPin, FiPhone, FiAlignLeft, FiTag, FiCalendar } from 'react-icons/fi'

const CATEGORIES = ['Phone', 'Wallet', 'Keys', 'ID', 'Bag', 'Laptop', 'Jewelry', 'Clothing', 'Other']

function PostModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    item_type: 'lost',
    description: '',
    location: '',
    date_time: '',
    contact: '',
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title || !form.category || !form.description || !form.location || !form.date_time || !form.contact) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => formData.append(key, val))
      if (image) formData.append('image', image)

      await axios.post('http://localhost:5000/api/items', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2>Post an Item</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Item Type Toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${form.item_type === 'lost' ? 'active-lost' : ''}`}
                onClick={() => setForm({ ...form, item_type: 'lost' })}
              >
                🔴 I Lost Something
              </button>
              <button
                type="button"
                className={`type-btn ${form.item_type === 'found' ? 'active-found' : ''}`}
                onClick={() => setForm({ ...form, item_type: 'found' })}
              >
                🟢 I Found Something
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Item Name *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Black iPhone 14, Blue Wallet"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label><FiTag size={13} /> Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label><FiAlignLeft size={13} /> Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item in detail — color, brand, any unique features..."
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label><FiMapPin size={13} /> Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Where was it lost/found?"
              />
            </div>

            {/* Date & Time */}
            <div className="form-group">
              <label><FiCalendar size={13} /> Date & Time *</label>
              <input
                type="datetime-local"
                name="date_time"
                value={form.date_time}
                onChange={handleChange}
              />
            </div>

            {/* Contact */}
            <div className="form-group">
              <label><FiPhone size={13} /> Contact Info *</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Phone number or email"
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label><FiUpload size={13} /> Image (optional)</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => { setImage(null); setImagePreview(null) }}
                    >
                      <FiX size={16} /> Remove
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder" htmlFor="image-input">
                    <FiUpload size={24} />
                    <span>Click to upload image</span>
                    <span className="upload-hint">PNG, JPG up to 5MB</span>
                  </label>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Posting...' : '🚀 Post Item'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 0;
          position: sticky;
          top: 0;
          background: var(--white);
          z-index: 1;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--gray-100);
        }
        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-800);
        }
        .modal-close {
          background: var(--gray-100);
          color: var(--gray-600);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: var(--gray-200);
          color: var(--gray-800);
        }
        .modal-body {
          padding: 24px 28px 28px;
        }
        .type-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .type-btn {
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--gray-200);
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-500);
          transition: all 0.2s;
          background: var(--white);
        }
        .type-btn.active-lost {
          border-color: #dc2626;
          background: #fee2e2;
          color: #dc2626;
        }
        .type-btn.active-found {
          border-color: #16a34a;
          background: #dcfce7;
          color: #16a34a;
        }
        .image-upload-area {
          border: 2px dashed var(--gray-200);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .image-upload-area:hover {
          border-color: var(--primary);
        }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          cursor: pointer;
          color: var(--gray-400);
        }
        .upload-placeholder:hover {
          color: var(--primary);
        }
        .upload-hint {
          font-size: 12px;
          color: var(--gray-300);
        }
        .image-preview {
          position: relative;
        }
        .image-preview img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }
        .remove-image {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.6);
          color: white;
          border-radius: var(--radius-sm);
          padding: 5px 10px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 700;
          margin-top: 8px;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default PostModal