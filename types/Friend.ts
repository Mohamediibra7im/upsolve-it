export interface FriendSummary {
  _id: string;
  codeforcesHandle: string;
  avatar: string;
  rating: number;
  rank: string;
}

export interface FriendsListResponse {
  friends: FriendSummary[];
}

export interface FriendRequestRowIncoming {
  _id: string;
  createdAt?: string;
  from: FriendSummary;
}

export interface FriendRequestRowOutgoing {
  _id: string;
  createdAt?: string;
  to: FriendSummary;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestRowIncoming[];
  outgoing: FriendRequestRowOutgoing[];
}
