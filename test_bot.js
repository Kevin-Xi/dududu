'use strict';

const net = require('net');
const logger = require('./logger');

const bot = net.connect({ port: process.argv[2] }, onConnect);

function onConnect() {
    // TODO fake
    bot.write(':setContentType json');
    // bot.write(':nick bot');
    bot.write('Hi, I\'m a test bot!');
    
    bot.on('data', (data) => {
        let dataInJson = {};
        try {
            // dataInJson = JSON.parse(data);
            // TODO fake
            dataInJson.msg = data.toString();
        } catch (err) {
            logger(`${err.message} ${err.stack}`);
        }

        if (dataInJson.msg.match(/\W+bot\W+/)) {
            bot.write('You mean me?');
        }
    });

    bot.on('close', () => {
        bot.write('I\'m back to charge. Byebye!');
    });

    bot.on('error', (err) => {
        // TODO just reuse the same logger
        logger(`${err.message} ${err.stack}`);
    });
}
