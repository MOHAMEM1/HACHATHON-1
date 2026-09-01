import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const smartSuggestions = [
  'Launch a skincare campaign targeting women 25-40 in Morocco with 5000 MAD budget',
  'Create a TikTok ad for a new sneaker brand targeting Gen Z in Casablanca',
  'Build a Facebook campaign for a restaurant launch in Rabat, budget 3000 MAD',
  'Promote an e-learning platform for university students in Morocco',
];

export default function PromptBar({ onSubmit, isProcessing, agentMessages }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentMessages]);

  const handleSubmit = (text) => {
    const val = text || input;
    if (!val.trim() || isProcessing) return;
    setShowSuggestions(false);
    setInput('');
    onSubmit(val.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="prompt-section">
      {/* Agent Message Feed */}
      {agentMessages.length > 0 && (
        <div className="agent-messages">
          <AnimatePresence>
            {agentMessages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`agent-msg agent-msg-${msg.role}`}
              >
                {msg.role === 'user' && (
                  <div className="agent-msg-avatar user-avatar-sm">M</div>
                )}
                {msg.role === 'agent' && (
                  <div className="agent-msg-avatar agent-avatar-sm">
                    <Sparkles size={14} />
                  </div>
                )}
                <div className="agent-msg-content">
                  <span className="agent-msg-name">
                    {msg.role === 'user' ? 'You' : 'AgentCampaign AI'}
                  </span>
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Smart Suggestions */}
      {showSuggestions && agentMessages.length === 0 && (
        <div className="prompt-suggestions">
          <span className="prompt-suggestions-label">
            <Sparkles size={14} /> Try asking the agent:
          </span>
          <div className="prompt-suggestions-grid">
            {smartSuggestions.map((s, i) => (
              <button
                key={i}
                className="prompt-suggestion-chip"
                onClick={() => handleSubmit(s)}
              >
                <span>{s}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className={`prompt-input-wrapper ${isProcessing ? 'processing' : ''}`}>
        <div className="prompt-input-inner">
          <Sparkles size={18} className="prompt-input-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder={isProcessing ? 'Agent is working...' : 'Tell the agent what campaign to build...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="prompt-input"
          />
          <button
            className="prompt-send-btn"
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isProcessing}
          >
            {isProcessing ? (
              <div className="prompt-spinner" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {isProcessing && (
          <div className="prompt-processing-bar">
            <motion.div
              className="prompt-processing-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 18, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
