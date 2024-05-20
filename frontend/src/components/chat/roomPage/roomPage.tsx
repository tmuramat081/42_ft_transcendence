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
  const [owner, setOwner] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isParticipants, setIsParticipants] = useState(false);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    if (!socket || !params) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getUserCurrent', user);
        socket.emit('getAllUsers', user);
        socket.emit('getRoomInfo', params);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
    setSelectedRoom(params);
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user', (user: User) => {
      setCurrentUser(user);
    });

    socket.on('allUsers', (users: User[]) => {
      setAllUsers(users);
    });

    socket.on('roomName', (roomName: string) => {
      setSelectedRoom(roomName);
    });

    socket.on('roomType', (roomType: string) => {
      setRoomType(roomType);
    });

    socket.on('roomOwner', (roomOwner: User) => {
      setOwner(roomOwner);
      if (currentUser?.userId === roomOwner.userId) {
        setIsOwner(true);
      }
    });

    socket.on('roomAdmin', (roomAdmin: User) => {
      setAdmin(roomAdmin);
      if (currentUser?.userId === roomAdmin.userId) {
        setIsAdmin(true);
      }
    });

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      setParticipants(roomParticipants);
      // Participantsの中にcurrentUserがいるかどうかを確認
      const isCurrentUserParticipant = roomParticipants.some(
        (participant) => participant.userId === currentUser?.userId,
      );
      setIsParticipants(isCurrentUserParticipant);
    });

    socket.on('passwordVerified', (response: boolean) => {
      setIsPasswordVerified(response);
      if (!response) {
        alert('Incorrect password');
      }
      if (response) {
        socket.emit('joinRoom', { user: currentUser, room: selectedRoom });
      }
    });

    socket.on('permissionRequested', (user: User) => {
      alert('Permission requested by ' + user.userName);
    });

    socket.on('permissionGranted', (user: User) => {
      setIsPermissionGranted(true);
      alert('Permission granted to ' + user.userName);
      socket.emit('joinRoom', { user: currentUser, room: selectedRoom });
    });

    return () => {
      socket.off('user');
      socket.off('allUsers');
      socket.off('roomType');
      socket.off('roomOwner');
      socket.off('roomAdmin');
      socket.off('roomParticipants');
      socket.off('passwordVerified');
      socket.off('permissionRequested');
      socket.off('permissionGranted');
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (!socket) return;
    if (roomType === 'public') {
      socket.emit('joinRoom', { user: currentUser, room: selectedRoom });
    }
  }, [socket, roomType, currentUser, selectedRoom]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      // textが'requested permission'の場合、各メッセージにOKリンクを追加する
      const updatedChatMessages = chatMessages.map((message) => {
        if (message.text === 'requested permission') {
          return {
            ...message,
            text: (
              <>
                permission requested
                <button onClick={handleRequestOK}>OK</button>
              </>
            ),
          };
        }
        return message;
      });
      setRoomChatLogs((prevRoomChatLogs) => ({
        ...prevRoomChatLogs,
        [roomID]: updatedChatMessages as ChatMessage[],
      }));
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
    socket.emit('roomSettings', { selectedRoom, roomSettings });
    setShowRoomSettings(false);
  };

  const handlePasswordSubmit = () => {
    if (!socket) return;
    socket.emit(
      'verifyRoomPassword',
      { roomName: selectedRoom, password: roomPassword },
      (response: boolean) => {
        setIsPasswordVerified(response);
        if (!response) {
          alert('Incorrect password');
        }
      },
    );
  };

  const handlePermissionRequest = () => {
    if (!socket) return;
    socket.emit('requestPermission', { room: selectedRoom, user: currentUser });
  };

  const handleRequestOK = () => {
    if (!socket) return;
    if (!isAdmin || !isOwner) {
      alert('You do not have permission to grant permission');
      return;
    }
    socket.emit('permissionGranted', { room: selectedRoom, user: currentUser });
  };

  return (
    <div className="room-container">
      {!isOwner && !isAdmin && !isPasswordVerified && roomType === 'password' ? (
        <div className="password-prompt">
          <h3>Enter Room Password</h3>
          <input
            type="password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
          <button onClick={handlePasswordSubmit}>Submit</button>
        </div>
      ) : !isParticipants &&
        !isOwner &&
        !isAdmin &&
        !isPermissionGranted &&
        roomType === 'private' ? (
        <div className="permission-prompt">
          <h3>Waiting for Join Approval</h3>
          <button onClick={handlePermissionRequest}>Request Permission</button>
        </div>
      ) : (
        <>
          <div>
            <h3>Room Page</h3>
          </div>
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
              owner={owner as User}
              admin={admin as User}
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
                  alt={message.user}
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
        </>
      )}
    </div>
  );
}
