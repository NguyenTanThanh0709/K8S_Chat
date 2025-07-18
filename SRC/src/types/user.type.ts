type Role = 'User' | 'Admin'

export interface User {
  _id: string
  roles: Role[]
  email: string
  name?: string
  date_of_birth?: string // ISO 8610
  avatar?: string
  address?: string
  phone?: string
  status?: string
  password_hash?: string
  createdAt: string
  updatedAt: string
}

export interface GroupReponse {
  id: string
  name: string
  owner_phone: string
  created_at: string
  last_message: string
  last_message_date: string
  unread_count: number
}

export interface Group {
  group_id: string
  role: string
  joined_at: string
  group_name: string
  group_created_at: string
}


export interface FriendListResponse {
  friends: {
    user: User;
    last_message: string;
    last_message_date: string;
    unread_count:number;
  }[];
}

export interface friends {
    user: User;
    last_message: string;
    last_message_date: string;
    unread_count:number;
}



export interface FriendRequest {
  senderPhone: string
  receiverPhone: string
}

