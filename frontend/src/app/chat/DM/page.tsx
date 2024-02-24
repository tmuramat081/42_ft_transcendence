/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import DMLayout from './layout';
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

interface Recipient {
  ID: string;
  name: string;
  icon: string;
}

const socket = io('http://localhost:3001');

const DMPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<Sender>({
    ID: '',
    name: '',
    icon: '',
  });
  const [dmchatLogs, setDMChatLogs] = useState<ChatMessage[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('connection ID : ', socket.id);
      // console.log('recipient:', recipient);
      const senderData = {
        ID: socket.id,
        name: 'kaori',
        icon: 'https://pics.prcm.jp/db3b34efef8a0/86032013/jpeg/86032013.jpeg',
      };
      setSender(senderData);
      console.log('sender:', senderData);
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
  }, []);

  useEffect(() => {
    if (recipient) {
      console.log('recipient:', recipient);
    }
  }, [recipient]);

  const onClickSubmit = useCallback(() => {
    console.log(`${sender.name} submitting DM to ${recipient}: ${message}`);
    socket.emit('sendDM', { sender: sender.name, recipient: recipient, message: message });
    setMessage('');
  }, [sender, recipient, message]);

  return (
    <div className="chat-container">
      <h1>Direct Messages with 'username'</h1>
      {/* DM 相手の情報 */}
      <div className="dm-recipient-info">
        <h4>Recipient:</h4>
        {/* <Image
            src={recipient.icon || ''}
            alt={recipient.name || ''}
            className="recipient-icon"
            width={50}
            height={50}
          /> */}
        <div className="recipient-name"></div>
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
