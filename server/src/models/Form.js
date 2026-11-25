const mongoose = require('mongoose');


const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    placeholder: { type: String, default: '' },
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
    required: { type: Boolean, default: false },
    options: { type: [String], default: undefined },
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    fields: { type: [fieldSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

formSchema.index({ createdBy: 1, createdAt: -1 });
formSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Form', formSchema);
