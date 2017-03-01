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
    collectLinks(bag);
   }
});

function collectLinks(bag) {
  var $ = bag.$;
  var allAbsoluteLinks = [];

  var absoluteLinks = $("a[href^='http']");
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
  });

 console.log('Found ' + allAbsoluteLinks.length + ' links from https://medium.com' );
 console.log('Now starting internal crawling ....');

function get5atatime() {
  if(!_.isEmpty(allAbsoluteLinks)){
    console.log(allAbsoluteLinks.length + ' more links to crawl!');
  var chunk = allAbsoluteLinks.splice(0, 5);

  var counter = [];

  chunk.forEach(function(abs){

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
          counter.push(true);
      if(counter.length === chunk.length){
          get5atatime();
      }
         }
      });
  });
}
else {
console.log("Finally " + bag.totalLinks.length + " totalLinks links stored in my1.csv");
printData(bag);
}
}
get5atatime();
}

function printData(bag)
{
  var ws = fs.createWriteStream('my2.csv');
  csv
   .write(bag.totalLinks, {headers: true})
   .pipe(ws);
}