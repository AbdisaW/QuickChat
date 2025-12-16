import SearchIcon from '../../assets/images/icons/SearchIcon';
import ChatItem from './ChatItem';
import SettingsPage from '../settings/SettingsPage';
import './ChatList.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchChatMessages, fetchChatThreads, setActiveChat } from '../../store/slices/chatSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { ChatThread } from '../../types/chat';

interface ChatListProps {
  activeMenu: string;
}

function ChatList({ activeMenu }: ChatListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, loading } = useSelector((state: any) => state.chat);
  const activeChat = useSelector((state: RootState) => state.chat.activeChat);

  useEffect(() => {
    if (activeMenu === "chats") {
      dispatch(fetchChatThreads());

    }
  }, [activeMenu, dispatch]);

  if (activeMenu === "settings") {
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
          avatar={item.participantAvatar || ''}
          name={item.participantName || ' '}
          lastMessage={item.lastMessage || ''}
          time={item.lastMessageTime}
          unreadCount={item.unreadCount}
          onClick={() => {
            dispatch(setActiveChat(item.id));
            dispatch(fetchChatMessages(item.id));
          }}
        />
      ))}

    </div>
  );
}
export default ChatList;