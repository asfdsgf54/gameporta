'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaHeadset, 
  FaPaperPlane, 
  FaUser, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSearch,
  FaRobot,
  FaCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupportMessages, updateSupportMessage } from '@/lib/support';
import { SupportMessage } from '@/types/support';
import AnimatedButton from '@/components/AnimatedButton';
import { cn } from '@/lib/utils';

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId, messages]);

  const loadMessages = async () => {
    const allMessages = await getSupportMessages();
    setMessages(allMessages);
    
    // Eğer hiç seçili kullanıcı yoksa ve mesaj varsa, en yeni bekleyen kullanıcıyı seç
    if (!selectedUserId && allMessages.length > 0) {
      const pending = allMessages.find(m => m.status === 'pending');
      if (pending) setSelectedUserId(pending.userId);
      else setSelectedUserId(allMessages[0].userId);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesajları kullanıcı bazlı grupla
  const userConversations = messages.reduce((acc: any, msg) => {
    if (!acc[msg.userId]) {
      acc[msg.userId] = {
        userId: msg.userId,
        username: msg.username,
        userEmail: msg.userEmail,
        messages: [],
        lastMessage: msg,
        pendingCount: 0
      };
    }
    acc[msg.userId].messages.push(msg);
    if (msg.status === 'pending') acc[msg.userId].pendingCount++;
    
    // En yeni mesajı lastMessage olarak tut (liste sıralaması için)
    if (new Date(msg.createdAt) > new Date(acc[msg.userId].lastMessage.createdAt)) {
      acc[msg.userId].lastMessage = msg;
    }
    
    return acc;
  }, {});

  // Konuşmaları tarihe göre sırala
  const sortedConversations = Object.values(userConversations)
    .sort((a: any, b: any) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    ) as any[];

  // Arama filtresi
  const filteredConversations = sortedConversations.filter((conv: any) => 
    conv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = selectedUserId ? userConversations[selectedUserId] : null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim() || isSending) return;

    setIsSending(true);

    // Seçili kullanıcının en son PENDING mesajını bul ve ona yanıt ver
    // (Veya en son mesajına yanıt ver)
    const userMsgs = [...selectedConversation.messages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const lastPending = userMsgs.find(m => m.status === 'pending') || userMsgs[0];

    await updateSupportMessage(lastPending.id, {
      response: replyText.trim(),
      status: 'answered',
      answeredAt: new Date().toISOString()
    });

    setReplyText('');
    setIsSending(false);
    loadMessages();
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Sidebar - User List */}
      <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/30">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaHeadset className="text-blue-400" /> Mesajlar
          </h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center opacity-30 text-sm">
              Görüşme bulunamadı
            </div>
          ) : (
            filteredConversations.map((conv: any) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUserId(conv.userId)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 hover:bg-neutral-800/50 transition-all border-b border-neutral-800/50 text-left relative group",
                  selectedUserId === conv.userId ? "bg-neutral-800" : ""
                )}
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 font-bold shrink-0">
                  {conv.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-200 truncate">{conv.username}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate pr-4">
                    {conv.lastMessage.response ? "✓ " : ""}{conv.lastMessage.message}
                  </p>
                </div>
                
                {conv.pendingCount > 0 && (
                  <div className="absolute right-4 bottom-4 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
                    {conv.pendingCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 font-bold text-xl">
                  {selectedConversation.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedConversation.username}</h3>
                  <p className="text-xs text-blue-400 font-medium">{selectedConversation.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                  <FaCircle className="text-[8px] text-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-bold uppercase tracking-wider">AKTİF</span>
                </div>
              </div>
            </div>

            {/* Messages Flow */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
              {[...selectedConversation.messages].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg: SupportMessage) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-none p-5 shadow-xl">
                      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{msg.username}</span>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.priority === 'high' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-bold rounded uppercase">Acil</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {msg.response && (
                    <div className="flex flex-col items-end w-full">
                      <div className="max-w-[80%] bg-blue-600/90 text-white rounded-2xl rounded-tr-none p-5 shadow-2xl relative group">
                        <div className="flex items-center gap-2 mb-2">
                          <FaRobot className="text-blue-200 text-xs" />
                          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">SİZ (DESTEK EKİBİ)</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.response}</p>
                        <span className="text-[10px] opacity-60 mt-3 block text-right">
                          {msg.answeredAt && new Date(msg.answeredAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Reply Form */}
            <div className="p-6 bg-neutral-900 border-t border-neutral-800">
              <form onSubmit={handleSendReply} className="flex gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(e);
                      }
                    }}
                    placeholder="Yanıtınızı buraya yazın... (Enter ile gönder)"
                    className="relative w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none max-h-32"
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-3 shrink-0"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>GÖNDER</span>
                    </>
                  )}
                </button>
              </form>
              <p className="text-[10px] text-gray-500 mt-2 ml-1">
                İpucu: Shift + Enter bir alt satıra geçer. Yanıt gönderildiğinde kullanıcının destek talebi otomatik olarak "Yanıtlandı" durumuna geçer.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-8">
            <div className="w-32 h-32 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
              <FaHeadset className="text-6xl text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Canlı Destek Masasına Hoş Geldiniz</h2>
            <p className="max-w-xs text-sm">Sohbeti başlatmak için sol taraftaki listeden bir kullanıcı seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
