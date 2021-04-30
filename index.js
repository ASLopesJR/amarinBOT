/**
 * TODO:
 * implementar busca google
 */
const channel_info = require("./channels.json");
var cache = require('memory-cache');
const tmi = require("tmi.js");
const dotenv = require('dotenv').config();
const schedule = require('node-schedule')
let hltb = require('howlongtobeat');
var unirest = require("unirest");
var FuzzySearch = require('fuzzy-search');

const username = process.env.username;
const password = process.env.password;
const steamapi = process.env.steamapi;
const istheapi = process.env.istheapi;

function UpdateCache() {
    var req = unirest("GET", "https://api.steampowered.com/ISteamApps/GetAppList/v2");
    req.end(function (res) {
        if (res.error) {
            return;
        }
        cache.put('steamlist',res.body.applist.apps);
    });
}
function get_runners_names(channel, user, category_name, time_run, playertype,key, player_count,player_uri, players,player_ids,gamename){
    // Isso é completamente amaldiçoado, mas a api me forçou a fazer isso
    if(key >= player_count){
        players = players.join(' e ');
        client.action(channel, user.username + " O jogo "+gamename+" na categoria principal (" + category_name + ") o recorde é de "+ time_run + " por " +players)
    }
    else{
        if(playertype[key] === 'user'){
            var req = unirest("get", player_uri[key]);
            req.end(function (res) {
                if (res.error) {
                    return;
                }
                players[key] = res.body.data.names.international;
                key = key + 1;
                get_runners_names(channel, user, category_name, time_run, playertype,key,player_count,player_uri,players,player_ids,gamename);
            });
        }
        else{
            players[key] = player_ids[key];
            key = key + 1;
            get_runners_names(channel, user, category_name, time_run, playertype,key,player_count,player_uri,players,player_ids,gamename);
        }
    }
}
function dehash(channel) {
    return channel.replace(/^#/, '');
}
function handle_chat_commands(channel, user, message, self){
    var sepmsg  = message.split(' ');
    var comando = sepmsg[0];
    var args    = sepmsg.slice(1).join(' ');
    switch(comando){
        case "!preço":{
            let busca_preco = args;
            var req = unirest("GET", "https://api.isthereanydeal.com/v02/game/plain/?key="+istheapi+"&shop=&game_id=&url=&title="+busca_preco+"&optional=");
            req.end(function (res) {
                if (res.error) {
                    client.action(channel, "AAAAAAAAAAAAH, erro de API. Tente de novo ou desista!");
                    return;
                }
                var nameitnd = res.body.data.plain;
                var req = unirest("GET", "https://api.isthereanydeal.com/v01/game/prices/?key="+istheapi+"&plains="+ nameitnd +"&region=br2&country=BR&shops=steam%2Cnuuvem%2Cgog%2Cgreenmangaming%2Cbattlenet%2Cepic%2Cmicrosoft%2Corigin&exclude=&added=0");
                req.end(function (res) {
                    if (res.error) {
                        client.action(channel, "AAAAAAAAAAAAH, erro de API. Tente de novo ou desista!");
                        return;
                    }
                    var mensagem = user.username +" Segundo IsThereAnyDeal -> ";
                    var pricelist =  res.body.data[nameitnd].list;
                    if (pricelist.length === 0){
                        mensagem = user.username + " seu jogo ainda vende em algum lugar?";
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
            break;
        }
        case "!zera":{
            let search = args;
            hltbService.search(search).then(result => {
                if (Object.keys(result).length === 0){
                    client.action(channel,"Confere esse nome de jogo aí que eu não achei no HowLongToBeat não...");
                }
                else{
                    client.action(channel, "Segundo HowLongToBeat, "+result[0].name + " demora " + result[0].gameplayMain + " horas pra zerar.");
                }
            });
            break;
        }
        case "!falta": {
            let search = args;
            hltbService.search(search).then(result => {
                if (Object.keys(result).length === 0){
                    client.action(channel,"Confere esse nome de jogo aí que eu não achei no HLTB não.");
                }
                else{
                    const searcher = new FuzzySearch(cache.get('steamlist'), ['appid','name'], {
                        sort: true, caseSensitive: false,
                    });
                    var searchresult = searcher.search(result[0].name.toLowerCase);
                    if (searchresult.length === 0){
                        searchresult = searcher.search(args.toLowerCase);
                        if (searchresult.length === 0){
                            client.action(channel, "Não achei o jogo na Steam.");
                            return;
                        }
                    }
                    var value = searchresult[0].appid;
                    for (var i = 1; i < searchresult.length; i++) {
                        if (searchresult[i].appid < value) {
                            value = searchresult[i].appid;
                        }
                    }
                    var channelname = dehash(channel);
                    var req = unirest("GET", "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamapi + "&steamid="+channel_info[channelname].steamid+"&format=json");
                    req.end(function (res) {
                        if (res.error) {
                            client.action(channel, "AAAAAAAAAAAAH, erro de API. Tente de novo ou desista!");
                            return;
                        }
                        var gameowned = res.body.response.games.filter(function(game) {
                            return game.appid == searchresult[0].appid;
                        });
                        var outrogameowned = res.body.response.games.filter(function(game) {
                            return game.appid == value;
                        });
                        if(Object.keys(gameowned).length > 0){
                            var horas = Math.round(gameowned[0].playtime_forever/60);
                            var resta = result[0].gameplayMain - horas;
                            if(resta <= 0){
                                resta = - resta;
                                client.action(channel,"O " + channelname + " já jogou por " + horas + " horas e está atrasado " + resta + " horas pra zerar o " + result[0].name + ". Isso se ele não tá de sacanagem e já zerou.");
                            }
                            else{
                                client.action(channel,"O " + channelname + " já jogou por " + horas + " horas e ainda tem " + resta + " horas pra zerar o " + result[0].name + ". Vai que dá!");
                            }
                        }
                        else if(Object.keys(outrogameowned).length > 0){
                            var horas = Math.round(outrogameowned[0].playtime_forever/60);
                            var resta = result[0].gameplayMain - horas;
                            if(resta <= 0){
                                resta = - resta;
                                client.action(channel,"O " + channelname + " já jogou por " + horas + " horas e está atrasado " + resta + " horas pra zerar o " + result[0].name + ". Isso se ele não tá de sacanagem e já zerou.");
                            }
                            else{
                                client.action(channel,"O " + channelname + "já jogou por " + horas + " horas e ainda tem " + resta + " horas pra zerar o " + result[0].name + ". Vai que dá!");
                            }
                        }
                        else{
                            client.action(channel, result[0].name + " tá na steam do " + channelname + "? Não achei aqui não...");
                        }
                    });
                }
            });
            break;
        }
        case "!timer":{
            let time_set = args;
            function set_timer(time_set) {
                client.action(channel, "O tempo acabou!")
            }
            if (time_set > 600){
                client.action(channel, "Timer máximo de 10min");
            }
            else{
                client.action(channel,"Definido um timer de "+time_set+" segundos");
                setTimeout(set_timer, time_set*1000);
            }
            break;
        }
        case "!histlow":{
            var busca_hist = args;
            var req = unirest("GET", "https://api.isthereanydeal.com/v02/game/plain/?key="+istheapi+"&shop=&game_id=&url=&title="+busca_hist+"&optional=");
            req.end(function (res) {
                if (res.error) {
                    client.action(channel, "AAAAAAAAAAAAH, erro de API. Tente de novo ou desista!");
                    return;
                }
                var nameitnd = res.body.data.plain;
                var req = unirest("GET", "https://api.isthereanydeal.com/v01/game/lowest/?key="+istheapi+"&plains="+nameitnd+"&region=br2&country=BR&shops=steam%2Cnuuvem%2Cgog%2Cgreenmangaming%2Cbattlenet%2Cepic%2Cmicrosoft%2Corigin&exclude=&since=0");
                req.end(function (res) {
                    if (res.error) {
                        client.action(channel, "AAAAAAAAAAAAH, erro de API. Tente de novo ou desista!");
                        return;
                    }
                    var mensagem = "";
                    var pricelist =  res.body.data[nameitnd];
                    if (pricelist.length === 0){
                        mensagem = user.username + " seu jogo ainda vende em algum lugar?";
                    }
                    else{
                        mensagem = user.username + ", Segundo IsThereAnyDeal, o menor preço foi R$" +pricelist.price+ " com "+pricelist.cut+"% de desconto em "+pricelist.shop.name+".";
                    }
                    client.action(channel, mensagem);
                });
            });
            break;
        }
        case "!comandos":{
            client.action(channel, "Os comandos disponíveis são: !zera <arg> -> Quanto tempo pra zerar segundo Howlongtobeat; !falta <arg> -> Quantas horas "+dehash(channel)+" tem pra zerar antes da média do Howlongtobeat; !preço <arg> -> Verifica o preço de um jogo nas lojas; !histlow -> Procura o menor preço histórico de um jogo no IsThereAnyDeal; !source -> Diz onde está o código fonte do bot; !timer <arg> -> Cria um timer em segundos (máximo 10min); !speedrun <game> -> Procura a speedrun na categoria principal, e reza pra ser o jogo certo e a categoria que você quer;!comandos -> é esse comando.");
            break;
        }
        case "!source":{
            client.action(channel, "O código fonte deste bot você encontra no github em ASLopesJR/amarinBOT.");
            break;
        }
        case "!speedrun":{
            var req = unirest("GET", "https://www.speedrun.com/api/v1/games?name="+args+"&max=1");
            req.end(function (res) {
                if (res.error) {
                    return;
                }
                if (Object.keys(res.body.data).length === 0){
                    client.action(channel,"Não encontrei esse jogo no site Speedrun, verifique o nome e tente novamente. Ou desista.");
                    return;
                }
                var gamename = res.body.data[0].names.international;
                var game_run_id = res.body.data[0].links[5];
                var req = unirest("GET", game_run_id.uri+"?miscellaneous=no&scope=full-game");
                req.end(function (res) {
                    if (res.error) {
                        return;
                    }
                    game_runs = res.body.data[0];
                    category_id = game_runs.category;
                    const time_run = game_runs.runs[0].run.times.primary.slice(2).toLowerCase();
                    var category_name = game_runs.weblink.split('#').slice(1).join('_').replaceAll('_',' ');
                    var player_count = Object.keys(game_runs.runs[0].run.players).length
                    var players = new Array(player_count);
                    var playertype = new Array(player_count);
                    var player_uri = new Array(player_count);
                    var player_ids = new Array(player_count);
                    for(key in game_runs.runs[0].run.players){
                        playertype[key] = game_runs.runs[0].run.players[key].rel;
                        player_uri[key] = game_runs.runs[0].run.players[key].uri;
                        player_ids[key] = game_runs.runs[0].run.players[key].id;
                    }
                    var key = 0;
                    var req = unirest("GET", "https://www.speedrun.com/api/v1/categories/"+category_id+"/variables");
                    req.end(function (res) {
                        if (res.error) {
                            return;
                        }
                        if (Object.keys(res.body.data).length === 0){
                            get_runners_names(channel, user, category_name, time_run, playertype,key,player_count,player_uri,players,player_ids,gamename);
                        }
                        else{
                            var run_variable = res.body.data[0].values.values;
                            run_variable = run_variable[Object.keys(run_variable)[0]].label;
                            category_name = category_name.concat(" - ", run_variable);
                            get_runners_names(channel, user, category_name, time_run, playertype,key,player_count,player_uri,players,player_ids,gamename);
                        }
                    });
                });
            });
            break;
        }
        default:{}
    }
};

schedule.scheduleJob('0 0 * * *', () => {
    UpdateCache();
}) // run everyday at midnight

let tmi_options = {
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
    channels: Object.keys(channel_info)
};

let hltbService = new hltb.HowLongToBeatService();
let client = new tmi.client(tmi_options);

client.log.setLevel('warn');
client.addListener('message',handle_chat_commands);

UpdateCache();
client.connect();
