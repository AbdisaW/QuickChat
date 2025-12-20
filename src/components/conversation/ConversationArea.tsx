// src/components/conversation/ConversationArea.tsx
import './ConversationArea.css';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { addMessage } from '../../store/slices/chatSlice';
import type { Message } from '../../types/chat';
import { io, type Socket } from 'socket.io-client';

let socket: Socket;

function ConversationArea() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeChat, messages, threads } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.auth.user);

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Socket.IO once
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:4002'); // your backend URL
      if (user?.id) socket.emit('join', user.id);

      socket.on('receive_message', (msg: Message) => {
        dispatch(addMessage({ chatId: msg.conversationId, message: msg }));
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  if (!activeChat) {
    return (
      <div className="conversation-area">
        <div className="no-chat-wrapper">
          <p className="no-chat-text">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const chatMessages = messages[activeChat] || [];
  const thread = threads.find((t) => t.id === activeChat);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      conversationId: activeChat,
      text: input,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text',
    };

    // Dispatch to Redux
    dispatch(addMessage({ chatId: activeChat, message: newMessage }));

    // Send via Socket.IO
    socket.emit('send_message', {
      from: user.id,
      to: thread?.participantId, // make sure thread has participantId
      text: input,
      conversationId: activeChat,
    });

    setInput('');
  };

  return (
    <div className="conversation-area">
      {/* Header */}
      <div className="conversation-header">
        <img src={thread?.participantAvatar} className="chat-header-avatar" />
        <div>
          <h4>{thread?.participantName}</h4>
          <span className="chat-status">{thread?.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Chat body */}
      <div className="chat-body">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === user?.id ? 'sent' : 'received'}`}
          >
            {msg.type === 'text' && <span>{msg.text}</span>}
            {msg.type === 'audio' && <audio controls src={msg.url} />}
            {msg.type === 'video' && <video controls src={msg.url} width="200" />}
            {msg.type === 'file' && (
              <a href={msg.url} download>
                {msg.text || 'Download File'}
              </a>
            )}
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Footer / input */}
      <form className="chat-footer" onSubmit={handleSendMessage}>
        <button type="button" className="footer-btn">😊</button>
        <button type="button" className="footer-btn">📎</button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="footer-btn">🎤</button>
        <button type="submit" className="footer-btn send-btn">Send</button>
      </form>
    </div>
  );
}

export default ConversationArea;
