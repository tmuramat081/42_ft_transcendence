import { AppBar, Box, Link, Toolbar } from '@mui/material';

const GlobalHeader = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'primary',
          top: 0,
          width: '100%',
        }}
      >
        <Toolbar>
          <Link
            href="/"
            color="secondary"
            variant="h6"
          >
            Ping-Pong!
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default GlobalHeader;
