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

        var queue = 'deltas-messages';

        channel.assertQueue(queue, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
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
    });
});