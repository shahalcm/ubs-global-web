'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Search, Store } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    async function loadChatRooms() {
      try {
        setLoadingRooms(true);
        const res = await api.get('/chat/my-rooms');
        if (res.data?.success) {
          setRooms(res.data.rooms || []);
          if (res.data.rooms?.length > 0) {
            setActiveRoom(res.data.rooms[0]);
          }
        }
      } catch (err) {
        console.error('Error loading chat rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    async function loadMessages() {
      try {
        setLoadingMsgs(true);
        const res = await api.get(`/chat/${activeRoom._id}/messages`);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMsgs(false);
      }
    }
    loadMessages();
  }, [activeRoom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeRoom) return;

    try {
      const msgText = inputMessage.trim();
      setInputMessage('');
      const res = await api.post(`/chat/${activeRoom._id}/messages`, { text: msgText });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar Chat Rooms */}
      <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-200/80 bg-white">
          <h3 className="font-bold text-sm text-[#0A1A44]">Seller Messaging Desk</h3>
          <p className="text-[11px] text-slate-500">Real-time inquiries from prospective buyers</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loadingRooms ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading chat channels...</div>
          ) : rooms.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active buyer messages yet.</div>
          ) : (
            rooms.map((room) => {
              const buyer = room.buyerId || room.participants?.find((p: any) => p._id !== user?._id) || {};
              const isSelected = activeRoom?._id === room._id;

              return (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                    isSelected ? 'bg-white shadow-sm border border-blue-100 font-semibold' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(buyer.name || 'B').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0A1A44] truncate">{buyer.name || 'Buyer Inquiry'}</p>
                    <span className="text-[10px] text-slate-400 truncate block">{room.lastMessage || 'Start conversation...'}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Conversation View */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B4DFF] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0A1A44]">
                    {activeRoom.buyerId?.name || 'Customer Buyer'}
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-medium">Active Channel</span>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
              {loadingMsgs ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading conversation...</div>
              ) : messages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No messages sent yet.</div>
              ) : (
                messages.map((m: any, idx: number) => {
                  const isMine = m.senderId === user?._id || m.sender === user?._id;

                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-[#0B4DFF] text-white rounded-br-none shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                        }`}
                      >
                        {m.text || m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response to buyer..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-[#0B4DFF] hover:bg-[#093ecf] disabled:bg-slate-300 text-white rounded-xl transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
            <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
            Select a conversation channel to reply to buyers.
          </div>
        )}
      </div>
    </div>
  );
}
