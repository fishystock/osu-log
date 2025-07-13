const SQLite3 = require("better-sqlite3");

class Database {
  constructor(path = "./database/osu.db") {
    this.context = new SQLite3(path);
    this.init();
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  init() {
    this.context
      .prepare(
        `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host TEXT,
        identity TEXT,
        nickname TEXT,
        channel TEXT,
        message TEXT,
        time TEXT
      );`,
      )
      .run();
  }

  async addMessage(message, retries = 5) {
    const stmt = this.context.prepare(`
      INSERT INTO messages (host, identity, nickname, channel, message, time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    while (retries--) {
      try {
        stmt.run(
          message.host,
          message.identity,
          message.nickname,
          message.channel,
          message.message,
          message.time,
        );

        return true;
      } catch (e) {
        console.log(e);
        await this.sleep(100);
      }
    }

    return false;
  }
}

module.exports = { Database };
