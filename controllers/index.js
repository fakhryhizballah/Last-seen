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
    test: async (req, res) => {
        try {
            let app = req.params.app;
            let { id, name } = req.query;
            let datetime = new Date();
            // wib
            datetime.setHours(datetime.getHours() + 7);
            let datenow = datetime.toISOString().slice(0, 19).replace('T', ' ');
            let data = {
                id: id,
                name: name,
                last_seen: datetime
            };
            // const client = createClient({
            //     url: process.env.REDIS_URL
            // });
            // client.on('error', (error) => {
            //     console.error(error);
            // });
            // client.connect();
            // client.set(`online:${app}:${id}`, data);
            // client.expire(`online:${app}:${id}`, 60);
            // let now = Date.now();
            // client.zAdd('vehicles', [
            //     {
            //         score: 10,
            //         value: 'car',
            //     },
            //     {
            //         score: 2,
            //         value: 'bike',
            //     },
            // ]);
            // client.hSet(`online:${app}:${id}`, {
            //     id: id,
            //     name: name,
            //     last_seen: datenow
            // })
            // client.expire(`online:${app}:${id}`, 60);
            // client.lPush('bikes:repairs', 'bike:1');
            // client.hSet('key', 'field', 'value');
            // let getHSet = await client.keys('online:lpkp:*');
            // let keys = await client.keys('online:lpkp:*');
            // let users = [];
            // for (let key of keys) {
            //     let user = await client.hGetAll(key);
            //     console.log(user);
            //     users.push(user);
            //     // users.push(JSON.parse(user));
            // }
            // console.log(getHSet);
            client.quit();

            return res.status(200).json({
                message: 'success',
                data: users
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'error',
                data: error.message
            });
        }
    },
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
    }
}