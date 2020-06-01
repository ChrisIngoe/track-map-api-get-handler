const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');
const expect = chai.expect;

const locations = [
  {
    timestamp: 1590489797000,
    coords: {
      altitude: 130.3000030517578,
      heading: 255.95541381835938,
      longitude: -0.3262344,
      latitude: 50.3947595,
      speed: 5.421376705169678,
      accuracy: 8.595999717712402,
    },
    deviceId: 'NHD184JH',
  },
];

describe('when retrieving locations from DynamoDB', function () {
  let AWS;
  let queryFunc;
  let scriptToTest;

  beforeEach(function () {
    queryFunc = sinon.stub();

    AWS = {
      DynamoDB: {
        DocumentClient: sinon.stub().returns({
          query: queryFunc,
        }),
      },
    };

    scriptToTest = proxyquire('../index', {
      'aws-sdk': AWS,
    });
  });

  it('pass the deviceId to the database query', async () => {
    queryFunc.withArgs(sinon.match.any).returns({
      promise: () => {},
    });
    await scriptToTest.handler({}, {});
    expect(queryFunc.calledOnce).to.be.true;
    expect(queryFunc.firstCall.args.length).to.equal(1);
    expect(queryFunc.firstCall.args[0].TableName).to.equal('track-map');
    expect(queryFunc.firstCall.args[0].KeyConditionExpression).to.equal('#deviceId = :deviceId');
    expect(queryFunc.firstCall.args[0].ExpressionAttributeNames['#deviceId']).to.equal('deviceId');
    expect(queryFunc.firstCall.args[0].ExpressionAttributeValues[':deviceId']).to.equal('NHD184JH');
  });

  it('should return locations array for a valid deviceId', async () => {
    queryFunc.withArgs(sinon.match.any).returns({
      promise: () => locations,
    });
    const data = await scriptToTest.handler({}, {});
    expect(data).is.not.undefined;
    expect(data.statusCode).equals('200');
    expect(data.body).is.not.undefined;
    expect(JSON.parse(data.body).length).equals(1);
    expect(JSON.parse(data.body)[0].timestamp).equals(locations[0].timestamp);
    expect(JSON.parse(data.body)[0].deviceId).equals(locations[0].deviceId);
    expect(JSON.parse(data.body)[0].coords.altitude).equals(locations[0].coords.altitude);
    expect(JSON.parse(data.body)[0].coords.heading).equals(locations[0].coords.heading);
    expect(JSON.parse(data.body)[0].coords.longitude).equals(locations[0].coords.longitude);
    expect(JSON.parse(data.body)[0].coords.latitude).equals(locations[0].coords.latitude);
    expect(JSON.parse(data.body)[0].coords.speed).equals(locations[0].coords.speed);
    expect(JSON.parse(data.body)[0].coords.altitude).equals(locations[0].coords.altitude);
    expect(JSON.parse(data.body)[0].coords.accuracy).equals(locations[0].coords.accuracy);
  });

  it('should return status 400 if DynamoDB errors', async () => {
    queryFunc.withArgs(sinon.match.any).throws();
    const data = await scriptToTest.handler({}, {});
    expect(data).is.not.undefined;
    expect(data.statusCode).equals('400');
    expect(data.body).equals('Bad request');
  });
});
