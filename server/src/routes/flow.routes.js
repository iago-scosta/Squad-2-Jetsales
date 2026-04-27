const express = require("express");
const flowController = require("../modules/flow/flow.controller");

const router = express.Router();

router.post("/", flowController.create);
router.get("/", flowController.findAll);
router.get("/:id", flowController.findOne);
router.put("/:id", flowController.update);
router.patch("/:id", flowController.patch);
router.delete("/:id", flowController.remove);

router.get("/:flowId/nodes", flowController.listNodes);
router.post("/:flowId/nodes", flowController.createNode);
router.put("/:flowId/nodes/:nodeId", flowController.updateNode);
router.patch("/:flowId/nodes/:nodeId", flowController.patchNode);
router.delete("/:flowId/nodes/:nodeId", flowController.removeNode);

router.get("/:flowId/edges", flowController.listEdges);
router.post("/:flowId/edges", flowController.createEdge);
router.delete("/:flowId/edges/:edgeId", flowController.removeEdge);

module.exports = router;
