import { User } from '../users/entities/user.entity';

export interface UserInfo {
  userId: number;
  userName: string;
  icon: string;
}

export interface UserData {
  user: UserInfo;
  email: string;
  createdAt: string;
  name42: string;
}

export interface ChatMessage {
  user: string;
  photo: string;
  text: string;
  timestamp: string;
}

export interface DirectMessage {
  sender: User;
  recipient: User;
  text: string;
  timestamp: string;
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  };
  return date.toLocaleString('ja-JP', options);
}
