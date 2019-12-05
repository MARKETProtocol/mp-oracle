import { Configuration } from './Configuration.js';
import { apps } from '../ecosystem.config.js';
import { Utils } from './Utils.js';

const config = new Configuration(apps[0].env);

const main = async () => {
  await Promise.all(config.contracts.map(async (contractAddress) => {
    const address = contractAddress.toLowerCase();
    Utils.validateHexString(address);

    const contract = config.marketContract(address);
    const oracle = await contract.ORACLE_HUB_ADDRESS();

    console.log(`Contract ${address} oracle is ${oracle}`);
  }));

  process.exit();
};

main();
