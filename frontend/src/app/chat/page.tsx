/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import Link from 'next/link';
import ChatLayout from './layout';
import './ChatPage.css'; // スタイルシートの追加
import Image from 'next/image';
import { Room } from '../../../../backend/src/chat/entities/room.entity';
import { Chat } from '@mui/icons-material';
// import { ChatLog } from '../../../../backend/src/chat/entities/chatlog.entity';
// import { User } from '../../../../backend/src/users/entities/user.entity';

interface Sender {
  ID: string;
  name: string;
  icon: string;
}

interface ChatMessage {
  user: string;
  photo: string;
  text: string;
  timestamp: string;
}

const socket = io('http://localhost:3001');

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [roomID, setRoomID] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [roomList, setRoomList] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [sender, setSender] = useState<Sender>({
    ID: '',
    name: '',
    icon: '',
  });
  const [roomchatLogs, setRoomChatLogs] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [isDeleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [participants, setParticipants] = useState<{ name: string; icon: string }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ name: string; icon: string }[]>([]);

  // コンポーネントがマウントされたときのみ接続
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('connection ID : ', socket.id);
      // ここでログイン情報を取得して設定する
      const senderData = {
        ID: socket.id,
        name: 'kshima',
        icon: 'https://cdn.intra.42.fr/users/b9712d0534942eacfb43c2b0b031ae76/kshima.jpg',
      };
      setSender(senderData);
      console.log('sender:', senderData);
      socket.emit('getRoomList', senderData);
      socket.emit('getOnlineUsers', senderData);
    });

    socket.on('roomList', (rooms: Room[]) => {
      console.log('Received roomList from server:', rooms);
      const roomNames = rooms.map((room) => room.roomName); // ルームオブジェクトのroomNameプロパティのみを取得
      setRoomList(roomNames);
    });

    socket.on('onlineUsers', (users: { name: string; icon: string }[]) => {
      console.log('Received online users from server:', users);
      setOnlineUsers(users);
    });

    // コンポーネントがアンマウントされるときに切断
    return () => {
      socket.disconnect();
      socket.off('roomList');
      socket.off('onlineUsers');
    };
  }, []);

  useEffect(() => {
    socket.on('roomError', (error) => {
      console.error(error);
    });

    return () => {
      socket.off('roomError');
    };
  }, []);

  useEffect(() => {
    socket.on('update', (chatMessage: ChatMessage) => {
      console.log('Received chatLog from server:', chatMessage);
      setRoomChatLogs((prevRoomChatLogs) => ({
        ...prevRoomChatLogs,
        [roomID]: [
          ...(prevRoomChatLogs[roomID] || []),
          {
            user: chatMessage.user, // 送信者のID
            photo: chatMessage.photo, // 送信者のアイコン
            text: chatMessage.text,
            timestamp: chatMessage.timestamp,
          },
        ],
      }));
    });

    return () => {
      socket.off('update');
    };
  }, [roomID]);

  useEffect(() => {
    socket.on('roomParticipants', (roomParticipants: { name: string; icon: string }[]) => {
      console.log('Received roomParticipants from server:', roomParticipants);
      setParticipants(roomParticipants);
      console.log('participants:', participants);
    });

    return () => {
      socket.off('roomParticipants');
    };
  }, []);

  const onClickSubmit = useCallback(() => {
    console.log(
      `${(sender as Sender).name} ${(sender as Sender).ID} submitting message, '${message}'`,
    );
    socket.emit('talk', { selectedRoom, sender: { ...sender, icon: sender.icon }, message });
    setMessage('');
  }, [selectedRoom, sender, message]);

  const onClickCreateRoom = useCallback(() => {
    console.log(`${(sender as Sender).name} create new room: ${newRoomName}`);
    socket.emit('createRoom', { sender, roomName: newRoomName });
    setNewRoomName('');
  }, [sender, newRoomName]);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomID = event.target.value;
    console.log(`${(sender as Sender).name} joined room: ${roomList[Number(newRoomID)]}`);
    setRoomID(newRoomID);
    setSelectedRoom(roomList[Number(newRoomID)]);
    setMessage(''); // ルームが変更されたら新しいメッセージもリセット
    setDeleteButtonVisible(true);
    socket.emit('joinRoom', { sender, room: roomList[Number(newRoomID)] });
  };

  const onClickLeaveRoom = useCallback(() => {
    if (selectedRoom) {
      console.log(`${sender.name} left Room: ${selectedRoom}`);
      socket.emit('leaveRoom', { sender, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false); // ボタンが押されたら非表示にする
      setMessage('');
      setRoomID('');
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
    }
  }, [selectedRoom, roomchatLogs, sender]);

  const onClickDeleteRoom = useCallback(() => {
    if (selectedRoom) {
      console.log(`${(sender as Sender).name} deleted Room: ${selectedRoom}`);
      socket.emit('deleteRoom', { sender, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false); // ボタンが押されたら非表示にする
      // チャットログをクリアする
      const updatedLogs = { ...roomchatLogs };
      delete updatedLogs[selectedRoom];
      setRoomChatLogs(updatedLogs);
      // ルームリストから削除する
      const newRoomList = roomList.filter((room) => room !== selectedRoom);
      setRoomList(newRoomList);
    }
  }, [selectedRoom, roomList, sender]);

  const sendDM = (recipient: string) => {
    console.log(`Sending DM to ${recipient}`);
    socket.emit('sendDM', { sender: sender.name, recipient: recipient, message: 'Hello!' });
  };

  return (
    <div className="chat-container">
      <h1>Chat Page</h1>
      {/* ログイン中の参加者リスト */}
      <div className="onlineusers">
        <h4>Logined friends</h4>
        <div className="onlineusers-icons">
          {onlineUsers.map((onlineUser, index) => (
            <div
              key={index}
              className="onlineuser"
            >
              <img
                src={onlineUser.icon}
                alt={onlineUser.name}
                className="onlineusers-icon"
                width={50}
                height={50}
              />
              <div className="onlineuser-name">{onlineUser.name}</div>
              {/* sendDM ボタンを Link コンポーネントで囲む */}
              <Link href={{ pathname: '/chat/DM', query: { recipient: onlineUser.name } }}>
                <button>Send DM</button>
              </Link>
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
      {/* チャットグループの選択UI */}
      <div className="chat-room-selector">
        <select
          onChange={(event) => {
            handleRoomChange(event);
          }}
          value={roomID}
        >
          <option value="">---</option>
          {Object.entries(roomList).map(([roomId, roomName]) => (
            <option
              key={`room_${roomId}`}
              value={roomId}
            >
              {roomName}
            </option>
          ))}
        </select>
      </div>
      {/* ROOM参加者リスト */}
      <div className="participants">
        <h4>Room friends</h4>
        <div className="participant-icons">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="participant"
            >
              <Image
                src={participant.icon}
                alt={participant.name}
                className="participant-icon"
                width={50}
                height={50}
              />
              <div className="participant-name">{participant.name}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Leave Room ボタン */}
      {isDeleteButtonVisible && <button onClick={onClickLeaveRoom}>Leave Room</button>}
      {/* Delete Room ボタン */}
      {isDeleteButtonVisible && <button onClick={onClickDeleteRoom}>Delete Room</button>}
      {/* チャットログ */}
      <div className="chat-messages">
        {roomchatLogs[roomID]?.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.user === sender.ID ? 'self' : 'other'}`}
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
    </div>
  );
};

export default ChatPage;
