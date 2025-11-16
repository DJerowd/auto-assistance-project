export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface Kpi {
  totalVehicles: number;
  pendingReminders: number;
  totalCostLastYear: number;
  nextReminder: {
    id: number;
    service_type: string;
    date_threshold: string;
  } | null;
}

export interface ChartData {
  maintenanceCostByMonth: { month: string; totalCost: string }[];
  maintenancesByType: { service_type: string; count: string }[];
}

export interface DashboardData {
  kpi: Kpi;
  charts: ChartData;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Color {
  id: number;
  name: string;
  hex: string;
}

export interface VehicleOptions {
  brands: Brand[];
  colors: Color[];
}

export interface VehicleImage {
  id: number;
  image_path: string;
  is_primary: number;
  url: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  model: string;
  version: string;
  brand_name: string;
  color_name: string;
  license_plate: string;
  year_of_manufacture: number | string;
  year_model: number;
  current_mileage: number;
  nickname?: string;
  images: VehicleImage[];
  brand_id: number | string;
  color_id: number | string;
}

export type VehicleFormData = Omit<
  Vehicle,
  "id" | "user_id" | "brand_name" | "color_name" | "images"
>;

export interface Maintenance {
  id: number;
  vehicle_id: number;
  service_type: string;
  maintenance_date: string;
  mileage: number;
  cost: number;
  service_provider?: string;
  notes?: string;
}

export type MaintenanceFormData = Omit<Maintenance, 'id' | 'vehicle_id'>;