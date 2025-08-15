export interface User {
  _id?: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Video {
  _id?: string;
  title: string;
  filename: string;
  originalName: string;
  path: string;
  duration?: number;
  uploadedBy: string; // User ID
  createdAt: Date;
}

export interface Annotation {
  _id?: string;
  videoId: string;
  userId: string;
  timestamp: number; // in seconds
  label: 'up' | 'down';
  createdAt: Date;
}

export interface AnnotationWithUserInfo extends Annotation {
  username?: string;
  userEmail?: string;
}
