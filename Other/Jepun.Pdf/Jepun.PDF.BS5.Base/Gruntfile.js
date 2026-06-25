module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            install: {
                options: {
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanTargetDir: false
                }
            }
        },
        clean: {
            options: { force: true },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: false,
                sourceMapIncludeSources: false
            },
            build: {
                src: 'js/**/*.js',
                dest: 'dist/js/<%= pkg.name %>.min.js'
            },
            pdf: {
                src: [
                    './js/core/jepun.video.js',
                    './js/core/jepun.pdf.js',
                    './js/core/jepun.pdf.Developer.js',
                    '!./js/core/*.min.js',
                ],
                dest: './js/<%= pkg.name %>.min.js'
            },
        },
        jshint: {
            options: {
                esversion: 9,//grunt-contrib-jshint ~3.0.0  支持  async await  
                //'reporter': 'jslint',
                //'reporterOutput':'tttttttttttt.xml',
                'evil': true, // eval
                'loopfunc': true, //false: don't make functions within a loop
                'forin': false,
                'curly': true,//大括號包裹: true		
                'eqnull': true,
                //'strict': true,			
                'eqeqeq': true,//對于簡單類型，使用===和!==，而不是==和!=  : true			
                'newcap': true,//對于首字母大寫的函數（聲明的類），強制使用new  : true			
                'noarg': false,//禁用arguments.caller和arguments.callee  : true			
                'sub': true,//對于屬性使用aaa.bbb而不是aaa['bbb']	: true		 
                'undef': true,//查找所有未定義變量			: true
                'unused': false,
                'boss': true,//查找類似与if(a = 0)這樣的代碼		: true	
                'node': false,//指定運行環境為node.js   : true
                'browser': true,
                "laxcomma": true,
                'globals': {
                    '$': false,
                    'jQuery': false,
                    'define': false,
                    'console': true,
                    'module': true,
                    'GlbEnv': true,
                    'jCom': true,
                    'jCore': true,
                    'jFun': true,
                    'jsPDF': true,
                    'ActiveXObject': true,
                    'GlbAlertModal': true,
                    'GlbUserRight': true,
                    'GlbLabelTxt': true,
                    'GlbSetting': true,
                    'localArgs': true,
                    'GlbAppModal': true,
                    'GlbEventType': true,
                    'GlbHomeMain': true,
                    'GlbFormLayout': true,
                    'GlbChkAreaExpanded': true,
                    'GlbAppModalSub': true,
                    'GlbAppFullPage': true,
                    'GlbAppFullPageM': true,
                    'GlbLoadingModal': true,
                    'GlbFfunName': true,
                    'GlbAppendSubFunName': true,
                    'GlbsystemTime': true,
                    'GlbWorks': true,
                    'validDoc': true,
                    'editable': true,
                    'showPleaseSelect': true,
                    'Enumerable': true,
                    //glbFUN
                    'glbLoading': true,
                    'glbChkFundRisk': true,
                    'glbPrintReport': true,
                    'glbDownloadReport': true,
                    'glbWorkerSend': true,
                    //圖表
                    'Highcharts': true,
                    'Chart': true,
                    'changeLabel': true,
                    'XLSX': true,
                    //PS 事件
                    'initButton': true,
                    'getRoleFlowsUrl': true,
                    'SignaturePad': true,
                    'canvasDatagrid': true,
                    'CKEDITOR': true,
                    'signalR': true,
                    'FB': true
                    , 'PDFObject': true
                    , 'DmsHubconnection': true
                    , 'isScale': true
                    , 'MovingItem': true
                    , 'App': true
                    , 'ReadableStream': true
                    , 'ResizeObserver':true
                }
            },
            //all: ['src/**/*.js']
            files: ['Gruntfile.js', 'jshint/all/**/*.js'],
            single: ['Gruntfile.js', 'jshint/single/**/*.js'],
            pdf: ['./js/core/*.js', '!./js/core/*.min.js']
           
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });
    //grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln('');
        grunt.log.writeln(target + ':' + filepath + ' has ' + action);
    });

    grunt.registerTask('release-pdf', ['jshint:pdf', 'uglify:pdf']);
    //grunt.registerTask('jsdoc-fdf', ['jsdoc:fdf']);
    //grunt.registerTask('debug-fdf', []);
    //grunt.registerTask('release-fdf', ['jshint:fdf_rel', 'uglify:fdf_rel', 'uglify:fdf_glb_rel', 'jshint:fdf_app_rel', 'uglify:fdf_app_rel', 'clean:fdf_rel', 'cssmin:fdf_rel']);
    //grunt.registerTask('release-fdf', ['jshint:fdf', 'uglify:fdf', 'uglify:fdf_glb', 'jshint:fdf_app', 'uglify:fdf_app', 'cssmin:fdf']);
    //grunt.registerTask('release-ctb-HaveSrcJs', ['clean:ctb_before', 'jshint:ctb', 'uglify:ctb', 'cssmin:ctb']);

};