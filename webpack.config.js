/**
 * webpack-vue 配置文件
 */
/**
 * vue目录结构
 * --assets        静态文件目录(CSS,images,fonts,js)
 * --src           vue文件目录
 * --配置文件       (package.json .babelrc .gitignore postcss.config.js webpack.config.js)
 */
/**
 * 功能简述:
 * 1,VUE单页应用分离JS,CSS
 * 2,可以在VUE中使用css,less,scss,并加上私有前缀
 * 3,图片和字体等静态复制,图片压缩
 * 4,以html模板复制增加引用关系等
 * 5,设置开发服务器
 * 6,配置主要分为:出入口,加载器,插件
 */
// 引入 webpack
const webpack = require('webpack');
// 引入 path,方便操作路径
const path = require('path');
// 引入 ExtractTextPlugin,分离CSS
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 引入 OptimizeCssAssetsPlugin,压缩分离的CSS
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 引入 CopyWebpackPlugin,复制静态
const CopyWebpackPlugin = require('copy-webpack-plugin');
// 引入 ImageminPlugin, 压缩图片
const ImageminPlugin = require('imagemin-webpack-plugin').default;
// 引入 HtmlWebpackPlugin,复制HTML模板,增加引用关系
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 引入 CleanWebpackPlugin, 清除上一次打包文件
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * 初始化: npm init -y
 * 插件或者加载器安装步骤
 * 1, 全局和局部安装webpack,webpack-cli
 * 全局: npm install webpack webpack-cli -g
 * 局部: npm install webpack webpack-cli -D
 * 
 * 2, 局部安装vue-loader vue-template-compiler,并在加载器中进行配置
 * npm install vue-loader vue-template-compiler -D
 * 
 * 3, 局部安装 style-loader css-loader extract-text-webpack-plugin autoprefixer-loader postcss-loader less-loader sass-loader less
 * npm install optimize-css-assets-webpack-plugin style-loader css-loader extract-text-webpack-plugin@next autoprefixer-loader postcss-loader less-loader sass-loader less -D
 * --> extract-text-webpack-plugin@next: 写这个配置文件时候这个插件还没支持webpack4.x,所以加了@next,在加载器和插件部分都需要配置
 * --> postcss-loader 配合autoprefixer-loader使用,需要外加一个配置文件
 * --> postcss.config.js,内容:module.exports={plugins:[require('autoprefixer')]}
 * --> optimize-css-assets-webpack-plugin 压缩CSS插件
 * 
 * 4, 局部安装 babel-loader babel-core babel-preset-env 
 * npm install babel-loader babel-core babel-preset-env -D
 * --> ES6789==>ES5,压缩的话,webpack自己可以压缩
 * --> 需要外加一个配置文件 .babelrc, 内容:{"presets": ["env"]}
 * 
 * 5, 局部安装 url-loader file-loader
 * npm install url-loader file-loader imagemin-webpack-plugin copy-webpack-plugin -D
 * --> url-loader file-loader 处理图片和字体
 * --> imagemin-webpack-plugin 压缩图片
 * --> copy-webpack-plugin 复制文件
 * 
 * 6, 局部安装 html-webpack-plugin
 * npm install html-webpack-plugin -D
 * ---> html-webpack-plugin 复制html,增加引用关系
 * 
 * 7, 局部安装 webpack-dev-server
 * npm install webpack-dev-server -D
 * ---> webpack-dev-server:开发服务器
 * --->package.json中script加入"server": "webpack-dev-server --hot --open --port 8888 --progress",
 * 
 * 8, 局部安装 clean-webpack-plugin
 * npm install clean-webpack-plugin -D
 * ---> clean-webpack-plugin 生产环境清除旧文件
 * 
 * 
 */

module.exports = {
    /**
     * entry:一般是以某个或某些个JS为入口,可以理解为多页的JS入口,或者将JS分离
     * 例如可以将引入的VUE框架和自己写的JS进行分离
     * 这里由于要分离JS,所以entry写对象形式
     * 否则:entry:'string'
     */
    entry: {
        index: './src/index.js', //文件入口,多个入口文件会自动分离引用分离
    },
    /**
     * output:出口,打包后的文件存放位置
     */
    output: {
        filename: '[name].js', //要分离JS,这里是开发者的JS
        path: path.resolve(__dirname, './dist') //路径,没什么可说的,这里用到了path,所以要引入
    },
    /**
     * 第一部分(出入口)配置结束
     * 说明:webpack 4.x版本有默认的出入口,且将某些东西单独移到webpack-cli
     * -----入口:'./src/index.js'
     * -----出口:'./dist/main.js'
     * -----需要全局和局部安装:webpack,webpack-cli
     */
    module: {
        rules: [{ //安装插件第2步配置,匹配VUE,使用vue-loader处理
                test: /\.vue$/,
                use: ['vue-loader']
            },
            { //安装插件第3步: css==>私有前缀==>css==>模块
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader']
                })
            },
            { //安装插件第3步:less==>私有前缀==>css==>模块
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
            },
            { //安装插件第3步:sass==>私有前缀==>css==>模块
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
            },
            { //安装插件第4步:
                test: /\.js$/, //匹配JS
                exclude: /(node_modules|bower_components)/, //排除两个目录下的js
                use: [{
                    loader: 'babel-loader', //使用该加载器进行ES6789=>ES5
                }]
            },
            { //安装插件第5步:处理图片和字体
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10240, //小于10k的图片转成base64
                        // 设置处理的文件的输出目录  - file-loader,这里的路径得和原来的相对应,图片放在一起不好管理
                        name: '[path][name].[ext]'
                    }
                }]
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']), //清除文件包,生产环境

        new ExtractTextPlugin({ //抽离CSS
            filename: 'assets/css/[name][hash].css',
        }),
        new OptimizeCssAssetsPlugin({ //压缩抽离的CSS
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        }),
        // new CopyWebpackPlugin([{ //复制图片静态资源,貌似没有必要
        //     from: 'assets/images',
        //     to: 'assets/images'
        // }]),
        // new CopyWebpackPlugin([{ //复制字体静态资源,貌似没必要,字体会被转化为base64
        //     from: 'assets/fonts',
        //     to: 'assets/fonts'
        // }]),
        //图片还是自己压缩吧!,这个插件的压缩率不是很高,还影响打包时间
        new ImageminPlugin({ //图片压缩
            test: /\.(jpe?g|png|gif|svg)$/i
        }),

        new HtmlWebpackPlugin({
            title: 'mywebpack', //复制后的html的title
            template: './src/index.html', //模板文件
            filename: 'index.html', //目标文件
            htmlWebpackPlugin: {
                "files": { //依赖
                    "css": [], //这里是html依赖的CSS
                    "js": [] //这里是html依赖的JS文件,
                }
            },
            // 压缩 情怀至上,卸载VUE内部的css会成为内嵌式,压缩会好一点
            minify: {
                minifyCSS: true, //压缩html内的css
                minifyJS: true, //压缩html内的js
                removeComments: true, //删除html注释
                collapseWhitespace: true, //去除换行和空格
                removeAttributeQuotes: true //去除属性引用
            }
        }),
    ],
    optimization: {//分离正则匹配到的
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
    mode: 'production' //指定模式,不然会有警告
}