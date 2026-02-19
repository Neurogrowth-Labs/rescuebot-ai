/**
 * RESCUEBOT.AI - Enhanced Type System
 *
 * This file extends the base types.ts with comprehensive type definitions
 * for the full platform architecture including auth, missions, fleet, analytics, etc.
 */

// Re-export base types
export * from './types';

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export enum UserRole {
  OPERATOR = 'OPERATOR',     // Mission control, emergency interventions
  ENGINEER = 'ENGINEER',     // Model training, debugging, performance tuning
  RESEARCHER = 'RESEARCHER', // Experiment design, data analysis
  ADMIN = 'ADMIN'           // Team management, billing, compliance
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    push: boolean;
    critical: boolean;
  };
  defaultView: string; // Dashboard route
  timezone: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  industry?: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  createdAt: Date;
  subscription?: Subscription;
}

export interface Subscription {
  plan: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  robots: number; // Max robots allowed
  storage: number; // GB
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================================================
// MISSION MANAGEMENT
// ============================================================================

export enum MissionStatus {
  DRAFT = 'DRAFT',           // Being created
  SCHEDULED = 'SCHEDULED',   // Scheduled for future
  QUEUED = 'QUEUED',        // Waiting for robot
  ACTIVE = 'ACTIVE',        // Currently running
  PAUSED = 'PAUSED',        // Temporarily stopped
  COMPLETED = 'COMPLETED',   // Successfully finished
  FAILED = 'FAILED',        // Failed to complete
  ABORTED = 'ABORTED',      // Manually stopped
  EXPIRED = 'EXPIRED'       // Scheduled time passed
}

export enum MissionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;

  // Configuration
  scenarioId: string;
  robotId?: string;
  modelVersion?: string;

  // Tasks & Waypoints
  waypoints: Coordinates[];
  tasks: Task[];

  // Scheduling
  scheduledStart?: Date;
  estimatedDuration?: number; // seconds

  // Execution
  startedAt?: Date;
  completedAt?: Date;
  progress: number; // 0-100

  // Metadata
  createdBy: string;
  assignedTo?: string; // Operator
  operatorNotes: OperatorNote[];
  tags: string[];

  // Results
  result?: MissionResult;
}

export interface OperatorNote {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'INTERVENTION';
}

export interface MissionResult {
  success: boolean;
  duration: number; // seconds
  energyConsumed: number; // Wh
  victimsRescued: number;
  firesExtinguished: number;
  explorationCoverage: number; // percentage
  collisionCount: number;
  interventionCount: number;
  failureReason?: string;
}

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

export enum TaskType {
  WAYPOINT = 'WAYPOINT',       // Navigate to point
  RESCUE = 'RESCUE',           // Rescue victim
  EXTINGUISH = 'EXTINGUISH',   // Extinguish fire
  SCAN = 'SCAN',               // Scan area
  WAIT = 'WAIT',               // Wait for condition
  DEPLOY = 'DEPLOY',           // Deploy equipment
  RETURN = 'RETURN'            // Return to base
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  order: number; // Sequence in mission

  // Target
  targetCoordinates?: Coordinates;
  targetEntity?: string; // e.g., "victim-1", "fire-2"

  // Execution
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // seconds
  attempts: number;

  // Conditions
  precondition?: TaskCondition;
  postcondition?: TaskCondition;

  // Failure handling
  onFailure?: 'ABORT' | 'RETRY' | 'SKIP' | 'CONTINUE';
  maxRetries?: number;

  // Metadata
  description?: string;
  estimatedDuration?: number;
}

export interface TaskCondition {
  type: 'IF' | 'WHILE' | 'UNTIL';
  expression: string; // e.g., "battery < 20", "victim.detected"
  thenAction?: string; // Task ID or action
  elseAction?: string;
}

// Behavior Tree Node (for advanced mission planning)
export interface BehaviorNode {
  id: string;
  type: 'SEQUENCE' | 'SELECTOR' | 'PARALLEL' | 'DECORATOR' | 'LEAF';
  name: string;
  children?: BehaviorNode[];
  action?: TaskType;
  condition?: string;
}

