import { FiMapPin, FiClock, FiUser, FiPhone, FiTag } from 'react-icons/fi'

const styles = `
  .item-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
    transition: all 0.25s ease;
    border: 1px solid var(--gray-100);
    display: flex;
    flex-direction: column;
  }
  .item-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .item-card-image {
    width: 100%;
    height: 180px;
    overflow: hidden;
  }
  .item-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  .item-card:hover .item-card-image img {
    transform: scale(1.05);
  }
  .item-card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .item-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .item-category-icon {
    font-size: 28px;
  }
  .item-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .item-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--gray-800);
    line-height: 1.3;
  }
  .item-description {
    font-size: 13px;
    color: var(--gray-500);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .item-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .item-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--gray-500);
  }
  .item-meta-row svg {
    flex-shrink: 0;
    color: var(--gray-400);
  }
  .item-category {
    text-transform: capitalize;
  }
  .item-card-footer {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 4px;
  }
  .contact-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    flex: 1;
    justify-content: center;
  }
  .contact-btn:hover {
    background: var(--primary);
    color: var(--white);
  }
  .match-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    background: #fef9c3;
    color: #ca8a04;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  }
  .match-btn:hover {
    background: #fef08a;
  }
`

function ItemCard({ item, onMatchClick }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      phone: '📱',
      wallet: '👛',
      keys: '🔑',
      id: '🪪',
      bag: '🎒',
      laptop: '💻',
      jewelry: '💍',
      clothing: '👕',
      other: '📦'
    }
    return emojis[category?.toLowerCase()] || '📦'
  }

  return (
    <div className="item-card">
      <style>{styles}</style>

      {item.image_url && (
        <div className="item-card-image">
          <img src={item.image_url} alt={item.title} />
        </div>
      )}

      <div className="item-card-body">
        <div className="item-card-header">
          <div className="item-category-icon">
            {getCategoryEmoji(item.category)}
          </div>
          <div className="item-badges">
            <span className={`badge badge-${item.item_type}`}>
              {item.item_type === 'lost' ? '🔴 Lost' : '🟢 Found'}
            </span>
            <span className={`badge badge-${item.status?.toLowerCase()}`}>
              {item.status}
            </span>
          </div>
        </div>

        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">{item.description}</p>

        <div className="item-meta">
          <div className="item-meta-row">
            <FiMapPin size={13} />
            <span>{item.location}</span>
          </div>
          <div className="item-meta-row">
            <FiClock size={13} />
            <span>{formatDate(item.date_time)}</span>
          </div>
          <div className="item-meta-row">
            <FiTag size={13} />
            <span className="item-category">{item.category}</span>
          </div>
          <div className="item-meta-row">
            <FiUser size={13} />
            <span>{item.posted_by_name || 'Anonymous'}</span>
          </div>
        </div>

        <div className="item-card-footer">
          <a href={`tel:${item.contact}`} className="contact-btn">
            <FiPhone size={13} />
            Contact
          </a>
          {item.matches && item.matches.length > 0 && (
            <button
              className="match-btn"
              onClick={() => onMatchClick?.(item)}
            >
              🔗 {item.matches.length} Match{item.matches.length > 1 ? 'es' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemCard