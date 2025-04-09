import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import * as JOR from '../core/jor'
import * as bot from "../bot"
import { checkSocialTask } from '../core/jor'
import { generateMessage } from '../utils/methods'
import { UserModel, UserTaskDocument } from '../models/user.model'

dotenv.config()

const router = express.Router()

export const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers['authorization']

  //Extracting token from authorization header
  const token = authHeader && authHeader.split(' ')[1]

  //Checking if the token is null
  if (!token) {
    return res.status(401).send('Authorization failed. No access token.')
  }

  //Verifying if the token is valid.
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403).send('Could not verify token')
    }
    req.body.user = user
  })
  next()
}

// @API: /info
// @request: bearer token
// @response: user info & energy & score
// @method: POST
router.post('/info', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.body.user
    const { language } = req.body

    console.log("language : ", language)
    const user = await UserModel.findOne({ chatId })
    user.setting.lang = language == "ar" ? 1 : 0
    user.save()

    if (user != null || user != undefined) {
      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      res.json({ state: false, data: null }).status(200)
    }
  } catch (error) {
    res.status(500).end()
  }
})

router.post('/setting', authenticateToken, async (req, res) => {
  const { chatId, lang } = req.body

  try {
    const user = await UserModel.findOne({ chatId: chatId });
    user.setting.lang = lang;
    user.save();

    console.log("req.body : ", user)

    if (user != null && user != undefined) {
      res.status(200).json({
        state: true,
        data: user.setting,
      })
    } else {
      res.status(500).end()
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).end()
  }
})

router.post('/firstLogin', authenticateToken, async (req, res) => {
  const { chatId, walletaddr } = req.body

  console.log("req.body: ", req.body)

  try {
    const user = await UserModel.findOne({ chatId })
    if (user != null && user != undefined) {
      user.isFirstLogin = false;
      user.farmingEnd = Date.now() + 24 * 60 * 60 * 1000;
      user.save();
      bot.sendPhoto(process.env.ALARM_CHANNEL, generateMessage(user.metaInfo.userName, walletaddr, "He got 500 JOR\n Done successfully."))

      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      res.status(500).end()
    }
  } catch (error) {
    console.error('Error updating first login:', error)
    res.status(500).end()
  }
});

router.post('/setBalance', authenticateToken, async (req, res) => {
  const { chatId, jorBalance } = req.body.user

  try {
    const user = await UserModel.updateOne(
      { chatId: chatId },
      { $set: { currBalance: jorBalance } }
    )

    if (user != null && user != undefined) {
      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      res.status(500).end()
    }
  } catch (error) {
    console.error('Error updating first login:', error)
    res.status(500).end()
  }
});

router.post('/addBalance', authenticateToken, async (req, res) => {
  const { chatId, jorBalance } = req.body.user

  try {
    const user = await UserModel.findOne({ chatId: chatId });
    user.currBalance += jorBalance;
    user.totalBalance += jorBalance;
    user.save();

    if (user != null && user != undefined) {
      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      res.status(500).end()
    }
  } catch (error) {
    console.error('Error updating first login:', error)
    res.status(500).end()
  }
});

