/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import { Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { DirectMessage } from '@/types/chat/chat';
import { User } from '@/types/user';
import './dmPage.css';
import { Invitation } from '@/types/game/game';
import { useSocketStore } from '@/store/game/clientSocket';
import { useInvitedFriendStrore } from '@/store/game/invitedFriendState';
import { Friend } from '@/types/game/friend';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const BLOCKED_USER_KEY = 'blockedUser';

export default function DMPage({ params }: { params: string }) {
  const router = useRouter(); //Backボタンを使うためのrouter
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [dmLogs, setDMLogs] = useState<DirectMessage[]>([]);
  const [blocked, setBlocked] = useState(false);
  const { socket: gameSocket } = useSocketStore();
  const { invitedFriendState } = useInvitedFriendStrore();
  const updateInvitedFriendState = useInvitedFriendStrore(
    (state) => state.updateInvitedFriendState,
  );
  const [errorMessage, setErrorMessages] = useState<string>('');

  useEffect(() => {
    if (!socket || !params) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getCurrentUser', user);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
    socket.emit('getRecipient', params);
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('currentUser', (currentUser: User) => {
      setSender(currentUser);
    });

    socket.on('recipient', (recipientUser: User) => {
      setReceiver(recipientUser);
    });

    socket.on('joinDMRoomConfirmation', () => {
      // console.log('Joined DM Room');
    });

    socket.on('leaveDMRoomConfirmation', () => {
      // console.log('Left DM Room');
    });

    const blockedUsers = JSON.parse(localStorage.getItem(BLOCKED_USER_KEY) || '[]');
    setBlocked(blockedUsers.includes(receiver?.userId || -1));

    socket.on('blockedUsers', (blockedUsers: number[]) => {
      // console.log('blockedUsers:', blockedUsers);
      if (blockedUsers.includes(receiver?.userId || -1)) {
        setBlocked(true);
        setDMLogs([]);
      } else {
        setBlocked(false);
      }
    });

    return () => {
      socket.off('currentUser');
      socket.off('recipient');
      socket.off('joinDMRoomConfirmation');
      socket.off('leaveDMRoomConfirmation');
      socket.off('blockedUsers');
    };
  }, [socket, receiver]);

  useEffect(() => {
    // console.log('sender:', sender);
    // console.log('receiver:', receiver);
    if (!socket || !sender || !receiver) return;
    socket.emit('joinDMRoom', { sender: sender, receiver: receiver });
    socket.emit('getBlockedUsers', sender);

    return () => {
      socket.emit('leaveDMRoom', { sender: sender, receiver: receiver });
    };
  }, [sender, receiver]);

  useEffect(() => {
    if (!socket || !sender || !receiver || blocked) return;
    if (!blocked) socket.emit('getDMLogs', { sender: sender, receiver: receiver });
  }, [sender, receiver, socket, blocked]);

  useEffect(() => {
    if (!socket || blocked || !receiver || !loginUser) return;
    socket.on('dmLogs', (directMessages: DirectMessage[]) => {
      // directMessagesのtextが'Game Invitation'の場合、各メッセージにゲームへのリンクを追加する
      const modifiedMessages = directMessages.map((message) => {
        if (message.text === 'Game Invitation') {
          return {
            ...message,
            text: (
              <>
                Game Invitation
                <button onClick={handleGoToGame}>Go to Game</button>
                {/* <button onClick={handleJoinClick({userId: receiver.userId, userName: receiver.userName, icon: receiver.icon })}>Go to Game</button> */}
              </>
            ),
          };
        }
        return message;
      });
      if (!blocked) {
        setDMLogs(modifiedMessages as DirectMessage[]);
      }
    });

    return () => {
      socket.off('dmLogs');
    };
  }, [socket, blocked, loginUser, receiver]);

  const onClickSubmit = useCallback(() => {
    if (!socket || blocked) return;
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message, socket, blocked]);

  const handleBlockUser = useCallback(() => {
    if (!socket) return;
    const blockedUsers = JSON.parse(localStorage.getItem(BLOCKED_USER_KEY) || '[]');
    if (blocked) {
      const index = blockedUsers.indexOf(receiver?.userId || -1);
      if (index !== -1) {
        blockedUsers.splice(index, 1);
        localStorage.setItem(BLOCKED_USER_KEY, JSON.stringify(blockedUsers));
      }
      socket.emit('unblockUser', { sender: sender, receiver: receiver });
      setBlocked(false);
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    } else {
      blockedUsers.push(receiver?.userId || -1);
      localStorage.setItem(BLOCKED_USER_KEY, JSON.stringify(blockedUsers));
      socket.emit('blockUser', { sender: sender, receiver: receiver });
      setBlocked(true);
      setDMLogs([]);
    }
  }, [sender, receiver, socket, blocked]);

  const onClickInviteGame = useCallback(() => {
    if (!socket || blocked || !loginUser || !receiver) return;

    // ゲーム招待メッセージを送信
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: 'Game Invitation' });
    console.log(`${sender?.userName} sent Game Invitation to ${receiver?.userName}`);

    // maoyagi ver
    const invitation: Invitation = {
      guestId: receiver.userId,
      hostId: loginUser.userId,
    };
    gameSocket.emit('inviteFriend', invitation, (res: boolean) => {
      if (res) {
        console.log('Invited friend');
        updateInvitedFriendState({ friendId: receiver.userId });
        router.push('/game/index');
      } else {
        console.error('Failed to invite friend');
      }
    });
  }, [socket, sender, receiver]);

  // 招待を受け入れる
  const handleJoinClick = useCallback(
    (friend: Friend) => {
      // console.log(friend)
      if (loginUser && socket) {
        const match: Invitation = {
          guestId: loginUser.userId,
          hostId: friend.userId,
        };
        // console.log(match)
        socket.emit('acceptInvitation', match, (res: boolean) => {
          if (!res) {
            // error表示
            //setOpenDialogError(true);
            console.error('Failed to accept invitation');
          }
        });
      }
    },
    [loginUser, socket, receiver],
  );

  const handleGoToGame = () => {
    if (!loginUser || !receiver || !socket) return;

    const match: Invitation = {
      guestId: loginUser.userId,
      hostId: receiver.userId,
    };
    // console.log(match)
    socket.emit('acceptInvitation', match, (res: boolean) => {
      if (!res) {
        // error表示
        //setOpenDialogError(true);
        console.error('Failed to accept invitation');
      }
    });
    router.push('/game/index');
  };

  // console.log(sender)
  // console.log(receiver)

  return (
    <div className="dm-container">
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* Backボタン */}
      <div className="back-button">
        <button
          onClick={() => {
            router.back();
          }}
        >
          Back
        </button>
      </div>
      {/* DM 相手の情報 */}
      <div className="recipient-info">
        <div className="user">
          <h4>{receiver?.userName}</h4>
          <Avatar
            src={`${API_URL}/api/uploads/${receiver?.icon}`}
            alt={receiver?.userName || ''}
            className="recipient-icon"
            sx={{ width: 50, height: 50 }}
          >
            {receiver?.icon}
          </Avatar>
          {/* ブロックボタン */}
          <button
            className="block-button"
            onClick={handleBlockUser}
          >
            {blocked ? 'Unblock' : 'Block'}
          </button>
          {/* Invite Game ボタン */}
          <button
            className="invite-button"
            onClick={onClickInviteGame}
          >
            Invite Game
          </button>
        </div>
        {/* ユーザーの追加情報 */}
        <div className="user-info">
          <p>Email: {receiver?.email}</p>
          <p>Created At: {receiver?.createdAt?.toString()}</p>
          <p>42 Name: {receiver?.name42}</p>
        </div>
      </div>
      {/* DM 履歴 */}
      <div
        className="dm-messages"
        style={{ overflowY: 'auto', maxHeight: '400px' }}
      >
        {dmLogs.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.senderId === sender?.userId ? 'self' : 'other'}`}
          >
            <Avatar
              src={`${API_URL}/api/uploads/${
                message.senderId === sender?.userId ? sender.icon : receiver?.icon
              }`}
              alt={message.senderId === sender?.userId ? sender.userName : receiver?.userName}
              className="icon"
              sx={{ width: 35, height: 35 }}
            ></Avatar>
            <div>
              <div>{message.senderId}</div>
              <div>{message.text}</div>
              <div className="timestamp">{message.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
      {/* DM 入力欄 */}
      <div className="dm-input">
        <input
          id="message"
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button onClick={onClickSubmit}>Send</button>
      </div>
    </div>
  );
}
