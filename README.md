# retrieve-loaderio-test-data

This application helps you perform your load testing on [Loader.io](https://loader.io/) by
1. sequentially executing prepared tests with the same duration,
2. extracting test results from current run, and
3. writing to a CSV file for further analysis.


## Limitations
- assumes all tests have the same duration
- includes a buffer time between running the next test (you could change the core functions to check for the status before running subsequent tests)

## Installation
1. Fork and clone this repository.
2. Install dependencies
```bash
$ npm install
```
3. Create a `.env` file with your Loader.io API key. An example file has been provided. You can find your API key in [Settings > API](https://loader.io/settings).
4. Update `index.js` file with your test configurations.
- `duration` is the duration of your test cases.
- `buffer` is a buffer time between when the next test case runs. This is important, as Loader.io does not allow for more than one running test at once.
5. Ensure your application is running as Loader.io will need to verify your token.
6. Run to start tests. Application will retrieve all your tests for you so you don't have to input your test name and test id.
```
node index.js
```
6. A CSV file will be created once finished.

More information about Loader.io's API documentation can be found [here](https://docs.loader.io/).
