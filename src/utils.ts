export const getTemperatureStatus = (temp: number, minTemp: number, maxTemp: number): 'safe' | 'warning' | 'danger' => {
  if (temp >= minTemp && temp <= maxTemp) {
    return 'safe';
  }
  
  const buffer = 2; // 2°F buffer zone
  if (
    (temp >= minTemp - buffer && temp < minTemp) ||
    (temp <= maxTemp + buffer && temp > maxTemp)
  ) {
    return 'warning';
  }
  
  return 'danger';
};

export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°F`;
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString();
};