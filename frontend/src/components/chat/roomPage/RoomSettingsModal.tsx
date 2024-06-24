/*eslint-disable*/
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
  name: string;
  owner: User;
  admin: User;
  type: string;
  blockedUsers: UserInfo[];
  mutedUsers?: { user: UserInfo; mutedUntil: string }[];
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  onClose,
  onSubmit,
  roomParticipants = [],
  allUsers = [],
  currentUser,
  name,
  owner,
  admin,
  type,
  blockedUsers = [],
  mutedUsers = [],
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomAdmin, setRoomAdmin] = useState<number | null>(null);
  const [roomBlocked, setRoomBlocked] = useState<number | null>(null);
  const [roomUnblocked, setRoomUnblocked] = useState<number | null>(null);
  const [roomMuted, setRoomMuted] = useState<number | null>(null);
  const [roomUnmuted, setRoomUnmuted] = useState<number | null>(null);
  const [muteDuration, setMuteDuration] = useState('');

  // 自分を除いたroomParticipantsを取得
  const otherParticipants = roomParticipants.filter(
    (participant) => participant.userId !== currentUser.userId,
  );

  const isOwner = currentUser.userId === owner.userId;
  const isAdmin = currentUser.userId === admin.userId;
  const isBoth = isOwner && isAdmin;

  const handleSubmit = () => {
    onSubmit({
      roomName,
      roomType,
      roomPassword,
      roomAdmin,
      roomBlocked,
      roomUnblocked,
      roomMuted,
      roomUnmuted,
      muteDuration,
    });
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

  const handleUnblockedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomUnblocked(Number(e.target.value));
  };

  const handleMutedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomMuted(Number(e.target.value));
    setMuteDuration('');
  };

  const handleUnmutedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomUnmuted(Number(e.target.value));
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

        {isOwner && (
          <>
            <label className="label">
              Room Name:
              <input
                type="text"
                value={roomName}
                onChange={handleNameChange}
                placeholder="Enter Room Name"
              />
              <br />
              <small>Current: {name || 'No name set'}</small>
            </label>
            <label className="label">
              Room Type:
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option
                  value=""
                  disabled
                >
                  Select Room Type
                </option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password">Password</option>
              </select>
              <br />
              <small>Current: {type || 'No type set'}</small>
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
                <option value={owner?.userId ?? ''}>Default</option>
                {otherParticipants.map((participant) => (
                  <option
                    key={participant.userId}
                    value={participant.userId}
                  >
                    {participant.userName}
                  </option>
                ))}
              </select>
              <br />
              <small>Current:{admin.userName || 'No admin set'}</small>
            </label>
          </>
        )}

        {((!isOwner && isAdmin) || isBoth) && (
          <>
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
                {allUsers
                  .filter((user) => !blockedUsers.some((blocked) => blocked.userId === user.userId))
                  .map((user) => (
                    <option
                      key={user.userId}
                      value={user.userId}
                    >
                      {user.userName}
                    </option>
                  ))}
              </select>
              <br />
              <small>
                {/* blockedUsersの名前の一覧を表示 */}
                Current: {blockedUsers.map((user) => user.userName).join(', ') || 'No user blocked'}
              </small>
            </label>
            <label className="label">
              Unblock User:
              <select
                value={roomUnblocked ?? ''}
                onChange={handleUnblockedChange}
              >
                <option
                  value=""
                  disabled
                >
                  Select User
                </option>
                {blockedUsers.map((user) => (
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
                {otherParticipants.map((user) => (
                  <option
                    key={user.userId}
                    value={user.userId}
                  >
                    {user.userName}
                  </option>
                ))}
              </select>
              <br />
              <small>
                {/* mutedUsersの名前と期間の一覧を表示 */}
                Current:{' '}
                {mutedUsers
                  .map((user) => `${user.user.userName} (${user.mutedUntil})`)
                  .join(', ') || 'No user muted'}
              </small>
            </label>
            {roomMuted && (
              <label className="label">
                Mute Duration for {allUsers.find((user) => user.userId === roomMuted)?.userName}:
                <select
                  value={muteDuration}
                  onChange={handleMutedDurationChange}
                >
                  <option value="">Select Duration</option>
                  <option value="1m">1 Minute</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                  <option value="1w">1 Week</option>
                  <option value="1M">1 Month</option>
                </select>
              </label>
            )}
            <label className="label">
              Unmute User:
              <select
                value={roomUnmuted ?? ''}
                onChange={handleUnmutedChange}
              >
                <option
                  value=""
                  disabled
                >
                  Select User
                </option>
                {mutedUsers.map((user) => (
                  <option
                    key={user.user.userId}
                    value={user.user.userId}
                  >
                    {user.user.userName}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
