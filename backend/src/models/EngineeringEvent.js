const mongoose = require("mongoose");

const eventTypes = [
  "RUN_STARTED", "RUN_FINISHED", "BUILD_FAILED", "TEST_FAILED", "RUNTIME_ERROR",
  "TERMINAL_ERROR", "CODE_CHANGE", "FIX_ATTEMPTED", "FIX_FAILED", "FIX_VERIFIED",
  "USER_REPORTED_PROBLEM", "INCIDENT_RESOLVED"
];

const eventSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, trim: true, maxlength: 200 },
    type: { type: String, enum: eventTypes, required: true },
    source: { type: String, trim: true, maxlength: 100, default: "workspace" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

eventSchema.index({ projectId: 1, timestamp: -1 });
eventSchema.statics.eventTypes = eventTypes;
module.exports = mongoose.model("EngineeringEvent", eventSchema);