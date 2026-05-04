import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import ChatMessage from './ChatMessage'
import UploadJobDescription from './UploadJobDescription'
import '../styles/ChatWidget.css'

const ChatWidget = ({ userId, jobDescriptionId = null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      type: 'text',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [currentJobDescriptionId, setCurrentJobDescriptionId] = useState(jobDescriptionId)
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const handleQuickAction = (action) => {
    if (action === 'shortlist') {
      setShowUpload(true)
      return
    }

    const quickMessages = {
      search: 'Trouver un candidat spécifique',
    }

    const message = quickMessages[action]
    if (message) {
      handleSendMessage(message)
    }
  }

  const handleUploadSuccess = async (jobDescId, fileName) => {
    setCurrentJobDescriptionId(jobDescId)
    setShowUpload(false)

    const successMessage = {
      sender: 'bot',
      text: `✅ Fiche "${fileName}" analysée avec succès ! Génération de la shortlist en cours...`,
      type: 'text',
    }

    setMessages((prev) => [...prev, successMessage])
    await loadShortlist(jobDescId, 0)
  }

  const startPollingShortlistStatus = (shortlistId, offset) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const checkStatus = async () => {
      try {
        const { data } = await api.get(`api/shortlists/${shortlistId}/status`)

        if (data.status === 'completed') {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          setLoading(false)

          setMessages((prev) => {
            const filtered = prev.filter(
              (msg) => msg.type !== 'processing' || msg.shortlist_id !== shortlistId
            )

            return [
              ...filtered,
              {
                sender: 'bot',
                text: 'Shortlist générée avec succès.',
                type: 'shortlist',
                data: data.results || [],
                pagination: {
                  offset: offset,
                  limit: 30,
                  total: data.results?.length || 0,
                  has_more: false,
                  next_offset: null,
                },
              },
            ]
          })
        } else if (data.status === 'failed') {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          setLoading(false)

          setMessages((prev) => {
            const filtered = prev.filter(
              (msg) => msg.type !== 'processing' || msg.shortlist_id !== shortlistId
            )

            return [
              ...filtered,
              {
                sender: 'bot',
                text: 'Erreur lors de la génération de la shortlist. Veuillez réessayer.',
                type: 'text',
              },
            ]
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    checkStatus()
    pollingIntervalRef.current = setInterval(checkStatus, 3000)
  }

  const loadShortlist = async (jobDescId, offset) => {
    setLoading(true)

    try {
      const { data } = await api.post('api/chat', {
        message: 'Créer une shortlist de candidats',
        user_id: userId,
        job_description_id: jobDescId,
        offset: offset,
      })

      if (data.type === 'processing' && data.shortlist_id) {
        const processingMessage = {
          sender: 'bot',
          text: data.message || 'Analyse en cours...',
          type: 'processing',
          shortlist_id: data.shortlist_id,
        }

        setMessages((prev) => [...prev, processingMessage])
        startPollingShortlistStatus(data.shortlist_id, offset)
      } else {
        const botMessage = {
          sender: 'bot',
          text: data.message || 'Shortlist créée',
          type: data.type || 'text',
          data: data.data || [],
          pagination: data.pagination || null,
        }

        setMessages((prev) => [...prev, botMessage])
        setLoading(false)
      }
    } catch (error) {
      const errorMessage = {
        sender: 'bot',
        text: error?.response?.data?.message || 'Erreur lors de la création de la shortlist.',
        type: 'text',
      }

      setMessages((prev) => [...prev, errorMessage])
      setLoading(false)
    }
  }

  const handleLoadMore = (nextOffset) => {
    if (currentJobDescriptionId) {
      loadShortlist(currentJobDescriptionId, nextOffset)
    }
  }

  const handleUploadCancel = () => {
    setShowUpload(false)
  }

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return

    const userMessage = {
      sender: 'user',
      text: messageText,
      type: 'text',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const { data } = await api.post('api/chat', {
        message: messageText,
        user_id: userId,
        job_description_id: currentJobDescriptionId,
      })

      const botMessage = {
        sender: 'bot',
        text: data.message || 'Réponse reçue',
        type: data.type || 'text',
        data: data.data || [],
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        sender: 'bot',
        text: error?.response?.data?.message || 'Désolé, une erreur est survenue. Veuillez réessayer.',
        type: 'text',
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-widget-container">
      {!isOpen && (
        <button
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>Assistant IA</h3>
            <button
              className="chat-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} onLoadMore={handleLoadMore} />
            ))}

            {showUpload && (
              <div className="chat-message bot-message">
                <div className="message-bubble upload-bubble">
                  <UploadJobDescription
                    userId={userId}
                    onUploadSuccess={handleUploadSuccess}
                    onCancel={handleUploadCancel}
                  />
                </div>
              </div>
            )}

            {loading && (
              <div className="chat-message bot-message">
                <div className="message-bubble loading-message">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="loading-text">Analyse en cours...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-actions">
              <button
                className="quick-action-button"
                onClick={() => handleQuickAction('search')}
              >
                🔍 Trouver un candidat spécifique
              </button>
              <button
                className="quick-action-button"
                onClick={() => handleQuickAction('shortlist')}
              >
                ⭐ Créer une shortlist de candidats
              </button>
            </div>
          )}

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Tapez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || showUpload}
            />
            <button
              className="chat-send-button"
              onClick={() => handleSendMessage()}
              disabled={loading || showUpload || !inputValue.trim()}
              aria-label="Envoyer le message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

ChatWidget.propTypes = {
  userId: PropTypes.number.isRequired,
  jobDescriptionId: PropTypes.number,
}

export default ChatWidget
