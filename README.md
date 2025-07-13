# osu-log
🛰️ osu.ppy.sh IRC Logger

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
