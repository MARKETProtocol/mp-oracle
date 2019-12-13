import { Configuration } from './Configuration.js';
import { apps } from '../ecosystem.config.js';
import { Utils } from './Utils.js';

const config = new Configuration(apps[0].env);

const main = async () => {
  await Promise.all(config.contracts.map(async (contractAddress) => {
    const address = contractAddress.toLowerCase();
    Utils.validateHexString(address);

    const contract = config.marketContract(address);
    const isSettled = await contract.isSettled();
    const name = await contract.CONTRACT_NAME();
    const price = await contract.settlementPrice();

    console.log(`Contract ${name} (${address})`);
    console.log(`Settled ${isSettled}`);
    console.log(`Price ${price}`);
    console.log('-----');
  }));

  process.exit();
};

main();
