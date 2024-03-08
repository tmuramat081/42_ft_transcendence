export type User = {
  userId: number;
  userName: string;
  email: string;
  icon: string;
  twoFactorAuth: boolean;
  name42: string;
  friends: User[];
  blocked: User[];
};
