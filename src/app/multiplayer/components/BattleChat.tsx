'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

interface BattleChatProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
}

export default function BattleChat({ messages, onSend }: BattleChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onSend(trimmed);
      setInput('');
    }
  };

  return (
    <div className="battle-chat">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-message" style={{ color: '#666' }}>No messages yet...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="chat-message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          maxLength={100}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
