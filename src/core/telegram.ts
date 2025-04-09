import * as instance from "../bot";
import * as C from "../utils/constant";

import dotenv from "dotenv";
dotenv.config();

export const procMessage = async (message: any) => {
  let chatId = message.chat.id.toString();
  let session = instance.sessions.get(chatId);
  let messageId = message?.messageId;

  if (instance.busy) {
    return;
  }

  if (!message.text) return;

  let command = message.text;
  if (message.entities) {
    for (const entity of message.entities) {
      if (entity.type === "bot_command") {
        command = command.substring(
          entity.offset,
          entity.offset + entity.length
        );
        break;
      }
    }
  }

  if (command.startsWith("/")) {
    if (!session) {

      session = await instance.createSession(chatId);
    }

    let params = message.text.split(" ");
    if (params.length > 0 && params[0] === command) {
      params.shift();
    }

    command = command.slice(1);

    if (command === instance.COMMAND_START) {
      await instance.executeCommand(chatId, messageId, undefined, {
        c: C.OptionCode.MAIN_MENU,
        k: 1,
      });
    }

  } else if (message.reply_to_message) {
    await instance.removeMessage(chatId, message.message_id); //TGR
    await instance.removeMessage(chatId, message.reply_to_message.message_id);
  }
};
