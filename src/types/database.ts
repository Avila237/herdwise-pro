/**
 * Tipos do banco de dados para o Sistema de Gestão Reprodutiva
 */

// Enums
export type AnimalCategory = 'vaca' | 'novilha';
export type AnimalParity = 'primipara' | 'multipara';
export type ReproductiveStatus = 'vazia' | 'inseminada' | 'prenha' | 'seca';
export type ProductiveStatus = 'lactacao' | 'seca' | 'descartada';
export type EventType = 'campo' | 'ia' | 'iatf' | 'sanitario' | 'parto' | 'secagem' | 'descarte' | 'diagnostico';
export type IAType = 'cio' | 'iatf' | 'retorno';
export type DiagnosisType = 'dg1' | 'dg2' | 'dg3';
export type DiagnosisResult = 'prenha' | 'vazia' | 'perda';
export type CalfSex = 'macho' | 'femea';
export type CalvingEase = 'facil' | 'dificil' | 'cesariana';
export type MetricCategory = 'reproductive' | 'inventory' | 'quality';
export type MetricScope = 'farm' | 'lot' | 'animal';
export type MetricFormat = 'percentage' | 'decimal' | 'integer';
export type ParameterType = 'number' | 'text' | 'boolean' | 'date';

// Entities
export interface Farm {
  id: string;
  name: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  farm_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  farm_id: string;
  lot_id?: string;
  
  // Identification
  identification: string;
  name?: string;
  ear_tag?: string;
  electronic_tag?: string;
  
  // Genealogy
  father_name?: string;
  mother_name?: string;
  grandfather_name?: string;
  great_grandfather_name?: string;
  
  // Dates
  birth_date?: string;
  first_calving_date?: string;
  last_calving_date?: string;
  
  // Category & Status
  category: AnimalCategory;
  parity?: AnimalParity;
  reproductive_status: ReproductiveStatus;
  productive_status: ProductiveStatus;
  
  // Reproductive data
  current_del?: number;
  current_dea?: number;
  expected_calving_date?: string;
  dry_off_date?: string;
  
  // Health flags
  placental_retention: boolean;
  ketosis: boolean;
  metritis: boolean;
  mastitis: boolean;
  lameness: boolean;
  
  // Metadata
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  lot?: Lot;
}

export interface Event {
  id: string;
  farm_id: string;
  animal_id: string;
  
  event_type: EventType;
  event_subtype?: string;
  event_date: string;
  
  payload: Record<string, any>;
  
  // IA/IATF fields
  bull_name?: string;
  inseminator_name?: string;
  ia_type?: IAType;
  protocol_day?: string;
  gnrh_at_ia?: boolean;
  
  // Diagnosis fields
  diagnosis_type?: DiagnosisType;
  diagnosis_result?: DiagnosisResult;
  days_post_ia?: number;
  
  // Calving fields
  calf_sex?: CalfSex;
  calf_count?: number;
  calving_ease?: CalvingEase;
  
  notes?: string;
  visit_number?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  animal?: Animal;
}

export interface Parameter {
  id: string;
  farm_id: string;
  name: string;
  value: string;
  value_type: ParameterType;
  description?: string;
  version: number;
  is_current: boolean;
  created_at: string;
}

export interface MetricDefinition {
  id: string;
  farm_id?: string;
  name: string;
  display_name: string;
  category: MetricCategory;
  formula: string;
  unit?: string;
  format?: MetricFormat;
  decimals?: number;
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  higher_is_better: boolean;
  scope: MetricScope;
  version: number;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricResult {
  id: string;
  metric_definition_id: string;
  farm_id: string;
  lot_id?: string;
  animal_id?: string;
  reference_date: string;
  period_start?: string;
  period_end?: string;
  visit_number?: number;
  value?: number;
  formula_version: number;
  calculation_details?: Record<string, any>;
  calculated_at: string;
  
  // Relationships
  metric_definition?: MetricDefinition;
}

export interface FeatureFlag {
  id: string;
  farm_id: string;
  feature_name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Form types
export interface AnimalFormData {
  identification: string;
  name?: string;
  ear_tag?: string;
  electronic_tag?: string;
  father_name?: string;
  mother_name?: string;
  grandfather_name?: string;
  great_grandfather_name?: string;
  birth_date?: string;
  first_calving_date?: string;
  last_calving_date?: string;
  category: AnimalCategory;
  parity?: AnimalParity;
  reproductive_status: ReproductiveStatus;
  productive_status: ProductiveStatus;
  lot_id?: string;
  notes?: string;
}

export interface EventFormData {
  animal_id: string;
  event_type: EventType;
  event_subtype?: string;
  event_date: string;
  bull_name?: string;
  inseminator_name?: string;
  ia_type?: IAType;
  protocol_day?: string;
  gnrh_at_ia?: boolean;
  diagnosis_type?: DiagnosisType;
  diagnosis_result?: DiagnosisResult;
  days_post_ia?: number;
  calf_sex?: CalfSex;
  calf_count?: number;
  calving_ease?: CalvingEase;
  notes?: string;
  visit_number?: number;
}

// Dashboard types
export interface MetricCard {
  id: string;
  name: string;
  displayName: string;
  value: number | null;
  unit?: string;
  format?: MetricFormat;
  decimals?: number;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  higherIsBetter: boolean;
  status: 'good' | 'warning' | 'bad' | 'neutral';
}

export interface DashboardData {
  metrics: MetricCard[];
  animalsCount: number;
  pregnantCount: number;
  inseminatedCount: number;
  emptyCount: number;
  averageDEL?: number;
  averageDEA?: number;
}
