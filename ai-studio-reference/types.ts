
export enum MenuStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED'
}

export interface MenuItem {
  id: string;
  name: string;
  school: string;
  date: string;
  calories: number;
  protein: number;
  status: MenuStatus;
}

export interface DashboardStats {
  totalMeals: number;
  activeSchools: number;
  complianceRate: number;
  pendingReviews: number;
}

export interface AIInsight {
  analysis: string;
  suggestions: string[];
  complianceScore: number;
}
