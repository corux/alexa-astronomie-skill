import * as path from "path";

const config = {
  entry: "./src/flash-briefing.ts",
  externals: ["aws-sdk"],
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: "raw-loader",
      },
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  output: {
    filename: "flash-briefing.js",
    library: "handler",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: false,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  target: "node",
};

export default config;
