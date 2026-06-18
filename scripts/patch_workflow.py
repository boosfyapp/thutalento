import json, uuid, re

CHANNEL_ID = 3389
BOOSFY_API_KEY = "pcp_e2254f5db61c2a2633f73a4deaef3fa3a0cdf2964d5c833f47d9254c400c5900"

with open("C:/Users/paco_/Desktop/Claude code/thutalento/scripts/thu_workflow_current.json", encoding="utf-8") as f:
    wf = json.load(f)

raw = json.dumps(wf, ensure_ascii=False)

# ── 1. Replace all placeholders ───────────────────────────────────────────────
raw = raw.replace("CHANNEL_ID_PLACEHOLDER", str(CHANNEL_ID))
raw = raw.replace("BOOSFY_API_KEY_PLACEHOLDER", BOOSFY_API_KEY)

wf = json.loads(raw)

# ── 2. Add "Extraer Ficha IA" node ────────────────────────────────────────────
EXTRACTION_PROMPT = """Analiza la conversacion de WhatsApp entre el candidato y el asistente virtual.
Extrae SOLO los datos mencionados explicitamente por el candidato (no inventes ni asumas).
Devuelve un JSON con estos campos (null si no se menciona):

{
  "nombre": "string o null",
  "vacante_aplicada": "string o null",
  "ciudad": "string o null",
  "experiencia_anos": numero_entero_o_null,
  "area_experiencia": "string o null",
  "nivel_estudios": "Secundaria|Preparatoria|Tecnico|Licenciatura|Maestria|Doctorado|null",
  "disponibilidad": "inmediata|fecha_especifica|null",
  "expectativa_salarial": "string con monto o null",
  "habilidades": "lista separada por comas o null",
  "idiomas": "lista separada por comas o null",
  "tiene_cv": true|false|null,
  "cv_url": "url o null"
}

Responde UNICAMENTE el JSON, sin texto adicional."""

extraer_ficha_node = {
    "parameters": {
        "resource": "text",
        "operation": "message",
        "modelId": {
            "__rl": True,
            "mode": "list",
            "value": "gpt-4.1-mini"
        },
        "messages": {
            "values": [
                {
                    "role": "system",
                    "content": EXTRACTION_PROMPT
                },
                {
                    "role": "user",
                    "content": "={{ 'Conversacion actual:\\n' + $('Chat input').item.json.chat_input + '\\n\\nRespuesta del asistente:\\n' + $('Preparar Respuesta').item.json.mensajeFinal }}"
                }
            ]
        },
        "options": {
            "responseFormat": "json_object"
        }
    },
    "type": "@n8n/n8n-nodes-langchain.openAi",
    "typeVersion": 1.8,
    "position": [3700, -320],
    "id": str(uuid.uuid4()),
    "name": "Extraer Ficha IA",
    "credentials": {"openAiApi": {"id": "FXAla6LzcM8ZyIxJ", "name": "OpenAI"}}
}

update_ficha_node = {
    "parameters": {
        "operation": "executeQuery",
        "query": """DO $$
DECLARE
  v_ficha JSONB;
  v_conv_id TEXT := '={{ $('Boosfy Inbound').item.json.body.conversation.id }}';
  v_completitud INTEGER;
  v_fields_filled INTEGER := 0;
  v_total_fields INTEGER := 11;
BEGIN
  v_ficha := '={{ $json.message.content }}'::JSONB;

  -- Contar campos llenos para calcular completitud
  IF v_ficha->>'nombre' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'vacante_aplicada' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'ciudad' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'experiencia_anos' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'area_experiencia' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'nivel_estudios' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'disponibilidad' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'expectativa_salarial' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'habilidades' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'idiomas' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  IF v_ficha->>'tiene_cv' IS NOT NULL THEN v_fields_filled := v_fields_filled + 1; END IF;
  v_completitud := ROUND((v_fields_filled::NUMERIC / v_total_fields) * 100);

  UPDATE candidatos SET
    nombre             = COALESCE(NULLIF(v_ficha->>'nombre','null'), nombre),
    vacante_aplicada   = COALESCE(NULLIF(v_ficha->>'vacante_aplicada','null'), vacante_aplicada),
    ciudad             = COALESCE(NULLIF(v_ficha->>'ciudad','null'), ciudad),
    experiencia_anos   = COALESCE(NULLIF(v_ficha->>'experiencia_anos','null')::INTEGER, experiencia_anos),
    area_experiencia   = COALESCE(NULLIF(v_ficha->>'area_experiencia','null'), area_experiencia),
    nivel_estudios     = COALESCE(NULLIF(v_ficha->>'nivel_estudios','null'), nivel_estudios),
    disponibilidad     = COALESCE(NULLIF(v_ficha->>'disponibilidad','null'), disponibilidad),
    expectativa_salarial = COALESCE(NULLIF(v_ficha->>'expectativa_salarial','null'), expectativa_salarial),
    habilidades        = COALESCE(NULLIF(v_ficha->>'habilidades','null'), habilidades),
    idiomas            = COALESCE(NULLIF(v_ficha->>'idiomas','null'), idiomas),
    tiene_cv           = COALESCE(NULLIF(v_ficha->>'tiene_cv','null')::BOOLEAN, tiene_cv),
    cv_url             = COALESCE(NULLIF(v_ficha->>'cv_url','null'), cv_url),
    ficha_completitud  = GREATEST(ficha_completitud, v_completitud),
    updated_at         = NOW()
  WHERE conversation_id = v_conv_id;
END $$;""",
        "options": {}
    },
    "type": "n8n-nodes-base.postgres",
    "typeVersion": 2.6,
    "position": [3900, -320],
    "id": str(uuid.uuid4()),
    "name": "Actualizar Ficha",
    "credentials": {"postgres": {"id": "rNiASmL8Z9sa5xE1", "name": "Postgres Thu TH"}}
}

wf["nodes"].append(extraer_ficha_node)
wf["nodes"].append(update_ficha_node)

# ── 3. Wire: Preparar Respuesta forks to BOTH Guardar Candidato AND Extraer Ficha
wf["connections"]["Preparar Respuesta"] = {
    "main": [[
        {"node": "Guardar Candidato", "type": "main", "index": 0},
        {"node": "Extraer Ficha IA",  "type": "main", "index": 0}
    ]]
}
wf["connections"]["Extraer Ficha IA"] = {
    "main": [[{"node": "Actualizar Ficha", "type": "main", "index": 0}]]
}

# ── 4. Strip read-only fields before PUT ─────────────────────────────────────
for key in ["id", "createdAt", "updatedAt", "active", "isArchived", "versionId", "meta"]:
    wf.pop(key, None)
for n in wf["nodes"]:
    for key in ["typeVersion"]:  # keep, needed
        pass

out = "C:/Users/paco_/Desktop/Claude code/thutalento/scripts/thu_workflow_patched.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print(f"Patched workflow: {len(wf['nodes'])} nodes -> {out}")
