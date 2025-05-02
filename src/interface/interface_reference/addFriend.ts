export interface AddFriend {
    _id: string;
    senderId: string;
    receiverId: string;
    status: 'approved' | 'pending' | 'rejected';
    message?: string;
    createdAt: number;
    acceptedAt?: number;
  }
  