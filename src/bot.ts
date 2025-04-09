import TelegramBot from "node-telegram-bot-api";
import * as C from "./utils/constant.js";
import * as teleBot from "./core/telegram.js";
import * as global from "./global.js";
import * as database from './database/db.js'
import * as JOR from './core/jor.js'

import dotenv from "dotenv";
dotenv.config();

import { resolve } from "path";
const logoFilePath = resolve(__dirname, "./assets/logo.jpg");

export const COMMAND_START = "start";

export let bot: TelegramBot;
export let myInfo: TelegramBot.User;
export const sessions = new Map();
export const stateMap = new Map();

export let busy = true;

export const stateMap_getFocus = (chatId: string) => {
  const item = stateMap.get(chatId);
  if (item) {
    let focusItem = item.focus;
    return focusItem;
  }

  return null;
};

export const stateMap_init = (chatId: string) => {
  let item = {
    focus: { state: C.StateCode.IDLE, data: { sessionId: chatId } },
    message: new Map(),
  };

  stateMap.set(chatId, item);
  return item;
};

export const stateMap_setMessage_Id = (
  chatId: string,
  messageType: number,
  messageId: number
) => {
  let item = stateMap.get(chatId);
  if (!item) {
    item = stateMap_init(chatId);
  }

  item.message.set(`t${messageType}`, messageId);
};

export const stateMap_getMessage = (chatId: string) => {
  const item = stateMap.get(chatId);
  if (item) {
    let messageItem = item.message;
    return messageItem;
  }
  return null;
};

export const stateMap_getMessage_Id = (chatId: string, messageType: number) => {
  const messageItem = stateMap_getMessage(chatId);
  if (messageItem) {
    return messageItem.get(`t${messageType}`);
  }

  return null;
};

export const json_buttonItem = (key: string, cmd: number, text: string) => {
  return {
    text: text,
    callback_data: JSON.stringify({ k: key, c: cmd }),
  };
};

const json_url_buttonItem = (text: string, url: string) => {
  return {
    text: text,
    url: url,
  };
};

const json_webapp_buttonItem = (text: string, url: any, chatId: string) => {
  return {
    text: text,
    web_app: {
      url: `${url}?chat_id=${chatId}`,
    },
  };
};

export const removeMenu = async (chatId: string, messageType: number) => {
  const msgId = stateMap_getMessage_Id(chatId, messageType);

  if (msgId) {
    try {
      await bot.deleteMessage(chatId, msgId);
    } catch (error) {
      //global.errorLog('deleteMessage', error)
    }
  }
};

export const openMenu = async (
  chatId: string,
  messageType: number,
  menuTitle: string,
  json_buttons: any = []
) => {
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: false,
    one_time_keyboard: true,
    force_reply: true,
  };

  return new Promise(async (resolve) => {
    await removeMenu(chatId, messageType);

    try {
      let msg: TelegramBot.Message = await bot.sendMessage(chatId, menuTitle, {
        reply_markup: keyboard,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      // setBotPhoto(chatId);
      stateMap_setMessage_Id(chatId, messageType, msg.message_id);
      resolve({ messageId: msg.message_id, chatId: msg.chat.id });
    } catch (error) {
      global.errorLog("openMenu", error);
      resolve(null);
    }
  });
};

export const openMenuWithPhoto = async (
  chatId: string,
  messageType: number,
  caption: string,
  json_buttons: any = []
) => {
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: false,
    one_time_keyboard: true,
    force_reply: true,
  };

  return new Promise(async (resolve) => {
    await removeMenu(chatId, messageType);

    try {

      let msg: TelegramBot.Message = await bot.sendPhoto(chatId, logoFilePath, {
        caption: caption,
        reply_markup: keyboard,
        parse_mode: "HTML",
      });

      // setBotPhoto(chatId);
      stateMap_setMessage_Id(chatId, messageType, msg.message_id);
      resolve({ messageId: msg.message_id, chatId: msg.chat.id });
    } catch (error) {
      global.errorLog("openMenuWithPhoto", error);
      resolve(null);
    }
  });
};

