//this server uses ES6 syntax
//use nodemon to launch this server
import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
console.log(JSON.stringify(import.meta));
const moduleURL = new URL(import.meta.url);
console.log(`pathname ${moduleURL.pathname}`);
console.log(`dirname ${path.dirname(moduleURL.pathname)}`);
const __dirname = path.dirname(moduleURL.pathname);
// __dirname means the current folder

// use body-parser to parse form request
app.use(bodyParser.urlencoded({
  extended: true
}));
// mount the path of static files under ./src to /assets
app.use('/assets', express.static(path.join(__dirname, 'src')));
// mount distributable jquery path to '/asset/jquery' as middleware
app.use('/assets/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

app.get("/", function(req, res) {
  let index_html = path.join(__dirname, 'src/index.html');
  if (fs.existsSync(index_html)){
    res.sendFile(index_html);
  }else{
    res.send('Sorry, the page you are looking for doesn\'t exist!');
  }
});

app.listen(3600, function() {
  console.log("local host 3600");
  // check localhost:3500 at your browser
});
