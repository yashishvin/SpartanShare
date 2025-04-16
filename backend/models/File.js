const mongoose = require('mongoose')
const fileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    //TODO: We could add a reference to an s3 bucket URL here
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    typeOfFile: {
        type: String,
        required: true
    },
    isStarred: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastModifieddate: {
        type: Date,
        default: Date.now
    }
})
module.exportsmongoose.model('File', fileSchema)