'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeadset, FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { saveSupportMessage, getUserMessages, updateSupportMessage } from '@/lib/support';
import { SupportMessage } from '@/types/support';
import AnimatedButton from './AnimatedButton';
import { cn } from '@/lib/utils';
import { findAutoReply } from '@/lib/automation';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const auth = isUserAuthenticated();
    setIsAuthenticated(auth);

    if (auth) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const loadMessages = async () => {
    const user = getCurrentUser();
    if (user) {
      const allMessages = await getUserMessages(user.id);
      
      // Yeni mesaj (cevap) kontrolü
      if (allMessages.length > messages.length && !isOpen) {
        setUnreadCount(prev => prev + (allMessages.length - messages.length));
      }
      
      setMessages([...allMessages].reverse()); // Eskiden yeniye sırala
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const user = getCurrentUser();
    if (!user) return;

    setIsSending(true);

    const newMessage: SupportMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      userEmail: user.email,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority: 'medium',
    };

    const userMessageText = message.trim();
    await saveSupportMessage(newMessage);
    setMessage('');
    loadMessages();
    setIsSending(false);

    // Otomatik yanıt kontrolü
    const autoReply = findAutoReply(userMessageText);
    if (autoReply) {
      // 1.5 saniye gecikme ile bot cevabı ver (typing simulation)
      setTimeout(async () => {
        await updateSupportMessage(newMessage.id, {
          response: autoReply,
          status: 'answered',
          answeredAt: new Date().toISOString()
        });
        loadMessages();
      }, 1500);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <FaHeadset className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Canlı Destek</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">Çevrimiçi</span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <FaHeadset size={48} className="text-blue-400" />
                  <p className="text-sm text-gray-400 max-w-[200px]">
                    Henüz bir mesajınız yok. Yardıma mı ihtiyacınız var?
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow-lg">
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <span className="text-[10px] opacity-70 mt-2 block text-right">
                          {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Admin Response */}
                    {msg.response && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-neutral-900 border border-neutral-800 text-gray-200 rounded-2xl rounded-tl-none p-4 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaRobot className="text-blue-400 text-xs" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">DESTEK EKİBİ</span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.response}</p>
                          <span className="text-[10px] text-gray-500 mt-2 block">
                            {msg.answeredAt && new Date(msg.answeredAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-neutral-900 border-t border-neutral-800">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className={cn(
                    "p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed",
                    !message.trim() ? "scale-90 opacity-0" : "scale-100 opacity-100"
                  )}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative group overflow-hidden",
          isOpen ? "bg-neutral-900 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
        )}
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-none" />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <FaTimes size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <FaHeadset size={28} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
