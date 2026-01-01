import { useRef, useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import InputField from "../ui/Input/InputField";
import { getAvatarUrl } from '../../utils/avatar';

import "./AccountSettings.css";
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useUploadProfilePictureMutation } from "../../store/api/authApi";
import { updateUserProfile } from "../../store/slices/authSlice";

function AccountSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // Local state for controlled inputs
  const [displayName, setDisplayName] = useState(user?.firstName || "");
  const [status, setStatus] = useState(user?.status || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "/default-avatar.png");

  const [uploadProfilePicture] = useUploadProfilePictureMutation();

  useEffect(() => {
    if (user) {
      setDisplayName(user.firstName || "");
      setStatus(user.status || "");
      setProfilePicture(user.profilePicture || "/default-avatar.png");
    }
  }, [user]);


  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await uploadProfilePicture(formData).unwrap();

    dispatch(updateUserProfile({
      profilePicture: res.profilePicture,
      avatarVersion: res.avatarVersion, 
    }));

  } catch (err) {
    console.error("Upload failed:", err);
  }
};



  // Save display name and status
  const handleSave = () => {
    dispatch(updateUserProfile({ firstName: displayName, status }));
  };

  return (
    <div className="account-settings">
      <h6>Profile Information</h6>

      <div className="profile-section">
        <img
          src={getAvatarUrl(user?.id, user?.avatarVersion)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
          className="profile-avatar"
          alt="Profile"
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
        value={user?.email || ""}
        disabled
      />

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}

export default AccountSettings;
