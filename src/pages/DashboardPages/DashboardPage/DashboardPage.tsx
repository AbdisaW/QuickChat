import './Dashboardpage.css';
import LeftSidebar from '../../../components/LeftSide/LeftSidebar';
import ChatList from '../../../components/chat/ChatList';
import ConversationArea from '../../../components/conversation/ConversationArea';
import { useState } from 'react';

function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("chats");

  return (
    <div className="dashboard-page">
      <LeftSidebar setActiveMenu={setActiveMenu} />
      <ChatList activeMenu={activeMenu} />
      <ConversationArea />
    </div>
  );
}

export default DashboardPage;
