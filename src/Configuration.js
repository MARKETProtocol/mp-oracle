import { ethers } from 'ethers';

import { erc20Generic } from './abi/erc20Generic.js';
import { marketContract } from './abi/marketContract.js';
import { Utils } from './Utils.js';

class MissingConfigError extends Error {}

const fetchConfig = (name, fallback, hex = false) => {
  if (!process.env[name] && !fallback) {
    const message = `Missing required config ENV var ${name}`;
    throw new MissingConfigError(message);
  }

  if (hex) {
    return Utils.validateHexString(process.env[name] || fallback);
  }

  return process.env[name] || fallback;
};

export class Configuration {
  constructor(overrides = {}) {
    this.asset = fetchConfig('ASSET', overrides.ASSET);
    this.collateralPoolAddress = '0x6217D5392f6B7b6B3a9b2512A2b0Ec4CBB14c448';
    this.contracts = fetchConfig('CONTRACTS', overrides.CONTRACTS).split(',');
    this.erc20Contracts = {};
    this.marketContractAddress = fetchConfig('MARKET_CONTRACT', overrides.MARKET_CONTRACT, true);
    this.marketContracts = {};
    this.mktAddress = '0xba23485a04b897c957918fde2dabd4867838140b';
    this.network = fetchConfig('NETWORK', overrides.NETWORK || 'homestead');
    this.privateKey = fetchConfig('PRIVATE_KEY', overrides.PRIVATE_KEY);
    this.provider = overrides.provider || ethers.getDefaultProvider(this.network);
    this.receiver = fetchConfig('RECEIVER', overrides.RECEIVER, true);
    this.settleOnBand = fetchConfig('SETTLE_ON_BAND', 'true') === 'true';
    this.settleOnTime = fetchConfig('SETTLE_ON_TIME', 'true') === 'true';
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);

    this.signer = this.signer.bind(this);
  }

  get walletAddress() {
    return this.wallet.address.toLowerCase();
  }


  erc20Contract(address) {
    if (this.erc20Contracts[address]) {
      return this.erc20Contracts[address];
    }

    this.erc20Contracts[address] = new ethers.Contract(address, erc20Generic, this.wallet);

    return this.erc20Contracts[address];
  }

  marketContract(contractAddress) {
    const address = contractAddress || this.marketContractAddress;

    if (this.marketContracts[address]) {
      return this.marketContracts[address];
    }

    this.marketContracts[address] = new ethers.Contract(address, marketContract, this.wallet);

    return this.marketContracts[address];
  }

  signer(data) {
    return this.wallet.signMessage(data);
  }
}

export default Configuration;
