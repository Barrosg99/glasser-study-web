export interface Chat {
  id: string;
  name: string;
  description: string;
  members: Member[];
  isModerator: boolean;
  isInvited: boolean;
}

export interface Message {
  id: string;
  content: string;
  isCurrentUser: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  chat: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface Member {
  user: {
    id: string;
    name: string;
    email: string;
  };
  isInvited: boolean;
  isModerator: boolean;
}
