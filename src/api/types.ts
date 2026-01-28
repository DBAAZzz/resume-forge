export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
}

export interface Resume {
  id: string;
  title: string;
  summary: string;
  lastUpdated: string;
  status: 'draft' | 'published';
  completionScore: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
