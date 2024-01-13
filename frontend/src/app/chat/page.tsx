"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import io from "socket.io-client";
import ChatLayout from "./layout";
import "./ChatPage.css"; // スタイルシートの追加
import Image from "next/image";

const socket = io("http://localhost:3001");

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [roomID, setRoomID] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [roomList, setRoomList] = useState<string[]>([]);
  const [sender, setSender] = useState<{
    ID: string;
    name: string;
    icon: string;
  }>({
    ID: "",
    name: "",
    icon: "",
  });
  const [roomchatLogs, setRoomChatLogs] = useState<{
    [roomId: string]: {
      user: string;
      photo: string;
      text: string;
      timestamp: string;
    }[];
  }>({});

  // コンポーネントがマウントされたときのみ接続
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("connection ID : ", socket.id);
      setSender({
        // ここはログイン情報を取得して設定する
        ID: socket.id,
        name: "kshima",
        icon: "https://cdn.intra.42.fr/users/b9712d0534942eacfb43c2b0b031ae76/kshima.jpg",
      });
    });

    // コンポーネントがアンマウントされるときに切断
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("roomList", (roomList) => {
      setRoomList(roomList);
    });

    return () => {
      socket.off("roomList");
    };
  }, []);

  const onClickSubmit = useCallback(() => {
    socket.emit("talk", { roomID, sender, message });
  }, [roomID, sender, message]);

  const onClickCreateRoom = useCallback(() => {
    socket.emit("createRoom", { sender, name: newRoomName });
  }, [sender, newRoomName]);

  useEffect(() => {
    socket.on("update", ({ roomID, sender, message }): void => {
      console.log("recieved : ", roomID, sender.ID, message);
      setRoomChatLogs((prevRoomChatLogs) => ({
        ...prevRoomChatLogs,
        [roomID]: [
          ...(prevRoomChatLogs[roomID] || []),
          {
            user: sender.ID,
            photo: sender.icon,
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

      {/* 新しいチャットグループの作成UI */}
      <div>
        <input
          type="text"
          placeholder="Enter new room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={onClickCreateRoom}>Create Room</button>
      </div>

      {/* チャットグループの選択UI */}
      <div className="chat-room-selector">
        <select
          onChange={(event) => {
            handleRoomChange(event);
          }}
          value={roomID}
        >
          <option value="">---</option>
          {roomList.map((roomID) => (
            <option key={roomID} value={roomID}>
              {roomID}
            </option>
          ))}
          {/* <option value="room1">Room1</option>
          <option value="room2">Room2</option> */}
        </select>
      </div>

      <div className="chat-messages">
        {roomchatLogs[roomID]?.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${
              message.user === sender.ID ? "self" : "other"
            }`}
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

      <div className="chat-input">
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

export default ChatPage;