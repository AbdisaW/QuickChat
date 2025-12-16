import "./ChatItem.css"


type ChatItemProps = {
  avatar: string;
  name: string;
  lastMessage: string;
  time?: string;
  unreadCount?: number;
  onClick?: () => void;

};

function ChatItem({ avatar, name, lastMessage, time, unreadCount , onClick}: ChatItemProps) {
    return (
        <div className="chat-item" onClick={onClick}>
            <img src={avatar} alt={name} className="chat-avatar" />
            <div className="chat-info">
                <div className="chat-header">
                    <span className="chat-name">{name}</span>
                    {time && <span className="chat-time">{time}</span>}
                </div>
                <div className="chat-message">
                    {lastMessage}
                    {unreadCount && <span className="chat-unread">{unreadCount}</span>}
                </div>
            </div>

        </div>

    )

}

export default ChatItem;