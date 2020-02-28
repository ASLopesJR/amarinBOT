  /**
   * TODO:
   * DONE implementar HLTB
   * implementar busca google
   * implementar preço de jogo
   */



const tmi = require("tmi.js");
let hltb = require('howlongtobeat');
let hltbService = new hltb.HowLongToBeatService();
var unirest = require("unirest");
var FuzzySearch = require('fuzzy-search');
let steamlist = require('./steamapps.json');

var username = "<USERNAME>";
var password = "<AUTH_TOKEN>";
var steamapi = "<STEAM_API_KEY>";

let options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: username ,
        password: password
    },
    channels: [ "stockermann2", "amarinlopes" , "salsatheone"]
};

let client = new tmi.client(options);

// Connect the client to the server..

client.connect();

client.on('connected', (address, port) => {

});

client.on('chat', (channel,user,message,self) => {

    if(message.substring(0,6) === "!zera "){

        let search = message.substring(7);
        var gamename = hltbService.search(search).then(result => result);

        async function f1() {
            var x = await gamename;
            //console.log(x); // 10

            if (Object.keys(x).length === 0){
                client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não... Muito menos se o " + channel + " tem.");
            }
            else{

            const searcher = new FuzzySearch(steamlist.applist.apps, ['appid','name'], {
                sort: true, caseSensitive: false,
            });


            const result = searcher.search(x[0].name);
            //console.log(result);

            var value = result[0].appid;
            for (var i = 1; i < result.length; i++) {
                if (result[i].appid < value) {
                    value = result[i].appid;
                }
            }
            //console.log(value);

                //console.log(channel);
                if (channel === "#stockermann2"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198016861690&format=json");
                }
                if (channel === "#amarinlopes"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198012528808&format=json");
                }
                if (channel === "#salsatheone"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198006873223&format=json");
                }

                req.end(function (res) {
                    if (res.error) throw new Error(res.error);

        //            console.log(res.body.response.games);
        //
                    var flag = false;

                    for(var i = 0; i < res.body.response.games.length;i++){
                        if(res.body.response.games[i].appid === result[0].appid){

                            var horas = Math.round(res.body.response.games[i].playtime_forever/60);
                            client.action(channel,x[0].name + " demora " + x[0].gameplayMain + " horas e o " + channel + " já jogou umas " + horas + " horas até agora!");
                            flag = true;
                        }
                    }
                    if (flag === false){
                        for(var i = 0; i < res.body.response.games.length;i++){
                            if(res.body.response.games[i].appid === value){

                                var horas = Math.round(res.body.response.games[i].playtime_forever/60);
                                client.action(channel,x[0].name + " demora " + x[0].gameplayMain + " horas e o " + channel +" já jogou umas " + horas + " horas até agora!");
                                flag = true;
                            }
                        }
                    }
                    if (flag === false){
                        client.action(channel, x[0].name + " demora " + x[0].gameplayMain + "horas mas não achei na Steam do " + channel + " não...");
                        //console.log(result)
                    }


                });

            }
        }


        f1();
    }

    if(message.substring(0,7) === "!falta "){

        let search = message.substring(8);
        var gamename = hltbService.search(search).then(result => result);

        async function f1() {
            var x = await gamename;
            //console.log(x); // 10

            if (Object.keys(x).length === 0){
                client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não... Muito menos se o " + channel + " tem.");
            }
            else{

            const searcher = new FuzzySearch(steamlist.applist.apps, ['appid','name'], {
                sort: true, caseSensitive: false,
            });


            const result = searcher.search(x[0].name);
            //console.log(result);

            var value = result[0].appid;
            for (var i = 1; i < result.length; i++) {
                if (result[i].appid < value) {
                    value = result[i].appid;
                }
            }
            //console.log(value);

                //console.log(channel);
                if (channel === "#stockermann2"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198016861690&format=json");
                }
                if (channel === "#amarinlopes"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198012528808&format=json");
                }
                if (channel === "#salsatheone"){
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid=76561198006873223&format=json");
                }

                req.end(function (res) {
                    if (res.error) throw new Error(res.error);

        //            console.log(res.body.response.games);
        //
                    var flag = false;

                    for(var i = 0; i < res.body.response.games.length;i++){
                        if(res.body.response.games[i].appid === result[0].appid){

                            var horas = Math.round(res.body.response.games[i].playtime_forever/60);
                            var resta = x[0].gameplayMain - horas;
                            if(resta <= 0){
                                client.action(channel,"O " + channel + " está atrasado " + resta + " horas pra zerar o " + x[0].name + ". Isso se ele não tá de sacanagem e já zerou.");
                                flag = true;
                            }
                            else{
                                client.action(channel,"O " + channel + " ainda tem " + resta + " horas pra zerar o " + x[0].name + ". Vai que dá!");
                                flag = true;
                            }
                        }
                    }
                    if (flag === false){
                        for(var i = 0; i < res.body.response.games.length;i++){
                            if(res.body.response.games[i].appid === value){
                                var horas = Math.round(res.body.response.games[i].playtime_forever/60);
                                var resta = x[0].gameplayMain - horas;
                                if(resta <= 0){
                                    client.action(channel,"O " + channel + " está atrasado " + resta + " horas pra zerar o " + x[0].name + ". Isso se ele não tá de sacanagem e já zerou.");
                                    flag = true;
                                }
                                else{
                                    client.action(channel,"O " + channel + " ainda tem " + resta + " horas pra zerar o " + x[0].name + ". Vai que dá!");
                                    flag = true;
                                }
                            }
                        }
                    }
                    if (flag === false){
                        client.action(channel, x[0].name + " tá na steam do " + channel + "? Não achei aqui não...");
                        //console.log(result)
                    }


                });

            }
        }


        f1();
    }
});
