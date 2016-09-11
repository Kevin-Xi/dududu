'use strict';
const config = require('./config');
const Framework = require('./framework');

let dududu = Object.create(Framework);
dududu.inject(config.core || 'default').start();
