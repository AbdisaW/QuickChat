import SearchIcon from '../../assets/images/icons/SearchIcon';
import ChatItem from './ChatItem';
import SettingsPage from '../settings/SettingsPage';
import './ChatList.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchChatThreads, fetchChatMessages, setActiveChat } from '../../store/slices/chatSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { ChatThread } from '../../types/chat';

interface ChatListProps {
  activeMenu: 'chats' | 'settings'; // strictly typed
}

function ChatList({ activeMenu }: ChatListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, loading, activeChat } = useSelector((state: RootState) => state.chat);

  // Fetch threads only if we're on the chat menu
  useEffect(() => {
    if (activeMenu === 'chats') {
      dispatch(fetchChatThreads());
    }
  }, [activeMenu, dispatch]);

  // Render settings page if selected
  if (activeMenu === 'settings') {
    return <SettingsPage />;
  }

  return (
    <div className="chat-list">
      <h6 className="chat-header">Messages</h6>

      <div className="chat-search">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="search-input"
        />
      </div>

      {loading && <p>Loading chats...</p>}

      {threads.map((item: ChatThread) => (
        <ChatItem
          key={item.id}
          avatar={item.participantAvatar || '/default-avatar.png'}
          name={item.participantName || 'Unknown'}
          lastMessage={item.lastMessage || ''}
          time={item.lastMessageTime}
          unreadCount={item.unreadCount || 0}
          isActive={activeChat === item.id}
          onClick={() => {
            dispatch(setActiveChat(item.id));
            dispatch(fetchChatMessages(item.participantId));
          }}
        />
      ))}
    </div>
  );
}

export default ChatList;
