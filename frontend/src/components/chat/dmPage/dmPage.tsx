/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { UserInfo, UserData, DirectMessage } from '@/types/chat/chat';
import { User } from '@/types/user';
import './dmPage.css';

export default function DMPage({ params }: { params: string }) {
  const router = useRouter(); //Backボタンを使うためのrouter
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<UserInfo>({ userId: 0, userName: '', icon: '' });
  const [receiver, setReceiver] = useState<UserInfo>({ userId: 0, userName: '', icon: '' });
  const [userinfo, setUserInfo] = useState<UserData>({
    user: {
      userId: -1,
      userName: '',
      icon: '',
    },
    email: '',
    createdAt: '',
    name42: '',
  });
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
    socket.emit('getUserInfo', params);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('currentUser', (user: UserInfo) => {
      setSender(user);
    });

    socket.on('recipient', (recipient: UserInfo) => {
      const receiver: UserInfo = {
        userId: recipient.userId,
        userName: recipient.userName,
        icon: recipient.icon,
      };
      setReceiver(receiver);
      console.log('receiver', receiver);
    });

    socket.on('userInfo', (userData: UserData) => {
      setUserInfo(userData);
    });

    return () => {
      socket.off('currentUser');
      socket.off('recipient');
      socket.off('userInfo');
    };
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;
    console.log('sender:', sender);
  }, [sender]);

  useEffect(() => {
    if (!socket) return;
    if (sender.userName && receiver.userName) {
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    }
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
    console.log(`${sender.userName} submitting DM to ${receiver.userName}: ${message}`);
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message, socket]);

  const handleBlockUser = useCallback(() => {
    if (!socket) return;
    if (blocked) {
      console.log(`${sender.userName} unblocking ${receiver.userName}`);
      socket.emit('unblockUser', { sender: sender, receiver: receiver });
      setBlocked(false);
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    } else {
      console.log(`${sender.userName} blocking ${receiver.userName}`);
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
          <h4>{receiver.userName}</h4>
          <Image
            src={receiver.icon || ''}
            alt={receiver.userName || ''}
            className="recipient-icon"
            width={50}
            height={50}
          />
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
          <p>Email: {userinfo.email}</p>
          <p>Created At: {userinfo.createdAt}</p>
          <p>42 Name: {userinfo.name42}</p>
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
            className={`message-bubble ${message.sender === sender.userName ? 'self' : 'other'}`}
          >
            <Image
              src={message.sender === sender.userName ? sender.icon : receiver.icon}
              alt="User Icon"
              className="icon"
              width={50}
              height={50}
            />
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
