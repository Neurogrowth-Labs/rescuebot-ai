/**
 * Mission Time Intelligence Service
 * Handles phase detection, time tracking, and analytics
 *
 * This is the core intelligence layer that transforms raw timestamps
 * into actionable operational insights.
 */

import {
  MissionPhase,
  MTIEvent,
  MTISummary,
  MTILiveState,
  MTIAlert,
  MTIBottleneck,
  MTIRecommendation,
  MTIConfig,
  RobotState,
  RobotStatus,
  Coordinates,
  CellType
} from '../../types.enhanced';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// PHASE DETECTION (Core Intelligence)
// ============================================================================

/**
 * Automatically detect mission phase from robot state
 * This is the semantic layer that gives meaning to time tracking
 *
 * Algorithm:
 * 1. Check emergency states first (E-STOP, charging)
 * 2. Analyze robot status and goals
 * 3. Consider battery and path context
 * 4. Return most specific phase possible
 */
export function detectPhase(
  robot: RobotState,
  previousPhase: MissionPhase | null,
  previousPath: Coordinates[] = []
): MissionPhase {
  const { status, battery, path, currentGoal, victimsRescued, firesExtinguished } = robot;

  // Priority 1: Emergency states
  if (status === RobotStatus.EMERGENCY_STOP) {
    return MissionPhase.EMERGENCY;
  }

  if (status === RobotStatus.RECHARGING) {
    return MissionPhase.CHARGING;
  }

  // Priority 2: Initialization (at start)
  if (
    status === RobotStatus.IDLE &&
    battery === 100 &&
    !currentGoal &&
    victimsRescued === 0 &&
    firesExtinguished === 0 &&
    path.length === 0
  ) {
    return MissionPhase.INITIALIZATION;
  }

  // Priority 3: Decision making
  if (status === RobotStatus.PLANNING) {
    return MissionPhase.DECISION_LATENCY;
  }

  // Priority 4: Active operations
  if (status === RobotStatus.ACTING) {
    // Could be rescue or firefighting - use context
    return MissionPhase.RESCUE_OPERATION;
  }

  if (status === RobotStatus.SCANNING) {
    return MissionPhase.VICTIM_DETECTION;
  }

  // Priority 5: Movement analysis
  if (status === RobotStatus.MOVING) {
    // Check if returning to base
    if (currentGoal?.x === 0 && currentGoal?.y === 0 && battery < 100) {
      return MissionPhase.RETURN_TO_BASE;
    }

    // Check if hazard avoidance (path changed unexpectedly)
    if (isHazardAvoidance(path, previousPath)) {
      return MissionPhase.HAZARD_AVOIDANCE;
    }

    // Check if navigating to known target
    if (currentGoal) {
      return MissionPhase.NAVIGATION;
    }

    // Default to exploration
    return MissionPhase.EXPLORATION;
  }

  // Priority 6: Idle states
  if (status === RobotStatus.IDLE) {
    // Check if recovering from error
    if (previousPhase === MissionPhase.EMERGENCY || previousPhase === MissionPhase.HAZARD_AVOIDANCE) {
      return MissionPhase.RECOVERY;
    }

    return MissionPhase.IDLE;
  }

  // Priority 7: Critical/Error states
  if (status === RobotStatus.CRITICAL) {
    return MissionPhase.RECOVERY;
  }

  // Fallback: maintain previous phase or default to idle
  return previousPhase || MissionPhase.IDLE;
}

/**
 * Detect if robot is avoiding a hazard
 * Heuristic: path changed significantly while moving
 */
export function isHazardAvoidance(
  currentPath: Coordinates[],
  previousPath: Coordinates[]
): boolean {
  if (currentPath.length === 0 || previousPath.length === 0) {
    return false;
  }

  // Check if next waypoint changed
  const currentNext = currentPath[0];
  const previousNext = previousPath[0];

  if (!currentNext || !previousNext) {
    return false;
  }

  // If path diverged significantly, likely avoiding hazard
  const divergence = Math.abs(currentNext.x - previousNext.x) + Math.abs(currentNext.y - previousNext.y);

  return divergence > 2; // More than 2 cells away = likely reroute
}

