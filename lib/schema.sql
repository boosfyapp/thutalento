-- Thu Talento Humano — Schema
-- DB: thu_talento_humano

CREATE TABLE IF NOT EXISTS reclutadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  activo BOOLEAN DEFAULT true,
  leads_asignados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidatos (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  conversation_id VARCHAR(100) UNIQUE NOT NULL,
  channel_id INTEGER,
  nombre VARCHAR(100),
  vacante_aplicada VARCHAR(200),
  estado VARCHAR(30) DEFAULT 'activo',
  viable BOOLEAN,
  notas_ia TEXT,
  notas_reclutador TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interacciones (
  id SERIAL PRIMARY KEY,
  candidato_id INTEGER REFERENCES candidatos(id),
  tipo VARCHAR(10) NOT NULL,
  contenido TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asignaciones (
  id SERIAL PRIMARY KEY,
  candidato_id INTEGER REFERENCES candidatos(id),
  reclutador_id INTEGER REFERENCES reclutadores(id),
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'pendiente'
);

CREATE TABLE IF NOT EXISTS seguimientos (
  phone VARCHAR(20),
  conversation_id VARCHAR(100) UNIQUE NOT NULL,
  channel_id INTEGER,
  ultimo_mensaje_bot TEXT,
  status VARCHAR(20) DEFAULT 'esperando',
  seguimientos_enviados INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidatos_phone ON candidatos(phone);
CREATE INDEX IF NOT EXISTS idx_candidatos_estado ON candidatos(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_candidato ON asignaciones(candidato_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_reclutador ON asignaciones(reclutador_id);
