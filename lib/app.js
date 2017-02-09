// import { Middleware } from './util/middleware';
import express from 'express';
import exhbs from 'express-handlebars';
import _ from 'lodash';
import path from 'path';

let config = {
  countriesDir: path.join(__dirname, '../','public', 'json', 'countries')
};

// const middle = new Middleware();

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
  return res.render('dymaxion');
});

app.use('/', router);

const listener = app.listen(process.env.PORT || 3005, () => {
  return console.log(`listening on ${listener.address().port}`);
});

