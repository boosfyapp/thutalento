import json, copy, uuid

import os
BASE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE, 'sofia_principal.json'), encoding='utf-8') as f:
    base = json.load(f)

nodes = copy.deepcopy(base['nodes'])
conns = copy.deepcopy(base['connections'])

SYSTEM_PROMPT = """Eres Sofia, asistente virtual de Thu Talento Humano, empresa especializada en reclutamiento y seleccion de personal.

Tu objetivo es atender candidatos que buscan empleo, recopilar sus datos clave y orientarlos en el proceso.

INSTRUCCIONES:
1. Saluda al candidato y pregunta su nombre completo.
2. Pregunta a que vacante esta interesado en aplicar.
3. Recoge informacion relevante: experiencia, disponibilidad, expectativa salarial.
4. Informa que un reclutador le dara seguimiento personalizado muy pronto.
5. Se amable, profesional y conciso. Idioma: Espanol.

Hoy es: {{ $now.format('dd MMM. yyyy', 'es') }}
ID de sesion: {{ $('Boosfy Inbound').item.json.body.conversation.id }}

Mensaje del candidato:
{{ $('Chat input').item.json.chat_input }}"""

for n in nodes:
    if n['name'] == 'Boosfy Inbound':
        n['parameters']['path'] = 'thu-talento-humano-agente'
        n.pop('webhookId', None)
    if n['name'] == 'AI Agent':
        n['parameters']['text'] = "={{ $('Chat input').item.json.chat_input }}"
        n['parameters']['options']['systemMessage'] = SYSTEM_PROMPT
    if n['name'] in ['Marcar Respondio', 'Guardar Seguimiento']:
        n['credentials'] = {'postgres': {'id': 'PLACEHOLDER_POSTGRES_THU', 'name': 'Postgres Thu TH'}}
    if n['name'] == 'Guardar Seguimiento':
        n['parameters']['query'] = (
            "INSERT INTO seguimientos (phone, conversation_id, channel_id, ultimo_mensaje_bot, status, seguimientos_enviados) "
            "VALUES ('={{ $('Boosfy Inbound').item.json.body.contact.phone }}', "
            "'={{ $('Boosfy Inbound').item.json.body.conversation.id }}', CHANNEL_ID_PLACEHOLDER, "
            "'={{ $('Preparar Respuesta').item.json.mensajeFinal }}', 'esperando', 0) "
            "ON CONFLICT (conversation_id) DO UPDATE SET ultimo_mensaje_bot = EXCLUDED.ultimo_mensaje_bot, "
            "status = 'esperando', seguimientos_enviados = 0, updated_at = NOW()"
        )

CREDS = {'postgres': {'id': 'PLACEHOLDER_POSTGRES_THU', 'name': 'Postgres Thu TH'}}

