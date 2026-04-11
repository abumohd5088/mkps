const mongoose = require('mongoose');

const schoolClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchoolClass', schoolClassSchema);
