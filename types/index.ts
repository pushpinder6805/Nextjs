export interface Listing {
  id: number;   
  documentId: string;
  title: string;
  subtitle?: string;
  description: string;
  slug: string;
  featured: boolean;
  approvalStatus: "draft" | "published" | "pending";
  phone: string;
  email?: string;
  price?: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  images: Image[];
  category: Category;
  city: City;
  tags: Tag[];
  linkTargetType?: "internal" | "external" | "bbs";
  linkTargetValue?: string;
  websiteUrl?: string;
  bbsThreadUrl?: string;
  advertiserId?: number;
  homepagePosition?: number;
  categoryPosition?: number;
}

export interface Image {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
    large: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path: string | null;
  url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: Image | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  description?: string;
  link: string | null;
  placement: "home" | "listings" | "sidebar" | "footer";
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  image: Image;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  category?: string;
  city?: string;
  featured?: boolean;
  tags?: string[];
  slug?: string;
  approvalStatus?: "draft" | "published" | "pending";
}

export interface ListingFormData {
  title: string;
  subtitle?: string;
  description: string;
  phone: string;
  email?: string;
  address?: string;
  price?: string;
  featured?: boolean;
  approvalStatus?: "draft" | "published" | "pending";
  category: number;
  city: number;
  tags: number[];
  images: File[];
  linkTargetType?: "internal" | "external" | "bbs";
  linkTargetValue?: string;
  websiteUrl?: string;
  bbsThreadUrl?: string;
  advertiserId?: number;
  homepagePosition?: number;
  categoryPosition?: number;
  published?: boolean;
}

export interface LoginFormData {
  identifier: string; // Email or username
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  };
} 