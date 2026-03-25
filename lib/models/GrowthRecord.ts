import mongoose, { Schema, Document } from 'mongoose'

export interface IGrowthRecord extends Document {
  userId: mongoose.Types.ObjectId
  date: string
  height: number
  weight: number
  createdAt: Date
}

const GrowthRecordSchema = new Schema<IGrowthRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

GrowthRecordSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.GrowthRecord || mongoose.model<IGrowthRecord>('GrowthRecord', GrowthRecordSchema)
