const { Notification } = require('electron');
const UserSettings = require("../settings/usersettings");
const globalEvents = require('../globalEvents');

const myNotification = new (function () {
    let limit_bucket = [];

    this.show  = function (notification_title, notification_message, notification_image) {
        const notification_popup_enabled = UserSettings.get("notification.popup", false);
        const us_popup_limit = UserSettings.get("notification.popup_limit_count", 0);
        const us_popup_limit_interval = UserSettings.get("notification.popup_limit_interval", 0);
        if (!notification_popup_enabled)
            return false;
        let limit_throttle = false;
        let notifications_limited = false;
        let popup_limit = 0;
        let popup_limit_interval = 0;
        if (us_popup_limit && typeof us_popup_limit === "number" && us_popup_limit_interval && typeof us_popup_limit_interval === "number") {
            popup_limit_interval = parseInt(us_popup_limit_interval);
            popup_limit = parseInt(us_popup_limit);
            if (popup_limit_interval > 0 && popup_limit_interval < 3600 && popup_limit > 0 && popup_limit < 1000) {
                limit_throttle = true;
            }
        }
        if (limit_throttle) {
            const now = new Date().getTime()/1000;
            let expiredCount = 0;
            if (limit_bucket.length >= popup_limit) {
                for (let i=0; i<limit_bucket.length; i++) {
                    const ldiff = now - limit_bucket[i];
                    if (ldiff > popup_limit_interval) {
                        expiredCount++;
                    }
                }
                if (expiredCount) {
                    limit_bucket.splice(0, expiredCount);
                }
            }
            if (limit_bucket.length >= popup_limit) {
                notifications_limited = true;
            }
        }

        if (!notifications_limited) {
            const single_notification = new Notification({
                title: notification_title,
                body: notification_message,
                timeoutType: "default",
                silent: true,
                icon: notification_image
            });
            single_notification.on("click", function(event, arg) {
                globalEvents.emit("notification.click", event, arg);
            });
            single_notification.show();
            if (UserSettings.get("notification.popup_sound", 1) === 1) {
                globalEvents.emit("notification.play.newMessage");
            }

            if (limit_throttle) {
                limit_bucket.push(new Date().getTime()/1000);
            }
        }
    }
})();

module.exports = myNotification;