// ============================================================================
// AI MODEL REGISTRY
// ============================================================================

export enum ModelType {
  PERCEPTION = 'PERCEPTION',   // Object detection, SLAM, etc.
  DECISION = 'DECISION',       // High-level planning
  PLANNING = 'PLANNING',       // Path planning, motion
  CONTROL = 'CONTROL',         // Low-level control
  HYBRID = 'HYBRID'           // End-to-end
}

export enum ModelStatus {
  TRAINING = 'TRAINING',
  VALIDATING = 'VALIDATING',
  READY = 'READY',
  DEPLOYED = 'DEPLOYED',
  DEPRECATED = 'DEPRECATED',
  FAILED = 'FAILED'
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: ModelType;
  status: ModelStatus;

  // Architecture
  architecture: string; // e.g., "CNN", "Transformer", "DRL"
  framework: string; // e.g., "PyTorch", "TensorFlow"

  // Training
  trainedOn: string; // Dataset ID
  trainingStarted?: Date;
  trainingCompleted?: Date;
  epochs: number;
  hyperparameters: Record<string, unknown>;

  // Performance
  metrics: ModelMetrics;

  // Deployment
  deployedAt?: Date;
  deployedEnvironment?: 'SIMULATION' | 'STAGING' | 'PRODUCTION';
  deployedRobots: string[]; // Robot IDs

  // Metadata
  trainedBy: string; // User ID
  description?: string;
  tags: string[];

  // Artifacts
  checkpointUrl?: string;
  logsUrl?: string;

  // Comparison
  baselineModelId?: string; // For A/B testing

  createdAt: Date;
  updatedAt: Date;
}

export interface ModelMetrics {
  // Performance
  accuracy?: number; // 0-100
  precision?: number;
  recall?: number;
  f1Score?: number;

  // Runtime
  latency: number; // ms (avg inference time)
  throughput?: number; // inferences/sec

  // Mission outcomes
  successRate: number; // 0-100
  totalRuns: number;
  totalFailures: number;

  // Efficiency
  energyEfficiency?: number; // tasks/Wh
  collisionRate?: number; // collisions/mission

  // Custom metrics
  custom?: Record<string, number>;
}

export interface ModelComparison {
  modelA: AIModel;
  modelB: AIModel;
  comparisonMetrics: {
    metricName: string;
    modelAValue: number;
    modelBValue: number;
    improvement: number; // percentage
  }[];
  winner?: 'A' | 'B' | 'TIE';
  recommendation: string;
}

// ============================================================================
// FLEET MANAGEMENT
// ============================================================================

export enum RobotType {
  GROUND = 'GROUND',       // Wheeled, tracked
  AERIAL = 'AERIAL',       // Drone, quadcopter
  AQUATIC = 'AQUATIC',     // Underwater, surface
  HYBRID = 'HYBRID'        // Multi-modal
}

export enum RobotHardwareStatus {
  AVAILABLE = 'AVAILABLE',     // Ready to deploy
  DEPLOYED = 'DEPLOYED',       // On mission
  CHARGING = 'CHARGING',       // Recharging
  MAINTENANCE = 'MAINTENANCE', // Under repair
  OFFLINE = 'OFFLINE',         // Disconnected
  ERROR = 'ERROR'             // Hardware failure
}

export interface Robot {
  id: string;
  name: string;
  type: RobotType;
  status: RobotHardwareStatus;

  // Hardware specs
  manufacturer?: string;
  model?: string;
  serialNumber?: string;

  // Capabilities
  sensors: SensorConfig[];
  actuators: ActuatorConfig[];
  maxSpeed: number; // m/s
  maxPayload: number; // kg
  batteryCapacity: number; // Wh

  // State
  battery: number; // percentage
  health: number; // percentage
  location: Coordinates;
  heading?: number; // degrees

