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
  username?: string
  avatarUrl?: string
  haomunScore: number
  masteryLevel: string
  lastSkillAnalysis?: any
  lastAnalysisDate?: Date
  friends: string[]
  savedDrafts: string[]
  scoreHistory: { score: number; timestamp: Date }[]
  guildId?: mongoose.Types.ObjectId
  archives: { title: string; content: string; timestamp: Date }[]
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
  username: { type: String, unique: true, sparse: true },
  avatarUrl: String,
  haomunScore: { type: Number, default: 0 },
  masteryLevel: { type: String, default: 'Apprentice' },
  lastSkillAnalysis: Schema.Types.Mixed,
  lastAnalysisDate: Date,
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  savedDrafts: [String],
  archives: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  scoreHistory: [{
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  guildId: { type: Schema.Types.ObjectId, ref: 'Guild' },
  createdAt: { type: Date, default: Date.now },
})

// Add Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ haomunScore: -1 }) // Descending for leaderboard

// Hash password before saving
userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (err) {
    console.error('Password hashing failed:', err)
    throw err
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
