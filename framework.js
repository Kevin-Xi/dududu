'use strict';

let Framework = {
    inject: (coreName) => {
        console.log(`inject ${coreName}`);
        // checkCore();
        let dududu = Object.create(Server);
        dududu.init();
        return dududu;
    },
};

let Server = {
    init: () => {},
    start: () => { console.log(`start`); }
};

module.exports = Framework;