new_nodes = [
    {
        "parameters": {
            "operation": "executeQuery",
            "query": (
                "INSERT INTO candidatos (phone, conversation_id, channel_id) "
                "VALUES ('={{ $('Boosfy Inbound').item.json.body.contact.phone }}', "
                "'={{ $('Boosfy Inbound').item.json.body.conversation.id }}', CHANNEL_ID_PLACEHOLDER) "
                "ON CONFLICT (conversation_id) DO UPDATE SET updated_at = NOW() "
                "RETURNING id, phone, nombre, estado"
            ),
            "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [3700, -160],
        "id": str(uuid.uuid4()),
        "name": "Guardar Candidato",
        "credentials": CREDS
    },
    {
        "parameters": {
            "operation": "executeQuery",
            "query": "SELECT COUNT(*)::int as total FROM asignaciones WHERE candidato_id = {{ $json.id }}",
            "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [3900, -160],
        "id": str(uuid.uuid4()),
        "name": "Verificar Asignacion",
        "credentials": CREDS
    },
    {
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
                "conditions": [{
                    "id": str(uuid.uuid4()),
                    "leftValue": "={{ $json.total }}",
                    "rightValue": 0,
                    "operator": {"type": "number", "operation": "equals"}
                }],
                "combinator": "and"
            },
            "options": {}
        },
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [4100, -160],
        "id": str(uuid.uuid4()),
        "name": "Es Nuevo Candidato"
    },
    {
        "parameters": {
            "operation": "executeQuery",
            "query": "SELECT id, nombre, whatsapp FROM reclutadores WHERE activo = true ORDER BY leads_asignados ASC, id ASC LIMIT 1",
            "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [4300, -60],
        "id": str(uuid.uuid4()),
        "name": "Consultar Reclutador",
        "credentials": CREDS
    },
    {
        "parameters": {
            "operation": "executeQuery",
            "query": (
                "INSERT INTO asignaciones (candidato_id, reclutador_id, estado) "
                "VALUES ({{ $('Guardar Candidato').item.json.id }}, {{ $json.id }}, 'pendiente')"
            ),
            "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [4500, -60],
        "id": str(uuid.uuid4()),
        "name": "Registrar Asignacion",
        "credentials": CREDS
    },
    {
        "parameters": {
            "operation": "executeQuery",
            "query": "UPDATE reclutadores SET leads_asignados = leads_asignados + 1 WHERE id = {{ $('Consultar Reclutador').item.json.id }}",
            "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [4700, -60],
        "id": str(uuid.uuid4()),
        "name": "Actualizar Contador",
        "credentials": CREDS
    },
    {
        "parameters": {
            "url": "https://app.boosfy.com/api/v1/messages/send",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "Authorization", "value": "Bearer BOOSFY_API_KEY_PLACEHOLDER"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ channelId: CHANNEL_ID_PLACEHOLDER, to: $('Consultar Reclutador').item.json.whatsapp, message: '\\ud83d\\udd14 *Nuevo candidato asignado*\\n\\n\\ud83d\\udc64 *Nombre:* ' + ($('Guardar Candidato').item.json.nombre || 'Sin nombre aun') + '\\n\\ud83d\\udcf1 *WhatsApp:* ' + $('Boosfy Inbound').item.json.body.contact.phone + '\\n\\ud83d\\udcac *Primer mensaje:* ' + $('Boosfy Inbound').item.json.body.chatInput + '\\n\\n\\ud83d\\udcc5 _Asignado automaticamente por Thu Talento Humano IA_', messageType: 'text' }) }}",
            "options": {}
        },
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [4900, -60],
        "id": str(uuid.uuid4()),
        "name": "Notificar Reclutador"
    }
]

nodes.extend(new_nodes)

conns['Preparar Respuesta'] = {'main': [[{'node': 'Guardar Candidato', 'type': 'main', 'index': 0}]]}
conns.update({
    'Guardar Candidato':    {'main': [[{'node': 'Verificar Asignacion', 'type': 'main', 'index': 0}]]},
    'Verificar Asignacion': {'main': [[{'node': 'Es Nuevo Candidato', 'type': 'main', 'index': 0}]]},
    'Es Nuevo Candidato': {
        'main': [
            [{'node': 'Consultar Reclutador', 'type': 'main', 'index': 0}],
            [{'node': 'Guardar Seguimiento',  'type': 'main', 'index': 0}]
        ]
    },
    'Consultar Reclutador': {'main': [[{'node': 'Registrar Asignacion', 'type': 'main', 'index': 0}]]},
    'Registrar Asignacion': {'main': [[{'node': 'Actualizar Contador', 'type': 'main', 'index': 0}]]},
    'Actualizar Contador':  {'main': [[{'node': 'Notificar Reclutador', 'type': 'main', 'index': 0}]]},
    'Notificar Reclutador': {'main': [[{'node': 'Guardar Seguimiento', 'type': 'main', 'index': 0}]]},
})

workflow = {
    "name": "Thu Talento Humano — Agente IA",
    "nodes": nodes,
    "connections": conns,
    "settings": {
        "executionOrder": "v1",
        "saveManualExecutions": True,
        "callerPolicy": "workflowsFromSameOwner"
    },
    "staticData": None,
    "tags": []
}

out = os.path.join(BASE, 'thu_talento_workflow.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)

print(f"OK: {len(nodes)} nodos generados -> {out}")
