exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('chatbots', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('organization_id').notNullable();
    table.uuid('active_flow_id').nullable();
    table.string('name', 255).notNullable();
    table.string('type', 100).nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('inactivity_timeout_ms').nullable();
    table.integer('max_retries').defaultTo(3);
    table.integer('send_delay_ms').defaultTo(0);
    table.jsonb('ai_config').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('conversations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('organization_id').notNullable();
    table.uuid('contact_id').notNullable();
    table.uuid('chatbot_id').nullable();
    table.uuid('whatsapp_connection_id').nullable();
    table.string('status', 50).nullable();
    table.string('close_reason', 255).nullable();
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('closed_at').nullable();
    table.timestamp('last_activity_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('flow_nodes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('flow_id').nullable();
    table.string('type', 100).notNullable();
    table.string('label', 255).nullable();
    table.jsonb('data').nullable();
    table.float('position_x').nullable();
    table.float('position_y').nullable();
    table.integer('retry_limit').defaultTo(0);
    table.string('error_message', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('conversation_id').notNullable();
    table.uuid('flow_node_id').nullable();
    table.string('direction', 20).notNullable();
    table.string('content_type', 50).nullable();
    table.text('body').nullable();
    table.string('media_url', 500).nullable();
    table.jsonb('metadata').nullable();
    table.string('delivery_status', 50).nullable();
    table.integer('retry_attempts').defaultTo(0);
    table.string('external_id', 255).nullable();
    table.timestamp('sent_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
    table.foreign('flow_node_id').references('id').inTable('flow_nodes').onDelete('SET NULL');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversations');
  await knex.schema.dropTableIfExists('chatbots');
};
