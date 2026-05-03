const Chatbot = require("./chatbot.model");

//service create chatbot
exports.create = async (data) => {
  const chatbot = new Chatbot(data);
  return await chatbot.save();
};

//service list todos chatbots
exports.findAll = async () => {
  return await Chatbot.find()
    .populate("flowId", "name")
    .populate("knowledgeBaseId", "name")
    .sort({ createdAt: -1 });
};

//service find chatbot by ID
exports.findOne = async (id) => {
  return await Chatbot.findById(id)
    .populate("flowId", "name")
    .populate("knowledgeBaseId", "name");
};

//service update chatbot
exports.update = async (id, data) => {
  return await Chatbot.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  );
};

//service delete chatbot
exports.remove = async (id) => {
  return await Chatbot.findByIdAndDelete(id);
};

//service find chatbots by flowId
exports.findByFlow = async (flowId) => {
  return await Chatbot.find({ flowId })
    .populate("flowId", "name")
    .populate("knowledgeBaseId", "name");
};

//service toggle active/inactive chatbot
exports.toggleActive = async (id) => {
  const chatbot = await Chatbot.findById(id);
  if (!chatbot) return null;

  chatbot.isActive = !chatbot.isActive;
  return await chatbot.save();
};