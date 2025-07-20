const { Database } = require("../classes/database.js");
const channels = require("../channels.json");
const fastify = require("fastify")();
const database = new Database();
const axios = require("axios");

class APIServer {
  constructor(port) {
    // TODO: Check if webserver active in .env
    fastify.listen({ port: process.env.API_PORT || 3000 });

    fastify.get("/api/messages", this.getMessages);
    fastify.get("/api/channels", this.getChannels);
    fastify.get("/api/picture/:username", this.getProfilePicture);
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

    await axios
      .get(`https://osu.ppy.sh/users/${request.params.username}`)
      .then((resp) => {
        const id = resp.data.match(/https:\/\/osu\.ppy\.sh\/users\/(\d+)/)?.[1];
        response.redirect(`https://a.ppy.sh/${id}?1337.png`);
      })
      .catch(() => {
        response.redirect("https://a.ppy.sh/00000?1337.png");
      });
  }
}

module.exports = { APIServer };
