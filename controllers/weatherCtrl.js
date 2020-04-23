require('../utils/weatherAPI')
const forcast = require('../utils/weatherAPI') 

module.exports = {
    async fetchWeather(req, res, next){
        const{
            lat = null,
            long = null,
            product = null
        } = req.body
        let weatherForcast = await forcast.weatherForcastAPI(lat, long, product)
        res.status(201).json(weatherForcast)
    }
}