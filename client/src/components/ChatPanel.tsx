import React, { useState, useRef, useEffect } from 'react';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { formatTime, generateMessageId } from '@/utils/format';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { tableNumber, guestName, messages, setMessages } = useTable() as any;
  const { sendMessage } = useSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || !tableNumber) return;

    const newMessage = {
      id: generateMessageId(),
      tableNumber,
      sender: 'guest' as const,
      text: input.trim(),
      timestamp: new Date(),
      senderName: guestName
    };

    setMessages((prev: any[]) => [...prev, newMessage]);
    sendMessage(newMessage);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark border-t border-gold/25 
                    rounded-t-2xl z-[80] h-[85vh] flex flex-col
                    transform transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3.5" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="font-serif text-xl text-white">Staff Chat</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cream
                       hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-cream/40">
              <span className="text-3xl mb-3">💬</span>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send a message to our staff</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed
                           ${msg.sender === 'guest'
                             ? 'bg-gold/12 border border-gold/20 text-cream self-end ml-auto rounded-br-sm'
                             : 'bg-dark-2 border border-white/5 text-cream self-start rounded-bl-sm'
                           }`}
              >
                {msg.sender === 'staff' && (
                  <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1">
                    {msg.senderName}
                  </div>
                )}
                <div>{msg.text}</div>
                <div className={`text-[10px] text-cream/30 mt-1 ${msg.sender === 'guest' ? 'text-right' : ''}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 flex gap-2.5 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message staff..."
            rows={1}
            className="flex-1 bg-dark-2 border border-white/8 rounded-full px-4 py-3 text-cream text-sm
                       focus:border-gold/40 focus:outline-none resize-none
                       placeholder:text-cream/25 transition-colors min-h-[44px] max-h-[120px]"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-gold text-dark flex items-center justify-center
                       hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
};
