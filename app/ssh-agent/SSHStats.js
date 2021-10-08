'use strict';
const strftime = require('strftime');
const { sshvars, sshvars_reverse } = require('./ssh-agent-const');
const globalEvents = require('../globalEvents');

const SSHStats = new (function() {
    const self = this;
    let ssh_events = {};
    let ssh_keys = {};
    let eventTimerPublicKeys = false;
    let eventTimerSimple = false;

    this.reset = function () {
        ssh_events = {};
        ssh_keys = {};
    }

    this.add_ssh_event = function (message_type) {
        if (typeof message_type === "number") {
            message_type = message_type.toString();
        }
        if (!ssh_events.hasOwnProperty(message_type)) {
            ssh_events[message_type] = 1;
        } else {
            ssh_events[message_type]++;
        }
        if (eventTimerSimple) {
            clearTimeout(eventTimerSimple);
            eventTimerSimple = false;
        }
        eventTimerSimple = setTimeout(function () {
            globalEvents.emit("stats.events.updated");
        }, 1000);
        return true;
    }

    this.update_ssh_key = function (fingerprint, key_comment, bits) {
        const now = new Date();
        if (!ssh_keys.hasOwnProperty(fingerprint)) {
            ssh_keys[fingerprint] = {
                created_at: now,
                updated_at: now,
                bits: bits,
                comment: key_comment
            };
        } else {
            ssh_keys[fingerprint].updated_at = now;
        }

        if (eventTimerPublicKeys) {
            clearTimeout(eventTimerPublicKeys);
            eventTimerPublicKeys = false;
        }
        eventTimerPublicKeys = setTimeout(function () {
            globalEvents.emit("stats.keys.updated");
            eventTimerPublicKeys = false;
        }, 1000);

        return this;
    }

    this.getKeyCommentByFingerprint = function (fingerprint) {
        if (ssh_keys.hasOwnProperty(fingerprint)) {
            const selectedKey = ssh_keys[fingerprint];
            if (selectedKey.comment) {
                return selectedKey.comment;
            }
            return false;
        }
        return false;
    }

    this.getAll = function () {
        let responseObject = [];
        for (let ev_name in sshvars) {
            const ev_key = sshvars[ev_name];
            const ev_key_str = ev_key.toString();
            let myTrClass = "";

            const myCnt = (ssh_events.hasOwnProperty(ev_key_str) ? ssh_events[ev_key_str] : 0);
            if (myCnt > 0) {
                myTrClass = "text-success";
                if (ev_name.match(/SIGN/)) {
                    myTrClass = "text-warning";
                } else if (ev_name.match(/FAIL/)) {
                    myTrClass = "text-danger";
                }
            }
            responseObject.push({
                message_type_name: ev_name,
                message_type_key: ev_key_str,
                trClass: myTrClass,
                count: myCnt
            });
        }
        return responseObject;
    }

    this.getKeys = function () {
        let response = [];
        for (let fp in ssh_keys) {
            response.push({
                created_at: strftime('%Y-%m-%d %H:%M:%S', ssh_keys[fp].created_at),
                updated_at: strftime('%Y-%m-%d %H:%M:%S', ssh_keys[fp].updated_at),
                comment: ssh_keys[fp].comment,
                bits: ssh_keys[fp].bits,
                fingerprint: fp
            });
        }
        return response;
    }
})();

module.exports = SSHStats;
