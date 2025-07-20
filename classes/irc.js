const { Message } = require("./message.js");
const { Database } = require("./database.js");

const IRCFramework = require("irc-framework");
const channels = require("../channels.json");
const logger = require("npmlog");
const database = new Database();

logger.level = "info";

class IRCLogger {
  constructor() {
    this.client = new IRCFramework.Client();
    this.client.connect({
      username: process.env.IRC_USERNAME,
      password: process.env.IRC_PASSWORD,
      host: process.env.IRC_HOSTNAME,
      nick: process.env.IRC_USERNAME,
      port: process.env.IRC_PORT,
      sasl: true,
    });

    this.client.on(
      "registered",
      async (...args) => await this.onRegister(...args),
    );
    this.client.on("message", async (...args) => await this.onMessage(...args));
  }

  async timeout(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async onRegister() {
    logger.info(`Connected to ${process.env.IRC_HOSTNAME}`);

    for (let channel of channels) {
      logger.info(`Joining ${channel}`);
      this.client.join(channel);
      await this.timeout(250);
    }
  }

  async onMessage(event) {
    const message = new Message(event);

    if (!channels.includes(message.channel)) {
      logger.error("Non-whitelisted, skipping.");
      return;
    }

    logger.info(`${message.channel} | ${message.nickname}: ${message.message}`);

    database
      .addMessage(message)
      .then((status) => {})
      .catch((i) => {});
  }
}

module.exports = { IRCLogger };
