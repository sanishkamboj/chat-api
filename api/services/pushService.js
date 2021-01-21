// var AWS = require('aws-sdk');


module.exports = {

  sendPushNotification: function (inputs, done) {

    var sns = sails.config.AWSSNS;

    sails.log("notificaion Arn ", inputs);

    var payloadData = inputs.payloadData;

    var endpointArn = payloadData.EndpointArn;
    var titleNotification;

    async.series([
        function (createArncb) {
          if (!endpointArn) {
            sails.log("use device token", payloadData.devicetoken);
            if (!payloadData.devicetoken) {
              var error = new Error('Token not exist!!');
              error.status = 500;
              createArncb(error);
            } else {
              sns.createPlatformEndpoint({
                PlatformApplicationArn: payloadData.AWSArn,
                Token: payloadData.devicetoken
              }, function (err, data) {
                if (err) {
                  console.log("Create endpoint error : ", err.stack);
                  return createArncb(err);
                }

                sails.log("endpoint data", data);
                endpointArn = data.EndpointArn;

                var reqData = {};
                reqData.endpointArn = endpointArn;

                User.update({
                  devicetoken: payloadData.devicetoken
                }, reqData).exec(function afterwards(err, user) {
                  if (err) {
                    return createArncb(err);
                    // res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
                  }

                  if (typeof user != "undefined" && user.length > 0) {
                    sails.log("User exist");

                    createArncb();
                  } else {
                    createArncb();
                  }
                });
              });
            }
          } else {
            sails.log("endpoint exist");
            createArncb();
          }
        },
        function (sendnotificationcb) {
          if(payloadData.payloadData.groupname)
            titleNotification=payloadData.payloadData.groupname;
          else
          titleNotification=payloadData.payloadData.sender;

          sails.log("titleNotification",titleNotification);
          var payload = {
            default: payloadData.payloadData.mediadata,
            // APNS_SANDBOX: JSON.stringify({aps:{alert:"Hello and have a good day."}}),
            APNS_VOIP_SANDBOX: JSON.stringify({
              aps: {
                alert: {
                  title: "testing",
                  body: payloadData.payloadData.mediadata
                },

                sound: 'default',
                badge: 1,
                action: payloadData.payloadData
              }
            }),
            APNS_VOIP: {
              aps: {
                alert: {
                  "title": "testing",
                  "body": payloadData.payloadData.mediadata
                },
                sound: 'default',
                badge: 1,
                action: payloadData.payloadData
              }
            },
            APNS_SANDBOX: {
              aps: {
                alert: {
                  "title": titleNotification,
                  "body": payloadData.payloadData.mediadata
                },
                sound: 'default',
                badge: 1,
                action: payloadData.payloadData
              }
            },
            APNS: {
                aps: {
                  alert: {
                    "title": titleNotification,
                    "body": payloadData.payloadData.mediadata
                  },
                  sound: 'default',
                  badge: 1,
                  action: payloadData.payloadData
                }
              },
            GCM: {
              data: {
                message: payloadData.payloadData.mediadata,
                sound: 'default',
                badge: 1,
                action: payloadData.payloadData
              }
            }
          };

          // first have to stringify the inner APNS object...
          payload.APNS = JSON.stringify(payload.APNS);
          payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
          payload.APNS_VOIP = JSON.stringify(payload.APNS_VOIP);
          payload.GCM = JSON.stringify(payload.GCM);
          // then have to stringify the entire message payload
          payload = JSON.stringify(payload);
          sails.log('notification payload', payload);

          sns.publish({
            Message: payload,
            MessageStructure: 'json',
            TargetArn: endpointArn
          }, function (err, data) { 

            if (err) {

              console.log('push sent err ', err);
              console.log("notification send error ", err.message, err.code);

              if (err.code == 'EndpointDisabled') {

                pushstatus = 1;
                var params = {
                  'EndpointArn': endpointArn,
                  Attributes: {
                    'Enabled': (pushstatus == 1 ? 'true' : 'false'),
                    'Token': payloadData.devicetoken,
                  },
                };
                sns.setEndpointAttributes(params, function (err, data) {
                  if (err) {
                    console.log('Enable endpoint err ', err);
                    return sendnotificationcb(err);
                  }
                  return sendnotificationcb();
                });
              } else if (err.code == 'InvalidParameter' || err.code == 'NotFound') {
                var reqData = {};
                reqData.endpointArn = '';

                User.update({
                  devicetoken: payloadData.devicetoken
                }, reqData).exec(function afterwards(err, user) {
                  if (err) {
                    return sendnotificationcb(err);
                  }

                  if (typeof user != "undefined" && user.length > 0) {
                    return sendnotificationcb(err);
                  } else {
                    return sendnotificationcb(err);
                  }
                });
              }
            } else {
              console.log('push sent');
              console.log(data);
              sendnotificationcb();
            }
          });
        }
      ],
      function (err, finalresult) {
        if (err)
          return done(err);
        else
          done();
      }
    );

    // sns.createPlatformEndpoint({
    //     PlatformApplicationArn: inputs.AWSArn,
    //     Token: inputs.devicetoken
    //     // Token: 'e1_81zIy_sM:APA91bHGKTliL3ZF7ke5-xY5ikWULSg3YUXXded5JHh1IcGJ1_mhRa0ZLh0ddiJ3Gv1AaUKZsD_K8WLnl2nYm8USRUSPDEVv2bCRPEgCrjlcTZBYeWuPZxIMsnZzHMDYIkKYZ48wmFip'
    // }, function (err, data) {
    //     if (err) {
    //         console.log("Create endpoint error : ", err.stack);
    //         return done();;
    //     }

    //     sails.log("endpoint data", data);


    // var payload = {
    //     default: 'Wel come to Connect',
    //     APNS: {
    //         aps: {
    //             alert: inputs.message,
    //             sound: 'default',
    //             badge: 1
    //         }
    //     }
    // };

    // // first have to stringify the inner APNS object...
    // payload.APNS = JSON.stringify(payload.APNS);
    // // then have to stringify the entire message payload
    // payload = JSON.stringify(payload);

    // console.log('sending push');
    // sns.publish({
    //     Message: payload,
    //     MessageStructure: 'json',
    //     TargetArn: endpointArn
    // }, function (err, data) {
    //     if (err) {
    //         console.log(err.stack);
    //         return done();;
    //     }

    //     console.log('push sent');
    //     console.log(data);

    //     done();
    // });
    // });
  },
  createPushJob: function (inputs, done) {

    var user = inputs.user;
    var mediadata = inputs.mediadata;

    var userdevice;
    var payloadData = {};
    payloadData['EndpointArn'] = user.endpointArn;

    if (user.userdevice == 'iphone') {
      payloadData['AWSArn'] = sails.config.AWSArn.iOSArn;
    } else {
      payloadData['AWSArn'] = sails.config.AWSArn.AndroidArn;
    }
    payloadData['devicetoken'] = user.devicetoken;
    payloadData['payloadData'] = mediadata;

    Jobs.create('sendChatNotification', {
      payload: payloadData
    }).save(function (err) {
      if (err)
        return done(err);
      done();
    });
  }
};
