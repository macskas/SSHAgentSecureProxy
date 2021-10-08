const EventEmitter = require('events');

let globalEmitterClass = function () {};
globalEmitterClass.prototype = EventEmitter.prototype;

const globalEmitter = new globalEmitterClass();

module.exports = globalEmitter;
