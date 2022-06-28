const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/api2"],
    createProxyMiddleware({
      target: "54.166.234.211",
      changeOrigin: true,
      pathRewrite: {
        "^/api2": "/api", // rewrite path
      },
    })
  );
};
