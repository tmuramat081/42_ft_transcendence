/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Link from 'next/link';
import ChatLayout from './layout';
import './DMPage.css'; // スタイルシートの追加
import Image from 'next/image';
import { Chat } from '@mui/icons-material';

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

const DMPage = () => {
  const router = useRouter();
  const { username } = router.query; // URLパラメータからusernameを取得

  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<Sender>({
    ID: '',
    name: '',
    icon: '',
  });
  const [dmchatLogs, setDMChatLogs] = useState<ChatMessage[]>([]);
  const [recipient, setRecipient] = useState<string>('');

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('connection ID : ', socket.id);
      const senderData = {
        ID: socket.id,
        name: 'kshima',
        icon: 'https://cdn.intra.42.fr/users/b9712d0534942eacfb43c2b0b031ae76/kshima.jpg', // Replace with actual sender icon
      };
      setSender(senderData);
      console.log('sender:', senderData);
      setRecipient(username as string); // usernameをrecipientとして設定
    });

    socket.on('updateDM', (chatMessage: ChatMessage) => {
      console.log('Received DM from server:', chatMessage);
      setDMChatLogs((prevDMChatLogs) => [
        ...prevDMChatLogs,
        {
          user: chatMessage.user,
          photo: chatMessage.photo,
          text: chatMessage.text,
          timestamp: chatMessage.timestamp,
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [username]); // useEffect内で使用する変数を依存配列に追加

  const onClickSubmit = useCallback(() => {
    console.log(`${sender.name} submitting DM to ${recipient}: ${message}`);
    socket.emit('sendDM', { sender: sender.name, recipient: recipient, message: message });
    setMessage('');
  }, [sender, recipient, message]);

  return (
    <div className="chat-container">
      <h1>Direct Messages with {username}</h1>
      {/* DM 相手の情報 */}
      <div className="dm-recipient-info">
        <h4>Recipient:</h4>
        <Image
          src={recipient?.icon || ''}
          alt={recipient?.name || ''}
          className="recipient-icon"
          width={50}
          height={50}
        />
        <div className="recipient-name">{recipient?.name || 'Recipient Name'}</div>
      </div>
      {/* DM 履歴 */}
      <div className="dm-messages">
        {dmchatLogs.map((message, index) => (
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
      {/* DM 入力欄 */}
      <div className="dm-input">
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

export default DMPage;
