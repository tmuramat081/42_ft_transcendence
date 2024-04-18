import { Grid, Typography } from '@mui/material';

type GameHeaderProps = {
    left: string | number;
    center: string | number;
    right: string | number;
};

// game中のplayerの名前を表示する

export const GameHeader = ({ left, center, right }: GameHeaderProps) => {
    return (
        <Grid container wrap="nowrap" sx={{pt: 2}}>
            <Grid 
             container
             item
             xs={5}
             direction='row'
             alignItems='center'
             justifyContent='flex-end'
             zeroMinWidth
            >
                <Typography variant='h5' noWrap align='center'>
                    {left}
                </Typography>
            </Grid>
            <Grid 
             container
             item
             xs={2}
             direction='row'
             alignItems='center'
             justifyContent='center'
             >
                <Typography variant='h5' noWrap align='center'>
                    {center}
                </Typography>
            </Grid>
            <Grid
             container
             item
             xs={5}
             direction='row'
             alignItems='center'
             justifyContent='flex-start'
             zeroMinWidth
            >
                <Typography variant='h5' noWrap align='center'>
                    {right}
                </Typography>
            </Grid>

        </Grid>
    )
}