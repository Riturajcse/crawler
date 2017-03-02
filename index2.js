'use strict';
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs-extra');
var csv = require('fast-csv');
var _ = require('underscore');

var urlToStart = "https://medium.com/";
console.log("Starting crawling from: " + urlToStart);

request(urlToStart, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }

  if(response && response.statusCode === 200) {
    // Parse the document body
    var body = cheerio.load(body);

    var bag = {
      totalLinks: [],
      $: body
    };
    collectLinks(bag);
  }
});

var allInternalLinks = [];

function collectLinks(bag) {
  var $ = bag.$;

  var internalLinks = $("a[href^='http']");
  internalLinks.each(function() {
    allInternalLinks.push($(this).attr('href'));
  });

  console.log('Found ' + allInternalLinks.length + ' links from https://medium.com' );
  console.log('Now starting internal crawling ....');

  getInternalLinksAsync(bag);
}

function getInternalLinksAsync(bag) {
  if (!_.isEmpty(allInternalLinks)) {

    var linksChunk = allInternalLinks.splice(0, 5);

    var counter = [];

    linksChunk.forEach(function(abs){

      request(abs, function(error, response, body) {
        if(error) {
         console.log("Error: " + error);
         getInternalLinksAsync(bag);
        }

        if(response && response.statusCode === 200) {
          // Parse the document body
          var $ = cheerio.load(body);

          var internalLinks = $("a[href^='http']");
          internalLinks.each(function() {
            var links = [];
            links.push($(this).attr('href'));
            bag.totalLinks.push(links);
            console.log('Number of Links collected: ',bag.totalLinks.length);
          });
          counter.push(true);
          if(counter.length === linksChunk.length){
            getInternalLinksAsync(bag);
          }
        }
      });
    });
  }
  else {
    console.log("Finally " + bag.totalLinks.length + " total links stored in links2.csv");
    storeLinksInFile(bag);
  }
}

function storeLinksInFile(bag)
{
  var ws = fs.createWriteStream('links2.csv');
  csv
   .write(bag.totalLinks, {headers: true})
   .pipe(ws);
}
