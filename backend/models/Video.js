const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  
  sensitivityStatus: {
    type: String,
    enum: ['pending', 'processing', 'safe', 'flagged', 'error'],
    default: 'pending'
  },
  sensitivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sensitivityDetails: {
    violence: { type: Number, default: 0 },
    adult: { type: Number, default: 0 },
    hate: { type: Number, default: 0 },
    spam: { type: Number, default: 0 }
  },
  processingProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organisation: {
    type: String,
    required: true,
    default: 'default'
  },
 
  accessibleBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },

  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'uncategorized',
    trim: true
  },
  thumbnailPath: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});


videoSchema.index({ uploadedBy: 1, sensitivityStatus: 1 });
videoSchema.index({ organisation: 1 });

module.exports = mongoose.model('Video', videoSchema);
