
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (!socket) {
    socket = io('http://localhost:4002', {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
};
