export interface Account {
  _id: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  state: 'online' | 'offline';
}
