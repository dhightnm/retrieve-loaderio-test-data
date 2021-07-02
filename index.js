const converter = require('json-2-csv');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();



// Define your test ids, test names, and test parameters
var duration = 30000; // in ms, ie. 30 seconds
var buffer = 5000; // in ms, i.e. 5 second buffer (I found this to be a good buffer)
var url = 'https://api.loader.io/v2/tests'
var testSuite = {
  'Get 250rps': '081d8fc762dea4f8d5af5af48e1ce829',
  'Get 1000rps': 'a3e4b318c220056f05fee35a612f6ecd',
  'Get 3000': 'b0f6f3e32e6f14cee48589ec59643812',
  'POST 1000rps': '9e4c4708071275a9a461700ed3cceef6',
  'POST 1500rps': '0d6a4f845c60cad3a9f85e18e781634e'
};











// Core functions -- do not change anything below!
function LoaderTests() {
  this._testResults = [];
  this._testSuite = [];
}

LoaderTests.prototype.runTest = function (testName, testidx){
  console.log(`${testName} test is running...`);
  return new Promise((resolve, reject) => {
    const config = {
      method: 'put',
      url: `${url}/${testidx}/run`,
      headers: {
        'loaderio-auth': process.env.LOADER_API_KEY
      }
    };
    axios(config)
      .then(response => {
        const obj =
        this._testSuite.push({
          testName: testName,
          testidx: testidx,
          resultidx: response.data.result_id
        });
        resolve();
      })
      .catch(error => {
        console.log(`Something went wrong with running testidx: ${testidx}`);
        console.log(error);
        reject();
      })
  })
}

LoaderTests.prototype.getTestResults = async function (testName, testidx, resultidx){
  var testName = testName;
  var resultidx = resultidx;
  const config = {
    url: `${url}/${testidx}/results/${resultidx}`,
    headers: {
      'loaderio-auth': process.env.LOADER_API_KEY
    }
  }

  await axios(config)
    .then(response => {
      response.data['test_name'] = testName;
      this.write2CSV();
      this._testResults.push(response.data);
    })
    .catch(error => {
      console.log(`Something went wrong with fetching test results for resultidx: ${resultidx}`);
      console.log(error);
    });
}

LoaderTests.prototype.write2CSV = async function () {
  const writeCSVStream = fs.createWriteStream('results.csv');
  await converter.json2csv(this._testResults, (err, csv) => {
    if (err) {
      console.log('Writing from json2csv has an error: ', err);
      return;
    }
    writeCSVStream.write(csv);
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, duration + buffer));
}

async function run() {
  var newRun = new LoaderTests;
  try {
    console.log('Starting to run tests...');
    for (var key in testSuite) {
      await sleep(newRun.runTest(key, testSuite[key]))
    }
    console.log('All tests ran...');
    console.log('Fetching data and writing to CSV file...');
    await newRun._testSuite.forEach(value => {
       newRun.getTestResults(value.testName, value.testidx, value.resultidx)
    });
    console.log('results.csv file should be created / updated soon');
  } catch (err) {
    console.log('Double check testSuite has right data, and that the duration + buffer is accurate for your test settings');
    console.log(err);
  }
}

run();
