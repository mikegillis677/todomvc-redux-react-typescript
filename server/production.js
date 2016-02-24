require("../dist/server/index")({
  prerender: true,
  separateStylesheet: true,
  devServer: false,
  defaultPort: 8080
});