export const openMessage = async (
  chatId: string,
  bannerId: string,
  messageType: number,
  menuTitle: string
) => {
  return new Promise(async (resolve) => {
    await removeMenu(chatId, messageType);

    let msg: TelegramBot.Message;

    try {
      if (bannerId) {
        msg = await bot.sendPhoto(chatId, bannerId, {
          caption: menuTitle,
          parse_mode: "HTML",
        });
      } else {
        msg = await bot.sendMessage(chatId, menuTitle, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }

      stateMap_setMessage_Id(chatId, messageType, msg.message_id);
      // console.log('chatId, messageType, msg.message_id', chatId, messageType, msg.message_id)
      resolve({ messageId: msg.message_id, chatId: msg.chat.id });
    } catch (error) {
      global.errorLog("openMessage", error);
      resolve(null);
    }
  });
};

export async function switchMenu(
  chatId: string,
  messageId: number,
  title: string,
  json_buttons: any
) {
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true,
  };

  try {
    await bot.editMessageText(title, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
      disable_web_page_preview: true,
      parse_mode: "HTML",
    });
  } catch (error) {
    global.errorLog("[switchMenuWithTitle]", error);
  }
}

export const replaceMenu = async (
  chatId: string,
  messageId: number,
  messageType: number,
  menuTitle: string,
  json_buttons: any = []
) => {
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true,
  };

  return new Promise(async (resolve, _reject) => {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (error) {
    }

    await removeMenu(chatId, messageType);

    try {
      let msg: TelegramBot.Message = await bot.sendMessage(chatId, menuTitle, {
        reply_markup: keyboard,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      stateMap_setMessage_Id(chatId, messageType, msg.message_id);
      resolve({ messageId: msg.message_id, chatId: msg.chat.id });
    } catch (error) {
      global.errorLog("replaceMenu", error);
      resolve(null);
    }
  });
};

export const get_menuTitle = (sessionId: string, subTitle: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return "ERROR " + sessionId;
  }

  let result =
    session.type === "private"
      ? `@${session.username}'s configuration setup`
      : `@${session.username} group's configuration setup`;

  if (subTitle && subTitle !== "") {
    result += `\n${subTitle}`;
  }

  return result;
};

export const removeMessage = async (sessionId: string, messageId: number) => {
  if (sessionId && messageId) {
    try {
      await bot.deleteMessage(sessionId, messageId);
    } catch (error) {
    }
  }
};

export const sendReplyMessage = async (chatId: string, message: string) => {
  try {
    let data: any = {
      parse_mode: "HTML",
      disable_forward: true,
      disable_web_page_preview: true,
      reply_markup: { force_reply: true },
    };

    const msg = await bot.sendMessage(chatId, message, data);
    return {
      messageId: msg.message_id,
      chatId: msg.chat ? msg.chat.id : null,
    };
  } catch (error) {
    global.errorLog("sendReplyMessage", error);
    return null;
  }
};

export const sendMessage = async (
  chatId: string,
  message: string,
  info: any = {}
) => {
  try {
    let data: any = { parse_mode: "HTML" };

    data.disable_web_page_preview = true;
    data.disable_forward = true;

    if (info && info.message_thread_id) {
      data.message_thread_id = info.message_thread_id;
    }

    const msg = await bot.sendMessage(chatId, message, data);
    return {
      messageId: msg.message_id,
      chatId: msg.chat ? msg.chat.id : null,
    };
  } catch (error: any) {
    if (
      error.response &&
      error.response.body &&
      error.response.body.error_code === 403
    ) {
      info.blocked = true;
    }

    console.log(error?.response?.body);
    global.errorLog("sendMessage", error);
    return null;
  }
};

export const sendPhoto = async (
  chatId: string,
  caption: string,
  info: any = {}
) => {
  try {
    let data: any = {
      caption: caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            json_url_buttonItem(
              "🔥 Start App 🔥",
              process.env.BOT_ID
            ),
          ],
          [
            json_url_buttonItem(
              "✨ JOR Community ✨",
              process.env.JOR_COMMUNITY
            ),
          ],
        ]
      }

    };

    data.disable_web_page_preview = true;
    data.disable_forward = true;

    if (info && info.message_thread_id) {
      data.message_thread_id = info.message_thread_id;
    }

    console.log("send photo : ", caption)
    const msg = await bot.sendPhoto(chatId, logoFilePath, data);
    return {
      messageId: msg.message_id,
      chatId: msg.chat ? msg.chat.id : null,
    };
  } catch (error: any) {
    if (
      error.response &&
      error.response.body &&
      error.response.body.error_code === 403
    ) {
      info.blocked = true;
    }

    console.log(error?.response?.body);
    global.errorLog("sendPhoto", error);
    return null;
  }
};