// ============================================================================
// MTI TRACKER CLASS (Main Time Intelligence Engine)
// ============================================================================

/**
 * MTI Tracker - Manages live time tracking for a mission
 *
 * Usage:
 * 1. Create tracker when mission starts
 * 2. Call update() every simulation tick
 * 3. Call generateSummary() when mission ends
 */
export class MTITracker {
  private missionId: string;
  private missionName: string;
  private startTime: Date;
  private events: MTIEvent[] = [];
  private currentPhase: MissionPhase | null = null;
  private phaseStartTime: Date | null = null;
  private config: MTIConfig;

  // Running totals (in seconds)
  private activeTime = 0;
  private idleTime = 0;

  // Critical event tracking
  private timeToFirstVictim: number | null = null;
  private timeToFirstFire: number | null = null;
  private firstVictimDetected = false;
  private firstFireDetected = false;

  // Alert tracking
  private activeAlerts: MTIAlert[] = [];
  private allAlerts: MTIAlert[] = [];

  // Decision latency tracking
  private decisionLatencies: number[] = [];

  // Previous state for comparison
  private previousPath: Coordinates[] = [];

  // Phase duration tracking
  private phaseDurations = new Map<MissionPhase, number>();

  constructor(missionId: string, missionName: string, config: MTIConfig) {
    this.missionId = missionId;
    this.missionName = missionName;
    this.startTime = new Date();
    this.config = config;

    // Initialize phase durations
    Object.values(MissionPhase).forEach(phase => {
      this.phaseDurations.set(phase, 0);
    });
  }

  /**
   * Update tracker with new robot state (called every tick)
   * Returns live state for real-time display
   */
  update(robot: RobotState, tickRateMs: number = 1000): MTILiveState {
    const now = new Date();
    const elapsedTime = (now.getTime() - this.startTime.getTime()) / 1000;

    // Detect current phase
    const detectedPhase = detectPhase(robot, this.currentPhase, this.previousPath);

    // Phase transition
    if (detectedPhase !== this.currentPhase) {
      this.handlePhaseTransition(detectedPhase, robot, now);
    }

    // Update phase duration
    const tickSeconds = tickRateMs / 1000;
    const currentDuration = this.phaseDurations.get(detectedPhase) || 0;
    this.phaseDurations.set(detectedPhase, currentDuration + tickSeconds);

    // Update running totals
    if (detectedPhase === MissionPhase.IDLE || detectedPhase === MissionPhase.CHARGING) {
      this.idleTime += tickSeconds;
    } else {
      this.activeTime += tickSeconds;
    }

    // Track decision latency
    if (detectedPhase === MissionPhase.DECISION_LATENCY) {
      // Would ideally measure actual decision time from AI service
      // For now, use tick rate as proxy
      this.decisionLatencies.push(tickRateMs);
    }

    // Track critical events
    this.trackCriticalEvents(robot, elapsedTime, now);

    // Check for alerts
    if (this.config.enableRealTimeAlerts) {
      this.checkAlerts(robot, elapsedTime, now);
    }

    // Store current path for next comparison
    this.previousPath = [...robot.path];

    // Return live state
    return this.getLiveState(robot);
  }

  /**
   * Handle phase transition
   * Creates PHASE_END and PHASE_START events
   */
  private handlePhaseTransition(
    newPhase: MissionPhase,
    robot: RobotState,
    now: Date
  ): void {
    // End previous phase
    if (this.currentPhase && this.phaseStartTime) {
      const phaseDuration = (now.getTime() - this.phaseStartTime.getTime()) / 1000;

      const endEvent: MTIEvent = {
        id: uuidv4(),
        missionId: this.missionId,
        timestamp: now,
        phase: this.currentPhase,
        phaseStartTime: this.phaseStartTime,
        phaseDuration,
        robotState: this.sanitizeRobotState(robot),
        location: { ...robot.pos },
        battery: robot.battery,
        eventType: 'PHASE_END',
        description: `${this.currentPhase} completed in ${phaseDuration.toFixed(1)}s`,
        isAnomaly: false
      };

      this.events.push(endEvent);
    }

    // Start new phase
    this.currentPhase = newPhase;
    this.phaseStartTime = now;

    const startEvent: MTIEvent = {
      id: uuidv4(),
      missionId: this.missionId,
      timestamp: now,
      phase: newPhase,
      phaseStartTime: now,
      robotState: this.sanitizeRobotState(robot),
      location: { ...robot.pos },
      battery: robot.battery,
      eventType: 'PHASE_START',
      description: `${newPhase} started`,
      isAnomaly: false
    };

    this.events.push(startEvent);
  }

