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
      text: `Fiche "${fileName}" analysée avec succès. Génération de la shortlist en cours...`,
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
    <div className="fixed bottom-5 right-5 z-[60]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {!isOpen && (
        <button
          type="button"
          className="relative w-14 h-14 rounded-full bg-primary text-on-primary grid place-items-center
            shadow-[0_8px_28px_rgba(79,0,103,0.42)] transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(79,0,103,0.55)] active:scale-95
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir l'assistant"
        >
          <span
            className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping motion-reduce:hidden"
            aria-hidden="true"
          />
          <span className="material-symbols-outlined relative text-[26px]" aria-hidden="true">forum</span>
        </button>
      )}

      {isOpen && (
        <div
          className="chat-panel-anim flex flex-col w-[min(380px,calc(100vw-2rem))] h-[600px] max-h-[calc(100dvh-2.5rem)]
            bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant
            shadow-[0_24px_60px_-18px_rgba(79,0,103,0.4)]"
          role="dialog"
          aria-label="Assistant IA"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary">
            <span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">auto_awesome</span>
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold leading-tight tracking-tight">Assistant IA</h3>
              <p className="flex items-center gap-1.5 mt-0.5 text-[11px] leading-tight text-on-primary/70">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-70 animate-ping motion-reduce:hidden" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
                En ligne
              </p>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-lg grid place-items-center text-on-primary/80 hover:bg-white/15 active:scale-95 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer l'assistant"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-background custom-scrollbar">
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

          {/* Suggestions (empty state) */}
          {messages.length === 1 && (
            <div className="flex flex-col gap-2 px-4 pt-1 pb-3 bg-background">
              <p className="px-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">
                Suggestions
              </p>
              <button
                type="button"
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left
                  bg-surface-container-lowest border border-outline-variant text-[13px] font-semibold text-on-surface
                  transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(79,0,103,0.1)] active:scale-[0.98]"
                onClick={() => handleQuickAction('search')}
              >
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-primary-fixed text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person_search</span>
                </span>
                <span className="flex-1">Trouver un candidat spécifique</span>
                <span className="material-symbols-outlined text-[18px] text-text-muted group-hover:text-primary transition-colors" aria-hidden="true">
                  chevron_right
                </span>
              </button>
              <button
                type="button"
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left
                  bg-surface-container-lowest border border-outline-variant text-[13px] font-semibold text-on-surface
                  transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(79,0,103,0.1)] active:scale-[0.98]"
                onClick={() => handleQuickAction('shortlist')}
              >
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-primary-fixed text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">workspace_premium</span>
                </span>
                <span className="flex-1">Créer une shortlist de candidats</span>
                <span className="material-symbols-outlined text-[18px] text-text-muted group-hover:text-primary transition-colors" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-surface-container-lowest border-t border-outline-variant">
            <input
              type="text"
              className="flex-1 min-w-0 px-4 py-2.5 rounded-full text-[14px] text-on-surface bg-background
                border border-outline-variant outline-none transition-all duration-150 placeholder:text-text-muted
                focus:border-primary/50 focus:ring-2 focus:ring-primary-fixed-dim/40
                disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Tapez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || showUpload}
            />
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-primary text-on-primary grid place-items-center shrink-0
                transition-all duration-200 hover:shadow-[0_4px_16px_rgba(79,0,103,0.4)] active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
              onClick={() => handleSendMessage()}
              disabled={loading || showUpload || !inputValue.trim()}
              aria-label="Envoyer le message"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_upward</span>
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
