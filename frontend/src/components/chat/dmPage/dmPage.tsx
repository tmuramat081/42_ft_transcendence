/* eslint-disable */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useAuth } from '@/providers/useAuth';
import { useRouterGuard } from '@/hooks/routes/useRouterGuard';
import { UserInfo, DirectMessage } from '@/types/chat/chat';
import './dmPage.css';

// const socket = io('http://localhost:3001');

export default function DMPage({ params }: { params: string }) {
  const { socket } = useWebSocket();
  const router = useRouter(); //Backボタンを使うためのrouter
  const { getCurrentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<UserInfo>({
    ID: -1,
    name: '',
    icon: '',
  });
  const [receiver, setReceiver] = useState<UserInfo>({
    ID: -1,
    name: '',
    icon: '',
  });
  const [dmLogs, setDMLogs] = useState<DirectMessage[]>([]);

  useEffect(() => {
    if (!socket || !params) return;

    const fetchInitialData = async () => {
      try {
        // ログインユーザー情報の取得
        // const user = getCurrentUser();
        // console.log('user:', user);

        socket.emit('getCurrentUser');
        socket.emit('getRecipient', params);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    return () => {
      socket.disconnect();
    };
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('currentUser', (user: UserInfo) => {
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

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    if (sender.name && receiver.name) {
      console.log(`${sender.name} start DM with ${receiver.name}`);
      socket.emit('startDM', { sender: sender, receiver: receiver });
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    }
  }, [sender, receiver]);

  useEffect(() => {
    if (!socket) return;
    socket.on('dmLogs', (directMessages: DirectMessage[]) => {
      console.log('Received DMLogs from server:', directMessages);
      setDMLogs(directMessages);
      console.log('dmLogs:', dmLogs);
    });

    return () => {
      socket.off('dmLogs');
    };
  }, [socket]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    console.log(`${sender.name} submitting DM to ${receiver.name}: ${message}`);
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message]);

  return (
    <div className="dm-container">
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
      <div
        className="dm-messages"
        style={{ overflowY: 'auto', maxHeight: '300px' }}
      >
        {dmLogs.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.sender === sender.name ? 'self' : 'other'}`}
          >
            <Image
              src={message.sender === sender.name ? sender.icon : receiver.icon}
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
}