  /**
   * Track critical mission events
   */
  private trackCriticalEvents(robot: RobotState, elapsedTime: number, now: Date): void {
    // First victim detected/rescued
    if (!this.firstVictimDetected && robot.victimsRescued > 0) {
      this.firstVictimDetected = true;
      this.timeToFirstVictim = elapsedTime;

      const event: MTIEvent = {
        id: uuidv4(),
        missionId: this.missionId,
        timestamp: now,
        phase: this.currentPhase || MissionPhase.IDLE,
        phaseStartTime: this.phaseStartTime || now,
        robotState: this.sanitizeRobotState(robot),
        location: { ...robot.pos },
        battery: robot.battery,
        eventType: 'MILESTONE',
        description: `First victim rescued at ${this.formatDuration(elapsedTime)}`,
        isAnomaly: false
      };

      this.events.push(event);
    }

    // First fire detected/extinguished
    if (!this.firstFireDetected && robot.firesExtinguished > 0) {
      this.firstFireDetected = true;
      this.timeToFirstFire = elapsedTime;

      const event: MTIEvent = {
        id: uuidv4(),
        missionId: this.missionId,
        timestamp: now,
        phase: this.currentPhase || MissionPhase.IDLE,
        phaseStartTime: this.phaseStartTime || now,
        robotState: this.sanitizeRobotState(robot),
        location: { ...robot.pos },
        battery: robot.battery,
        eventType: 'MILESTONE',
        description: `First fire extinguished at ${this.formatDuration(elapsedTime)}`,
        isAnomaly: false
      };

      this.events.push(event);
    }
  }

  /**
   * Check for time-based alerts
   */
  private checkAlerts(robot: RobotState, elapsedTime: number, now: Date): void {
    // Alert: Time to first victim exceeds threshold
    if (
      robot.victimsRescued === 0 &&
      elapsedTime > this.config.timeToFirstVictimThreshold &&
      !this.hasAlert('TIME_THRESHOLD', 'timeToFirstVictim')
    ) {
      const alert: MTIAlert = {
        id: uuidv4(),
        timestamp: now,
        type: 'TIME_THRESHOLD',
        severity: 'WARNING',
        message: `Time to first victim exceeded ${this.config.timeToFirstVictimThreshold}s threshold`,
        phase: this.currentPhase || MissionPhase.IDLE,
        metric: 'timeToFirstVictim',
        threshold: this.config.timeToFirstVictimThreshold,
        actualValue: elapsedTime,
        acknowledged: false
      };

      this.activeAlerts.push(alert);
      this.allAlerts.push(alert);

      // Log as event
      const event: MTIEvent = {
        id: uuidv4(),
        missionId: this.missionId,
        timestamp: now,
        phase: this.currentPhase || MissionPhase.IDLE,
        phaseStartTime: this.phaseStartTime || now,
        robotState: this.sanitizeRobotState(robot),
        location: { ...robot.pos },
        battery: robot.battery,
        eventType: 'ALERT',
        description: alert.message,
        isAnomaly: true
      };

      this.events.push(event);
    }

    // Alert: Excessive idle time
    const idlePercentage = elapsedTime > 0 ? (this.idleTime / elapsedTime) * 100 : 0;
    if (
      idlePercentage > 30 &&
      elapsedTime > 60 && // Only after 1 minute
      !this.hasAlert('EFFICIENCY_DROP', 'idleTime')
    ) {
      const alert: MTIAlert = {
        id: uuidv4(),
        timestamp: now,
        type: 'EFFICIENCY_DROP',
        severity: 'WARNING',
        message: `High idle time detected (${idlePercentage.toFixed(1)}%)`,
        phase: this.currentPhase || MissionPhase.IDLE,
        metric: 'idleTime',
        threshold: 30,
        actualValue: idlePercentage,
        acknowledged: false
      };

      this.activeAlerts.push(alert);
      this.allAlerts.push(alert);
    }

    // Alert: Low battery
    if (robot.battery < 20 && !this.hasAlert('TIME_THRESHOLD', 'battery')) {
      const alert: MTIAlert = {
        id: uuidv4(),
        timestamp: now,
        type: 'TIME_THRESHOLD',
        severity: 'CRITICAL',
        message: `Low battery detected (${robot.battery.toFixed(0)}%)`,
        phase: this.currentPhase || MissionPhase.IDLE,
        metric: 'battery',
        threshold: 20,
        actualValue: robot.battery,
        acknowledged: false
      };

      this.activeAlerts.push(alert);
      this.allAlerts.push(alert);
    }
  }

