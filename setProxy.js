const { createProxyMiddleware } = require('http-proxy-middleware');
 
module.exports = function (app) {
    app.use(
        '/memo',
        createProxyMiddleware({
            target: 'http://localhost:80',
            changeOrigin: true,
        })
    );
};
