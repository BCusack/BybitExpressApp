var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', async (req, res) => {
    try {
        return res.json(await get_data(req));
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

router.post('/', async (req, res) => {
    try {
        return res.json(await get_data(req));
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;

/**
 * offload request from Get and Post methods
 * @param {request} req
 * @returns response data
 */
async function get_data(req) {
    let data = req.body;
    let period = data.period || 15;
    let count = data.count || 25;
    let start_time = Math.round(Date.now() / 1000);
    let end_time = (start_time - (count * 60 * 60)).toString();
    let start_str = start_time.toString();
    let url = `https://api2.bybit.com/public/linear/market/arrayKline?resolution=${period}&from=${end_time}&to=${start_str}`;
    let candles_collection = [];
    const response = await axios.get(url);
    let result = response.data.result.filter(x => x.list.length > 0);
    result.forEach(element => {
        let list = element.list.reverse();
        let daily_candle = get_daily_candle(element.list);
        let daily_pc_change = get_daily_pc_change(daily_candle, list[0]);
        let total_volume = get_daily_volume_sum(list, daily_candle.startAt);
        let all_daily_candles = get_daily_candles(list, daily_candle.startAt);
        candles_collection.push({ symbol: element.symbol, abs_change: Math.abs(daily_pc_change), change: daily_pc_change, volume: total_volume });
        candles_collection.sort((a, b) => b.abs_change - a.abs_change);
    });

    return candles_collection;
}

// TODO: UTC timestamp for safe time calculation
function get_daily_candle(candles) {
    const current_time_utc = new Date(new Date().setHours(11, 0, 0, 0))
    let current_day_utc = new Date(Math.floor(current_time_utc / 86400000) * 86400000);
    let start_timestamp = Math.floor(current_day_utc.getTime() / 1000);
    let candle_set = candles.filter(candle => candle.startAt === start_timestamp);
    if (candle_set.length > 0) {
        return candle_set[0];
    }
    return -1;
}

function get_daily_pc_change(daily_candle, candle_set) {
    let change = (((candle_set['close'] - daily_candle['open']) / daily_candle['open']) * 100).toFixed(3);
    return change;
}

function get_daily_volume_sum(candle_list, start_of_day) {
    let candles = get_daily_candles(candle_list, start_of_day);
    let total = candles.reduce((sum, candle) => sum + candle.volume, 0);
    return parseInt(total);
}

function get_daily_candles(candle_list, start_of_day) {
    return candle_list.filter(x => x.startAt >= start_of_day);
}