'use strict';
const templates = require('./config').templates;
const utils = require('./utils');

function logDown(log) {
    let logStr = `At ${log.date}: ${JSON.stringify(log.content)}`;
    console.log(logStr);
}

function logger(input, placeholders) {
    let content = '';
    if (placeholders === undefined) {
        content = input;
    } else {
        content = utils.render(templates[input], placeholders);
    }

    let log = {
        date: new Date(),
        content: content
    };

    logDown(log);
}

module.exports = logger;    // signature should be (string, object) if want use template
