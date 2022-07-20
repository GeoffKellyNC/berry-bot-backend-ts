require('dotenv').config()

const axios = require('axios')
const { ChatClient } = require('@twurple/chat');
const { RefreshingAuthProvider } = require('@twurple/auth')
const { getBotConfig } = require('../utils/botConfig')


// --- End Points ---//
const pointEndpoint: string = process.env.USER_POINTS_ENDPOINT
const modEp: string = process.env.BOT_CONFIG_MOD_ENDPOINT
const botConfigEP: string = process.env.BOT_CONFIG_BOT_ENDPOINT




export {}