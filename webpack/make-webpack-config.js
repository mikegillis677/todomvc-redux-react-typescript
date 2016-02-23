var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var StatsPlugin = require("stats-webpack-plugin");
var loadersByExtension = require("../config/loadersByExtension");
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');

var webpack_isomorphic_tools_plugin =
  // webpack-isomorphic-tools settings reside in a separate .js file
  // (because they will be used in the web server code too).
  new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

module.exports = function(options) {
  var entry;

  if (options.development) {
    webpack_isomorphic_tools_plugin.development();
  }

  if (options.development) {
    entry = {
      todos: [
        'webpack-dev-server/client?http://0.0.0.0:2992',
        'webpack/hot/only-dev-server',
        './client/index'
      ],
      serverSide: [
        './server/index'
      ]
    };
  } else {
    entry = {
      todos: './client/index',
      serverSide: [
        './server/index'
      ]
    }
  }

  var loaders = {
    "json": {
      loaders: ["json-loader"]
    },
    "js": {
      loaders: options.development ? ["react-hot", "babel-loader"] : ["babel-loader"],
      include: [
        path.join(__dirname, "..", "client"),
        path.join(__dirname, "..", "server")
      ],
      exclude: [
        path.join(__dirname, "..", "node_modules"),
        path.join(__dirname, "..", "build")
      ]
    },
    "ts|tsx": {
      loaders: ['react-hot', 'ts-loader'],
      exclude: [
        path.join(__dirname, "..", "node_modules"),
        path.join(__dirname, "..", "build")
      ]
    }
  };

  var stylesheetLoaders = {
    "css": 'css-loader'
  };

  var publicPath = options.development
    ? "http://localhost:2992/_assets/"
    : "/_assets/";

  var plugins = [
    new webpack.PrefetchPlugin("react"),
    new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
/*
    new StatsPlugin(path.join(__dirname, "..", "build", options.development ? "stats-dev.json" : "stats.json"), {
      chunkModules: true
    })
*/
    new StatsPlugin(path.join(__dirname, "..", options.development ? "webpack-stats-dev.json" : "webpack-stats.json"), {
      chunkModules: true
    }),
    webpack_isomorphic_tools_plugin
  ];

  Object.keys(stylesheetLoaders).forEach(function(ext) {
    var stylesheetLoader = stylesheetLoaders[ext];
    if(Array.isArray(stylesheetLoader)) stylesheetLoader = stylesheetLoader.join("!");
    if(options.separateStylesheet) {
      stylesheetLoaders[ext] = ExtractTextPlugin.extract("style-loader", stylesheetLoader);
    } else {
      stylesheetLoaders[ext] = "style-loader!" + stylesheetLoader;
    }
  });

  if(options.separateStylesheet) {
    plugins = plugins.concat([
      new ExtractTextPlugin("[name].css", {
        allChunks: true
      })
    ]);
  }

  if(options.minimize) {
    plugins = plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin()
    ]);
  }

  if(options.minimize) {
    plugins = plugins.concat([
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new webpack.NoErrorsPlugin()
    ]);
  }

  if (options.development) {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        __DEVELOPMENT__: true,
        __DEVPANEL__: options.devPanel
      })
    ]);
  } else {
    plugins = plugins.concat([new webpack.DefinePlugin({
      __DEVELOPMENT__: false,
      __DEVPANEL__: false
    })]);
  }

  return {
    context: path.join(__dirname, ".."),
    entry: entry,
    output: {
      path: path.join(__dirname, "..", "build", options.development ? "development" : "public"),
      publicPath: publicPath,
      filename: options.development ? "[id].js" : "[name].js",
      chunkFilename: "[id].js",
      sourceMapFilename: "debugging/[file].map",
      pathinfo: options.debug
    },
    target: 'web',
    module: {
      loaders: loadersByExtension(loaders).concat(loadersByExtension(stylesheetLoaders))
    },
    devtool: options.devtool,
    debug: options.debug,
    resolveLoader: {
      root: path.join(__dirname, '..', "node_modules")
    },
    resolve: {
      root: path.join(__dirname, ".."),
      modulesDirectories: ['node_modules'],
      extensions: ["", ".web.js", ".js", ".jsx", ".ts", ".tsx"]
    },
    plugins: plugins,
    devServer: {
      stats: {
        cached: false
      }
    },
    assets: {
      images: {
        extensions: [
          'jpeg',
          'jpg',
          'png',
          'gif'
        ],
        parser: WebpackIsomorphicToolsPlugin.url_loader_parser
      },
      fonts: {
        extensions: [
          'woff',
          'woff2',
          'ttf',
          'eot'
        ],
        parser: WebpackIsomorphicToolsPlugin.url_loader_parser
      },
      svg: {
        extension: 'svg',
        parser: WebpackIsomorphicToolsPlugin.url_loader_parser
      },
      style_modules: {
        extensions: ['less','scss'],
        filter: function(module, regex, options, log) {
          if (options.development) {
            // in development mode there's webpack "style-loader",
            // so the module.name is not equal to module.name
            return WebpackIsomorphicToolsPlugin.style_loader_filter(module, regex, options, log);
          } else {
            // in production mode there's no webpack "style-loader",
            // so the module.name will be equal to the asset path
            return regex.test(module.name);
          }
        },
        path: function(module, options, log) {
          if (options.development) {
            // in development mode there's webpack "style-loader",
            // so the module.name is not equal to module.name
            return WebpackIsomorphicToolsPlugin.style_loader_path_extractor(module, options, log);
          } else {
            // in production mode there's no webpack "style-loader",
            // so the module.name will be equal to the asset path
            return module.name;
          }
        },
        parser: function(module, options, log) {
          if (options.development) {
            return WebpackIsomorphicToolsPlugin.css_modules_loader_parser(module, options, log);
          } else {
            // in production mode there's Extract Text Loader which extracts CSS text away
            return module.source;
          }
        }
      }
    }
  };
};
