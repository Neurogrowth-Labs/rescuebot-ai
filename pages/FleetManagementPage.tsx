import React, { useState } from 'react';
import { Bot, Battery, MapPin, Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface Robot {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  health: number;
  position: { x: number; y: number };
  currentMission: string | null;
  victimsRescued: number;
  uptime: string;
  lastSync: string;
}

const FleetManagementPage: React.FC = () => {
  const [robots] = useState<Robot[]>([
    {
      id: 'RB-001',
      name: 'Alpha',
      status: 'active',
      battery: 85,
      health: 92,
      position: { x: 12, y: 8 },
      currentMission: 'Urban Disaster Response',
      victimsRescued: 3,
      uptime: '2h 34m',
      lastSync: '2s ago'
    },
    {
      id: 'RB-002',
      name: 'Bravo',
      status: 'idle',
      battery: 100,
      health: 100,
      position: { x: 0, y: 0 },
      currentMission: null,
      victimsRescued: 0,
      uptime: '0h 12m',
      lastSync: '1s ago'
    },
    {
      id: 'RB-003',
      name: 'Charlie',
      status: 'charging',
      battery: 45,
      health: 88,
      position: { x: 0, y: 0 },
      currentMission: null,
      victimsRescued: 2,
      uptime: '1h 48m',
      lastSync: '3s ago'
    },
    {
      id: 'RB-004',
      name: 'Delta',
      status: 'active',
      battery: 62,
      health: 95,
      position: { x: 18, y: 15 },
      currentMission: 'Wildfire Search',
      victimsRescued: 1,
      uptime: '3h 12m',
      lastSync: '1s ago'
    },
    {
      id: 'RB-005',
      name: 'Echo',
      status: 'maintenance',
      battery: 0,
      health: 65,
      position: { x: 0, y: 0 },
      currentMission: null,
      victimsRescued: 0,
      uptime: '0h 00m',
      lastSync: '15m ago'
    },
  ]);

  const [selectedRobot, setSelectedRobot] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'idle': return 'text-blue-400 bg-blue-500/20';
      case 'charging': return 'text-amber-400 bg-amber-500/20';
      case 'maintenance': return 'text-orange-400 bg-orange-500/20';
      case 'offline': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Activity;
      case 'idle': return Clock;
      case 'charging': return Zap;
      case 'maintenance': return AlertTriangle;
      default: return Bot;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-400';
    if (battery > 30) return 'text-amber-400';
    return 'text-red-400';
  };

  const activeRobots = robots.filter(r => r.status === 'active').length;
  const totalVictimsRescued = robots.reduce((sum, r) => sum + r.victimsRescued, 0);
  const avgBattery = Math.round(robots.reduce((sum, r) => sum + r.battery, 0) / robots.length);
  const avgHealth = Math.round(robots.reduce((sum, r) => sum + r.health, 0) / robots.length);

  const selected = robots.find(r => r.id === selectedRobot);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Fleet Management</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and control your robot fleet</p>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Bot className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{robots.length}</div>
          <div className="text-sm text-slate-400">Total Robots</div>
          <div className="text-xs text-green-400 mt-1">{activeRobots} active</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{totalVictimsRescued}</div>
          <div className="text-sm text-slate-400">Victims Rescued</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Battery className="text-amber-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{avgBattery}%</div>
          <div className="text-sm text-slate-400">Avg Battery</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="text-emerald-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{avgHealth}%</div>
          <div className="text-sm text-slate-400">Avg Health</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot List */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Fleet Status</h3>

          <div className="space-y-3">
            {robots.map((robot) => {
              const StatusIcon = getStatusIcon(robot.status);

              return (
                <div
                  key={robot.id}
                  onClick={() => setSelectedRobot(robot.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedRobot === robot.id
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } border`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Bot size={24} className="text-blue-400" />
                      <div>
                        <div className="font-bold text-slate-200">{robot.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{robot.id}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(robot.status)}`}>
                      <StatusIcon size={14} />
                      <span className="capitalize">{robot.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Battery</div>
                      <div className={`font-bold ${getBatteryColor(robot.battery)}`}>
                        {robot.battery}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Health</div>
                      <div className="font-bold text-slate-200">{robot.health}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Position</div>
                      <div className="font-bold text-slate-200 font-mono text-xs">
                        {robot.position.x}, {robot.position.y}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Rescued</div>
                      <div className="font-bold text-green-400">{robot.victimsRescued}</div>
                    </div>
                  </div>

                  {robot.currentMission && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="text-xs text-slate-400">Current Mission</div>
                      <div className="text-sm text-slate-200 font-medium">{robot.currentMission}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Robot Details */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Robot Details</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Robot ID</div>
                    <div className="text-slate-200 font-mono">{selected.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Name</div>
                    <div className="text-slate-200 font-medium">{selected.name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Status</div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selected.status)}`}>
                      {React.createElement(getStatusIcon(selected.status), { size: 16 })}
                      <span className="capitalize">{selected.status}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Battery Level</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            selected.battery > 60 ? 'bg-green-500' :
                            selected.battery > 30 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selected.battery}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getBatteryColor(selected.battery)}`}>
                        {selected.battery}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Health Status</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${selected.health}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{selected.health}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Uptime</div>
                    <div className="text-slate-200">{selected.uptime}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Last Sync</div>
                    <div className="text-slate-200">{selected.lastSync}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Start Mission
                  </button>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors">
                    Return to Base
                  </button>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Enter Maintenance
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center text-slate-400 py-8">
                <Bot size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a robot to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetManagementPage;
