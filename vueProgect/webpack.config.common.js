'use strict';
//这里面的路径都是以package.json文件为参考的
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//代码压缩工具，用来压缩代码和清除未使用的代码
const uglifyJSPlugin=require('uglifyjs-webpack-plugin');
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
                use: extractCSS.extract(['css-loader', 'autoprefixer-loader']),
            },
            {
                test: /\.scss$/,
                use: extractSCSS.extract(
                    [
                        'css-loader',
                        'autoprefixer-loader',
                        'sass-loader',
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
                                'css-loader',
                                'autoprefixer-loader',
                                'sass-loader',
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
        new uglifyJSPlugin()
    ],
};