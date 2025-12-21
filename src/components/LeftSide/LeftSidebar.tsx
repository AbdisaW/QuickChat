import { useState } from "react";
import MessageIcon from "../../assets/images/icons/MessageIcon";
import SettingsIcon from "../../assets/images/icons/SettingsIcon";
import LogoutIcon from "../../assets/images/icons/LogoutIcon";
import leftIcon from "../../assets/images/icons/chevron-left.svg";
import "./LeftSidebar.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../store/api/authApi";
import { logout } from "../../store/slices/authSlice";
import { clearChatState } from "../../store/slices/chatSlice";
import type { AppDispatch, RootState } from "../../store/store";

interface LeftSidebarProps {
  setActiveMenu: (menu: "chats" | "contacts" | "settings") => void;
}

function LeftSidebar({ setActiveMenu }: LeftSidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.log("Logout API error (ignored for demo)", e);
    }
    dispatch(clearChatState());
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className={`left-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top-section">
        <div className="top-section-left">
          <h4 className="brand">QuickApp</h4>
          <img
            src={leftIcon}
            className={`left-icon ${collapsed ? "rotated" : ""}`}
            onClick={() => setCollapsed(!collapsed)}
            alt="toggle sidebar"
          />
        </div>
        <hr />

        <div
          className="menu-item"
          onClick={() => setActiveMenu("chats")}
        >
          <MessageIcon color="#20202f" width={15} height={15} />
          <h6>Chats</h6>
        </div>

        <div
          className="menu-item"
          onClick={() => setActiveMenu("contacts")}
        >
          <MessageIcon color="#20202f" width={15} height={15} />
          <h6>Contacts</h6>
        </div>

        <div
          className="menu-item"
          onClick={() => setActiveMenu("settings")}
        >
          <SettingsIcon color="#20202f" width={15} height={15} />
          <h6>Settings</h6>
        </div>
      </div>

      <div className="bottom-section">
        <div className="logout" onClick={handleLogout}>
          <LogoutIcon width={20} height={20} color="red" />
          <h6>Logout</h6>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
