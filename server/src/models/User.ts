import mongoose, { Schema, Document } from "mongoose";

export type Role = "ADMIN" | "CUSTOMER";

export interface IUser extends Document {
  email: string;
  name?: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "CUSTOMER"], default: "CUSTOMER" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
