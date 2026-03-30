import type { ApiResponse, PageResponse, Category, Product, Order, Customer, Brand, Industry, RfqSubmission, ContactSubmission, DashboardStats, Redirect, GlossaryTerm, Article } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Generic request methods for dynamic API calls
export const apiClient = {
  get: <T>(url: string, params?: Record<string, any>) => {
    const q = params ? new URLSearchParams(params) : null;
    return request<T>(`${url}${q ? `?${q}` : ''}`);
  },
  post: <T>(url: string, data: any) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// Categories
export const getCategories = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Category>>>(`/categories?${q}`);
};
export const getCategory = (id: string) => request<ApiResponse<Category>>(`/categories/${id}`);
export const getTopLevelCategories = () => request<ApiResponse<Category[]>>('/categories/top-level');
export const getSubcategories = (id: string) => request<ApiResponse<Category[]>>(`/categories/${id}/subcategories`);
export const createCategory = (data: Partial<Category>) => request<ApiResponse<Category>>('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: string, data: Partial<Category>) => request<ApiResponse<Category>>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: string) => request<ApiResponse<void>>(`/categories/${id}`, { method: 'DELETE' });
export const findCategoryByName = (name: string, parentId?: string | null) => {
  const params = new URLSearchParams({ name });
  if (parentId) params.append('parentId', parentId);
  return request<ApiResponse<Category | null>>(`/categories/by-name?${params}`);
};

// Products
export const getProducts = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  categoryId?: string;
  brandId?: string;
  availability?: string;
  sku?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  if (params.categoryId) q.set('categoryId', params.categoryId);
  if (params.brandId) q.set('brandId', params.brandId);
  if (params.availability) q.set('availability', params.availability);
  if (params.sku) q.set('sku', params.sku);
  if (params.startDate) q.set('startDate', params.startDate);
  if (params.endDate) q.set('endDate', params.endDate);
  return request<ApiResponse<PageResponse<Product>>>(`/products?${q}`);
};
export const getAllProducts = () => request<ApiResponse<Product[]>>('/products/all');
export const getProduct = (id: string) => request<ApiResponse<Product>>(`/products/${id}`);
export const createProduct = (data: Partial<Product>) => request<ApiResponse<Product>>('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string, data: Partial<Product>) => request<ApiResponse<Product>>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: string) => request<ApiResponse<void>>(`/products/${id}`, { method: 'DELETE' });

// Orders
export const getOrders = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Order>>>(`/orders?${q}`);
};
export const getOrder = (id: string) => request<ApiResponse<Order>>(`/orders/${id}`);
export const createOrder = (data: Partial<Order>) => request<ApiResponse<Order>>('/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrder = (id: string, data: Partial<Order>) => request<ApiResponse<Order>>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteOrder = (id: string) => request<ApiResponse<void>>(`/orders/${id}`, { method: 'DELETE' });

// Customers
export const getCustomers = (params: { page?: number; pageSize?: number; source?: string; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.source) q.set('source', params.source);
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Customer>>>(`/customers?${q}`);
};
export const getCustomer = (id: string) => request<ApiResponse<Customer>>(`/customers/${id}`);
export const createCustomer = (data: Partial<Customer>) => request<ApiResponse<Customer>>('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id: string, data: Partial<Customer>) => request<ApiResponse<Customer>>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id: string) => request<ApiResponse<void>>(`/customers/${id}`, { method: 'DELETE' });

// Brands
export const getBrands = (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Brand>>>(`/brands?${q}`);
};
export const getAllBrands = () => request<ApiResponse<Brand[]>>('/brands/all');
export const getBrand = (id: string) => request<ApiResponse<Brand>>(`/brands/${id}`);
export const createBrand = (data: Partial<Brand>) => request<ApiResponse<Brand>>('/brands', { method: 'POST', body: JSON.stringify(data) });
export const updateBrand = (id: string, data: Partial<Brand>) => request<ApiResponse<Brand>>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBrand = (id: string) => request<ApiResponse<void>>(`/brands/${id}`, { method: 'DELETE' });

// RFQ Submissions
export const getRfqSubmissions = (params: { page?: number; pageSize?: number; status?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.status) q.set('status', params.status);
  return request<ApiResponse<PageResponse<RfqSubmission>>>(`/rfq-submissions?${q}`);
};
export const getRfqSubmission = (id: string) => request<ApiResponse<RfqSubmission>>(`/rfq-submissions/${id}`);
export const updateRfqStatus = (id: string, status: string, notes?: string) => request<ApiResponse<RfqSubmission>>(`/rfq-submissions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) });

// Contact Submissions
export const getContactSubmissions = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<ContactSubmission>>>(`/contact-submissions?${q}`);
};
export const getContactSubmission = (id: string) => request<ApiResponse<ContactSubmission>>(`/contact-submissions/${id}`);
export const updateContactStatus = (id: string, status: string, notes?: string) => request<ApiResponse<ContactSubmission>>(`/contact-submissions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) });

// Dashboard
export const getDashboardStats = () => request<ApiResponse<DashboardStats>>('/dashboard/stats');

// Redirects
export const getRedirects = (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Redirect>>>(`/redirects?${q}`);
};
export const createRedirect = (data: Partial<Redirect>) => request<ApiResponse<Redirect>>('/redirects', { method: 'POST', body: JSON.stringify(data) });
export const updateRedirect = (id: string, data: Partial<Redirect>) => request<ApiResponse<Redirect>>(`/redirects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRedirect = (id: string) => request<ApiResponse<void>>(`/redirects/${id}`, { method: 'DELETE' });

// Industries
export const getIndustries = (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Industry>>>(`/industries?${q}`);
};
export const createIndustry = (data: Partial<Industry>) => request<ApiResponse<Industry>>('/industries', { method: 'POST', body: JSON.stringify(data) });
export const updateIndustry = (id: string, data: Partial<Industry>) => request<ApiResponse<Industry>>(`/industries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteIndustry = (id: string) => request<ApiResponse<void>>(`/industries/${id}`, { method: 'DELETE' });

// Glossary Terms
export const getGlossaryTerms = (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<GlossaryTerm>>>(`/glossary-terms?${q}`);
};
export const createGlossaryTerm = (data: Partial<GlossaryTerm>) => request<ApiResponse<GlossaryTerm>>('/glossary-terms', { method: 'POST', body: JSON.stringify(data) });
export const updateGlossaryTerm = (id: string, data: Partial<GlossaryTerm>) => request<ApiResponse<GlossaryTerm>>(`/glossary-terms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGlossaryTerm = (id: string) => request<ApiResponse<void>>(`/glossary-terms/${id}`, { method: 'DELETE' });

// Articles
export const getArticles = (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 20));
  if (params.search) q.set('search', params.search);
  return request<ApiResponse<PageResponse<Article>>>(`/articles?${q}`);
};
export const createArticle = (data: Partial<Article>) => request<ApiResponse<Article>>('/articles', { method: 'POST', body: JSON.stringify(data) });
export const updateArticle = (id: string, data: Partial<Article>) => request<ApiResponse<Article>>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteArticle = (id: string) => request<ApiResponse<void>>(`/articles/${id}`, { method: 'DELETE' });

// Image Upload
export const uploadImage = async (file: File, folder: string = 'products'): Promise<{ url: string; filename: string; size: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(`${API_URL}/upload/image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  const res = await fetch(`${API_URL}/upload/image?url=${encodeURIComponent(imageUrl)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Delete failed: ${res.status}`);
  }
};