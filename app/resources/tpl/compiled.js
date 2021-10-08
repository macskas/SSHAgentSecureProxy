var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['about.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <table class=\"table table-sm table-bordered table-hover table-striped\">\n        <tr><th>last checked</th><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"lastChecked") : stack1), depth0))
    + "</td></tr>\n        <tr><th>release version</th><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"updateVersion") : stack1), depth0))
    + "</td></tr>\n        <tr><th>release date</th><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"releaseDate") : stack1), depth0))
    + "</td></tr>\n        <tr><th>release size</th><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"releaseSizeMB") : stack1), depth0))
    + "</td></tr>\n        <tr><th>download.state</th><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"state") : stack1), depth0))
    + "</td></tr>\n    </table>\n    <div class=\"row\">\n        <div class=\"col-sm-10\">\n            <div class=\"progress fade\" id=\"download-progress\">\n                <div class=\"progress-bar\" style=\"width: 0;\"></div>\n            </div>\n        </div>\n        <div class=\"col-sm-2\">\n            <div class=\"text-center text-muted small\" id=\"download-progress-text\"></div>\n        </div>\n    </div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    <span class=\"text-muted\">-</span>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "disabled=\"disabled\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div id=\"about-version-wrapper\" class=\"p-3\">\n    <p>Current version: <span class=\"text-muted\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"currentVersion") : stack1), depth0))
    + "</span></p>\n    <p>Available version:\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"lastChecked") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":24,"column":11}}})) != null ? stack1 : "")
    + "    </p>\n    <div class=\"row\">\n        <div class=\"col-sm-1\"></div>\n        <button class=\"btn btn-primary btn-check-for-updates btn-sm col-sm-3 m-1\">Check for updates</button>\n        <button class=\"btn btn-success btn-download-update btn-sm col-sm-3 m-1\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"update_available") : stack1),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":80},"end":{"line":29,"column":144}}})) != null ? stack1 : "")
    + ">Download update</button>\n        <button class=\"btn btn-danger btn-upgrade btn-sm col-sm-3 m-1\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"about") : depth0)) != null ? lookupProperty(stack1,"downloaded") : stack1),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":71},"end":{"line":30,"column":129}}})) != null ? stack1 : "")
    + ">Upgrade</button>\n        <div class=\"col-sm-1\"></div>\n    </div>\n    <div id=\"update-feedback\"></div>\n</div>\n";
},"useData":true});
templates['dashboard-controls.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <p>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"accept_seconds") : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":8},"end":{"line":12,"column":17}}})) != null ? stack1 : "")
    + "    </p>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        <button class=\"btn btn-sm btn-success btn-dashboard-control\" data-mode=\"bypass-temp-"
    + alias2(alias1(depth0, depth0))
    + "\">bypass: "
    + alias2(alias1(depth0, depth0))
    + "s</button>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <h5>controls</h5>\n    <p>\n        <button class=\"btn btn-sm btn-primary btn-dashboard-control\" data-mode=\"default\">mode: default</button>\n        <button class=\"btn btn-sm btn-success btn-dashboard-control\" data-mode=\"bypass\">mode: bypass</button>\n        <button class=\"btn btn-sm btn-danger btn-dashboard-control\" data-mode=\"blocked\">mode: block</button>\n    </p>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"accept_seconds") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":14,"column":11}}})) != null ? stack1 : "");
},"useData":true});
templates['dashboard-pendingrequests.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\n            <td><nobr>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"created_at") : depth0), depth0))
    + "</nobr></td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"key_fingerprint") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"key_comment") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"remote_username") : depth0), depth0))
    + "</td>\n            <td><button class=\"btn btn-sm btn-block btn-success btn-pendingrequests-accept\" data-client-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"client_id") : depth0), depth0))
    + "\">accept</button></td>\n            <td><button class=\"btn btn-sm btn-block btn-danger btn-pendingrequests-deny\" data-client-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"client_id") : depth0), depth0))
    + "\">deny</button></td>\n        </tr>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    <p>\n        <button class=\"btn btn-sm btn-success btn-pendingrequests-acceptall\">accept all</button>\n        <button class=\"btn btn-sm btn-danger btn-pendingrequests-denyall\">deny all</button>\n    </p>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <table class=\"table table-striped table-hover table-sm table-bordered\">\n        <caption style=\"caption-side: top;\">pending requests: "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"pending_requests") : depth0)) != null ? lookupProperty(stack1,"length") : stack1), depth0))
    + "</caption>\n        <colgroup>\n            <col width=\"14%\">\n            <col width=\"22%\">\n            <col>\n            <col width=\"10%\">\n            <col width=\"5%\">\n            <col width=\"5%\">\n        </colgroup>\n        <thead>\n        <tr>\n            <th>created&nbsp;at</th>\n            <th>key&nbsp;fingerprint</th>\n            <th>key&nbsp;name</th>\n            <th>remote&nbsp;username</th>\n            <th colspan=\"2\">action</th>\n        </tr>\n        </thead>\n        <tbody>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"pending_requests") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":8},"end":{"line":30,"column":17}}})) != null ? stack1 : "")
    + "        </tbody>\n    </table>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"pending_requests") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":4},"end":{"line":38,"column":11}}})) != null ? stack1 : "");
},"useData":true});
templates['dashboard-publickeys.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\n            <td><nobr>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"created_at") : depth0), depth0))
    + "</nobr></td>\n            <td><nobr>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"updated_at") : depth0), depth0))
    + "</nobr></td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"bits") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"fingerprint") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"comment") : depth0), depth0))
    + "</td>\n        </tr>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <table class=\"table table-striped table-hover table-sm table-bordered\">\n        <caption style=\"caption-side: top;\">public keys: "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"public_keys") : depth0)) != null ? lookupProperty(stack1,"length") : stack1), depth0))
    + "</caption>\n        <colgroup>\n            <col width=\"14%\">\n            <col width=\"14%\">\n            <col width=\"1%\">\n            <col width=\"22%\">\n            <col>\n        </colgroup>\n        <thead>\n        <tr>\n            <th>first&nbsp;seen</th>\n            <th>last&nbsp;seen</th>\n            <th>bits</th>\n            <th>key&nbsp;fingerprint</th>\n            <th>key&nbsp;name</th>\n        </tr>\n        </thead>\n        <tbody>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"public_keys") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":8},"end":{"line":28,"column":17}}})) != null ? stack1 : "")
    + "        </tbody>\n    </table>";
},"useData":true});
templates['dashboard.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "    <div id=\"controls-wrapper\" class=\"p-3\"></div>\n    <div id=\"publickeys-wrapper\" class=\"p-3\"></div>\n    <div id=\"pending-requests-wrapper\" class=\"p-3\"></div>";
},"useData":true});
templates['logs.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"created_at") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"level") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"message") : depth0), depth0))
    + "</td>\n        </tr>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <table class=\"table table-striped table-hover table-sm\">\n        <thead>\n        <tr>\n            <th>created&nbsp;at</th>\n            <th>level</th>\n            <th>message</th>\n        </tr>\n        </thead>\n        <tbody>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"logs") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":8},"end":{"line":16,"column":17}}})) != null ? stack1 : "")
    + "        </tbody>\n    </table>";
},"useData":true});
templates['settings.hbs'] = template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <fieldset class=\"no-bootstrap\">\n        <legend class=\"no-bootstrap\">"
    + container.escapeExpression(container.lambda(blockParams[0][0], depth0))
    + "</legend>\n"
    + ((stack1 = (lookupProperty(helpers,"ifEquals")||(depth0 && lookupProperty(depth0,"ifEquals"))||alias2).call(alias1,blockParams[0][0],"controls",{"name":"ifEquals","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams,"loc":{"start":{"line":4,"column":8},"end":{"line":24,"column":21}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (lookupProperty(helpers,"ifEquals")||(depth0 && lookupProperty(depth0,"ifEquals"))||alias2).call(alias1,blockParams[0][0],"agent",{"name":"ifEquals","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams,"loc":{"start":{"line":26,"column":8},"end":{"line":39,"column":21}}})) != null ? stack1 : "")
    + "\n            <form class=\"form-settings\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(helpers,"lookup").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"keys") : depths[1]),blockParams[0][0],{"name":"lookup","hash":{},"data":data,"blockParams":blockParams,"loc":{"start":{"line":42,"column":24},"end":{"line":42,"column":49}}}),{"name":"each","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams,"loc":{"start":{"line":42,"column":16},"end":{"line":89,"column":25}}})) != null ? stack1 : "")
    + "        </form>\n    </fieldset>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "        <p><small class=\"form-text text-muted\"><b>Modifiers</b>: CommandOrControl / Alt / Option / AltGr / Shift / Super / Meta</small></p>\n        <p>\n            <small class=\"form-text text-muted\"><b>Key codes</b>:<br/>\n                <code>0</code>..<code>9</code>, <code>A</code>..<code>Z</code>, <code>F1</code>..<code>F24</code><br/>\n                <code>~</code>,<code>!</code>,<code>@</code>,<code>#</code>,<code>$</code>, etc.,<br/>\n                <code>Plus</code>, <code>Space</code>, <code>Tab</code>, <code>Capslock</code>, <code>Numlock</code>, <code>Scrolllock</code>,\n                <code>Backspace</code>, <code>Delete</code>, <code>Insert</code>, <code>Return</code><br/>\n                <code>Up</code>, <code>Down</code>, <code>Left</code>, <code>Right</code><br/>\n                <code>Home</code>, <code>End</code>, <code>PageUp</code>, <code>PageDown</code><br/>\n                <code>Escape</code><br/>\n                <code>VolumeUp</code>, <code>VolumeDown</code>, <code>VolumeMute</code><br/>\n                <code>MediaNextTrack</code>, <code>MediaPreviousTrack</code>, <code>MediaStop</code>, <code>MediaPlayPause</code><br/>\n                <code>PrintScreen</code><br/>\n                <code>num0</code>, <code>numdec</code>, <code>numsub</code>, <code>nummult</code>, <code>numdiv</code>\n            </small>\n        </p>\n        <p>\n            <small class=\"form-text text-muted\"><b>Example</b>: CommandOrControl+F3</small>\n        </p>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"form-group row\">\n            <label class=\"col-sm-7 col-form-label col-form-label-sm\">agent state</label>\n            <div class=\"col-sm-3\">\n                <small readonly class=\"form-control form-control-sm ssh-agent-state\">"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"ssh_agent_state") : depths[1]),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.program(7, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":30,"column":85},"end":{"line":30,"column":140}}})) != null ? stack1 : "")
    + "</small>\n            </div>\n            <div class=\"col-sm-1\">\n                <button class=\"btn btn-sm btn-block btn-success btn-agent-start\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"ssh_agent_state") : depths[1]),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":81},"end":{"line":33,"column":133}}})) != null ? stack1 : "")
    + " >start</button>\n            </div>\n            <div class=\"col-sm-1\">\n                <button class=\"btn btn-sm btn-block btn-danger btn-agent-stop\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"ssh_agent_state") : depths[1]),{"name":"unless","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":36,"column":79},"end":{"line":36,"column":139}}})) != null ? stack1 : "")
    + " >stop</button>\n            </div>\n        </div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "started";
},"7":function(container,depth0,helpers,partials,data) {
    return "stopped";
},"9":function(container,depth0,helpers,partials,data) {
    return "disabled=\"disabled\"";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"internal") : depth0),{"name":"unless","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":20},"end":{"line":88,"column":31}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = (lookupProperty(helpers,"switch")||(depth0 && lookupProperty(depth0,"switch"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"key")),{"name":"switch","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":24},"end":{"line":87,"column":35}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = (lookupProperty(helpers,"case")||(depth0 && lookupProperty(depth0,"case"))||alias2).call(alias1,"agent.remote_path",{"name":"case","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":28},"end":{"line":59,"column":37}}})) != null ? stack1 : "")
    + ((stack1 = (lookupProperty(helpers,"default")||(depth0 && lookupProperty(depth0,"default"))||alias2).call(alias1,"",{"name":"default","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":28},"end":{"line":86,"column":40}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            <div class=\"form-group row\">\n                                <label class=\"col-sm-7 col-form-label col-form-label-sm\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0))
    + "</label>\n                                <div class=\"col-sm-3\">\n                                    <input class=\"form-control form-control-sm\" placeholder=\"default: "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"default") : depth0), depth0))
    + "\" name=\""
    + alias2(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":49,"column":128},"end":{"line":49,"column":138}}}) : helper)))
    + "\" data-type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"type") : depth0), depth0))
    + "\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "\" />\n                                    <div class=\"feedback\"></div>\n                                </div>\n                                <div class=\"col-sm-1\">\n                                    <small readonly=\"readonly\" class=\"form-control text-center form-control-sm ssh-remote-agent-state\"></small>\n                                </div>\n                                <div class=\"col-sm-1\">\n                                    <button class=\"btn btn-sm btn-block btn-primary btn-remote-agent-test\">test</button>\n                                </div>\n                            </div>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                <div class=\"form-group row\">\n                                    <label class=\"col-sm-7 col-form-label col-form-label-sm\">"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0))
    + "</label>\n                                    <div class=\"col-sm-5\">\n"
    + ((stack1 = (lookupProperty(helpers,"switch")||(depth0 && lookupProperty(depth0,"switch"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"type") : depth0),{"name":"switch","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":64,"column":40},"end":{"line":83,"column":51}}})) != null ? stack1 : "")
    + "                                    </div>\n                                </div>\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = (lookupProperty(helpers,"case")||(depth0 && lookupProperty(depth0,"case"))||alias2).call(alias1,"boolean",{"name":"case","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":65,"column":44},"end":{"line":70,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = (lookupProperty(helpers,"case")||(depth0 && lookupProperty(depth0,"case"))||alias2).call(alias1,"key",{"name":"case","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":71,"column":44},"end":{"line":74,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = (lookupProperty(helpers,"case")||(depth0 && lookupProperty(depth0,"case"))||alias2).call(alias1,"number",{"name":"case","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":75,"column":44},"end":{"line":78,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = (lookupProperty(helpers,"case")||(depth0 && lookupProperty(depth0,"case"))||alias2).call(alias1,"string",{"name":"case","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":79,"column":44},"end":{"line":82,"column":53}}})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), alias3=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                                <select class=\"form-control form-control-sm\" data-type=\""
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"type") : depth0), depth0))
    + "\" name=\""
    + alias1(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : alias3),(typeof helper === "function" ? helper.call(alias2,{"name":"key","hash":{},"data":data,"loc":{"start":{"line":66,"column":127},"end":{"line":66,"column":137}}}) : helper)))
    + "\">\n                                                    <option value=\"1\" "
    + ((stack1 = (lookupProperty(helpers,"booleanMatch")||(depth0 && lookupProperty(depth0,"booleanMatch"))||alias3).call(alias2,1,{"name":"booleanMatch","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":67,"column":70},"end":{"line":67,"column":114}}})) != null ? stack1 : "")
    + ">yes</option>\n                                                    <option value=\"0\" "
    + ((stack1 = (lookupProperty(helpers,"booleanMatch")||(depth0 && lookupProperty(depth0,"booleanMatch"))||alias3).call(alias2,0,{"name":"booleanMatch","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":68,"column":70},"end":{"line":68,"column":114}}})) != null ? stack1 : "")
    + ">no</option>\n                                                </select>\n";
},"19":function(container,depth0,helpers,partials,data) {
    return "SELECTED";
},"21":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                                <input type=\"text\" class=\"form-control form-control-sm\" placeholder=\"default: "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"default") : depth0), depth0))
    + "\" name=\""
    + alias2(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":72,"column":152},"end":{"line":72,"column":162}}}) : helper)))
    + "\" data-type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"type") : depth0), depth0))
    + "\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"default") : depth0), depth0))
    + "\" />\n                                                <div class=\"feedback\"></div>\n";
},"23":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                                <input type=\"number\" min=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"min") : depth0), depth0))
    + "\" max=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"max") : depth0), depth0))
    + "\" class=\"form-control form-control-sm\" placeholder=\"default: "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"default") : depth0), depth0))
    + "\" name=\""
    + alias2(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":76,"column":196},"end":{"line":76,"column":206}}}) : helper)))
    + "\" data-type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"type") : depth0), depth0))
    + "\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "\" />\n                                                <div class=\"feedback\"></div>\n";
},"25":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                                <input class=\"form-control form-control-sm\" placeholder=\"default: "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"default") : depth0), depth0))
    + "\" name=\""
    + alias2(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":80,"column":140},"end":{"line":80,"column":150}}}) : helper)))
    + "\" data-type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"type") : depth0), depth0))
    + "\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "\" />\n                                                <div class=\"feedback\"></div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"categories") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 1, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams,"loc":{"start":{"line":1,"column":4},"end":{"line":92,"column":13}}})) != null ? stack1 : "")
    + "    <fieldset class=\"no-bootstrap\">\n        <legend class=\"no-bootstrap\">action</legend>\n        <form class=\"\">\n            <div class=\"form-group row\">\n                <div class=\"col-sm-2\">\n                    <button class=\"btn btn-success btn-block btn-custom-save\">save</button>\n                </div>\n            </div>\n        </form>\n    </fieldset>";
},"useData":true,"useDepths":true,"useBlockParams":true});
templates['stats.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr class=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"trClass") : depth0), depth0))
    + "\">\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"message_type_name") : depth0), depth0))
    + "</td>\n            <td>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"count") : depth0), depth0))
    + "</td>\n        </tr>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <table class=\"table table-striped table-hover table-sm\">\n        <thead>\n        <tr>\n            <th>name</th>\n            <th>count</th>\n        </tr>\n        </thead>\n        <tbody>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"stats") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":8},"end":{"line":14,"column":17}}})) != null ? stack1 : "")
    + "        </tbody>\n    </table>";
},"useData":true});
