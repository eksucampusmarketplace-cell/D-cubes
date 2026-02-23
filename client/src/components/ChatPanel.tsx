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

  const quickMessages = [
    "Can I get the bill?",
    "Need more water",
    "Call a waiter",
    "Order more items",
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[70] transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark-4 border-t border-gold/20 
                    rounded-t-3xl z-[80] h-[90vh] flex flex-col
                    transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Handle */}
        <div className="relative flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-gold/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <h2 className="font-serif text-xl text-white">Staff Chat</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-cream/40">Online • Usually responds in 1 min</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-2 border border-gold/15 flex items-center justify-center text-cream
                       hover:border-gold/30 hover:bg-dark-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Messages */}
        <div className="px-6 py-3 border-b border-gold/5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => setInput(msg)}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-dark-2/80 border border-gold/15 text-xs text-cream/70
                           hover:border-gold/30 hover:text-gold transition-all"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-cream/40">
              <div className="w-20 h-20 rounded-2xl bg-dark-2 border border-gold/10 flex items-center justify-center mb-4">
                <span className="text-3xl opacity-50">💬</span>
              </div>
              <p className="text-base text-cream/50">Start a conversation</p>
              <p className="text-sm mt-1">Our staff is ready to assist you</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                             ${msg.sender === 'guest'
                               ? 'bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/20 text-cream rounded-br-sm'
                               : 'bg-dark-2 border border-gold/10 text-cream rounded-bl-sm'
                             }`}
                >
                  {msg.sender === 'staff' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="text-[10px] tracking-[0.1em] uppercase text-gold font-medium">
                        {msg.senderName}
                      </span>
                    </div>
                  )}
                  <div className="text-cream/90">{msg.text}</div>
                  <div className={`text-[10px] text-cream/30 mt-2 ${msg.sender === 'guest' ? 'text-right' : ''}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gold/10">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full input-luxury pr-12 resize-none min-h-[50px] max-h-[120px]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-12 h-12 rounded-xl btn-luxury flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
