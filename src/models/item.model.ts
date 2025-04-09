import { Schema, model, Document, trusted } from 'mongoose'

export interface ItemDocument extends Document {
  title: string
  logo: string
  balance: number
  price: number
  isDeleted: boolean
}

// Define the schema corresponding to the document interface
export const itemSchema = new Schema<ItemDocument>({
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
  balance: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
})

// Create a Model
export const ItemModel = model<ItemDocument>('Item', itemSchema)
