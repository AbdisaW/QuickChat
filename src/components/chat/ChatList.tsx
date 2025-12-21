import SearchIcon from '../../assets/images/icons/SearchIcon';
import ChatItem from './ChatItem';
import SettingsPage from '../settings/SettingsPage';
import './ChatList.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchChatThreads, fetchChatMessages, setActiveChat } from '../../store/slices/chatSlice';
import { useGetUsersQuery } from '../../store/api/authApi';
import type { AppDispatch, RootState } from '../../store/store';
import type { ChatThread } from '../../types/chat';
import type { User } from '../../types/auth';

interface ChatListProps {
  activeMenu: 'chats' | 'contacts' | 'settings';
}

function ChatList({ activeMenu }: ChatListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, loading, activeChat } = useSelector((state: RootState) => state.chat);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const users = useSelector((state: RootState) => state.auth.users);

  // Fetch chat threads for "chats"
  useEffect(() => {
    if (activeMenu === 'chats') dispatch(fetchChatThreads());
  }, [activeMenu, dispatch]);

  const { data: allUsers, isLoading: usersLoading } = useGetUsersQuery();

  if (activeMenu === 'settings') return <SettingsPage />;

  const handleClick = (userId: string) => {
    dispatch(setActiveChat(userId));
    dispatch(fetchChatMessages(userId));
  };

  const getUserFullName = (user?: User) => user ? `${user.firstName} ${user.lastName}` : 'Unknown';

  return (
    <div className="chat-list">
      <h6 className="chat-header">{activeMenu === 'chats' ? 'Messages' : 'Contacts'}</h6>

      <div className="chat-search">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder={`Search ${activeMenu === 'chats' ? 'conversations' : 'contacts'}...`}
          className="search-input"
        />
      </div>

      <div className="chat-items-container">
        {(loading || usersLoading) && <p>Loading...</p>}

        {/* Chats */}
        {activeMenu === 'chats' &&
          threads.map((thread: ChatThread) => {
            const contact = users?.find(u => u.id === thread.participantId) || allUsers?.find(u => u.id === thread.participantId);
            return (
              <ChatItem
                key={thread.id}
                avatar={contact?.profilePicture || '/default-avatar.png'}
                name={getUserFullName(contact)}
                lastMessage={thread.lastMessage || ''}
                time={thread.lastMessageTime}
                unreadCount={thread.unreadCount || 0}
                isActive={activeChat === thread.id}
                onClick={() => handleClick(thread.participantId!)}
              />
            );
          })}

        {/* Contacts */}
        {activeMenu === 'contacts' &&
          (allUsers || []).filter(u => u.id !== currentUser?.id).map(user => (
            <ChatItem
              key={user.id}
              avatar={user.profilePicture || '/default-avatar.png'}
              name={getUserFullName(user)}
              lastMessage=""
              time=""
              isActive={activeChat === user.id}
              onClick={() => handleClick(user.id)}
            />
          ))}
      </div>
    </div>
  );
}

export default ChatList;
