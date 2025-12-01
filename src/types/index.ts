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
  uploadedBy: string; 
  createdAt: Date;
  notes?: {
    [userId: string]: {
      text: string;
      updatedAt: Date;
    };
  };
}

export interface Annotation {
  _id?: string;
  videoId: string;
  userId: string;
  timestamp: number;
  label: 'in_zone' | 'out_of_zone' | 'change';
  createdAt: Date;
}

export interface AnnotationWithUserInfo extends Annotation {
  username?: string;
  userEmail?: string;
}

export interface VideoNote {
  _id?: string;
  videoId: string;
  userId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoNoteWithUserInfo extends VideoNote {
  username?: string;
  userEmail?: string;
}