  // Software
  firmwareVersion: string;
  installedModels: string[]; // Model IDs

  // Mission
  currentMissionId?: string;
  lastMissionId?: string;
  totalMissions: number;

  // Connectivity
  isConnected: boolean;
  lastSeen: Date;
  networkQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

  // Maintenance
  totalOperatingHours: number;
  nextMaintenanceDue?: Date;
  maintenanceHistory: MaintenanceRecord[];

  // Metadata
  addedBy: string;
  addedAt: Date;
  tags: string[];
}

export interface SensorConfig {
  id: string;
  type: 'CAMERA' | 'LIDAR' | 'RADAR' | 'IMU' | 'GPS' | 'THERMAL' | 'ULTRASONIC';
  name: string;
  specs: Record<string, unknown>;
  isActive: boolean;
}

export interface ActuatorConfig {
  id: string;
  type: 'MOTOR' | 'GRIPPER' | 'MANIPULATOR' | 'EXTINGUISHER' | 'SPEAKER';
  name: string;
  specs: Record<string, unknown>;
  isActive: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'ROUTINE' | 'REPAIR' | 'UPGRADE';
  description: string;
  performedBy: string;
  cost?: number;
  duration: number; // minutes
}

// ============================================================================
// ANALYTICS & PERFORMANCE
// ============================================================================

export interface MissionAnalytics {
  missionId: string;
  missionName: string;

  // Timing
  duration: number; // seconds
  plannedDuration?: number;

  // Success metrics
  successRate: number; // 0-100
  tasksCompleted: number;
  tasksTotal: number;

  // Energy
  energyConsumed: number; // Wh
  energyEfficiency: number; // tasks/Wh

  // Safety
  collisionCount: number;
  emergencyStops: number;
  safetyViolations: string[];

  // Performance
  avgDecisionLatency: number; // ms
  maxDecisionLatency: number;
  explorationCoverage: number; // percentage
  pathEfficiency: number; // actual/optimal path length

  // Outcomes
  victimsRescued: number;
  firesExtinguished: number;

  // Human intervention
  interventionCount: number;
  interventionDuration: number; // seconds
  manualOverrides: number;

  // Cost (if applicable)
  estimatedCost?: number;
  valueGenerated?: number;

  // Metadata
  robotId: string;
  modelVersion?: string;
  scenarioId: string;
  timestamp: Date;
}

export interface PerformanceTrend {
  metric: string;
  dataPoints: {
    timestamp: Date;
    value: number;
    missionId?: string;
  }[];
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  changeRate: number; // percentage change
}

export interface BenchmarkResult {
  scenarioId: string;
  scenarioName: string;
  runs: number;
  avgSuccessRate: number;
  avgDuration: number;
  avgEnergyConsumed: number;
  bestRun: string; // Mission ID
  worstRun: string;
  standardDeviation: number;
}

// ============================================================================
// REPLAY & DEBUGGING
// ============================================================================

export interface ReplaySession {
  id: string;
  missionId: string;

  // Recording
  recordedAt: Date;
  duration: number; // seconds
  frameCount: number;
  fps: number;

  // Playback state
  currentFrame: number;
  playbackSpeed: number; // 0.25 - 10x
  isPlaying: boolean;

  // Data
  frames: ReplayFrame[];
  events: ReplayEvent[];

  // Annotations
  bookmarks: ReplayBookmark[];
  notes: string[];
}

export interface ReplayFrame {
  frameNumber: number;
  timestamp: number; // ms from start

  // State snapshot
  robotState: RobotState;
  gridState: Cell[][];

  // Sensor data
  sensorReadings?: Record<string, unknown>;

  // Decision context
  decision?: DecisionResponse;
  modelOutput?: Record<string, unknown>;
}

export interface ReplayEvent {
  id: string;
  timestamp: number;
  type: 'DECISION' | 'COLLISION' | 'TASK_COMPLETE' | 'INTERVENTION' | 'ERROR';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  description: string;
  frameNumber: number;
  data?: Record<string, unknown>;
}

