const axios = require('axios')
const { sendNotify } = require('./sendNotify.js')
const dotenv = require('dotenv')
dotenv.config()

let msg = ''
function sendNotifyFn(msg) {
    sendNotify('掘金库存监控', msg)
}

const defaultOptions = {
    method: 'GET',
    data: {},
    params: {},
    headers: {
        origin: 'https://juejin.cn',
        pragma: 'no-cache',
        referer: 'https://juejin.cn/',
        'sec-ch-ua':
            '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
    },
}

function assignOption(ops1, ops2) {
    let ops = Object.assign({}, ops1, ops2)
    let keys = Object.keys(ops1)
    keys.forEach(item => {
        if (typeof ops1[item] === 'object' && !Array.isArray(ops1[item])) {
            ops[item] = Object.assign({}, ops1[item], ops2[item] || {})
        }
    })
    return ops
}

function request(options) {
    return new Promise((resolve, reject) => {
        axios(assignOption(defaultOptions, options))
            .then(res => {
                let data = res.data || {}
                if (data.err_no === 0) {
                    resolve(data.data)
                } else {
                    msg += `请求失败: ${data.err_msg} \n`
                    reject(data)
                }
            })
            .catch(err => {
                msg += `请求失败: ${err.message} \n`
                reject(err)
            })
    })
}

/**
 * 获取掘金兑换物品
 * @param {*} data 
 * @returns 
 */
function get_benefit(data) {
    return request({
        method: 'POST',
        url: 'https://api.juejin.cn/growth_api/v1/get_benefit_page?aid=2608&uuid=7384322671230666291&spider=0',
        data: data ? data : {
            "page_no": 1,
            "page_size": 999,
            "type": 1,
            "got_channel": 2
        }
    })
}

const getProcessEnv = (key) => {
    let res = []
    if (process.env[key]) {
        if (process.env[key].indexOf('&') > -1) {
            res = process.env[key].split('&');
        } else if (process.env[key].indexOf('\n') > -1) {
            res = process.env[key].split('\n');
        } else {
            res = [process.env[key]];
        }
    }
    return res
}

async function init() {
    console.log('=================开始执行watch=================')
    let rstArray = []
    const watchList = getProcessEnv('JUEJIN_WATCH')
    if (watchList.length === 0) {
        console.log('请先设置要监控的物品')
        return
    }
    await get_benefit().then(res => {
        watchList.forEach(i => {
            const ll = res.find(item => item?.lottery?.lottery_base?.lottery_name?.includes(i))
            if (ll && ll.today_cap > 0) {
                // 有库存
                rstArray.push('【' + i + '】目前库存: ' + ll.today_cap)
            }
        })
    })
        .catch(err => {
            // 异常，发送通知
            console.error(err)
            sendNotifyFn(err)
            console.log('=================异常结束watch=================')
            return
        })
    if (rstArray.length > 0) {
        // 有库存，发送
        msg = rstArray.join('\n')
        console.log(msg)
        sendNotifyFn(msg)
    }
    console.log('=================执行完毕watch=================')
}

const watch = async () => {
    await init()
}

watch()