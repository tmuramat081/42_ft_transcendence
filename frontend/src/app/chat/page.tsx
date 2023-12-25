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

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [state, setState] = useState<StateType>(initialState);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, timestamp: new Date() }]);
      setNewMessage("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connection ID : ", socket.id);
    });
  }, []);

  const onClickSubmit = useCallback(() => {
    socket.emit("message", "hello");
  }, []);

  socket.on("update", (message: string) => {
    console.log("recieved : ", message);
  });

  return (
    <div>
      <h1>Chat Page</h1>

      <div>
        {/* メッセージ一覧 */}
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              {message.text} - {message.timestamp.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {/* 新しいメッセージの入力フォーム */}
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
}

export default ChatPage;
