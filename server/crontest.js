const cronNode = require('node-cron');

function cron () {
console.log("inside cron test");

cronNode.schedule('* * * * *', function() {
    console.log('running a task every minute');
  });

  console.log("outside cron test");
}


module.exports = {cron};