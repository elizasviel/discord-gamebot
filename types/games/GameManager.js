import { Collection } from '../../discord_mod.js'
import options from '../../config/options.js'

export default class GameManager {
    constructor(client) {
        // A list of active games, keyed by channel id
        this.games = new Collection()
        this.client = client
    }

    /**
     * Starts a new game
     * @param {Game} game The game to play
     * @param {Discord.Message} msg The Discord message that initiated this game
     */
    start(game, msg, ...gameOptions) {
      let channel = msg.channel
    // check if game is playing in channel
    if(this.games.has(channel.id)) {
        channel.sendMsgEmbed(`A game is already playing in this channel! End that game first by using the \`${options.prefix}end\` command.`, 'Uh oh...', 13632027)
        return
      }
      if(!game) {
        channel.sendMsgEmbed(`Game not found. Make sure you typed the game ID correctly. You can see the game IDs by typing \`${options.prefix}gamelist\``, 'Error!', 13632027)
        return
      }
      
      // create new instance of game
      let gameInstance = new (game)(msg, ...gameOptions)
      this.games.set(channel.id, gameInstance)

      // run initialization of game
      gameInstance.init()
    }

    stop(channel) {
      let game = this.games.get(channel.id)
      if(game) game.forceStop()
      this.games.delete(channel.id)
    }
}