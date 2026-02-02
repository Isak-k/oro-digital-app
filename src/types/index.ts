// Firestore type definitions for ORO DIGITAL

export interface Admin {
  name: string;
  email: string;
  role: 'primary';
  createdAt: Date;
}

export interface Student {
  id?: string;
  fullName: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface StudentRequest {
  id?: string;
  fullName: string;
  phone: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Course {
  id?: string;
  courseName: string;
  category: string;
  monthlyPrice: number;
  duration: string;
  active: boolean;
}

export interface Registration {
  id?: string;
  studentId: string;
  courseId: string;
  month: number;
  year: number;
  paymentStatus: 'paid' | 'unpaid';
  createdAt: Date;
}

export interface Payment {
  id?: string;
  studentId: string;
  amount: number;
  month: number;
  year: number;
  method: string;
  createdAt: Date;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  language: 'en' | 'om' | 'am';
  visibleOnHome: boolean;
  adminOnly: boolean;
  createdAt: Date;
}

export interface News {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
}

export interface Notification {
  id?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Language options
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'om', name: 'Afaan Oromoo' },
  { code: 'am', name: 'Amharic' },
] as const;

// Course categories
export const COURSE_CATEGORIES = [
  'Computer Basics',
  'Microsoft Office',
  'Programming',
  'Web Development',
  'Graphic Design',
  'Data Entry',
  'Networking',
  'Database',
  'Other',
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Other',
] as const;
