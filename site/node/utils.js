var path = require('path');
var fs = require('fs');

exports.getRootCacheName = function(app) {
  return path.join(app.locals.config.dirs.cachedir, 'rootcache');
};

exports.filenameFromUri = function(req) {
  var path = req.path;
  if (!path || path.length == 0 || path[0] != '/') {
    return path;
  }
  return path.substring(1);
};

exports.getUser = function(req, app) {
  var domainIndex = req.host.indexOf(app.locals.config.host);
  if (domainIndex < 0) {
    errorExit('Domain not found in host: ' + app.locals.config.host);
  }

  // Adjust domainIndex for '.' separator                                     
  domainIndex = (domainIndex > 0) ? domainIndex - 1 : domainIndex;

  var user = req.host.substring(0, domainIndex);

  return (user == '') ? null : user;
};

exports.errorExit = errorExit;

function errorExit(msg) {
  // console.log('ERROREXIT: ' + msg);
  throw new ImmediateReturnError(msg, {'error': msg});
}

exports.ImmediateReturnError = ImmediateReturnError;
function ImmediateReturnError(message, jsonObj) {
    this.name = 'ImmediateReturnError';
    this.message = message;
    this.jsonObj = jsonObj;
}
ImmediateReturnError.prototype = Error.prototype;

//                                                                            
// Return user key directory where password is stored.                        
//                                                                            
exports.getKeyDir = function(user, app) {
  return path.resolve(path.join(app.locals.config.dirs.datadir, user, '.key'));
};

//
// Check if filename is present and is a file (or a dir)
//

exports.isPresent = function(filename, fileordir) {
  var statObj = null;

  try {
    statObj = fs.statSync(filename);
  }
  catch (e) {
    return false;
  }

  if (fileordir == 'file' && statObj.isFile()) {
    return true;
  }

  if (fileordir == 'dir' && statObj.isDirectory()) {
    return true;
  }

  return false;
};

//                                                                             
// Return user home dir                                                        
//                                                                            
exports.getUserHomeDir = function(user, app) {
  return path.resolve(path.join(app.locals.config.dirs.datadir, user));
};

//
// Validate user name
//

exports.validateUserName = function(user) {
  if (user && !/^[A-Za-z]\w{2,}$/.test(user)) {
    errorExit('Bad username ' + user);
  }
};

//
// Validate filename
//

exports.isFileNameValid = function(filename, needone) {
    var pattern = (needone) ? 
      /^(?:[\w][\w\.\-]*)(?:\/[\w][\w\.\-]*)+\/?$/ : 
      /^(?:[\w][\w\.\-]*)(?:\/[\w][\w\.\-]*)*\/?$/;
  if (!pattern.test(filename)) {
    return false;
  }

  return true;
};

exports.makeAbsolute = function(filename, app) {
  var absfile = path.join(app.locals.config.dirs.datadir, filename);
  if (absfile.indexOf(app.locals.config.dirs.datadir) != 0) {
    errorExit('Illegal filename ' + filename);
  }
  absfile = path.resolve(absfile); // Resolve to absolute path                  
  return absfile;
};

