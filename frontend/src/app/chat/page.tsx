"use client";
import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import ChatLayout from "./layout";

interface Message {
  text: string;
  timestamp: Date;
}

interface StateType {
  messages: Message[];
  newMessage: string;
}

const initialState: StateType = {
  messages: [],
  newMessage: "",
};

const socket = io("http://localhost:3001");

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string | null>(null);

  // コンポーネントがマウントされたときのみ接続
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("connection ID : ", socket.id);
    });

    return () => {
      // コンポーネントがアンマウントされるときに切断
      socket.disconnect();
    };
  }, []); // 空の依存配列はマウント時のみ実行

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, timestamp: new Date() }]);
      setNewMessage("");
    }
  };

  const onClickSubmit = useCallback(() => {
    socket.emit("message", { roomID, text: newMessage });
  }, [newMessage, roomID, socket]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connection ID : ", socket.id);
    });
  }, [socket]);

  useEffect(() => {
    if (roomID) {
      socket.emit("joinRoom", roomID);

      socket.on("update", (message: string) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: message, timestamp: new Date() },
        ]);
      });

      // ルームに参加したことをサーバーに通知
      socket.emit("getMessages", roomID, (roomMessages: Message[]) => {
        setMessages(roomMessages);
      });
    }
  }, [roomID, socket]);

  useEffect(() => {
    const handleRoomChange = (newRoomID: string) => {
      // Roomが切り替わったときに新しいRoomのメッセージを取得
      socket.emit("getMessages", newRoomID, (messages: Message[]) => {
        setMessages(messages);
      });
    };

    // joinRoomイベントのリスナーを設定
    socket.on("joinRoom", handleRoomChange);

    return () => {
      // コンポーネントがアンマウントされたときにリスナーをクリーンアップ
      socket.off("joinRoom", handleRoomChange);
    };
  }, []); // 依存リストが空なので、最初のマウント時のみ実行される

  return (
    <div>
      <h1>Chat Page</h1>

      <div>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              {message.text} - {message.timestamp.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <select
        onChange={(event) => {
          const newRoomID = event.target.value;
          setRoomID(newRoomID);
        }}
        value={roomID || ""}
      >
        <option value="">---</option>
        <option value="room1">Room1</option>
        <option value="room2">Room2</option>
      </select>

      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
