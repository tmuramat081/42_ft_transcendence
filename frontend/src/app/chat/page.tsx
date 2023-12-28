"use client";
import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import ChatLayout from "./layout";

const socket = io("http://localhost:3001");

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [roomID, setRoomID] = useState("");
  const [roomchatLogs, setRoomChatLogs] = useState<{
    [roomId: string]: { text: string; timestamp: string }[];
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
    socket.emit("message", { roomID, newMessage });
  }, [roomID, newMessage]);

  useEffect(() => {
    socket.on("update", ({ roomID, message }): void => {
      console.log("recieved : ", roomID, message);
      setRoomChatLogs((prevRoomChatLogs) => ({
        ...prevRoomChatLogs,
        [roomID]: [
          ...(prevRoomChatLogs[roomID] || []),
          { text: message, timestamp: new Date().toLocaleString() },
        ],
      }));
      setNewMessage("");
    });

    return () => {
      socket.off("update");
    };
  }, []);

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomID = event.target.value;
    setRoomID(newRoomID);
    setNewMessage(""); // ルームが変更されたら新しいメッセージもリセット
    socket.emit("joinRoom", newRoomID);
  };

  return (
    <>
      <h1>Chat Page</h1>

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

      <>
        <input
          id="newMessage"
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
        />
        <button onClick={onClickSubmit}>Send</button>
      </>
      {roomchatLogs[roomID]?.map((message, index) => (
        <p key={index}>
          {message.text} {message.timestamp}
        </p>
      ))}
    </>
  );
};

export default ChatPage;