router.post('/boost/purchase', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.body.user
    const { id } = req.body

    console.log("Buy", chatId, id)

    // const relatedItem = TapGame.gameItemList.find((_v, _i) => _v.id == id);
    // if (!relatedItem) {
    //   console.log('Item not found');
    //   return res.status(200).json({
    //     state: false,
    //     data: null,
    //   })
    // }
    // console.log(relatedItem)
    // let price = relatedItem.itemLevel ? relatedItem.itemLevel[0].price : relatedItem.itemDaily.price;
    // const user = await UserModel.findOne({ chatId: chatId })

    // let userItems = user?.userItems
    // let recoveryPerSecond_energy = user?.energy.recoveryPerSecond;
    // let capacity_energy = user?.energy.capacity;
    // let item_current = 0;
    // if (userItems?.length != 0) {
    //   console.log("*************user existing item check****************")
    //   const item = userItems?.find((item) => item.id == id)
    //   if (item) {
    //     item.current += 1;
    //     item.timestamp = Date.now();
    //     item_current = item.current;
    //     let limit = relatedItem.itemLevel ? relatedItem.itemLevel?.length : relatedItem.itemDaily?.count;
    //     if (item_current) {
    //       console.log("**************current item id*************", item_current)
    //       price = relatedItem.itemLevel ? relatedItem.itemLevel[item_current - 1].price : relatedItem.itemDaily.price;
    //       if (item_current > limit) {
    //         return res.status(200).json({
    //           state: false,
    //           data: null,
    //         })
    //       }
    //     }
    //   }
    //   else userItems?.push({ id: id, current: 1, timestamp: Date.now() } as UserItemDocument)
    // } else {
    //   userItems.push({ id: id, current: 1, timestamp: Date.now() } as UserItemDocument)
    // }
    // console.log("precalculate something")
    // // Update balance, userItem
    // try {
    //   // Find the user by chatId and update userItems and currBalance
    //   let currBalance = Number(user?.currBalance ?? 0) - price;
    //   if (currBalance < 0)
    //     return res.status(200).json({
    //       state: false,
    //       data: null,
    //     })
    //   else {
    //     const updatedUser =
    //       relatedItem.title?.toLowerCase() == "Full energy".toLowerCase() ?
    //         await UserModel.findOneAndUpdate(
    //           { chatId }, // Search condition
    //           {
    //             userItems: userItems,
    //             currBalance: currBalance,
    //             "energy.current": capacity_energy
    //           }, // Update fields
    //           {
    //             new: true,
    //             runValidators: true,
    //           } // Options: return the updated document, run schema validators
    //         ) :
    //         relatedItem.title?.toLowerCase() == "Recharge speed".toLowerCase() ?
    //           await UserModel.findOneAndUpdate(
    //             { chatId }, // Search condition
    //             {
    //               userItems: userItems,
    //               currBalance: currBalance,
    //               "energy.recoveryPerSecond": recoveryPerSecond_energy! + 1
    //             }, // Update fields
    //             {
    //               new: true,
    //               runValidators: true,
    //             } // Options: return the updated document, run schema validators
    //           ) :
    //           relatedItem.title?.toLowerCase() == "Energy limit".toLowerCase() ?
    //             await UserModel.findOneAndUpdate(
    //               { chatId }, // Search condition
    //               {
    //                 userItems: userItems,
    //                 currBalance: currBalance,
    //                 "energy.capacity": capacity_energy! + 500
    //               }, // Update fields
    //               {
    //                 new: true,
    //                 runValidators: true,
    //               } // Options: return the updated document, run schema validators
    //             ) :
    //             await UserModel.findOneAndUpdate(
    //               { chatId }, // Search condition
    //               {
    //                 userItems: userItems,
    //                 currBalance: currBalance,
    //               }, // Update fields
    //               {
    //                 new: true,
    //                 runValidators: true,
    //               } // Options: return the updated document, run schema validators
    //             )

    //     if (updatedUser) {
    //       console.log('User updated successfully:', updatedUser)
    //       TapGame.userInfoList[chatId].userItems = [...(userItems!)]
    //       TapGame.userInfoList[chatId].currBalance = currBalance
    //       if (relatedItem.title?.toLowerCase() == "Full energy".toLowerCase())
    //         TapGame.userInfoList[chatId].energy.current = capacity_energy
    //       else if (relatedItem.title?.toLowerCase() == "Recharge speed".toLowerCase())
    //         TapGame.userInfoList[chatId].energy.recoveryPerSecond += 1;
    //       else if (relatedItem.title?.toLowerCase() == "Energy limit".toLowerCase())
    //         TapGame.userInfoList[chatId].energy.capacity += 500;
    //       else if (relatedItem.title?.toLowerCase() == "Auto Earn".toLowerCase()) {
    //         let autoEarnUser = TapGame.autoEarningUsers.find((_v, _i) => _v.chatId == chatId);
    //         if (autoEarnUser) {
    //           autoEarnUser.time = item_current;
    //         } else {
    //           TapGame.autoEarningUsers.push({
    //             chatId: chatId,
    //             time: item_current,
    //             online: true,
    //             offlineTimestamp: 0,
    //             scoreOffline: 0
    //           })
    //         }
    //       }
    //       return res.status(200).json({
    //         state: true,
    //         data: updatedUser,
    //       })
    //     } else {
    //       return res.status(200).json({
    //         state: false,
    //         data: null,
    //       })
    //       console.log('User not found')
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error updating user:', error)
    //   return res.status(200).json({
    //     state: false,
    //     data: null,
    //   })
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).end()
  }
})

