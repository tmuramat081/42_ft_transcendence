export type UserInfo = {
  ID: string;
  name: string;
  icon: string;
};

export type Room = {
  id: number;
  roomName: string;
  roomParticipants: UserInfo[];
};

export type ChatMessage = {
  user: string;
  photo: string;
  text: string;
  timestamp: string;
};

export type DirectMessage = {
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
};
