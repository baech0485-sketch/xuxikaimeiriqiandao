import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  avatar: string
  pet: {
    type: string
    name: string
    mood: 'happy' | 'hungry' | 'sad' | 'runaway'
    hungryDays: number
    recallProgress: number
  }
  stats: {
    totalStars: number
    streak: number
    maxStreak: number
    totalDays: number
  }
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  avatar: { type: String, default: 'boy1' },
  pet: {
    type: { type: String, required: true },
    name: { type: String, required: true },
    mood: { type: String, enum: ['happy', 'hungry', 'sad', 'runaway'], default: 'happy' },
    hungryDays: { type: Number, default: 0 },
    recallProgress: { type: Number, default: 0 },
  },
  stats: {
    totalStars: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
