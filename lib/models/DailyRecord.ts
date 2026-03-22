import mongoose, { Schema, Document } from 'mongoose'

interface TaskStatus {
  done: boolean
  completedAt: string | null
}

export interface IDailyRecord extends Document {
  userId: mongoose.Types.ObjectId
  date: string
  tasks: {
    literacy: TaskStatus
    math: TaskStatus
    writing: TaskStatus
    reading: TaskStatus
    drawing: TaskStatus
    skipping: TaskStatus
  }
  fedCount: number
  allCompleted: boolean
  starsEarned: number
}

const TaskStatusSchema = new Schema({
  done: { type: Boolean, default: false },
  completedAt: { type: String, default: null },
}, { _id: false })

const DailyRecordSchema = new Schema<IDailyRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  tasks: {
    literacy: { type: TaskStatusSchema, default: () => ({}) },
    math: { type: TaskStatusSchema, default: () => ({}) },
    writing: { type: TaskStatusSchema, default: () => ({}) },
    reading: { type: TaskStatusSchema, default: () => ({}) },
    drawing: { type: TaskStatusSchema, default: () => ({}) },
    skipping: { type: TaskStatusSchema, default: () => ({}) },
  },
  fedCount: { type: Number, default: 0 },
  allCompleted: { type: Boolean, default: false },
  starsEarned: { type: Number, default: 0 },
})

DailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema)
