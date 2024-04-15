import { Grid, CircularProgress } from '@mui/material';

type Props = {
    fullSize?: boolean;
};

export const Loading = ({ fullSize = false }: Props) => {

    const height = fullSize ? '100vh' : '100%';

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{width: '100%', height: height}}
        >
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
    );
}