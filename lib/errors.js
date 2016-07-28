var createError    = require('create-error');
 
var mehAPIError  = createError('MehAPIError');
var httpUnauthorizedError = createError(mehAPIError, 'httpUnauthorizedError');

var routeError = createError('RouteError');
var subCommandNotFoundError = createError(routeError, 'subCommandNotFoundError');

module.exports = {
    mehAPIError: mehAPIError,
    httpUnauthorizedError: httpUnauthorizedError,
    subCommandNotFoundError: subCommandNotFoundError
};