export const sendInfoMessage = async (chatId: string, message: string) => {
  let json = [[json_buttonItem(chatId, C.OptionCode.CLOSE, "✖️ Close")]];

  return sendOptionMessage(chatId, message, json);
};

export const sendOptionMessage = async (
  chatId: string,
  message: string,
  option: any
) => {
  try {
    const keyboard = {
      inline_keyboard: option,
      resize_keyboard: true,
      one_time_keyboard: true,
    };

    const msg = await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      disable_web_page_preview: true,
      parse_mode: "HTML",
    });
    return {
      messageId: msg.message_id,
      chatId: msg.chat ? msg.chat.id : null,
    };
  } catch (error) {
    global.errorLog("sendOptionMessage", error);

    return null;
  }
};

export const pinMessage = (chatId: string, messageId: number) => {
  try {
    bot.pinChatMessage(chatId, messageId);
  } catch (error) {
    console.error(error);
  }
};

export const checkWhitelist = (_chatId: string) => {
  return true;
};

export const json_help = async (sessionId: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const title = `How to play the Game ⚡️

🃏 Card
Upgrade cards that will give you multiple income opportunities.

⏰ Profit per 24 hour
You earn 1 JOR every 24 hours.

📈 LVL
The more coins you have on your balance, the higher the level of your exchange is and the faster you can earn more coins.

🪙 Token listing
At the end of the season, a token will be released and distributed among the players.
Dates will be announced in our announcement channel. Stay tuned!`;

  let json = [
    [
      json_webapp_buttonItem(
        "Play Joker 🃏",
        process.env.WEBAPP_URL,
        sessionId
      ),
    ],
    [
      json_url_buttonItem(
        "Subscribe to the channel",
        process.env.ALARM_CHANNEL_ID
      ),
    ],
  ];
  return { title: title, options: json };
};


export const getMainMenuMessage = async (
  sessionId: string
): Promise<string> => {
  const session = sessions.get(sessionId);
  if (!session) {
    return "";
  }

  const MESSAGE = `
  Start earning 500 JOR immediately by joining our ecological JOR coin mining community! Complete just three simple steps: connect your wallet, make your first transaction in the TON wallet, and subscribe to our channel. Limited to 200,000 participants, and with your reward transferred instantly, you'll be part of an exclusive group ready to kick-start mining as soon as the limit is reached. Don't wait – join now!
`;

  return MESSAGE;
};

export const json_main = async (sessionId: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return "";
  }

  const itemData = `${sessionId}`;
  const json = [
    [
      json_webapp_buttonItem(
        "Play Joker 🃏",
        process.env.WEBAPP_URL,
        sessionId
      ),
    ],
    [
      json_url_buttonItem(
        "Subscribe to the channel",
        process.env.ALARM_CHANNEL_ID
      ),
    ],
    [
      json_url_buttonItem(
        "Join Community",
        process.env.JOR_COMMUNITY
      ),
    ],
  ];

  return { title: "", options: json };
};

export const json_confirm = async (
  sessionId: string,
  msg: string,
  btnCaption: string,
  btnId: number,
  itemData: string = ""
) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const title = msg;

  let json = [
    [
      json_buttonItem(sessionId, C.OptionCode.CLOSE, "Close"),
      json_buttonItem(itemData, btnId, btnCaption),
    ],
  ];
  return { title: title, options: json };
};

export const openConfirmMenu = async (
  sessionId: string,
  msg: string,
  btnCaption: string,
  btnId: number,
  itemData: string = ""
) => {
  const menu: any = await json_confirm(
    sessionId,
    msg,
    btnCaption,
    btnId,
    itemData
  );
  if (menu) {
    await openMenu(sessionId, btnId, menu.title, menu.options);
  }
};

export const createSession = async (
  chatId: string
) => {
  let session: any = {};

  try {
    session.chatId = chatId;
    
    // Initialize session with defaults
    session.type = "private"; // Default to private chat
    session.username = "user"; // Default username
    
    // Try to get actual chat info
    const chat = await bot.getChat(chatId);
    if (chat) {
      session.type = chat.type;
      session.username = chat.username || 'user'; 
    }
    
    // Store the session
    sessions.set(chatId, session);
    showSessionLog(session);

    return session;
  } catch (error) {
    console.error("Error creating session:", error);
    
    // Create a minimal session
    const minimalSession = {
      chatId,
      type: "private",
      username: "user"
    };
    
    sessions.set(chatId, minimalSession);
    return minimalSession;
  }
};

