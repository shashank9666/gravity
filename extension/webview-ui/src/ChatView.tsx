import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  sender: 'user' | 'agent' | 'error';
  text: string;
};

import { vscode } from './vscodeApi';

interface ChatViewProps {
  onOpenSettings?: () => void;
}

export const ChatView = ({ onOpenSettings }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'agent', text: 'Hello! I am your Gravity agent. How can I help you?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'agentResponse' && message.new) {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'agent', text: message.text }]);
      } else if (message.type === 'agentResponseChunk') {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.sender === 'agent') {
            lastMsg.text += message.text;
          }
          return newMsgs;
        });
      } else if (message.type === 'agentError') {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'error', text: message.text }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: inputValue }]);
    
    if (vscode) {
      vscode.postMessage({
        type: 'sendMessage',
        text: inputValue
      });
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'agent', text: 'Echo: ' + inputValue }]);
      }, 500);
    }
    
    setInputValue('');
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-header-title">GRAVITY: CHAT</div>
        <div className="chat-header-actions">
          <button className="icon-btn" title="New Chat">＋</button>
          <button className="icon-btn" title="History">🕒</button>
          <button className="icon-btn" title="Settings" onClick={onOpenSettings}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14.4 9.1v-.2l-1.3-.3c-.1-.4-.3-.8-.5-1.2l.8-1-.1-.1-1.3-1.3-.1-.1-1 .8c-.4-.2-.8-.4-1.2-.5l-.3-1.3h-.2h-1.8h-.2l-.3 1.3c-.4.1-.8.3-1.2.5l-1-.8-.1.1-1.3 1.3-.1.1.8 1c-.2.4-.4.8-.5 1.2l-1.3.3v.2v1.8v.2l1.3.3c.1.4.3.8.5 1.2l-.8 1 .1.1 1.3 1.3.1.1 1-.8c.4.2.8.4 1.2.5l.3 1.3h.2h1.8h.2l.3-1.3c.4-.1.8-.3 1.2-.5l1 .8.1-.1 1.3-1.3.1-.1-.8-1c.2-.4.4-.8.5-1.2l1.3-.3v-.2V9.1zM8 10.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" title="More Actions" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>Customization</div>
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>MCP Servers</div>
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>Export</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <div className="chat-input-actions">
            {inputValue.trim().length > 0 ? (
              <button className="icon-btn send-btn" title="Send" onClick={handleSend}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 14l14-6L1 2v4.5l9 1.5-9 1.5V14z"/></svg>
              </button>
            ) : (
              <button className="icon-btn" title="Voice Input">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3S5 2.34 5 4v4c0 1.66 1.34 3 3 3zm4-3c0 2.21-1.79 4-4 4s-4-1.79-4-4H2c0 3.03 2.28 5.56 5.17 5.95V15h1.66v-2.05C11.72 12.56 14 10.03 14 8h-2z"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
