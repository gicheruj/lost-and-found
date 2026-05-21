import { FiX, FiAlertCircle } from 'react-icons/fi'

function MatchSuggestion({ item, matches, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="match-modal">
        <div className="match-modal-header">
          <div>
            <h2>Possible Matches</h2>
            <p>These items may be related to <strong>{item?.title}</strong></p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="match-modal-body">
          {matches && matches.length > 0 ? (
            <div className="match-list">
              {matches.map((match, index) => (
                <div key={index} className="match-item">
                  <div className="match-score">
                    <span>{Math.round(match.score * 100)}%</span>
                    <small>match</small>
                  </div>
                  <div className="match-info">
                    <div className="match-item-header">
                      <h4>{match.title}</h4>
                      <span className={`badge badge-${match.item_type}`}>
                        {match.item_type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                      </span>
                    </div>
                    <p className="match-description">{match.description}</p>
                    <div className="match-meta">
                      <span>📍 {match.location}</span>
                      <span>📞 {match.contact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-matches">
              <FiAlertCircle size={40} />
              <h3>No matches found</h3>
              <p>No similar items have been posted yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .match-modal {
          background: var(--white);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 560px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .match-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid var(--gray-100);
          position: sticky;
          top: 0;
          background: var(--white);
          z-index: 1;
        }
        .match-modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 4px;
        }
        .match-modal-header p {
          font-size: 13px;
          color: var(--gray-500);
        }
        .match-modal-body {
          padding: 24px 28px;
        }
        .match-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .match-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          transition: all 0.2s;
        }
        .match-item:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow);
        }
        .match-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          background: var(--primary-light);
          border-radius: var(--radius-sm);
          padding: 10px;
        }
        .match-score span {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }
        .match-score small {
          font-size: 11px;
          color: var(--primary);
          font-weight: 500;
        }
        .match-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .match-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .match-item-header h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--gray-800);
        }
        .match-description {
          font-size: 13px;
          color: var(--gray-500);
          line-height: 1.4;
        }
        .match-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--gray-400);
        }
        .no-matches {
          text-align: center;
          padding: 48px 20px;
          color: var(--gray-400);
        }
        .no-matches svg {
          margin-bottom: 16px;
        }
        .no-matches h3 {
          font-size: 17px;
          font-weight: 600;
          color: var(--gray-500);
          margin-bottom: 8px;
        }
        .no-matches p {
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

export default MatchSuggestion