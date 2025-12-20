import { useRef } from "react";

import { useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import InputField from "../ui/Input/InputField";
import "./AccountSettings.css"
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useUploadProfilePictureMutation } from '../../store/api/authApi';

import { updateUserProfile } from "../../store/slices/authSlice";
function AccountSettings() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    const [displayName, setDisplayName] = useState("");
    const [status, setStatus] = useState("");
    const [uploadProfilePicture] = useUploadProfilePictureMutation();


    useEffect(() => {
        if (user) {
            setDisplayName(user.name);
            setStatus(user.status || "");
        }
    }, [user]);

    const handleCameraClick = () => {
        fileInputRef.current?.click(); // trigger file input click
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await uploadProfilePicture(formData).unwrap();
            dispatch(updateUserProfile({ avatar: response.fileUrl }));
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const handleSave = () => {
        dispatch(updateUserProfile({ name: displayName, status }));
    };
    return (
        <div className="account-settings">
            <h6>Profile Information</h6>

            <div className="profile-section">
                <img
                    src={user?.avatar || "/default-avatar.png"}
                    className="profile-avatar"
                />
                <button className="camera-btn" onClick={handleCameraClick}>
                    📸
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </button>

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