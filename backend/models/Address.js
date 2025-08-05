import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },

  // Address Details
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  locality: { type: String, required: true },
  flatOrBuilding: { type: String, required: true },
  landmark: { type: String },

  addressType: { type: String, enum: ["home", "office", "other"], default: "home" },

  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);
export default Address;
