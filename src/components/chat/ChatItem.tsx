// src/components/chat/ChatItem.tsx
import './ChatItem.css';

interface ChatItemProps {
  avatar?: string;
  name: string;
  lastMessage: string;
  time?: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick: () => void;
}


const ChatItem = ({ avatar, name, lastMessage, time, unreadCount, isActive, onClick }: ChatItemProps) => {
  return (
    <div className={`chat-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <img src={avatar || '/default-avatar.png'} className="chat-avatar" />
      <div className="chat-info">
        <div className="chat-name-time">
          <span className="chat-name">{name}</span>
          {time && <span className="chat-time">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <div className="chat-last-message">
          <span>{lastMessage}</span>
          {unreadCount && unreadCount > 0 && <span className="chat-unread">{unreadCount}</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
