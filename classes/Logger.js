const colors = require('colors');
const prefix = '[Judy]';

module.exports = class Logger {

    info(message) {
        this.log(message, 'yellow');
    }

    success(message) {
        this.log(message, 'green');
    }

    error(message) {
        this.log(message, 'red');
    }

    debug(message) {
        this.log(message, 'white');
    }

    log(message, color) {
        console.log(`${prefix.bold} ${color ? colors[color](message) : message}`);
    }
}
