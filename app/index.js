require('console-stamp')(console, {
    format: ':date(yyyy/mm/dd HH:MM:ss) :label'
});

if (!process.env.APP_ENV && process.env.APP_ENV !== "dev") {
    console["log"] = console["info"] = console["debug"] = console["warn"] = function () {
        return false;
    }
}

require('./ui');
const UserSettings = require('./settings/usersettings');
const SSHAgentServer = require('./ssh-agent/SSHAgentServer');
const globalEvents = require('./globalEvents');

globalEvents.on('usersettings.ready', function () {
    SSHAgentServer.setListenPath(UserSettings.get("agent.listen_path"));
    SSHAgentServer.start();
});
