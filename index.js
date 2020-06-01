const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION,
});

exports.handler = async (event, context) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));

  let body;
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };

  let params = {
    TableName: 'track-map',
    KeyConditionExpression: '#deviceId = :deviceId',
    ExpressionAttributeNames: {
      '#deviceId': 'deviceId',
    },
    ExpressionAttributeValues: {
      ':deviceId': 'NHD184JH',
    },
  };

  try {
    //console.log(params);
    body = await dynamo.query(params).promise();
    body = JSON.stringify(body);
  } catch (err) {
    //console.error(err);
    statusCode = '400';
    body = 'Bad request';
  }

  return {
    statusCode,
    body,
    headers,
  };
};
