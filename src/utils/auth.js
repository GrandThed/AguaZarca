export const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

export const isAdmin = (user) => {
  if (!user || !ADMIN_EMAIL) return false;
  return user.email === ADMIN_EMAIL;
};
