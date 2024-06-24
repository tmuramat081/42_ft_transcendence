export type User = {
  userId: number;
  userName: string;
  email: string;
  icon: string;
  createdAt: Date;
  deletedAt: Date;
  twoFactorAuth: boolean;
  name42: string;
  friends: User[];
  blocked: User[];
  point: number;
};
