import PropTypes from 'prop-types'
import CandidateCard from './CandidateCard'
import LoadingShortlist from './LoadingShortlist'

const ChatMessage = ({ message, onLoadMore }) => {
  const isUser = message.sender === 'user'

  const renderContent = () => {
    if (message.type === 'text') {
      return <p className="message-text">{message.text}</p>
    }

    if (message.type === 'processing') {
      return <LoadingShortlist message={message.text} />
    }

    if (message.type === 'search' && message.data?.length > 0) {
      return (
        <div className="message-results">
          <p className="message-text">{message.text}</p>
          <div className="candidates-list">
            {message.data.map((candidate, index) => (
              <CandidateCard key={index} candidate={candidate} />
            ))}
          </div>
        </div>
      )
    }

    if (message.type === 'shortlist' && message.data?.length > 0) {
      return (
        <div className="message-results">
          <p className="message-text">{message.text}</p>
          <div className="shortlist-container">
            <h4 className="shortlist-title">Top Candidats</h4>
            <div className="candidates-list">
              {message.data.map((candidate, index) => (
                <CandidateCard
                  key={index}
                  candidate={candidate}
                  rank={index + 1}
                />
              ))}
            </div>
            {message.pagination?.has_more && onLoadMore && (
              <button
                className="load-more-button"
                onClick={() => onLoadMore(message.pagination.next_offset)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                  expand_more
                </span>
                Voir les 30 candidats suivants
              </button>
            )}
          </div>
        </div>
      )
    }

    return <p className="message-text">{message.text}</p>
  }

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-bubble">
        {renderContent()}
      </div>
    </div>
  )
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.oneOf(['user', 'bot']).isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'search', 'shortlist', 'processing']),
    data: PropTypes.array,
    pagination: PropTypes.shape({
      offset: PropTypes.number,
      limit: PropTypes.number,
      total: PropTypes.number,
      has_more: PropTypes.bool,
      next_offset: PropTypes.number,
    }),
    shortlist_id: PropTypes.number,
  }).isRequired,
  onLoadMore: PropTypes.func,
}

export default ChatMessage
