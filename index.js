
const token   = process.env.BOT_TOKEN;
const SERVER_UL  = process.env.SERVER;
const botrun  = "Bonjour je suis le bot de statistique qui va permettre de savoir vos stats sur pubg";
const helper  = "Écrivez !stats gamertag-platforme-region ( ex: !stats malcolm908-xbox-eu ).";
const helper2 = "Si votre pseudo mixer est le même que le compte xbox alors écrivez simplement !stats platforme-region ( ex: !stats xbox-eu ).";
const promo   = "Télechargez la nouvelle application mobile qui vous permetera de voir vos stats et ceux de vos amis https://play.google.com/store/apps/details?id=com.ultimecode.pubgsocialtrackerapp";
const Mixer   = require('@mixer/client-node');
const ws      = require('ws');
var request   = require("request");
let userInfo;

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

console.log("+============================+")
console.log("    Bot Mixer Pubg Stats")
console.log("      By X BLACKSNOW X")
console.log("+============================+")

client.use(new Mixer.OAuthProvider(client, {
    tokens: {
        access: token,
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
}));

client.request('GET', 'users/current')
.then(response => {
    userInfo = response.body;
    return new Mixer.ChatService(client).join(response.body.channel.id);
})
.then(response => {
    const body = response.body;
    return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
})
.catch(error => {
    //socket.call('msg', [helper]);
    console.error('Something went wrong.');
    console.error(error);
});

/**
 * Creates a Mixer chat socket and sets up listeners to various chat events.
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id to join
 * @param {string[]} endpoints An array of endpoints to connect to
 * @param {string} authkey An authentication key to connect with
 * @returns {Promise.<>}
 */
function createChatSocket (userId, channelId, endpoints, authkey) {

    const socket = new Mixer.Socket(ws, endpoints).boot();

    socket.on('ChatMessage', data => {

        if (data.message.message[0].data.toLowerCase().startsWith('!help')) {
            socket.call('msg', [helper]);
              socket.call('msg', [helper2]);
        }

        if (data.message.message[0].data.toLowerCase().startsWith('!promo')) {
            socket.call('msg', [promo]);
        }

        if (data.message.message[0].data.toLowerCase().startsWith('!stats')) {

            var msg_user = data.message.message[0].data;
            msg_user = msg_user.split("-");
            var gamertag = msg_user[0].substr(7);
            var platforme = msg_user[1];
            var region = msg_user[2];

            console.log("gamertag: "+gamertag);
            if(gamertag=="xbox" || gamertag=="pc"){

              var new_gamertag = `${data.user_name}`;
              new_gamertag = new_gamertag.replace(/_/g, ' ');

              socket.call('msg', [`Je télecharge les statistiques de ` +new_gamertag+ ` veuillez patienter ...`]);
              platfornm = gamertag;
              region = platforme;
              //console.log("new_gamertag: "+new_gamertag);
            //  console.log("platfornm: "+platfornm);
            //  console.log("region: "+region);
              var url = 'https://www.'+SERVER_UL+'.com/pubg/index.php?action=assets&objectif=newuser&playername='+new_gamertag+'&plateform='+platforme+'-'+region;
            }else{
              socket.call('msg', [`Je télecharge les statistiques de ` +gamertag+ ` veuillez patienter ...`]);
              var url = 'https://www.'+SERVER_UL+'.com/pubg/index.php?action=assets&objectif=newuser&playername='+gamertag+'&plateform='+platforme+'-'+region;
            }

          //  console.log("url: "+url);
            if( gamertag=="" || platforme=="" || region==""){socket.call('msg', ["Mince je n'ai rien trouvé, le gamertag contient-il des majuscules peut-être, ou est-ce la bonne platforme-region ?"]);}else{


            request({
                url: url,
                json: true
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {

                    var string = JSON.stringify(body);
						        var objectValue = JSON.parse(string);
                    var player_exist = objectValue['server'][0]['player_exist']

                    var vi = "";
                    if(total_wins>1){vi="s"}

                    if(player_exist){
                      var total_kill = objectValue['stats'][0]['total_kill'];
                      var total_assist = objectValue['stats'][0]['total_assist'];
                      var total_headshot = objectValue['stats'][0]['total_headshot'];
                      var total_revive = objectValue['stats'][0]['total_revive'];
                      var total_roudsPlayed = objectValue['stats'][0]['total_roudsPlayed'];
                      var total_wins = objectValue['stats'][0]['total_wins'];
                      var total_longestKill = objectValue['stats'][0]['total_longestKill'];
                      try{

                        message = gamertag+` a atteint un total de `+total_wins+` victoire`+vi+`, pendant ces longs combats entre la vie et la mort il à exécuter `+total_kill+` joueurs dont `+total_headshot+` en pleine tete,`
                        message += ` avec une distance de `+total_longestKill+` mètres de plus il n'a pas à hésiter à couvrir ses camarades `+total_assist+` fois,
                        même si certains sont tombé au combat il les a ressuscités d'une mort certaine `+total_revive+` fois.`

                        if(message.length >= 360){
                          socket.call('msg', [
                            `Victoire`+vi+`: `+total_wins+`, `+
                            `Kill: `+total_kill+`, `+
                            `Plaine tete: `+total_headshot+`, `+
                            `Tire le plus loin: `+total_longestKill+`, `+
                            `Assistances : `+total_assist+`, `+
                            `Revive: `+total_revive
                          ]);
                        }else{
                          socket.call('msg', [message]);
                          socket.call('msg', [
                              `Victoire`+vi+`: `+total_wins+`, `+
                              `Kill: `+total_kill+`, `+
                              `Plaine tete: `+total_headshot+`, `+
                              `Tire le plus loin: `+total_longestKill+`, `+
                              `Assistances : `+total_assist+`, `+
                              `Revive: `+total_revive
                          ]);
                        }

                      }catch(err){
                        socket.call('msg', [
                            `Victoire`+vi+`: `+total_wins+`, `+
                            `Kill: `+total_kill+`, `+
                            `Plaine tete: `+total_headshot+`, `+
                            `Tire le plus loin: `+total_longestKill+`, `+
                            `Assistances : `+total_assist+`, `+
                            `Revive: `+total_revive
                        ]);
                        console.log("ERREUR: "+err);
                      }
                    }else{
                      socket.call('msg', ["Mince je n'ai rien trouvé, le gamertag contient-il des majuscules peut-être, ou est-ce la bonne platforme-region ?"]);
                    }
                }else{
                  socket.call('msg', ["Mince je n'ai rien trouvé, le gamertag contient-il des majuscules peut-être, ou est-ce la bonne platforme-region ?"]);
                }
            })
           }
        }
    });

    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });

    return socket.auth(channelId, userId, authkey)
    .then(() => {
        //return socket.call('msg', [botrun +" "+helper]);
        return;
    });
}
