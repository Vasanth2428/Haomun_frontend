import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGuild extends Document {
  name: string
  description: string
  emblem: string
  leader: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  totalScore: number
  level: string
  createdAt: Date
}

const guildSchema = new Schema<IGuild>({
  name: { type: String, required: true, unique: true, maxlength: 50 },
  description: { type: String, maxlength: 200 },
  emblem: { type: String, default: '🛡️' },
  leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  totalScore: { type: Number, default: 0 },
  level: { type: String, default: 'Initiate' },
  createdAt: { type: Date, default: Date.now },
})

const Guild: Model<IGuild> = mongoose.models.Guild || mongoose.model<IGuild>('Guild', guildSchema)

export default Guild
