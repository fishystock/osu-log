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
        nickname TEXT,
        channel TEXT,
        message TEXT,
        time TEXT
      );`,
      )
      .run();
  }

  getMessages(options = {}) {
    const filtersMap = {
      channel: "channel = ?",
      message: "message = ?",
      search: "message LIKE ?",
      nickname: "nickname = ?",
      date: "DATE(time) = DATE(?)",
    };

    const conditions = [];
    const values = [];

    for (const [key, clause] of Object.entries(filtersMap)) {
      if (options[key] !== undefined) {
        conditions.push(clause);
        values.push(key === "search" ? `%${options[key]}%` : options[key]);
      }
    }

    const limit = Math.min(options.limit || 100, 100);
    const offset = ((options.page || 1) - 1) * limit;

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const collate = conditions.length ? `COLLATE NOCASE` : "";
    const query = `
      SELECT * FROM messages
      ${where}
      ${collate}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    values.push(limit, offset);

    return this.context.prepare(query).all(...values);
  }

  async addMessage(message, retries = 5) {
    const stmt = this.context.prepare(`
      INSERT INTO messages (nickname, channel, message, time)
      VALUES (?, ?, ?, ?)
    `);

    while (retries--) {
      try {
        stmt.run(
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
