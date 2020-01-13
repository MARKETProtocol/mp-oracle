import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { uniswapExchange } from './abi/uniswapExchange';

const ONE_ETH = ethers.utils.parseEther('1.0');
const PRICE_CHECK_INTERVAL = 5000;

export class Uniswap {
  constructor(config, coincap) {
    const { provider, uniswapAddress } = config;
    this.config = config;
    this._address = uniswapAddress;
    console.log(`Setting up Uniswap long polling for ${this.address}...`);
    this._coincap = coincap;
    this._contract = new ethers.Contract(this.address, uniswapExchange, provider);
    this._lastPrice = new BigNumber(0);

    setTimeout(() => this.prep(), 0);
  }

  get address() {
    return this._address;
  }

  get coincap() {
    return this._coincap;
  }

  get contract() {
    return this._contract;
  }

  get price() {
    const { _lastPrice, coincap } = this;
    return _lastPrice.dividedBy(coincap.price);
  }

  async prep() {
    const { config, contract } = this;
    this.tokenAddress = await contract.tokenAddress();
    const tokenContract = config.erc20Contract(this.tokenAddress);
    this.tokenDecimals = await tokenContract.decimals();
  }

  async start() {
    this.updatePrice();

    this._pid = setInterval(() => this.updatePrice(), PRICE_CHECK_INTERVAL);
  }

  stop() {
    clearInterval(this._pid);
    delete this._pid;
  }

  // private

  async updatePrice() {
    const { _lastPrice, address, contract, tokenDecimals } = this;

    const tokensForOneETH = (await contract.getEthToTokenInputPrice(ONE_ETH)).toString();
    const newPrice = new BigNumber(tokensForOneETH).dividedBy(10 ** tokenDecimals);

    if (!_lastPrice.isEqualTo(newPrice)) {
      console.log(`1 ETH on ${address} Uniswap Exchange gets you ${newPrice.toFixed()}`);
      console.log(`Price is ${this.price}`);

      this._lastPrice = newPrice;
    }
  }
}
