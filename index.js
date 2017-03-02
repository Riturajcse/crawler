'use strict';

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs-extra');
var csv = require('fast-csv');
var async = require('async');

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

    async.series([
        collectLinks.bind(null, bag),
        storeLinksInFile.bind(null, bag)
      ],
      function (err) {
        console.log("Finally " + bag.totalLinks.length + " total links stored in links1.csv");
        if (err)
          console.log(err);
      }
    );
  }
});

function collectLinks(bag, next) {
  var $ = bag.$;
  var allInternalLinks = [];

  var internalLinks = $("a[href^='http']");
  internalLinks.each(function() {
    allInternalLinks.push($(this).attr('href'));
  });

  console.log('Found ' + allInternalLinks.length + ' links from https://medium.com' );
  console.log('Now starting internal crawling ....');

  async.eachLimit(allInternalLinks, 5,
    function (link, nextLink) {

      request(link, function(error, response, body) {
        if(error || !response) {
         console.log("Error: " + error);
         nextLink ();
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
          nextLink ();
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

function storeLinksInFile(bag, next)
{
  var ws = fs.createWriteStream('links1.csv');
  csv
    .write(bag.totalLinks, {headers: true})
    .pipe(ws);
  return next();
}
