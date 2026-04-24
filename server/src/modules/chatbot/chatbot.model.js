const mongoose = require("mongoose");

//schema do chatbot
const chatbotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
    },
    knowledgeBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Knowledge",
    },
    knowledgeDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeDocument",
      },
    ],
    settings: {
      welcomeMessage: { type: String, default: "" },
      defaultLanguage: { type: String, default: "pt-BR" },
      typingEnabled: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Chatbot", chatbotSchema);
