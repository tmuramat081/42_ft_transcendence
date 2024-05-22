/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback, use } from 'react';
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
  const [roomID, setRoomID] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomchatLogs, setRoomChatLogs] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [owner, setOwner] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [isParticipants, setIsParticipants] = useState(false);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!socket || !params) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getUserCurrent', user);
        socket.emit('getAllUsers', user);
        socket.emit('getRoomInfo', { user, params });
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

    socket.on('roomId', (roomID: number) => {
      setRoomID(roomID);
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

    socket.on('roomError', (error: string) => {
      alert(error);
      window.location.href = '/chat';
    });

    socket.on('passwordVerified', (response: boolean) => {
      setIsPasswordVerified(response);
      if (!response) {
        alert('Incorrect password');
      }
    });

    socket.on('permissionRequested', (user: User) => {
      console.log('Permission requested by', user.userName);
      if (window.confirm(`Permission requested by ${user.userName}. Do you accept?`)) {
        // ユーザーが "Accept" ボタンをクリックした場合
        socket.emit('permissionGranted', {
          roomID: roomID,
          room: selectedRoom,
          user: user,
          admin: currentUser,
        });
        socket.emit('joinRoom', { roomID: roomID, room: selectedRoom, user: user });
        // updatePermissionGrantedUI();
      } else {
        // ユーザーが "Reject" ボタンをクリックした場合
        socket.emit('permissionDenied', {
          roomID: roomID,
          room: selectedRoom,
          user: user,
          admin: currentUser,
        });
      }
    });

    // const updatePermissionGrantedUI = () => {
    //   // 画面をリロードする
    //   window.location.reload();
    // };

    socket.on('permissionGranted', (user: User) => {
      setIsPermissionGranted(true);
      alert('Permission granted to ' + user.userName);
    });

    socket.on('permissionDenied', (user: User) => {
      alert('Permission denied by ' + user.userName);
    });

    socket.on('updatedRoomParticipants', (roomParticipants: UserInfo[]) => {
      setParticipants(roomParticipants);
    });

    return () => {
      socket.off('user');
      socket.off('allUsers');
      socket.off('roomID');
      socket.off('roomType');
      socket.off('roomOwner');
      socket.off('roomAdmin');
      socket.off('roomParticipants');
      socket.off('roomError');
      socket.off('passwordVerified');
      socket.off('permissionRequested');
      socket.off('permissionGranted');
      socket.off('permissionError');
      socket.off('updatedRoomParticipants');
    };
  }, [socket, currentUser, roomID, selectedRoom, roomType]);

  useEffect(() => {
    if (!socket) return;
    if (roomType === 'public' || isParticipants || isPasswordVerified || isPermissionGranted) {
      socket.emit('joinRoom', { roomID: roomID, room: selectedRoom, user: currentUser });
    }
  }, [socket, roomType, isParticipants, isPasswordVerified, isPermissionGranted]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      setRoomChatLogs(chatMessages);
    });

    return () => {
      socket.off('chatLogs');
    };
  }, [socket, roomID]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    socket.emit('talk', { roomID, selectedRoom, currentUser, message });
    setMessage('');
  }, [selectedRoom, message, socket, currentUser]);

  const onClickLeaveRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('leaveRoom', { roomID: roomID, room: selectedRoom, user: currentUser });
      setSelectedRoom(null);
      setMessage('');
      setRoomChatLogs([]);
      setIsParticipants(false);
      // chatページに戻る
      window.location.href = '/chat';
    }
  }, [selectedRoom, roomchatLogs, currentUser, socket]);

  const onClickDeleteRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      socket.emit('deleteRoom', { roomID: roomID, room: selectedRoom, user: currentUser });
      setSelectedRoom(null);
      setParticipants([]);
      setRoomChatLogs([]);
      setIsParticipants(false);
      // chatページに戻る
      window.location.href = '/chat';
    }
  }, [selectedRoom, currentUser, roomchatLogs, socket]);

  const onClickSettingRoom = useCallback(() => {
    setShowRoomSettings(true);
  }, []);

  const handleRoomSettingsSubmit = (roomSettings: Room) => {
    if (!socket) return;
    socket.emit('roomSettings', { roomID, selectedRoom, roomSettings });
    setShowRoomSettings(false);
  };

  const handlePasswordSubmit = () => {
    if (!socket) return;
    socket.emit(
      'verifyRoomPassword',
      { roomID: roomID, roomName: selectedRoom, password: roomPassword },
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
    socket.emit('requestPermission', { roomID: roomID, room: selectedRoom, user: currentUser });
  };

  return (
    <div className="room-container">
      {!isPasswordVerified && roomType === 'password' ? (
        <div className="password-prompt">
          <h3>Enter Room Password</h3>
          <input
            type="password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
          <button onClick={handlePasswordSubmit}>Submit</button>
        </div>
      ) : !isParticipants && !isPermissionGranted && roomType === 'private' ? (
        <div className="permission-prompt">
          <h3>Waiting for Join Approval for {selectedRoom}</h3>
          <button onClick={handlePermissionRequest}>Request Permission</button>
        </div>
      ) : (
        <>
          {/* 戻るボタン */}
          <div className="back-button">
            <button
              onClick={() => {
                window.location.href = '/chat';
              }}
            >
              Back
            </button>
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
            {roomchatLogs.map((message, index) => (
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
