import React, { useState } from 'react';
import { UserInfo } from '@/types/chat/chat';
import { User } from '@/types/user';
import './RoomSettingsModal.css';

interface RoomSettingsModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  roomParticipants: UserInfo[];
  allUsers: User[];
  currentUser: User;
  isOwner: boolean;
  isAdmin: boolean;
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  onClose,
  onSubmit,
  roomParticipants = [],
  allUsers = [],
  currentUser,
  isOwner,
  isAdmin,
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomAdmin, setRoomAdmin] = useState<number | null>(null);
  const [roomBlocked, setRoomBlocked] = useState<number | null>(null);
  const [roomMuted, setRoomMuted] = useState<number | null>(null);
  const [muteDuration, setMuteDuration] = useState('');

  // 自分を除いたroomParticipantsを取得
  const otherParticipants = roomParticipants.filter(
    (participant) => participant.userId !== currentUser.userId,
  );
  const handleSubmit = () => {
    onSubmit({ roomName, roomType, roomPassword, roomAdmin, roomBlocked, roomMuted, muteDuration });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomAdmin(Number(e.target.value));
  };

  const handleBlockedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomBlocked(Number(e.target.value));
  };

  const handleMutedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomMuted(Number(e.target.value));
  };

  const handleMutedDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMuteDuration(e.target.value);
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
          Room Name:
          <input
            type="text"
            value={roomName}
            onChange={handleNameChange}
          />
        </label>
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
            <option value="">Unassign Admin</option>
            {otherParticipants.map((participant) => (
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
          Block User:
          <select
            value={roomBlocked ?? ''}
            onChange={handleBlockedChange}
          >
            <option
              value=""
              disabled
            >
              Select User
            </option>
            <option value="">Unblock User</option>
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
          Mute User:
          <select
            value={roomMuted ?? ''}
            onChange={handleMutedChange}
          >
            <option
              value=""
              disabled
            >
              Select User
            </option>
            <option value="">Unmute User</option>
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
        {roomMuted &&
          otherParticipants.map((mutedUser) => (
            <label
              key={mutedUser.userId}
              className="label"
            >
              Mute Duration for{' '}
              {allUsers.find((user) => user.userId === mutedUser.userId)?.userName}:
              <select
                value={muteDuration}
                onChange={handleMutedDurationChange}
              >
                <option value="">Select Duration</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
              </select>
            </label>
          ))}
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
