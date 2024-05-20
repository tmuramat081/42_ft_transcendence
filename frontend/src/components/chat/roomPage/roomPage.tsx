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
  const [roomType, setRoomType] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

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
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user', (user: User) => {
      setCurrentUser(user);
    });

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      setParticipants(roomParticipants);
    });

    socket.on('owner', (owner: User) => {
      setOwner(owner);
      if (currentUser?.userId === owner.userId) {
        setIsOwner(true);
      }
    });

    socket.on('admin', (admin: User) => {
      setAdmin(admin);
      if (currentUser?.userId === admin.userId) {
        setIsAdmin(true);
      }
    });

    socket.on('allUsers', (users: User[]) => {
      setAllUsers(users);
    });

    socket.on('roomType', (type: string) => {
      setRoomType(type);
    });

    socket.on('updateRoomSettings', (room: Room) => {
      console.log('updateRoomSettings', room);
    });

    socket.on('passwordVerified', (response: boolean) => {
      setIsPasswordVerified(response);
      if (!response) {
        alert('Incorrect password');
      }
    });

    socket.on('permissionRequested', (user: User) => {
      alert('Permission requested by ' + user.userName);
    });

    socket.on('permissionGranted', (user: User) => {
      setIsPermissionGranted(true);
    });

    return () => {
      socket.off('user');
      socket.off('roomParticipants');
      socket.off('owner');
      socket.off('admin');
      socket.off('allUsers');
      socket.off('roomType');
      socket.off('updateRoomSettings');
      socket.off('passwordVerified');
      socket.off('permissionGranted');
    };
  }, [socket, participants, currentUser]);

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
    console.log('roomSettings', roomSettings);
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
    // socket.emit('talk', { selectedRoom, currentUser, message: 'Requesting permission to join' });
    socket.emit('requestPermission', { room: selectedRoom, user: currentUser });
  };

  const handleRequestOK = () => {
    if (!socket) return;
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
      ) : !isOwner && !isAdmin && !isPermissionGranted && roomType === 'private' ? (
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
