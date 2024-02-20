/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import ChatLayout from './layout';
import './ChatPage.css'; // スタイルシートの追加
import Image from 'next/image';
import { Room } from '../../../../backend/src/chat/entities/room.entity';
import { ChatLog } from '../../../../backend/src/chat/entities/chatlog.entity';
import { User } from '../../../../backend/src/users/entities/user.entity';

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

  // コンポーネントがマウントされたときのみ接続
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('connection ID : ', socket.id);
      setSender({
        // ここでログイン情報を取得して設定する
        ID: socket.id,
        name: 'kshima',
        icon: 'https://cdn.intra.42.fr/users/b9712d0534942eacfb43c2b0b031ae76/kshima.jpg',
      });
      socket.emit('getRoomList', socket.id);
    });

    socket.on('roomList', (rooms: Room[]) => {
      console.log('Received roomList from server:', rooms);
      const roomNames = rooms.map((room) => room.roomName); // ルームオブジェクトのroomNameプロパティのみを取得
      setRoomList(roomNames);
    });

    socket.on('roomError', (error) => {
      console.error(error);
    });

    socket.on('update', (chatLog: ChatLog): void => {
      console.log('Received chatLog from server:', chatLog);
      const newChatMessage: ChatMessage = {
        user: chatLog.sender,
        photo: chatLog.icon,
        text: chatLog.message,
        timestamp: chatLog.timestamp,
      };
      setRoomChatLogs((prevRoomChatLogs) => {
        const updatedLogs = { ...prevRoomChatLogs };
        if (updatedLogs[chatLog.roomName]) {
          updatedLogs[chatLog.roomName].push(newChatMessage);
        } else {
          updatedLogs[chatLog.roomName] = [newChatMessage];
        }
        return updatedLogs;
      });
    });

    // コンポーネントがアンマウントされるときに切断
    return () => {
      socket.off('connect');
      socket.off('roomList');
      socket.off('roomError');
      socket.off('update');
    };
  }, []);

  // useEffect(() => {
  //   const handleRoomList = (rooms: Room[]) => {
  //     console.log('Received roomList from server:', rooms);
  //     const roomNames = rooms.map((room) => room.roomName); // ルームオブジェクトのroomNameプロパティのみを取得
  //     setRoomList(roomNames);
  //   };
  // }, []);

  const onClickSubmit = useCallback(() => {
    console.log(`${(sender as Sender).name} submitting message, '${message}'`);
    socket.emit('talk', { selectedRoom, sender: { ...sender, icon: sender.icon }, message });
    setMessage('');
  }, [selectedRoom, sender, message]);

  const onClickCreateRoom = useCallback(() => {
    socket.emit('createRoom', { sender, roomName: newRoomName });
    setNewRoomName('');
  }, [sender, newRoomName]);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomID = event.target.value;
    console.log(`${(sender as Sender).name} joined ${roomList[Number(newRoomID)]}`);
    setRoomID(newRoomID);
    setSelectedRoom(roomList[Number(newRoomID)]);
    setMessage(''); // ルームが変更されたら新しいメッセージもリセット
    setDeleteButtonVisible(true);
    socket.emit('joinRoom', { sender, room: roomList[Number(newRoomID)] });
  };

  const onClickDeleteRoom = useCallback(() => {
    if (selectedRoom) {
      console.log(`${(sender as Sender).name} deleted Room: ${selectedRoom}`);
      socket.emit('deleteRoom', { sender, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false); // ボタンが押されたら非表示にする
      // チャットログをクリアする
      setRoomChatLogs((prevRoomChatLogs) => {
        const updatedLogs = { ...prevRoomChatLogs };
        delete updatedLogs[selectedRoom];
        return updatedLogs;
      });
      // ルームリストから削除する
      const newRoomList = roomList.filter((room) => room !== selectedRoom);
      setRoomList(newRoomList);
    }
  }, [selectedRoom, roomList, sender]);

  return (
    <div className="chat-container">
      <h1>Chat Page</h1>

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
