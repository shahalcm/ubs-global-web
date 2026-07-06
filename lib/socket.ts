import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ubsglobalapp.com';

let socket: Socket | null = null;

export const connectSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;

  const userId = localStorage.getItem('userId');

  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    if (userId) {
      socket.emit('join', userId);
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000,
  });

  socket.on('connect', () => {
    console.log('✅ [Socket] Connected. ID:', socket?.id);
    if (userId) {
      socket?.emit('join', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ [Socket] Disconnected:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
      socket?.connect();
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const joinRoom = (roomId: string) => {
  socket?.emit('joinRoom', roomId);
};

export const sendMessage = (roomId: string, message: any) => {
  socket?.emit('sendMessage', { roomId, message });
};

export const emitTyping = (roomId: string, userId: string, name: string) => {
  socket?.emit('typing', { roomId, userId, name });
};

export const emitStopTyping = (roomId: string, userId: string) => {
  socket?.emit('stopTyping', { roomId, userId });
};
