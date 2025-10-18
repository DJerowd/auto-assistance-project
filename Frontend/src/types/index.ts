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