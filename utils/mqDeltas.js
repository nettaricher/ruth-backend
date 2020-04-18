#!/usr/bin/env node
const io = require('../utils/socketIO')
const Deploy = require('../models/deploy')
var amqp = require('amqplib/callback_api')
var turf = require('turf')

const DISTANCE_ALERT = 1
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

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queueDistance);

        channel.consume(queueDistance, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            Deploy.find({deployId: msg.content}).sort({timestamp: 1})
            .then(result => {
                let distance = turf.distance(turf.point(result[0].location.coordinates), turf.point(result[result.length-1].location.coordinates), 'kilometers')
                if(distance > DISTANCE_ALERT) {
                    console.log("tank moved 2 km or even more!!!!!!")
                    Deploy.find({deployId: "3", is_valid: true})
                    .then(user => {
                        console.log("distance 1:")
                        let distance1 = turf.distance(turf.point(user[0].location.coordinates), turf.point(result[0].location.coordinates), 'kilometers')
                        console.log(distance1)
                        console.log("distance 2:")
                        let distance2 = turf.distance(turf.point(user[0].location.coordinates), turf.point(result[result.length-1].location.coordinates), 'kilometers')
                        console.log(distance2)
                        if(distance2 < distance1){
                            console.log("enemy is closer!!!!")
                            io.getio().emit("ENEMY_CLOSER", result[result.length-1])
                        }
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

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queueSurrounding);

        channel.consume(queueSurrounding, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
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
                    arrayCoords.push(firstCoords)
                    console.log(arrayCoords)
                    Deploy.find({
                        deployType: "Friendly",
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
                        console.log(result)
                        io.getio().emit("ENEMY_SURROUNDING",result)
                    })
                    .catch(err => {
                        console.log(err)
                        // arrayCoords.splice(0, 1)
                        // arrayCoords.splice(arrayCoords.length - 1, 1)
                        // console.log("----")
                        // console.log(arrayCoords)
                        // console.log("----")
                        // let lastElement = arrayCoords.pop();
                        // arrayCoords = [lastElement].concat(arrayCoords);
                        // arrayCoords = [firstCoords].concat(arrayCoords)
                        // arrayCoords.push(...firstCoords)
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
    });
});