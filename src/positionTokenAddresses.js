import { Configuration } from './Configuration.js';
import { apps } from '../ecosystem.config.js';
import { Utils } from './Utils.js';

const config = new Configuration(apps[0].env);

const main = async () => {
  await Promise.all(config.contracts.map(async (contractAddress) => {
    const address = contractAddress.toLowerCase();
    Utils.validateHexString(address);

    const contract = config.marketContract(address);
    const longAddress = await contract.LONG_POSITION_TOKEN();
    const name = await contract.CONTRACT_NAME();
    const shortAddress = await contract.SHORT_POSITION_TOKEN();

    console.log(`Contract ${name} (${address}) position tokens:`);
    console.log(`Long  - ${longAddress}`);
    console.log(`Short - ${shortAddress}`);
  }));

  process.exit();
};

main();
