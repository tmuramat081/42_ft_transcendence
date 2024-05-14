import React, { useState } from 'react';

const RoomSettingsModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomAdmin, setRoomAdmin] = useState('');
  const [roomBlocked, setRoomBlocked] = useState(false);
  const [roomMuted, setRoomMuted] = useState(false);

  const handleSubmit = () => {
    // フォームの入力値を使用してRoomを作成するロジックを実行
    onSubmit({ roomType, roomPassword, roomAdmin, roomBlocked, roomMuted });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span
          className="close"
          onClick={onClose}
        >
          &times;
        </span>
        <h2>Room Settings</h2>
        <label>
          Room Type:
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Room Password:
          <input
            type="password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
        </label>
        <label>
          Room Admin:
          <input
            type="text"
            value={roomAdmin}
            onChange={(e) => setRoomAdmin(e.target.value)}
          />
        </label>
        <label>
          Block Users:
          <input
            type="checkbox"
            checked={roomBlocked}
            onChange={(e) => setRoomBlocked(e.target.checked)}
          />
        </label>
        <label>
          Mute Users:
          <input
            type="checkbox"
            checked={roomMuted}
            onChange={(e) => setRoomMuted(e.target.checked)}
          />
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
