import React, { useState } from 'react';
import { Thermometer, Plus, AlertTriangle, CheckCircle, XCircle, History, ClipboardList, PieChart, Download } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { TemperatureLog, Location } from './types';
import { getTemperatureStatus, formatTemperature, formatDateTime } from './utils';
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [locations] = useState<Location[]>([
    { id: '1', name: 'Walk-in Freezer', minTemp: -10, maxTemp: 0, type: 'freezer' },
    { id: '2', name: 'Main Refrigerator', minTemp: 33, maxTemp: 40, type: 'refrigerator' },
    { id: '3', name: 'Hot Food Station', minTemp: 135, maxTemp: 165, type: 'hot-holding' },
  ]);

  const [logs, setLogs] = useState<TemperatureLog[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0].id);
  const [temperature, setTemperature] = useState<string>('');
  const [checkedBy, setCheckedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const location = locations.find(loc => loc.id === selectedLocation)!;
    const temp = parseFloat(temperature);
    
    const newLog: TemperatureLog = {
      id: Date.now().toString(),
      locationName: location.name,
      temperature: temp,
      timestamp: new Date().toISOString(),
      checkedBy,
      notes,
      status: getTemperatureStatus(temp, location.minTemp, location.maxTemp)
    };

    setLogs(prev => [newLog, ...prev]);
    setTemperature('');
    setCheckedBy(''); // Clear the checkedBy field
    setNotes('');
  };

  const getLocationRangeText = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? `${location.minTemp}°F to ${location.maxTemp}°F` : '';
  };

  const getChartData = () => {
    const locationData = locations.reduce((acc, location) => {
      acc[location.name] = logs.filter(log => log.locationName === location.name).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(locationData),
      datasets: [
        {
          data: Object.values(locationData),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getStatusChartData = () => {
    const statusCounts = {
      safe: logs.filter(log => log.status === 'safe').length,
      warning: logs.filter(log => log.status === 'warning').length,
      danger: logs.filter(log => log.status === 'danger').length,
    };

    return {
      labels: ['Safe', 'Warning', 'Danger'],
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, "temperature_logs.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Thermometer className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">Temperature Logger</h1>
                <p className="text-sm text-gray-500 mt-1">Food Safety Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <History className="h-5 w-5 mr-1" />
                <span>{logs.length} Logs</span>
              </div>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-1" />
                <span>{locations.length} Locations</span>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Logs
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Temperature Log Form */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Record Temperature
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Acceptable range: {getLocationRangeText(selectedLocation)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Enter temperature..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checked By</label>
                <input
                  type="text"
                  required
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Temperature Log
              </button>
            </form>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Temperature Analytics
              </h2>
            </div>
            <div className="p-6">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No data available for analysis</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location Distribution</h3>
                    <div className="h-64">
                      <Pie data={getChartData()} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Status</h3>
                    <div className="h-64">
                      <Pie data={getStatusChartData()} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Temperature Logs Display */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <History className="h-5 w-5 mr-2" />
                Recent Temperature Logs
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No temperature logs recorded yet.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{log.locationName}</span>
                          {log.status === 'safe' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Safe
                            </span>
                          )}
                          {log.status === 'warning' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Warning
                            </span>
                          )}
                          {log.status === 'danger' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-4 w-4 mr-1" />
                              Danger
                            </span>
                          )}
                        </div>
                        <span className="text-2xl font-semibold text-gray-900">
                          {formatTemperature(log.temperature)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>Checked by {log.checkedBy}</span>
                        </div>
                        <span>{formatDateTime(log.timestamp)}</span>
                      </div>
                      {log.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;