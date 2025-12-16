export interface ChatThread {
  id: string;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string; 
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
  type?: 'private' | 'group';
  isPinned?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: string; 
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  url?: string; 
}

export interface ChatState {
  threads: ChatThread[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}
