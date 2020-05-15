const merge = require("webpack-merge")
const common = require("./webpack.common")

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        open: true,
        host: "0.0.0.0",
        compress: true
    }
})
