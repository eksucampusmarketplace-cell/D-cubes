import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { formatTime, generateMessageId } from '@/utils/format';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { tableNumber, guestName, messages, setMessages } = useTable();
  const { sendMessage } = useSocket();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !tableNumber || isSending) return;

    setIsSending(true);

    const newMessage = {
      id: generateMessageId(),
      tableNumber,
      sender: 'guest' as const,
      text: input.trim(),
      timestamp: new Date(),
      senderName: guestName
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(newMessage);
    setInput('');

    // Simulate brief delay for UX
    setTimeout(() => setIsSending(false), 300);
  }, [input, tableNumber, guestName, sendMessage, setMessages, isSending]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickMessage = useCallback((msg: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Auto-send the quick message
    if (!tableNumber || !guestName) return;
    
    const newMessage = {
      id: generateMessageId(),
      tableNumber,
      sender: 'guest' as const,
      text: msg,
      timestamp: new Date(),
      senderName: guestName
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(newMessage);
  }, [tableNumber, guestName, sendMessage, setMessages]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

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
        onClick={handleClose}
      />

      {/* Chat Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark-4 border-t border-gold/20 
                    rounded-t-[32px] z-[80] h-[90vh] flex flex-col overflow-hidden
                    transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Handle */}
        <div className="relative flex justify-center pt-5 pb-3">
          <div className="w-14 h-1.5 bg-gold/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h2 className="font-serif text-xl text-white">Staff Chat</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-cream/50">Online • Usually responds in 1 min</span>
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="btn-icon"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Messages */}
        <div className="px-6 py-4 border-b border-gold/5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={handleQuickMessage(msg)}
                className="flex-shrink-0 px-4 py-2.5 rounded-full bg-dark-2/80 border border-gold/15 text-xs text-cream/70
                           hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all duration-300"
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
              <div className="w-24 h-24 rounded-2xl bg-dark-2 border border-gold/10 flex items-center justify-center mb-5
                            shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <span className="text-4xl opacity-50">💬</span>
              </div>
              <p className="text-lg text-cream/60 font-medium">Start a conversation</p>
              <p className="text-sm mt-1 text-cream/35">Our staff is ready to assist you</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'} stagger-item`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                             ${msg.sender === 'guest'
                               ? 'bg-gradient-to-br from-gold/20 to-gold/8 border border-gold/25 text-cream rounded-br-md'
                               : 'bg-dark-2 border border-gold/10 text-cream rounded-bl-md'
                             }`}
                >
                  {msg.sender === 'staff' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center border border-gold/20">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold">
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
        <div className="p-4 border-t border-gold/10 bg-dark-4/95 backdrop-blur">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full input-luxury pr-4 resize-none min-h-[52px] max-h-[120px] py-3.5"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl btn-luxury flex items-center justify-center
                         disabled:opacity-40 disabled:cursor-not-allowed p-0"
              aria-label="Send message"
            >
              {isSending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