export interface ReplayBookmark {
  id: string;
  name: string;
  frameNumber: number;
  timestamp: number;
  note?: string;
  createdBy: string;
}

export interface DecisionExplanation {
  timestamp: number;
  decision: DecisionResponse;

  // Context
  sensorInputs: Record<string, unknown>;
  worldState: string; // Serialized state

  // Reasoning
  consideredActions: {
    action: string;
    score: number;
    pros: string[];
    cons: string[];
  }[];
  selectedAction: string;
  confidenceScore: number; // 0-100

  // Comparison
  alternativePath?: string; // What would have happened
}

// ============================================================================
// TIME TRACKING
// ============================================================================

export enum TimeEntryType {
  MISSION = 'MISSION',           // Active mission time
  IDLE = 'IDLE',                 // Robot idle
  INTERVENTION = 'INTERVENTION', // Manual control
  TRAINING = 'TRAINING',         // Model training
  MAINTENANCE = 'MAINTENANCE',   // Repair/service
  CHARGING = 'CHARGING',         // Recharging
  SIMULATION = 'SIMULATION'      // Simulation testing
}

export interface TimeEntry {
  id: string;
  type: TimeEntryType;

  // Association
  robotId?: string;
  missionId?: string;
  userId?: string; // Operator

  // Timing
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds (calculated)

  // Metadata
  description?: string;
  tags: string[];
}

export interface RuntimeAnalytics {
  // Time distribution
  totalTime: number; // seconds
  breakdown: {
    type: TimeEntryType;
    duration: number;
    percentage: number;
  }[];

  // Efficiency
  utilizationRate: number; // percentage (mission + intervention / total)
  idleRate: number;
  interventionRate: number;

  // Operator metrics
  operatorShiftTime?: number;
  operatorProductivity?: number; // missions/hour

  // Cost
  operationalCost?: number; // $ (if cost model exists)
  costPerHour?: number;

  // SLA
  uptime: number; // percentage
  downtimeReasons: { reason: string; duration: number }[];
}

// ============================================================================
// REAL-TIME COMMUNICATION
// ============================================================================

export enum WebSocketEventType {
  // Robot events
  ROBOT_STATUS_UPDATE = 'ROBOT_STATUS_UPDATE',
  ROBOT_LOCATION_UPDATE = 'ROBOT_LOCATION_UPDATE',
  ROBOT_TELEMETRY = 'ROBOT_TELEMETRY',

  // Mission events
  MISSION_STARTED = 'MISSION_STARTED',
  MISSION_COMPLETED = 'MISSION_COMPLETED',
  MISSION_FAILED = 'MISSION_FAILED',
  TASK_COMPLETED = 'TASK_COMPLETED',

  // Alerts
  EMERGENCY_STOP = 'EMERGENCY_STOP',
  LOW_BATTERY = 'LOW_BATTERY',
  COLLISION_DETECTED = 'COLLISION_DETECTED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',

  // User events
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  INTERVENTION_STARTED = 'INTERVENTION_STARTED'
}

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: Date;
  userId?: string;
  robotId?: string;
  missionId?: string;
}

// ============================================================================
// NOTIFICATIONS & ALERTS
// ============================================================================

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: SystemModule;

  // Context
  robotId?: string;
  missionId?: string;

  // State
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;

  // Actions
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;

  timestamp: Date;
  expiresAt?: Date;
}

// ============================================================================
// EXPORT & REPORTING
// ============================================================================

export enum ExportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  XLSX = 'XLSX',
  JSON = 'JSON',
  XML = 'XML'
}

export interface ExportRequest {
  format: ExportFormat;
  dataType: 'ANALYTICS' | 'MISSIONS' | 'TELEMETRY' | 'LOGS';

  // Filters
  dateRange?: {
    start: Date;
    end: Date;
  };
  missionIds?: string[];
  robotIds?: string[];

  // Options
  includeCharts?: boolean;
  includeRawData?: boolean;

