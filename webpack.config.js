const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = (env, argv) => {
  // 过滤掉非法参数，只保留 webpack 相关参数
  const cleanedArgv = { mode: argv.mode || "development" };
  const isDevelopment = cleanedArgv.mode !== "production";

  return {
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "inline-source-map" : false,

    entry: {
      ui: "./src/ui/index.tsx", // UI entry point
      code: "./src/plugin/code.ts", // Plugin entry point
    },

    module: {
      rules: [
        // Typescript loader
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        // CSS loader
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        // SCSS/SASS loader
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        // Asset loader for images/svgs
        {
          test: /\.(png|jpg|gif|svg|webp)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".scss", ".css"],
    },

    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },

    // Add watch options for better performance and behavior
    watchOptions: {
      poll: 1000, // Check for changes every second
      ignored: /node_modules/,
      aggregateTimeout: 300, // Delay before rebuilding
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/ui/index.html",
        filename: "ui.html",
        chunks: ["ui"],
        inject: "body",
        cache: false, // Disable caching to ensure fresh builds
      }),
      new HtmlInlineScriptPlugin(), // 使用新的插件内联脚本
    ],
  };
};
