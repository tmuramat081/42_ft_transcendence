import { Valueof } from '../types/global';

// エラーメッセージ定数
export const API_ERROR_MESSAGE = {
  // 業務ロジックエラー
  BUSINESS_LOGIC: {
    MAX_GAME_ENTRY_REACHED: 'ルームの参加者数が定員に達しています。',
  },
} as const;

export const TABLE_NAME = {
  GAME_ROOM: 'ゲームルーム',
  GAME_ENTRY: 'ゲーム参加者',
} as const;

export function NotFoundMessage(tableName: Valueof<typeof TABLE_NAME>) {
  return `${tableName}が存在しません。`;
}
