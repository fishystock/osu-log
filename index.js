const { Message } = require("./helpers/message.js");
const { Database } = require("./helpers/database.js");

const client = new (require("irc-framework").Client)();
const channels = require("./channels.json");
const fastify = require("fastify")();
const logger = require("npmlog");
const axios = require("axios");
const database = new Database();

require("dotenv").config({ quiet: true });
logger.level = "info";

!(function main() {
  logger.info(`Establishing connection to ${process.env.IRC_HOSTNAME}`);

  client.connect({
    username: process.env.IRC_USERNAME,
    password: process.env.IRC_PASSWORD,
    host: process.env.IRC_HOSTNAME,
    nick: process.env.IRC_USERNAME,
    port: process.env.IRC_PORT,
    sasl: true,
  });

  client.on("registered", register);
  client.on("message", message);

  fastify.listen({ port: process.env.API_PORT || 3000 }, () => {
    logger.info(`Webserver created.`);
  });

  fastify.get("/api/messages", async (req, reply) => {
    const messages = database.getMessages(req.query);
    reply.send(messages);
  });

  fastify.get("/api/channels", async (req, reply) => {
    reply.send(channels);
  });

  fastify.get("/api/picture/:username", async (req, reply) => {
    const { username } = req.params;
    const osu_profile_root = "https://osu.ppy.sh/users/";

    await axios
      .get(`${osu_profile_root}${username}`, {
        maxRedirects: 1,
      })
      .then((resp) => {
        const id = resp.data.split(osu_profile_root)[1].split(`"`)[0];

        reply.redirect(`https://a.ppy.sh/${id}?1337.png`);
      })
      .catch(() => {
        reply.redirect("https://a.ppy.sh/00000?1337.png");
      });
  });
})();

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function register() {
  logger.info(`Connected to ${process.env.IRC_HOSTNAME}`);

  for (let channel of channels) {
    logger.info(`Joining ${channel}`);
    client.join(channel);
    await timeout(250);
  }
}

function message(event) {
  const message = new Message(event);

  if (!channels.includes(message.channel)) {
    logger.error("Non-whitelisted, skipping.");
    return;
  }

  // FIX: osu! username spaces are converted to `_` for IRC.
  message.nickname = message.nickname.replaceAll("_", " ");

  logger.info(`${message.channel} | ${message.nickname}: ${message.message}`);

  database
    .addMessage(message)
    .then((status) => {})
    .catch((i) => {});
}
