import React, { useState } from 'react';
import { Database, Upload, Download, GitBranch, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  version: string;
  type: 'navigation' | 'perception' | 'decision' | 'control';
  status: 'active' | 'testing' | 'deprecated';
  accuracy: number;
  size: string;
  deployedAt: string;
  description: string;
  author: string;
}

const ModelRegistryPage: React.FC = () => {
  const [models] = useState<Model[]>([
    {
      id: 'm-001',
      name: 'Gemini-2.0-Flash',
      version: '2.0.1',
      type: 'decision',
      status: 'active',
      accuracy: 94.5,
      size: '1.2 GB',
      deployedAt: '2026-02-15',
      description: 'AI decision-making engine for autonomous mission planning',
      author: 'Google AI'
    },
    {
      id: 'm-002',
      name: 'A* Pathfinding',
      version: '3.1.0',
      type: 'navigation',
      status: 'active',
      accuracy: 98.2,
      size: '45 MB',
      deployedAt: '2026-01-28',
      description: 'Optimized A* algorithm for real-time path planning',
      author: 'RescueBot Team'
    },
    {
      id: 'm-003',
      name: 'Vision Detector v2',
      version: '2.3.4',
      type: 'perception',
      status: 'active',
      accuracy: 91.8,
      size: '850 MB',
      deployedAt: '2026-02-01',
      description: 'Computer vision model for victim and hazard detection',
      author: 'RescueBot Team'
    },
    {
      id: 'm-004',
      name: 'PID Controller',
      version: '1.5.2',
      type: 'control',
      status: 'active',
      accuracy: 99.1,
      size: '12 MB',
      deployedAt: '2025-12-10',
      description: 'Proportional-Integral-Derivative controller for motor control',
      author: 'RescueBot Team'
    },
    {
      id: 'm-005',
      name: 'Gemini-1.5-Pro',
      version: '1.5.8',
      type: 'decision',
      status: 'deprecated',
      accuracy: 89.3,
      size: '2.1 GB',
      deployedAt: '2025-11-20',
      description: 'Legacy decision engine, replaced by 2.0 Flash',
      author: 'Google AI'
    },
    {
      id: 'm-006',
      name: 'Vision Detector v1',
      version: '1.8.0',
      type: 'perception',
      status: 'testing',
      accuracy: 87.5,
      size: '720 MB',
      deployedAt: '2026-02-18',
      description: 'Testing improved thermal detection algorithms',
      author: 'RescueBot Team'
    },
  ]);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decision': return 'bg-purple-500/20 text-purple-400';
      case 'navigation': return 'bg-blue-500/20 text-blue-400';
      case 'perception': return 'bg-green-500/20 text-green-400';
      case 'control': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-green-400" />;
      case 'testing': return <Clock size={16} className="text-amber-400" />;
      case 'deprecated': return <AlertCircle size={16} className="text-red-400" />;
      default: return null;
    }
  };

  const filteredModels = models.filter(model => {
    if (filterType !== 'all' && model.type !== filterType) return false;
    if (filterStatus !== 'all' && model.status !== filterStatus) return false;
    return true;
  });

  const selected = models.find(m => m.id === selectedModel);

  const activeModels = models.filter(m => m.status === 'active').length;
  const avgAccuracy = (models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Model Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Manage AI models and algorithm versions</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Upload size={18} />
          Upload Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Database className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{models.length}</div>
          <div className="text-sm text-slate-400">Total Models</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{activeModels}</div>
          <div className="text-sm text-slate-400">Active Models</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <GitBranch className="text-purple-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{avgAccuracy}%</div>
          <div className="text-sm text-slate-400">Avg Accuracy</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="text-amber-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">
            {models.filter(m => m.status === 'testing').length}
          </div>
          <div className="text-sm text-slate-400">In Testing</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model List */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-200">Models</h3>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1 rounded text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="decision">Decision</option>
                <option value="navigation">Navigation</option>
                <option value="perception">Perception</option>
                <option value="control">Control</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1 rounded text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="testing">Testing</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                  selectedModel === model.id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-200 mb-1">{model.name}</div>
                    <div className="text-xs text-slate-400 font-mono">v{model.version}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(model.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(model.type)}`}>
                      {model.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{model.description}</p>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 mb-1">Accuracy</div>
                    <div className="font-bold text-green-400">{model.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Size</div>
                    <div className="font-bold text-slate-200">{model.size}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Status</div>
                    <div className={`font-bold capitalize ${
                      model.status === 'active' ? 'text-green-400' :
                      model.status === 'testing' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {model.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Details */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Model Details</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Model ID</div>
                    <div className="text-slate-200 font-mono text-sm">{selected.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Name</div>
                    <div className="text-slate-200 font-medium">{selected.name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Version</div>
                    <div className="text-slate-200 font-mono">v{selected.version}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Type</div>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-medium capitalize ${getTypeColor(selected.type)}`}>
                      {selected.type}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Status</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selected.status)}
                      <span className={`font-medium capitalize ${
                        selected.status === 'active' ? 'text-green-400' :
                        selected.status === 'testing' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Accuracy</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${selected.accuracy}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-400">{selected.accuracy}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Size</div>
                    <div className="text-slate-200">{selected.size}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Author</div>
                    <div className="text-slate-200">{selected.author}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Deployed</div>
                    <div className="text-slate-200">{selected.deployedAt}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2">Description</div>
                    <div className="text-slate-200 text-sm">{selected.description}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Model
                  </button>
                  {selected.status !== 'active' && (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Set as Active
                    </button>
                  )}
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors">
                    View Metrics
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Deprecate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-center text-slate-400 py-8">
                <Database size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a model to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelRegistryPage;
