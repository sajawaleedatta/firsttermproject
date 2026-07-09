import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