  /**
   * Check if alert of this type/metric already exists
   */
  private hasAlert(type: MTIAlert['type'], metric: string): boolean {
    return this.allAlerts.some(a => a.type === type && a.metric === metric);
  }

  /**
   * Get current live state for dashboard
   */
  private getLiveState(robot: RobotState): MTILiveState {
    const now = new Date();
    const elapsedTime = (now.getTime() - this.startTime.getTime()) / 1000;
    const phaseElapsedTime = this.phaseStartTime
      ? (now.getTime() - this.phaseStartTime.getTime()) / 1000
      : 0;

    // Calculate phase distribution
    const phaseDistribution = Array.from(this.phaseDurations.entries())
      .filter(([_, duration]) => duration > 0)
      .map(([phase, duration]) => ({
        phase,
        duration,
        percentage: elapsedTime > 0 ? (duration / elapsedTime) * 100 : 0
      }))
      .sort((a, b) => b.duration - a.duration);

    return {
      missionId: this.missionId,
      isActive: true,
      elapsedTime,
      currentPhase: this.currentPhase || MissionPhase.INITIALIZATION,
      phaseElapsedTime,
      activeTime: this.activeTime,
      idleTime: this.idleTime,
      phaseDistribution,
      timeToFirstVictim: this.timeToFirstVictim || undefined,
      victimsRescuedCount: robot.victimsRescued,
      firesExtinguishedCount: robot.firesExtinguished,
      activeAlerts: this.activeAlerts
    };
  }

  /**
   * Generate final summary when mission ends
   */
  generateSummary(robot: RobotState): MTISummary {
    const endTime = new Date();
    const totalDuration = (endTime.getTime() - this.startTime.getTime()) / 1000;

    // Aggregate phase breakdown
    const phaseBreakdown = Array.from(this.phaseDurations.entries())
      .map(([phase, duration]) => {
        // Count how many times we entered this phase
        const count = this.events.filter(
          e => e.eventType === 'PHASE_START' && e.phase === phase
        ).length;

        return {
          phase,
          duration,
          percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
          count
        };
      })
      .filter(p => p.duration > 0)
      .sort((a, b) => b.duration - a.duration);

    // Calculate metrics
    const utilizationRate = totalDuration > 0 ? (this.activeTime / totalDuration) * 100 : 0;
    const avgDecisionLatency = this.decisionLatencies.length > 0
      ? this.decisionLatencies.reduce((a, b) => a + b, 0) / this.decisionLatencies.length
      : 0;
    const maxDecisionLatency = this.decisionLatencies.length > 0
      ? Math.max(...this.decisionLatencies)
      : 0;

    // Detect bottlenecks
    const bottlenecks = this.detectBottlenecks(phaseBreakdown, totalDuration);

    // Calculate costs (if enabled)
    let operationalCost = 0;
    let costPerMinute = 0;

    if (this.config.enableCostTracking && this.config.costPerMinute) {
      costPerMinute = this.config.costPerMinute;
      operationalCost = (totalDuration / 60) * costPerMinute;
    }

    return {
      missionId: this.missionId,
      missionName: this.missionName,
      totalDuration,
      startTime: this.startTime,
      endTime,
      phaseBreakdown,
      activeTime: this.activeTime,
      idleTime: this.idleTime,
      utilizationRate,
      timeToFirstVictim: this.timeToFirstVictim || undefined,
      timeToFirstFire: this.timeToFirstFire || undefined,
      avgDecisionLatency,
      maxDecisionLatency,
      totalDelayTime: 0, // Would calculate from bottlenecks
      bottlenecks,
      alertsTriggered: this.allAlerts,
      operationalCost,
      costPerMinute,
      timeValueScore: utilizationRate // Simple score for now
    };
  }

