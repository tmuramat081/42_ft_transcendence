// inviteの通知がでない
// ゲーム参加のリンクを追加

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
  const [message, setMessage] = useState('');
  const [roomID, setRoomID] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [roomList, setRoomList] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomchatLogs, setRoomChatLogs] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [isDeleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [invitees, setInvitees] = useState<UserInfo[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
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
      getCurrentUser()
        .then((user) => {
          // if (!user) {
          //   // 取得できなかった場合はloginUsersから削除
          //   socket.emit('logoutUser', LoginUser);
          //   setLoginUser(null);
          // }
          socket.emit('getOnlineUsers', user);
        })
        .catch((error) => {
          console.error('Error getting user:', error);
        });
    }, 60000); // 60秒ごとにgetCurrentUserを呼び出す

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

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      setParticipants(roomParticipants);
    });

    socket.on('roomInvitation', (invitationData) => {
      setNotification(
        `${invitationData.sender.userName} invited you to join ${invitationData.room}`,
      );
    });

    // socket.on('gameInvitation', (sender: User) => {
    //   setNotification(`${sender.sender.userName} invited you to play Game`);
    // });

    socket.on('gameInvitation', (data: { sender: User; invitee: UserInfo }) => {
      console.log('gameInvitation:', data);
      console.log('LoginUser:', LoginUser?.userId);
      console.log('invitee:', data.data.invitee.userId);
      if (data.data.invitee.userId === LoginUser?.userId) {
        setNotification(`${data.data.sender.userName} invited you to play Game`);
      }
    });

    socket.on('newDM', (LoginUser: User) => {
      setNotification(`${LoginUser.userName} sent you a new message`);
    });

    socket.on('roomError', (error) => {
      console.error(error);
    });

    return () => {
      socket.off('roomList');
      socket.off('onlineUsers');
      socket.off('loginUser');
      socket.off('roomParticipants');
      socket.off('roomInvitation');
      socket.off('gameInvitation');
      socket.off('newDM');
      socket.off('roomError');
    };
  }, [socket, getCurrentUser, participants]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      setRoomChatLogs((prevRoomChatLogs) => ({ ...prevRoomChatLogs, [roomID]: chatMessages }));
    });

    return () => {
      socket.off('chatLogs');
    };
  }, [roomID, roomchatLogs, socket]);

  useEffect(() => {
    console.log('Notification:', notification);
  }, [notification]);

  useEffect(() => {
    console.log('LoginUser', LoginUser);
  }, [LoginUser]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    socket.emit('talk', { selectedRoom, loginUser, message });
    setMessage('');
  }, [selectedRoom, LoginUser, message, socket]);

  const onClickCreateRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('createRoom', { LoginUser, roomName: newRoomName });
    setNewRoomName('');
    setSelectedRoom('');
  }, [LoginUser, newRoomName, socket]);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!socket) return;
    const newRoomID = event.target.value;
    //newRoomIDがnullだった場合の処理
    if (newRoomID === '') {
      console.log('newRoomID is null');
      setRoomID('');
      setMessage('');
      setDeleteButtonVisible(false);
      socket.emit('leaveRoom', { LoginUser, room: selectedRoom });
      return;
    }
    setRoomID(newRoomID);
    setSelectedRoom(roomList[Number(newRoomID)]);
    setMessage(''); // ルームが変更されたら新しいメッセージもリセット
    setDeleteButtonVisible(true);
    socket.emit('joinRoom', { loginUser, room: roomList[Number(newRoomID)] });
  };

  const onClickLeaveRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('leaveRoom', { LoginUser, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false);
      setMessage('');
      setRoomID('');
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
    }
  }, [selectedRoom, roomchatLogs, LoginUser, socket]);

  const onClickDeleteRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('deleteRoom', { LoginUser, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false);
      setParticipants([]);
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
      // ルームリストから削除する
      const newRoomList = roomList.filter((room) => room !== selectedRoom);
      setRoomList(newRoomList);
    }
  }, [selectedRoom, roomList, LoginUser, roomchatLogs, socket]);

  const handleLinkClick = (recipient: UserInfo) => {
    if (!socket) return;
    const href = `/chat/${recipient.userName}?recipient=${JSON.stringify(recipient)}`;
    const as = `/chat/${recipient.userName}`;
    router.push(href);
    router.push(as);
  };

  const onClickInviteGame = useCallback(() => {
    if (!socket || invitees.length === 0) return;
    // 選択された全てのユーザーを招待する
    invitees.forEach((invitee) => {
      socket.emit('inviteToGame', { LoginUser, invitee });
    });
    setNotification(
      `you invited users to play Game: ${invitees.map((invitee) => invitee.userName).join(', ')}`,
    );
    setInvitees([]);
  }, [LoginUser, selectedGame, invitees, socket]);

  const onClickInviteRoom = useCallback(() => {
    if (!socket || !selectedRoom || invitees.length === 0) return;
    // 選択された全てのユーザーを招待する
    invitees.forEach((invitee) => {
      socket.emit('inviteToRoom', { LoginUser, room: selectedRoom, invitee });
    });
    setNotification(
      `you invited users to ${selectedRoom}: ${invitees
        .map((invitee) => invitee.userName)
        .join(', ')}`,
    );
    setInvitees([]);
  }, [LoginUser, selectedRoom, invitees, socket]);

  const handleCheckboxChange = (user: UserInfo) => {
    // チェックされたユーザーを追加または削除する
    if (invitees.some((invitee) => invitee.userId === user.userId)) {
      setInvitees(invitees.filter((invitee) => invitee.userId !== user.userId));
    } else {
      setInvitees([...invitees, user]);
    }
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
        <h4>Logined friends</h4>
        <div className="onlineusers-icons">
          {onlineUsers.map((onlineUser, index) => (
            <div
              key={index}
              className="onlineuser"
            >
              {/* アイコンとチェックボックスをラップする */}
              <div className="onlineuser-wrapper">
                <input
                  type="checkbox"
                  id={`user_${index}`}
                  checked={invitees.some((invitee) => invitee.userId === onlineUser.userId)}
                  onChange={() => handleCheckboxChange(onlineUser)}
                />
                {/* アイコンとクリックハンドラーをラップする */}
                <button
                  className="onlineuser-wrapper"
                  onClick={() => handleLinkClick(onlineUser)}
                  style={{
                    border: 'none', // 枠線を削除
                    background: 'none', // 背景を削除
                    padding: 0, // パディングを削除
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
              </div>
              {/* ユーザー名とDMボタン */}
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
      </div>
      <div className="chat-room-selector-wrapper">
        {/* チャットグループの選択UI */}
        <div className="chat-room-selector">
          <select
            onChange={(event) => {
              handleRoomChange(event);
            }}
            value={roomID}
          >
            <option value="">Select Room</option>
            {Object.entries(roomList).map(([roomId, roomName]) => (
              <option
                key={`room_${roomId}`}
                value={roomId}
              >
                {roomName}
              </option>
            ))}
          </select>
          {/* Invite Game ボタン */}
          <button
            className="btn-small"
            onClick={onClickInviteGame}
          >
            Invite Game
          </button>
          {/* Invite Room ボタン */}
          {isDeleteButtonVisible && (
            <button
              className="btn-small"
              onClick={onClickInviteRoom}
            >
              Invite Room
            </button>
          )}
          {/* Leave Room ボタン */}
          {isDeleteButtonVisible && (
            <button
              className="btn-small"
              onClick={onClickLeaveRoom}
            >
              Leave Room
            </button>
          )}
          {/* Delete Room ボタン */}
          {isDeleteButtonVisible && (
            <button
              className="btn-small"
              onClick={onClickDeleteRoom}
            >
              Delete Room
            </button>
          )}
        </div>
      </div>
      {/* ROOM参加者リスト */}
      {isDeleteButtonVisible && (
        <div className="participants">
          {/* <h4>Room friends</h4> */}
          <div className="participant-icons">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="participant"
              >
                <Avatar
                  src={`${API_URL}/api/uploads/${participant.icon}`}
                  alt={participant.userName}
                  className="participant-icon"
                  sx={{ width: 50, height: 50 }}
                >
                  {participant.icon}
                </Avatar>
                <div className="participant-name">{participant.userName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* チャット入力欄 */}
      {isDeleteButtonVisible && (
        <div className="chat-input">
          <input
            id="message"
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button onClick={onClickSubmit}>Send</button>
        </div>
      )}
      {/* チャットログ */}
      {isDeleteButtonVisible && (
        <div
          className="chat-messages"
          style={{ overflowY: 'auto', maxHeight: '300px' }}
        >
          {roomchatLogs[roomID]?.map((message, index) => (
            <div
              key={index}
              className={`message-bubble ${
                message.user === LoginUser?.userName ? 'self' : 'other'
              }`}
            >
              <Avatar
                src={`${API_URL}/api/uploads/${message.photo}`}
                alt="User Icon"
                className="icon"
                sx={{ width: 35, height: 35 }}
              >
                {message.photo}
              </Avatar>
              <div>
                <div>{message.text}</div>
                <div className="timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
