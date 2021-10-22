# SSHAgentSecureProxy
Secure SSH Agent proxy for Linux and MacOS desktop environment.

![build](https://github.com/macskas/SSHAgentSecureProxy/actions/workflows/node.js.yml/badge.svg)

Description
-----------
If you are using ssh agent + agent forwarding to access servers, your ssh agent socket might be exposed to other superusers. This tools helps you secure your ssh-agent on a linux/macos desktop.

First I started using yubikey with ssh key, but the tooling on linux is just not there. If you are managing multiple servers using jump servers and loops it was just a pain. You dont know if the connection is stuck cos of the yubikey or its a real connection timeout. Yubikey(or any smartcard) + ssh is just not flexible atm.

### features:
- Mask keys in ssh-add -l output. (optional, recommended)
- Replaces your current running ssh agent (optional, can be changed in settings, recommended. Restores your original ssh-agent on exit.)
- Lock ssh agent based on idle time
- Desktop notifications with rate limiting
- hotkeys. (It wont always listed for keypress, only when its needed. defult: F3 to accept the last sign request, Ctrl+Shift+F3 to accept all pending sign requests)
- optional bypass for X seconds after a single manual approve
- manual bypass, block all ssh-agent request
- autoupdate from github

How to start?
-----------
### binary (appimage, dmg)
- Just download the latest appImage/dmg and run it. Should work on any linux/macos machine. The binary is built by github workflow. 
- Autoupdate supported.

### npm (if you already have npm, nodejs, etc installed it might be faster)
- Install nodejs, npm.
- Checkout git repo
- npm install
- npm compile-templates
- npm start


How to debug?
-----------
```
# export APP_ENV="dev"
# npm start
```

Screenshots
-----------
![Screenshot1](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/notification-with-ui.jpg "Screenshot1")
![Screenshot2](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/tray-menu-open.png "Screenshot2")
![Screenshot3](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/ssh-add-list-masked-keys.png "Screenshot3")
![Screenshot4](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/menu-stats.png "Screenshot4")
![Screenshot5](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/menu-settings.png "Screenshot5")
![Screenshot6](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/menu-logs.png "Screenshot6")
![Screenshot6](https://raw.githubusercontent.com/macskas/SSHAgentSecureProxy/master/.github/screenshots/menu-about.png "Screenshot6")
