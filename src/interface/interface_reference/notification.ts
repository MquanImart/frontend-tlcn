export interface Notification {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    status: 'read' | 'unread';
    url?: string;
    readAt?: number;
    createdAt: number;
    _destroy?: number;
  }
  