var format = require("util").format;
var Promise = require("bluebird");
var moment = require("moment");

var errorReponse = function(message) {
    return {
        intent: "notice",
        query: true,
        message: message
    }
};

var TennuMeh = {
    configDefaults: {
        'meh': {
            "env-key-name": ""
        }
    },
    init: function(client, imports) {

        const helps = require("./helps.json");
        var mehConfig = client.config("meh");

        var key = "";
        if (mehConfig["env-key-name"].length > 0) {
            key = process.env[mehConfig["env-key-name"]];
        }
        else {
            mehConfig["key"];
        }

        var meh = require("./lib/meh")(key);

        var router = function(IRCMessage) {
            return Promise.try(function() {
                if (!IRCMessage.args[0]) {
                    return getSummary();
                }

                switch (IRCMessage.args[0]) {
                    case "video":
                        return getVideo();
                        break;
                    case "poll":
                        return getPoll();
                        break;
                    default:
                        return errorReponse("Tennu-Meh: Sub command not found.");
                }
            }).catch(function(err) {
                return errorReponse(err);
            });
        }

        function getSummary(IRCMessage) {
            return meh.getCurrentDealJSON()
                .then(function(mehDealObj) {
                    
                    var price = "";
                    
                    if(mehDealObj.deal.items.length === 1){
                        price = "$" + mehDealObj.deal.items[0].price;
                    } else {
                        var prices = mehDealObj.deal.items.map(function(item){
                            return item.price;
                        });
                        
                        var maxPrice = Math.max(...prices);
                        var minPrice = Math.min(...prices);
                        
                        price = format("$%s-$%s", minPrice, maxPrice);
                        
                    }
                    
                    return format("(%s) %s - %s", price, mehDealObj.deal.title, mehDealObj.deal.url);
                });
        }

        function getVideo(IRCMessage) {
            return meh.getCurrentDealJSON()
                .then(function(mehDealObj) {
                    if (!mehDealObj.video) {
                        return "No video associated with todays deals.";
                    }
                    return format("%s Forum: %s", mehDealObj.video.url, mehDealObj.video.topic.url);
                });
        }

        function getPoll(IRCMessage) {
            return meh.getCurrentDealJSON()
                .then(function(mehDealObj) {

                    if (!mehDealObj.poll) {
                        return "No poll associated with todays deals.";
                    }

                    var posted = moment(mehDealObj.poll.startDate).fromNow();

                    var response = [format("Posted %s - \"%s\"", posted, mehDealObj.poll.title)];

                    return Promise.each(mehDealObj.poll.answers, function(item, index, length) {
                        response.push(format("\"%s\" (%s votes)", item.text, item.voteCount));
                    }).then(function() {
                        return {
                            intent: "say",
                            query: false,
                            message: response
                        }
                    });
                });
        }

        return {
            handlers: {
                "!meh": router,
            },
            help: helps,
            commands: ["meh"]
        }
    }
};

module.exports = TennuMeh;