  requestedBy: string;
  requestedAt: Date;
}

export interface Report {
  id: string;
  name: string;
  type: 'PERFORMANCE' | 'SAFETY' | 'COMPLIANCE' | 'CUSTOM';

  // Content
  summary: string;
  sections: ReportSection[];

  // Metadata
  generatedAt: Date;
  generatedBy: string;
  period: {
    start: Date;
    end: Date;
  };

  // Export
  pdfUrl?: string;
  dataUrl?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string; // Markdown or HTML
  charts?: ChartConfig[];
  tables?: TableData[];
}

export interface ChartConfig {
  type: 'LINE' | 'BAR' | 'PIE' | 'AREA' | 'SCATTER';
  title: string;
  data: unknown[];
  xAxis?: string;
  yAxis?: string;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// ============================================================================
// SIMULATION EXTENSIONS
// ============================================================================

export interface SimulationInstance {
  id: string;
  name: string;
  scenario: ScenarioConfig;
  status: 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';

  // State
  currentTick: number;
  startTime: Date;
  endTime?: Date;

  // Participants
  robots: Map<string, RobotState>;

  // Recording
  isRecording: boolean;
  recordingId?: string;

  // Metrics
  metrics: SimulationMetrics;

  // Control
  isPaused: boolean;
  playbackSpeed: number;
}

export interface WorldBuilderConfig {
  gridSize: number;
  terrain: {
    type: 'URBAN' | 'WILDERNESS' | 'INDOOR' | 'MIXED';
    elevation?: number[][]; // Height map
  };
  weather?: {
    condition: 'CLEAR' | 'RAIN' | 'FOG' | 'SNOW';
    visibility: number; // meters
  };
  lighting?: {
    timeOfDay: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
    intensity: number; // 0-100
  };
  obstacles: ObstacleConfig[];
  randomization: {
    enabled: boolean;
    seed?: number;
    obstacleDensity: number;
    victimCount: number;
    fireCount: number;
  };
}

export interface ObstacleConfig {
  type: CellType;
  position: Coordinates;
  size?: number;
  rotation?: number;
  properties?: Record<string, unknown>;
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export interface SystemConfig {
  simulation: {
    defaultGridSize: number;
    defaultTickRate: number;
    maxRobotsPerSim: number;
    physicsEngine: 'SIMPLE' | 'ADVANCED';
  };
  ai: {
    defaultModelProvider: string;
    fallbackModel: string;
    maxDecisionTime: number; // ms
  };
  storage: {
    maxReplayStorage: number; // GB
    retentionDays: number;
    autoCleanup: boolean;
  };
  performance: {
    enableTelemetry: boolean;
    sampleRate: number; // 0-100
    maxLogEntries: number;
  };
}

// ============================================================================
// PERMISSIONS & RBAC
// ============================================================================

export enum Permission {
  // Missions
  MISSION_CREATE = 'MISSION_CREATE',
  MISSION_EDIT = 'MISSION_EDIT',
  MISSION_DELETE = 'MISSION_DELETE',
  MISSION_DEPLOY = 'MISSION_DEPLOY',
  MISSION_ABORT = 'MISSION_ABORT',

  // Robots
  ROBOT_VIEW = 'ROBOT_VIEW',
  ROBOT_CONTROL = 'ROBOT_CONTROL',
  ROBOT_CONFIGURE = 'ROBOT_CONFIGURE',

  // Models
  MODEL_TRAIN = 'MODEL_TRAIN',
  MODEL_DEPLOY = 'MODEL_DEPLOY',
  MODEL_DELETE = 'MODEL_DELETE',

  // Analytics
  ANALYTICS_VIEW = 'ANALYTICS_VIEW',
  ANALYTICS_EXPORT = 'ANALYTICS_EXPORT',

