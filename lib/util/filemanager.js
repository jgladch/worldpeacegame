import Promise from 'bluebird';
import { DymaxClient } from 'node-dymaxion';
import path from 'path';

const readFile = Promise.promisify(require("fs").readFile);

class FileManager {
  constructor(config) {
    this.config = config;
    this.client = new DymaxClient();
  }

  fetchDymaxFile(filename) {
    let self = this;
    return self.readFile(filename).then((file) => {
      return self.parseFile(file);
    }).then((json) => {
      return self.mapFileToDymax(json);
    });
  }

  readFile(filename) {
    return readFile(path.join(this.config.countriesDir, filename));
  }

  parseFile(file) {
    return new Promise((resolve, reject) => {
      try {
        file = JSON.parse(file);
      } catch (e) {
        console.log('Error parsing json file', e);
        return reject('Error parsing json file', e);
      }
      return resolve(file);
    });
  }

  mapFileToDymax(json) {
    let self = this;
    return new Promise((resolve, reject) => {
      if (json && json.features && json.features[0] && json.features[0].geometry && json.features[0].geometry.coordinates) {
        let coords = json.features[0].geometry.coordinates;
        let outer = json.features[0].geometry.coordinates[0][0];
        let inner = json.features[0].geometry.coordinates[1][0];
        return self.client.invoke('convertArray', outer).then((dymaxOuter) => {
          outer = dymaxOuter;
          return self.client.invoke('convertArray', inner);
        }).then((dymaxInner) => {
          inner = dymaxInner;

          json.features[0].geometry.coordinates[0] = outer;
          json.features[0].geometry.coordinates[1] = inner;
          
          return resolve(json);
        }).catch((err) => {
          console.log('Err in mapFileToDymax: ', err);
          return reject(err);
        });

      } else {
        console.log('Error: No json to parse');
        return reject('Error: No json to parse');
      }
    });
  }
}

exports.FileManager = FileManager;