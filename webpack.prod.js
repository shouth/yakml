const merge = require("webpack-merge")
const common = require("./webpack.common")

const { LicenseWebpackPlugin } = require("license-webpack-plugin")

module.exports = merge(common, {
    mode: "production",
    output: {
        publicPath: "/yakml/"
    },
    plugins: [
        new LicenseWebpackPlugin({
            addBanner: true
        })
    ]
})
