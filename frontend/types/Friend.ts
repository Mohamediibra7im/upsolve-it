/** How someone stands with their upsolving. Numbers only. */
export interface UpsolveStanding {
  /** Problems still waiting in their queue. */
  waiting: number;
  /** When the oldest waiting problem was added; null with nothing waiting. */
  oldestAt: string | null;
  /** Days in a row with a solved upsolve; 0 once the run has ended. */
  streak: number;
}

export interface FriendSummary {
  _id: string;
  codeforcesHandle: string;
  avatar: string;
  glyphAvatar?: string;
  rating: number;
  rank: string;
  /** Present on the friends list, not on friend requests. */
  upsolve?: UpsolveStanding;
}

export interface FriendsListResponse {
  friends: FriendSummary[];
  /** The caller's own numbers, to stand among their friends. */
  me?: UpsolveStanding;
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
