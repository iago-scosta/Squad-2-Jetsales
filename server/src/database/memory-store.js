const { randomUUID } = require("crypto");

const DEFAULT_ORGANIZATION = {
  id: "default-org",
  name: "JetSales Demo",
};

const collectionsWithUpdatedAt = new Set([
  "organizations",
  "chatbots",
  "flows",
  "flow_nodes",
  "contacts",
  "conversations",
]);

const store = {
  organizations: [],
  chatbots: [],
  flows: [],
  flow_nodes: [],
  flow_edges: [],
  contacts: [],
  conversations: [],
  messages: [],
};

function now() {
  return new Date().toISOString();
}

function buildDefaultOrganization() {
  const timestamp = now();

  return {
    ...DEFAULT_ORGANIZATION,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function resetStore() {
  store.organizations = [buildDefaultOrganization()];
  store.chatbots = [];
  store.flows = [];
  store.flow_nodes = [];
  store.flow_edges = [];
  store.contacts = [];
  store.conversations = [];
  store.messages = [];
}

function list(collectionName) {
  return [...store[collectionName]];
}

function findById(collectionName, id) {
  return store[collectionName].find((item) => item.id === id) || null;
}

function findOne(collectionName, predicate) {
  return store[collectionName].find(predicate) || null;
}

function filter(collectionName, predicate) {
  return store[collectionName].filter(predicate);
}

function create(collectionName, data) {
  const timestamp = now();
  const item = {
    id: randomUUID(),
    ...data,
    created_at: timestamp,
  };

  if (collectionsWithUpdatedAt.has(collectionName)) {
    item.updated_at = timestamp;
  }

  store[collectionName].push(item);

  return item;
}

function update(collectionName, id, data) {
  const item = findById(collectionName, id);

  if (!item) {
    return null;
  }

  Object.assign(item, data);

  if (collectionsWithUpdatedAt.has(collectionName)) {
    item.updated_at = now();
  }

  return item;
}

function remove(collectionName, id) {
  const items = store[collectionName];
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const [removedItem] = items.splice(index, 1);

  return removedItem;
}

function removeWhere(collectionName, predicate) {
  const items = store[collectionName];
  const removedItems = [];

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      removedItems.push(items[index]);
      items.splice(index, 1);
    }
  }

  return removedItems.reverse();
}

resetStore();

module.exports = {
  DEFAULT_ORGANIZATION,
  store,
  now,
  resetStore,
  list,
  findById,
  findOne,
  filter,
  create,
  update,
  remove,
  removeWhere,
};
