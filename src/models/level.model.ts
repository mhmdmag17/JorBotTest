import { Schema, model, Document } from 'mongoose'

// Define an interface representing a document in MongoDB
export interface LevelDocument extends Document {
  id: number
  level: number
  logoURL: string
  threshold: number
}

// Define the schema corresponding to the document interface
const levelSchema = new Schema<LevelDocument>({
  id: {
    type: Number,
    default: 0,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  logoURL: {
    type: String,
  },
  threshold: {
    type: Number,
    default: 10000,
  },
})

// Create a Model
export const LevelModel = model<LevelDocument>('Level', levelSchema)
