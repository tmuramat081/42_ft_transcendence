import { Box } from '@mui/material';

type Props = {
  logs: string[];
};

export default function GameLog({ logs }: Props) {
  return (
    <Box>
      <h4>参加者</h4>
      <h4>ログ</h4>
      <div>
        {logs.map((log, index) => {
          return <p key={index}>{log}</p>;
        })}
      </div>
    </Box>
  );
}
