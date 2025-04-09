import { Schema, model, Document, trusted } from 'mongoose'

export interface GameDocument extends Document {
  title: string
  type: string
  logo: string
  isDeleted: boolean
}

// Define the schema corresponding to the document interface
export const gameSchema = new Schema<GameDocument>({
  id: {
    type: Number,
    required: trusted,
  },
  title: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
})

// Create a Model
export const GameModel = model<GameDocument>('Game', gameSchema)