export function showSessionLog(session: any) {
  if (session.type === "private") {
    console.log(
      `@${session.username} user${session.wallet
        ? " joined"
        : "'s session has been created (" + session.chatId + ")"
      }`
    );
  } else if (session.type === "group") {
    console.log(
      `@${session.username} group${session.wallet
        ? " joined"
        : "'s session has been created (" + session.chatId + ")"
      }`
    );
  } else if (session.type === "channel") {
    console.log(
      `@${session.username} channel${session.wallet ? " joined" : "'s session has been created"
      }`
    );
  }
}

export const defaultConfig = {
  vip: 0,
};

export async function init() {
  busy = true;
  
  // Add a small delay to ensure any previous instances have time to shut down
  console.log('Waiting for previous bot instances to shut down...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  bot = new TelegramBot(process.env.BOT_TOKEN as string, {
    polling: true,
  });

  // Handle polling errors
  bot.on('polling_error', (error: any) => {
    console.log(`Polling error: ${error.code}`);
    
    // If we get a conflict error, stop polling and try to restart after a delay
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
      console.log('Conflict detected, stopping polling');
      bot.stopPolling();
      setTimeout(() => {
        console.log('Attempting to restart bot after conflict');
        init();
      }, 5000);
    }
  });

  bot.getMe().then((info: TelegramBot.User) => {
    myInfo = info;
    console.log(`Bot connected as: ${info.first_name} (@${info.username})`);
  });

  bot.onText(/^\/start$/, async (message: any) => {
    console.log('=== basic start command ====');
    const chatId = message.chat.id;
    
    // Make sure a session exists
    let session = sessions.get(chatId);
    if (!session) {
      session = await createSession(chatId);
      console.log(`Creating new session for user ${chatId}`);
      // Save user info
      await JOR.findOrCreateUser(message.from, await getUserAvatar(message.chat.id));
    }
    
    // Send Hello message
    bot.sendMessage(chatId, 'Hello! Welcome to JOR Bot. 👋');
    
    // Show menu with buttons
    const menu: any = await json_main(chatId);
    let title: string = await getMainMenuMessage(chatId);
    
    // Use openMenuWithPhoto with proper options
    await openMenuWithPhoto(chatId, C.OptionCode.MAIN_MENU, title, menu.options);
  });

  bot.onText(/\/start (.+)/, async (message: any) => {
    console.log('=== start ====')
    const chatId = message.chat.id
    let session = sessions.get(chatId)

    // Create session if it doesn't exist
    if (!session) {
      session = await createSession(chatId);
      console.log(`Creating new session for user ${chatId}`);
    } else {
      console.log(`Using existing session for user ${chatId}`);
    }

    const text = message.text || ''

    // Extract the referral code from the message text
    const startParamMatch = text.match(/\/start kentId(.+)/)
    if (startParamMatch && startParamMatch[1]) {
      console.log('----------This is invited visiting....................')
      // Already loggin?
      const existUser = await JOR.findUser(chatId)

      if (!existUser) {
        // Who invited you?
        const inviteId = startParamMatch[1]

        console.log(
          `>>>>>>>>>>[User ${chatId} created by invite]:  ${inviteId}`
        )
        await JOR.findOrCreateUser(message.from, await getUserAvatar(chatId), inviteId)
      }
      
      // Send Hello message with invitation info
      bot.sendMessage(chatId, 'Hello! Welcome to JOR Bot. 👋\nYou were invited to join us!');
      
      // Show menu with buttons
      const menu: any = await json_main(chatId);
      let title: string = await getMainMenuMessage(chatId);
      await openMenuWithPhoto(chatId, C.OptionCode.MAIN_MENU, title, menu.options);
    } else {
      console.log('----------This is normal visition....................')
      
      // Save user if needed
      await JOR.findOrCreateUser(message.from, await getUserAvatar(chatId));
      
      // Send Hello message for normal start with parameters
      bot.sendMessage(chatId, 'Hello! Welcome to JOR Bot. 👋');
      
      // Show menu with buttons
      const menu: any = await json_main(chatId);
      let title: string = await getMainMenuMessage(chatId);
      await openMenuWithPhoto(chatId, C.OptionCode.MAIN_MENU, title, menu.options);
    }
  });

  bot.on("message", async (message: any) => {
    // Skip /start commands as they are handled by specific handlers
    if (message.text && (message.text === '/start' || message.text.startsWith('/start '))) {
      return;
    }

    const msgType = message?.chat?.type;
    if (msgType === "private") {
      teleBot.procMessage(message);
    }
  });

  bot.on("callback_query", async (callbackQuery: TelegramBot.CallbackQuery) => {
    const message = callbackQuery.message;
    if (!message) {
      return;
    }

    let chatId = message.chat.id.toString();
    const option = JSON.parse(callbackQuery.data as string);
    executeCommand(chatId, message.message_id, callbackQuery.id, option);
  });

  busy = false;
}

