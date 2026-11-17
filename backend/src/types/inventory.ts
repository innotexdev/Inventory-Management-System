import type { ItemStatusView } from "../lib/item-status";

export interface CategoryView {
  id: string;
  name: string;
  description: string | null;
}

export interface PersonView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ItemHolderView extends PersonView {
  team: { id: string; name: string } | null;
}

export interface ItemView {
  id: string;
  assetTag: string;
  name: string;
  category: CategoryView;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: ItemStatusView;
  purchaseDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  currentHolder: ItemHolderView | null;
}

export interface AssignmentView {
  id: string;
  assignedAt: string;
  returnedAt: string | null;
  note: string | null;
  item: { id: string; assetTag: string; name: string };
  user: PersonView;
  assignedBy: PersonView;
  returnedBy: PersonView | null;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface CategoryStatsView {
  id: string;
  name: string;
  total: number;
  assigned: number;
  available: number;
}

export interface InventoryStatsView {
  total: number;
  byStatus: Record<ItemStatusView, number>;
  byCategory: CategoryStatsView[];
}

export interface UserView extends PersonView {
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  teamId: string | null;
  team: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
  heldItemsCount: number;
}
