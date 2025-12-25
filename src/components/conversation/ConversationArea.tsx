// src/components/ConversationArea.tsx
import './ConversationArea.css';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
  addMessage,
  updateMessageStatus,
} from '../../store/slices/chatSlice';
import {
  userOnline,
  userOffline,
  setTyping,
  clearTyping,
  resetPresence,
} from '../../store/slices/presenceSlice';
import type { Message } from '../../types/chat';
import { useGetUsersQuery } from '../../store/api/authApi';
import { io, Socket } from 'socket.io-client';

function ConversationArea() {
  const dispatch = useDispatch<AppDispatch>();

  const { activeChat, messages } = useSelector(
    (state: RootState) => state.chat
  );
  const presence = useSelector((state: RootState) => state.presence);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const { data: users = [] } = useGetUsersQuery();

  const [input, setInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 🔹 Typing refs (IMPORTANT)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingToRef = useRef<string | null>(null);
  const isTypingRef = useRef(false);

  // ================= SOCKET INIT =================
  useEffect(() => {
    if (!user || !token) return;

    const socket = io('http://localhost:4002', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err.message);
    });

    // 🔹 Initial presence sync
    socket.on('online_users', (users: string[]) => {
      dispatch(resetPresence());
      users.forEach(id => dispatch(userOnline(id)));
    });

    // 🔹 Presence updates
    socket.on('user_online', (userId: string) =>
      dispatch(userOnline(userId))
    );
    socket.on('user_offline', (userId: string) =>
      dispatch(userOffline(userId))
    );

    // 🔹 Typing
    socket.on('typing', ({ from }: { from: string }) =>
      dispatch(setTyping(from))
    );
    socket.on('stop_typing', ({ from }: { from: string }) =>
      dispatch(clearTyping(from))
    );

    // 🔹 Messages
    socket.on('receive_message', (msg: Message) => {
      dispatch(addMessage({ chatId: msg.conversationId, message: msg }));

      if (msg.from !== user.id) {
        dispatch(
          updateMessageStatus({
            chatId: msg.conversationId,
            messageId: msg.id,
            status: 'read',
          })
        );
      }
    });

    socket.on('message_seen', ({ chatId, messageId }) => {
      dispatch(updateMessageStatus({ chatId, messageId, status: 'read' }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, dispatch]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // ================= STOP TYPING ON CHAT CHANGE =================
  useEffect(() => {
    if (!socketRef.current) return;

    if (typingToRef.current) {
      socketRef.current.emit('stop_typing', {
        to: typingToRef.current,
      });
      isTypingRef.current = false;
      typingToRef.current = null;
    }
  }, [activeChat]);

  // ================= CLEANUP =================
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socketRef.current && typingToRef.current) {
        socketRef.current.emit('stop_typing', {
          to: typingToRef.current,
        });
      }
    };
  }, []);

  // ================= UI LOGIC =================
  if (!activeChat) {
    return (
      <div className="conversation-area no-chat-wrapper">
        <p className="no-chat-text">Select a conversation</p>
      </div>
    );
  }

  const chatMessages = messages[activeChat] || [];
  const contact = users.find(u => u.id === activeChat);
  const name = contact
    ? `${contact.firstName} ${contact.lastName}`
    : 'Unknown';

  const isOnline = presence.onlineUsers.includes(activeChat);
  const isTyping = presence.typingUsers.includes(activeChat);

  // ================= INPUT =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (!socketRef.current || !activeChat) return;

    // Stop typing in previous chat
    if (typingToRef.current && typingToRef.current !== activeChat) {
      socketRef.current.emit('stop_typing', {
        to: typingToRef.current,
      });
      isTypingRef.current = false;
    }

    typingToRef.current = activeChat;

    // Emit typing once
    if (!isTypingRef.current) {
      socketRef.current.emit('typing', { to: activeChat });
      isTypingRef.current = true;
    }

    // Debounce stop
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && typingToRef.current) {
        socketRef.current.emit('stop_typing', {
          to: typingToRef.current,
        });
      }
      isTypingRef.current = false;
      typingToRef.current = null;
    }, 800);
  };

  // ================= SEND =================
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !activeChat) return;

    socketRef.current.emit('send_message', {
      to: activeChat,
      text: input,
    });

    setInput('');

    socketRef.current.emit('stop_typing', { to: activeChat });
    isTypingRef.current = false;
    typingToRef.current = null;
  };

  // ================= RENDER =================
  return (
    <div className="conversation-area">
      <div className="conversation-header">
        <h4>
          {name}{' '}
          {isOnline && <span className="online-dot">●</span>}{' '}
          {isTyping && <em>Typing...</em>}
        </h4>
      </div>

      <div className="chat-body">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`message ${
              msg.from === user.id ? 'sent' : 'received'
            }`}
          >
            {msg.text}
            {msg.from === user.id && msg.status === 'read' && (
              <span className="seen-check">✔✔</span>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ConversationArea;
