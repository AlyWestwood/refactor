const cronNode = require('node-cron');

function cron () {

cronNode.schedule('0 8 * * *', function() {
    console.log('daily at 8');
  });

}


module.exports = {cron};