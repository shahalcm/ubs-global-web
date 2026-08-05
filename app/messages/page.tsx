'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Loader2, Send, MessageSquare, ShieldAlert, Bot } from 'lucide-react';

function MessagesContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const urlRoomId = searchParams.get('roomId') || '';

  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>(urlRoomId);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat rooms
  const loadChatRooms = useCallback(async () => {
    try {
      const res = await api.get('/chat/my-rooms');
      if (res.data?.rooms) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  // Handle active room updates
  useEffect(() => {
    if (urlRoomId) {
      setActiveRoomId(urlRoomId);
    }
  }, [urlRoomId]);

  // Load messages when active room changes
  useEffect(() => {
    if (!activeRoomId) return;

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.get(`/chat/${activeRoomId}/messages`);
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
        // Mark room as read
        api.patch(`/chat/${activeRoomId}/read`).catch(() => null);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();

    // Socket listeners setup
    const socket = connectSocket();
    if (socket) {
      socketRef.current = socket;
      socket.emit('joinRoom', activeRoomId);

      socket.on('receiveMessage', (message: any) => {
        if (message.roomId === activeRoomId || message.chatRoomId === activeRoomId) {
          setMessages((prev) => [...prev, message]);
          // Re-load rooms to update last message preview
          loadChatRooms();
        }
      });

      socket.on('typing', (data: any) => {
        if (data.roomId === activeRoomId && data.userId !== user?._id) {
          setIsTyping(true);
          setTypingUser(data.name || 'Seller');
        }
      });

      socket.on('stopTyping', (data: any) => {
        if (data.roomId === activeRoomId && data.userId !== user?._id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', activeRoomId);
        socketRef.current.off('receiveMessage');
        socketRef.current.off('typing');
        socketRef.current.off('stopTyping');
      }
    };
  }, [activeRoomId, user, loadChatRooms]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeRoomId) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      // Emit stop typing
      socketRef.current?.emit('stopTyping', { roomId: activeRoomId, userId: user?._id });

      // Save to server
      const res = await api.post(`/chat/${activeRoomId}/messages`, {
        content: textToSend,
      });

      if (res.data?.message) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);

        // Emit through socket
        socketRef.current?.emit('sendMessage', {
          roomId: activeRoomId,
          message: newMsg,
        });

        loadChatRooms();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const getRecipientInfo = (room: any) => {
    if (!room) return { name: 'Seller', avatar: '', isBot: false };
    
    // Find the participant that is NOT current user
    const recipient = room.participants?.find((p: any) => p._id !== user?._id);
    
    if (recipient) {
      return {
        name: recipient.shopName || recipient.name || 'Seller',
        avatar: recipient.shopLogo || recipient.avatar || '',
        isBot: room.botConfig?.active || false
      };
    }
    return { name: 'UBS Partner', avatar: '', isBot: false };
  };

  const activeRoom = rooms.find((r) => r._id === activeRoomId || r.id === activeRoomId);
  const activeRecipient = getRecipientInfo(activeRoom);

  const getAvatarUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ubsglobalapp.com'}/${img}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
        {/* Left Side Pane: Conversations List */}
        <section className="w-80 bg-white border border-slate-100 rounded-3xl flex flex-col overflow-hidden shrink-0 shadow-sm">
          <div className="p-5 border-b border-slate-50">
            <h2 className="font-extrabold text-slate-800 text-lg">{t('Conversations')}</h2>
          </div>

          <div className="grow overflow-y-auto divide-y divide-slate-50">
            {roomsLoading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room) => {
                const info = getRecipientInfo(room);
                const isActive = room._id === activeRoomId || room.id === activeRoomId;
                const hasUnread = room.unreadCount > 0 && room.lastMessage?.senderId !== user?._id;

                return (
                  <button
                    key={room._id || room.id}
                    onClick={() => {
                      setActiveRoomId(room._id || room.id);
                      router.replace(`/messages?roomId=${room._id || room.id}`);
                    }}
                    className={`w-full p-4 flex gap-3 text-left items-start transition-all cursor-pointer border-l-4 ${
                      isActive
                        ? 'bg-primary/2 border-primary'
                        : 'border-transparent hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">
                      {info.avatar ? (
                        <img src={getAvatarUrl(info.avatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 uppercase text-xs">
                          {info.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className={`font-bold text-xs truncate ${hasUnread ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                          {t(info.name)}
                        </h4>
                        {room.lastMessage?.createdAt && (
                          <span className="text-[9px] text-slate-400 font-bold shrink-0">
                            {new Date(room.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${hasUnread ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                        {room.lastMessage?.content || t('Start chatting...')}
                      </p>
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-1.5 animate-pulse" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">{t('No conversations yet.')}</div>
            )}
          </div>
        </section>

        {/* Right Side Pane: Chat Room messages logs */}
        <section className="grow bg-white border border-slate-100 rounded-3xl flex flex-col overflow-hidden shadow-sm">
          {activeRoomId ? (
            <>
              {/* Room Header */}
              <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden">
                    {activeRecipient.avatar ? (
                      <img src={getAvatarUrl(activeRecipient.avatar)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 uppercase text-xs">
                        {activeRecipient.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{t(activeRecipient.name)}</h3>
                    {isTyping ? (
                      <span className="text-[10px] text-accent font-bold animate-pulse">{typingUser} is typing...</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {activeRecipient.isBot ? 'AI Bot Active' : 'Exporter / Merchant'}
                      </span>
                    )}
                  </div>
                </div>

                {activeRecipient.isBot && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <Bot size={13} />
                    <span>AI Handle</span>
                  </div>
                )}
              </div>

              {/* Messages Lists */}
              <div className="grow overflow-y-auto p-5 bg-slate-50/20 space-y-4">
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
                    const isOwn = msgSenderId && user?._id && msgSenderId.toString() === user._id.toString();
                    const isBot = msg.isBot || msg.senderType === 'bot';
                    const date = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const messageText = msg.text || msg.content || '';

                    if (isBot) {
                      return (
                        <div key={msg._id || msg.id || idx} className="flex justify-start">
                          <div className="max-w-xs md:max-w-md bg-blue-50 border border-blue-100 text-blue-900 rounded-2xl rounded-tl-none p-3.5 space-y-1 shadow-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs">🤖</span>
                              <span className="font-bold text-[11px] text-blue-950">{msg.senderName || 'UBS Assistant'}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-900 text-white text-[9px] font-extrabold uppercase">AI</span>
                            </div>
                            <p className="whitespace-pre-wrap text-xs sm:text-sm font-medium">{messageText}</p>
                            <span className="block text-[9px] text-right font-semibold text-blue-400">{date}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg._id || msg.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs md:max-w-md rounded-2xl p-3.5 space-y-1 shadow-xs leading-relaxed text-xs sm:text-sm font-medium ${
                            isOwn
                              ? 'bg-blue-900 text-white rounded-tr-none'
                              : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{messageText}</p>
                          <span className={`block text-[9px] text-right font-semibold ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                            {date}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                    <MessageSquare size={24} className="mb-2" />
                    <span>{t('Send a message to start conversation')}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-50 flex gap-2.5 bg-white">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    // Emit typing status
                    if (e.target.value.trim()) {
                      socketRef.current?.emit('typing', { roomId: activeRoomId, userId: user?._id, name: user?.name });
                    } else {
                      socketRef.current?.emit('stopTyping', { roomId: activeRoomId, userId: user?._id });
                    }
                  }}
                  placeholder={t('Type a message...')}
                  className="grow h-11 px-4 border border-slate-200 focus:border-primary focus:outline-none rounded-xl text-slate-800 text-xs sm:text-sm font-semibold bg-slate-50/50"
                  required
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-11 h-11 shrink-0 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center shadow-md shadow-primary/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <MessageSquare size={36} />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 text-base">{t('Select a conversation')}</h3>
                <p className="text-slate-400 text-xs mt-1">{t('Choose an active chat room from sidepane to start messaging.')}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function MessagesScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
