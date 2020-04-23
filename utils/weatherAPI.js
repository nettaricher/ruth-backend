const axios = require('axios')

const URL = 'https://weather.ls.hereapi.com/weather/1.0/report.json'
const APIKEY = 'wqp5jjfD0K_pCkoJuKex-T3n9Nlb3ynXTTTj6RvJGEQ'

module.exports = {
    async weatherForcastAPI(long, lat, product){
        const { data: weather } = await axios.get(URL + '?apiKey=' + APIKEY + '&product=' + product + '&latitude=' + lat + '&longitude=' + long)
        return weather
    }
}