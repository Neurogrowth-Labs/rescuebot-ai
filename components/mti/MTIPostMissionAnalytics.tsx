/**
 * MTI Post-Mission Analytics
 * Comprehensive mission report with insights and recommendations
 *
 * Displays after mission completion:
 * - Mission summary metrics
 * - Phase breakdown visualization
 * - Bottlenecks analysis
 * - Recommendations for improvement
 * - ROI metrics (if enabled)
 */

import React, { useState } from 'react';
import { MTISummary, MTIRecommendation } from '../../types.enhanced';
import { formatDuration, generateRecommendations, calculateTimeValue } from '../../services/mti/mtiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MTIPostMissionAnalyticsProps {
  summary: MTISummary;
  onExport?: (format: 'PDF' | 'CSV') => void;
}

const MTIPostMissionAnalytics: React.FC<MTIPostMissionAnalyticsProps> = ({
  summary,
  onExport
}) => {
  const [recommendations] = useState<MTIRecommendation[]>(() => generateRecommendations(summary));

  // Prepare chart data
  const phaseChartData = summary.phaseBreakdown
    .map(phase => ({
      name: phase.phase.replace(/_/g, ' ').toLowerCase(),
      duration: phase.duration,
      percentage: phase.percentage
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 8); // Top 8 phases

  // Colors for phases
  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

  // Calculate ROI if cost tracking enabled
  const roiMetrics = summary.costPerMinute > 0
    ? calculateTimeValue(summary, summary.costPerMinute, 2)
    : null;

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold text-blue-400 mb-1">
                Mission Time Intelligence Report
              </h1>
              <div className="text-sm text-slate-500">
                {summary.missionName} • Completed {summary.endTime.toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              {onExport && (
                <>
                  <button
                    onClick={() => onExport('PDF')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono rounded transition-colors"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => onExport('CSV')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-mono rounded transition-colors"
                  >
                    Export CSV
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-500 uppercase mb-1">Total Time</div>
            <div className="text-2xl font-mono text-blue-400 font-bold">
              {formatDuration(summary.totalDuration)}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {new Date(summary.startTime).toLocaleTimeString()} - {new Date(summary.endTime).toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-500 uppercase mb-1">Utilization Rate</div>
            <div className="text-2xl font-mono text-emerald-400 font-bold">
              {summary.utilizationRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {formatDuration(summary.activeTime)} active / {formatDuration(summary.idleTime)} idle
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-500 uppercase mb-1">First Victim</div>
            <div className="text-2xl font-mono text-cyan-400 font-bold">
              {summary.timeToFirstVictim ? formatDuration(summary.timeToFirstVictim) : 'N/A'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Time to first rescue
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-500 uppercase mb-1">Efficiency Score</div>
            <div className="text-2xl font-mono text-violet-400 font-bold">
              {summary.timeValueScore.toFixed(0)}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Overall performance rating
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Phase Breakdown Bar Chart */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              Phase Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={phaseChartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [formatDuration(value), 'Duration']}
                />
                <Bar dataKey="duration" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Phase Breakdown Pie Chart */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              Time Allocation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={phaseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name.slice(0, 8)} ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="duration"
                >
                  {phaseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [formatDuration(value), 'Duration']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Details Table */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
            Detailed Phase Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs text-slate-500 uppercase py-2 px-3">Phase</th>
                  <th className="text-right text-xs text-slate-500 uppercase py-2 px-3">Duration</th>
                  <th className="text-right text-xs text-slate-500 uppercase py-2 px-3">Percentage</th>
                  <th className="text-right text-xs text-slate-500 uppercase py-2 px-3">Count</th>
                </tr>
              </thead>
              <tbody>
                {summary.phaseBreakdown.map(phase => (
                  <tr key={phase.phase} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-slate-300 font-mono">
                      {phase.phase.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-400 font-mono">
                      {formatDuration(phase.duration)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 font-mono">
                      {phase.percentage.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono">
                      {phase.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottlenecks */}
        {summary.bottlenecks.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              Detected Bottlenecks
            </h3>
            <div className="space-y-3">
              {summary.bottlenecks.map(bottleneck => (
                <div
                  key={bottleneck.id}
                  className={`p-4 rounded border ${
                    bottleneck.severity === 'CRITICAL'
                      ? 'bg-red-900/20 border-red-700/50'
                      : bottleneck.severity === 'HIGH'
                      ? 'bg-amber-900/20 border-amber-700/50'
                      : 'bg-blue-900/20 border-blue-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-mono text-amber-400 mb-1">
                        {bottleneck.phase.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-300">
                        {bottleneck.cause}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-amber-500 font-mono">
                        +{formatDuration(bottleneck.delayImpact)} delay
                      </div>
                      <div className="text-xs text-slate-500 uppercase">
                        {bottleneck.severity}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-400 flex items-center gap-2">
                    <span>💡</span>
                    <span>{bottleneck.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              AI-Generated Recommendations
            </h3>
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded border border-violet-900/50 bg-violet-900/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`px-2 py-0.5 rounded text-xs uppercase font-mono ${
                          rec.priority === 'HIGH'
                            ? 'bg-red-900/50 text-red-400'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-blue-900/50 text-blue-400'
                        }`}>
                          {rec.priority}
                        </div>
                        <div className="text-sm font-mono text-violet-400">
                          {rec.title}
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 mb-3">
                        {rec.description}
                      </div>
                      {rec.actionable && rec.implementation && (
                        <div className="text-xs text-cyan-400 mb-2">
                          <span className="font-bold">Implementation:</span> {rec.implementation}
                        </div>
                      )}
                      <div className="text-xs text-emerald-400 font-mono">
                        <span className="font-bold">Estimated Impact:</span> {rec.estimatedImpact}
                      </div>
                    </div>
                  </div>
                  {rec.dataPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-violet-900/30">
                      <div className="grid grid-cols-3 gap-3">
                        {rec.dataPoints.map((dp, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="text-slate-500">{dp.metric}</div>
                            <div className="font-mono">
                              <span className="text-red-400">{dp.currentValue.toFixed(1)}</span>
                              {' → '}
                              <span className="text-emerald-400">{dp.targetValue.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROI Metrics */}
        {roiMetrics && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              Return on Investment (ROI)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-900/50 p-4 rounded">
                <div className="text-xs text-slate-500 uppercase mb-1">Robot Cost</div>
                <div className="text-xl font-mono text-blue-400">
                  ${roiMetrics.operationalCost.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded">
                <div className="text-xs text-slate-500 uppercase mb-1">Human Team Cost</div>
                <div className="text-xl font-mono text-slate-400">
                  ${roiMetrics.humanTeamCost.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded">
                <div className="text-xs text-slate-500 uppercase mb-1">Cost Saved</div>
                <div className="text-xl font-mono text-emerald-400">
                  ${roiMetrics.costSaved.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded">
                <div className="text-xs text-slate-500 uppercase mb-1">Time Saved</div>
                <div className="text-xl font-mono text-cyan-400">
                  {formatDuration(roiMetrics.timeSaved)}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-700/50 rounded">
              <div className="text-sm text-emerald-400">
                <strong>Efficiency Gain:</strong> {roiMetrics.efficiencyGain.toFixed(1)}% faster than human team
              </div>
            </div>
          </div>
        )}

        {/* Alerts Summary */}
        {summary.alertsTriggered.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">
              Alerts Triggered ({summary.alertsTriggered.length})
            </h3>
            <div className="space-y-2">
              {summary.alertsTriggered.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-900/20 border-red-700/50'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-900/20 border-amber-700/50'
                      : 'bg-blue-900/20 border-blue-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300 font-mono">
                      {alert.message}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MTIPostMissionAnalytics;
