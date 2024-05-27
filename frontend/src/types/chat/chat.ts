import { User } from '@/types/user';

export type UserInfo = {
  userId: number;
  userName: string;
  icon: string;
};

export type UserData = {
  user: UserInfo;
  email: string;
  createdAt: string;
  name42: string;
};

export type Room = {
  roomID: number;
  roomName: string;
  roomParticipants: UserInfo[];
  roomType: string;
  roomPassword: string;
  roomOwner: number;
  roomAdmin: number;
  roomBlocked: number[];
  roomMuted: { id: number; mutedUntil: string }[];
  createdAt: string;
};

export type ChatMessage = {
  user: string;
  photo: string;
  text: string;
  timestamp: string;
};

export type DirectMessage = {
  senderId: number;
  recipientId: number;
  text: string;
  timestamp: string;
};
