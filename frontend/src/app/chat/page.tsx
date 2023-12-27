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
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [msg, setMsg] = useState<Message>({ text: "", timestamp: new Date() });
  const [roomID, setRoomID] = useState<string>("");

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

  useEffect(() => {
    socket.on("update", (message) => {
      console.log("recieved : ", message);
      setMsg(message);
    });
  }, []);

  const onClickSubmit = useCallback(() => {
    socket.emit("message", { roomID, newMessage });
    //     setChatLog([...chatLog, { text: newMessage, timestamp: new Date() }]);
    //   }, [roomID, newMessage, chatLog]);
  }, [roomID, newMessage]);

  useEffect(() => {
    setChatLog([...chatLog, msg]);
  }, [msg, chatLog]);

  return (
    <>
      <h1>Chat Page</h1>

      <select
        onChange={(event) => {
          setRoomID(event.target.value);
          socket.emit("joinRoom", event.target.value);
          setChatLog([]);
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
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={onClickSubmit}>Send</button>
      </>
      {chatLog.map((message, index) => (
        <li key={index}>
          {message.text} - {message.timestamp.toLocaleString()}
        </li>
      ))}
    </>
  );
};

export default ChatPage;
