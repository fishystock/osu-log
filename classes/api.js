const { Database } = require("../classes/database.js");

const fastifyStatic = require("@fastify/static");
const fastify = require("fastify");

const channels = require("../channels.json");
const database = new Database();
const axios = require("axios");
const path = require("path");

class APIServer {
  constructor(port) {
    // TODO: Check if webserver active in .env
    this.fastify = fastify();

    this.fastify.register(fastifyStatic, {
      root: path.join(__dirname, "../static"),
      prefix: "/",
      index: "index.html",
    });

    this.fastify.get("/api/messages", this.getMessages);
    this.fastify.get("/api/channels", this.getChannels);
    this.fastify.get("/api/picture/:username", this.getProfilePicture);

    this.fastify.listen({ port: process.env.API_PORT || 3000 });
  }

  async getMessages(request, response) {
    response.send(database.getMessages(request.query));
  }

  async getChannels(request, response) {
    response.send(channels);
  }

  async getContext(request, response) {
    // TODO: Implement functionality to get the "context" of a chat
  }

  async getProfilePicture(request, response) {
    const { username } = request.params;

    // TODO: I should really be fetching / caching ID's from messages.

    await axios
      .get(`https://osu.ppy.sh/users/${request.params.username}`)
      .then((resp) => {
        const id = resp.data.match(/https:\/\/osu\.ppy\.sh\/users\/(\d+)/)?.[1];
        response.redirect(
          `https://ameobea.b-cdn.net/osutrack/Mixins/userImage.php?u=${id}`,
        );
      })
      .catch(() => {
        response.redirect(
          `https://ameobea.b-cdn.net/osutrack/Mixins/userImage.php?u=0000`,
        );
      });
  }
}

module.exports = { APIServer };
