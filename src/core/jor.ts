import dotenv from "dotenv";
dotenv.config();
import { UserModel } from '../models/user.model'
import { getUserAvatar } from '../bot'

export let scoreTempValue: { [key: string]: number } = {};
export let spinWheelInfo: { [key: string]: { count: number, timestamp: number } } = {};
export let gameTasks: any[] = [];
export let gameLevels: any[] = [];
export let userInfoList: { [key: string]: any } = {};

export async function findUser(chatId: string): Promise<any> {
  let user = await UserModel.findOne({ chatId: chatId })
  return user
}

// {
//   id: 5521963424,
//   first_name: "Gallant",
//   last_name: "Knight",
//   username: "GallantKnight",
//   language_code: "en",
// }
export async function findOrCreateUser(
  userInfo: any,
  avatar_url: string = 'logo.png',
  invitedFrom: string = ''
): Promise<any> {
  let user = await UserModel.findOne({ chatId: userInfo.id })

  if (user == null || user == undefined) {
    console.log('>>>>>>>>User register...')

    // create new user item
    let metaInfo = {
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      userName: userInfo.username,
      logo: avatar_url,
    }

    const inviteCode = generateInviteCode(userInfo.id)
    user = new UserModel({
      chatId: userInfo.id,
      metaInfo: metaInfo,
      items: [],
      currBalance: invitedFrom == "" ? 0 : 10,
      totalBalance: invitedFrom == "" ? 0 : 10,
      setting: {
        lang: 0,
        animation: false,
        sound: true,
        music: true,
      },
      inviteCode: inviteCode,
      invitedFrom: invitedFrom,
      isFirstLogin: true,
    })
    await user.save()

    let invite_user = await UserModel.findOne({ chatId: invitedFrom })
    if (invite_user && invitedFrom != "") {
      invite_user.currBalance += 10;
      invite_user.totalBalance += 10;
    }
    await invite_user.save()
  }
  return user
}

const generateInviteCode = (chatId: string) => {
  return `https://t.me/${process.env.BOT_USERNAME}?start=kentId${chatId}`
}

async function increaseBalances(
  chatId: string,
  totalOffset: number,
  currOffset: number
) {
  try {
    await UserModel.findOneAndUpdate(
      { chatId: chatId },
      {
        $inc: {
          totalBalance: totalOffset,
          currBalance: currOffset,
          // 'energy.current': -currOffset,
        },
      },
      { new: true } // This option returns the modified document
    )

    if (userInfoList[chatId]) {
      userInfoList[chatId].totalBalance += totalOffset;
      userInfoList[chatId].currBalance += currOffset;
      // console.log('[Balances updated successfully]:', result);
      return userInfoList[chatId]
    } else {
      console.log('User not found')
      return null;
    }
  } catch (error) {
    console.error('Error updating balances:', error)
    return null;
  }
}

async function checkUserLevel(chatId: string) {
  try {
    // Fetch the user by chatId
    const user = userInfoList[chatId]

    if (!user) {
      return null
    }

    let { currBalance, levelId } = user
    let currLevelId = levelId

    for (const level of gameLevels.reverse()) {
      // console.log(`Current Balance: ${currBalance} ThreadHold: ${level.threshold}`)
      if (currBalance >= level.threshold) {
        if (level.id <= currLevelId) {
          //
        } else {
          currLevelId += 1
          break
        }
      } else {
        continue
      }
    }

    // Update the user's level if it has changed
    if (user.levelId !== currLevelId) {
      user.levelId = currLevelId
      console.log(`>>>>>>>>>User level updated to ${currLevelId}`)
      await UserModel.findOneAndUpdate(
        { chatId: chatId },
        { levelId: currLevelId },
        { new: true }
      )
      return user
    } else {
      // console.log('User level remains the same');
      return null
    }
  } catch (error) {
    console.error('Error updating user level:', error)
    return null
  }
}

export async function calculateBalance(
  chatId: string,
  currBalance: number,
  totalBalance: number
) {
  if (!userInfoList[chatId]) return 'The game does not exist'

  let increasedData: any = await increaseBalances(
    chatId,
    currBalance,
    totalBalance
  )

  //Check user level-up state
  const levelupData = await checkUserLevel(chatId)
  if (levelupData != null) {
    console.log('>>>>>>>>>>CheckUser Level balance: ', levelupData)
    return levelupData
  } else {
    return increasedData
  }
}

export const checkSocialTask = async (chatId: any) => {
  let xConnected = false,
    tgChannelConnected = false,
    tgGroupConnected = false,
    walletConnected = false

  // try {
  //   const botToken = process.env.BOT_TOKEN;
  //   const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=@${channelId}&user_id=${userId}`;
  //   const response = await fetch(url);
  //   const data: any = await response.json();

  //   if (data.ok) {
  //     const status = data.result.status;
  //     if (status === 'member' || status === 'administrator' || status === 'creator') {
  //       console.log('User is subscribed to the channel.');
  //       return { state: true, message: "Success" };
  //     } else {
  //       return { state: false, message: "Please complete the task" };
  //     }
  //   } else {
  //     return { state: false, message: "Failed to get information of channel" };
  //   }
  // } catch (error) {
  //   return { state: false, message: "Internal server error" };
  // }


  return { xConnected, tgChannelConnected, tgGroupConnected, walletConnected }
}