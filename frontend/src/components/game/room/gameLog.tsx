import { Box } from '@mui/material';

type Props = {
  users: string[];
  logs: string[];
};

export default function GameLog({ users, logs }: Props) {
  return (
    <Box>
      <h4>参加者</h4>
      <div>
        {users.map((user, index) => {
          return <p key={index}>USER ID: {user}</p>;
        })}
      </div>
      <h4>ログ</h4>
      <div>
        {logs.map((log, index) => {
          return <p key={index}>LOG: {log}</p>;
        })}
      </div>
    </Box>
  );
}
