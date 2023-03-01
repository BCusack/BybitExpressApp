var express = require('express');
var router = express.Router();
var axios = require('axios');


/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api2.bybit.com/v3/private/instrument/dynamic-symbol?filter=all');
    res.type('json');
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
