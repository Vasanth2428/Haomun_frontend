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
  displayName: String,
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

// Hash password before saving
// @ts-ignore - for compatibility with different Mongoose versions and the 'next' callback
userSchema.pre('save', function(next: (err?: any) => void) {
  const user = this as any
  if (!user.isModified('password')) return next()
  
  bcrypt.hash(user.password, 10)
    .then(hash => {
      user.password = hash
      next()
    })
    .catch(next)
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Prevent model recompilation in dev (Next.js hot reload)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
