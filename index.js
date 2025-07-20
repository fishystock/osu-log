const { APIServer } = require("./classes/api.js");
const { IRCLogger } = require("./classes/irc.js");

require("dotenv").config({ quiet: true });

!(function main() {
  new IRCLogger();
  new APIServer();
})();
