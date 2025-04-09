import { Schema, model, Document } from 'mongoose'

// UserInfo -------------------------------------------------------------
export interface UserInfoDocument extends Document {
  firstName: string
  lastName: string
  userName: string
  logo: string
  allowWithPm?: boolean
}
// Define the schema corresponding to the document interface
const userMetaInfoSchema = new Schema<UserInfoDocument>({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  logo: {
    type: String,
  },
  allowWithPm: {
    type: Boolean,
    default: true,
  },
})
// -----------------------------------------------------------------------

// User Task------------------------------------------------------
export interface UserTaskDocument extends Document {
  taskId: number
  isJoined: boolean
  isClaimed: boolean
}

const userTaskSchema = new Schema<UserTaskDocument>({
  id: {
    type: Number,
    required: true,
    default: 0,
  },
  isJoined: {
    type: Boolean,
    default: false,
  },
  isClaimed: {
    type: Boolean,
    default: false,
  },
})

export const UserTask = model<UserTaskDocument>('GameTask', userTaskSchema)
// -----------------------------------------------------------------------

// User Setting------------------------------------------------------
interface SettingDocument extends Document {
  lang: number
}

const settingSchema = new Schema<SettingDocument>({
  lang: {
    type: Number,
    required: true,
    default: 0,
  },
})

// User Item Document-----------------------------------
export interface UserItemDocument extends Document {
  id: number
  current: number
  timestamp: number
}

const userItemSchema = new Schema<UserItemDocument>({
  id: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  }
})
// -----------------------------------------------------

// Define an interface representing a document in MongoDB
export interface UserDocument extends Document {
  chatId: string
  metaInfo: UserInfoDocument
  levelId: number
  userItems: UserItemDocument[]
  userTasks: UserTaskDocument[]
  currBalance: number
  totalBalance: number
  setting: SettingDocument
  inviteCode: string
  invitedFrom: string
  isFirstLogin: boolean
  farmingEnd: number
  spinEnd: number
}

// Define the schema corresponding to the document interface
const userSchema = new Schema<UserDocument>({
  chatId: {
    type: String,
    required: true,
  },
  metaInfo: userMetaInfoSchema,
  levelId: {
    type: Number,
    required: true,
    default: 1,
  },
  userItems: {
    type: [userItemSchema],
    default: [],
  },
  userTasks: {
    type: [userTaskSchema],
    default: [],
  },
  currBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  totalBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  setting: {
    type: settingSchema,
    required: true,
  },
  inviteCode: {
    type: String,
    default: '',
  },
  invitedFrom: {
    type: String,
    default: '',
  },
  isFirstLogin: {
    type: Boolean,
    default: false
  },
  farmingEnd: {
    type: Number,
    default: 0
  },
  spinEnd: {
    type: Number,
    default: 0
  }
})

// Create a Model
export const UserModel = model<UserDocument>('User', userSchema)
