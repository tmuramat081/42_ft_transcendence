/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import DMLayout from './layout';
import './DMPage.css'; // スタイルシートの追加
import Image from 'next/image';
import { Chat } from '@mui/icons-material';

interface UserInfo {
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

const DMPage = ({ params }: { params: { recipient: UserInfo } }) => {
  // console.log('params:', params);
  const router = useRouter(); //Backボタンを使うためのrouter
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<UserInfo>({
    ID: '',
    name: '',
    icon: '',
  });
  const [receiver, setReceiver] = useState<UserInfo>({
    ID: '',
    name: '',
    icon: '',
  });
  const [dmLogs, setDMLogs] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('connection ID : ', socket.id);
      socket.emit('getCurrentUser');
      socket.emit('getRecipient', params.recipient);
    });

    socket.on('currentUser', (user: UserInfo) => {
      console.log('currentUser:', user);
      const sender: UserInfo = {
        ID: user.ID,
        name: user.name,
        icon: user.icon,
      };
      setSender(sender);
      console.log('sender:', sender);
    });

    socket.on('recipient', (recipient: UserInfo) => {
      const receiver: UserInfo = {
        ID: recipient.ID,
        name: recipient.name,
        icon: recipient.icon,
      };
      setReceiver(receiver);
      console.log('receiver', receiver);
    });

    socket.on('updateDM', (chatMessage: ChatMessage) => {
      console.log('Received DM from server:', chatMessage);
      setDMLogs((prevDMLogs) => [
        ...prevDMLogs,
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
    if (sender.name && receiver.name) {
      console.log('startDM:', sender, receiver);
      socket.emit('startDM', { sender: sender, receiver: receiver });
    }
  }, [sender, receiver]);

  const onClickSubmit = useCallback(() => {
    console.log(`${sender.name} submitting DM to ${receiver.name}: ${message}`);
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message]);

  return (
    <div className="chat-container">
      <h1>Direct Messages</h1>
      {/* DM 相手の情報 */}
      <div className="recipient-info">
        <h4>Recipient</h4>
        <Image
          src={receiver.icon || ''}
          alt={receiver.name || ''}
          className="recipient-icon"
          width={50}
          height={50}
        />
        <div className="recipient-name">{receiver?.name}</div>
      </div>
      {/* DM 履歴 */}
      <div className="dm-messages">
        {dmLogs.map((message, index) => (
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
};
export default DMPage;
