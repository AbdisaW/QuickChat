export const getAvatarUrl = (
  userId?: string,
  avatarVersion?: string
) => {
  if (!userId) return '/default-avatar.png';

  return `http://localhost:4000/api/users/${userId}/profile-picture?v=${avatarVersion}`;
};
