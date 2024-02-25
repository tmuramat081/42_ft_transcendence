import { useAuth } from '@/providers/useAuth';
import { useEffect } from 'react';
import Avatar from '@mui/material/Avatar';

export default function Info() {
  const { loginUser, getCurrentUser, loading } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  if (loading || !loginUser) {
    return <p>loading...</p>
  };

  return (
    <div>
      <h1>User Info</h1>
      <Avatar alt={loginUser.userName} src={'http://localhost:3001/api/uploads/' + loginUser.icon} />
    
      <p>Username: {loginUser.userName}</p>
      <p>Email: {loginUser.email}</p>
    </div>
  );
}