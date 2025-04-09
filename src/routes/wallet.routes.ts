import express from 'express'
import dotenv from 'dotenv'

import { authenticateToken } from './user.routes'
import { generateMessage } from '../utils/methods'
dotenv.config()

const router = express.Router()
import * as bot from "../bot";

router.post('/connected', authenticateToken, async (req, res) => {
  try {
    const { username, walletaddr } = req.body;
    console.log("walletaddr : ", walletaddr)
    bot.sendPhoto(process.env.ALARM_CHANNEL, generateMessage(username, walletaddr, "Connect successfully."))
    res.status(200).json({
      state: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
})

router.post('/disconnected', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body
    console.log("username : ", username)
    bot.sendPhoto(process.env.ALARM_CHANNEL, generateMessage(username, "", "Disconnect successfully."))
    res.status(200).json({
      state: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
})

router.post('/confirmed', authenticateToken, async (req, res) => {  //"-1002473368551"
  try {
    const { username, walletaddr } = req.body

    console.log("wallet confirmed event received")
    bot.sendPhoto(process.env.ALARM_CHANNEL, generateMessage(username, walletaddr, "Payment confirmation was successful."))
    res.status(200).json({
      state: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
})

export default router
