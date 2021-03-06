require('colors');
const debug = require('debug')('node-app-hive');
const Binder = require('./binder');

module.exports = {
    bind: bind
};


// FUNCTIONS:

function bind(hiveName, hiveConfig) {
    debug(`Created new Binder for hive: '${hiveName}'!`);
    return new Binder(hiveName, hiveConfig);
}
