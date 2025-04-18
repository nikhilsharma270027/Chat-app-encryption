import mongoose from "mongoose";
import mongooseDateFormat from "mongoose-date-format"

const messageSchema = mongoose.Schema(
  {
    noty: { type: Boolean, default: false },
    content: { type: String, require: true },
    image: { type: String, required: false},
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(mongooseDateFormat);
export const Message = mongoose.model("message", messageSchema);