const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    s3Bucket: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})
module.exportsmongoose.model('User', userSchema)