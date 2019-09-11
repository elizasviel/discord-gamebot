const options = require('./../../config/options')
const DAILY_REWARDS = [
    100,
    250,
    300,
    350,
    400,
    450,
    500,
    600
]
const HOUR_LENGTH = (60 * 60 * 1000)
const RESET_LENGTH = (12 * HOUR_LENGTH)
const DAY_LENGTH = (24 * HOUR_LENGTH)

module.exports = {
    name: 'daily',
    usage: 'daily',
    aliases: ['claim', 'vote'],
    description: ['Claim today\'s credits for voting on the bot.'],
    category: 'economy',
    permissions: [],
    dmCommand: true,
    args: false,
    run: async function(msg, args) {
        const collection = msg.client.database.collection('users')
        msg.author.fetchDBInfo().then(async info => {
            const voteStreak = streak => `**${streak} day streak!**\n${'🔥'.repeat(Math.min(streak, 7))}${'⬜'.repeat(Math.max(7 - streak, 0))} | **Next Reward: ${DAILY_REWARDS[Math.min(streak, 7)]}${options.creditIcon}**`

            // check if user can claim credits
            // daily hasn't been claimed and check if lastVoted was in last 24 hours
            if (info.lastVote < Date.now() - RESET_LENGTH) {
                // tell them to vote on discordbots.org and vote, then type daily. Have brief explanation of vote streak.
                const msExpire = info.lastVote + DAY_LENGTH + RESET_LENGTH - Date.now()
                const hoursExpire = Math.floor(msExpire / HOUR_LENGTH)
                const minutesExpire = Math.round((msExpire / HOUR_LENGTH- hoursExpire) * 60)

                // if streak has expired, reset it.
                if(msExpire < 0) {
                    info.voteStreak = 0
                    await collection.updateOne(
                        { userID: msg.author.id },
                        { $set: { voteStreak: 0 } }
                    )
                }

                msg.channel.send({
                    embed: {
                        title: 'Claim your daily rewards!',
                        description: `[Vote for Gamebot on DiscordBots.org here](https://discordbots.org/bot/620307267241377793/vote) and receive credits each day!`,
                        fields: [{
                            name: 'Current vote streak',
                            value: voteStreak(info.voteStreak)
                        }],
                        color: options.colors.economy,
                        footer: {
                            text: info.voteStreak > 0 ? `Your streak expires in ${hoursExpire} hours and ${minutesExpire} minutes.` : 'Extend your vote streak and get bonus rewards each day you vote!'
                        }
                    }
                })
            } else if(!info.dailyClaimed) {
                // user may claim credits, daily not claimed and voted in last 24 hours
                // credit rewards, and set dailyClaimed to true
                await collection.updateOne(
                    { userID: msg.author.id },
                    {
                        $set: { 
                            dailyClaimed: true
                         },
                        $inc: {
                            balance: DAILY_REWARDS[Math.min(info.voteStreak, 7)], 
                            voteStreak: 1
                        }
                    }
                )
                // display vote streak
                msg.channel.send({
                    embed: {
                        title: `Thank you for voting on Gamebot!`,
                        description: `You can vote again in about 12 hours.`,
                        fields: [{
                            name: 'Current vote streak',
                            value: voteStreak(info.voteStreak + 1)
                        }],
                        color: options.colors.info,
                        footer: {
                            text: `Extend your vote streak and get bonus rewards each day you vote!`
                        }
                    }
                })
                
            } else if (info.dailyClaimed) {
                // check how much longer it takes for another vote 
                const msWait = info.lastVote + RESET_LENGTH - Date.now()
                const hoursWait = Math.floor(msWait / HOUR_LENGTH)
                const minutesWait = Math.round((msWait / HOUR_LENGTH - hoursWait) * 60)

                msg.channel.send({
                    embed: {
                        title: `You've already claimed your rewards!`,
                        description: `You have to wait ${hoursWait} hours and ${minutesWait} minutes before voting again.`,
                        fields: [{
                            name: 'Current vote streak',
                            value: voteStreak(info.voteStreak)
                        }],
                        color: options.colors.error,
                        footer: {
                            text: `Extend your vote streak and get bonus rewards each day you vote!`
                        }
                    }
                })
            } else {
                // this should never happen
                msg.channel.sendMsgEmbed(`There seems to be an issue with the ${options.prefix}daily command. Please submit a bug report in the [support server](${options.serverInvite}).`, 'Error!')
            }
        })
        // check if 
        // if true, 
        msg.channel.sendMsgEmbed('This command will be available once this bot is approved on [DiscordBots](https://discordbots.org).')
    }
  }