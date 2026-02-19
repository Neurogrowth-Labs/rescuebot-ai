import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Clock, Zap, Target } from 'lucide-react';

// Mock data for analytics
const missionData = [
  { name: 'Mon', missions: 12, successful: 11, avgTime: 18 },
  { name: 'Tue', missions: 15, successful: 14, avgTime: 16 },
  { name: 'Wed', missions: 18, successful: 17, avgTime: 15 },
  { name: 'Thu', missions: 14, successful: 13, avgTime: 17 },
  { name: 'Fri', missions: 20, successful: 19, avgTime: 14 },
  { name: 'Sat', missions: 16, successful: 15, avgTime: 16 },
  { name: 'Sun', missions: 13, successful: 12, avgTime: 17 },
];

const phaseData = [
  { name: 'Exploration', value: 28, color: '#3b82f6' },
  { name: 'Navigation', value: 22, color: '#10b981' },
  { name: 'Rescue Ops', value: 18, color: '#f59e0b' },
  { name: 'Hazard Avoid', value: 15, color: '#ef4444' },
  { name: 'Decision', value: 10, color: '#8b5cf6' },
  { name: 'Idle', value: 7, color: '#6b7280' },
];

const performanceData = [
  { time: '00:00', battery: 100, efficiency: 95 },
  { time: '05:00', battery: 85, efficiency: 92 },
  { time: '10:00', battery: 70, efficiency: 88 },
  { time: '15:00', battery: 55, efficiency: 85 },
  { time: '20:00', battery: 40, efficiency: 82 },
  { time: '25:00', battery: 25, efficiency: 78 },
  { time: '30:00', battery: 100, efficiency: 95 },
];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const stats = [
    { label: 'Total Missions', value: '108', change: '+12%', icon: Target, color: 'blue' },
    { label: 'Avg Mission Time', value: '16.2m', change: '-8%', icon: Clock, color: 'green' },
    { label: 'Success Rate', value: '94.4%', change: '+2.1%', icon: TrendingUp, color: 'emerald' },
    { label: 'Efficiency Score', value: '87.5', change: '+5%', icon: Zap, color: 'amber' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Mission performance and insights</p>
        </div>

        <div className="flex gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`text-${stat.color}-400`} size={24} />
                </div>
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-200 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Success Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Mission Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={missionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="missions" fill="#3b82f6" name="Total Missions" />
              <Bar dataKey="successful" fill="#10b981" name="Successful" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Phase Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Phase Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={phaseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {phaseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Over Time */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="battery" stroke="#3b82f6" name="Battery %" strokeWidth={2} />
              <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Missions Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-200 mb-4">Recent Missions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Mission ID</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Scenario</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Duration</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Victims</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {[
                { id: 'MSN-2047', scenario: 'Urban Disaster', duration: '14m 32s', victims: 3, status: 'Success' },
                { id: 'MSN-2046', scenario: 'Wildfire', duration: '18m 12s', victims: 2, status: 'Success' },
                { id: 'MSN-2045', scenario: 'Earthquake', duration: '22m 45s', victims: 4, status: 'Success' },
                { id: 'MSN-2044', scenario: 'Industrial', duration: '16m 08s', victims: 2, status: 'Partial' },
                { id: 'MSN-2043', scenario: 'Urban Disaster', duration: '12m 56s', victims: 1, status: 'Success' },
              ].map((mission) => (
                <tr key={mission.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 font-mono text-blue-400">{mission.id}</td>
                  <td className="py-3">{mission.scenario}</td>
                  <td className="py-3">{mission.duration}</td>
                  <td className="py-3">{mission.victims}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mission.status === 'Success'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {mission.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
