import { AppBar, Box, Container, Typography } from '@mui/material';

const GlobalFooter = () => {
  return (
    <>
      <AppBar
        component="footer"
        position="fixed"
        sx={{
          backgroundColor: 'primary',
          top: 'auto',
          bottom: 0,
          width: '100%',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption">©2024 42 Tokyo</Typography>
          </Box>
        </Container>
      </AppBar>
    </>
  );
};

export default GlobalFooter;
