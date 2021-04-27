/**
 * TODO:
 * DONE implementar HLTB
 * implementar busca google
 * DONE implementar preço de jogo
 */



const tmi = require("tmi.js");
const dotenv = require('dotenv').config();
let hltb = require('howlongtobeat');
let hltbService = new hltb.HowLongToBeatService();
var unirest = require("unirest");
var FuzzySearch = require('fuzzy-search');


const username = process.env.username;
const password = process.env.password
const steamapi = process.env.steamapi
const istheapi = process.env.istheapi;

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

        async function Busca_zera() {
            var x = await gamename;

            if (Object.keys(x).length === 0){
                client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não... Muito menos se o " + channel + " tem.");
            }
            else{

                var req = unirest("GET", "https://api.steampowered.com/ISteamApps/GetAppList/v2");

                req.end(function (res) {
                    if (res.error) throw new Error(res.error);
                    var steamlist = res.body.applist.apps;
                const searcher = new FuzzySearch(steamlist, ['appid','name'], {
                    sort: true, caseSensitive: false,
                });


                const result = searcher.search(x[0].name);

                if (typeof(result[0]) == 'undefined'){
                    client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não... Muito menos se o " + channel + " tem.");
                    return}
                var value = result[0].appid;
                for (var i = 1; i < result.length; i++) {
                    if (result[i].appid < value) {
                        value = result[i].appid;
                    }
                }
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
                        client.action(channel, x[0].name + " demora " + x[0].gameplayMain + " horas mas não achei na Steam do " + channel + " não...");
                    }


                });

                });
            }
        }


        Busca_zera();
    }

    if(message.substring(0,7) === "!falta "){

        let search = message.substring(8);
        var gamename = hltbService.search(search).then(result => result);

        async function Busca_falta() {
            var x = await gamename;

            if (Object.keys(x).length === 0){
                client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não... Muito menos se o " + channel + " tem.");
            }
            else{


                var req = unirest("GET", "https://api.steampowered.com/ISteamApps/GetAppList/v2");

                req.end(function (res) {
                    if (res.error) throw new Error(res.error);
                    var steamlist = res.body.applist.apps;
                const searcher = new FuzzySearch(steamlist, ['appid','name'], {
                    sort: true, caseSensitive: false,
                });


                const result = searcher.search(x[0].name);

                var value = result[0].appid;
                for (var i = 1; i < result.length; i++) {
                    if (result[i].appid < value) {
                        value = result[i].appid;
                    }
                }
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
                    }


                });

                });
            }
        }


        Busca_falta();
    }
    if(message.substring(0,7) === "!timer "){

        let time_set = message.replace("!timer ", "");
        function set_timer(time_set) {
            client.action(channel, "Acabou o timer!")
        }
        if (time_set > 600){
            client.action(channel, "Timer máximo de 10min");
        }
        else{
            setTimeout(set_timer, time_set*1000);
        }
    }


    if(message.substring(0,7) === "!preço "){

        let search = message.substring(8);
        var gamename = hltbService.search(search).then(result => result);

        async function Busca_preco() {
            var x = await gamename;

            if (Object.keys(x).length === 0){
                client.action(channel,"Confere esse nome de jogo aí.");
            }
            else{
                var req = unirest("GET", "https://api.isthereanydeal.com/v02/game/plain/?key="+istheapi+"&shop=&game_id=&url=&title="+x[0].name+"&optional=");

                req.end(function (res) {
                    if (res.error) throw new Error(res.error);

                    var nameitnd = res.body.data.plain;
                    var req = unirest("GET", "https://api.isthereanydeal.com/v01/game/prices/?key="+istheapi+"&plains="+ nameitnd +"&region=br2&country=BR&shops=steam%2Cnuuvem%2Cgog%2Cgreenmangaming%2Cbattlenet%2Cepic%2Cmicrosoft%2Corigin&exclude=&added=0");

                    req.end(function (res) {
                        if (res.error) throw new Error(res.error);

                        var mensagem = "Segundo isthereanydeal, " + x[0].name + " -> ";
                        var pricelist =  res.body.data[nameitnd].list;
                        if (pricelist.length === 0){
                            mensagem = x[0].name + " ainda vende em algum lugar?";
                        }
                        else{
                            for (var i = 0; i < pricelist.length; i++) {
                                if( i === 0){
                                    if (pricelist[i].price_cut === 0){
                                        mensagem = mensagem + pricelist[i].shop.name + ": sem desconto a R$" +pricelist[i].price_new;
                                    }
                                    else{
                                        mensagem = mensagem + pricelist[i].shop.name + ": " + pricelist[i].price_cut + "% de desconto a R$" +pricelist[i].price_new;
                                    }

                                }
                                else{
                                    if (pricelist[i].price_cut === 0){
                                        mensagem = mensagem + ", " + pricelist[i].shop.name + ": sem desconto a R$" +pricelist[i].price_new ;
                                    }
                                    else{
                                        mensagem = mensagem + ", " + pricelist[i].shop.name + ": " + pricelist[i].price_cut + "% de desconto a R$" +pricelist[i].price_new ;
                                    }
                                }
                            }
                        }

                        client.action(channel, mensagem);

                    });

                });

            }
        }
        Busca_preco();
    }

});
