"use client";
import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import ChatLayout from "./layout";

// interface Message {
//   text: string;
//   timestamp: Date;
// }

// interface StateType {
//   messages: Message[];
//   newMessage: string;
// }

// const initialState: StateType = {
//   messages: [],
//   newMessage: "",
// };

const socket = io("http://localhost:3001");

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [roomID, setRoomID] = useState("");

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

  const onClickSubmit = useCallback(() => {
    socket.emit("message", newMessage);
  }, [newMessage]);

  useEffect(() => {
    socket.on("update", (message: string) => {
      console.log("recieved : ", message);
      setMsg(message);
    });
  }, []);
  //       setChatLog([
  //         ...chatLog,
  //         { text: message.text, timestamp: message.timestamp },
  //       ]);
  //     });
  //   }, [chatLog]);

  useEffect(() => {
    setChatLog([...chatLog, msg]);
  }, [msg]);

  // useEffect(() => {
  //     setChatLog([...chatLog, { text: newMessage, timestamp: new Date() }]);
  // }, [chatLog, newMessage]);

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
        <p key={index}>{message}</p>
        // <li key={index}>
        //   {message.text} - {message.timestamp.toLocaleString()}
        // </li>
      ))}
    </>
  );
};

export default ChatPage;
