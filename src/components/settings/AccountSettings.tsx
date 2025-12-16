import { useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import InputField from "../ui/Input/InputField";
import "./AccountSettings.css"
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../store/slices/authSlice";
function AccountSettings() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    const [displayName, setDisplayName] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (user) {
            setDisplayName(user.name);
            setStatus(user.status || "");
        }
    }, [user]);

    const handleSave = () => {
        dispatch(updateUserProfile({ name: displayName, status }));
    };
    return (
        <div className="account-settings">
            <h6>Profile Information</h6>

            <div className="profile-section">
                <img
                    src={user?.avatar}
                    className="profile-avatar"
                />
                <button className="camera-btn">📸</button>
                <p>Click the camera icon to change your profile picture</p>
            </div>

            <InputField
                label="Display Name"
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />

            <InputField
                label="Status"
                id="status"
                type="text"
                placeholder="Available"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            />

            <InputField
                label="Email"
                id="email"
                type="text"
                value={user?.email}
                disabled
            />


            <Button onClick={handleSave}>Save Changes</Button>
        </div>


    );

}

export default AccountSettings;