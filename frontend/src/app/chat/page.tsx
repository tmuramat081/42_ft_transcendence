"use client";
import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import ChatLayout from "./layout";
import "./ChatPage.css"; // スタイルシートの追加

interface User {
  ID: string;
  name: string;
  icon: string;
}

const socket = io("http://localhost:3001");

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [roomID, setRoomID] = useState("");
  const [sender, setSender] = useState<User>({
    ID: "",
    name: "",
    icon: "",
  });
  const [roomchatLogs, setRoomChatLogs] = useState<{
    [roomId: string]: { user: User; text: string; timestamp: string }[];
  }>({});

  // コンポーネントがマウントされたときのみ接続
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("connection ID : ", socket.id);
    });

    // コンポーネントがアンマウントされるときに切断
    return () => {
      socket.disconnect();
    };
  }, []);

  const onClickSubmit = useCallback(() => {
    socket.emit("talk", { roomID, sender, message });
  }, [roomID, sender, message]);

  useEffect(() => {
    socket.on("update", ({ roomID, sender, message }): void => {
      console.log("recieved : ", roomID, sender, message);
      setRoomChatLogs((prevRoomChatLogs) => ({
        ...prevRoomChatLogs,
        [roomID]: [
          ...(prevRoomChatLogs[roomID] || []),
          {
            user: sender,
            text: message,
            timestamp: new Date().toLocaleString(),
          },
        ],
      }));
      setMessage("");
    });

    return () => {
      socket.off("update");
    };
  }, []);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomID = event.target.value;
    setRoomID(newRoomID);
    setMessage(""); // ルームが変更されたら新しいメッセージもリセット
    socket.emit("joinRoom", newRoomID);
  };

  return (
    <div className="chat-container">
      <h1>Chat Page</h1>

      <div className="chat-room-selector">
        <select
          onChange={(event) => {
            handleRoomChange(event);
          }}
          value={roomID}
        >
          <option value="">---</option>
          <option value="room1">Room1</option>
          <option value="room2">Room2</option>
        </select>
      </div>

      <div className="chat-messages">
        {roomchatLogs[roomID]?.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${
              message.user === "self" ? "self" : "other"
            }`}
          >
            <img src={message.user.icon} alt="User Icon" className="icon" />
            <div>
              <div>{message.text}</div>
              <div className="timestamp">{message.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          id="message"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button onClick={onClickSubmit}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
