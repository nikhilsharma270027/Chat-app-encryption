import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ small typo: use `required` instead of `require`
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true, // ✅ fixed here as well
  },
  avtar: {
    type: String,
    default: "https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg",
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
