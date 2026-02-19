/**
 * MTI Dashboard Widget
 * Live mission time intelligence display for command center
 *
 * Shows:
 * - Live mission timer
 * - Current phase
 * - Active vs idle time
 * - Phase breakdown
 * - Critical events
 * - Active alerts
 */

import React from 'react';
import { MTILiveState, MissionPhase } from '../../types.enhanced';
import { formatDuration, formatDurationShort } from '../../services/mti/mtiService';

interface MTIDashboardWidgetProps {
  liveState: MTILiveState | null;
  compact?: boolean; // Compact mode for smaller displays
}

const MTIDashboardWidget: React.FC<MTIDashboardWidgetProps> = ({
  liveState,
  compact = false
}) => {
  // No active mission
  if (!liveState || !liveState.isActive) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Mission Time Intelligence
          </h3>
        </div>
        <div className="text-slate-500 text-sm text-center py-4">
          No active mission
        </div>
      </div>
    );
  }

  const idlePercentage = liveState.elapsedTime > 0
    ? (liveState.idleTime / liveState.elapsedTime) * 100
    : 0;
  const activePercentage = liveState.elapsedTime > 0
    ? (liveState.activeTime / liveState.elapsedTime) * 100
    : 0;

  // Get phase color
  const getPhaseColor = (phase: MissionPhase): string => {
    switch (phase) {
      case MissionPhase.EMERGENCY:
        return 'text-red-400';
      case MissionPhase.CHARGING:
        return 'text-amber-400';
      case MissionPhase.RESCUE_OPERATION:
      case MissionPhase.VICTIM_DETECTION:
        return 'text-emerald-400';
      case MissionPhase.NAVIGATION:
      case MissionPhase.EXPLORATION:
        return 'text-cyan-400';
      case MissionPhase.IDLE:
        return 'text-slate-400';
      case MissionPhase.DECISION_LATENCY:
        return 'text-violet-400';
      default:
        return 'text-blue-400';
    }
  };

  // Get phase icon
  const getPhaseIcon = (phase: MissionPhase): string => {
    switch (phase) {
      case MissionPhase.INITIALIZATION:
        return '🔄';
      case MissionPhase.EXPLORATION:
        return '🔍';
      case MissionPhase.NAVIGATION:
        return '🧭';
      case MissionPhase.HAZARD_AVOIDANCE:
        return '⚠️';
      case MissionPhase.VICTIM_DETECTION:
        return '👁️';
      case MissionPhase.RESCUE_OPERATION:
        return '🚑';
      case MissionPhase.DECISION_LATENCY:
        return '🧠';
      case MissionPhase.RECOVERY:
        return '🔧';
      case MissionPhase.RETURN_TO_BASE:
        return '🏠';
      case MissionPhase.IDLE:
        return '⏸️';
      case MissionPhase.CHARGING:
        return '🔋';
      case MissionPhase.EMERGENCY:
        return '🚨';
      default:
        return '⏱️';
    }
  };

  // Compact mode
  if (compact) {
    return (
      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-mono font-bold text-blue-400">
              {formatDurationShort(liveState.elapsedTime)}
            </div>
            <div className="text-[10px] text-slate-500">
              {getPhaseIcon(liveState.currentPhase)} {liveState.currentPhase}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-400">{activePercentage.toFixed(0)}% Active</div>
            <div className="text-xs text-amber-400">{idlePercentage.toFixed(0)}% Idle</div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Mission Time Intelligence
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-emerald-500 uppercase font-mono">LIVE</span>
        </div>
      </div>

      {/* Main Timer */}
      <div className="mb-4">
        <div className="text-3xl font-mono font-bold text-blue-400 mb-1">
          ⏱ {formatDuration(liveState.elapsedTime)}
        </div>
        <div className={`text-sm font-mono ${getPhaseColor(liveState.currentPhase)} flex items-center gap-2`}>
          <span>{getPhaseIcon(liveState.currentPhase)}</span>
          <span>{liveState.currentPhase}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500">{formatDuration(liveState.phaseElapsedTime)}</span>
        </div>
      </div>

      {/* Active vs Idle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-900/50 p-3 rounded border border-emerald-900/30">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="text-[10px] text-slate-500 uppercase">Active</div>
          </div>
          <div className="text-xl font-mono text-emerald-400">
            {formatDurationShort(liveState.activeTime)}
          </div>
          <div className="text-xs text-slate-600">{activePercentage.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-amber-900/30">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <div className="text-[10px] text-slate-500 uppercase">Idle</div>
          </div>
          <div className="text-xl font-mono text-amber-400">
            {formatDurationShort(liveState.idleTime)}
          </div>
          <div className="text-xs text-slate-600">{idlePercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* Phase Breakdown */}
      {liveState.phaseDistribution.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-slate-500 uppercase mb-2 tracking-widest">
            Phase Breakdown
          </div>
          <div className="space-y-1.5">
            {liveState.phaseDistribution
              .slice(0, 4) // Top 4 phases
              .map(phase => (
                <div key={phase.phase} className="flex items-center gap-2">
                  <div className="w-20 text-xs text-slate-400 truncate flex items-center gap-1">
                    <span className="text-[10px]">{getPhaseIcon(phase.phase)}</span>
                    <span className="truncate">{phase.phase.replace('_', ' ')}</span>
                  </div>
                  <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(phase.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs text-slate-500 font-mono">
                    {phase.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Critical Events */}
      <div className="mb-4">
        <div className="text-[10px] text-slate-500 uppercase mb-2 tracking-widest">
          Critical Events
        </div>
        <div className="space-y-1">
          {liveState.timeToFirstVictim !== undefined ? (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span>First victim:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {formatDuration(liveState.timeToFirstVictim)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span>○</span>
              <span>No victims rescued yet</span>
            </div>
          )}
          {liveState.victimsRescuedCount > 0 && (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-emerald-500">🚑</span>
              <span>Total rescued:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {liveState.victimsRescuedCount}
              </span>
            </div>
          )}
          {liveState.firesExtinguishedCount > 0 && (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <span>Fires extinguished:</span>
              <span className="text-orange-400 font-mono font-bold">
                {liveState.firesExtinguishedCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      {liveState.activeAlerts.length > 0 && (
        <div>
          <div className="text-[10px] text-slate-500 uppercase mb-2 tracking-widest">
            Active Alerts
          </div>
          <div className="space-y-2">
            {liveState.activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-2 rounded border ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-900/20 border-red-700/50'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-900/20 border-amber-700/50'
                    : 'bg-blue-900/20 border-blue-700/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="text-xs">
                    {alert.severity === 'CRITICAL' ? '🚨' : alert.severity === 'WARNING' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs font-mono ${
                      alert.severity === 'CRITICAL'
                        ? 'text-red-400'
                        : alert.severity === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}>
                      {alert.message}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {alert.phase} • {alert.metric}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
        <span>MTI v1.0</span>
        <span>Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default MTIDashboardWidget;
