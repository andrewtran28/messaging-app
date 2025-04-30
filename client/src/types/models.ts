export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileIcon?: string;
};

export type ChatMember = {
  userId: string;
  user: User;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  user: User;
  readReceipts?: { user: User }[];
};
