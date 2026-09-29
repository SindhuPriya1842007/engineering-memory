const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true, maxlength: 3000 },
    result: { type: String, enum: ["failed", "successful", "inconclusive"], default: "inconclusive" },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
    evidence: { type: String, trim: true, maxlength: 10000, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);