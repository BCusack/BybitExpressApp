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
        candles_collection.push({ symbol: element.symbol, data: element.list });
    });

    return candles_collection;
}
