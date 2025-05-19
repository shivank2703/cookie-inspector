const path = require("path");

module.exports = {
  // Entry point: the React code that starts your popup UI
  entry: { 
    popup: "./src/ui/index.js" 
  },
  // Output: where Webpack should write the compiled bundle
  output: {
    path: path.resolve(__dirname, "src/extension"),  
    filename: "[name].bundle.js"               // becomes popup.bundle.js
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,            // run all .js/.jsx files...
        exclude: /node_modules/,    // ...except those in node_modules
        use: "babel-loader"         // through Babel for ES6 + JSX support
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]     // so you can import without specifying .js/.jsx
  },
  devServer: {
    static: "./src/extension",       // serve files from the extension folder
    hot: true                        // enable hot-reload in development
  }
};