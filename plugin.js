var format = require("util").format;
var Promise = require("bluebird");
var errors = require("./lib/errors");
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
        if (mehConfig["env-key-name"]?.length > 0) {
            key = process.env[mehConfig["env-key-name"]];
        }
        else {
            // If they dont set the value of env-key-name we pull the key directly from the config
            key = mehConfig["key"];
        }
        
        if(typeof key === "undefined" || key === ""){
            throw Error('[ tennu-meh: is missing its API key. Set the key in "meh"."key" or set the key on an env var and pass the name to "meh"."env-key-name"]');
        }
        
        var meh = require("./lib/meh")(key);

        var router = function(IRCMessage) {
            return Promise.try(function() {
                
                if (!IRCMessage.args[0]) {
                    return getSummary();
                }
                
                var subCommand = IRCMessage.args[0];

                switch (subCommand) {
                    case "video":
                        return getVideo();
                        break;
                    case "poll":
                        return getPoll();
                        break;
                    default:
                        throw new errors.subCommandNotFoundError(format("Tennu-Meh: Sub command '%s' not found.", subCommand));
                }
            })
            .catch(function(err) {
                return errorReponse(err.message);
            });            
        }

        function getSummary(IRCMessage) {
            return meh.getCurrentDealJSON()
                .then(function(mehDealObj) {
                    
                    var price = "$" + mehDealObj.deal.items[0].price;;
                    
                    if(mehDealObj.deal.items.length > 1){

                        var prices = mehDealObj.deal.items.map(function(item){
                            return item.price;
                        });
                        
                        var maxPrice = Math.max(...prices);
                        var minPrice = Math.min(...prices);
                        
                        if(maxPrice !== minPrice){
                            price = format("$%s-$%s", minPrice, maxPrice);  
                        }
                        
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