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
        const server = net.createServer(onConnect);
        server.listen(this.core.system.port, () => {
            console.log(`server start with ${this.core.name}`);
        });
    },

    // internal
    core: {}
};

function onConnect() {

}

function getCore(coreName) {
    return {
        name: coreName,
        system: {
            port: 9922
        }
    };
}

module.exports = Framework;