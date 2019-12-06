import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { utils } from 'ethers';


export const getCurrentGasPrices = async () => {
  const result = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
  const {
    fastest,
    fast,
    average,
    safeLow,
  } = await result.json();

  return {
    average: new BigNumber(utils.parseUnits(average.toString(10), 'gwei').div(10).toString()),
    fast: new BigNumber(utils.parseUnits(fast.toString(10), 'gwei').div(10).toString()),
    fastest: new BigNumber(utils.parseUnits(fastest.toString(10), 'gwei').div(10).toString()),
    safeLow: new BigNumber(utils.parseUnits(safeLow.toString(10), 'gwei').div(10).toString()),
  };
};
