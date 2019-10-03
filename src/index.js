import { ethers } from 'ethers';

import { Coincap } from './Coincap.js';
import { Configuration } from './Configuration.js';
import { marketContract } from './abi/marketContract.js';
import { wrapAsBigNumber } from './utils/wrapAsBigNumber.js';

console.log('Configuring oracle...');

const config = new Configuration();
const coincap = new Coincap(config);

const contract = new ethers.Contract(config.marketContract, marketContract, config.wallet);

let ceiling;
let decimals;
let expiration;
let floor;
let isSettled;
let watcherPid;

// Shutdown

const shutdown = (reason = 'Contract already settled') => {
  console.log(reason);
  console.log('Goodbye!');
  process.exit(0);
};

const stopWatcher = () => {
  clearInterval(watcherPid);
};

// Core actions

const displayMetrics = () => {
  console.log(
    '------------',
    '\nFloor:',
    floor.toFixed(),
    '\nPrice:',
    coincap.price.toFixed(),
    '\nCeiling:',
    ceiling.toFixed(),
    '\n------------',
  );
};

const settle = async () => {
  console.log('Settlement Triggered...');

  const overrides = {
    gasLimit: 200000,
    gasPrice: ethers.utils.parseUnits('30', 'gwei'),
  };

  displayMetrics();

  const price = coincap.price.multipliedBy(10 ** decimals);

  return contract.oracleCallback(price, overrides);
};

const watcher = async () => {
  const { settleOnBand, settleOnTime } = config;

  if (settleOnTime && expiration < new Date()) {
    stopWatcher();
    await settle();
    shutdown('Contract settled due to time breach');
  }

  if (settleOnBand && (ceiling < coincap.price || floor > coincap.price)) {
    stopWatcher();
    await settle();
    shutdown('Contract settled due to band breach');
  }
};

// Initialization

const initWatcher = () => {
  watcherPid = setInterval(watcher, 100);
};

const main = async () => {
  console.log('Fetching contract metadata...');
  const data = await Promise.all([
    contract.EXPIRATION(),
    contract.isSettled(),
    contract.PRICE_CAP(),
    contract.PRICE_DECIMAL_PLACES(),
    contract.PRICE_FLOOR(),
  ]);

  let exp;
  let priceCap;
  let priceFloor;

  [exp, isSettled, priceCap, decimals, priceFloor] = data;

  expiration = new Date(exp * 1000);

  ceiling = (await wrapAsBigNumber(priceCap)).dividedBy(10 ** decimals);
  floor = (await wrapAsBigNumber(priceFloor)).dividedBy(10 ** decimals);

  displayMetrics();

  if (isSettled) {
    shutdown();
  }

  initWatcher();
};

// Run Lola, Run

setInterval(main, 30000);
