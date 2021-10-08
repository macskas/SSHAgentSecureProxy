'use strict'

window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap')
window.Tether = require('tether')
require('bootstrap4-notify');
window.Handlebars = require('handlebars/runtime');
require('./tpl/compiled.js');

const { ipcRenderer } = require('electron');

const myView = new (function () {
    const self = this;
    let SSHAgentRunning = false;
    let settings = {};
    let stats = [];
    let public_keys = [];
    let public_keys_map = {};
    let pending_requests = [];
    let renderedMenu = false;

    let logsInterval = false;

    let about = {
        currentVersion: '-',
        update_available: false,
        downloaded: false,
        lastChecked: false,
        updateVersion: false,
        releaseDate: "",
        releaseSize: 0,
        releaseSizeMB: "0 MB",
        state: "-"
    };

    this.updateSSHAgentRunning = function (state) {
        SSHAgentRunning = state;
        const jStart = $(".btn-agent-start");
        const jStop = $(".btn-agent-stop");
        jStart.removeAttr("disabled");
        jStop.removeAttr("disabled");
        if (state) {
            $(".ssh-agent-state").html("started");
            jStart.attr("disabled", "disabled");
        } else {
            $(".ssh-agent-state").html("stopped");
            jStop.attr("disabled", "disabled");
        }
        return this;
    }

    this.updatePublicKeys = function (pkey_list) {
        public_keys = pkey_list;
        let rebuildPR = false;
        for (let i=0; i<public_keys.length; i++) {
            if (!public_keys_map.hasOwnProperty(public_keys[i].fingerprint)) {
                rebuildPR = true;
            }
            public_keys_map[public_keys[i].fingerprint] = public_keys[i].comment;
        }
        self.renderModels.dashboard_publickeys();
        if (rebuildPR) {
            this.rebuildPendingRequests();
        }
        return this;
    }

    this.rebuildPendingRequests = function () {
        let changed = false;
        for (let i = 0; i < pending_requests.length; i++) {
            const curPR = pending_requests[i];
            if (curPR.key_comment === "-") {
                if (public_keys_map.hasOwnProperty(curPR.key_fingerprint)) {
                    changed = true;
                    pending_requests[i].key_comment = public_keys_map[curPR.key_fingerprint];
                }
            }
        }
        if (changed) {
            self.renderModels.dashboard_pendingrequests();
        }
    }

    this.updatePendingRequests = function (preqs) {
        pending_requests = [];
        for (let i=0; i<preqs.length; i++) {
            const lKeyFingerprint = preqs[i].info.fingerprint;
            const lUserName = preqs[i].info.username;

            pending_requests.push({
                client_id: preqs[i].client_id,
                created_at: preqs[i].created_at,
                key_fingerprint: lKeyFingerprint,
                remote_username: (lUserName ? lUserName : "-"),
                key_comment: (public_keys_map.hasOwnProperty(lKeyFingerprint) ? public_keys_map[lKeyFingerprint] : "-")
            });

        }
        self.renderModels.dashboard_pendingrequests();
        return this;
    }

    this.updateStats = function (input_stats) {
        stats = input_stats;
        if (renderedMenu === "stats") {
            self.renderModels.stats();
        }
        return this;
    }

    this.updateSettings = function (input_settings) {
        settings = input_settings;
        return this;
    }

    this.updateRemoteAgentStatus = function (rPath, agentState, extra) {
        let statusText = "";
        if (agentState) {
            statusText = "OK";
            let keys_found = 0;
            if (extra && extra.length) {
                keys_found = extra.length;
            }
            this.notify("success", `(${rPath}) OK (keys: ${keys_found})`);
        } else {
            statusText = "error";
            this.notify("danger", `(${rPath}) ERROR(${extra})`);
        }

        if (renderedMenu === "settings") {
            $(".ssh-remote-agent-state").html(statusText);
        }
    }

    this.render = function (menuItem) {
        $(".nav-item").removeClass("active");
        $(`.nav-link[data-item="${menuItem}"]`).parent().addClass("active");

        if (logsInterval) {
            clearInterval(logsInterval);
            logsInterval = false;
        }

        if (renderedMenu) {
            $("#main-wrapper").html("");
        }

        switch (menuItem) {
            case 'settings':
                ipcRenderer.send("settings.request");
                break;
            case 'stats':
                ipcRenderer.send("stats.request");
                break;
            case 'logs':
                ipcRenderer.send("logs.request");
                break;
            case 'dashboard':
                self.renderModels.dashboard();
                break;
            case 'about':
                self.renderModels.about();
                break;
            default:
                menuItem = "dashboard";
                self.renderModels.dashboard();
                break;
        }
        renderedMenu = menuItem;
    }

    this.notify = function(type, message) {
        $.notify(message, {
            type: type,
            placements: {
                from: "top",
                align: "right"
            },
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            newest_on_top: false,
            spacing: 0,
            delay: 100,
            timer: 2000,
            width: '400px',
        });
    }

    this.renderModels = {
        about: function () {
            const myTemplate = Handlebars.templates["about.hbs"];
            $("#main-wrapper").html(myTemplate({ about: about }));

            $(".btn-check-for-updates").click(function (e) {
                self.uiEvents.checkForUpdatesClicked(e);
            });

            $(".btn-download-update").click(function (e) {
                self.uiEvents.downloadUpdateClicked(e);
            });

            $(".btn-upgrade").click(function (e) {
                self.uiEvents.upgradeClicked(e);
            });
        },
        settings: function () {
            const myTemplate = Handlebars.templates["settings.hbs"];
            let categories = [];
            let keys_by_category = {};
            for (let k in settings) {
                if (settings[k].internal)
                    continue;
                const lCategory = settings[k].category;
                if (categories.indexOf(lCategory) === -1) {
                    categories.push(lCategory);
                    keys_by_category[lCategory] = {};
                }
                keys_by_category[lCategory][k] = settings[k];
            }
            $("#main-wrapper").html(myTemplate({ categories: categories, keys: keys_by_category, ssh_agent_state: SSHAgentRunning }));

            $(".btn-custom-save").click(function (e) {
                self.uiEvents.saveClicked(e);
            });

            $(".btn-agent-start").click(function (e) {
                self.uiEvents.agentStartClicked(e);
            });

            $(".btn-agent-stop").click(function (e) {
                self.uiEvents.agentStopClicked(e);
            });

            $(".btn-remote-agent-test").click(function (e) {
                self.uiEvents.remoteAgentTest(e);
            });
        },
        stats: function () {
            const myTemplate = Handlebars.templates["stats.hbs"];
            $("#main-wrapper").html(myTemplate({ stats: stats }));
        },
        logs: function (input_logs) {
            const myTemplate = Handlebars.templates["logs.hbs"];
            $("#main-wrapper").html(myTemplate({ logs: input_logs }));
            if (logsInterval) {
                clearInterval(logsInterval);
                logsInterval = false;
            }
            logsInterval = window.setInterval(function () {
                ipcRenderer.send("logs.request");
            }, 3000);
        },
        dashboard: function () {
            const myTemplate = Handlebars.templates["dashboard.hbs"];
            $("#main-wrapper").html(myTemplate({}));
            ipcRenderer.send("stats.keys.request");
            ipcRenderer.send("pendingRequests.request");
            ipcRenderer.send("dashboard.controls.request");
        },
        dashboard_publickeys: function () {
            const myTemplate = Handlebars.templates["dashboard-publickeys.hbs"];
            $("#publickeys-wrapper").html(myTemplate({ public_keys: public_keys }));
        },
        dashboard_pendingrequests: function () {
            const myTemplate = Handlebars.templates["dashboard-pendingrequests.hbs"];
            $("#pending-requests-wrapper").html(myTemplate({  pending_requests: pending_requests }));
            $(".btn-pendingrequests-accept").click(function (e) {
                self.uiEvents.pendingRequestAcceptClicked(e);
            });
            $(".btn-pendingrequests-deny").click(function (e) {
                self.uiEvents.pendingRequestDenyClicked(e);
            });
            $(".btn-pendingrequests-acceptall").click(function (e) {
                self.uiEvents.pendingRequestAcceptAllClicked(e);
            });
            $(".btn-pendingrequests-denyall").click(function (e) {
                self.uiEvents.pendingRequestDenyAllClicked(e);
            });
        },
        dashboard_controls: function (modes, accept_seconds_settings) {
            let accept_seconds = [];
            let button_active = "";
            if (accept_seconds_settings && typeof accept_seconds_settings === "string") {
                const tmp_accept_seconds = accept_seconds_settings.split(/\s+/);
                for (let i=0; i<tmp_accept_seconds.length; i++) {
                    accept_seconds.push(parseInt(tmp_accept_seconds[i]));
                }
            }
            const manual_ssh_mode = modes.manual_ssh_mode;
            const bypass_seconds = modes.temp_bypass_seconds;
            if (manual_ssh_mode === "bypass-temp") {
                button_active = "bypass-temp-"+bypass_seconds.toString();
            } else if (manual_ssh_mode === false) {
                button_active = "default";
            } else {
                button_active = manual_ssh_mode;
            }

            const myTemplate = Handlebars.templates["dashboard-controls.hbs"];
            $("#controls-wrapper").html(myTemplate({ accept_seconds: accept_seconds }));

            $(".btn-dashboard-control[data-mode='"+button_active+"']").attr("disabled", "disabled");
            $(".btn-dashboard-control").click(function (e) {
                self.uiEvents.dashboardControlClicked(e);
            });
        }
    }


    this.uiEvents = {
        menuClicked: function (e) {
            e.preventDefault();
            const jtarget = $(e.currentTarget);
            const menuName = jtarget.attr("data-item");
            self.render(menuName);
        },
        agentStartClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("ssh-agent.start");
        },
        agentStopClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("ssh-agent.stop");
        },
        checkForUpdatesClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("about.check-for-updates");
        },
        downloadUpdateClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("about.download-update");
        },
        upgradeClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("about.upgrade");
        },
        remoteAgentTest: function (e) {
            e.preventDefault();
            const currentValue = $("INPUT[name='agent.remote_path']").val();
            ipcRenderer.send("remote-agent.test", currentValue);
        },
        pendingRequestAcceptClicked: function (e) {
            e.preventDefault();
            const jtarget = $(e.currentTarget);
            const client_id = jtarget.attr("data-client-id");
            ipcRenderer.send("pendingRequests.accept", client_id);
        },
        pendingRequestDenyClicked: function (e) {
            e.preventDefault();
            const jtarget = $(e.currentTarget);
            const client_id = jtarget.attr("data-client-id");
            ipcRenderer.send("pendingRequests.deny", client_id);
        },
        pendingRequestAcceptAllClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("pendingRequests.accept.all");
        },
        pendingRequestDenyAllClicked: function (e) {
            e.preventDefault();
            ipcRenderer.send("pendingRequests.deny.all");
        },
        dashboardControlClicked: function (e) {
            e.preventDefault();
            const jtarget = $(e.currentTarget);
            const data_mode = jtarget.attr("data-mode");
            const m = data_mode.match(/^bypass-temp-([0-9]+)$/);

            let manual_mode = false;
            let extra = false;
            if (m) {
                manual_mode = "bypass-temp";
                extra = parseInt(m[1]);
            } else {
                manual_mode = data_mode;
            }
            ipcRenderer.send("dashboard.controls.mode.change", manual_mode, extra);

        },
        saveClicked: function (e) {
            e.preventDefault();
            let tmpSaveData = {};
            let sendSaveData = [];
            const jform = $("#main-wrapper .form-settings");
            const jinputs = $("INPUT", jform);
            const jselects = $("SELECT", jform);
            for (let i=0; i<jinputs.length; i++) {
                const curInput = jinputs.eq(i);
                const curVal = curInput.val();
                const curKey = curInput.attr("name");
                tmpSaveData[curKey] = curVal;
            }
            for (let i=0; i<jselects.length; i++) {
                const curInput = jselects.eq(i);
                const curVal = curInput.val();
                const curKey = curInput.attr("name");
                tmpSaveData[curKey] = curVal;
            }

            for (let curKey in tmpSaveData) {
                if (!settings.hasOwnProperty(curKey)) {
                    continue;
                }
                let old_value;
                const dtype = settings[curKey].type;
                if (settings[curKey].hasOwnProperty("value")) {
                    old_value = settings[curKey].value;
                } else {
                    old_value = settings[curKey].default;
                }
                let new_value = tmpSaveData[curKey];
                let restore_default = false;
                if (new_value === "") {
                    new_value = settings[curKey].default;
                    restore_default = true;
                }
                else if (settings[curKey].type === "number") {
                    new_value = parseInt(new_value);
                }
                else if (settings[curKey].type === "boolean") {
                    new_value = parseInt(new_value) ? 1 : 0;
                }

                if (new_value !== old_value) {
                    sendSaveData.push({
                        key: curKey,
                        old: old_value,
                        new: new_value,
                        restore_default: restore_default
                    });
                }
            }
            if (sendSaveData.length) {
                ipcRenderer.send("settings.save.request", sendSaveData);
            }
        }
    }

    const registerEvents = function () {
        ipcRenderer.on("settings.saved", function (event) {
            console.log("ipcRenderer::settings.saved");
            if (renderedMenu === "settings") {
                self.notify("success", "Configuration saved.");
            }
        });

        ipcRenderer.on("ssh-agent.state.response", function (event, isRunning) {
            console.log("ipcRenderer::ssh-agent.state.response", isRunning);
            self.updateSSHAgentRunning(isRunning);
        });

        ipcRenderer.on("settings.update", function (event, mySettings) {
            console.log("ipcRenderer::settings.update");
            self.updateSettings(mySettings);
        });

        ipcRenderer.on("stats.update", function (event, myStats) {
            console.log("ipcRenderer::stats.update");
            self.updateStats(myStats);
        });

        ipcRenderer.on("logs.response", function (event, myLogs) {
            console.log("ipcRenderer::logs.response");
            self.renderModels.logs(myLogs);
        });

        ipcRenderer.on("settings.response", function (event, mySettings) {
            console.log("ipcRenderer::settings.response");
            self.updateSettings(mySettings);
            self.renderModels.settings();
        });

        ipcRenderer.on("settings.save.response", function (event, rlist) {
            console.log("ipcRenderer::settings.save.response");
            const jform = $("#main-wrapper .form-settings");
            $(".feedback", jform).removeClass("valid-feedback").removeClass("invalid-feedback").html("");
            $("INPUT", jform).removeClass("is-valid").removeClass("is-invalid");
            $("SELECT", jform).removeClass("is-valid").removeClass("is-invalid");
            let isFocused = false;

            for (let i=0; i<rlist.length; i++) {
                let curdata = rlist[i];
                let form_input = $('[name="' + curdata.key + '"]');
                if (!form_input)
                    continue;

                const jfeedback = form_input.next();
                jfeedback.removeClass("valid-feedback").removeClass("invalid-feedback");
                form_input.remove("is-valid").remove("is-invalid");

                if (!isFocused) {
                    isFocused = true;
                    form_input.focus();
                }
                if (curdata.ret[0] === 1) {
                    form_input.addClass("is-valid");
                } else if (curdata.ret[0] === 0) {
                    form_input.addClass("is-invalid");
                    jfeedback.addClass("invalid-feedback").html(curdata.ret[1]);
                } else if (curdata.ret[0] === 2) {
                    form_input.addClass("is-valid");
                    jfeedback.addClass("valid-feedback").html(curdata.ret[1]);
                }
            }
        });

        ipcRenderer.on("pendingRequests.response", function (event, reqs) {
            console.log("ipcRenderer::pendingRequests.response");
            //console.log(reqs);
            self.updatePendingRequests(reqs);
        });


        ipcRenderer.on("stats.keys.response", function (event, pkeys) {
            console.log("ipcRenderer::stats.keys.response");
            self.updatePublicKeys(pkeys);
        });

        ipcRenderer.on("dashboard.controls.response", function (event, sshmode, accept_seconds) {
            console.log("ipcRenderer::dashboard.controls.response");
            self.renderModels.dashboard_controls(sshmode, accept_seconds);
        });

        ipcRenderer.on("renderMenu", function (event, menuName) {
            self.render(menuName);
        });

        ipcRenderer.on("remote-agent.test.response", function (event, arg1, arg2, arg3) {
            console.log("ipcRenderer::remote-agent.test.response");
            self.updateRemoteAgentStatus(arg1, arg2, arg3);
        });

        ipcRenderer.on("play.newMessage", function (event) {
            $("#audio-newMessage")[0].play();
        });

        ipcRenderer.on("about.update", function (event, subEventName, arg1) {
            switch (subEventName) {
                case 'error':
                    const jfeedback = $("#update-feedback");
                    jfeedback.html("Error: " + Handlebars.escapeExpression(arg1));
                    jfeedback.addClass("text-danger");
                    if (about.update_available === false) {
                        $(".btn-check-for-updates").removeAttr("disabled");
                    }
                    break;
                case 'download-progress':
                    const downloadInfo = arg1;
                    about.state = "downloading";
                    const str_pcnt = downloadInfo.percent.toFixed(0).toString();
                    $("#download-progress").removeClass("fade");
                    $(".progress-bar").css({ width: str_pcnt + "%" });
                    const kbPSString = (downloadInfo.bytesPerSecond / 1024).toFixed(0).toString() + " kB/s";
                    $("#download-progress-text").html(`${str_pcnt}% (${kbPSString})`);
                    break;
                case 'update-downloaded':
                    //+.downloadedFile
                    about.state = "downloaded, upgrade ready.";
                    about.downloaded = true;
                    self.renderModels.about();
                    break;
                case 'update-not-available':
                case 'update-available':
                    const versionAvailable = arg1;
                    about.lastChecked = new Date();

                    if (subEventName === "update-not-available") {
                        about.update_available = false;
                        about.state = "Update not available. You are probably up2date";
                    } else {
                        about.state = "update available";
                    }
                    if (versionAvailable) {
                        let filesMap = {};
                        about.releaseDate = versionAvailable.releaseDate || "-";
                        about.updateVersion = versionAvailable.version || "-";
                        if (versionAvailable.files && versionAvailable.files.length) {
                            for (let i = 0; i < versionAvailable.files.length; i++) {
                                const curFile = versionAvailable.files[i];
                                if (curFile.url) {
                                    filesMap[curFile.url] = curFile;
                                }
                                if (curFile.sha512) {
                                    filesMap[curFile.sha512] = curFile;
                                }
                            }
                        }
                        if (versionAvailable.sha512 && filesMap.hasOwnProperty(versionAvailable.sha512)) {
                            about.releaseSize = filesMap[versionAvailable.sha512].size;
                        } else if (versionAvailable.path && filesMap.hasOwnProperty(versionAvailable.path)) {
                            about.releaseSize = filesMap[versionAvailable.path].size;
                        }
                        about.releaseSizeMB = (about.releaseSize / 1024 / 1024).toFixed(1).toString() + " MB";
                        if (about.releaseSize) {
                            if (subEventName === "update-availble") {
                                about.update_available = true;
                            }
                        }
                    }
                    self.renderModels.about();
                    break;
                case 'checking-for-update':
                    about.state = "checking for update";
                    about.update_available = false;
                    $(".btn-check-for-updates").attr("disabled", "disabled");
                    break;
            }
        });

        ipcRenderer.on("about.version", function (event, cver) {
            about.currentVersion = cver;
        });

        $(".nav-link").click(function (e) {
            self.uiEvents.menuClicked.call(self, e);
        });
    }

    const _handlebarHelpers = function () {
        Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper("booleanMatch", function (arg1, options) {
            let matchVal = arg1;
            if (typeof matchVal !== "number") {
                matchVal = parseInt(matchVal);
            }
            if (this.hasOwnProperty("value")) {
                if (this.value === matchVal) {
                    return options.fn(this);
                }
            } else {
                if (this.default === matchVal) {
                    return options.fn(this);
                }
            }
        });

        Handlebars.registerHelper('switch', function(value, options) {
            this.switch_value = value;
            this.matched = false;
            return options.fn(this);
        });

        Handlebars.registerHelper('case', function(value, options) {
            if (value === this.switch_value) {
                this.matched = true;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('default', function(value, options) {
            if (!this.matched) {
                return options.fn(this);
            }
        });
    }
    const _init = function () {
        _handlebarHelpers();
        registerEvents();
    }

    _init();
})();

window.$(window.document).ready(function () {
    myView.render("dashboard");
});
