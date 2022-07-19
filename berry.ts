require('dotenv').config()
const { RefreshingAuthProvider } = require('@twurple/auth')
const { ChatClient } = require('@twurple/chat');

const { handleChatLog } = require('./util/logChat')

const path = require('path')
const axios = require('axios')

const botConfigEP: string = process.env.BOT_CONFIG_BOT_ENDPOINT;
const pointEndpoint: string = process.env.USER_POINTS_ENDPOINT



// Interface Declarations

interface BotConfigObject {
    accessToken?: string;
    clientId?: string;
    expiresIn?: number;
    obtainmentTimestamp?: number;
    scope?: string[];
    target?: string;
    id?: string;
    clientSecret?: string;
}

  /**
   * Gets the Target out of the BotConfig data
   * @param void does not take any parameters
   * @returns the target as a string
   */
const getTarget = async (): Promise<string> => {
    const res = await axios.get(botConfigEP)
    const target: string = res.data[0].target
    return target
}

/**
 * Gets the bot config object from the Database
 * Takes no @param void
 * @returns configData
 */
const getBotConfig = async (): Promise<BotConfigObject> => {
    const getRes = await axios.get(botConfigEP)
    const configData: object = getRes.data[0]
    return configData
}


/**
 * This function will refresh bot config data with new tokens after bot loosed connection
 * @param data Object from authProvider inside berry(). Ran to refresh after disconnect
 * @returns void
 */
const refreshConfig = async (data: object): Promise<void> => {
    const getRes = await axios.get(botConfigEP)
    const oldData = getRes.data[0]
    const newData = {...oldData, ...data }
    const postRes = await axios.patch(`${botConfigEP}/1`, newData)
}

/**
 * Used to see how many moderation points the user has accumulated over time. More points = bad apple
 * @param user : string This is the username of who issues the !points command found in berry(). 
 * @returns : number The number of points the user currently has
 */
const getPoints = async (user: string): Promise<number> =>{
    try{
        const res = await axios.get(pointEndpoint)
        const pointsData: any = res.data
        const userObj: {points: number} = await pointsData.find(account => account.user === user)
        const userPoints: number = userObj.points
        return userPoints
    }catch(err: any){
        console.log('Error Getting Points berry.js: ', err)
    }
}


/**
 * Main Berry Function
 * Takes no @param void
 * @returns void
 */
async function berry(): Promise<void> {
    const TARGET: string = await getTarget()
    const configData: BotConfigObject = await getBotConfig()
    const clientId: string = configData.clientId
    const clientSecret: string = configData.clientSecret
    const authProvider: object = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => await refreshConfig(newTokenData)
        },
        configData
    );

    const chatClient: any = new ChatClient({
        authProvider,
        channels: [TARGET]
    })
    await chatClient.connect()

    const date: object = new Date()
    console.log(`Berry PUB Dev connected to ${TARGET} at ${date.toLocaleString()}`)

    /**
     * Fires when someone issues sends a message in the chat
     * @param channel: string / Channel name the message was sent in 
     * @param user: string / Username of the person that sent the chat
     * @param message: string / The text of the message that was sent
     * @param self: string / This returns your username
     */
    chatClient.onMessage( async (channel:string, user: string, message: string, self: string): Promise<void> => {
        console.log(`
        USER 🧍: ${user}  ➡ 
        MESSAGE 💬: ${message} ➡ 
        CHANNEL 📺:  ${channel} ➡ 
        📆 ${date}`)

        switch (message) {
            case '!ping':
                chatClient.say(channel, 'Pong!')
                break;
            case '!points':
                const userPoints = await getPoints(user)
                chatClient.say(channel,`${user} you have ${userPoints} points.`)
                break;
            default:
                break;
        }
    })

    /**
     * Fires when someone subscribes to the targets channel
     * @param channel: string This is the same as the target. Name of current twitch channel
     * @param user: string Username of the person who subscribed
     * @param subInfo: object An object containing information about the Sub event such as months they subbed for
     */
    chatClient.onSub( (channel: string, user: string, subInfo: {months: number}) => {
        chatClient.say(channel, `Thanks @${user} for subscribing! - ${subInfo.months}`)
    })

    /**
     * Fires when someone re-subscribes to the targets channel
     * @param channel: string This is the same as the target. Name of current twitch channel
     * @param user: string Username of the person who subscribed
     * @param subInfo: object An object containing information about the Sub event such as months they subbed for
     */
    chatClient.onResub( (channel: string, user: string, subInfo: {months: number}) => {
        chatClient.say(channel, `Thanks @${user} for re-subbing for ${subInfo.months} months!!`)
    })

}

module.exports = { berry }


