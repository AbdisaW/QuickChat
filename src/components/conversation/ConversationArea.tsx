// src/components/ConversationArea.tsx
import './ConversationArea.css';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { addMessage, updateMessageStatus } from '../../store/slices/chatSlice';
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

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingToRef = useRef<string | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io('http://localhost:4002', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('online_users', (users: string[]) => {
      dispatch(resetPresence());
      users.forEach((id) => dispatch(userOnline(id)));
    });

    socket.on('user_online', (id: string) => dispatch(userOnline(id)));
    socket.on('user_offline', (id: string) => dispatch(userOffline(id)));

    socket.on('typing', ({ from }) => dispatch(setTyping(from)));
    socket.on('stop_typing', ({ from }) => dispatch(clearTyping(from)));

    socket.on('receive_message', (msg: Message) => {
      dispatch(addMessage({ chatId: msg.conversationId, message: msg }));
    });

    socket.on('message_seen', ({ chatId, messageId }) => {
      dispatch(
        updateMessageStatus({
          chatId,
          messageId,
          status: 'read',
        })
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, dispatch]);

  useEffect(() => {
    if (!socketRef.current || !activeChat || !user) return;

    const unreadMessages = (messages[activeChat] || []).filter(
      (msg) => msg.from !== user.id && msg.status !== 'read'
    );

    unreadMessages.forEach((msg) => {
      socketRef.current!.emit('message_seen', {
        messageId: msg._id,
      });

      dispatch(
        updateMessageStatus({
          chatId: activeChat,
          messageId: msg._id,
          status: 'read',
        })
      );
    });
  }, [activeChat, messages, user, dispatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socketRef.current || !activeChat) return;

    if (!isTypingRef.current) {
      socketRef.current.emit('typing', { to: activeChat });
      isTypingRef.current = true;
      typingToRef.current = activeChat;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { to: activeChat });
      isTypingRef.current = false;
      typingToRef.current = null;
    }, 800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !activeChat) return;

    socketRef.current.emit('send_message', {
      to: activeChat,
      text: input,
    });

    socketRef.current.emit('stop_typing', { to: activeChat });

    setInput('');
    isTypingRef.current = false;
    typingToRef.current = null;
  };

  if (!activeChat) {
    return <div className="conversation-area no-chat-wrapper">Select a chat</div>;
  }

  const chatMessages = messages[activeChat] || [];
  const contact = users.find((u) => u.id === activeChat);
  const isOnline = presence.onlineUsers.includes(activeChat);
  const isTyping = presence.typingUsers.includes(activeChat);

  return (
    <div className="conversation-area">
      <div className="conversation-header">
        <h4>
          {contact?.firstName} {contact?.lastName}
          {isOnline && <span className="online-dot">●</span>}
          {isTyping && <em> Typing...</em>}
        </h4>
      </div>

      <div className="chat-body">
        {chatMessages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.from === user.id ? 'sent' : 'received'}`}
          >
            <span className="message-text">{msg.text}</span>

            {msg.from === user.id && (
              <span className="message-status">
                {msg.status === 'sent' && '✔'}
                {msg.status === 'delivered' && '✔✔'}
                {msg.status === 'read' && <span className="read-dot" />}
              </span>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ConversationArea;
