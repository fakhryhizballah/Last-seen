const { createClient } = require('redis');
const { use } = require('../routes');
const client = createClient({
    url: process.env.REDIS_URL
});
client.on('error', (error) => {
    console.error(error);
});
client.connect();
module.exports = {
    update: async (req, res) => {
        try {
            let app = req.params.app;
            let { id, name } = req.query;
            let datetime = new Date();
            // wib
            datetime.setHours(datetime.getHours() + 7);
            let datenow = datetime.toISOString().slice(0, 19).replace('T', ' ');
            client.hSet(`${app}:online:${id}`, {
                id: id,
                name: name,
                last_seen: datenow
            })
            client.expire(`${app}:online:${id}`, 10);
            client.hSet(`${app}:lastSeen:byId`, id, datenow);
            client.hSet(`${app}:lastSeen:byName`, name, datenow);

            return res.status(200).json({
                message: 'success',
                data: null
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    },
    online: async (req, res) => {
        try {
            let app = req.params.app;
            let keys = await client.keys(`${app}:online:*`);
            let users = [];
            for (let key of keys) {
                let user = await client.hGetAll(key);
                console.log(user);
                users.push(user);
            }
            return res.status(200).json({
                message: 'success',
                data: {
                    record: users.length,
                    users: users,
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    },
    lastSeenByName: async (req, res) => {
        try {
            let app = req.params.app;
            let name = req.query.name;
            let lastSeen = await client.hGetAll(`${app}:lastSeen:byName`);
            if (name) {
                lastSeen = await client.hGet(`${app}:lastSeen:byName`, name);
                return res.status(200).json({
                    message: 'success',
                    data: lastSeen
                });
            }
            return res.status(200).json({
                message: 'success',
                record: Object.keys(lastSeen).length,
                data: lastSeen
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    },
    lastSeenById: async (req, res) => {
        try {
            let app = req.params.app;
            let id = req.query.id;
            let lastSeen = await client.hGetAll(`${app}:lastSeen:byId`);
            if (id) {
                lastSeen = await client.hGet(`${app}:lastSeen:byId`, id);
                return res.status(200).json({
                    message: 'success',
                    data: lastSeen
                });
            }
            return res.status(200).json({
                message: 'success',
                record: Object.keys(lastSeen).length,
                data: lastSeen
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    },
    test: async (req, res) => {
        try {
            let app = req.params.app;
            let ping = await client.ping();
            console.log(ping);
            await client.hSet('key', 'field', 'value');
            await client.hGetAll('key');
            // let getlist = await client.LRANGE('Uptime:lastseen:001', 0, 4);
            let index = await client.LLEN('Uptime:lastseen:001');
            console.log(index);
            let getlist = await client.LRANGE('Uptime:lastseen:001', index - 1, index);
            console.log(getlist);

            let down = await client.ZSCORE('Uptime:downtime:001', "2023-11-10");
            console.log(down);
            return res.status(200).json({
                message: 'success',
                data: null
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    }
}