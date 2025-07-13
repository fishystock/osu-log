const { Message } = require("./helpers/message.js");
const { Database } = require("./helpers/database.js");

const logger = require("npmlog");
const client = new (require("irc-framework").Client)();
const database = new Database();

require("dotenv").config({ quiet: true });
logger.level = "info";

const channels = [
  "#announce",
  "#arabic",
  "#bulgarian",
  "#cantonese",
  "#chinese",
  "#ctb",
  "#czechoslovak",
  "#dutch",
  "#english",
  "#estonian",
  "#filipino",
  "#finnish",
  "#french",
  "#german",
  "#greek",
  "#hebrew",
  "#help",
  "#hungarian",
  "#indonesian",
  "#italian",
  "#japanese",
  "#korean",
  "#latvian",
  "#lazer",
  "#lobby",
  "#malaysian",
  "#mapping",
  "#modreqs",
  "#osu",
  "#osumania",
  "#polish",
  "#portuguese",
  "#romanian",
  "#russian",
  "#skandinavian",
  "#spanish",
  "#taiko",
  "#taiwanese",
  "#thai",
  "#turkish",
  "#ukrainian",
  "#uzbek",
  "#videogames",
  "#vietnamese",
];

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

  logger.info(`${message.channel} | ${message.nickname}: ${message.message}`);

  database
    .addMessage(message)
    .then((status) => {})
    .catch((i) => {});
}
