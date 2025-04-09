import express from 'express'
import dotenv from 'dotenv'

import { UserModel, UserTask } from '../models/user.model'
import { TaskModel } from '../models/task.model'
import { authenticateToken } from './user.routes'
dotenv.config()

const router = express.Router()
// Route to get tasks
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.body.user // Use query parameters for GET request
    let game = await UserModel.findOne({ chatId })
    let newUserTasks = await TaskModel.find()

    res.status(200).json({
      state: true,
      data: game?.userTasks,
      tasks: newUserTasks,
    })
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
})

router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { chatId, taskId } = req.body

    let user = await UserModel.findOne({ chatId })
    if (user) {
      user.userTasks.push(new UserTask({ taskId, isJoined: true }))
      await user.save()

      return res.status(200).json({
        state: true,
        data: user,
      })
    }

    return res.status(200).json({
      state: false,
      data: null,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const { chatId, taskId } = req.body

    let user = await UserModel.findOne({ chatId })
    if (user) {
      user.userTasks.push(new UserTask({ taskId, isClaimed: true }))
      await user.save()

      return res.status(200).json({
        state: true,
        data: user,
      })
    }

    return res.status(200).json({
      state: false,
      data: null,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

export default router
