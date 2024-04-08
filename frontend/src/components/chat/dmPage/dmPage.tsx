/*eslint-disable*/
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/providers/webSocketProvider';
// import { useAuth } from '@/providers/useAuth';
import { UserInfo, DirectMessage } from '@/types/chat/chat';
import './dmPage.css';

export default function DMPage({ params }: { params: string }) {
  const router = useRouter(); //Backボタンを使うためのrouter
  const { socket } = useWebSocket();
  // const { getCurrentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<UserInfo>({
    userId: -1,
    userName: '',
    icon: '',
  });
  const [receiver, setReceiver] = useState<UserInfo>({
    userId: -1,
    userName: '',
    icon: '',
  });
  const [dmLogs, setDMLogs] = useState<DirectMessage[]>([]);

  // ログインユーザー情報の取得
  // const user = getCurrentUser();
  // console.log('user:', user);

  useEffect(() => {
    if (!socket || !params) return;
    console.log('params:', params);

    socket.emit('getCurrentUser');
    socket.emit('getRecipient', params);
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;

    socket.on('currentUser', (user: UserInfo) => {
      const sender: UserInfo = {
        userId: user.userId,
        userName: user.userName,
        icon: user.icon,
      };
      setSender(sender);
    });

    socket.on('recipient', (recipient: UserInfo) => {
      const receiver: UserInfo = {
        userId: recipient.userId,
        userName: recipient.userName,
        icon: recipient.icon,
      };
      setReceiver(receiver);
      console.log('receiver', receiver);
    });

    return () => {
      socket.off('currentUser');
      socket.off('recipient');
    };
  }, [socket, params]);

  useEffect(() => {
    if (!socket) return;
    console.log('sender:', sender);
  }, [sender]);

  useEffect(() => {
    if (!socket) return;
    if (sender.userName && receiver.userName) {
      console.log(`${sender.userName} start DM with ${receiver.userName}`);
      socket.emit('startDM', { sender: sender, receiver: receiver });
      socket.emit('getDMLogs', { sender: sender, receiver: receiver });
    }
  }, [sender, receiver, socket]);

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
  }, [socket, dmLogs]);

  const onClickSubmit = useCallback(() => {
    if (!socket) return;
    console.log(`${sender.userName} submitting DM to ${receiver.userName}: ${message}`);
    socket.emit('sendDM', { sender: sender, receiver: receiver, message: message });
    setMessage('');
  }, [sender, receiver, message, socket]);

  return (
    <div className="dm-container">
      <h1>Direct Messages</h1>
      {/* DM 相手の情報 */}
      <div className="recipient-info">
        <h4>Recipient</h4>
        <Image
          src={receiver.icon || ''}
          alt={receiver.userName || ''}
          className="recipient-icon"
          width={50}
          height={50}
        />
        <div className="recipient-name">{receiver?.userName}</div>
      </div>
      {/* DM 履歴 */}
      <div
        className="dm-messages"
        style={{ overflowY: 'auto', maxHeight: '300px' }}
      >
        {dmLogs.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.sender === sender.userName ? 'self' : 'other'}`}
          >
            <Image
              src={message.sender === sender.userName ? sender.icon : receiver.icon}
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
