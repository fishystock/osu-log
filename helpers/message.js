class Message {
  constructor(event) {
    this.nickname = event.nick;
    this.channel = event.target;
    this.message = event.message;
    this.time = new Date().toISOString();
  }
}

module.exports = { Message };
