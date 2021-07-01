const converter = require('json-2-csv');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();



// Define your test ids, test names, and test parameters
var duration = 30000; // in ms, ie. 30 seconds
var buffer = 5000; // in ms, i.e. 5 second buffer (I found this to be a good buffer)
var url = 'https://api.loader.io/v2/tests'
var testSuite = {
  '<your test name>': '<your test id>',
  '<your test name>': '<your test id>'
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

LoaderTests.prototype.getTestResults = async function (testName, testidx, resultidx, datetime){
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
      this.write2CSV(datetime);
      this._testResults.push(response.data);
    })
    .catch(error => {
      console.log(`Something went wrong with fetching test results for resultidx: ${resultidx}`);
      console.log(error);
    });
}

LoaderTests.prototype.write2CSV = async function (datetime) {
  const writeCSVStream = fs.createWriteStream(`results_${datetime}.csv`);
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
    const datetime = Date.now();
    await newRun._testSuite.forEach(value => {
       newRun.getTestResults(value.testName, value.testidx, value.resultidx, datetime)
    });
    console.log('results.csv file should be created / updated soon');
  } catch (err) {
    console.log('Double check testSuite has right data, and that the duration + buffer is accurate for your test settings');
    console.log(err);
  }
}

run();
