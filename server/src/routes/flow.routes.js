const express = require("express");
const flowController = require("../modules/flow/flow.controller");

const router = express.Router();

router.post("/", flowController.create);
router.get("/", flowController.findAll);
router.get("/:id", flowController.findOne);
router.put("/:id", flowController.update);
router.delete("/:id", flowController.remove);

router.post("/:flowId/nodes", flowController.createNode);
router.get("/:flowId/nodes", flowController.listNodes);

router.post("/:flowId/edges", flowController.createEdge);
router.get("/:flowId/edges", flowController.listEdges);

module.exports = router;