  /**
   * Detect bottlenecks from phase breakdown
   */
  private detectBottlenecks(
    phaseBreakdown: MTISummary['phaseBreakdown'],
    totalDuration: number
  ): MTIBottleneck[] {
    const bottlenecks: MTIBottleneck[] = [];

    // Check for phases that took excessive time
    phaseBreakdown.forEach(phase => {
      // If a phase took more than 40% of total time, flag it
      if (phase.percentage > 40) {
        bottlenecks.push({
          id: uuidv4(),
          phase: phase.phase,
          startTime: this.startTime, // Would get actual time from events
          duration: phase.duration,
          severity: phase.percentage > 50 ? 'HIGH' : 'MEDIUM',
          cause: `${phase.phase} consumed ${phase.percentage.toFixed(1)}% of mission time`,
          delayImpact: phase.duration * 0.3, // Estimate 30% could be saved
          recommendation: `Optimize ${phase.phase} algorithms or planning`
        });
      }
    });

    // Check for excessive idle time
    const idlePhase = phaseBreakdown.find(p => p.phase === MissionPhase.IDLE);
    if (idlePhase && idlePhase.percentage > 20) {
      bottlenecks.push({
        id: uuidv4(),
        phase: MissionPhase.IDLE,
        startTime: this.startTime,
        duration: idlePhase.duration,
        severity: 'MEDIUM',
        cause: `Excessive idle time (${idlePhase.percentage.toFixed(1)}%)`,
        delayImpact: idlePhase.duration * 0.5, // Could save 50% of idle time
        recommendation: 'Improve task sequencing and reduce wait times between actions'
      });
    }

    return bottlenecks;
  }

  /**
   * Sanitize robot state for storage (remove logs)
   */
  private sanitizeRobotState(robot: RobotState): Partial<RobotState> {
    const { logs, ...sanitized } = robot;
    return sanitized;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  /**
   * Get all events (for debugging/analysis)
   */
  getEvents(): MTIEvent[] {
    return this.events;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();

      // Remove from active alerts
      this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId);
      return true;
    }
    return false;
  }
}

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

/**
 * Generate recommendations from MTI summary
 */
