const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    data: { type: Object, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, minimize: false }
);

submissionSchema.index({ formId: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
