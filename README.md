# crawler
A nodeJs app

Steps to run in local

- clone project in your local.(crawlerApp)
- cd/crawlerApp
- npm install
- node index.js (this is using async library)
- console will keep showing number of links collected
- once completed it will save the file in csv and show the total number of links collected
- node index2.js (this is not using any async library)
- console will keep showing number of links collected
- once completed it will save the file in csv and show the total number of links collected

```
For async library links are stored in link1.csv and for the other one
its stored in links2.cssdsdv
```
Note: It might be possible that some links are not responding so it will keep trying and if gets a `ETIMEOUT` then will show the error message and proceed for the next link.
