/* Magic Mirror
 * Node Helper: MMM-Avinor
 *
 * By
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
		this.started = false;
		this.config = null;
	},

	getData: function() {
		var self = this;
		var myUrl = this.config.httpRequestURL;

		//return new Promise(function (resolve, reject) {
		request({
			url: myUrl,
			method: "GET",
			headers: {
				"User-Agent": "MagicMirror/1.0 ",
				"Accept-Language": "en_US",
		        //'Content-Type': 'application/json'
		    },
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			}
		//	});
		});
		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "CONFIG" && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		}
	}
});
