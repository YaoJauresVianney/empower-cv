import { useState } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import '../styles/UploadJobDescription.css'

const UploadJobDescription = ({ userId, onUploadSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    
    if (!file) {
      setSelectedFile(null)
      setError('')
      return
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const validExtensions = ['.pdf', '.doc', '.docx']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Format de fichier invalide. Veuillez sélectionner un fichier PDF, DOC ou DOCX.')
      setSelectedFile(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Taille maximale : 10 MB.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('user_id', userId)

      const { data } = await api.post('api/job-descriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data?.id) {
        onUploadSuccess(data.id, selectedFile.name)
      } else {
        setError('Réponse invalide du serveur.')
      }
    } catch (uploadError) {
      const errorMessage =
        uploadError?.response?.data?.message ||
        uploadError?.response?.data?.error ||
        'Erreur lors de l\'upload du fichier. Veuillez réessayer.'
      
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-job-description">
      <div className="upload-header">
        <h3>📄 Uploader une fiche de poste</h3>
        <p className="upload-subtitle">
          Formats acceptés : PDF, DOC, DOCX (max 10 MB)
        </p>
      </div>

      <div className="upload-body">
        <label htmlFor="file-input" className="file-input-label">
          {selectedFile ? (
            <div className="file-selected">
              <span className="file-icon">📎</span>
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          ) : (
            <div className="file-placeholder">
              <span className="upload-icon">⬆️</span>
              <span>Cliquez pour sélectionner un fichier</span>
            </div>
          )}
        </label>

        <input
          id="file-input"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input-hidden"
        />

        {error && (
          <div className="upload-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-spinner"></div>
            <span>Analyse en cours...</span>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button
          className="upload-button cancel-button"
          onClick={onCancel}
          disabled={uploading}
        >
          Annuler
        </button>
        <button
          className="upload-button submit-button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Upload en cours...' : 'Analyser'}
        </button>
      </div>
    </div>
  )
}

UploadJobDescription.propTypes = {
  userId: PropTypes.number.isRequired,
  onUploadSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default UploadJobDescription
