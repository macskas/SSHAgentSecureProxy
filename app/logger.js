'use strict';

const Denque = require('denque');
const strftime = require('strftime');

const myLogger = new (function () {
    const fifo = new Denque();
    let maxLength = 1000;

    this.setMaxLength = function (mlen) {
        if (!mlen)
            return false;
        if (typeof mlen !== 'number')
            return false;
        if (mlen<0 || mlen>1000000)
            return false;
        if (maxLength !== mlen) {
            maxLength = mlen;
            if (fifo.length >= maxLength) {
                this.reset();
            }
            return true;
        }
        return false;
    }

    this.reset = function () {
        fifo.clear();
        return true;
    }

    this.add = function (level, message) {
        const now_string = strftime('%Y-%m-%d %H:%M:%S');
        const now = new Date();

        fifo.push({ level: level, message: message, created_at: now_string, created_at_date: now });
        if (fifo.length > maxLength) {
            fifo.shift();
        }
        if (console.hasOwnProperty(level)) {
            console[level](message);
        } else {
            console.log(level, message);
        }
    }

    this.getAll = function () {
        return fifo.toArray();
    }
})();

module.exports = myLogger;