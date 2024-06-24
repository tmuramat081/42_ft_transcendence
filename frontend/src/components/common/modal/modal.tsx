import { Box, Modal, Typography } from '@mui/material';

export type Props = {
  // 表示・非表示フラグ
  open: boolean;
  // 閉じるハンドラ
  handleClose: () => void;
  // タイトル
  title: string;
  // 子要素
  children: React.ReactNode;
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ModalArea({ open, handleClose, title, children }: Props) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-title"
          variant="h4"
          component="h2"
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Modal>
  );
}
