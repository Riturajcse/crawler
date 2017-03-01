var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs-extra');
var csv = require('fast-csv');
var async = require('async');
var _ = require('underscore');

var pageToVisit = "https://medium.com/";
console.log("Starting crawling from: " + pageToVisit);

request(pageToVisit, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }

   if(response.statusCode === 200) {
     // Parse the document body
     var body = cheerio.load(body);

     var bag = {
      totalLinks: [],
      $: body
     };

      async.series([
          collectLinks.bind(null, bag),
          printData.bind(null, bag)
        ],
        function (err) {
          console.log('completed!');
          console.log("Finally " + bag.totalLinks.length + " totalLinks links stored in my1.csv");
          if (err)
            console.log(err);
        }
      );

   }
});

function collectLinks(bag, next) {
  var $ = bag.$;
  var allAbsoluteLinks = [];

  var absoluteLinks = $("a[href^='http']");
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
  });

 console.log('Found ' + allAbsoluteLinks.length + ' links from https://medium.com' );
 console.log('Now starting internal crawling ....');
var cn = allAbsoluteLinks.length;
  async.eachLimit(allAbsoluteLinks, 5,
    function (abs, nextAbs) {

      request(abs, function(error, response, body) {
         if(error) {
           console.log("Error: " + error);
         }

         if(response.statusCode === 200) {
           // Parse the document body
           var $ = cheerio.load(body);

            var absoluteLinks = $("a[href^='http']");
            absoluteLinks.each(function() {
                var links = [];
                links.push($(this).attr('href'));
                bag.totalLinks.push(links);
            });
            nextAbs ();
         }
      });
    },
    function (err) {
      if (err)
        console.log('error found: ', err);
      return next();
    }
  );
}

function printData(bag, next)
{
  var ws = fs.createWriteStream('my1.csv');
  csv
   .write(bag.totalLinks, {headers: true})
   .pipe(ws);
   console.log('done');
   return next();
}