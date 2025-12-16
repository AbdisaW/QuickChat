

import { useState } from "react";
import './SettingsPage.css'
import AccountSettings from "./AccountSettings";
import PersonalizationSettings from "./PersonalizationSettings";

function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");

    return (
        <div className="settings-page">
            <h6 className="chat-header">Settings</h6>

            <div className="settings-tabs">
                <button
                    className={activeTab === "account" ? "active" : ""}
                    onClick={() => setActiveTab("account")}
                >
                    Account
                </button>

                <button
                    className={activeTab === "personalization" ? "active" : ""}
                    onClick={() => setActiveTab("personalization")}
                >
                    Personalization
                </button>
            </div>

            <div className="settings-content">
                {activeTab === "account" && <AccountSettings />}
                {activeTab === "personalization" && <PersonalizationSettings />}
            </div>
        </div>
    );
}

export default SettingsPage;