  // Admin
  USER_MANAGE = 'USER_MANAGE',
  SETTINGS_MANAGE = 'SETTINGS_MANAGE',
  BILLING_VIEW = 'BILLING_VIEW'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OPERATOR]: [
    Permission.MISSION_CREATE,
    Permission.MISSION_DEPLOY,
    Permission.MISSION_ABORT,
    Permission.ROBOT_VIEW,
    Permission.ROBOT_CONTROL,
    Permission.ANALYTICS_VIEW
  ],
  [UserRole.ENGINEER]: [
    Permission.MISSION_CREATE,
    Permission.MISSION_EDIT,
    Permission.ROBOT_VIEW,
    Permission.ROBOT_CONFIGURE,
    Permission.MODEL_TRAIN,
    Permission.MODEL_DEPLOY,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT
  ],
  [UserRole.RESEARCHER]: [
    Permission.MISSION_CREATE,
    Permission.MISSION_EDIT,
    Permission.ROBOT_VIEW,
    Permission.MODEL_TRAIN,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT
  ],
  [UserRole.ADMIN]: Object.values(Permission) // All permissions
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    duration: number; // ms
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = Date;
export type Percentage = number; // 0-100

export interface Coordinates {
  x: number;
  y: number;
  z?: number;
}

// Re-export from base types
import { SystemModule, Cell, RobotState, DecisionResponse, CellType, SimulationMetrics } from './types';

// ============================================================================
// MISSION TIME INTELLIGENCE (MTI)
// ============================================================================

/**
 * Mission phases detected automatically from robot state
 * This is the semantic layer that gives meaning to time tracking
 */
export enum MissionPhase {
  INITIALIZATION = 'INITIALIZATION',     // System boot, sensor checks
  EXPLORATION = 'EXPLORATION',           // Mapping unknown areas
  NAVIGATION = 'NAVIGATION',             // Moving to known targets
  HAZARD_AVOIDANCE = 'HAZARD_AVOIDANCE', // Fire/obstacle detours
  VICTIM_DETECTION = 'VICTIM_DETECTION', // Bio-signature scanning
  RESCUE_OPERATION = 'RESCUE_OPERATION', // Victim recovery
  DECISION_LATENCY = 'DECISION_LATENCY', // AI planning time
  RECOVERY = 'RECOVERY',                 // Replanning / rerouting
  RETURN_TO_BASE = 'RETURN_TO_BASE',    // Mission wrap-up
  IDLE = 'IDLE',                        // Stationary / waiting
  CHARGING = 'CHARGING',                // Battery recharge
  EMERGENCY = 'EMERGENCY'               // E-STOP / error state
}

/**
 * Individual time event in mission timeline
 * Each event represents a state change or milestone
 */
export interface MTIEvent {
  id: string;
  missionId: string;
  timestamp: Date;

  // Phase classification
  phase: MissionPhase;
  phaseStartTime: Date;
  phaseDuration?: number; // seconds (null if ongoing)

  // Context
  robotState: Partial<RobotState>;
  location: Coordinates;
  battery: number;

  // Event details
  eventType: 'PHASE_START' | 'PHASE_END' | 'ALERT' | 'MILESTONE';
  description: string;

  // Metadata
  isAnomaly: boolean; // Flagged by anomaly detection
  cost?: number; // Estimated cost of this event
}

/**
 * Mission time summary (aggregated metrics)
 * Generated at mission completion for analytics
 */
export interface MTISummary {
  missionId: string;
  missionName: string;

  // Overall timing
  totalDuration: number; // seconds
  startTime: Date;
  endTime: Date;

  // Phase breakdown
  phaseBreakdown: {
    phase: MissionPhase;
    duration: number; // seconds
    percentage: number; // 0-100
    count: number; // How many times entered this phase
  }[];

  // Active vs Idle
  activeTime: number; // seconds
  idleTime: number; // seconds
  utilizationRate: number; // percentage (active / total)

  // Critical metrics
  timeToFirstVictim?: number; // seconds
  timeToFirstFire?: number;
  avgDecisionLatency: number; // ms
  maxDecisionLatency: number;

