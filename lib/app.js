// import { DymaxClient } from 'node-dymaxion';
// import { FileManager } from './util/filemanager';
// import { Middleware } from './util/middleware';
import express from 'express';
import exhbs from 'express-handlebars';
import _ from 'lodash';
import path from 'path';

let config = {
  countriesDir: path.join(__dirname, '../','public', 'json', 'countries')
};

// const client = new DymaxClient();
// const files = new FileManager(config);
// const middle = new Middleware(files);

let app = express();
let router = express.Router();

app.set('views', path.join(__dirname, '../', '/views'));
app.set('view engine', '.handlebars');
app.engine('.handlebars', exhbs({
  extname: '.handlebars',
  defaultLayout: 'main'
}));
app.use(express.static(path.join(__dirname, '../', 'public')));

router.get('/', (req, res) => {
  return res.send('hello world'); 
});

router.param('filename', (req, res, next, filename) => {
  console.log('filename: ', filename);
  req.filename = filename;
  next();
});

// router.get('/convert-json/:filename', middle.fetchDymaxFile(), (req, res) => {
//   res.send(req.json).end();
// });

// router.get('/lonlat', (req, res) => {
//   let lon, lat;

//   if (req.query.position) {
//     let coords = req.query.position.split(',');
//     lon = Number(coords[0]);
//     lat = Number(coords[1]);
//   } else {
//     lon = Number(req.query.lon);
//     lat = Number(req.query.lat);
//   }

//   return client.invoke('lonlat2dymax', lon, lat).then((result) => {
//     console.log('result: ', result);
//     return res.send(result).end();
//   }).catch((err) => {
//     console.log('err: ', err);
//     return res.status(500).end()
//   });
// });

router.get('/map', (req, res) => {
  return res.render('map');
});

router.get('/dymaxion', (req, res) => {
  return res.render('dymaxion');
});

app.use('/', router);

const listener = app.listen(process.env.PORT || 3005, () => {
  return console.log(`listening on ${listener.address().port}`);
});

