const { createClient } = require('redis');
const { use } = require('../routes');
const moment = require('moment');
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
            client.hSet(`${app}:data:byUser`, name, id);
            client.hSet(`${app}:data:byId`, id, name);
            let lastOnline = await client.hGetAll(`${app}:online:${id}`);
            if (!lastOnline.last_seen) {
                // console.log('last seen');
                let lastUp = await client.LRANGE(`${app}:uptime:logUp:${id}`, -1, -1)
                // console.log(lastUp);
                if (lastUp.length == 0) {
                    lastUp = [datenow]
                }
                let lastSeen = await client.hGet(`${app}:lastSeen:byId`, id);
                // console.log(lastSeen);
                if (lastSeen == null) {
                    client.hSet(`${app}:lastSeen:byId`, id, datenow);
                    client.hSet(`${app}:lastSeen:byName`, name, datenow);
                    lastSeen = datenow;
                }

                // Konversi string tanggal ke objek waktu menggunakan 'moment'
                let waktuLastUp = moment(lastUp[0], 'YYYY-MM-DD HH:mm:ss');
                let waktuLastLog = moment(lastSeen, 'YYYY-MM-DD HH:mm:ss');
                let waktuSekarang = moment(datenow, 'YYYY-MM-DD HH:mm:ss');
                let durasiDowntime = moment.duration(waktuSekarang.diff(waktuLastLog));
                // console.log(`durasi downtime: ${durasiDowntime.hours()} jam, ${durasiDowntime.minutes()} menit, ${durasiDowntime.seconds()} detik.`);
                // console.log durasiDowntime in seconds
                // console.log(durasiDowntime.asSeconds());
                let durasiUptime = moment.duration(waktuLastLog.diff(waktuLastUp));
                // console.log(`Durasi uptime: ${durasiUptime.hours()} jam, ${durasiUptime.minutes()} menit, ${durasiUptime.seconds()} detik.`);
                // console.log(durasiUptime.asSeconds());
                // set downtime
                client.rPush(`${app}:downtime:logDown:${id}`, lastSeen);
                let down = await client.ZSCORE(`${app}:downtime:durasi:${id}`, lastSeen.slice(0, 10));
                let downCount = down + durasiDowntime.asSeconds();
                client.ZINCRBY(`${app}:downtime:durasi:${id}`, downCount, lastSeen.slice(0, 10));
                client.hSet(`${app}:downtime:log:${id}`, lastSeen, `${durasiDowntime.hours()} jam, ${durasiDowntime.minutes()} menit, ${durasiDowntime.seconds()} detik.`)
                // set uptime
                client.rPush(`${app}:uptime:logUp:${id}`, datenow);
                let up = await client.ZSCORE(`${app}:uptime:durasi:${id}`, datenow.slice(0, 10));
                let upCount = up + durasiUptime.asSeconds();
                client.ZINCRBY(`${app}:uptime:durasi:${id}`, upCount, datenow.slice(0, 10));
                client.hSet(`${app}:uptime:log:${id}`, datenow, `${durasiUptime.hours()} jam, ${durasiUptime.minutes()} menit, ${durasiUptime.seconds()} detik.`)
            }
            client.hSet(`${app}:online:${id}`, {
                id: id,
                name: name,
                last_seen: datenow
            })
            client.expire(`${app}:online:${id}`, 20);
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