  // Delays & Bottlenecks
  totalDelayTime: number; // seconds
  bottlenecks: MTIBottleneck[];

  // Alerts
  alertsTriggered: MTIAlert[];

  // Cost & Value
  operationalCost: number; // $ (if cost model enabled)
  costPerMinute: number;
  timeValueScore: number; // 0-100 (efficiency rating)

  // Survival metrics (if enabled)
  victimSurvivalWindows?: {
    victimId: string;
    detectedAt: number; // seconds from start
    rescuedAt?: number;
    criticalWindow: number; // seconds
    windowMet: boolean;
  }[];

  // Comparison
  baselineComparison?: {
    humanTeamEstimate: number; // seconds
    timeSaved: number; // seconds
    efficiencyGain: number; // percentage
  };
}

/**
 * Detected bottleneck in mission
 * Represents an inefficiency or delay point
 */
export interface MTIBottleneck {
  id: string;
  phase: MissionPhase;
  startTime: Date;
  duration: number; // seconds
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Root cause
  cause: string; // e.g., "obstacle congestion", "battery drain"
  location?: Coordinates;

  // Impact
  delayImpact: number; // seconds added to mission
  costImpact?: number; // $

  // Recommendations
  recommendation: string;
}

/**
 * Time-based alert triggered during mission
 * Real-time notifications for operator intervention
 */
export interface MTIAlert {
  id: string;
  timestamp: Date;
  type: 'TIME_THRESHOLD' | 'DELAY_DETECTED' | 'EFFICIENCY_DROP' | 'SURVIVAL_WINDOW';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';

  message: string;

  // Context
  phase: MissionPhase;
  metric: string; // e.g., "timeToFirstVictim", "navigationTime"
  threshold: number;
  actualValue: number;

  // Actions
  actionTaken?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

/**
 * MTI Configuration
 * Controls MTI behavior and thresholds
 */
export interface MTIConfig {
  // Feature toggles
  enablePhaseDetection: boolean;
  enableAnomalyDetection: boolean;
  enableSurvivalModeling: boolean;
  enableCostTracking: boolean;

  // Thresholds
  timeToFirstVictimThreshold: number; // seconds
  maxDecisionLatencyThreshold: number; // ms
  idleTimeThreshold: number; // seconds

  // Cost model
  costPerMinute?: number; // $
  energyCostPerKwh?: number; // $

  // Baseline comparisons
  humanTeamBaselineTime?: number; // seconds

  // Alert settings
  enableRealTimeAlerts: boolean;
  alertChannels: ('UI' | 'EMAIL' | 'SMS')[];
}

/**
 * Live MTI state (for dashboard widget)
 * Updated every simulation tick
 */
export interface MTILiveState {
  missionId: string;
  isActive: boolean;

  // Current timing
  elapsedTime: number; // seconds
  currentPhase: MissionPhase;
  phaseElapsedTime: number; // seconds in current phase

  // Running totals
  activeTime: number;
  idleTime: number;

  // Phase distribution (so far)
  phaseDistribution: {
    phase: MissionPhase;
    duration: number;
    percentage: number;
  }[];

  // Critical events
  timeToFirstVictim?: number;
  victimsRescuedCount: number;
  firesExtinguishedCount: number;

  // Alerts
  activeAlerts: MTIAlert[];

  // Predictions (if enabled)
  estimatedCompletion?: Date;
  estimatedTotalTime?: number; // seconds
}

/**
 * Post-mission recommendation from MTI
 * AI-generated insights for optimization
 */
export interface MTIRecommendation {
  id: string;
  missionId: string;

  category: 'EFFICIENCY' | 'SAFETY' | 'COST' | 'PLANNING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  title: string;
  description: string;

  // Evidence
  dataPoints: {
    metric: string;
    currentValue: number;
    targetValue: number;
    improvement: number; // percentage
  }[];

  // Implementation
  actionable: boolean;
  implementation?: string; // How to apply
  estimatedImpact: string; // e.g., "18% faster", "$45 saved"
}
