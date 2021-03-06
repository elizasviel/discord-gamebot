import util from 'util'
import options from '../config/options.js'

// configure Discord logging
export const stdout = {
    error: console.error,
    log: console.log
}

export const config = client => {
    // Cache logging channel
    client.channels.fetch(options.loggingChannel, true).then(channel => {
        console = {
            log: (...args) => {
                stdout.log(...args)
                if(!client.readyAt) return
                if(channel) channel.sendMsgEmbed(util.inspect(...args))
            },
            error: (...args) => {
                stdout.log(...args)
                if(!client.readyAt) return
                if(channel) channel.sendMsgEmbed(util.inspect(...args), 'Error', options.colors.error)
            }
        }
    }).catch(stdout.error)
}