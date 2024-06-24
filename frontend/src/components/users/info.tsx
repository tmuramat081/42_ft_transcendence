import { useAuth } from '@/providers/useAuth';
import { useEffect } from 'react';
import Avatar from '@mui/material/Avatar';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function Info() {
  const { loginUser, getCurrentUser, loading } = useAuth();

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        console.log('res: ', res);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [getCurrentUser]);

  if (loading || !loginUser) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <h1>User Info</h1>
      <Avatar
        alt={loginUser.userName}
        src={API_URL + '/api/uploads/' + loginUser.icon}
      />
      <p>Username: {loginUser.userName}</p>
      <p>Email: {loginUser.email}</p>
    </div>
  );
}
