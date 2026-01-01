// src/components/chat/ChatItem.tsx
import './ChatItem.css';
import { getAvatarUrl } from '../../utils/avatar';

interface ChatItemProps {
  userId: string;
  updatedAt?: string;
  name: string;
  lastMessage: string;
  isActive?: boolean;
  onClick: () => void;
}

const ChatItem = ({
  userId,
  updatedAt,
  name,
  lastMessage,
  isActive,
  onClick,
}: ChatItemProps) => {
  return (
    <div
      className={`chat-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <img
        src={getAvatarUrl(userId, updatedAt)}
        className="chat-avatar"
        alt={name}
      />

      <div className="chat-info">
        <strong className="chat-name">{name}</strong>
        <p className="chat-last-message">{lastMessage}</p>
      </div>
    </div>
  );
};

export default ChatItem;
