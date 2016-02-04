import { DymaxClient } from 'node-dymaxion';
import express from 'express';
import exhbs from 'express-handlebars';
import _ from 'lodash';
import path from 'path';

const client = new DymaxClient();

let app = express();

app.set('views', path.join(__dirname, '../', '/views'));
app.set('view engine', '.handlebars');
app.engine('.handlebars', exhbs({extname: '.handlebars'}));

app.use(express.static(path.join(__dirname, '../', 'public')));

app.get('/', (req, res) => {
  return res.send('hello world'); 
});

app.get('/map', (req, res) => {
  res.render('map');
});

app.listen(3005, () => {
  return console.log(`listening on 3005`);
});

