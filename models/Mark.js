const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    exam: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mark', markSchema);
