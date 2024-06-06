const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const uuid = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {};

wss.on('connection', (ws) => {
    ws.id = uuid.v4();

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        
        switch (msg.type) {
            case 'login':
                users[ws.id] = { username: msg.username, ws };
                ws.send(JSON.stringify({ type: 'login', success: true, userId: ws.id }));
                broadcast({ type: 'userList', users: getUserList() });
                break;
            
            case 'message':
                broadcast({ type: 'message', userId: ws.id, username: users[ws.id].username, text: msg.text });
                break;
        }
    });

    ws.on('close', () => {
        delete users[ws.id];
        broadcast({ type: 'userList', users: getUserList() });
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function getUserList() {
    return Object.values(users).map(user => user.username);
}

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
