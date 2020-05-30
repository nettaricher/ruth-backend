module.exports = calculateBearings = (lng1, lat1, lng2, lat2) => {
    radians_to_degrees = (radians) =>{
        var pi = Math.PI;
        return radians * (180/pi);
    }
    let dLon = (lng2-lng1);
    let y = Math.sin(dLon) * Math.cos(lat2);
    let x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    let brng = radians_to_degrees((Math.atan2(y, x)));
    return (360 - ((brng + 360) % 360));
}