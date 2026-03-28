export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  parentId?: string | null;
  level?: number;
  displayOrder?: number;
  image?: string;
  icon?: string;
  iconEmoji?: string;
  featured?: boolean;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  introContent?: string;
  faq?: Array<{ question: string; answer: string }>;
  facetGroups?: Array<{ facetName: string; expanded?: boolean }>;
  seo?: Record<string, unknown>;
  seoContent?: Record<string, unknown>;
  buyingGuide?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
  heroImageId?: string;
  iconId?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  fullDescription?: Record<string, unknown>;
  primaryCategoryId?: string | null;
  brand?: string;
  status?: string;
  availability?: string;
  purchaseMode?: string;
  leadTime?: string;
  minOrderQuantity?: number;
  packageQty?: number;
  packageUnit?: string;
  weight?: number;
  pricing?: {
    costPrice?: number;
    basePrice?: number;
    compareAtPrice?: number;
    currency?: string;
    priceUnit?: string;
    tieredPricing?: Array<{ minQty: number; maxQty?: number; unitPrice: number }>;
  };
  specifications?: Array<{ label: string; value: string; unit?: string }> | Record<string, unknown>;
  faq?: Array<{ question: string; answer: string }>;
  relatedProducts?: string[];
  images?: string;
  externalImageUrl?: string;
  additionalImageUrls?: string[];
  categories?: Array<Record<string, unknown>>;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  sourceUrl?: string;
  shippingInfo?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  primaryImageId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  source?: string;
  customerRefId?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  items?: Array<{
    productName?: string;
    sku?: string;
    quantity?: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  shipping?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    trackingNumber?: string;
  };
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
  currency?: string;
  payment?: Record<string, unknown>;
  customerNotes?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  source?: string;
  shippingAddresses?: Array<Record<string, unknown>>;
  billingInfo?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  featured?: boolean;
  seo?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  heroImageUrl?: string;
  iconEmoji?: string;
  relatedIndustries?: string[];
  features?: Array<{ title: string; description: string; icon?: string }>;
  applications?: Array<{ title: string; description: string }>;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  status?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RfqSubmission {
  id: string;
  submittedAt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
  };
  inquiry?: {
    quantity?: number;
    message?: string;
  };
  customerRefId?: string;
  status: string;
  notes?: string;
  source?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactSubmission {
  id: string;
  submittedAt?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  newRfqs: number;
  newContacts: number;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total: number;
}