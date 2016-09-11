'use strict';
// TODO: use traditional way or ?
let Framework = {
    inject: function (coreName) {
        console.log(`framework inject ${coreName}`);
        // checkCore();
        this.coreName = coreName;
        return this;
    },

    start: function () { console.log(`server start with ${this.coreName}`); },

    // internal
    coreName: '',
    checkCore: (coreName) => {

    }
};

module.exports = Framework;