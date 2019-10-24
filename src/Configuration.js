import { ethers } from 'ethers';

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
    this.marketContract = fetchConfig('MARKET_CONTRACT', overrides.MARKET_CONTRACT, true);
    this.network = fetchConfig('NETWORK', overrides.NETWORK || 'homestead');
    this.privateKey = fetchConfig('PRIVATE_KEY', overrides.PRIVATE_KEY);
    this.provider = overrides.provider || ethers.getDefaultProvider(this.network);
    this.settleOnBand = fetchConfig('SETTLE_ON_BAND', 'true') === 'true';
    this.settleOnTime = fetchConfig('SETTLE_ON_TIME', 'true') === 'true';
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);

    this.signer = this.signer.bind(this);
  }

  get walletAddress() {
    return this.wallet.address.toLowerCase();
  }

  signer(data) {
    return this.wallet.signMessage(data);
  }
}

export default Configuration;
