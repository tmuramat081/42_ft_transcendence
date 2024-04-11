/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback, use } from 'react';
import Notification from './Notification';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { UserInfo, ChatMessage, Room } from '@/types/chat/chat';
import { User } from '@/types/user';
import './chatPage.css';

export default function ChatPage() {
  const router = useRouter();
  const { socket } = useWebSocket();
  const { getCurrentUser, loginUser } = useAuth();
  const [message, setMessage] = useState('');
  const [roomID, setRoomID] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [roomList, setRoomList] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [sender, setSender] = useState<UserInfo>({
    userId: -1,
    userName: '',
    icon: '',
  });
  const [roomchatLogs, setRoomChatLogs] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [isDeleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [invitee, setInvitee] = useState<UserInfo | null>(null);
  const [invitees, setInvitees] = useState<UserInfo[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [gameList, setGameList] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [LoginUser, setLoginUser] = useState<User | null>(null);

  useEffect(() => {
    if (!socket) return;

    getCurrentUser()
      .then((user) => {
        socket.emit('getLoginUser', user);
        if (user) {
          const senderData = {
            userId: user.userId,
            userName: user.userName,
            icon: user.icon,
          };
          setSender(senderData);
        }
      })
      .catch((error) => {
        console.error('Error getting user:', error);
      });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    console.log('sender:', sender);
    socket.emit('getRoomList', sender);
    socket.emit('getGameList', sender);
    socket.emit('getOnlineUsers', sender);
  }, [sender]);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomList', (rooms: Room[]) => {
      console.log('Received roomList from server:', rooms);
      const roomNames = rooms.map((room) => room.roomName);
      setRoomList(roomNames);
    });

    socket.on('gameList', (games: string[]) => {
      console.log('Received gameList from server:', games);
      setGameList(games);
    });

    socket.on('onlineUsers', (users: UserInfo[]) => {
      console.log('Received online users from server:', users);
      setOnlineUsers(users);
    });

    socket.on('loginUser', (user: User) => {
      console.log('Received LoginUser from server:', user);
      setLoginUser(user);
    });

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      console.log('Received roomParticipants from server:', roomParticipants);
      setParticipants(roomParticipants);
    });

    socket.on('roomInvitation', (sender: UserInfo, room: string) => {
      console.log('Received roomInvitation from server:', sender, room);
      setNotification(`${sender.userName} invited you to join ${room}`);
    });

    socket.on('gameInvitation', (sender: UserInfo, game: string) => {
      console.log('Received gameInvitation from server:', sender, game);
      setNotification(`${sender.userName} invited you to play ${game}`);
    });

    socket.on('roomError', (error) => {
      console.error(error);
    });

    return () => {
      socket.off('roomList');
      socket.off('gameList');
      socket.off('onlineUsers');
      socket.off('loginUser');
      socket.off('roomParticipants');
      socket.off('roomInvitation');
      socket.off('roomError');
    };
  }, [socket, getCurrentUser, participants]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      console.log('Received chatLogs from server:', chatMessages);
      setRoomChatLogs((prevRoomChatLogs) => ({ ...prevRoomChatLogs, [roomID]: chatMessages }));
    });

    return () => {
      socket.off('chatLogs');
    };
  }, [roomID, roomchatLogs, socket]);

  useEffect(() => {
    console.log('Room chat logs updated:', roomchatLogs);
  }, [roomchatLogs]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    console.log(`${sender.userName} submitting message, '${message}'`);
    socket.emit('talk', { selectedRoom, loginUser, message });
    setMessage('');
  }, [selectedRoom, sender, message, socket]);

  const onClickCreateRoom = useCallback(() => {
    if (!socket) return;
    console.log(`${sender.userName} create new room: ${newRoomName}`);
    socket.emit('createRoom', { sender, roomName: newRoomName });
    setNewRoomName('');
    setSelectedRoom('');
  }, [sender, newRoomName, socket]);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!socket) return;
    const newRoomID = event.target.value;
    //newRoomIDがnullだった場合の処理
    if (newRoomID === '') {
      console.log('newRoomID is null');
      setRoomID('');
      setMessage('');
      setDeleteButtonVisible(false);
      socket.emit('leaveRoom', { sender, room: selectedRoom });
      return;
    }
    console.log('newRoomID', newRoomID);
    console.log(`${sender.userName} joined room: ${roomList[Number(newRoomID)]}`);
    setRoomID(newRoomID);
    setSelectedRoom(roomList[Number(newRoomID)]);
    setMessage(''); // ルームが変更されたら新しいメッセージもリセット
    setDeleteButtonVisible(true);
    socket.emit('joinRoom', { loginUser, room: roomList[Number(newRoomID)] });
  };

  const onClickLeaveRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      console.log(`${sender.userName} left Room: ${selectedRoom}`);
      socket.emit('leaveRoom', { sender, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false);
      setMessage('');
      setRoomID('');
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
    }
  }, [selectedRoom, roomchatLogs, sender, socket]);

  const onClickDeleteRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      console.log(`${sender.userName} deleted Room: ${selectedRoom}`);
      socket.emit('deleteRoom', { sender, room: selectedRoom });
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
  }, [selectedRoom, roomList, sender, roomchatLogs, socket]);

  const handleLinkClick = (recipient: UserInfo) => {
    if (!socket) return;
    const href = `/chat/${recipient.userName}?recipient=${JSON.stringify(recipient)}`;
    const as = `/chat/${recipient.userName}`;
    router.push(href);
    router.push(as);
  };

  const handleInviteGame = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const invitedGame = event.target.value;
    if (!socket || !invitedGame || invitees.length === 0) return;
    console.log(`${sender.userName} invited users to play ${invitedGame}:`, invitees);
    // 選択された全てのユーザーを招待する
    invitees.forEach((invitee) => {
      socket.emit('inviteToGame', { sender, game: invitedGame, invitee });
    });
    setNotification(
      `you invited users to play ${invitedGame}: ${invitees
        .map((invitee) => invitee.userName)
        .join(', ')}`,
    );
    setInvitees([]);
    setSelectedGame(null);
  };

  const onClickInviteRoom = useCallback(() => {
    if (!socket || !selectedRoom || invitees.length === 0) return;
    console.log(`${sender.userName} invited users to ${selectedRoom}:`, invitees);

    // 選択された全てのユーザーを招待する
    invitees.forEach((invitee) => {
      socket.emit('inviteToRoom', { sender, room: selectedRoom, invitee });
    });
    setInvitees([]);
  }, [sender, selectedRoom, invitees, socket]);

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
      {/* <h1>Chat Page</h1> */}
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
                  <Image
                    src={onlineUser.icon}
                    alt={onlineUser.userName}
                    className="onlineusers-icon"
                    width={50}
                    height={50}
                  />
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
          {/* Gameの選択UI */}
          <select
            onChange={(event) => {
              handleInviteGame(event);
            }}
            value={selectedGame || ''}
          >
            <option value="">Invite Game</option>
            {gameList.map((game, index) => (
              <option
                key={index}
                value={game}
              >
                {game}
              </option>
            ))}
          </select>
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
                <Image
                  src={participant.icon}
                  alt={participant.userName}
                  className="participant-icon"
                  width={50}
                  height={50}
                />
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
              className={`message-bubble ${message.user === sender.userName ? 'self' : 'other'}`}
            >
              <Image
                src={message.photo}
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
      )}
    </div>
  );
}
