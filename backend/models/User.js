import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  linkedinId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  photo: { type: String },
});

const User = mongoose.model("User", userSchema);

export default User;