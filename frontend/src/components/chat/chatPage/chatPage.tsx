/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Avatar } from '@mui/material';
import Notification from './Notification';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { UserInfo, ChatMessage, Room } from '@/types/chat/chat';
import { User } from '@/types/user';
import './chatPage.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function ChatPage() {
  const router = useRouter();
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [newRoomName, setNewRoomName] = useState('');
  const [roomList, setRoomList] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [LoginUser, setLoginUser] = useState<User | null>(null);

  useEffect(() => {
    if (!socket) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getLoginUser', user);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const intervalId = setInterval(() => {
      const updateUserStatus = () => {
        fetch(`${API_URL}/users/me`, {
          method: 'GET',
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((user) => {
            // サーバーから取得したユーザー情報を使って onlineUsers を更新する
            setOnlineUsers((prevOnlineUsers) => {
              // ログアウトしたユーザーを onlineUsers から削除する
              const updatedOnlineUsers = prevOnlineUsers.filter(
                (onlineUser) => onlineUser.userId !== user.userId,
              );
              return updatedOnlineUsers;
            });
          })
          .catch((error) => {
            console.error('Error getting user data:', error);
          });
      };
    }, 60000); // 60秒ごとに呼び出す

    return () => {
      clearInterval(intervalId); // アンマウント時にクリア
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('getRoomList', LoginUser);
    socket.emit('getOnlineUsers', LoginUser);

    return () => {
      socket.off('getRoomList');
      socket.off('getOnlineUsers');
    };
  }, [LoginUser]);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomList', (rooms: Room[]) => {
      const roomNames = rooms.map((room) => room.roomName);
      setRoomList(roomNames);
    });

    socket.on('onlineUsers', (users: UserInfo[]) => {
      setOnlineUsers(users);
    });

    socket.on('loginUser', (LoginUser: User) => {
      setLoginUser(LoginUser);
    });

    socket.on('roomError', (error) => {
      console.error(error);
    });

    return () => {
      socket.off('roomList');
      socket.off('onlineUsers');
      socket.off('loginUser');
      socket.off('roomError');
    };
  }, [socket, LoginUser]);

  const onClickCreateRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('createRoom', { LoginUser, roomName: newRoomName });
    setNewRoomName('');
  }, [LoginUser, newRoomName, socket]);

  const handleLinkClick = (recipient: UserInfo) => {
    if (!socket) return;
    const href = `/chat/${recipient.userName}?recipient=${JSON.stringify(recipient)}`;
    const as = `/chat/${recipient.userName}`;
    router.push(href);
    router.push(as);
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/room/${roomId}`); // roomPageへの遷移
  };

  // 通知を閉じる関数
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="chat-container">
      {/* 戻るボタン */}
      <div className="back-button">
        <button
          onClick={() => {
            router.back();
          }}
        >
          Back
        </button>
      </div>
      {/* 通知があれば表示 */}
      {notification && (
        <Notification
          message={notification}
          onClose={closeNotification}
        />
      )}
      {/* ログイン中の参加者リスト */}
      <div className="onlineusers">
        <h2>Logined friends</h2>
        <div className="onlineusers-icons">
          {onlineUsers.map((onlineUser, index) => (
            <div
              key={index}
              className="onlineuser"
            >
              {/* アイコンとクリックハンドラーをラップする */}
              <button
                className="onlineuser-wrapper"
                onClick={() => handleLinkClick(onlineUser)}
                style={{
                  border: 'none', // 枠線を削除
                  background: 'none', // 背景を削除
                  padding: 0, // パディングを削除
                  cursor: 'pointer',
                }}
              >
                {/* アイコン */}
                <Avatar
                  src={`${API_URL}/api/uploads/${onlineUser?.icon}`}
                  alt={onlineUser.userName}
                  className="onlineusers-icon"
                  sx={{ width: 50, height: 50 }}
                >
                  {onlineUser.icon}
                </Avatar>
              </button>
              {/* ユーザー名*/}
              <div className="onlineuser-info">
                <div className="onlineuser-name">{onlineUser.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 新しいチャットグループの作成UI */}
      <div>
        <input
          type="text"
          placeholder="Enter new room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={onClickCreateRoom}>Create Room</button>
        {/* ルーム一覧 */}
        <div>
          <h2>Room List</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {roomList.map((roomId) => (
              <li
                key={`room_${roomId}`}
                style={{ cursor: 'pointer', paddingLeft: '0.5em', marginBottom: '0.5em' }}
                onClick={() => handleRoomClick(roomId)}
              >
                <div>{`#${roomId}`}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
