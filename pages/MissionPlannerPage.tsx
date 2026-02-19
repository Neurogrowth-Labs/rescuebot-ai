import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Play, Save, AlertCircle } from 'lucide-react';

interface Waypoint {
  id: string;
  x: number;
  y: number;
  type: 'explore' | 'rescue' | 'checkpoint';
  priority: number;
  notes: string;
}

const MissionPlannerPage: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [gridSize] = useState(20);

  const addWaypoint = (x: number, y: number) => {
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      x,
      y,
      type: 'explore',
      priority: waypoints.length + 1,
      notes: ''
    };
    setWaypoints([...waypoints, newWaypoint]);
    setSelectedWaypoint(newWaypoint.id);
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
    if (selectedWaypoint === id) {
      setSelectedWaypoint(null);
    }
  };

  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setWaypoints(waypoints.map(wp => wp.id === id ? { ...wp, ...updates } : wp));
  };

  const selectedWp = waypoints.find(wp => wp.id === selectedWaypoint);

  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'explore': return 'bg-blue-500';
      case 'rescue': return 'bg-red-500';
      case 'checkpoint': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Mission Planner</h1>
          <p className="text-slate-400 text-sm mt-1">Plan waypoints and mission routes</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors">
            <Save size={18} />
            Save Plan
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Play size={18} />
            Execute Mission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Grid */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-200">Mission Grid</h3>
            <div className="text-xs text-slate-400">
              Click to add waypoints • {waypoints.length} waypoints
            </div>
          </div>

          {/* Grid */}
          <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
            <div className="inline-grid gap-px" style={{
              gridTemplateColumns: `repeat(${gridSize}, 30px)`
            }}>
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const waypoint = waypoints.find(wp => wp.x === x && wp.y === y);
                const isStart = x === 0 && y === 0;

                return (
                  <div
                    key={i}
                    onClick={() => !waypoint && !isStart && addWaypoint(x, y)}
                    className={`w-[30px] h-[30px] border border-slate-700 cursor-pointer relative ${
                      isStart ? 'bg-emerald-600' : waypoint ? getWaypointColor(waypoint.type) : 'bg-slate-800 hover:bg-slate-700'
                    } ${waypoint && selectedWaypoint === waypoint.id ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    {waypoint && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        {waypoint.priority}
                      </div>
                    )}
                    {isStart && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        S
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-600 rounded"></div>
              <span>Start Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Explore Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Rescue Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Checkpoint</span>
            </div>
          </div>
        </div>

        {/* Waypoint Editor */}
        <div className="space-y-4">
          {/* Waypoint Details */}
          {selectedWp ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200">Waypoint Editor</h3>
                <button
                  onClick={() => removeWaypoint(selectedWp.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                  <div className="text-slate-400 text-sm font-mono">
                    X: {selectedWp.x}, Y: {selectedWp.y}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={selectedWp.type}
                    onChange={(e) => updateWaypoint(selectedWp.id, { type: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="explore">Exploration</option>
                    <option value="rescue">Rescue Point</option>
                    <option value="checkpoint">Checkpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <input
                    type="number"
                    value={selectedWp.priority}
                    onChange={(e) => updateWaypoint(selectedWp.id, { priority: parseInt(e.target.value) })}
                    min={1}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={selectedWp.notes}
                    onChange={(e) => updateWaypoint(selectedWp.id, { notes: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Add notes about this waypoint..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center text-slate-400 py-8">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a waypoint to edit</p>
                <p className="text-xs mt-2">or click on the grid to add new waypoints</p>
              </div>
            </div>
          )}

          {/* Waypoint List */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Waypoint List</h3>

            {waypoints.length === 0 ? (
              <div className="text-center text-slate-400 py-6 text-sm">
                No waypoints added yet
              </div>
            ) : (
              <div className="space-y-2">
                {waypoints
                  .sort((a, b) => a.priority - b.priority)
                  .map((wp) => (
                    <div
                      key={wp.id}
                      onClick={() => setSelectedWaypoint(wp.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedWaypoint === wp.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${getWaypointColor(wp.type)}`}></div>
                          <span className="text-sm font-medium">
                            #{wp.priority} ({wp.x}, {wp.y})
                          </span>
                        </div>
                        <span className="text-xs opacity-75 capitalize">{wp.type}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Mission Info */}
          <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
            <div className="flex gap-2 text-amber-200">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium mb-1">Mission Planning Tips:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>Set priorities to define visit order</li>
                  <li>Add rescue points near victims</li>
                  <li>Use checkpoints for battery planning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionPlannerPage;
