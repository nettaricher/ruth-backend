#!/usr/bin/env node
const io = require('../utils/socketIO')
const Deploy = require('../models/deploy')
const Deltas = require('../models/delta')
const GeoObject = require('../models/geobject')
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
                            console.log(`${DELTAS} Enemy distance from Friendly unit: ${user.deployId}`)
                            let distance1 = turf.distance(turf.point(user.location.coordinates), turf.point(result[0].location.coordinates), 'kilometers')
                            console.log(`${DELTAS} --before: ${distance1}`)
                            let distance2 = turf.distance(turf.point(user.location.coordinates), turf.point(result[result.length-1].location.coordinates), 'kilometers')
                            console.log(`${DELTAS} --after: ${distance2}`)
                            if(distance2 < distance1){
                                console.log(DELTAS + "**************************")
                                console.log('\x1b[33m%s\x1b[0m', `${DELTAS} Enemy: ${result[0].deployId} is getting closer to Friendly unit: ${user.deployId}`)
                                console.log('\x1b[33m%s\x1b[0m', `${DELTAS} Emitting ENEMY_CLOSER_${user.deployId}`);
                                let deltas = new Deltas({
                                    deployId: `${user.deployId}`,
                                    message: 'ENEMY_CLOSER',
                                    data: result[result.length-1]
                                }
                                )
                                deltas.save().then(res => {
                                    io.getio().emit("ENEMY_CLOSER_"+user.deployId, result[result.length-1]);
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
                            var polygons = {
                                "type": "FeatureCollection",
                                "features": [
                                  {
                                    "type": "Feature",
                                    "properties": {},
                                    "geometry": {
                                      "type": "Polygon",
                                      "coordinates": [[
                                        arrayCoords
                                      ]]
                                    }
                                  }
                                ]
                            }
                            console.log("---------" +turf.area(polygon)+ "-----------") 
                            deltas = new Deltas({
                                deployId: `${result[0].deployId}`,
                                message: 'ENEMY_SURROUNDING',
                                data: result
                            }
                            )
                            deltas.save().then(res => {
                                console.log(`${DELTAS} Total friendly units surrounded: ${result.length}`)
                                console.log('\x1b[33m%s\x1b[0m', "Emitting io ENEMY_SURROUNDING")
                                io.getio().emit("ENEMY_SURROUNDING_"+result[0].deployId, result)
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
                                            data: result[0]
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
                GeoObject.find({location: {
                    $near: {
                        $maxDistance: 20,
                        $geometry:  {
                            type: "Point",
                            coordinates: enemy[0].location.coordinates
                        }
                    }
                } })
                .then(result => {
                    console.log("Found " + result.length + " objects")
                    console.log("updating " + enemy[0].deployId + " with objects")
                    Deploy.updateOne({deployId: enemy[0].deployId, is_valid: true} , {nearObject: result})
                    .then(res => { 
                        //console.log("***")
                    })
                    .catch(err => {})
                    let validDate = new Date(enemy[0].timestamp)
                    Deploy.find({deployId: enemy[0].deployId, is_valid: false}).sort({timestamp: -1})
                    .then(deploys => {
                        console.log("comparing with " + deploys.length + " reports")
                        let objectsIds = []
                        deploys.forEach(element => {
                            let invalidDate = new Date(element.timestamp)
                            if (validDate - invalidDate > 10000) {
                                element.nearObject.forEach(obj => {
                                    result.forEach(validObj => {
                                        if(validObj.objectId === obj.objectId){
                                            objectsIds.push(validObj.objectId)
                                        }
                                    })
                                })
                            }
                        })
                        let objSet = new Set(objectsIds)
                        console.log("suspicious object ids set -> ")
                        console.log(objSet)
                    })
                    io.getio().emit("SUSPECT-BUILDING",objSet)
                .catch(err => {
                    console.log(err)
                })
            })
        })
            .catch(err => {
                console.log(err)
            })
        }, 
        {
            noAck: true
        });

    });

    connection.once('error', err => { console.log(err)})
});