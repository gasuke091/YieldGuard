export type UnitStatus = 'pass' | 'defect' | 'marginal' | 'inhibited';

export interface SubstrateUnit {
  index: number;
  row: number;
  col: number;
  status: UnitStatus;
  acousticReflectionPercent: number; // 0 - 100% (high means void/delamination)
  bondlineThicknessUm: number; // nominal 15um
  wireBondPullGf?: number; // nominal 8-12 gf
  thermalConductivityWmK: number; // nominal 2.5 W/mK
  defectType?: string;
}

export interface SubstrateStrip {
  stripId: string;
  lotId: string;
  equipmentId: string;
  packageType: string; // e.g. FC-BGA 1152, QFN-48, SiP Module
  totalUnits: number;
  defectCount: number;
  firstFailedUnitIndex: number | null;
  isInhibited: boolean;
  units: SubstrateUnit[];
  timestamp: string;
}

export interface MachineTelemetry {
  timestamp: string;
  temperatureC: number; // target: 175°C
  tempUcl: number;
  tempLcl: number;
  vacuumPressureKpa: number; // target: -18 kPa
  vacUcl: number;
  vacLcl: number;
  dispensePressurePsi: number; // target: 35 psi
  bondForceGf: number; // target: 12 gf
  ultrasonicPowerMw: number; // target: 85 mW
  cpk: number;
}

export interface CSamLayerScan {
  layerId: 'surface' | 'die' | 'die_attach' | 'substrate';
  name: string;
  description: string;
  nominalDepthUm: number;
  voidThresholdPercent: number;
  scanDataUrl?: string;
  detectedDefects: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    severity: 'High' | 'Medium' | 'Low';
    delaminationAreaPercent: number;
  }[];
}

export interface ExcursionPreset {
  id: string;
  title: string;
  equipmentId: string;
  packageType: string;
  defectType: string;
  lotId: string;
  stripId: string;
  firstFailedIndex: number;
  description: string;
  physicsSnippet: string;
  preventableScrapUsd: number;
  telemetry: {
    temp: number;
    vacuum: number;
    pressure: number;
    bondForce: number;
    ultrasonic: number;
    cpk: number;
  };
}

export interface EightDReport {
  reportId: string;
  d0_plan: string;
  d1_team: Array<{
    name: string;
    role: string;
    dept: string;
  }>;
  d2_problemDescription: {
    what: string;
    where: string;
    when: string;
    howMuch: string;
    isNot: string;
  };
  d3_containment: {
    action: string;
    validation: string;
    quarantinedCount: number;
  };
  d4_rootCause: {
    fiveWhys: string[];
    fishboneCategories: {
      Machine: string[];
      Material: string[];
      Method: string[];
      Man: string[];
      Measurement: string[];
      Environment: string[];
    };
    escapeRootCause: string;
  };
  d5_correctiveActions: Array<{
    action: string;
    owner: string;
    targetDate: string;
    status: string;
  }>;
  d6_verification: {
    validationPlan: string;
    resultsTarget: string;
  };
  d7_prevention: {
    controlPlanUpdate: string;
    fmeaUpdate: string;
    sopRevisions: string;
  };
  d8_closure: string;
}

export interface FmeaRecord {
  processStep: string;
  failureMode: string;
  potentialEffect: string;
  potentialCause: string;
  initial: {
    severity: number;
    occurrence: number;
    detection: number;
    rpn: number;
    actionPriority: 'High' | 'Medium' | 'Low';
  };
  mitigationActions: string;
  revised: {
    severity: number;
    occurrence: number;
    detection: number;
    rpn: number;
    actionPriority: 'High' | 'Medium' | 'Low';
  };
  rpnReductionPercent: number;
  complianceStandard: string;
}

export interface MesHoldItem {
  id: string;
  timestamp: string;
  lotId: string;
  equipmentId: string;
  recipeId: string;
  stripId: string;
  unitIndex: number;
  defectType: string;
  secsMessage: string;
  status: 'INHIBITED' | 'RELEASED' | 'PENDING_ENG_REVIEW';
  operator: string;
  estimatedScrapPreventedUsd: number;
  reason: string;
}

export interface EquipmentRulComponent {
  componentId: string;
  name: string;
  equipmentId: string;
  category: 'Thermal' | 'Pneumatic / Vacuum' | 'Ultrasonic / Acoustic' | 'Mechanical';
  healthScorePercent: number; // 0 - 100
  rulHours: number;
  rulStrips: number;
  failureMechanism: string;
  telemetryCorrelations: string[];
  recommendedAction: string;
  partNumber: string;
  maintenancePriority: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  wearRatePerHour: number;
  historicalWearPoints: { hour: number; health: number }[];
}

