import TestBot from './classes/TestBot.js'

// import test suites
import commandTest from './cases/commands.test.js'
import apiTest from './cases/api.test.js'
import gameTest from './cases/games.test.js'
import DummyAccount from './classes/DummyAccount.js'

export default async client => {
    // Initialize
    const dummyTokens = process.env.DISCORD_TEST_DUMMY_TOKENS.split(',')
    const channel = process.env.TEST_CHANNEL
    const dummyBots = [
        new DummyAccount(dummyTokens[0], channel),
        new DummyAccount(dummyTokens[1], channel)
    ]
    const tester = new TestBot(process.env.DISCORD_TEST_BOT_TOKEN, client, channel, ...dummyBots)
    await tester.init()
    
    await apiTest(client, tester)
    await commandTest(client, tester)
    await gameTest(client, tester)
}