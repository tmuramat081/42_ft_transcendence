/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback, use } from 'react';
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
  const { getCurrentUser } = useAuth();
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

  useEffect(() => {
    if (!socket) return;

    // 仮のユーザー情報をセット
    const senderData = {
      userId: 1,
      userName: 'Bob',
      icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character01.png',
    };
    setSender(senderData);
    socket.emit('getRoomList', senderData);
    socket.emit('getOnlineUsers', senderData);

    // const setSenderData = async () => {
    //   try {
    //     const user: User | null = await getCurrentUser(); // Promiseをawaitで待機
    //     if (user) {
    //       const senderData = {
    //         userId: user.userId,
    //         userName: user.userName,
    //         icon: user.icon,
    //       };
    //       setSender(senderData);
    //       console.log('sender:', sender);
    //       socket.emit('getRoomList', senderData);
    //       socket.emit('getOnlineUsers', senderData);
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };
    // setSenderData().catch((error) => console.error(error));
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    console.log('sender:', sender);
  }, [sender]);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomList', (rooms: Room[]) => {
      console.log('Received roomList from server:', rooms);
      const roomNames = rooms.map((room) => room.roomName);
      setRoomList(roomNames);
    });

    socket.on('onlineUsers', (users: UserInfo[]) => {
      console.log('Received online users from server:', users);
      setOnlineUsers(users);
      // console.log('onlineUsers:', onlineUsers);
    });

    socket.on('roomParticipants', (roomParticipants: UserInfo[]) => {
      console.log('Received roomParticipants from server:', roomParticipants);
      setParticipants(roomParticipants);
      // console.log('participants:', participants);
    });

    socket.on('roomError', (error) => {
      console.error(error);
    });

    return () => {
      socket.off('roomList');
      socket.off('onlineUsers');
      socket.off('roomParticipants');
      socket.off('roomError');
    };
  }, [socket, getCurrentUser, participants]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chatLogs', (chatMessages: ChatMessage[]) => {
      console.log('Received chatLogs from server:', chatMessages);
      setRoomChatLogs((prevRoomChatLogs) => ({ ...prevRoomChatLogs, [roomID]: chatMessages }));
      // console.log('roomchatLogs:', roomchatLogs);
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
    socket.emit('talk', { selectedRoom, sender: { ...sender, icon: sender.icon }, message });
    setMessage('');
  }, [selectedRoom, sender, message, socket]);

  const onClickCreateRoom = useCallback(() => {
    if (!socket) return;
    console.log(`${sender.userName} create new room: ${newRoomName}`);
    socket.emit('createRoom', { sender, roomName: newRoomName });
    setNewRoomName('');
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
    socket.emit('joinRoom', { sender, room: roomList[Number(newRoomID)] });
  };

  const onClickLeaveRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      console.log(`${sender.userName} left Room: ${selectedRoom}`);
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
  }, [selectedRoom, roomchatLogs, sender, socket]);

  const onClickDeleteRoom = useCallback(() => {
    if (!socket) return;
    if (selectedRoom) {
      console.log(`${sender.userName} deleted Room: ${selectedRoom}`);
      socket.emit('deleteRoom', { sender, room: selectedRoom });
      setSelectedRoom(null);
      setDeleteButtonVisible(false); // ボタンが押されたら非表示にする
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
              <Image
                src={onlineUser.icon}
                alt={onlineUser.userName}
                className="onlineusers-icon"
                width={50}
                height={50}
              />
              <div className="onlineuser-name">{onlineUser.userName}</div>
              <button onClick={() => handleLinkClick(onlineUser)}>Send DM</button>
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
      <div className="back-button">
        <button
          onClick={() => {
            router.back();
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
