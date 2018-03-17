'use strict';
//这里面的路径都是以package.json文件为参考的
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//代码压缩工具，用来压缩代码和清除未使用的代码
const uglifyJSPlugin = require('uglifyjs-webpack-plugin');
//样式文件代码分离
const extractCSS = new ExtractTextPlugin({
    filename: 'static/css/[name].[contenthash]-css.css',
    allChunks: true
});

const extractSCSS = new ExtractTextPlugin({
    filename: 'static/css/[name].[contenthash]-scss.css',
    allChunks: true
});

const extractVueSCSS = new ExtractTextPlugin({
    filename: 'static/css/[name].[contenthash]-vuescss.css',
    allChunks: true
});

//css文件解析的配置参数
const styleParam = ['css-loader?minimize', 'autoprefixer-loader', 'sass-loader',]
module.exports = {
    entry: {
        main: './vueProgect/src',
        vendor: [
            './vueProgect/src/static/venders/unitUpload.js'
        ],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name].bundle.[chunkhash].js',
        chunkFilename: "js/[name].[chunkhash].js"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                use: extractCSS.extract(['css-loader?minimize', 'autoprefixer-loader']),
            },
            {
                test: /\.scss$/,
                use: extractSCSS.extract(
                    [
                        ...styleParam,
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: [
                                    './vueProgect/src/static/scss/mixins.scss',
                                    './vueProgect/src/static/scss/var.scss',
                                ]
                            }
                        },
                    ]
                )
            },
            //在vue-loader中使用options并没有产生相应的作用，反而会影响.babelrc的执行
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        scss: extractVueSCSS.extract({
                            use: [
                                ...styleParam,
                                //抽取出vue中scss的全局变量
                                {
                                    loader: 'sass-resources-loader',
                                    options: {
                                        resources: [
                                            './vueProgect/src/static/scss/mixins.scss',
                                            './vueProgect/src/static/scss/var.scss',
                                        ]
                                    }
                                },
                            ]
                        })
                    }
                }
            },
            {
                test: /\.(jpg|png|svg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'static/images/'
                }
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'static/font/'
                }
            },
            //webpack中已经包含了es5的解析器和更多相应的配置
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './vueProgect/src/index.html',
            filename: 'index.html',
            favicon: './vueProgect/src/static/imgs/avatar.jpg'
        }),
        new CleanWebpackPlugin(['dist']),
        //让render的哈希值不随文件的增删改变
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        //抽取公共块
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common' // 指定公共 bundle 的名称。
        }),
        extractCSS,
        extractSCSS,
        extractVueSCSS,
        //代码压缩
        new uglifyJSPlugin({
            // 最紧凑的输出
            beautify: false,
            // 删除所有的注释
            comments: false,
            compress: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                // 删除所有的 `console` 语句
                // 还可以兼容ie浏览器
                drop_console: true,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true,
            }
        }),
    ],
    devServer: {
        contentBase: './dist',
        port: 3000,
        host: "0.0.0.0"
    },
    devtool: '#eval-source-map',
};