import { List, ListItem, ListItemText, ListItemAvatar, Typography, Avatar, Alert, AlertTitle, Pagination} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/useAuth';
import { Loading } from '../game/common/Loading';
import { GameRecordWithUserName } from '@/types/game/game';
import { User } from '@/types/user';
import { Friend } from '@/types/game/friend';
import { FriendListItem } from '@/components/users/FriendListItem';

type Proos = {
    user: User | null;
    friends: Friend[];
}

export const FriendList = ({friends, user}: Proos) => {
    const [page, setPage] = useState<number>(1);

    if (!friends || !user) {
        return <Loading />;
    }

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    }

    const take = 5;

    return (
        <>
            <List sx={{ width: '95%', margin: 'auto', height: '310px', overflow: 'auto' }}>
                {/* {user && user.friends && user.friends.map((friend, index) => (
                  // <ListItem key={index}>
                  //   <Link href={`/users/${friend.userName}`}>
                  //   <Avatar alt={friend.userName} src={API_URL + '/api/uploads/' + friend.icon} />
                  //   <ListItemText primary={friend.userName} secondary={`${friend.userName}`} />
                  //   </Link>
                  // </ListItem>
                  <FriendListItem key={index} friend={{userId: friend.userId, userName: friend.userName, icon: friend.icon}} />
                ))} */}
                {friends.slice((page - 1) * take, page * take).map((friend, index) => (
                    <FriendListItem key={index} friend={friend} />
                ))}
            </List>
            <Pagination count={Math.ceil(friends.length / take)} page={page} onChange={handleChange} />
        </>
    )
}