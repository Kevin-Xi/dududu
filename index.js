'use strict';
const config = require('./config');
const Framework = require('./framework');

let framework = Object.create(Framework);
let dududu = framework.inject(config.core || 'default');
dududu.start();
