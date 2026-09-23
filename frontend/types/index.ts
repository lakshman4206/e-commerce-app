export type Role = "ADMIN" | "CUSTOMER";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface SafeUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isFeatured: boolean;
  isArchived: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CartItemProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  stockQuantity: number;
  quantity: number;
}