export function generateRecommendations(summary: MTISummary): MTIRecommendation[] {
  const recommendations: MTIRecommendation[] = [];

  // High idle time recommendation
  const idlePercentage = summary.totalDuration > 0 ? (summary.idleTime / summary.totalDuration) * 100 : 0;
  if (idlePercentage > 20) {
    recommendations.push({
      id: uuidv4(),
      missionId: summary.missionId,
      category: 'EFFICIENCY',
      priority: 'HIGH',
      title: 'Reduce Idle Time',
      description: `Mission spent ${idlePercentage.toFixed(1)}% in idle state. This can be reduced through better path planning and task sequencing.`,
      dataPoints: [
        {
          metric: 'Idle Time %',
          currentValue: idlePercentage,
          targetValue: 10,
          improvement: idlePercentage - 10
        }
      ],
      actionable: true,
      implementation: 'Enable aggressive exploration mode and reduce decision latency thresholds',
      estimatedImpact: `${(idlePercentage - 10).toFixed(0)}% faster missions`
    });
  }

  // Exploration efficiency
  const explorationPhase = summary.phaseBreakdown.find(p => p.phase === MissionPhase.EXPLORATION);
  if (explorationPhase && explorationPhase.percentage > 30) {
    recommendations.push({
      id: uuidv4(),
      missionId: summary.missionId,
      category: 'EFFICIENCY',
      priority: 'MEDIUM',
      title: 'Optimize Exploration Strategy',
      description: `${explorationPhase.percentage.toFixed(1)}% of mission time spent exploring. Consider using frontier-based or coverage-path-planning algorithms.`,
      dataPoints: [
        {
          metric: 'Exploration Time %',
          currentValue: explorationPhase.percentage,
          targetValue: 20,
          improvement: explorationPhase.percentage - 20
        }
      ],
      actionable: true,
      implementation: 'Switch to frontier-based exploration or increase sensor range',
      estimatedImpact: `${(explorationPhase.percentage - 20).toFixed(0)}% time saved in mapping`
    });
  }

  // Decision latency
  if (summary.avgDecisionLatency > 150) {
    recommendations.push({
      id: uuidv4(),
      missionId: summary.missionId,
      category: 'EFFICIENCY',
      priority: 'MEDIUM',
      title: 'Reduce Decision Latency',
      description: `Average AI decision time is ${summary.avgDecisionLatency.toFixed(0)}ms. This can be improved with model optimization.`,
      dataPoints: [
        {
          metric: 'Decision Latency (ms)',
          currentValue: summary.avgDecisionLatency,
          targetValue: 100,
          improvement: ((summary.avgDecisionLatency - 100) / summary.avgDecisionLatency) * 100
        }
      ],
      actionable: true,
      implementation: 'Use model quantization or switch to lighter decision model',
      estimatedImpact: `${(((summary.avgDecisionLatency - 100) / summary.avgDecisionLatency) * 100).toFixed(0)}% faster decisions`
    });
  }

  // Time to first victim
  if (summary.timeToFirstVictim && summary.timeToFirstVictim > 180) {
    recommendations.push({
      id: uuidv4(),
      missionId: summary.missionId,
      category: 'SAFETY',
      priority: 'HIGH',
      title: 'Improve Victim Detection Speed',
      description: `First victim was reached in ${(summary.timeToFirstVictim / 60).toFixed(1)} minutes. Faster victim detection is critical for survival rates.`,
      dataPoints: [
        {
          metric: 'Time to First Victim (s)',
          currentValue: summary.timeToFirstVictim,
          targetValue: 120,
          improvement: ((summary.timeToFirstVictim - 120) / summary.timeToFirstVictim) * 100
        }
      ],
      actionable: true,
      implementation: 'Prioritize victim detection in planning algorithm and increase scan frequency',
      estimatedImpact: `${(((summary.timeToFirstVictim - 120) / summary.timeToFirstVictim) * 100).toFixed(0)}% faster victim response`
    });
  }

  return recommendations;
}

/**
 * Calculate time-to-value metrics (ROI)
 */
export function calculateTimeValue(
  summary: MTISummary,
  costPerMinute: number,
  humanTeamMultiplier: number = 2
): {
  operationalCost: number;
  humanTeamCost: number;
  costSaved: number;
  timeSaved: number;
  efficiencyGain: number;
} {
  const operationalCost = (summary.totalDuration / 60) * costPerMinute;

  // Assume human team takes longer and costs more per minute
  const humanTeamTime = summary.totalDuration * humanTeamMultiplier;
  const humanCostPerMinute = costPerMinute * 3; // 3x more expensive
  const humanTeamCost = (humanTeamTime / 60) * humanCostPerMinute;

  return {
    operationalCost,
    humanTeamCost,
    costSaved: humanTeamCost - operationalCost,
    timeSaved: humanTeamTime - summary.totalDuration,
    efficiencyGain: ((humanTeamTime - summary.totalDuration) / humanTeamTime) * 100
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format duration in short format (for displays)
 */
export function formatDurationShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `0:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Get default MTI configuration
 */
export function getDefaultMTIConfig(): MTIConfig {
  return {
    enablePhaseDetection: true,
    enableAnomalyDetection: true,
    enableSurvivalModeling: false,
    enableCostTracking: false,
    timeToFirstVictimThreshold: 240, // 4 minutes
    maxDecisionLatencyThreshold: 200, // 200ms
    idleTimeThreshold: 30, // 30 seconds
    enableRealTimeAlerts: true,
    alertChannels: ['UI']
  };
}
