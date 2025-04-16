const mongoose = require('mongoose');
const { Schema } = mongoose;

const folderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentFolder: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      refPath: 'childrenType',
    }
  ],
  childrenType: {
    type: String,
    enum: ['File', 'Folder'],
    default: 'File',
  },
  sharedWith: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  isStarred: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Folder', folderSchema);
