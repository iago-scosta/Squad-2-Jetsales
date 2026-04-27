const { randomUUID } = require("crypto");

const now = () => new Date().toISOString();

const database = {
  organizations: [
    {
      id: "org-001",
      name: "Organizacao de exemplo",
      created_at: now(),
      updated_at: now(),
    },
  ],
  chatbots: [],
  flows: [],
  flow_nodes: [],
  flow_edges: [],
  conversations: [],
  messages: [],
  contacts: [],
};

function create(collectionName, data) {
  const item = {
    id: randomUUID(),
    ...data,
    created_at: now(),
    updated_at: now(),
  };

  database[collectionName].push(item);

  return item;
}

function list(collectionName) {
  return [...database[collectionName]];
}

function findById(collectionName, id) {
  return database[collectionName].find((item) => item.id === id) || null;
}

function findOne(collectionName, predicate) {
  return database[collectionName].find(predicate) || null;
}

function filter(collectionName, predicate) {
  return database[collectionName].filter(predicate);
}

function update(collectionName, id, data) {
  const item = findById(collectionName, id);

  if (!item) {
    return null;
  }

  Object.assign(item, data, { updated_at: now() });

  return item;
}

function remove(collectionName, id) {
  const items = database[collectionName];
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const [removedItem] = items.splice(index, 1);

  return removedItem;
}

function removeMany(collectionName, predicate) {
  const items = database[collectionName];
  const removedItems = [];

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      removedItems.push(items[index]);
      items.splice(index, 1);
    }
  }

  return removedItems.reverse();
}

module.exports = {
  database,
  create,
  list,
  findById,
  findOne,
  filter,
  update,
  remove,
  removeMany,
};
