import PropTypes from 'prop-types'
import '../styles/CandidateCard.css'

const CandidateCard = ({ candidate, rank }) => {
  const score = parseFloat(candidate.score) || 0
  const candidateName = candidate.candidate_name || candidate.name || 'Candidat inconnu'
  const cvLink = candidate.cv_link || null

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 75) return 'high'
    if (scoreValue >= 50) return 'medium'
    return 'low'
  }

  const scoreColor = getScoreColor(score)

  const handleViewCV = () => {
    if (cvLink) {
      window.open(cvLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="candidate-card">
      {rank && (
        <div className="candidate-rank-badge">
          <span className="rank-number">#{rank}</span>
        </div>
      )}

      <div className="candidate-header">
        <h4 className="candidate-name">{candidateName}</h4>
        <div className={`candidate-score score-${scoreColor}`}>
          {score.toFixed(1)}%
        </div>
      </div>

      <div className="score-bar-container">
        <div
          className={`score-bar score-bar-${scoreColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        >
          <span className="score-bar-label">
            {score >= 20 ? `${score.toFixed(0)}%` : ''}
          </span>
        </div>
      </div>

      {cvLink && (
        <button
          className="view-cv-button"
          onClick={handleViewCV}
          aria-label={`Voir le CV de ${candidateName}`}
        >
          <svg
            className="cv-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Voir CV
        </button>
      )}
    </div>
  )
}

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    candidate_name: PropTypes.string,
    name: PropTypes.string,
    score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cv_link: PropTypes.string,
  }).isRequired,
  rank: PropTypes.number,
}

export default CandidateCard