router.get('/task', authenticateToken, async (req, res) => {
  const { chatId } = req.body.user

  //Get existed Task data of user
  const oldUser = await UserModel.findOne({ chatId: chatId })
  const oldUserTasks = oldUser?.userTasks;

  let newUserTasks: UserTaskDocument[] = oldUserTasks ? [...oldUserTasks] : [];

  let invitedNumber: number = 0;
  try {
    invitedNumber = await UserModel.countDocuments({
      invitedFrom: chatId,
    })
    console.log(`Number of users with invitedFrom not empty: ${invitedNumber}`)
  } catch (error) {
    console.error('Error counting users with invitedFrom:', error)
    throw error
  }

  const { xConnected, tgChannelConnected, tgGroupConnected, walletConnected } =
    await checkSocialTask(chatId)
  // await checkFriendTask(chatId)
  JOR.gameTasks.forEach((task) => {
    let existingTask = oldUserTasks?.find((_v, _i) => _v.id == task.id);
    if (existingTask) return;

    let isJoined = false;
    if (task.type?.toLowerCase() == "Royal".toLowerCase()) {
      if (task.title?.toLowerCase() == "Follow us on X".toLowerCase())
        isJoined = xConnected;
      else if (task.title?.toLowerCase() == "Join the TG Channel".toLowerCase())
        isJoined = tgChannelConnected;
      else if (task.title?.toLowerCase() == "Join the Royal Coin Chat".toLowerCase())
        isJoined = tgGroupConnected;
      else if (task.title?.toLowerCase() == "Connect your TON wallet".toLowerCase())
        isJoined = walletConnected;
    } else if (task.type?.toLowerCase() == "Friends".toLowerCase()) {
      isJoined = invitedNumber > parseInt(task.title?.split(' ')[1])
    }
    if (isJoined) {
      let generatedUserTask: UserTaskDocument = {
        id: task.id,
        isJoined: isJoined,
        isClaimed: false
      } as UserTaskDocument
      newUserTasks.push(generatedUserTask);
    }
  })

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { chatId: chatId }, // Find the user by chatId
      { userTasks: newUserTasks }, // Update the tasks field
      { new: true } // Return the updated document
    )

    if (updatedUser) {
      console.log('User tasks updated successfully:', updatedUser)
      res.status(200).json({
        state: true,
        data: updatedUser,
      })
    } else {
      console.log('User not found')
      res.status(200).json({
        state: false,
        data: null,
      })
    }
  } catch (error) {
    console.error('Error updating user tasks:', error)
    res.status(500).end()
  }
})

router.post('/task/claim', authenticateToken, async (req, res) => {
  const { chatId } = req.body.user
  const { id, reward } = req.body // task id, task balance

  //Update User taskdata
  const user = await UserModel.findOne({ chatId: chatId })
  user?.userTasks.forEach((item) => {
    if (item.id == id) {
      item.isClaimed = true
    }
  })

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { chatId: chatId }, // Find the user by chatId
      {
        userTasks: user?.userTasks,
        currBalance: user?.currBalance + reward,
      }, // Update the tasks and currBalance field
      { new: true } // Return the updated document
    )

    if (updatedUser) {
      console.log('User tasks updated successfully:', updatedUser)
      res.status(200).json({
        state: true,
        data: user?.userTasks,
      })
    } else {
      console.log('User not found')
      res.status(200).json({
        state: false,
        data: null,
      })
    }
  } catch (error) {
    console.error('Error updating user tasks:', error)
    res.status(500).end()
  }
})

router.post('/daily_claim', authenticateToken, async (req, res) => {
  const { chatId } = req.body

  try {
    const user = await UserModel.findOne({ chatId: chatId })
    user.farmingEnd = Date.now() + 24 * 60 * 60 * 1000;
    user.currBalance += 25;
    user.totalBalance += 25;
    user.save();


    if (user) {
      console.log("user : ", user)
      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      console.log('User not found')
      res.status(200).json({
        state: false,
        data: null,
      })
    }
  } catch (error) {
    console.error('Error updating daily claim:', error)
    res.status(500).end()
  }
})

router.post('/daily_claim_time', authenticateToken, async (req, res) => {
  const { chatId } = req.body

  console.log("chatId : ", chatId)

  try {
    const user = await UserModel.findOne({ chatId: chatId })
    user.farmingEnd = new Date().getMilliseconds()
    user.save();

    if (user) {
      console.log("user : ", user)
      res.status(200).json({
        state: true,
        data: user,
      })
    } else {
      console.log('User not found')
      res.status(200).json({
        state: false,
        data: null,
      })
    }
  } catch (error) {
    console.error('Error updating daily claim:', error)
    res.status(500).end()
  }
})

router.post('/set_farming_end', authenticateToken, async (req, res) => {
  const { chatId, farmingEnd } = req.body;

  try {
    const user = await UserModel.findOne({ chatId: chatId })
    user.farmingEnd = farmingEnd;
    user.save();

    res.status(200).json({
      state: true,
      data: user,
    })
  } catch (err) {
    console.error('Error updating farming end time:', err)
    res.status(500).end()
  }
});

export default router
