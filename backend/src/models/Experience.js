const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    problem: { type: String, required: true, trim: true, maxlength: 5000 },
    context: { type: mongoose.Schema.Types.Mixed, default: {} },
    attempts: { type: [mongoose.Schema.Types.Mixed], default: [] },
    solution: { type: String, required: true, trim: true, maxlength: 5000 },
    rootCause: { type: String, trim: true, maxlength: 5000, default: "" },
    verification: { type: String, trim: true, maxlength: 5000, default: "" },
    outcome: { type: String, trim: true, maxlength: 500, default: "resolved" },
    retainedAt: Date,
    retentionStatus: { type: String, enum: ["pending", "retained", "unavailable", "failed"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);