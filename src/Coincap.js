import BigNumber from 'bignumber.js';
import WebSocket from 'ws';

export class Coincap {
  constructor(config) {
    this.config = config;
    this.connect();
  }

  connect() {
    const { asset } = this.config;
    console.log('connecting to Coincap', asset, 'feed.');
    this.ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${asset}`);
    this.ws.on('message', data => this.onMessage(data));
    this.ws.on('close', () => this.onClose());
    this.ws.on('error', () => this.onError());
  }

  onClose() {
    console.log('Coincap connection closed');
    setTimeout(() => { this.connect(); }, 1000);
  }

  onMessage(data) {
    try {
      const { asset } = this.config;
      const payload = JSON.parse(data);
      console.log('COINCAP', payload);
      this.price = new BigNumber(payload[asset]);
    } catch (e) {
      console.log('Unable to process message from Coincap:', data);
    }
  }

  stop() {
    this.connect = () => {};
    this.ws.close();
  }
}

export default Coincap;
