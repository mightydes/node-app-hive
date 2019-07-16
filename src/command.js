const net = require('net');
const debug = require('debug')('nodeAppHive:command');

class Command {

    constructor(util) {
        this.util = util;
        this.priv = util.getPrivate();
    }

    /**
     * @returns {Server}
     */
    createServer() {
        const socketFilePath = this.util.prepSocket(this.util.getCommandSocket());
        const server = net.createServer();
        server.listen(socketFilePath);
        this.util.log(`Created command server:`, socketFilePath);
        return server;
    }

    /**
     * @param {String} command
     * @returns {Promise}
     */
    emit(command) {
        const debugTask = `emit(${command})`;
        let result = '-no emit result-';
        return new Promise((resolve, reject) => {
            this.util.log(`Emitting command:`, command);

            const socket = new net.Socket();
            socket.setTimeout(this.priv.command_emit_ttl);

            // On connect:
            socket.on('connect', () => socket.write(command));

            // On response received:
            socket.on('data', (data) => {
                result = data.toString().trim();
                debug(debugTask, `Response length: ${result.length}`);
                socket.end();
            });

            // On timeout:
            socket.on('timeout', () => reject('Command socket timed out!'));

            // On error:
            socket.on('error', (e) => reject(e));

            // On exit:
            socket.on('close', () => {
                debug(debugTask, `Closed emitter socket...`);
                resolve(result);
            });

            socket.connect(this.util.getCommandSocket());
        });
    }

}

Command.__injectOptions = ['asProvider', (di) => new Command(di.util())];

module.exports = Command;