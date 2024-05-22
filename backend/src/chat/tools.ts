/*eslint-disable*/

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
  senderId: number;
  recipientId: number;
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

export function convertDurationToMs(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);

  switch (unit) {
    case 'm': // 分
      return value * 60000; // 1分 = 60000ミリ秒
    case 'd': // 日
      return value * 86400000; // 1日 = 86400000ミリ秒
    case 'w': // 週
      return value * 7 * 86400000; // 1週間 = 7日 * 86400000ミリ秒
    case 'M': // 月
      return value * 30 * 86400000; // 1ヶ月 = 30日 * 86400000ミリ秒 (単純化)
    default:
      throw new Error('Unsupported duration unit');
  }
}
