#!/usr/bin/env node
const io = require('../utils/socketIO')
const Deploy = require('../models/deploy')
const Deltas = require('../models/delta')
const GeoObject = require('../models/geobject')
const calculateBearings = require('../utils/bearings')
var amqp = require('amqplib/callback_api')
var turf = require('turf')

const DISTANCE_ALERT = 1
const DELTAS = 'DELTAS-LOGS -> '
amqp.connect('amqp://qfrftznl:gVWftNle39STIm0A2Gdclre7Nja4W5Qk@orangutan.rmq.cloudamqp.com/qfrftznl', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queueDistance = 'deltas-distance';

        channel.assertQueue(queueDistance, {
            durable: true
        });

        console.log(DELTAS+" [*] Waiting for messages in %s. To exit press CTRL+C", queueDistance);

        channel.consume(queueDistance, function(msg) {
            console.log(DELTAS+ " [x] Received %s", msg.content.toString());
            Deploy.find({deployId: msg.content}).sort({timestamp: 1})
            .then(result => {
                let distance = turf.distance(turf.point(result[0].location.coordinates), turf.point(result[result.length-1].location.coordinates), 'kilometers')
                if(distance > DISTANCE_ALERT) {
                    console.log(`${DELTAS} Enemy ${result[0].deployId} has moved significantly! (${distance} km)`)
                    Deploy.find({deployType: "Friendly", is_valid: true, location: {
                        $near: {
                            $maxDistance: 10000,
                            $geometry:  {
                                type: "Point",
                                coordinates: result[result.length-1].location.coordinates
                            }
                        }
                    }})
                    .then(users => {
                        users.forEach(user => {
                            userDirection = calculateBearings(
                                parseFloat(user.prevlocation.coordinates[0]),parseFloat(user.prevlocation.coordinates[1]),
                                parseFloat(user.location.coordinates[0]),parseFloat(user.location.coordinates[1])
                            )
                            enemyDirection = calculateBearings(
                                parseFloat(user.location.coordinates[0]),parseFloat(user.location.coordinates[1]),
                                parseFloat(result[result.length-1].location.coordinates[0]),parseFloat(result[result.length-1].location.coordinates[1])
                            )
                            bearing = userDirection - enemyDirection
                            console.log("-------(*)()() USER DIRECTION: " + userDirection)
                            console.log("-------()(*)() ENEMY DIRECTION: " + enemyDirection)
                            console.log("-------()()(*) BEARINGS: " + bearing)
                            console.log(`${DELTAS} Enemy distance from Friendly unit: ${user.deployId}`)
                            let distance1 = turf.distance(turf.point(user.location.coordinates), turf.point(result[0].location.coordinates), 'kilometers')
                            console.log(`${DELTAS} --before: ${distance1}`)
                            let distance2 = turf.distance(turf.point(user.location.coordinates), turf.point(result[result.length-1].location.coordinates), 'kilometers')
                            console.log(`${DELTAS} --after: ${distance2}`)
                            if(distance2 < distance1){
                                console.log(DELTAS + "**************************")
                                console.log('\x1b[33m%s\x1b[0m', `${DELTAS} Enemy: ${result[0].deployId} is getting closer to Friendly unit: ${user.deployId}`)
                                console.log('\x1b[33m%s\x1b[0m', `${DELTAS} Emitting ENEMY_CLOSER_${user.deployId}`);
                                io.getio().emit("ENEMY_CLOSER_"+user.deployId, {enemy: result[result.length-1].deployId, bearing: bearing, distance: distance2});
                                console.log('\x1b[33m%s\x1b[0m',"ENEMY_CLOSER_"+user.deployId+" bearing:"+bearing);
                                let deltas = new Deltas({
                                    deployId: `${user.deployId}`,
                                    message: 'ENEMY_CLOSER',
                                    data: [{enemy: result[result.length-1], bearing: bearing, distance: distance2}]
                                }
                                )
                                deltas.save().then(res => {
                                    console.log("Deltas saved")
                                })
                                .catch(err => { console.log(err); })
                            }
                        })
                    }).catch(err => console.log(err))
                }
            })
            .catch(err => {
                console.log(err)
            })
        }, 
        {
            noAck: true
        });

        var queueSurrounding = 'deltas-surrounding';
        channel.assertQueue(queueSurrounding, {
            durable: true
        });

        console.log(DELTAS+" [*] Waiting for messages in %s. To exit press CTRL+C", queueSurrounding);

        channel.consume(queueSurrounding, function(msg) {
            let deltas;
            console.log(DELTAS+" [x] Received %s", msg.content.toString());
            Deploy.find({deployId: msg.content, is_valid: true})
            .then(enemy => {
                Deploy.find({deployType: "Enemy", location: {
                    $near: {
                        $maxDistance: 10000,
                        $geometry:  {
                            type: "Point",
                            coordinates: enemy[0].location.coordinates
                        }
                    }
                }, is_valid: true })
                .then(result => {
                    if (result.length < 3) { return }
                    let arrayCoords = []
                    let firstCoords = []
                    result.forEach(enemyDeploy => {
                        if (enemyDeploy.deployId === msg.content.toString()) {
                            firstCoords = enemyDeploy.location.coordinates
                        }
                    })
                    arrayCoords.push(firstCoords)
                    result.forEach(enemyDeploy => {
                        if (enemyDeploy.deployId !== msg.content.toString()) {
                            arrayCoords.push(enemyDeploy.location.coordinates)
                        }
                    })
                    arrayCoords = arrayCoords.slice(0,3)
                    arrayCoords.push(firstCoords)
                    Deploy.find({
                        deployType: "Friendly",
                        is_valid: true,
                        location: {
                            $geoWithin: {
                                $geometry: {
                                    type: "Polygon",
                                    coordinates: [arrayCoords]
                                }
                            }
                        }
                    })
                    .then(result => {
                        if (result.length > 0) {
                            var polygon = {
                                "type": "FeatureCollection",
                                "features": [
                                  {
                                    "type": "Feature",
                                    "properties": {},
                                    "geometry": {
                                      "type": "Polygon",
                                      "coordinates": [
                                        arrayCoords
                                      ]
                                    }
                                  }
                                ]
                            }
                            let area = turf.area(polygon)
                            console.log("---------" +turf.area(polygon)+ "-----------")
                            deltas = new Deltas({
                                deployId: `${result[0].deployId}`,
                                message: 'ENEMY_SURROUNDING',
                                data: [{surrounded: result, area: area}]
                            }
                            )
                            deltas.save().then(res => {
                                console.log(`${DELTAS} Total friendly units surrounded: ${result.length}`)
                                console.log('\x1b[33m%s\x1b[0m', "Emitting io ENEMY_SURROUNDING")
                                io.getio().emit("ENEMY_SURROUNDING_"+result[0].deployId, {surrounded: result, area: area})
                                })
                            .catch(err => { console.log(err); })
                            Deploy.find({deployType: "Friendly", location: {
                                $near: {
                                    $maxDistance: 20000,
                                    $geometry:  {
                                        type: "Point",
                                        coordinates: result[0].location.coordinates
                                    }
                                }
                            }, is_valid: true })
                            .then(friendlys => {
                                friendlys.forEach(friendly => {
                                    if(friendly.deployId != result[0].deployId){
                                        deltas = new Deltas({
                                            deployId: `${friendly.deployId}`,
                                            message: 'ASSIST_FRIENDLY',
                                            data: [result[0]]
                                        }
                                        )
                                        deltas.save().then(res => {
                                            console.log('\x1b[33m%s\x1b[0m', "Emitting io ASSIST_FRIENDLY_"+ friendly.deployId)
                                            io.getio().emit("ASSIST_FRIENDLY_"+friendly.deployId, result[0])
                                            })
                                        .catch(err => { console.log(err); })
                                    }
                                })
                            })
                        }
                        else { console.log(DELTAS + "No surrounded units")}
                    })
                    .catch(err => {
                        console.log(err)
                    })
                })
                .catch(err => {
                    console.log(err)
                })
            })
            .catch(err => {
                console.log(err)
            })
        }, 
        {
            noAck: true
        });

        var queueSuspectBuilding = 'suspect-building';
        channel.assertQueue(queueSuspectBuilding, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queueSuspectBuilding); 

        channel.consume(queueSuspectBuilding, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            Deploy.find({deployId: msg.content, is_valid: true})
            .then(enemy => {
                Deploy.find(
                {
                    location: {
                        $near: {
                            $maxDistance: 10000,
                            $geometry:  {
                                type: "Point",
                                coordinates: enemy[0].location.coordinates
                        }
                    }
                },
                deployType: "Friendly",
                is_valid: true
                })
                .then(units => {
                    console.log("Found " + units.length + " friendly units")
                    units.forEach(unit => {
                        console.log('\x1b[33m%s\x1b[0m', "Emitting io ENEMY_SPOTTED_"+ unit.deployId)
                        io.getio().emit("ENEMY_SPOTTED_"+unit.deployId, enemy[0])
                    })
                })
                GeoObject.find({location: {
                    $near: {
                        $maxDistance: 30,
                        $geometry:  {
                            type: "Point",
                            coordinates: enemy[0].location.coordinates
                        }
                    }
                } })
                .then(buildings => {
                    let res = []
                    console.log("Found suspect buildings:")
                    buildings.forEach((building)=> {
                        console.log(building.objectId)
                        switch(building.objectId){
                            case "36":
                            case "45":
                                res.push({objectId: building.objectId, riskLevel: "HIGH"})
                                break;
                            case "49":
                                res.push({objectId: building.objectId, riskLevel: "MEDIUM"})
                                break;
                            default:
                                res.push({objectId: building.objectId, riskLevel: "LOW"})
                        }
                    })
                    console.log('\x1b[33m%s\x1b[0m', "Emitting io SUSPECT_BUILDINGS with:")
                    console.log(res)
                    io.getio().emit("SUSPECT_BUILDINGS", res)
                })
            })
            .catch(e => {console.log(e)})
        }, 
        {
            noAck: true
        });

    });

    connection.once('error', err => { console.log(err)})
});