class Message {
  constructor(event) {
    // Converting IRC -> osu! naming.
    this.nickname = event.nick.replaceAll("_", " ");
    this.channel = event.target;
    this.message = event.message;
    this.time = new Date().toISOString();
  }
}

module.exports = { Message };
