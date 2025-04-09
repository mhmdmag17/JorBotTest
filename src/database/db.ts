import mongoose from 'mongoose'

export const init = async (): Promise<void> => {
  console.log('Connecting to MongoDB')
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not provided, skipping database connection')
      return
    }
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('connected to MongoDB')
  } catch (error) {
    console.error('error connecting to MongoDB:', (error as Error).message)
    console.log('Continuing without database connection')
    // Don't throw error to allow the bot to run without MongoDB
  }
}
