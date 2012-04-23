var http = require('http');
var fs   = require('fs');

// A library for access the streamstats web service.

// Need the following:
// - Construct stream stats object.
//   - Can fetch the KML file.
//   - Place in proper directory.
//   - callback to notify client.

// The default directory for downloading KML files:
var KMLDIR = 'public/kml';

exports.make = function (options) {
  // Validate input arguments:
	if (! (options.lat && options.lng && options.state)) {
		throw 'Invalid options: x, y, and state required.';
	}

  // Set host, path, and arguments:
	var host  = options.host || 'streamstatsags.cr.usgs.gov';
	var path  = options.path || '/ss_ws_92/Service.asmx/getStreamstats';
  var x     = options.lng;
  var y     = options.lat;
  var crs   = options.crs || 'EPSG:6.6:4326';
  var state = options.state;
  var basin = options.basin || 'C';
  var flow  = options.flow || 'C';
  var geom  = options.geom || 'KML';
  var downl = options.downl || 'False';
  var cid   = options.cid || 'StreamsApp';

  // Create the URL:
  var url = '?' +
    'x=' + x +
    '&y=' + y +
    '&inCRS=' + crs +
    '&StateNameAbbr=' + state +
    '&getBasinChars=' + basin +
    '&getFlowStats=' + flow +
    '&getGeometry=' + geom +
    '&downloadFeature=' + downl +
    '&clientID=' + cid;

  // Return the streamstats object:
  return {
    fetch: function (cb) {
      console.log('Request to StreamStats: ' + host + path + url);
      // HTTP options:
      var options = { 'host' : host,
                      'path' : path + url };

      // Send the HTTP request to streamstats web service:
      var req = http.get(options, function (res) {
        console.log('Got response: ' + res.statusCode);

        // Save the data that is returned from the request:
	      var kmldata = '';
	      res.on('data', function(chunk) {
	        kmldata += chunk.toString();
	      });
	
        // Write the KML file to disk and invoke callback:
	      res.on('end', function (args) {
          // Create unique filename:
          var time    = (new Date()).getTime();
          var kmlpath = KMLDIR + '/' + time + '.kml';
		      fs.writeFile(kmlpath, kmldata, function (err) {
			      if (err) throw err;
			      console.log(kmlpath + ' downloaded.');

            // Invoke callback with the path to the kml file:
            cb(kmlpath);
		      })
	      });
      });

    }
  };
};
