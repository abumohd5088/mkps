const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    className: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
