export interface TemperatureLog {
  id: string;
  locationName: string;
  temperature: number;
  timestamp: string;
  checkedBy: string;
  notes?: string;
  status: 'safe' | 'warning' | 'danger';
}

export interface Location {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
  type: 'freezer' | 'refrigerator' | 'hot-holding';
}