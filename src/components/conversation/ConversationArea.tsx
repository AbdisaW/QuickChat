// src/components/ConversationArea.tsx
import './ConversationArea.css';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { addMessage, updateMessageStatus } from '../../store/slices/chatSlice';
import { userOnline, userOffline, setTyping, clearTyping } from '../../store/slices/presenceSlice';
import type { Message } from '../../types/chat';
import { useGetUsersQuery } from '../../store/api/authApi';
import { io, Socket } from 'socket.io-client';

function ConversationArea() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeChat, messages } = useSelector((state: RootState) => state.chat);
  const presence = useSelector((state: RootState) => state.presence);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: users = [] } = useGetUsersQuery();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // --- Initialize socket once ---
  useEffect(() => {
    if (!user || !token) return;

    const socket = io('http://localhost:4002', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join');
    });

    socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err.message);
    });

    // Presence
    socket.on('user_online', (userId: string) => dispatch(userOnline(userId)));
    socket.on('user_offline', (userId: string) => dispatch(userOffline(userId)));

    // Typing
    socket.on('typing', ({ from }: { from: string }) => dispatch(setTyping(from)));
    socket.on('stop_typing', ({ from }: { from: string }) => dispatch(clearTyping(from)));

    // Messages
    socket.on('receive_message', (msg: Message) => {
      dispatch(addMessage({ chatId: msg.conversationId, message: msg }));

      if (msg.from !== user.id) {
        socket.emit('message_seen', {
          conversationId: msg.conversationId,
          messageId: msg.id,
        });
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
    };
  }, [user, token, dispatch]);

  // --- Scroll to bottom ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  if (!activeChat) {
    return (
      <div className="conversation-area no-chat-wrapper">
        <p className="no-chat-text">Select a conversation</p>
      </div>
    );
  }

  const chatMessages = messages[activeChat] || [];
  const contact = users.find(u => u.id === activeChat);
  const name = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown';

  const isOnline =
    Array.isArray(presence.onlineUsers) &&
    presence.onlineUsers.includes(activeChat);

  const isTyping =
    Array.isArray(presence.typingUsers) &&
    presence.typingUsers.includes(activeChat);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { to: activeChat });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', { to: activeChat, text: input });
    setInput('');
    socketRef.current.emit('stop_typing', { to: activeChat });
  };

  return (
    <div className="conversation-area">
      <div className="conversation-header">
        <h4>
          {name} {isOnline && <span className="online-dot">●</span>}{' '}
          {isTyping && <em>Typing...</em>}
        </h4>
      </div>

      <div className="chat-body">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.from === user.id ? 'sent' : 'received'}`}
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
