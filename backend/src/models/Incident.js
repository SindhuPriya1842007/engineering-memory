const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    errorMessage: { type: String, trim: true, maxlength: 5000, default: "" },
    errorType: { type: String, trim: true, maxlength: 200, default: "" },
    stackTrace: { type: String, trim: true, maxlength: 20000, default: "" },
    filePath: { type: String, trim: true, maxlength: 500, default: "" },
    lineNumber: Number,
    columnNumber: Number,
    command: { type: String, trim: true, maxlength: 1000, default: "" },
    logs: { type: String, trim: true, maxlength: 20000, default: "" },
    language: { type: String, trim: true, maxlength: 100, default: "" },
    framework: { type: String, trim: true, maxlength: 100, default: "" },
    runtime: { type: String, trim: true, maxlength: 100, default: "" },
    service: { type: String, trim: true, maxlength: 200, default: "" },
    environment: { type: String, trim: true, maxlength: 100, default: "development" },
    version: { type: String, trim: true, maxlength: 100, default: "" },
    recentChange: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: ["open", "investigating", "resolved"], default: "open", index: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rootCause: { type: String, trim: true, maxlength: 5000, default: "" },
    resolution: { type: String, trim: true, maxlength: 5000, default: "" },
    resolvedAt: Date
  },
  { timestamps: true }
);

incidentSchema.index({ projectId: 1, createdAt: -1 });
module.exports = mongoose.model("Incident", incidentSchema);