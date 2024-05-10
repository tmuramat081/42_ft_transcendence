import { List, ListItem, ListItemText, ListItemAvatar, Typography, Avatar, Alert, AlertTitle, Pagination} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/useAuth';
import { Loading } from '../common/Loading';
import { GameRecordWithUserName } from '@/types/game/game';
import { User } from '@/types/user';

type Props = {
    //userId: number;
    user: User | null;
    records: GameRecordWithUserName[] | undefined;
};

export const History = ({user, records}: Props) => {
    //const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<number>(1);

    if (!records || !user) {
        return <Loading />;
    }

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const take = 5;

    return (
        <>
        <List sx={{ width: '95%', margin: 'auto', height: '310px', overflow: 'auto' }}>
            {records.slice((page - 1) * take, page * take).map((record, index) => (
                <ListItem key={index} sx={{ border: '1px solid' }} >
                    <ListItemText primary={user.userName} primaryTypographyProps={{ variant: 'h6', align: 'center', style: {overflow: 'hidden'}}} sx={{width: '30%'}} />
                        {record.winnerName === user.userName ? (
                            <>
                                <ListItemAvatar>
                                    <Avatar  sx={{bgcolor: 'success.main', margin: 'auto'}} variant='rounded'>
                                        {record.winnerScore}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemAvatar>
                                    <Avatar  sx={{bgcolor: 'error.main', margin: 'auto'}} variant='rounded'>
                                        {record.loserScore}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={record.loserName} primaryTypographyProps={{ variant: 'h6', align: 'center', style: {overflow: 'hidden'}}} sx={{width: '30%'}} />
                            </>
                        ) : (
                            <>
                                <ListItemAvatar>
                                    <Avatar  sx={{bgcolor: 'error.main', margin: 'auto'}} variant='rounded'>
                                        {record.loserScore}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemAvatar>
                                    <Avatar  sx={{bgcolor: 'success.main', margin: 'auto'}} variant='rounded'>
                                        {record.winnerScore}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={record.winnerName} primaryTypographyProps={{ variant: 'h6', align: 'center', style: {overflow: 'hidden'}}} sx={{width: '30%'}} />
                            </>
                        )}
                </ListItem>
            ))}
        </List>
        <Pagination count={Math.ceil(records.length / take)} page={page} onChange={handleChange} sx={{display: 'flex', justifyContent: 'center', textAlign: 'center'}} />
        </>
    )
};