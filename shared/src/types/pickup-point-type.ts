export type DayOfWeek = 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'sunday';

export interface WorkingHoursType {
  id: number;
  dayOfWeek: DayOfWeek;
  openingTime: string; // Формат "HH:MM:SS"
  closingTime: string; // Формат "HH:MM:SS"
}

export interface PickupPointType {
  id: number;
  name: string;
  fullAddress: string;
  postal_code: string;
  fias_id: string;
  geo_lat: string;
  geo_lon: string;
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string; // ISO строка даты
  updatedAt: string; // ISO строка даты
  workingHours: WorkingHoursType[];
}