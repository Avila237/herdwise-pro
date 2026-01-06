-- ===========================================
-- SISTEMA DE GESTÃO REPRODUTIVA BOVINA
-- Estrutura Completa de Banco de Dados
-- ===========================================

-- 1. TABELA DE FAZENDAS
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. TABELA DE LOTES
CREATE TABLE public.lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. TABELA DE ANIMAIS
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
  
  -- Identificação
  identification TEXT NOT NULL, -- Matriz N°
  name TEXT,
  ear_tag TEXT, -- Brinco
  electronic_tag TEXT, -- Tag eletrônico
  
  -- Genealogia
  father_name TEXT, -- Pai
  mother_name TEXT, -- Mãe
  grandfather_name TEXT, -- Avô
  great_grandfather_name TEXT, -- Bisavô
  
  -- Datas importantes
  birth_date DATE,
  first_calving_date DATE, -- Data 1° parto
  last_calving_date DATE, -- Último parto
  
  -- Categoria e Status
  category TEXT NOT NULL DEFAULT 'vaca', -- vaca, novilha
  parity TEXT, -- primipara, multipara
  reproductive_status TEXT DEFAULT 'vazia', -- vazia, inseminada, prenha, seca
  productive_status TEXT DEFAULT 'lactacao', -- lactacao, seca, descartada
  
  -- Dados reprodutivos atuais
  current_del INTEGER, -- Dias em Lactação
  current_dea INTEGER, -- Dias em Aberto
  expected_calving_date DATE, -- Data prevista parto
  dry_off_date DATE, -- Data secagem prevista
  
  -- Ocorrências sanitárias (flags)
  placental_retention BOOLEAN DEFAULT FALSE, -- Retenção de placenta
  ketosis BOOLEAN DEFAULT FALSE, -- Cetose
  metritis BOOLEAN DEFAULT FALSE, -- Metrite
  mastitis BOOLEAN DEFAULT FALSE, -- Mastite
  lameness BOOLEAN DEFAULT FALSE, -- Claudicação
  
  -- Metadados
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TABELA DE EVENTOS (Histórico flexível)
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type TEXT NOT NULL, -- campo, ia, iatf, sanitario, parto, secagem, descarte
  event_subtype TEXT, -- Subtipo específico
  event_date DATE NOT NULL,
  
  -- Dados flexíveis do evento (JSON)
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Campos comuns para IA/IATF
  bull_name TEXT,
  inseminator_name TEXT,
  ia_type TEXT, -- cio, iatf, retorno
  protocol_day TEXT, -- D-0, D-8, D-9, D-10
  gnrh_at_ia BOOLEAN,
  
  -- Campos para diagnóstico
  diagnosis_type TEXT, -- dg1, dg2, dg3
  diagnosis_result TEXT, -- prenha, vazia, perda
  days_post_ia INTEGER,
  
  -- Campos para parto
  calf_sex TEXT, -- macho, femea
  calf_count INTEGER DEFAULT 1,
  calving_ease TEXT, -- facil, dificil, cesariana
  
  -- Metadados
  notes TEXT,
  visit_number INTEGER, -- Número da visita
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. TABELA DE PARÂMETROS (Configurações por fazenda)
CREATE TABLE public.parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- Nome do parâmetro (ex: janela_pos_ia_dias)
  value TEXT NOT NULL, -- Valor (armazenado como texto)
  value_type TEXT NOT NULL DEFAULT 'number', -- number, text, boolean, date
  description TEXT,
  
  -- Versionamento
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(farm_id, name, version)
);

-- 6. TABELA DE DEFINIÇÕES DE MÉTRICAS
CREATE TABLE public.metric_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE, -- NULL = métrica global
  
  name TEXT NOT NULL, -- Nome da métrica (ex: taxa_prenhez)
  display_name TEXT NOT NULL, -- Nome de exibição (ex: Taxa de Prenhez)
  category TEXT NOT NULL DEFAULT 'reproductive', -- reproductive, inventory, quality
  
  -- Fórmula estilo Excel
  formula TEXT NOT NULL,
  
  -- Configurações de exibição
  unit TEXT, -- %, dias, count
  format TEXT, -- percentage, decimal, integer
  decimals INTEGER DEFAULT 2,
  
  -- Metas e alertas
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  higher_is_better BOOLEAN DEFAULT TRUE,
  
  -- Escopo de cálculo
  scope TEXT NOT NULL DEFAULT 'farm', -- farm, lot, animal
  
  -- Versionamento
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. TABELA DE RESULTADOS DE MÉTRICAS (Cache calculado)
CREATE TABLE public.metric_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_definition_id UUID NOT NULL REFERENCES public.metric_definitions(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  
  -- Período de referência
  reference_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  visit_number INTEGER,
  
  -- Resultado
  value NUMERIC,
  formula_version INTEGER NOT NULL,
  
  -- Componentes do cálculo (para debug)
  calculation_details JSONB,
  
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. TABELA DE FEATURE FLAGS (Módulos habilitados)
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  
  feature_name TEXT NOT NULL, -- cadastro, campo, sanitario, ia_iatf, historico, indicadores, dashboard
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(farm_id, feature_name)
);

-- ===========================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX idx_animals_farm ON public.animals(farm_id);
CREATE INDEX idx_animals_lot ON public.animals(lot_id);
CREATE INDEX idx_animals_status ON public.animals(reproductive_status);
CREATE INDEX idx_animals_category ON public.animals(category);
CREATE INDEX idx_animals_identification ON public.animals(identification);

CREATE INDEX idx_events_farm ON public.events(farm_id);
CREATE INDEX idx_events_animal ON public.events(animal_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_date ON public.events(event_date);

CREATE INDEX idx_parameters_farm ON public.parameters(farm_id);
CREATE INDEX idx_parameters_name ON public.parameters(name);
CREATE INDEX idx_parameters_current ON public.parameters(farm_id, name) WHERE is_current = TRUE;

CREATE INDEX idx_metric_definitions_farm ON public.metric_definitions(farm_id);
CREATE INDEX idx_metric_definitions_category ON public.metric_definitions(category);
CREATE INDEX idx_metric_definitions_current ON public.metric_definitions(farm_id) WHERE is_current = TRUE;

CREATE INDEX idx_metric_results_metric ON public.metric_results(metric_definition_id);
CREATE INDEX idx_metric_results_farm ON public.metric_results(farm_id);
CREATE INDEX idx_metric_results_date ON public.metric_results(reference_date);

-- ===========================================
-- FUNÇÃO DE ATUALIZAÇÃO DE TIMESTAMPS
-- ===========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON public.metric_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- HABILITAR RLS (SEM POLÍTICAS POR ENQUANTO - MVP PÚBLICO)
-- ===========================================

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para MVP (acesso total sem autenticação)
CREATE POLICY "Allow all access to farms" ON public.farms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lots" ON public.lots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to animals" ON public.animals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to parameters" ON public.parameters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to metric_definitions" ON public.metric_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to metric_results" ON public.metric_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to feature_flags" ON public.feature_flags FOR ALL USING (true) WITH CHECK (true);