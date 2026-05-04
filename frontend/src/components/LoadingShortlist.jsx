import PropTypes from 'prop-types'
import '../styles/LoadingShortlist.css'

const LoadingShortlist = ({ message }) => {
  return (
    <div className="loading-shortlist">
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message || 'Analyse en cours...'}</p>
      <p className="loading-subtitle">
        Nous analysons les candidats pour créer votre shortlist. Cela peut prendre quelques instants.
      </p>
    </div>
  )
}

LoadingShortlist.propTypes = {
  message: PropTypes.string,
}

export default LoadingShortlist
