CREATE TABLE IF NOT EXISTS chatbots (
  id UUID PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'whatsapp',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flow_nodes (
  id UUID PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flow_edges (
  id UUID PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  condition_type TEXT,
  condition_value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY,
  organization_id TEXT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  organization_id TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  flow_node_id UUID REFERENCES flow_nodes(id) ON DELETE SET NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flows_chatbot_id
  ON flows(chatbot_id);

CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow_id
  ON flow_nodes(flow_id);

CREATE INDEX IF NOT EXISTS idx_flow_edges_flow_id
  ON flow_edges(flow_id);

CREATE INDEX IF NOT EXISTS idx_conversations_chatbot_id
  ON conversations(chatbot_id);

CREATE INDEX IF NOT EXISTS idx_conversations_contact_id
  ON conversations(contact_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_contacts_phone
  ON contacts(phone);
