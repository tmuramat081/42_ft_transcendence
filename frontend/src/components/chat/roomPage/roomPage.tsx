/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Avatar from '@mui/material/Avatar';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { UserInfo, ChatMessage, Room } from '@/types/chat/chat';
import { User } from '@/types/user';
import './roomPage.css';
import RoomSettingsModal from './RoomSettingsModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function RoomPage({ params }: { params: string }) {
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [message, setMessage] = useState('');
  const [roomID, setRoomID] = useState('');
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomchatLogs, setRoomChatLogs] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!socket || !params) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getUserCurrent', user);
        socket.emit('joinRoom', { user, room: params });
        socket.emit('getAllUsers', user);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
    setSelectedRoom(params);
    // socket.emit('getParticipants', params);
    // socket.emit('getChatLogs', params);
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user', (user: User) => {
      setCurrentUser(user);
      //   console.log('user', user.userName);
    });

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      setParticipants(roomParticipants);
    });

    socket.on('owner', (owner: boolean) => {
      setIsOwner(owner);
      //   console.log('owner', owner);
    });

    socket.on('admin', (admin: boolean) => {
      setIsAdmin(admin);
      //   console.log('admin', admin);
    });

    socket.on('allUsers', (users: User[]) => {
      setAllUsers(users);
    });

    return () => {
      socket.off('user');
      socket.off('roomParticipants');
      socket.off('owner');
      socket.off('admin');
      socket.off('allUsers');
    };
  }, [socket, participants]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      setRoomChatLogs((prevRoomChatLogs) => ({ ...prevRoomChatLogs, [roomID]: chatMessages }));
    });

    return () => {
      socket.off('chatLogs');
    };
  }, [socket, roomchatLogs, roomID]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    socket.emit('talk', { selectedRoom, currentUser, message });
    setMessage('');
  }, [selectedRoom, message, socket, currentUser]);

  const onClickLeaveRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('leaveRoom', { user: currentUser, room: selectedRoom });
      setSelectedRoom(null);
      setMessage('');
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
      // chatページに戻る
      window.location.href = '/chat';
    }
  }, [selectedRoom, roomchatLogs, currentUser, socket]);

  const onClickDeleteRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('deleteRoom', { user: currentUser, room: selectedRoom });
      setSelectedRoom(null);
      setParticipants([]);
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
      // chatページに戻る
      window.location.href = '/chat';
    }
  }, [selectedRoom, currentUser, roomchatLogs, socket]);

  const onClickSettingRoom = useCallback(() => {
    setShowRoomSettings(true);
  }, []);

  const handleRoomSettingsSubmit = (roomSettings: Room) => {
    if (!socket) return;
    socket.emit('updateRoom', { currentUser, roomSettings });
    setShowRoomSettings(false);
  };

  return (
    <div className="room-container">
      {/* wrapper */}
      <div className="room-wrapper">
        <h2 className="room-title">{selectedRoom}</h2>
        {/* Leave Room ボタン */}
        <button
          className="btn-small"
          onClick={onClickLeaveRoom}
        >
          Leave Room
        </button>
        {/* Delete Room ボタン */}
        {isOwner && (
          <button
            className="btn-small"
            onClick={onClickDeleteRoom}
          >
            Delete Room
          </button>
        )}
        {/* Room Settingsボタン */}
        {(isOwner || isAdmin) && (
          <button
            className="btn-small"
            onClick={onClickSettingRoom}
          >
            Room Settings
          </button>
        )}
      </div>
      {/* ルーム設定ウインドウの表示 */}
      {showRoomSettings && (
        <RoomSettingsModal
          onClose={() => setShowRoomSettings(false)}
          onSubmit={handleRoomSettingsSubmit}
          roomParticipants={participants}
          allUsers={allUsers}
          currentUser={currentUser as User}
        />
      )}
      {/* ROOM参加者リスト */}
      <div className="participants">
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
      {/* チャット入力欄 */}
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
      {/* チャットログ */}
      <div className="chat-messages">
        {roomchatLogs[roomID]?.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${
              message.user === currentUser?.userName ? 'self' : 'other'
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
    </div>
  );
}
