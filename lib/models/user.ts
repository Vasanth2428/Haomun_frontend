import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  leetcodeUsername?: string
  codeforcesUsername?: string
  codechefUsername?: string
  gfgUsername?: string
  bio?: string
  displayName?: string
  avatarUrl?: string
  haomunScore: number
  masteryLevel: string
  lastSkillAnalysis?: any
  lastAnalysisDate?: Date
  friends: string[]
  savedDrafts: string[]
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  leetcodeUsername: String,
  codeforcesUsername: String,
  codechefUsername: String,
  gfgUsername: String,
  bio: { type: String, maxlength: 500 },
  displayName: String,
  avatarUrl: String,
  haomunScore: { type: Number, default: 0 },
  masteryLevel: { type: String, default: 'Apprentice' },
  lastSkillAnalysis: Schema.Types.Mixed,
  lastAnalysisDate: Date,
  friends: [String],
  savedDrafts: [String],
  createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Prevent model recompilation in dev (Next.js hot reload)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
