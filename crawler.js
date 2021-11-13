const axios = require('axios');
const instatouch = require("instatouch");
const fs = require("fs")
const uuidv4 = require('uuid').v4
const request = require("request")
const { Webhook, MessageBuilder } = require('discord-webhook-node');
require('dotenv').config()
const hook = new Webhook(process.env.DISCORD_WEBHOOK);


const crawlingTwitter = async () => {
    try {
        const configBuffer = fs.readFileSync('./config/key.json')
        const configJson = JSON.parse(configBuffer.toString())

        const twitterBuffer = fs.readFileSync('./data/twitter.json')
        const twitterJson = JSON.parse(twitterBuffer.toString())

        const response = await axios({
            method: 'get',
            url: "https://api.twitter.com/2/tweets/search/recent",
            params: {
                query: "#UC_THINK",
                max_results: 100,
                expansions: "attachments.media_keys",
                "media.fields": "url",
                "tweet.fields": "entities,created_at",
            },
            headers: {
                Authorization: `Bearer ${configJson.twitterBearer}`
            }
        })

        // 중복&노 미디어 제거
        const responseFiltered = response.data.data.filter(e => {
            return !twitterJson.ids.includes(e.id) && e?.attachments?.media_keys[0]
        })


        // 미디어 정리
        const mediaList = {}
        for (let i of response.data.includes.media) {
            mediaList[i.media_key] = { originUrl: i.url}
        }

        // 데이터 정리
        const newDataLists = []
        const newDatas = responseFiltered.map(e => {
            const originUrl = mediaList[e.attachments.media_keys[0]].originUrl

            let fileExt = originUrl.split("?")[0].split('.')[originUrl.split("?")[0].split('.').length - 1]
            let fileName = `${uuidv4()}.${fileExt}`
            request({
                method: "GET",
                uri: originUrl,
                encoding: null
            }).pipe(fs.createWriteStream(`public/image/twitter/${fileName}`))
            
            newDataLists.push(e.id)
            return {
                id: e.id,
                url: e.entities.urls[0].url,
                thumbnail: {
                    originUrl: originUrl,
                    url: fileName
                },
                createdAt: e.created_at
            }
        })

        // 등록
        const totalData = {
            ids: [...newDataLists, ...twitterJson.ids],
            data: [...newDatas, ...twitterJson.data]
        }
        fs.writeFileSync('./data/twitter.json', JSON.stringify(totalData))
        return newDataLists.length
    } catch (err) {
        console.error("트위터 크롤링 중 오류가 발생했습니다.")
        console.error(err)
        await hook.send(`<@383801854003511296> 트위터 크롤링 과정에서 문제가 발생했습니다. ${err.name}(${err.message})`)
        await hook.send(err.stack)
    }
}

const crawlingInstagram = async () => {
    try {
        const configBuffer = fs.readFileSync('./config/key.json')
        const configJson = JSON.parse(configBuffer.toString())

        const instagramBuffer = fs.readFileSync('./data/instagram.json')
        const instagramJson = JSON.parse(instagramBuffer.toString())

        // 크롤링
        const response = await instatouch.hashtag("uc_think", {
            count: 50,
            mediaType: 'all',
            session: `sessionid=${configJson.instagramSessionId}`
        })

        if (response.count === 0) {
            await hook.send(`<@383801854003511296> 토큰 새로고침이 필요합니다.\n검색 결과가 없습니다.`)
        }

        // 중복 제거
        const responseFiltered = response.collector.filter(e => {
            return !instagramJson.ids.includes(e.id)
        })

        // 필터링
        const newDataLists = []
        const newDatas = responseFiltered.map(e => {

            let fileExt = e.thumbnail_src.split("?")[0].split('.')[e.thumbnail_src.split("?")[0].split('.').length - 1]
            let fileName = `${uuidv4()}.${fileExt}`
            request({
                method: "GET",
                uri: e.thumbnail_src,
                encoding: null
            }).pipe(fs.createWriteStream(`public/image/instagram/${fileName}`))

            newDataLists.push(e.id)
            return {
                id: e.id,
                shortcode: e.shortcode,
                thumbnail: e.thumbnail_src,
                timestamp: e.taken_at_timestamp,
                img: fileName
            }
        })

        // 등록
        const totalData = {
            ids: [...newDataLists, ...instagramJson.ids],
            data: [...newDatas, ...instagramJson.data]
        }
        fs.writeFileSync('./data/instagram.json', JSON.stringify(totalData))
        return newDataLists.length
    } catch (err) {
        console.error("인스타그램 크롤링 중 오류가 발생했습니다.")
        console.error(err)
        await hook.send(`<@383801854003511296> 인스타그램 크롤링 과정에서 문제가 발생했습니다. ${err.name}(${err.message})`)
        await hook.send(err.stack)
    }
}

const crawling = async () => {
    let res = {}
    res.twitter = await crawlingTwitter()
    res.instagram = await crawlingInstagram()

    const embed = new MessageBuilder()
        .setTitle(`인스타그램: ${res.instagram}, 트위터: ${res.twitter}`)
        .setFooter("파테슘 크롤링 알림", "https://media.discordapp.net/attachments/761930839893606400/908734997962297454/-1.png")
        .setTimestamp()
    await hook.send(embed)
}

crawling()
setInterval(() => {
    crawling()
}, 1000 * 60 * Number(process.env.CRON_TIME))

