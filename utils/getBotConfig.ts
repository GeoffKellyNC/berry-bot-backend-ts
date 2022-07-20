require('dotenv').config()
const axios = require('axios')



const botConfigEP: string | undefined = process.env.BOT_CONFIG_BOT_ENDPOINT;



type BotConfigObj = {
    accessToken: string;
    clientId: string;
    expiresIn: number;
    obtainmentTimestamp: number;
    scope: string[];
    target: string;
    id: string;
    clientSecret: string;
}


/**
 * Gets the bot config object from the Database
 * Takes no @param void
 * @returns configData
 */
 const getBotConfig = async (): Promise<BotConfigObj | undefined> => {
    try{
        const getRes: any = await axios.get(botConfigEP)
        const configData: BotConfigObj = getRes.data[0]
        return configData
    }catch(err: any){
        console.log('Error Getting Bot Config berry.js: ', err)
    }

}

module.exports = {
    getBotConfig
}