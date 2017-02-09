import zerorpc from 'zerorpc';
import { defaults } from 'lodash';
import Promise from 'bluebird';

/**
 * Promisified Class to interact with RPC Python Server
 */
class DymaxClient {
  constructor(opts = {}) {
    opts = defaults(opts, {
      address: 'tcp://127.0.0.1:4242'
    });

    this.client = new zerorpc.Client();
    this.client.connect(opts.address);
    this.client.on('error', (err) => {
      console.error('RPC client error:', err);
    });
  }

  /**
   * Promisified invoke function
   * @param {arguments} ...args The arguments to pass to `invoke`
   *    NOTE: since this class is promisified, we don't pass a callback to `invoke`
   */
  invoke(...args) {
    return new Promise((resolve, reject) => {
      
      // Add a promise-aware callback into the args list
      args.push((err, res, more) => {
        if (err) {
          console.log('Error in RPC Client: ', err);
          return reject(err);
        } else {
          return resolve(res, more);
        }
      });

      this.client.invoke.apply(this.client, args);
    });
  }
}

exports.DymaxClient = DymaxClient;