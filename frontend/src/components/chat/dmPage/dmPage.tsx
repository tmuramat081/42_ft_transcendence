/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { UserInfo, UserData, DirectMessage } from '@/types/chat/chat';
import { User } from '@/types/user';
import './dmPage.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function DMPage({ params }: { params: string }) {
  const router = useRouter(); //Backボタンを使うためのrouter
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  // const [userinfo, setUserInfo] = useState<UserData>({
  //   user: {
  //     userId: -1,
  //     userName: '',
  //     icon: '',
  //   },
  //   email: '',
  //   createdAt: '',
  //   name42: '',
  // });
  const [dmLogs, setDMLogs] = useState<DirectMessage[]>([]);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!socket || !params) return;
    // console.log('params:', params);

    getCurrentUser()
      .then((user) => {
        socket.emit('getCurrentUser', user);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
    socket.emit('getRecipient', params);
    // socket.emit('getUserInfo', params);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('currentUser', (currentUser: User) => {
      setSender(currentUser);
    });

    socket.on('recipient', (recipientUser: User) => {
      // const receiver: UserInfo = {
      //   userId: recipient.userId,
      //   userName: recipient.userName,
      //   icon: recipient.icon,
      // };
      setReceiver(recipientUser);
      // console.log('receiver', receiver);
    });

    // socket.on('userInfo', (userData: UserData) => {
    //   setUserInfo(userData);
    // });

    return () => {
      socket.off('currentUser');
      socket.off('recipient');
      // socket.off('userInfo');
    };
  }, [socket, params]);

  // useEffect(() => {
  //   if (!socket) return;
  //   console.log('sender:', sender);
  // }, [sender]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('getDMLogs', { sender: sender, receiver: receiver });
  }, [sender, receiver, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('dmLogs', (directMessages: DirectMessage[]) => {
      console.log('Received DMLogs from server:', directMessages);
      setDMLogs(directMessages);
    });

    return () => {
      socket.off('dmLogs');
    };
  }, [socket, dmLogs]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    console.log(`${sender} submitting DM to ${receiver}: ${message}`);
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message, socket]);

  const handleBlockUser = useCallback(() => {
    if (!socket) return;
    if (blocked) {
      console.log(`${sender} unblocking ${receiver}`);
      socket.emit('unblockUser', { sender: sender, receiver: receiver });
      setBlocked(false);
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    } else {
      console.log(`${sender} blocking ${receiver}`);
      socket.emit('blockUser', { sender: sender, receiver: receiver });
      setBlocked(true);
      setDMLogs([]);
    }
  }, [sender, receiver, socket, blocked]);

  return (
    <div className="dm-container">
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
            className={`message-bubble ${message.sender === sender ? 'self' : 'other'}`}
          >
            <Avatar
              src={`${API_URL}/api/uploads/${
                message.sender === sender ? sender.icon : receiver?.icon
              }`}
              alt="User Icon"
              className="icon"
              sx={{ width: 35, height: 35 }}
            ></Avatar>
            <div>
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
