// Custom Jest resolver to handle .js imports that reference .ts files

module.exports = (request, options) => {
  // If the request ends with .js and we're in client-common source directory
  if (request.endsWith('.js') && options.basedir.includes('client-common/src')) {
    // Replace .js with .ts
    const tsRequest = request.replace(/\.js$/, '.ts');
    try {
      return options.defaultResolver(tsRequest, options);
    } catch (e) {
      // If .ts file doesn't exist, try the original .js request
      return options.defaultResolver(request, options);
    }
  }
  
  // For all other requests, use the default resolver
  return options.defaultResolver(request, options);
};