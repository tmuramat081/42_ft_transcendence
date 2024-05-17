import React, { useState } from 'react';
import { UserInfo } from '@/types/chat/chat';
import { User } from '@/types/user';
import './RoomSettingsModal.css';

interface RoomSettingsModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  roomParticipants: UserInfo[];
  allUsers: User[];
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  onClose,
  onSubmit,
  roomParticipants = [],
  allUsers = [],
}) => {
  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomAdmin, setRoomAdmin] = useState<number | null>(null);
  const [roomBlocked, setRoomBlocked] = useState<number[]>([]);
  const [roomMuted, setRoomMuted] = useState<{ id: number; duration: string }[]>([]);
  // const [users, setUsers] = useState<User[]>([]);

  const handleSubmit = () => {
    onSubmit({ roomType, roomPassword, roomAdmin, roomBlocked, roomMuted });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomAdmin(Number(e.target.value));
  };

  const handleBlockedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setRoomBlocked(selectedOptions);
  };

  const handleMutedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    const updatedMuted = selectedOptions.map((id) => ({
      id,
      duration: roomMuted.find((mutedUser) => mutedUser.id === id)?.duration || '1h', // デフォルト値を設定
    }));
    setRoomMuted(updatedMuted);
  };

  const handleMutedDurationChange = (id: number, duration: string) => {
    setRoomMuted((prevMuted) =>
      prevMuted.map((user) => (user.id === id ? { ...user, duration } : user)),
    );
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
        <h3>Room Settings</h3>
        <label className="label">
          Room Type:
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="password">Password Protected</option>
          </select>
        </label>
        {roomType === 'password' && (
          <label className="label">
            Room Password:
            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
            />
          </label>
        )}
        <label className="label">
          Room Admin:
          <select
            value={roomAdmin ?? ''}
            onChange={handleAdminChange}
          >
            <option
              value=""
              disabled
            >
              Select Admin
            </option>
            {roomParticipants.map((participant) => (
              <option
                key={participant.userId}
                value={participant.userId}
              >
                {participant.userName}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Block Users:
          <select
            multiple
            value={roomBlocked.map((id) => id.toString())}
            onChange={handleBlockedChange}
          >
            {allUsers.map((user) => (
              <option
                key={user.userId}
                value={user.userId}
              >
                {user.userName}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Mute Users:
          <select
            multiple
            value={roomMuted.map((mutedUser) => mutedUser.id)}
            onChange={handleMutedChange}
          >
            {allUsers.map((user) => (
              <option
                key={user.userId}
                value={user.userId}
              >
                {user.userName}
              </option>
            ))}
          </select>
        </label>
        {roomMuted.map((mutedUser) => (
          <label
            key={mutedUser.id}
            className="label"
          >
            Mute Duration for {allUsers.find((user) => user.userId === mutedUser.id)?.userName}:
            <input
              type="text"
              value={mutedUser.duration}
              onChange={(e) => handleMutedDurationChange(mutedUser.id, e.target.value)}
            />
          </label>
        ))}
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
