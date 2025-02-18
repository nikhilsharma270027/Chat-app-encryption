// Message Schema
const messageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);