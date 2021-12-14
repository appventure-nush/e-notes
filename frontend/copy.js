const ncp = require('ncp').ncp;

ncp.limit = 16;

ncp("dist", "../backend/public", function (err) {
    if (err) return console.error(err);
    console.log('Done copying built files to backend');
});