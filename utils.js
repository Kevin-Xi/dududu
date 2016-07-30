'use strict';

function randomString(n) {
    let result = '';
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    let i = 0;
    while (i < n) {
        let index = Math.floor(Math.random() * alphabet.length);
        result += alphabet[index];
        i++;
    }

    return result;
}

function render(template, placeholders) {
    var result = template;
    for (var k in placeholders) {
        var regex = new RegExp('\\${' + k + '}', 'g');
        result = result.replace(regex, placeholders[k]);
    }
    return result;
}

module.exports = {
    randomString: randomString,
    render: render
};
