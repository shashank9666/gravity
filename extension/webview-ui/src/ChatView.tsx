import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  sender: 'user' | 'agent' | 'error';
  text: string;
};

// Add typescript declaration for VS Code API
declare const acquireVsCodeApi: any;
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

export const ChatView = () => {
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
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="chat-input"
        />
      </div>
    </div>
  );
};
