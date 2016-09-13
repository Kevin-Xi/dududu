'use strict';
const net = require('net');
const socket = net.Socket;

// TODO: use traditional way or ?
let Framework = {
    inject: function (coreName) {
        this.core = getCore(coreName);
        console.log(`framework inject ${coreName}`);
        return this;
    },

    start: function () {
        const server = net.createServer(this.onConnect);
        server.listen(this.core.system.port, () => {
            console.log(`server start with ${this.core.name}`);
        });
    },

    // internal
    core: {},
    onConnect: function () {
        let id = 0;

        c.on('data', onData);
        // c.once('close', onClose);
        // c.on('error', onError);

        function onData(data) {
            this.responseToData(id, data);
        }
    },

    responseToDate: function (id, data) {
        let actionHandler = this.core.action[data] || noop;
        actionHandler(id, data);
    }
};

function getCore(coreName) {
    return require(`./cores/${coreName}`);
}

module.exports = Framework;