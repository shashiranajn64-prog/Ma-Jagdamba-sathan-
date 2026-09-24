export type DonationStatus = 'Pending' | 'Approved' | 'Rejected';
export type DonationType = 'Online' | 'Cash';

export interface Donation {
  id: string;
  donorName: string;
  mobile: string;
  email?: string;
  amount: number;
  donationType: DonationType;
  paymentMethod: string; // e.g. 'UPI', 'Bank Transfer', 'Cash', 'QR Code'
  purpose: string; // e.g. 'General Donation', 'Annadan', 'Mandir Nirman', 'Navratri Puja'
  paymentProofUrl?: string;
  status: DonationStatus;
  staffId?: string;
  staffName?: string;
  receiptNumber?: string;
  address?: string;
  notes?: string;
  donorPhotoUrl?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  approvedBy?: string;
  deletedAt?: any;
}

export interface Staff {
  id: string;
  fullName: string;
  photoUrl?: string;
  mobile: string;
  address: string;
  designation: string;
  joiningDate: string;
  staffIdCode: string;
  email: string;
  password?: string;
  isActive: boolean;
  createdAt: any;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  category: 'Temple' | 'Navratri' | 'Durga Puja' | 'Events' | 'Bhajan/Kirtan' | 'Community Service' | 'Other';
  eventDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadedBy: string;
  uploadedByName: string;
  createdAt: any;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'High' | 'Urgent';
  publishDate: string;
  expiryDate: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: any;
}

export interface NavratriDay {
  dayNumber: number;
  deviName: string;
  date: string;
  imageUrl: string;
  pujaDetails: string;
  timing: string;
  bhogPrasad: string;
  specialProgram: string;
  description: string;
  katha?: string;
  mantra?: string;
  pujanVidhi?: string;
}

export interface SiteSettings {
  templeName: string;
  heroHeading: string;
  heroDescription: string;
  heroImageUrl: string;
  aboutText: string;
  address: string;
  contactNumber: string;
  email: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    whatsapp?: string;
  };
  footerText: string;
  upiId: string;
  upiName: string;
  qrCodeUrl: string;
  donationInstructions: string;
  showDonorNamesPublicly: boolean;
  whatsappApiKey?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  role: string;
  action: string;
  details: string;
  recordId?: string;
  timestamp: any;
}
