import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { apps } from '../ecosystem.config.js';
import { Configuration } from './Configuration.js';
import { getCurrentGasPrices } from './utils/getCurrentGasPrices';
import { Utils } from './Utils.js';

const config = new Configuration(apps[0].env);

const approve = async (token) => {
  const { collateralPoolAddress } = config;

  const erc20Contract = config.erc20Contract(token);
  const max256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

  const amountApproved = await erc20Contract.allowance(token, collateralPoolAddress);

  // if not, approve for max
  if (BigNumber(amountApproved).isLessThan(max256)) {
    const currentGasPrices = await getCurrentGasPrices();

    const transactionParams = {
      // gasLimit: 200000,
      gasPrice: ethers.utils.bigNumberify(currentGasPrices.fastest.plus(1000000000).toString()),
    };

    await erc20Contract.approve(collateralPoolAddress, max256, transactionParams);
  }
};

const main = async () => {
  console.log(`Approving MKT ${config.mktAddress}`);
  await approve(config.mktAddress);

  await Promise.all(config.contracts.map(async (contractAddress) => {
    const address = contractAddress.toLowerCase();
    Utils.validateHexString(address);

    const contract = config.marketContract(address);
    const name = await contract.CONTRACT_NAME();
    const longAddress = await contract.LONG_POSITION_TOKEN();
    const collateralAddress = await contract.COLLATERAL_TOKEN_ADDRESS();
    const shortAddress = await contract.SHORT_POSITION_TOKEN();

    console.log(`Approving ${name} Long (${longAddress})`);
    await approve(longAddress);

    console.log(`Approving ${name} Short (${shortAddress})`);
    await approve(shortAddress);

    console.log(`Approving ${name} Collateral (${collateralAddress})`);
    await approve(collateralAddress);
  }));

  process.exit();
};

main();
