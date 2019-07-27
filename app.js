console.log("Bzz! Bot is running");

const request = require('request');
const fs = require('fs');
const Twit = require('twit');
const config = require('./config');
const fetch = require('node-fetch');

let jsondata;
var T = new Twit(config.keys);


function apod() {
   fetch("https://api.nasa.gov/planetary/apod?api_key=" + config.api)
      .then(function(u) {
         return u.json();
      }).then(
         function(json) {
            jsondata = json;
            download(jsondata.url, 'photo.jpg')
         }
      )
}

function download(url, filename) {
   request.head(url, downloading);

   function downloading(err, res, body) {
      request(url).pipe(fs.createWriteStream(filename)).on('close', finished);
   }

   function finished() {
      var b64content = fs.readFileSync('photo.jpg', {
         encoding: 'base64'
      });
      T.post('media/upload', {
         media_data: b64content
      }, uploaded);
   }
}



function uploaded(err, data, response) {

   var mediaIdStr = data.media_id_string;
   var params = {
      status: jsondata.title + ' by ' + jsondata.copyright + '\n' + jsondata.date,
      media_ids: [mediaIdStr]
   }
   T.post('statuses/update', params, tweeted);
};

function tweeted(err, data, response) {
   if (err) {
      console.log(err);
   } else {
      console.log('Success: ' + data.text);
   }
};


apod();
setInterval(apod, 1000 * 60 * 60 * 24);