export const getUserAvatar = async (userId: number): Promise<string> => {
  try {
    // Fetch user's profile photos
    const userProfilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

    // Check if the user has any profile photos
    if (userProfilePhotos.total_count > 0) {
      // Get the first photo (avatar)
      const photo = userProfilePhotos.photos[0];  // Array of PhotoSize arrays

      // Get the largest version of the photo (last one in the array)
      const avatar = photo[photo.length - 1];

      // You can download the file using `getFile`
      const file = await bot.getFile(avatar.file_id);
      
      if (!file.file_path) {
        console.log('File path is empty.');
        return "";
      }
      
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

      console.log('User avatar URL:', fileUrl);
      return fileUrl;
    } else {
      console.log('No profile photo found for this user.');
      return "";
    }
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return "";
  }
};

export const sessionInit = async () => {
  await database.init()
  console.log("========bot started========");
};

export const reloadCommand = async (
  chatId: string,
  messageId: number,
  callbackQueryId: string,
  option: any
) => {
  await removeMessage(chatId, messageId);
  executeCommand(chatId, messageId, callbackQueryId, option);
};

export const executeCommand = async (
  chatId: string,
  _messageId: number | undefined,
  _callbackQueryId: string | undefined,
  option: any
) => {
  const cmd = option.c;
  const id = option.k;

  console.log(`executeCommand cmd = ${cmd} id = ${id}`);

  const session = sessions.get(chatId);
  if (!session) {
    return;
  }

  let messageId = Number(_messageId ?? 0);
  let callbackQueryId = _callbackQueryId ?? "";

  const sessionId: string = chatId;
  const stateData: any = { sessionId, messageId, callbackQueryId, cmd };

  stateData.message_id = messageId;
  stateData.callback_query_id = callbackQueryId;

  try {
    switch (cmd) {
      case C.OptionCode.MAIN_MENU: {
        const menu: any = await json_main(sessionId);
        let title: string = await getMainMenuMessage(sessionId);

        await openMenuWithPhoto(chatId, cmd, title, menu.options);
        break;
      }
      case C.OptionCode.HELP_BACK: {
        await removeMessage(sessionId, messageId);
        const menu: any = await json_main(sessionId);
        let title: string = await getMainMenuMessage(sessionId);

        await openMenuWithPhoto(chatId, cmd, title, menu.options);
        break;
      }
      case C.OptionCode.CLOSE: {
        await removeMessage(sessionId, messageId);
        break;
      }
      case C.OptionCode.MAIN_HELP: {
        await removeMessage(sessionId, messageId);
        const menu: any = await json_help(sessionId);

        await openMenuWithPhoto(chatId, messageId, menu.title, menu.options);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.log(err);
    sendMessage(
      chatId,
      `😢 Sorry, Game server restarted. 😉`
    );
    if (callbackQueryId)
      await bot.answerCallbackQuery(callbackQueryId, {
        text: `😢 Sorry, Game server restarted. 😉`,
      });
  }
};

const LOG = true;
export async function lastName(msg: TelegramBot.Message, userId: number) {
  const lastName = msg.from?.last_name;
  bot.sendMessage(msg.chat.id, lastName || '');

  if (LOG && msg.from) {
    const userObj = msg.from;
    bot.sendMessage(
      userId,
      `*${userObj.first_name} ${userObj.last_name} (@${userObj.username} - ${userObj.id}) wanted to know their last name.*`,
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }
    );
  }
}
