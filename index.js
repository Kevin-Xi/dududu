'use strict';
const net = require('net');

const logger = require('./logger');
const utils = require('./utils');

const config = require('./config');
const templates = config.templates;

const server = net.createServer(onConnect);

let peers = {};
let peerCount = 0;

let helpContent = (function () {
    let actions = config.actions;
    let commands = config.commands;

    let helpContent = '';
    
    helpContent += `${config.serverName} > Here comes available things:\n`;

    helpContent += 'Actions: start by \'/\'\n';
    for (let actionName in actions) {
        helpContent += `\t${actionName}: ${actions[actionName]}\n`;
    }

    helpContent += 'Commands: start by \':\'\n';
    for (let commandName in commands) {
        helpContent += `\t${commandName}: ${commands[commandName]}\n`;
    }

    helpContent += 'Have fun!\n';

    return helpContent;
})();

server.listen(config.port, () => {
    logger('sListen', { port: config.port });
});

function onConnect(c) {
    let remoteAddr = { ip: c.remoteAddress, port: c.remotePort };
    logger('cConnect', remoteAddr);

    let id = initPeer(c);
    welcome(id);
    
    c.on('data', onData);
    c.once('close', onClose);
    c.on('error', onError);

    function onData(data) {
        responseToData(id, data);
    }

    function onClose() {
        logger('cClose', remoteAddr);
        // TODO buggy, still send
        // should understand socket ending step and its events
        // to find a good time to destroy socket.
        broadcast('system', { id: id, template: '!offline' });
        removeFromPeers(id);
    }

    function onError(err) {
        logger(`${err.message} ${err.stack}`);
    }
}

function initPeer(c) {
    let id = peerCount++;
    peers[id] = { c: c, name: utils.randomString(6) };
    c.setEncoding('utf8');

    return id;
}

function welcome(id) {
    let peer = peers[id];
    let c = peer.c;
    let name = peer.name;

    broadcast('system', { id: id, template: '!online' });
    c.write(utils.render(templates['!Welcome'], {
        serverName: config.serverName,
        clientName: name
    }));
}

function responseToData(id, data) {
    data = data.trim();
    switch (data[0]) {
        case '/':
            actionResponse(id, data);
            break;
        case ':':
            commandResponse(id, data);
            break;
        default:
            broadcast('common', { id: id, data: data });
            break;
    }
}

function actionResponse(id, data) {
    let action = data.split(' ')[0];
    switch (action) {
        case '/rest':
        case '/nod':
        case '/smile':
        case '/blink':
        case '/afk':
            broadcast('action', {
                id: id,
                template: action
            });
            break;
        case '/me':
            broadcast('action', {
                id: id,
                template: action,
                act: { act: data.slice(data.indexOf(' ')) }
            });
            break;
        default:
            broadcast('common', { id: id, data: data });
            break;
    }
}

function commandResponse(id, data) {
    // TODO send ! when change name
    let inputs = data.split(' ');
    let command = inputs[0];
    switch (command) {
        case ':help':
        case ':h':
            showHelp(id);
            break;
        case ':nick':
            setNick(id, inputs[1]);
            break;
        case ':roster':
        case ':namelist':
        case ':nl':
        case ':meibo':
            showRoster(id);
            break;
        case ':to':
        case ':whisper':
            whisper(id, inputs[1], inputs.slice(2).join(' '));
            break;
        case ':quit':
        case ':exit':
        case ':bye':
            farewell(id);
            break;
        default:
            broadcast('common', { id: id, data: data });
            break;
    }
}

function broadcast(msgType, data) {
    let id = data.id;
    let name = peers[id].name;

    let output = '';

    switch (msgType) {
        case 'system':
            output = utils.render(templates[data.template],
                    { clientName: name, serverName: config.serverName });
            break;
        case 'action':
            let placeholders = { name: name };
            if (data.act) placeholders = Object.assign(placeholders, data.act);
            output = utils.render(templates[data.template], placeholders);
            break;
        case 'common':
            output = utils.render(templates["-common"], 
                    { name: name, data: data.data });
            break;
        default:
            break;
    }

    for (let i in peers) {
        let c = peers[i].c;
        c.write(output);
    }
}

function removeFromPeers(id) {
    delete peers[id];
    peerCount--;
}

function showHelp(id) {
    let c = peers[id].c;
    c.write(helpContent);
}

function showRoster(id) {
    let roster = [];
    for (let id in peers) {
        roster.push(`${id}: ${peers[id].name}`);
    }

    let rosterContent = `${config.serverName} > dududu-ers online:\n${roster.join('\n')}\nHave a nice chat with them!\n`;

    let c = peers[id].c;
    c.write(rosterContent);
}

function whisper(senderId, receiverId, msg) {
    if (!receiverId || !msg) {
        showHelp(senderId);
        return;
    }
    let sender = peers[senderId];
    let receiver = peers[receiverId];
    if (!receiver) {
        sender.c.write(utils.render(templates['!receiverNotExist'], { serverName: config.serverName, receiverId: receiverId  }));
        return;
    }

    let whisperContent = utils.render(templates['!whisper'], { senderName: sender.name, receiverName: receiver.name, msg: msg });
    sender.c.write(whisperContent);
    if (senderId != receiverId) {
        receiver.c.write(whisperContent);
    }
}

function farewell(id) {
    broadcast('system', { id: id, template: ':farewell' });
    
    let c = peers[id].c;
    c.destroy();
    // Not remove here, the event 'close' will be triggered and 
    // do the work
    // removeFromPeers(id);
}
