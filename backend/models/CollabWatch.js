const mongoose = require('mongoose')
const collabWatchSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    hostId: {
        type: String,
        ref: "User",
        required: true
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startTime: {
        type: Date,
        default: Date.now
    }
})
module.exportsmongoose.model('CollabWatchSchema', collabWatchSchema)