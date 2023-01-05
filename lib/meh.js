var fetch = require("node-fetch");
var moment = require("moment");
var Promise = require("bluebird");
var errors = require("./errors");
var format = require("util").format;

function getCurrentDealJSON() {
  var self = this;

  return Promise.try(function () {
    const now = moment();

    // Cache check
    if (self.lastRequest && moment(self.lastRequest).add(60, "s") > now) {
      self.lastResponse.cached = true;
      return self.lastResponse;
    }

    self.lastRequest = moment();

    var targetURI = format(
      "%s/1/current.json?apikey=%s",
      self.mehBaseUri,
      self.APIKey
    );
    return fetch(targetURI).then(function (res) {
      if (res.status === 403) {
        throw new errors.httpUnauthorizedError(
          "meh.com/api responded with a 403. Check your API key?"
        );
      }

      self.lastResponse = res.json();
      return self.lastResponse;
    });
  });
}

module.exports = function (APIKey, mehBaseUri) {
  return {
    reasonableRequestLimit: 60,
    lastRequest: null,
    lastResponse: null,
    APIKey,
    mehBaseUri,
    getCurrentDealJSON: getCurrentDealJSON,
  };
};
