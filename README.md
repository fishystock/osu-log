# osu-log
🛰️ osu.ppy.sh IRC Logger.

### Information
This is a module to a larger project involving osu! data collection.
- No, I am not using your information to train AI.
- No, I am not committing a crime by doing this.

You may contact me to have your information removed from collection by opening an issue on GitHub, but you should be aware I am not the only one doing this. Don't expect privacy from public channels.

### Configuration
```bash
git clone https://github.com/fishystock/osu-log
cd osu-log
npm install
cp .env.example .env
```

osu! API keys can be found from https://osu.ppy.sh/home/account/edit under `Legacy API`. Update the `.env` file with the values provided there.

### Running
Messages are stored in an SQLite3 database at `database/osu.db`. This database can be populated by running:
```bash
node index.js
```

### Webserver
This program will spawn a Fastify webserver on port 3000 (if undefined). All parameters are optional and limited to 100 results by default.
```bash
http://localhost:3000/api/messages?
  channel=%23osu&   # Fetch messages from target channel
  search=weeb&      # Fetch messages by substring
  message=weeb&     # Fetch messages by exact string
  nickname=peppy&   # Fetch messages from Username
  date=2025-07-13&  # Fetch messages on specific date (ISO)
  page=1
```
