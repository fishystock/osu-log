class Message {
  constructor(event) {
    this.host = event.target;
    this.nickname = event.nick;
    this.identity = event.ident;
    this.channel = event.target;
    this.message = event.message;
    this.time = new Date().toISOString();
  }
}

module.exports = { Message };
