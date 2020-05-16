const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: "./src/main.tsx",
    output: {
        path: `${__dirname}/build`,
        filename: "app.bundle.[hash].js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [ /node_modules/ ],
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js" ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: `${__dirname}/index.html`,
        }),
        new CopyWebpackPlugin([
            {
                from: `${__dirname}/public`,
            }
        ])
    ]
}
