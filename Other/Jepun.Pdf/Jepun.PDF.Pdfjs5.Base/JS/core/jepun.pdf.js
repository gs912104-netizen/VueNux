/**
 * @description Pdf編輯器 採用新方案 widget來處理
 * @najespace jepun.JPpdfEDitor
 * @returns {string} str
*/
$.widget("jepun.jepunPdfEditor", {
    options: {
        //版本
        versions: 1.01,
        //浮水印字
        watermark: "JepunMark",
        //從哪張表單呼叫，連動使用
        fromForm: "",
        //當前表單
        Vno: 0,
        //當前明細
        Dno: 0,
        //當前Key值(取代Vno , Dno)
        KeyNo: 0,
        //Key值類別(1:Vno類型,2:Dno類型)
        KeyType: 0,
        //現在關卡
        NowOrd: 0,
        //表單狀態
        FormState:0,
        //Pdf檔案路徑
        pdfFile: '',
        //該容器上層的控項
        selfParent: '.row.form-group',
        //卷軸的目標
        scrollTarget: $('html'),
        //卷軸的綁定事件目標
        scrollTrigger: $(window),
        //卷軸控制上方控項需扣除的高度
        defaultHeight: 0,
        //工具箱歸0，扣除之高度
        defaultTop: 49,
        //解析度單位
        scale: 1,
        //圖檔解析度倍數
        jpscale: 1,
        //起始工具箱內含事件單位 ex:'Drawer', 'Editor', 'TLayer', 'PdfSave', 'Print'
        toolbox: ['Drawer', 'Editor', 'TLayer', 'PdfSave', 'Print', 'Merge', 'FinDeal', 'FinDealJoin'],
        //預設上限頁數
        maxPage: 100,
        //預設是否Loading
        loadingEnable: false,
        //預設使用工具
        defaultWorks: '',
        //是否使用影音背景
        useVideo: false,
        //是否有啟用
        canVideoTag: false,
        //是否使用軌跡紀錄
        useTrack: false,
        //#region Draw 相關參數 
        //是否可以編輯 預設不能修改
        DrawCanEditor: false,
        //#endregion

        //#region Editor 相關參數 
        //是否可以編輯 預設不能修改
        EditCanEditor: false,
        //可使用之PdfEditor控項 ex '1@@2@@3@@4@@5' 1.塗鴉 2.上傳圖檔 3.文字圖檔 4.個人簽章 5.系統印章 6.當日日期 7.流程所有人員簽名
        editToolbox: '1@@2@@3@@4@@5@@6@@7',
        //使用之公司印章
        useStamp: '1@@2',
        //可編輯關卡Array
        editeditablestep: [0],

        //編輯器加入圖案最小寬
        scareMinW: 50,
        //編輯器加入圖案最小高度
        scareMinH: 50,

        //canvas 預設轉出之大小 
        width: 300,

        //預設字體大小
        fontsize: 12,
        fontfamily: 'Arial',
        //是否有合成後檔案(Def:false)
        IsFinal: false,
        //是否有上傳過檔案(Def:true)
        IsUpload: true,
        //是否隱藏印章
        setMark: false,
        //隱藏類別 Sno 公司章 , Pno 個人章
        setMarkType: ['Sno', 'Pno'],
        //#endregion

        //#region 事件路徑相關

        //是否要重新抓取相關資訊預設關閉
        getSetting: false,
        //取得設定(轉置設定資訊By Server Side)
        fdfgetSetting: 'ModulePdfEditor/GetSetting',

        //
        fdfgetFdfModulePdf: 'ModulePdfEditor/GetModulePdfT2',

        //產出圖檔切圖使用
        fdfCutImg: 'ModulePdfEditor/CutImg',
        //產出文字圖檔
        fdfWritetextJpg: 'ModulePdfEditor/WritetextJpg',
        //取得自己的個人印章
        fdfPersonSign: 'ModulePdfEditor/GetAppSignFileT5',
        //取得傳入的公司印章
        fdfCompanySign: 'ModulePdfEditor/GetAppStampT5',
        //轉換個人印章大小至編輯器上
        fdfsetPersonSign: 'ModulePdfEditor/SetNewStamp',
        //取得傳入的公司印章
        fdfsetCompanySign: 'ModulePdfEditor/SetNewChopStamp',

        //取得所有塗鴉存檔
        fdfgetPdfStamp: 'ModulePdfEditor/GetModulePdfEditorSelT1',
        fdfgetPdfDrawer: 'ModulePdfEditor/GetModulePdfDrawerSelT1',

        //存檔路徑
        fdfsavePdfStamp: 'ModulePdfEditor/SetModulePdfAllInsXml',

        //列印另開錄徑
        fdfprintPdf: 'HomeIframe/Index?controller=TestPdfPrint&action=index',

        //另開 多頁使用PDF瀏覽器
        fdfPdfReader: 'view/pdfjs/web/viewer.html',

        //UserJson
        fdfgetUserList: 'Common/GetAppUsersT6?showPleaseSelect=false',

        //合成路徑
        fdfmergePdf: 'ModulePdfEditor/SetFdfModulePdfMerge',

        //
        fdfgetKeeper: 'ModulePdfEditor/GetKeeper',
        //#endregion
        //#region 回呼
        //存檔完成回呼事件
        fdfFinalSaveReload: true,
        fdfFinalSave: function () { console.log('Final Save'); jCom.BootstrapAlert('', 'Save OK'); },

        //FinDeal加入其他人回呼
        fdfFinDealJoinUser: function () { console.log('fdfFinDealJoinUser'); jCom.BootstrapAlert('', 'FinDealJoinUser'); },

        //#endregion

        //#region 多語系使用
        LblBtnDrawer: '直接編輯',
        LblBtnEditor: '插入編輯',
        LblBtnTLayer: '原始檔案文字選取',
        LblBtnPdfSave: '存檔',
        LblBtnPrint: '列印',
        LblBtnMerge: '合成PDF',
        LblBtnFinDeal: '憑證簽章',

        LblbtnDtPencil: '塗寫',
        LblbtnDtPoint: '拖曳',
        LblbtnDtHighlight: '重點',
        LblbtnDtEraser: '擦布',
        LblbtnDtColor: '顏色',
        LblbtnDtReset: '清空',

        LblbtnDraw: '插入塗寫',
        LblbtnUpload: '插入圖片',
        LblbtnText: '插入文字',
        LblbtnSign: '插入個人簽章',
        LblbtnStamp: '插入公司印章',
        LblbtnDateNow: '插入系統日期',

        LblJpPEDownloadFile: '完成檔案檢視',
        LblJpPENoFiles: '編輯器沒有上傳任何檔案，請上傳檔案!!',
        LblJpPETooManyPage: 'PDF檔案頁數太多，請使用另開的檢視器頁面檢視',
        LblJpPEOpen: '打開',
        //#endregion
        //預設使用筆觸Color
        penColor: '#000000'
    },
    _create: async function () {
        console.log("jepun.jepunPdfEditor");
        const self = this;
        self.element.attr("data-jepun-control", "jepunPdfEditor");
        //註冊Pdf.js 在建立的時候
        //self._pdfjsLib = window['pdfjs-dist/build/pdf'];
        //self._pdfjsLib.GlobalWorkerOptions.workerSrc = jCom.urlPath(`lib/pdf.js/build/pdf.worker.js?v=${self.options.versions}`);
        try {
            // 2. 動態載入 PDF.js 模組 (解決 import.meta 外溢問題)
            const mjsPath = jCom.urlPath("lib/pdf.js/build/pdf.mjs?v=" + self.options.versions);
            const pdfjsLib = await import(mjsPath);

            // 3. 將載入的模組掛載到實例上
            self._pdfjsLib = pdfjsLib;

            // 4. 設定 Worker 路徑 (同樣使用絕對路徑避免出錯)
            const workerPath = jCom.urlPath("lib/pdf.js/build/pdf.worker.mjs?v=" + self.options.versions);
            self._pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

            console.log("PDF.js 模組載入成功");
        } catch (err) {
            console.error("PDF.js 載入失敗，請檢查路徑或瀏覽器版本:", err);
            return;
        }

        self._loadingTasks = [];
        let loadingTask = self._pdfjsLib.getDocument(self.options.pdfFile);
        self._loadingTasks.push(loadingTask);
        self._isinit = false;
        if (self.options.getSetting) {
            $.when(jCom.ajax(self.options.fdfgetSetting, { Vno: self.options.Vno, Dno: self.options.Dno, KeyNo: self.options.KeyNo, KeyType: self.options.KeyType, Ord: self.options.NowOrd }, function (obj) {
                self.__execCallBack(obj, function (objs) {
                    if (objs.setting !== undefined) {
                        let settings = $.parseJSON(objs.setting);
                        self.options.editToolbox = settings.editToolbox;
                        self.options.editeditablestep = settings.editeditablestep.split('@@');
                        self.options.useStamp = settings.useStamp;
                        self.options.NowOrd = settings.NowOrd;
                        self.options.IsFinal = jFun.ConvertBool(settings.IsFinal);
                        self.options.IsUpload = jFun.ConvertBool(settings.IsUpload);
                        self.options.fontfamily = settings.fontfamily;
                        self.options.fontsize = settings.fontsize;
                        self.options.FormState = settings.FormState;
                    }
                });
            })).then(function () {
                self._createElement();
            });
        }
        else {
            self._createElement();
        }
    },
    //每次被呼叫都執行
    _init: async function () {
        const self = this;
        self._isReady = false;
        self._isChange = false;
        self.element.removeClass("changed");
        self.pdfDoc = null;
        self.datas = {};
    },
    //#region 外部呼叫
    //(外部呼叫)回傳是否已完成
    isReady: function () {
        const self = this;
        return self._isReady;
    },
    //(外部呼叫)回傳編輯器是否有變更
    isChange: function () {
        const self = this;
        return self._isChange;
    },
    //(外部呼叫)建立編輯器主體
    createPdfEditor: function () {
        const self = this;
        console.log(self.options);
        if (self._isinit === undefined || self._isinit === false) {
            setTimeout(function () { self.createPdfEditor(); }, 500);
            return;
        }
        if (self.options.getSetting) {
            $.when(jCom.ajax(self.options.fdfgetSetting, { Vno: self.options.Vno, Dno: self.options.Dno, KeyNo: self.options.KeyNo, KeyType: self.options.KeyType, Ord: self.options.NowOrd }, function (obj) {
                self.__execCallBack(obj, function (objs) {
                    if (objs.setting !== undefined) {
                        let settings = $.parseJSON(objs.setting);
                        self.options.editToolbox = settings.editToolbox;
                        self.options.editeditablestep = settings.editeditablestep.split('@@');
                        self.options.useStamp = settings.useStamp;
                        self.options.NowOrd = settings.NowOrd;
                        self.options.IsFinal = jFun.ConvertBool(settings.IsFinal);
                        self.options.IsUpload = jFun.ConvertBool(settings.IsUpload);
                        self.options.fontfamily = settings.fontfamily;
                        self.options.fontsize = settings.fontsize;
                        self.options.FormState = settings.FormState;
                    }
                });
            })).then(function () {
                self._beforecreatePdfEditor();
            });
        }
        else {
            self._beforecreatePdfEditor();
        }
       
    },
    //(外部呼叫)列印事件產生列印主體
    createPdfPrinter: function () {
        const self = this;
        self._loadingTasks[0].promise.then(function (pdfDoc_) {
            self.pdfDoc = pdfDoc_;
            console.log("PDF 總頁數", self.pdfDoc.numPages);
            self.datas.numPages = self.pdfDoc.numPages;
            //loading Start
            glbLoading("page-loading");
            //重置所有事件 start
            self.element.getCtrl("JpPEGroup").empty();
            self._funRefesh();
            self.element.getCtrl('JpPEToolBox').find('.active').removeClass("active");
            self._isChange = false;
            self.element.removeClass("changed");
            self._nowWork = '';
            //重置所有事件 end
            self.currentPage = -1;
            self.scratchCanvas = document.createElement("canvas");
            self._renderPrintPage().then(function () {
                return self._performPrint();
            }).catch(function () { console.log('error'); }).then(function () {
                console.log('print ok');
            });
        });
    },
    //(外部呼叫)存檔編輯器內容
    Save: function () {
        const self = this;
        self._save();
    },
    //#endregion
    //#region 共用呼叫
    //(內部呼叫)建立編輯器主體
    _createElement: function () {
        const self = this;
        //抓取是否草稿(這段需搬走)
        for (const element of self.options.editeditablestep) {
            if (parseFloat(self.options.NowOrd) === parseFloat(element)) {
                self.options.DrawCanEditor = true;
                self.options.EditCanEditor = true;
            }
        }
        self.options.DrawCanEditor = self.options.DrawCanEditor ? self.options.DrawCanEditor : (parseFloat(self.options.NowOrd) <= 0);
        self.options.EditCanEditor = self.options.EditCanEditor ? self.options.EditCanEditor : (parseFloat(self.options.NowOrd) <= 0);
        if (self.options.IsUpload === false) {
            self._isinit = true;
            return;
        }
        //先裝載容器  Jepun Pdf Editor ToolBox => JpPEToolBox , Jepun Pdf Editor Group => JpPEGroup
        self.element.append('<div class="JpPEToolBox" name="JpPEToolBox" ><div class="JpPEArea"><div class="JpPETB" name="JpPETB">' +
            (self.options.toolbox.includes('Drawer') && self.options.DrawCanEditor ? '<div class="JpPETool" _dtb="1" name="BtnDrawer" title="' + self.options.LblBtnDrawer + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa noactive fa-pencil"></i><i class="fa onactive fa-times"></i></div>' : '') +
            (self.options.toolbox.includes('Editor') && self.options.EditCanEditor ? '<div class="JpPETool" _dtb="1" name="BtnEditor"  title="' + self.options.LblBtnEditor + '"  data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa noactive fa-object-group"></i><i class="fa onactive fa-times"></i></div>' : '') +
            (self.options.toolbox.includes('TLayer') ? '<div class="JpPETool" _dtb="1" name="BtnTLayer"><i class="fa noactive fa-italic"  title="' + self.options.LblBtnTLayer + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ></i><i class="fa onactive fa-times"></i></div>' : '') +
            (self.options.toolbox.includes('PdfSave') && (self.options.DrawCanEditor || self.options.EditCanEditor) ? '<div class="JpPETool JpPEToolSave" _dtb="1" name="BtnPdfSave" title="' + self.options.LblBtnPdfSave + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa fa-save"></i></div>' : '') +
            (self.options.toolbox.includes('Print') ? '<div class="JpPETool" _dtb="1" name="BtnPrint" title="' + self.options.LblBtnPrint + '" data-toggle="tooltip" data-container="body" data-placement="bottom"  ><i class="fa fa-print"></i></div>' : '') +
            (self.options.toolbox.includes('Merge') ? '<div class="JpPETool" _dtb="1" name="BtnMerge" title="' + self.options.LblBtnMerge + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa fa-file-export"></i></div>' : '') +
            (self.options.toolbox.includes('FinDeal') ? '<div class="JpPETool" _dtb="1" name="BtnFinDeal" title="' + self.options.LblBtnFinDeal + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa fa-file-export"></i></div>' : '') +
            (self.options.IsFinal ? `<a class="JpPETool text-reset" _dtb="0" title="${self.options.LblJpPEDownloadFile}" data-toggle="tooltip" data-container="body" data-placement="bottom"  href="${jCom.addQryString(self.options.fdfgetFdfModulePdf, "pages", 9999, "Vno", self.options.Vno, "Dno", self.options.Dno, "KeyNo", self.options.KeyNo, "KeyType", self.options.KeyType)}"  target="blank_" name="JpPEDownloadFile"><i class="fa fa-download"></i></a>` : '') +
            '<div class="JpPETool" _dtb="0"><select name="PageShow"></select></div></div></div></div>' +
            //編輯器區段
            '<div class="" name="JpPEGroup" ></div>' +
            //modal區段
            '<div name="JpPEModal" class="modal modal-filter" style="overflow:hidden" tabindex="-1" role="dialog" aria-hidden="true" data-bs-backdrop="false" data-bs-keyboard="false"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" role="document"><div class="modal-content">' +
            '<div class="modal-header "><h4  class="modal-title mb-0"></h4><button type="button" name="JpPEModalclose" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body-pdf modal-body-height"></div></div></div></div>' +
            //額外加入按鈕區段
            //(self.options.IsFinal ? `<div class="JpPETool  _dtb="0" ><a class="btn btn-success" href="${jCom.addQryString(self.options.fdfgetFdfModulePdf, "pages", 9999, "Vno", self.options.Vno, "Dno", self.options.Dno, "KeyNo", self.options.KeyNo, "KeyType", self.options.KeyType)}"  target="blank_" name="JpPEDownloadFile" data-jepun-button="TopBtn">${self.options.LblJpPEDownloadFile}</a></div>` : '') +
            //列印用Iframe
            '<iframe name="JpPEPrintFrame" style="display:none;"></iframe>'+
            '');
        /* 工具箱目前內容
          <div class="DrawerArea">
            <div class="DrawerToolBox open">
                <div class="DrawerTool dropdown-toggle" _dtb="1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="caret"></span></div>
                <div class="dropdown-menu DrawerToolBox">
                    <div name="btnDtPencil" class="DrawerTool active"><div class="fa fa-pencil"></div></div>
                    <div name="btnDtPoint" class="DrawerTool"><div class="fa fa-hand-pointer-o"></div></div>
                    <div name="btnDtHighlight" class="DrawerTool"><div class="fa fa-paint-brush"></div></div>
                    <div name="btnDtEraser" class="DrawerTool"><div class="fa fa-eraser"></div></div>
                </div>
                <div class="DrawerTool" _dtb="1"><input name="btnDtColor" class="JpPEColor valid" type="color" value="#000000" aria-invalid="false"></div>
                <div name="btnDtReset" _dtb="1" class="DrawerTool"><i class="fa fa-refresh"></i></div>
                <div name="btnDtSave" _dtb="1" class="DrawerTool"><i class="glyphicon glyphicon-floppy-saved"></i></div>
                <div class="DrawerTool " _dtb="0"><select name="PageShow"><option value="Drawer_1">1</option><option value="Drawer_2">2</option><option value="Drawer_3">3</option><option value="Drawer_4">4</option></select></div>
            </div>
            </div>
         */
        self._isinit = true;
        //工具箱內容綁定
        self._createInitFun();

    },
    //(內部呼叫)主體已存在渲染內容
    _beforecreatePdfEditor: function () {
        const self = this;
        if (self.options.IsUpload === false) {
            self.element.append('<div class="alert alert-danger alert-dismissable"><h4><i class="fa fa-frown-o"></i><strong> ' + self.options.LblJpPENoFiles + ' </strong></h4></div>');
            return;
        }
        //self._pdfjsLib.getDocument(self.options.pdfFile).promise.then(function (pdfDoc_) {
        self._loadingTasks[0].promise.then(function (pdfDoc_) {
            self.pdfDoc = pdfDoc_;
            console.log("PDF 總頁數", self.pdfDoc.numPages, new Date());
            //#region 介入轉換頁面
            if (self.pdfDoc.numPages > self.options.maxPage) {
                self.element.empty();
                self.element.append('<div class="alert alert-warning alert-dismissable"><h4><i class="fa fa-exclamation-circle"></i><strong> ' + self.options.LblJpPETooManyPage + '</strong></h4></div><div><div class="btn btn-sm btn-info" name="btnRead">' + self.options.LblJpPEOpen +'</div></div>');
               
                let url = jCom.addQryString(self.options.fdfPdfReader
                    , "file", encodeURI(self.options.pdfFile)
                    , "KeyNo", self.options.KeyNo
                    , "KeyType", self.options.KeyType
                    , "fdfgetSetting", encodeURI(self.options.fdfgetSetting)
                    , "watermark", self.options.watermark
                    );
                self._openWindow(url);

                self.element.getCtrl("btnRead").on("click", function (e) {
                    self._openWindow(url);
                });

                return;
            }
            //#endregion
            //loading Start
            if (self.options.loadingEnable) {
                console.log('pdfloading:', self.options.loadingEnable);
                glbLoading("page-loading");
            }
            self._allpage = self.pdfDoc.numPages > self.options.maxPage ? self.options.maxPage : self.pdfDoc.numPages;
            self._finalpage = 0;
            let option = '';
            //重置所有事件 start
            self.element.getCtrl("JpPEGroup").empty();
            self._funRefesh();
            self.element.getCtrl('JpPEToolBox').find('.active').removeClass("active");
            self._isChange = false;
            self.element.removeClass("changed");
            self._nowWork = '';
            //重置所有事件 end
            for (let i = 1; i <= self.pdfDoc.numPages && i <= self.options.maxPage; i++) {
                let id = 'canvaspage' + i;
                //PdfContenter ui-droppable signature-cursor-cell
                let div = $('<div class="JpPEContenter ui-droppable" name="Drawer_' + i + '" _pages="' + i + '" _dpi="72" ></div >');
                div.append('<div class="JpPENoWorkMask"></div><div class="JpPEEditor"></div><img class="JpPEBG" name="JpPEBG" ><canvas name="Drawer_' + i + '_canvas" class="JpPESign signature-cursor-crosshair" style="touch-action: none;"></canvas><canvas name="' + id + '" class="JpPECanvasLoad"></canvas><div class="JpPELoading fa"></div><div name="TL_' + id + '"  class="textLayer"></div>');
                self.element.getCtrl("JpPEGroup").append(div);
                self._renderPage(i, id);
                option += '<option value="Drawer_' + i + '">' + i + '</option>';
            }
            self.element.getCtrl("PageShow").html(option);
            if (self.options.toolbox.includes('Drawer') && self.options.DrawCanEditor && self.options.defaultWorks === 'doDrawer') { self.element.getCtrl('BtnDrawer').click(); }
            if (self.options.toolbox.includes('Editor') && self.options.EditCanEditor && self.options.defaultWorks === 'doEditor') { self.element.getCtrl('BtnEditor').click(); }
            if (self.options.toolbox.includes('TLayer') && self.options.defaultWorks === 'doTLayer') { self.element.getCtrl('BtnTLayer').click(); }
        });
    },
    //(內部呼叫)綁定按鈕事件，換頁事件，捲動事件
    _createInitFun: function () {
        const self = this;
        //工具箱綁定
        self.element.getCtrl('BtnDrawer').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");
            
            if (self._nowWork === 'doDrawer') {
                self._nowWork = '';
                return;
            }
            if (!self.options.DrawCanEditor) {
                return;
            }
            self._nowWork = 'doDrawer';
            nowself.addClass("active");
            self.element.addClass('doDrawer');
            self._Drawer = self._Drawer !== undefined ? self._Drawer : {};
            let html = '<div class="JpPETBsec' + (nowself.closest('.JpPEToolBox').hasClass("fixed-Top") ? ' fixed-Top' : '') + '" name="JpPETBsec">' +
                '<div class="JpPEToolsec DrawerTool ' + ((self._Drawer.action !== undefined ? self._Drawer.action : 1) === 1 ? 'active' : '') + '" name="btnDtPencil"    title="' + self.options.LblbtnDtPencil + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="fa fa-pencil"></div></div>' +
                '<div class="JpPEToolsec DrawerTool ' + ((self._Drawer.action !== undefined ? self._Drawer.action : 1) === 2 ? 'active' : '') + '" name="btnDtPoint"     title="' + self.options.LblbtnDtPoint + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="fa fa-hand-paper"></div></div>' +
                '<div class="JpPEToolsec DrawerTool ' + ((self._Drawer.action !== undefined ? self._Drawer.action : 1) === 3 ? 'active' : '') + '" name="btnDtHighlight" title="' + self.options.LblbtnDtHighlight + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="fa fa-paint-brush"></div></div>' +
                '<div class="JpPEToolsec DrawerTool ' + ((self._Drawer.action !== undefined ? self._Drawer.action : 1) === 4 ? 'active' : '') + '" name="btnDtEraser"    title="' + self.options.LblbtnDtEraser + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="fa fa-eraser"></div></div>' +
                '<div class="JpPEToolsec DrawerTool " title="' + self.options.LblbtnDtColor + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="input-colorpicker "><input name="btnDtColor" class="JpPEColor valid" type="hidden" value="' +
                (self._Drawer.color !== undefined ? self._Drawer.color : '#000000') +
                '" aria-invalid="false"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div></div>' +
                '<div class="JpPEToolsec DrawerTool" name="btnDtReset" title="' + self.options.LblbtnDtReset + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><div class="fa fa-refresh"></div></div>' +
                '</div>';
            self.element.append(self.__setDrawBtn($(html)));
            /*<div class="input-group input-colorpicker"><input type="text" name="colorpicker" class="form-control" value="' + self.options.penColor + '"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div>*/
        });
        self.element.getCtrl('BtnEditor').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");

            if (self._nowWork === 'doEditor') {
                self._nowWork = '';
                return;
            }
            if (!self.options.EditCanEditor) {
                return;
            }
            self._nowWork = 'doEditor';
            nowself.addClass("active");
            self.element.addClass('doEditor');
        });
        self.element.getCtrl('BtnTLayer').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();

            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");

            if (self._nowWork === 'doTLayer') {
                self._nowWork = '';
                return;
            }
            self._nowWork = 'doTLayer';
            nowself.addClass("active");
            self.element.addClass('doTLayer');
        });
        self.element.getCtrl('BtnPdfSave').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");
            self._save();
        });
        self.element.getCtrl('BtnPrint').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");
            var objFra = document.getElementsByName('JpPEPrintFrame')[0];
            objFra.onload = function () {
                objFra.contentWindow.focus();
                objFra.contentWindow.print();
            };
            objFra.src = jCom.addQryString(self.options.pdfFile, 'Print', 'true');
           
        });
        self.element.getCtrl('BtnMerge').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");
            self._mergePdf();

        });

        self.element.getCtrl('BtnFinDeal').on('click', function (e) {
            e.preventDefault();
            self._funRefesh();
            let nowself = $(this);
            nowself.closest('.JpPEToolBox').find('.active').removeClass("active");
            console.log('BtnFinDeal');
            if (self._isChange) {
                self._save();
                return;
            }
            if ($.isFunction(self.options.fdfFinalSave)) {
                self.options.fdfFinalSave();
            }
        });

        self.element.getCtrl("JpPEDownloadFile").on('click', function (e) {
            e.stopPropagation();
        });

        ////工具箱位置控制
        //修正新的Resize監聽 IN FlexBox
        let ro = new ResizeObserver(function (event) {
            jCore.throttle(function () {
                let jppetb = self.element.getCtrl("JpPEToolBox");
                jppetb.css("left", "calc(50% - " + (jppetb.outerWidth() / 2) + "px)");
            });
        });

        ro.observe(self.element.getCtrl("JpPEToolBox")[0]);
        //控制換頁

        self.element.getCtrl('PageShow').on('change', function () {
            let now = $(this).val();
            //console.log(self.options.scrollTarget.scrollTop() + self.element.getCtrl(now).offset().top - self.options.defaultHeight - 80);
            self.options.scrollTarget.stop().animate({
                scrollTop: self.options.scrollTarget.scrollTop() + self.element.getCtrl(now).offset().top - self.options.defaultHeight - 80
            }, 800);
        });
        //綁定Scroll控制物件
        $(self.options.scrollTrigger).off(".scrollForJpPdf").one("scroll.scrollForJpPdf", function (event) {
            self._scrollTrigger();
        });
        //綁Modal
        self._ActionModal = self.element.getCtrl("JpPEModal");
      
        self.element.getCtrl("tooltip", "data-toggle").tooltip();
    },
    //(內部呼叫)渲染一頁(如遇到與總頁數相同，呼叫後續衍伸事件)
    _renderPage: async function (num, id) {

        const self = this;
        const selfDiv = self.element.getCtrl("Drawer_" + num);
        self.pdfDoc.getPage(num).then(function (page) {
            const canvasEl = self.element.getCtrl(id)[0] || document.createElement('canvas');//document.getElementById(id);
            if (!self.element.getCtrl(id)[0]) {
                selfDiv.appendChild(canvasEl);
            }
            const canvas = 'OffscreenCanvas' in window && canvasEl.transferControlToOffscreen ? canvasEl.transferControlToOffscreen() : canvasEl;
            let ctx = canvas.getContext('2d', { willReadFrequently: true });
            let orgin_viewport = page.getViewport({ scale: self.options.scale });
            selfDiv.attr("_width", orgin_viewport.width).attr("_height", orgin_viewport.height);

            
            let parentW = self.element.outerWidth();
            
            let first = num === 1 ? 30 : 15;
            let newscale = (parentW - first) / orgin_viewport.width;
            newscale = newscale.toFixed(2);
            let viewport = page.getViewport({ scale: newscale });
            //將圖檔加倍渲染
            let doubleviewport = page.getViewport({ scale:  self.options.jpscale });
            canvas.height = doubleviewport.height;
            canvas.width = doubleviewport.width;
            //console.log(self.element.outerWidth(), selfDiv,parentW, newscale, orgin_viewport.width, viewport.width);
            // Render PDF page into canvas context
            let renderContext = {
                canvasContext: ctx,
                viewport: doubleviewport
            };
            let renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                if ('OffscreenCanvas' in window) {
                    console.log('Rendering completed. Attempting to convert to blob...', page);
                    canvas.convertToBlob().then(function (blob) {
                        self._renderBlob(blob, selfDiv, canvasEl, num);
                    }).catch(function (error) {
                        console.warn('Error converting canvas to blob', error);
                        renderTask.promise.then(function () {
                            canvas.convertToBlob().then(function (blob) {
                                self._renderBlob(blob, selfDiv, canvasEl, num);
                            });
                        });
                    });
                } else {
                    console.log('Using toBlob');
                    canvas.toBlob(function (blob) {
                        self._renderBlob(blob, selfDiv, canvasEl, num);
                    }, 'image/jpeg', 0.5);
                }
                if (self.options.toolbox.includes('TLayer')) {
                    return page.getTextContent();
                }
            }).then(async function (textContent) {

                if (self.options.toolbox.includes('TLayer') && textContent) {
                    let textLayer = self.element.getCtrl("TL_" + id);
                    textLayer.empty();

                    // 1. 設定容器樣式（基礎環境）
                    textLayer.addClass('textLayer').css({
                        'left': '0px',
                        'top': '0px',
                        'height': viewport.height + 'px',
                        'width': viewport.width + 'px',
                        'position': 'absolute',
                        '--scale-factor': viewport.scale,
                        'font-size': '1px' // 這裡設 1px 是為了防止某些瀏覽器干擾計算
                    });

                    try {
                        const textLayerInstance = new self._pdfjsLib.TextLayer({
                            textContentSource: textContent,
                            container: textLayer[0],
                            viewport: viewport,
                            enhanceTextSelection: true
                        });

                        // 2. 執行 PDF.js 原生渲染
                        await textLayerInstance.render();
                        // 3. 【核心修正】遍歷所有文字項，將 PDF 原始高度強制寫入
                        const textItems = textContent.items;
                        const $spans = textLayer.find('span');
                        let itemIdx = 0;
                        $spans.each(function () {
                            const $span = $(this);
                            const spanText = $span.text().trim();

                            // 尋找匹配該 span 文字的 item
                            while (itemIdx < textItems.length) {
                                const item = textItems[itemIdx];
                                if (item.str.trim().includes(spanText) || spanText.includes(item.str.trim())) {
                                    // 找到了對應的數據
                                    let fontSize = item.transform[3] * viewport.scale;
                                    // 保底機制：如果算出來的字體超過頁面高度的一半，通常是異常數據
                                    if (fontSize > (viewport.height / 2)) {
                                        fontSize = 14; // 給一個預設的閱讀大小
                                    }
                                    $span.css({
                                        'font-size': fontSize + 'px',
                                        'transform-origin': '0 0',
                                        //'color': 'transparent'
                                        'font-family': item.fontName || 'sans-serif',
                                        'position': 'absolute',
                                        'display': 'inline',
                                        'line-height': '1',
                                        'white-space': 'pre'
                                    });
                                    // 找到了就跳出 while，下一個 span 從下一個 item 開始找
                                    itemIdx++;
                                    break;
                                }
                                itemIdx++; // 如果這筆沒對上，往後找
                            }
                        });

                        console.log("文字層獨立大小校正完成");
                    } catch (e) {
                        console.error("文字層渲染失敗:", e);
                    }
                }
            });
        });
    },
    //(內部呼叫)渲染Blob
    _renderBlob: function (blob, selfDiv, canvasEl, num) {
        const self = this;
        const url = URL.createObjectURL(blob);
        selfDiv.getCtrl("JpPEBG").on("load", function () {
            //console.log('Blob Revoke',url);
            // no longer need to read the blob so it's revoked
            URL.revokeObjectURL(url);
        });
        console.log('renderPage toblob final', num, new Date());
        selfDiv.getCtrl("JpPEBG").attr("src", url);
        canvasEl.remove();
        self._finalpage++;
        console.log('renderPage final', num, new Date());
        if (self._finalpage === self._allpage) {
            console.log('all final');
            //渲染塗鴉功能
            if (self.options.toolbox.includes('Drawer')) { self._createPdfDrawer(); }
            if (self.options.toolbox.includes('Editor')) { self._createPdfEditor(); }
            glbLoading("");

            self._loadingTasks.forEach(lt => {
                lt.destroy();
            });
            self._loadingTasks = [];
            let loadingTask = self._pdfjsLib.getDocument(self.options.pdfFile);
            self._loadingTasks.push(loadingTask);
        }
    },
    //(內部呼叫)渲染列印主體
    _renderPrintPage: async function () {
        const self = this;

        const pageCount = self.pdfDoc.numPages;

        const renderNextPage = (resolve, reject) => {
            if (++self.currentPage >= pageCount) {
                resolve();
                return;
            }
            const index = self.currentPage;
           
            self.__renderPage(self.pdfDoc, index + 1).then(self._useRenderedPage.bind(this)).then(function () {
                renderNextPage(resolve, reject);
            }, reject);
        };

        return new Promise(renderNextPage);
    },
    //(內部呼叫)渲染列印一頁
    __renderPage: function (pdfDocument, pageNumber) {
        const self = this;
        return pdfDocument.getPage(pageNumber).then(function (pdfPage) {
            const scratchCanvas = self.scratchCanvas;
            const PRINT_UNITS =1;
          

            //將圖檔加倍渲染
            let doubleviewport = pdfPage.getViewport({ scale: self.options.jpscale });
 
            scratchCanvas.height = doubleviewport.height;
            scratchCanvas.width = doubleviewport.width;
            //console.log(self.element.outerWidth(), selfDiv,parentW, newscale, orgin_viewport.width, viewport.width);
            // Render PDF page into canvas context
            const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
            ctx.save();
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            ctx.restore();


            const renderContext = {
                canvasContext: ctx,
                transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
                //viewport: doubleviewport,
                viewport: pdfPage.getViewport({
                    scale: self.options.jpscale,
                    rotation: 0
                }),
                intent: "print"//,
                //includeAnnotationStorage: true
             
            };


            return pdfPage.render(renderContext).promise;
        });
    },
    //(內部呼叫)列印時顯示壓印浮水印
    _useRenderedPage() {
        const self = this;
      
      
        const img = document.createElement("img");
        const scratchCanvas = self.scratchCanvas;
        const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    
        const image = new Image(0, 0); // Using optional size for image
        image.onload = drawImageActualSize; // Draw when image has loaded

        // Load an image of intrinsic size 300x227 in CSS pixels
        image.src = jCom.urlPath('img/logo.png');
        function drawImageActualSize() {
        
            let x = scratchCanvas.width - 600;
            let y = 200;
            let width = image.width;
            let height = image.height;
            let angleInRadians = 45 * Math.PI / 180;
            ctx.translate(x, y);
            ctx.rotate(angleInRadians);
            ctx.drawImage(image, -width / 2, -height / 2, width, height);
            ctx.font = "160px fantasy,'Microsoft JhengHei'";
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillText(self.options.watermark, -110, 45);
            ctx.rotate(-angleInRadians);
            ctx.translate(-x, -y);

            if ("toBlob" in scratchCanvas) {
                scratchCanvas.toBlob(function (blob) {
                    img.src = URL.createObjectURL(blob);
                });
            } else {
                img.src = scratchCanvas.toDataURL();
            }
        }

       

        const wrapper = document.createElement("div");
        wrapper.className = "printedPage";
        wrapper.appendChild(img);
        self.element.getCtrl("JpPEGroup").append(wrapper);
        return new Promise(function (resolve, reject) {
            img.onload = resolve;
            img.onerror = reject;
        });
    },
    //(內部呼叫)延後呼叫瀏覽器底層列印事件
    _performPrint() {

        return new Promise(resolve => {
            setTimeout(() => {
                console.log('_performPrint');
                window.print();
                setTimeout(resolve, 20);
            }, 0);
        });
    },
    //(內部呼叫)Scroll拖拉偵測
    _scrollTrigger: function () {
        //console.log('_scrollTrigger');
        const self = this;
        if ($(self.element).is(":visible")) {
            let thisP = self.element.closest(self.options.selfParent);
            //console.log(thisP.offset(), thisP);
            if (thisP.offset().top - self.options.defaultHeight - self.options.defaultTop < 0) {
                if (thisP.offset().top + thisP.outerHeight(true) - self.options.defaultTop - self.options.defaultHeight > 0) {
                    self.element.getCtrl('JpPEToolBox').removeClass('fixed-Top').addClass('fixed-Top');
                    self.element.getCtrl('PdfLegend').removeClass('fixed-Top').addClass('fixed-Top');
                    self.element.getCtrl('JpPETBsec').removeClass('fixed-Top').addClass('fixed-Top');
                }
                else {
                    self.element.getCtrl('JpPEToolBox').removeClass('fixed-Top');
                    self.element.getCtrl('PdfLegend').removeClass('fixed-Top');
                    self.element.getCtrl('JpPETBsec').removeClass('fixed-Top');
                }
            }
            else {
                self.element.getCtrl('JpPEToolBox').removeClass('fixed-Top');
                self.element.getCtrl('PdfLegend').removeClass('fixed-Top');
                self.element.getCtrl('JpPETBsec').removeClass('fixed-Top');
            }
            let content = self.element.find('.JpPEContenter');
            content.each(function (a, b) {
                let selfs = $(b);
                if (selfs.offset().top - self.options.defaultHeight - self.options.defaultTop < 0) {
                    if (selfs.offset().top + selfs.outerHeight(true) - 20 - self.options.defaultHeight > 0) {
                        ////console.log(selfs.attr('name'), selfs.offset().top);
                        self.element.getCtrl('PageShow').val(selfs.attr('name'));
                        return;
                    }
                }
            });
            $(self.options.scrollTrigger).off(".scrollForJpPdf").one("scroll.scrollForJpPdf", function (event) {
                self._scrollTrigger();
            });
        }
    },
    //(內部呼叫)將編輯狀態重置
    _funRefesh: function () {
        const self = this;
        self.element.removeClass('doDrawer').removeClass('doEditor').removeClass('doTLayer');
        //PdfEdiotr 功能reset
        self.element.find('.JpPEEditorTB').remove();
        self.element.find('.edit-ui').hide();
        self.element.getCtrl("JpPETBsec").remove();
    },
    //(內部呼叫)HttpRequest取回JSON
    _getfile: function (pathOfFileToReadFrom) {
        let request = new XMLHttpRequest();
        request.open("GET", jCom.urlPath(pathOfFileToReadFrom), false);
        request.send(null);
        let returnValue = request.responseText;
        return returnValue;
    },
    //(內部呼叫)設置左邊人員簽名選單
    _setLeftTab: function () {
        const self = this;
        if (!self.options.fdfgetUserList) { return; }
        let objList = $.parseJSON(self._getfile(self.options.fdfgetUserList));
        let People = [];
        let PeopleList = '';
        let stampitemList = self.element.find('.CompositePhotoContentBody');
        let draweritemList = self.element.find('.DrawerOtherBG');
        let selfdraweritemList = self.element.find('.JpPESign');
        
        stampitemList.show();
        draweritemList.show();
        selfdraweritemList.show();
        $.each(stampitemList, function (i, ele) {
            if (People.indexOf($(ele).attr('_user')) === -1) { People.push($(ele).attr('_user')); }
        });
        $.each(draweritemList, function (i, ele) {
            if (People.indexOf($(ele).attr('_user')) === -1) { People.push($(ele).attr('_user')); }
        });
        $.each(selfdraweritemList, function (i, ele) {
            if ($(ele).attr('_user') === undefined) { return; }
            if (People.indexOf($(ele).attr('_user')) === -1) { People.push($(ele).attr('_user')); }
        });
     
        People.forEach(function (a) {
            let data = objList.filter(function (item, index, array) {
                return item[1] === parseInt(a);       // 取得同樣內容
            });
    
            if (data.length <= 0) { return; }
            PeopleList += '<div class="badge c-btn-circle bg-success" _user="' + data[0][1] + '" data-toggle="tooltip"  data-container="body" data-placement="right" title="' + data[0] + '" >' + data[0][0].split('')[0].toUpperCase() + '</div>';
        });
        if (People.length > 0 || self.options.toolbox.includes('FinDealJoin')) {
            self.element.getCtrl('PdfLegend').remove();
            $('<div name="PdfLegend" class="PdfLegend"></div>').prependTo(self.element.getCtrl("JpPEGroup"));
           
        }
        self.___iniShow($(PeopleList)).prependTo(self.element.getCtrl('PdfLegend'));
        if (self.options.toolbox.includes('FinDealJoin')) {
      
            let btn = $('<div class="btn btn-light c-btn-circle border" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="分享" name="btnShare"><i class="fa-solid fa-plus me-0"></i></div >');
            btn.on('click', function (event) {
                if ($.isFunction(self.options.fdfFinDealJoinUser)) {
                    self.options.fdfFinDealJoinUser();
                }
            });
            btn.prependTo(self.element.getCtrl('PdfLegend'));
        }

       
    },
    //(內部呼叫)左邊選單控制顯示隱藏
    ___iniShow: function (ele) {
        const self = this;
        ele.on('click', function (event) {
            event.preventDefault();
            let selfitem = $(this);
            selfitem.toggleClass('active');
            self.element.getCtrl("JpPEGroup").find('.CompositePhotoContentBody[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            self.element.getCtrl("JpPEGroup").find('.DrawerOtherBG[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            self.element.getCtrl("JpPEGroup").find('.JpPESign[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            
        });
        ele.tooltip();
        return $(ele);
    },
    //(內部呼叫)控制彈出OpenWindow視窗
    _openWindow: function (url) {
        
        let options, width, height;
        width = width || '80%';
        height = height || '70%';
        // 修正百分比判斷邏輯
        if (typeof width === 'string' && width.endsWith('%')) {
            width = parseInt(window.screen.width * parseInt(width, 10) / 100, 10);
        } else {
            width = parseInt(width, 10);
        }

        if (typeof height === 'string' && height.endsWith('%')) {
            height = parseInt(window.screen.height * parseInt(height, 10) / 100, 10);
        } else {
            height = parseInt(height, 10);
        }

        if (width < 640) { width = 640; }

        if (height < 420) { height = 420; }

        let top = parseInt((window.screen.height - height) / 2, 10),
            left = parseInt((window.screen.width - width) / 2, 10);
        options = (options || 'location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,resizable=yes,scrollbars=yes') + ',width=' + width +
            ',height=' + height +
            ',top=' + top +
            ',left=' + left;

        let popupWindow = window.open('', url, options, true);

        // Blocked by a popup blocker.
        if (!popupWindow) {
            return false;
        }

        try {
            let ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf(' chrome/') === -1) {
                popupWindow.moveTo(left, top);
                popupWindow.resizeTo(width, height);
            }
            popupWindow.focus();
            popupWindow.location.href = url;
        } catch (ex) {
            popupWindow = window.open(url, null, options, true);
        }
    },
    //特殊處理自己的modal
    __openModal: function (title, body, fnInit, fn) {
        const self = this;
        let modal = self._ActionModal;
        modal.off("hidden.bs.modal");
        modal.find(".modal-title").html(title);
        //顯示內容
        modal.find(".modal-body-pdf").empty();
        modal.find(".modal-body-pdf").append(body);
        modal.modal("show");
        modal.getCtrl("JpPEModalclose").off("click").on("click", function (e) {
            e.preventDefault();
            modal.modal("hide");
        });
        modal.one('shown.bs.modal', function (e) {
            e.stopPropagation();
            $(document).off('focusin.modal');
            console.log('PDFJS 介入顯示完成');
        });
        modal.one('show.bs.modal', function (e) {
            e.stopPropagation();
            console.log('PDFJS 介入顯示');
        });
        modal.one('hide.bs.modal', function (e) {
            e.stopPropagation();
            console.log('PDFJS 介入隱藏');
        });
        modal.one('hidden.bs.modal', function (e) {
            e.stopPropagation();
            console.log('PDFJS 介入隱藏完成');
        });

        self._ActionModal.validParse();
        //當Modal關閉(hidden) 處理
        if ($.isFunction(fnInit)) {

            fnInit();
        }
        //當Modal關閉(hidden) 處理
        if ($.isFunction(fn)) {
            modal.on("hidden.bs.modal", function (e) {
                e.stopPropagation();
                fn();
            });
        }
        return modal;
    },
    //特殊處理Ajax回傳事件判別
    __execCallBack: function (cmds, fn, plainObject) {
       
        if (cmds.customHandleError === true) {
            window.location = cmds.loginUrl;
            return;
        }
        try {
            for (const element of cmds) {
                switch (element.valType) {
                    case "FireHandler":
                        //FireHandler 才回呼事件
                        if ($.isFunction(fn)) {
                            fn($.extend({}, $.parseJSON(element.arg1), plainObject));
                        }
                        break;
                    case "Eval":
                        eval(element.arg0);
                        break;
                    case "Modal":
                        jCom.BootstrapAlert(element.arg1, element.arg0,'danger');
                        break;
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
    //#endregion
    //#region Editor相關Fun
    //(內部呼叫)建立(印章類型)編輯器
    _createPdfEditor: function () {
        const self = this;
        self._Editor = {};
        self._Editor.count = 0;
        self._Editor.MovingItem = "";
        self._Editor.isScale = false;
        self._Editor.isPropScale = false;
        //self.element.getCtrl('JpPEBG').isImgLoad(function () {
            if (self.options.EditCanEditor) {
                self.element.find('.JpPEEditor').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    let eX = e.originalEvent.offsetX;
                    let eY = e.originalEvent.offsetY;
                    let nowself = $(this);
                    //物件重置顯示 依目前點擊為優先
                    self.element.find('.JpPEEditorTB').remove();
                    self.element.find('.edit-ui').hide();
                    let toolList = ['1', '2', '3', '4', '5', '6'];//定義工具箱
                    let toolBox = self.options.editToolbox.split('@@').filter(function (a) { return toolList.indexOf(a) > -1; });//只需要抓取有在工具箱內的工具選項
                    let newX = eX + (toolBox.length * 38 / 2) > nowself.width() ? nowself.width() - (toolBox.length * 38) : (eX - (toolBox.length * 38 / 2) < 0 ? 0 : eX - (toolBox.length * 38 / 2));
                    let newY = eY - 50 < 0 ? 0 : eY - 50;
                    let html = '<div class="JpPEEditorTB" style="position:absolute;left:' + newX + 'px;top:' + newY + 'px;"><div class="JpPEPeArea"><div class="JpPEPeToolBox">';
                    for (const element of toolBox) {
                        switch (element) {
                            case "1":
                                html += '<div name="btnDraw" class="JpPEPeTool" title="' + self.options.LblbtnDraw + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa fa-pencil"></i></div>';
                                break;
                            case "2":
                                html += '<div name="btnUpload" class="JpPEPeTool" title="' + self.options.LblbtnUpload + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-image"></i></div>';
                                break;
                            case "3":
                                html += '<div name="btnText" class="JpPEPeTool" title="' + self.options.LblbtnText + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-font"></i></div>';
                                break;
                            case "4":
                                html += '<div name="btnSign" class="JpPEPeTool" title="' + self.options.LblbtnSign + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-pen-to-square"></i></div>';
                                break;
                            case "5":
                                html += '<div name="btnStamp" class="JpPEPeTool" title="' + self.options.LblbtnStamp + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-stamp"></i></div>';
                                break;
                            case "6":
                                html += '<div name="btnDateNow" class="JpPEPeTool" title="' + self.options.LblbtnDateNow + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-calendar-check"></i></div>';
                                break;
                            //case "7":
                            //    html += '<div name="btnSign" class="JpPEPeTool" title="流程人員簽名" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-users"></i></div>';
                            //    break;
                        }
                    }
                    html += '</div></div></div>';
                    self.___EditoriniAdd($(html)).appendTo(nowself.parent());
                });
            }
            self._loadAllStamp();
        //});
        self._setFormControl();
    },
    //(內部呼叫)產出物件的IniForm事件
    ___EditoriniAdd: function (ele) {
        const self = this;
        localArgs.fromForm = self.options.fromForm;
        ele.getCtrl("btnDraw").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            let videoRecord;
            html += '<div class="row  text-end mb-1"><div class="col-sm-12"><button class="btn btn-success ml-2 " type="button" name="BtnSend">Ok</button><button class="btn btn-danger ml-2 " type="button" name="BtnClear">Clear</button></div></div>';
            html += '<div name="pickColor" class="row" style=""><div class="col-md-12"><div class="c-input-item"><label for="fontName" class="c-input-label">' + self.options.LblbtnDtColor +'</label><div class="input-group input-colorpicker"><input type="text" name="colorpicker" class="form-control" value="' + self.options.penColor + '"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div></div></div></div>';
            html += '<div name="box" style="height:40vh; padding:5px;position:relative;border:1px solid; border-color:var(--bs-blue);" class="card mt-2"><div name="videoRecord" style=" position: absolute;left: 5px;top: 5px;"></div><canvas name="signature-pad" class="signature-pad  signature-cursor-crosshair"></canvas> </div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnDraw, html, function () {
        
                let color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                self._ActionModal.find('.input-colorpicker').colorpicker({
                    format: "hex",
                    extensions: [
                        {
                            name: 'swatches', // extension name to load
                            options: { // extension options
                                colors: {
                                    '#000000': '#000000',
                                    '#ffffff': '#ffffff',
                                    '#FF0000': '#FF0000',
                                    '#777777': '#777777',
                                    '#337ab7': '#337ab7',
                                    '#5cb85c': '#5cb85c',
                                    '#5bc0de': '#5bc0de',
                                    '#f0ad4e': '#f0ad4e',
                                    '#d9534f': '#d9534f'
                                },
                                namesAsValues: true
                            }
                        }
                    ]
                    //colorSelectors: {
                    //    '#000000': '#000000',
                    //    '#ffffff': '#ffffff',
                    //    '#FF0000': '#FF0000',
                    //    '#777777': '#777777',
                    //    '#337ab7': '#337ab7',
                    //    '#5cb85c': '#5cb85c',
                    //    '#5bc0de': '#5bc0de',
                    //    '#f0ad4e': '#f0ad4e',
                    //    '#d9534f': '#d9534f'
                    //}
                }).on("change", function (e) {
                    color = self._hexToRgb(e.color.toString('hex'));
                    changeColor(color.r, color.g, color.b);
                });
           
                let canvas = self._ActionModal.getCtrl("signature-pad")[0];
                let ctx = canvas.getContext('2d', { willReadFrequently: true });
                let width = self._ActionModal.getCtrl('box').outerWidth(true) - 15;
                let height = self._ActionModal.getCtrl('box').outerHeight(false) - 15;
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
               
                let signaturePad = new SignaturePad(canvas, {
                    penColor: 'RGB(' + color.r + "," + color.g + "," + color.b + ")",
                    minWidth: 3,
                    maxWidth: 7
                });
                if (self.options.useVideo) {
                    jFun.getMediaDevices(function (mediaDevices) {
                        console.log('getMediaDevices', width, height, mediaDevices);
                        if (mediaDevices.videoinput.length > 0) {
                            self.options.canVideoTag = true;
                            self._ActionModal.getCtrl("videoRecord").videoRecord({ width: width, height: height, videoSource: mediaDevices.videoinput[0].value });
                            self._ActionModal.getCtrl("signature-pad").addClass("opacity05").css("position", 'absolute').css("left", "5px").css("top", "5px");
                        }
                    });
                }
             
                let ro = new ResizeObserver(function (event) {
                    let width = self._ActionModal.getCtrl('box').outerWidth(true) - 15;
                    let height = self._ActionModal.getCtrl('box').outerHeight(false) - 15;
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);

                    signaturePad.clear();
                });

                ro.observe(self._ActionModal.getCtrl('box')[0]);
               
                function changeColor(r, g, b) {
                    signaturePad.penColor = "rgb(" + r + "," + g + "," + b + ")";
                }
                self._ActionModal.getCtrl("BtnSend").on('click', function (event) {
                    if (signaturePad.isEmpty()) {
                        jCom.BootstrapAlert("", "Please Sign Your Name");
                        return;
                    }
                    let img = new Image();
                    img.onload = function () {
                        let data = JSON.stringify(signaturePad.toData());
                        signaturePad.clear();
                        canvas.width = self.options.width;
                        canvas.height = img.height * self.options.width / img.width;
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                        let dataURL = signaturePad.toDataURL('image/png').replace('data:image/png;base64,', '');
                       
                        jCom.ajax(self.options.fdfCutImg, { Base64Img: dataURL, JsonString: data }, function (obj) {
                            self.__execCallBack(obj, addNewIcon, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop });
                        });
                    };
                    img.src = signaturePad.toDataURL('image/png');
                });

                self._ActionModal.getCtrl("BtnClear").on('click', function (event) {
                    signaturePad.clear();
                });

            }, function () {
                if (self.options.useVideo && self.options.canVideoTag) {
                    try {
                        self._ActionModal.getCtrl("videoRecord").videoRecord('destroy');
                    } catch (e) { console.log(e); }
                }
            });
        });
        ele.getCtrl("btnUpload").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            html += '<div class="row  text-end mb-1"><div class="col-sm-12"><button class="btn btn-success " type="button" name="BtnSend">Ok</button></div></div>';
            html += '<div class="row"><div class="col-sm-12"><div class=""c-input-item"><label for="fontsize" class="c-input-label">Upload</label><input  data-val="true" type="file" name="imageLoader" accept="image/*" class="form-control" /><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="fontsize"></span></div></div></div>';
            html += '<div name="box" style="height:30vh; padding:5px;border:1px solid; border-color:var(--bs-blue);" class="card mt-2"><canvas name="signature-pad" class="signature-pad signature-cursor-crosshair"></canvas> </div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnUpload, html, function () {
               
                let canvas = self._ActionModal.getCtrl("signature-pad")[0];
                let ctx = canvas.getContext('2d', { willReadFrequently: true });
                self._ActionModal.getCtrl('box').hide();
                self._ActionModal.getCtrl("imageLoader").on("change", function (event) {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        let img = new Image();
                        img.onload = function () {
                            self._ActionModal.getCtrl('box').show();
                            canvas.width = self._ActionModal.getCtrl('box').outerWidth(true) - 15;
                            canvas.height = (img.height / img.width) * (self._ActionModal.getCtrl('box').outerWidth(true) - 30);
                            self._ActionModal.getCtrl('box').css('height', ((img.height / img.width) * (self._ActionModal.getCtrl('box').outerWidth(true)) + 5) + 'px');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(event.target.files[0]);
                });
                self._ActionModal.getCtrl("imageLoader").on("click", function (event) {
                    event.stopPropagation();
                });
                self._ActionModal.getCtrl("BtnSend").on('click', function (event) {
                    let img = new Image();

                    img.onload = function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = self.options.width;
                        canvas.height = img.height * self.options.width / img.width;
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                        let dataURL = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
                        jCom.ajax(self.options.fdfCutImg, { "Base64Img": dataURL }, function (obj) {
                            self.__execCallBack(obj, addNewIcon, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop });
                        });
                    };
                    img.src = canvas.toDataURL('image/png');
                });
            }, function () { console.log('img 生成 介入'); self._ActionModal.find(".modal-body-pdf").html('');  });

        });
        ele.getCtrl("btnText").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            html += '<div class="row  text-end mb-1"><div class="col-sm-12"><button class="btn btn-success " type="button" name="BtnSend">Ok</button></div></div>';
            html += '<div name="pickColor" class="row" style=""><div class="col-md-12"><div class="c-input-item"><label for="fontName" class="c-input-label">' + self.options.LblbtnDtColor +'</label><div class="input-group input-colorpicker"><input type="text" name="colorpicker" class="form-control" value="' + self.options.penColor + '"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div></div></div></div>';
            html += '<div name="pickFamily" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontName" class="c-input-label">Family</label><select name="fontName" class="form-control" ></select><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="fontName"></span></div></div></div>';
            html += '<div name="pickSize" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontsize" class="c-input-label">Size：<span name="fontsizetxt">' + self.options.fontsize + '</span>pt</label><input name="fontsize" class="form-range" type="range" min="10" max="120" value="' + self.options.fontsize + '"><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="range"></span></div></div></div>';
            html += '<div name="picktxt" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="txt" class="c-input-label">Font</label><textarea class="form-control" name="txt" rows="3" data-val="true" data-val-required="This is a required field." data-jepun-field-holder=""></textarea><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="txt"></span></div></div></div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnText, html, function () {
                let color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                self._ActionModal.find('.input-colorpicker').colorpicker({
                    format: "hex",
                    extensions: [
                        {
                            name: 'swatches', // extension name to load
                            options: { // extension options
                                colors: {
                                    '#000000': '#000000',
                                    '#ffffff': '#ffffff',
                                    '#FF0000': '#FF0000',
                                    '#777777': '#777777',
                                    '#337ab7': '#337ab7',
                                    '#5cb85c': '#5cb85c',
                                    '#5bc0de': '#5bc0de',
                                    '#f0ad4e': '#f0ad4e',
                                    '#d9534f': '#d9534f'
                                },
                                namesAsValues: true
                            }
                        }
                    ]
                    //colorSelectors: {
                    //    '#000000': '#000000',
                    //    '#ffffff': '#ffffff',
                    //    '#FF0000': '#FF0000',
                    //    '#777777': '#777777',
                    //    '#337ab7': '#337ab7',
                    //    '#5cb85c': '#5cb85c',
                    //    '#5bc0de': '#5bc0de',
                    //    '#f0ad4e': '#f0ad4e',
                    //    '#d9534f': '#d9534f'
                    //}
                });
              
                $.when(self._ActionModal.addSelect("fontName", jFun.getAppParametersFunUrl("getFontList", "", false))).then(function () {
                    self._ActionModal.getCtrl("fontName").val(self.options.fontfamily);
                    self._ActionModal.getCtrl("fontName").select2({
                        dropdownAutoWidth: true,
                        dropdownParent: self._ActionModal,
                        theme: "bootstrap-5"
                    });
                });
                self._ActionModal.getCtrl("fontsize").on("change", function (e) {
                    let $ele = $(this);
                    console.log($ele.val());
                    self._ActionModal.getCtrl("fontsizetxt").text($ele.val());
                });
                self._ActionModal.getCtrl("BtnSend").on('click', function (event) {
                    if (!self._ActionModal.find('form').valid()) {
                        jCom.BootstrapAlert("", "Please input Your Text");
                        return;
                    }
                    let objs = self._ActionModal.find('form').formToJSON();
                    color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                    objs.red = color.r;
                    objs.green = color.g;
                    objs.blue = color.b;
                    objs.fontsize = self._ActionModal.getCtrl("fontsize").val() * 2;
                    jCom.ajax(self.options.fdfWritetextJpg, objs , function (obj) {
                        self.__execCallBack(obj, addNewTextIcon, $.extend(objs, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop }));
                    });
                });
            });

        });
        ele.getCtrl("btnSign").on("click", function (event) {
            let bool = false;
            for (const element of self.options.editeditablestep) {
                if (parseFloat(self.options.NowOrd) === parseFloat(element)) {
                    bool = true;
                }
            }
            bool = bool ? bool : (parseFloat(self.options.NowOrd) <= 0 ? true : false);
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            html += '<div name="signPicGroup" class="row gallery" style="flex-wrap:wrap;align-items:stretch;display:flex;"></div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnSign, html, function () {
                jCom.ajax(self.options.fdfPersonSign, { KeyNo: self.options.KeyNo, KeyType: self.options.KeyType,CanEdit: bool }, function (obj) {
                    self.__execCallBack(obj, function (event) {
                        $(event.html).iniView(function (ele) {
                            ele.getCtrl('selectSignPic').on("click", function () {
                                let selfPic = $(this);
      
                                jCom.ajax(self.options.fdfsetPersonSign, { Type: selfPic.getKeyVal(), tDpi: TBself.closest('.JpPEContenter').attr('_dpi') }, function (obj) {
                                    self.__execCallBack(obj, addNewStamp, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop });
                                });
                            });
                        }).appendTo(self._ActionModal.getCtrl("signPicGroup"));
                    });
                });
            });
        });
        ele.getCtrl("btnStamp").on("click", function (event) {
            let bool = false;
            for (const element of self.options.editeditablestep) {
                if (parseFloat(self.options.NowOrd) === parseFloat(element)) {
                    bool = true;
                }
            }
            bool = bool ? bool : (parseFloat(self.options.NowOrd) <= 0 ? true : false);
            // <div name="stampPicGroup" class="row gallery"></div >
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            html += '<div name="stampPicGroup" class="row gallery" style="flex-wrap:wrap;align-items:stretch;display:flex;"></div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnStamp, html, function () {
                jCom.ajax(self.options.fdfCompanySign, { Parametervalue: self.options.useStamp, CanEdit: bool }, function (obj) {
                    self.__execCallBack(obj, function (event) {
                        $(event.html).iniView(function (ele) {
                            ele.getCtrl('selectSignPic').on("click", function () {
                                let selfPic = $(this);
                                jCom.ajax(self.options.fdfsetCompanySign, { Type: selfPic.getKeyVal(), tDpi: TBself.closest('.JpPEContenter').attr('_dpi') }, function (obj) {
                                    self.__execCallBack(obj, addNewStamp, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop });
                                });
                            });
                        }).appendTo(self._ActionModal.getCtrl("stampPicGroup"));
                    });
                });
            });

        });

        ele.getCtrl("btnDateNow").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + 32;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + 50;
            let TBParent = TBself.parent();
            let html = '<form>';
            html += '<div class="row  text-end mb-1"><div class="col-sm-12"><button class="btn btn-success " type="button" name="BtnSend">Ok</button></div></div>';
            html += '<div name="pickColor" class="row" style=""><div class="col-md-12"><div class="c-input-item"><label for="fontName" class="c-input-label">' + self.options.LblbtnDtColor +'</label><div class="input-group input-colorpicker"><input type="text" name="colorpicker" class="form-control" value="' + self.options.penColor + '"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div></div></div></div>';
            html += '<div name="pickFamily" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontName" class="c-input-label">Family</label><select name="fontName" class="form-control" ></select><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="fontName"></span></div></div></div>';
            html += '<div name="pickSize" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontsize" class="c-input-label">Size：<span name="fontsizetxt">' + self.options.fontsize + '</span>pt</label><input name="fontsize" class="form-range" type="range" min="10" max="120" value="' + self.options.fontsize + '"><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="range"></span></div></div></div>';
            html += '<div name="picktxt" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="txt" class="c-input-label">Font</label><textarea class="form-control" name="txt" rows="3" data-val="true" data-val-required="This is a required field." data-jepun-field-holder="">' + new Date().Format("yyyy-MM-dd") + '</textarea><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="txt"></span></div></div></div>';
            html += '</form>';
            self.__openModal(self.options.LblbtnDateNow, html, function () {
                let color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                self._ActionModal.find('.input-colorpicker').colorpicker({
                    format: "hex",
                    extensions: [
                        {
                            name: 'swatches', // extension name to load
                            options: { // extension options
                                colors: {
                                    '#000000': '#000000',
                                    '#ffffff': '#ffffff',
                                    '#FF0000': '#FF0000',
                                    '#777777': '#777777',
                                    '#337ab7': '#337ab7',
                                    '#5cb85c': '#5cb85c',
                                    '#5bc0de': '#5bc0de',
                                    '#f0ad4e': '#f0ad4e',
                                    '#d9534f': '#d9534f'
                                },
                                namesAsValues: true
                            }
                        }
                    ]
                    //colorSelectors: {
                    //    '#000000': '#000000',
                    //    '#ffffff': '#ffffff',
                    //    '#FF0000': '#FF0000',
                    //    '#777777': '#777777',
                    //    '#337ab7': '#337ab7',
                    //    '#5cb85c': '#5cb85c',
                    //    '#5bc0de': '#5bc0de',
                    //    '#f0ad4e': '#f0ad4e',
                    //    '#d9534f': '#d9534f'
                    //}
                });
                $.when(self._ActionModal.addSelect("fontName", jFun.getAppParametersFunUrl("getFontList", "", false))).then(function () {
                    self._ActionModal.getCtrl("fontName").val(self.options.fontfamily);
                    self._ActionModal.getCtrl("fontName").select2({
                        dropdownAutoWidth: true,
                        dropdownParent: self._ActionModal,
                        theme: "bootstrap-5"
                    });
                });
                self._ActionModal.getCtrl("fontsize").on("change", function (e) {
                    let $ele = $(this);
                    console.log($ele.val());
                    self._ActionModal.getCtrl("fontsizetxt").text($ele.val());
                });
                self._ActionModal.getCtrl("BtnSend").on('click', function (event) {
                    if (!self._ActionModal.find('form').valid()) {
                        jCom.BootstrapAlert("", "Please input Your Text");
                        return;
                    }
                    let objs = self._ActionModal.find('form').formToJSON();
                    color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                    objs.red = color.r;
                    objs.green = color.g;
                    objs.blue = color.b;
                    objs.fontsize = self._ActionModal.getCtrl("fontsize").val() * 2;
                    jCom.ajax(self.options.fdfWritetextJpg, objs, function (obj) {
                        self.__execCallBack(obj, addNewTextIcon, $.extend(objs, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop }));
                    });
                });
            });
            
        });

        //回呼事件 增加新貼圖
        function addNewIcon(objs) {
            //加圖即為異動
            self._isReady = true;
            //切圖完畢 關閉modal
            self._ActionModal.modal('hide');
            //產出控項                            
            let PhotoLeft = objs.TBleft ? objs.TBleft : 0, PhotoTop = objs.TBtop ? objs.TBtop : 0;
            let img = new Image();
            let PhotoHeight = 0;
            let PhotoWidth = 0;
            img.onload = function () {
                PhotoHeight = img.height;
                PhotoWidth = img.width;
                let inner = " <div name='CompositePhotoContentBody_" + self._Editor.count + "' _user='" + objs.User + "' _stamp='false' class='CompositePhotoContentBody' style='height:" + PhotoHeight + "px;left:" + PhotoLeft + "px;top:" + PhotoTop + "px;width:" + PhotoWidth + "px;" + "' > " +
                    "<div name='CompositePhotoContent_" + self._Editor.count + "' class='CompositePhotoContent' style='height:" + PhotoHeight + "px;width:" + PhotoWidth + "px;" +
                    "'>" +
                    "<img  src='" + 'data:image/png;base64,' + objs.Img + "' style='width:100%;height:100%' >" +
                    "<div class='mask' style='left:0px;top:0px; width:" + PhotoWidth + "px ;height:" + PhotoHeight + "px'></div>" +
                    '</div><div class="edit-ui" style="display: none;">' +
                    '<a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' + 
                    '<a class="scale-btn" title="放大/縮小" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                    (self.options.useTrack ? '<a class="tool-btn" title="工具" name="ShowTrack" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>':'') +
                    '<a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                    "</div>";
                $(inner).appendTo(objs.TBParent).data("jsonstring",objs.JsonString);
                //加入圖即為異動
                self._isChange = true;
                self.element.removeClass("changed").addClass("changed");
                self._Editor.count++;
               
                self.element.find('.JpPEEditorTB').remove();
                self._setMask();
            };
            img.src = 'data:image/png;base64,' + objs.Img;

        }
        //回呼事件 增加新文字類型貼圖
        function addNewTextIcon(objs) {
            //加圖即為異動
            self._isReady = true;
            //切圖完畢 關閉modal
            self._ActionModal.modal('hide');
            //產出控項                            
            let PhotoLeft = objs.TBleft ? objs.TBleft : 0, PhotoTop = objs.TBtop ? objs.TBtop : 0;
            let img = new Image();
            let PhotoHeight = 0;
            let PhotoWidth = 0;
            img.onload = function () {
                let rpW = parseFloat(objs.TBParent.attr('_width'));
                let pW = parseFloat(objs.TBParent.css('width').replace('px', ''));
           
                let oDpi = parseFloat(objs.TBParent.attr('_dpi'));
                let tDpi = objs.Dpi ? parseFloat(objs.Dpi) : 96;
                let Wpercent = pW / rpW;
                let dpiPercent = oDpi / tDpi;
                PhotoHeight = (img.height / 2) * Wpercent * dpiPercent;
                PhotoWidth = (img.width / 2) * Wpercent * dpiPercent;
                let inner = " <div name='CompositePhotoContentBody_" + self._Editor.count + "' _user='" + objs.User + "' _stamp='false' class='CompositePhotoContentBody' style='height:" + PhotoHeight + "px;left:" + PhotoLeft + "px;top:" + PhotoTop + "px;width:" + PhotoWidth + "px;" + "' " +
                    //文字區段增加
                    " _text='1' _txt='" + objs.txt + "' _color='" + objs.colorpicker + "' _size='" + (objs.fontsize / 2) + "' _family='" + objs.fontName + "' " +
                    ">" +
                    "<div name='CompositePhotoContent_" + self._Editor.count + "' class='CompositePhotoContent' style='height:" + PhotoHeight + "px;width:" + PhotoWidth + "px;" +
                    "'>" +
                    "<img  src='" + 'data:image/png;base64,' + objs.Img + "' style='width:100%;height:100%' >" +
                    "<div class='mask' style='left:0px;top:0px; width:" + PhotoWidth + "px ;height:" + PhotoHeight + "px'></div>" +
                    '</div><div class="edit-ui" style="display: none;">' +
                    '<a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                    '<a class="tool-btn" title="工具" name="EditText" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>' +
                    //'<a class="scale-btn" title="放大/縮小" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                    '<a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                    "</div>";
                $(inner).appendTo(objs.TBParent);
                //加入圖即為異動
                self._isChange = true;
                self.element.removeClass("changed").addClass("changed");
                self._Editor.count++;

                self.element.find('.JpPEEditorTB').remove();
                self._setMask();
            };
            img.src = 'data:image/png;base64,' + objs.Img;
        }
        //回呼事件 增加新印章類型貼圖
        function addNewStamp(objs) {
            //加圖即為異動
            self._isReady = true;
            //切圖完畢 關閉modal
            self._ActionModal.modal('hide');
            let rpW = parseFloat(objs.TBParent.attr('_width'));
            let rpH = parseFloat(objs.TBParent.attr('_height'));
            let pW = parseFloat(objs.TBParent.css('width').replace('px', ''));
            let pH = parseFloat(objs.TBParent.css('height').replace('px', ''));
            let Wpercent = pW / rpW;
            let Hpercent = pH / rpH;

            //產出控項                            
            let PhotoLeft = objs.TBleft ? objs.TBleft : 0, PhotoTop = objs.TBtop ? objs.TBtop : 0;
            let img = new Image();
            let PhotoHeight = parseFloat(objs.height) * Hpercent;
            let PhotoWidth = parseFloat(objs.width) * Wpercent;
            let pno = objs.Pno ? "_pno='" + objs.Pno + "' " : '';
            let sno = objs.Sno ? "_sno='" + objs.Sno + "' " : '';
            img.onload = function () {
             
                let inner = " <div name='CompositePhotoContentBody_" + self._Editor.count + "' _user='" + objs.User + "' " + pno + sno +" _stamp='true' class='CompositePhotoContentBody' style='height:" + PhotoHeight + "px;left:" + PhotoLeft + "px;top:" + PhotoTop + "px;width:" + PhotoWidth + "px;" + "' > " +
                    "<div name='CompositePhotoContent_" + self._Editor.count + "' class='CompositePhotoContent' style='height:" + PhotoHeight + "px;width:" + PhotoWidth + "px;'>" +
                    "<div class='chopmask d-none' ><div class='content'>" + objs.ChopName + "</div></div>" +
                    "<img  src='" + 'data:image/png;base64,' + objs.Img + "' style='width:100%;height:100%' >" +
                    "<div class='mask' style='left:0px;top:0px; width:" + PhotoWidth + "px ;height:" + PhotoHeight + "px'></div>" +
                    '</div><div class="edit-ui" style="display: none;">' +
                    '<a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom"  ></a>' +
                    (objs.Sno ? '' :'<a class="scale-proportional-btn" title="等比放大/縮小" data-toggle="tooltip" data-container="body" data-placement="bottom"  ></a>') +
                    '<a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom"  ></a>' +
                    "</div>";
                $(inner).appendTo(objs.TBParent);
                self._Editor.count++;
                //加入圖即為異動
                self._isChange = true;
                self.element.removeClass("changed").addClass("changed");

                self.element.find('.JpPEEditorTB').remove();
                self._setMask();
                self._setMark();
            };
            img.src = 'data:image/png;base64,' + objs.Img;
        }
        ele.getCtrl("tooltip", "data-toggle").tooltip();
        return $(ele);
    },
    //(暫無使用)(內部呼叫)產出物件回呼事件
    _addNewIcon: function (objs) {
        const self = this;
        //切圖完畢 關閉modal
        self._ActionModal.modal('hide');
        //產出控項                            
        let PhotoLeft = objs.TBleft ? objs.TBleft : 0, PhotoTop = objs.TBtop ? objs.TBtop : 0;
        let img = new Image();
        let PhotoHeight = 0;
        let PhotoWidth = 0;
        img.onload = function () {
            PhotoHeight = img.height;
            PhotoWidth = img.width;
            let inner = " <div name='CompositePhotoContentBody_" + self._Editor.count + "' _user='" + objs.User + "' _stamp='false' class='CompositePhotoContentBody' style='height:" + PhotoHeight + "px;left:" + PhotoLeft + "px;top:" + PhotoTop + "px;width:" + PhotoWidth + "px;" + "' > " +
                "<div name='CompositePhotoContent_" + self._Editor.count + "' class='CompositePhotoContent' style='height:" + PhotoHeight + "px;width:" + PhotoWidth + "px;" +
                "'>" +
                "<img  src='" + 'data:image/png;base64,' + objs.Img + "' style='width:100%;height:100%' >" +
                "<div class='mask' style='left:0px;top:0px; width:" + PhotoWidth + "px ;height:" + PhotoHeight + "px'></div>" +
                '</div><div class="edit-ui" style="display: none;">' +
                '<a class="move-btn" title="移動" ></a><a class="scale-btn" title="放大/縮小" ></a><a class="delete-btn" title="刪除" ></a>' +
                "</div>";
            $(inner).appendTo(objs.TBParent);
            self._Editor.count++;
            self.element.find('.JpPEEditorTB').remove();
            self._setMask();
        };
        img.src = 'data:image/png;base64,' + objs.Img;
    },
    //(內部呼叫)綁定印章類型上事件(拖曳、刪除、放大縮小)
    _setMask: function () {
        const self = this;
        self.element.find(".mask").unbind('click').bind('click', function (event) {
            event.stopPropagation();
        });
        self.element.find(".mask").unbind('mouseover').bind('mouseover', function () {
            let nowself = $(this);
            //控制開關
            if (nowself.getKeyVal("_editor") === "0" || $(this).closest('.other').length > 0) {
                return;
            }

            self.element.find('.edit-ui').hide();
            nowself.parent().parent().children('.edit-ui').show();

        });
        //刪除圖層
        self.element.find(".delete-btn").unbind('click').bind('click', function () {
            //刪除圖即為異動
            self._isChange = true;
            self.element.removeClass("changed").addClass("changed");
            let atom = $(this).parent().parent();
            $(this).tooltip('dispose');
            atom.remove();
        });
        //移動圖層
        self.element.find(".move-btn").bind('mousedown', function () {
            //移動圖即為異動
            self._isChange = true;
            self.element.removeClass("changed").addClass("changed");
            let _xxx = 0, _yyy = 0;
            let atom = $(this).parent().parent();
            let $img = $(atom);
            let imgleft = $img.offset().left;
            let imgtop = $img.offset().top;
            let imgcssLeft = parseInt($img.css("left").replace("px", ""));
            let imgcsstop = parseInt($img.css("top").replace("px", ""));
            let $parent;
            if ($img.parent('.JpPEContenter').length > 0) {
                $parent = $img.parent('.JpPEContenter');
            }
            else {
                $parent = $img.parent();
            }


            if ($img.parent('.JpPEContenter').length === 0) {
                imgleft = imgleft - $parent.offset().left + $parent.parent().offset().left;
            }
            _yyy = $parent.offset().left + imgcssLeft - imgleft;
            _xxx = $parent.offset().top + imgcsstop - imgtop;


            let $mBtn = $(this);
            let $layer = $mBtn.parents('.CompositePhotoContentBody');
            let $mBtnPar;
            if ($mBtn.parents('.JpPEContenter').length > 0) {
                $mBtnPar = $mBtn.parents('.JpPEContenter');
            }
            else {
                $mBtnPar = $mBtn.parent();
            }
            $mBtn.parents('.CompositePhotoContentBody').draggable({
                stop: function () {
                    $mBtn.siblings('.move-btn').click();
                },
                containment: [
                    $mBtnPar.offset().left + _yyy + 1,
                    $mBtnPar.offset().top + _xxx + 1,
                    $mBtnPar.offset().left + $mBtnPar.outerWidth(true) - $layer.outerWidth(true) - _yyy - 1,
                    $mBtnPar.offset().top + $mBtnPar.outerHeight(true) - $layer.outerHeight(true) - _xxx - 1 - 20
                ],
                handle: '.move-btn'
            });


        });
        //縮放圖層(不定比)
        self.element.find(".scale-btn").bind('mousedown', function (event) {
            //縮放圖即為異動
            self._isChange = true;
            self.element.removeClass("changed").addClass("changed");
            let atom = $(this).parent().parent();

            self._Editor.MovingItem = atom;
            self._Editor.isScale = true;
        });
        self.element.find(".scale-proportional-btn").bind('mousedown', function (event) {
            //縮放圖即為異動
            self._isChange = true;
            self.element.removeClass("changed").addClass("changed");
            let atom = $(this).parent().parent();
            self._Editor.MovingItem = atom;
            self._Editor.isScale = true;
            self._Editor.isPropScale = true;
        });
        self.element.getCtrl('edit-ui', 'class').getCtrl("tooltip", "data-toggle").tooltip();

        self.element.getCtrl("EditText").unbind('click').bind("click", function (event) {
            let $ele = $(this);
            console.log($ele);
            let TBself = $ele.closest('.CompositePhotoContentBody');
            let TBleft = parseInt(TBself.css("left").replace("px", "")) ;
            let TBtop = parseInt(TBself.css("top").replace("px", "")) ;
            let TBParent = TBself.parent();
            let penColor = TBself.attr("_color") ? TBself.attr("_color") : self.options.penColor;
            let fontsize = TBself.attr("_size") ? TBself.attr("_size") : self.options.fontsize;
            let txt = TBself.attr("_txt") ? TBself.attr("_txt") : '';
            let fontfamily = TBself.attr("_family") ? TBself.attr("_family") : self.options.fontfamily;
            let html = '<form>';
            html += '<div class="row  text-end mb-1"><div class="col-sm-12"><button class="btn btn-success " type="button" name="BtnSend">Ok</button></div></div>';
            html += '<div name="pickColor" class="row" style=""><div class="col-md-12"><div class="c-input-item"><label for="fontName" class="c-input-label">' + self.options.LblbtnDtColor +'</label><div class="input-group input-colorpicker"><input type="text" name="colorpicker" class="form-control" value="' + penColor + '"><span class="input-group-text colorpicker-input-addon" tabindex="0"><i></i></span></div></div></div></div>';
            html += '<div name="pickFamily" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontName" class="c-input-label">Family</label><select name="fontName" class="form-control" ></select><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="fontName"></span></div></div></div>';
            html += '<div name="pickSize" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="fontsize" class="c-input-label">Size：<span name="fontsizetxt">' + fontsize + '</span>pt</label><input name="fontsize" class="form-range" type="range" min="10" max="120" value="' + fontsize + '"><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="range"></span></div></div></div>';
            html += '<div name="picktxt" class="row" style=""><div class="col-sm-12"><div class="c-input-item"><label for="txt" class="c-input-label">Font</label><textarea class="form-control" name="txt" rows="3" data-val="true" data-val-required="This is a required field." data-jepun-field-holder="">' + txt+'</textarea><span data-valmsg-replace="true" class="text-danger field-validation-valid" data-valmsg-for="txt"></span></div></div></div>';
            html += '</form>';
            self.__openModal("Text", html, function () {
                let color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                self._ActionModal.find('.input-colorpicker').colorpicker({
                    format: "hex",
                    extensions: [
                        {
                            name: 'swatches', // extension name to load
                            options: { // extension options
                                colors: {
                                    '#000000': '#000000',
                                    '#ffffff': '#ffffff',
                                    '#FF0000': '#FF0000',
                                    '#777777': '#777777',
                                    '#337ab7': '#337ab7',
                                    '#5cb85c': '#5cb85c',
                                    '#5bc0de': '#5bc0de',
                                    '#f0ad4e': '#f0ad4e',
                                    '#d9534f': '#d9534f'
                                },
                                namesAsValues: true
                            }
                        }
                    ]
                    //colorSelectors: {
                    //    '#000000': '#000000',
                    //    '#ffffff': '#ffffff',
                    //    '#FF0000': '#FF0000',
                    //    '#777777': '#777777',
                    //    '#337ab7': '#337ab7',
                    //    '#5cb85c': '#5cb85c',
                    //    '#5bc0de': '#5bc0de',
                    //    '#f0ad4e': '#f0ad4e',
                    //    '#d9534f': '#d9534f'
                    //}
                });
                $.when(self._ActionModal.addSelect("fontName", jFun.getAppParametersFunUrl("getFontList", "", false))).then(function () {
                    self._ActionModal.getCtrl("fontName").val(fontfamily);
                    self._ActionModal.getCtrl("fontName").select2({
                        dropdownAutoWidth: true,
                        dropdownParent: self._ActionModal,
                        theme: "bootstrap-5"
                    });
                });
                self._ActionModal.getCtrl("fontsize").on("change", function (e) {
                    let $ele = $(this);
                    console.log($ele.val());
                    self._ActionModal.getCtrl("fontsizetxt").text($ele.val());
                });
                self._ActionModal.getCtrl("BtnSend").on('click', function (event) {
                    if (!self._ActionModal.find('form').valid()) {
                        jCom.BootstrapAlert("", "Please input Your Text");
                        return;
                    }
                    let objs = self._ActionModal.find('form').formToJSON();
                    color = self._hexToRgb(self._ActionModal.getCtrl("colorpicker").val());
                    objs.red = color.r;
                    objs.green = color.g;
                    objs.blue = color.b;
                    objs.fontsize = self._ActionModal.getCtrl("fontsize").val() * 2;
                    jCom.ajax(self.options.fdfWritetextJpg, objs, function (obj) {
                        console.log(obj);
                        self.__execCallBack(obj, addNewTextIcon, $.extend(objs, { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop }));
                    });
                });
            });
            //回呼事件 修改新文字類型貼圖
            function addNewTextIcon(objs) {
                //修改圖完畢
                self._isReady = true;
                //切圖完畢 關閉modal
                self._ActionModal.modal('hide');
                //產出控項                            
                let PhotoLeft = objs.TBleft ? objs.TBleft : 0, PhotoTop = objs.TBtop ? objs.TBtop : 0;
                let img = new Image();
                let PhotoHeight = 0;
                let PhotoWidth = 0;
                img.onload = function () {
                    let rpW = parseFloat(objs.TBParent.attr('_width'));
                    let pW = parseFloat(objs.TBParent.css('width').replace('px', ''));

                    let oDpi = parseFloat(objs.TBParent.attr('_dpi'));
                    let tDpi = objs.Dpi ? parseFloat(objs.Dpi) : 96;
                    let Wpercent = pW / rpW;
                    let dpiPercent = oDpi / tDpi;
                    PhotoHeight = (img.height / 2) * Wpercent * dpiPercent;
                    PhotoWidth = (img.width / 2) * Wpercent * dpiPercent;

                    TBself.css("height", PhotoHeight + 'px').css("width", PhotoWidth + 'px').css("left", PhotoLeft + 'px').css("top", PhotoTop + 'px');
                    TBself.attr("_txt", objs.txt).attr("_color", objs.colorpicker).attr("_size", (objs.fontsize / 2)).attr("_family", objs.fontName);
                    TBself.find('img').attr("src", 'data:image/png;base64,' + objs.Img);
                    TBself.find('.CompositePhotoContent').css("height", PhotoHeight + 'px').css("width", PhotoWidth + 'px');

                    TBself.find('.mask').css("height", PhotoHeight + 'px').css("width", PhotoWidth + 'px');
                    //修改圖即為異動
                    self._isChange = true;
                    self.element.removeClass("changed").addClass("changed");
                    self._setMask();
                };
                img.src = 'data:image/png;base64,' + objs.Img;
            }

        });

        self.element.getCtrl("ShowTrack").unbind('click').bind("click", function (event) {
            let $ele = $(this);
            let TBself = $ele.closest('.CompositePhotoContentBody');
            console.log(JSON.parse(TBself.data("jsonstring")));
            $("#" + self.options.fromForm).fireHandler({ type: "ShowTrackData", data: JSON.parse(TBself.data("jsonstring")) });

        });
        
    },
    //(內部呼叫)綁定全域事件，移動等故採用one進行一次性行為
    _setFormControl: function () {
        const self = this;

        if ($(self.element).is(":visible")) {
            //修正file類物件員生事件被綁走導致無法觸發上傳問題發生
            self.options.scrollTrigger.find('input[type="file"]').one("click", function (event) {
                event.stopPropagation();
                self._setFormControl();
            });
            self.options.scrollTrigger.off('.clickForJpPdf').one('click.clickForJpPdf', function (event) {
                event.preventDefault();
                ////console.log(event);
                if ($(event.target).parents('.JpPEContenter').length === 0) {
                    self.element.find('.JpPEEditorTB').remove();
                }
                if ($(event.target).parents('.JpPEContenter').length === 0 && $(event.target).parents('.WordEditorTB').length === 0) {
                    self.element.find('.edit-ui').hide();
                }
                self._Editor.isScale = false;
                self._setFormControl();
            });
            self.options.scrollTrigger.off('.mousemoveForJpPdf').one("mousemove.mousemoveForJpPdf", function (e) {

                let _mx, _my, _curX, _curY, _curW, _curH, _prop, _newW, _newH;
                //普通縮放
                if (self._Editor.isScale) {
                    if (navigator.userAgent.match("MSIE")) {
                        _mx = e.clientX + document.body.scrollLeft;
                        _my = e.clientY + document.body.scrollTop;
                    } else {
                        _mx = e.pageX;
                        _my = e.pageY;
                    }

                    let $atom = $(self._Editor.MovingItem);
                    _curX = $atom.offset().left;
                    _curY = $atom.offset().top;
                    _curW = $atom.outerWidth(true);
                    _curH = $atom.outerHeight(true);
                    _prop = _curH / _curW;
                    _newW = _mx - _curX > self.options.scareMinW ? _mx - _curX : self.options.scareMinW;
                    //介入計算大小(等比例)
                    if (self._Editor.isPropScale) {
                        _newH = _newW * _prop;
                    } else {
                        _newH = _my - _curY > self.options.scareMinH ? _my - _curY : self.options.scareMinH;
                    }
                    let $atomParent = null;
                    if ($atom.parent('.JpPEContenter').length > 0) {
                        $atomParent = $atom.parent('.JpPEContenter');
                    }
                    else {
                        $atomParent = $atom.parent().parent('.WordContenter').length > 0 ? $atom.parent().parent('.WordContenter') : $atom.parent().parent('.JpPEContenter');
                    }
                    if ($atomParent.length > 0) {
                        if ((_mx > _curX || _my > _curY) && _mx >= $atomParent.offset().left && _mx <= $atomParent.offset().left + $atomParent.outerWidth(true) && _my >= $atomParent.offset().top && _my <= $atomParent.offset().top + $atomParent.outerHeight(true)) {

                            $atom.css("width", _newW + 'px').css('height', _newH + 'px');
                            $atom.children('.CompositePhotoContent').css("width", _newW + 'px').css('height', _newH + 'px'); //待修正
                            $atom.children('.CompositePhotoContent').children('.mask').css("width", _newW + 'px').css('height', _newH + 'px'); //待修正
                        }
                    }
                }
               

                self._setFormControl();
            });
            self.options.scrollTrigger.unbind('mouseup').bind('mouseup', function (event) {
                self._Editor.isScale = false;
                self._Editor.isPropScale = false;
                self._Editor.MovingItem = "";
            });
            
        }
    },
    //(內部呼叫)載入所有印章
    _loadAllStamp: function () {
        const self = this;
        jCom.ajax(self.options.fdfgetPdfStamp, { Vno: self.options.Vno, Dno: self.options.Dno, KeyNo: self.options.KeyNo, KeyType: self.options.KeyType, Ord: self.options.NowOrd }, function (obj) {

            self.__execCallBack(obj, function (objs) {
                if (objs.file !== undefined) {
                    let fileList = $.parseJSON(objs.file);
                    console.log(fileList);
                    for (const element of fileList) {
                        let rpW = parseFloat(self.element.getCtrl("Drawer_" + element["Pages"]).attr('_width'));
                        let rpH = parseFloat(self.element.getCtrl("Drawer_" + element["Pages"]).attr('_height'));
                        let pW = parseFloat(self.element.getCtrl("Drawer_" + element["Pages"]).css('width').replace('px', ''));
                        let Wpercent = pW / rpW;
                        
                        let PhotoHeight = parseFloat(element["Height"]) * Wpercent;
                        let PhotoWidth = parseFloat(element["Width"]) * Wpercent;
                        let PhotoLeft = parseFloat(element["X_axis"]) * Wpercent;
    
                        let PhotoTop = (rpH * Wpercent) - (parseFloat(element["Y_axis"]) * Wpercent) - PhotoHeight;

                        let inner = " <div name='CompositePhotoContentBody_" + self._Editor.count + "' _user='" + element["Uno"] + "' class='CompositePhotoContentBody' style='height:" + PhotoHeight + "px;left:" + PhotoLeft + "px;top:" + PhotoTop + "px;width:" + PhotoWidth + "px;'"+
                            " _sno='" + element["Sno"] + "' _pno='" + element["Pno"] + "' _stamp='" + element["Stamp"] + "'" +
                            //文字區段增加
                            " _text='" + element["IsText"] + "' _txt='" + element["txt"] + "' _color='" + element["Color"] + "' _size='" + element["Size"] + "' _family='" + element["Family"] + "' " +
                            " > " +
                            "<div name='CompositePhotoContent_" + self._Editor.count + "' class='CompositePhotoContent " + (jFun.ConvertBool(element["owner"] + "") ? '' : 'other') + "' style='height:" + PhotoHeight + "px;width:" + PhotoWidth + "px;" + "'>" +
                            (element["Sno"] + "" !== "0" ? "<div class='chopmask d-none' ><div class='content'>" + element["ChopName"] + "</div></div>" : "") +
                            (element["Pno"] + "" !== "0" ? "<div class='chopmask d-none' ><div class='content'>" + element["UserName"] + "</div></div>" : "") +
                            "<img  src='" + element["ContentType"] + element["Base64File"] + "' style='width:100%;height:100%' >" +
                            "<div class='mask' style='left:0px;top:0px; width:" + PhotoWidth + "px ;height:" + PhotoHeight + "px'></div>" +
                            '</div><div class="edit-ui" style="display: none;">' + //'<a class="rotate-btn" title="旋轉"></a>'+
                            '<a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                            (jFun.ConvertBool(element["Stamp"] + "") || jFun.ConvertBool(element["IsText"] + "")  ? '' : '<a class="scale-btn" title="放大/縮小" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>') +
                            (jFun.ConvertBool(element["IsText"] + "") ? '<a class="tool-btn" title="工具" name="EditText" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>' : '') +
                            (element["Pno"] + "" === "0" ? '' : '<a class="scale-proportional-btn" title="等比放大/縮小" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>') +
                            '<a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>' +
                            "</div>";

                        $(inner).appendTo(self.element.getCtrl("Drawer_" + element["Pages"]));
                        self._Editor.count++;
                        self._setMask();

                    }
                    self._setLeftTab();
                    self._setMark();
                }
            });
        });
    },
    //(內部呼叫)印章遮罩馬賽克模糊化
    _setMark: function () {
        const self = this;
        if (self.options.setMark === false) {
            return;
        }
        jCom.ajax(self.options.fdfgetKeeper, { Vno: self.options.Vno, Dno: self.options.Dno, KeyNo: self.options.KeyNo, KeyType: self.options.KeyType, Ord: self.options.NowOrd }, function (obj) {
            self.__execCallBack(obj, function (objs) {
                //先將遮罩打開
                self.element.find('.chopmask').removeClass("d-none").removeClass("show").addClass("show");
                if (!self.options.setMarkType.includes('Sno')) {
                    self.element.find(".CompositePhotoContentBody:not([_sno='0'])").find('.chopmask').removeClass("show").removeClass("d-none").addClass("d-none");
                }
                let SnoList = $.parseJSON(objs.Snos);
                SnoList.forEach(function (a, b) {
                    self.element.find(".CompositePhotoContentBody[_sno='" + a + "']").find('.chopmask').removeClass("show").removeClass("d-none").addClass("d-none");
                });
                if (!self.options.setMarkType.includes('Pno')) {
                    self.element.find(".CompositePhotoContentBody:not([_pno='0'])").find('.chopmask').removeClass("show").removeClass("d-none").addClass("d-none");
                }
                let PnoList = $.parseJSON(objs.Pnos);
                PnoList.forEach(function (a, b) {
                    self.element.find(".CompositePhotoContentBody[_pno='" + a + "']").find('.chopmask').removeClass("show").removeClass("d-none").addClass("d-none");
                });

                let t1Type = $.parseJSON(objs.T1Type);

                if (((t1Type === "99" || t1Type === "1299") || self.options.FormState === 2)) {
                    self.element.find('.chopmask').removeClass("show").removeClass("d-none").addClass("d-none");
                }

            });
        });
    },
    //#endregion
    //#region Draw相關Fun
    //(內部呼叫)建立(直接塗鴉)編輯器
    _createPdfDrawer: function () {
        const self = this;
        self._Drawer = {};
        self._Drawer.canvas = null;
        self._Drawer.ctx = [];
        self._Drawer.signaturePad = [];
        self._Drawer.alpha = 1;
        self._Drawer.minWidth = 1;
        self._Drawer.maxWidth = 4;
        self._Drawer.operation = 'Operation';
        self._Drawer.canvasOn = true;
        self._Drawer.color = self.options.penColor ;
        self._Drawer.action = 1;
        //self.element.getCtrl('JpPEBG').isImgLoad(function () {
            // 載入完成
            //form.callDataBus("FormDataReview/GetFdfFormDrawerStamperT1", { 'Vno': form.getCtrl("Vno").val(), 'Ord': form.getCtrl("NowOrd").val() });
            if (self.options.DrawCanEditor) {
                self._Drawer.canvas = self.element.find('.JpPESign');
                self._Drawer.ctx = [];
                self._Drawer.signaturePad = [];
                self._Drawer.canvas.each(function (a, b) {
                    self._Drawer.ctx.push(b.getContext('2d', { willReadFrequently: true }));
                    self._Drawer.signaturePad.push(new SignaturePad(b, {
                        penColor: self._Drawer.color,
                        minWidth: self._Drawer.minWidth,
                        maxWidth: self._Drawer.maxWidth,
                        //dotSize: 0,
                        //throttle: 16,
                        //minDistance: 0,
                        //velocityFilterWeight:0
                    }));
                });
                for (let i = 0; i < self._Drawer.ctx.length; i++) {
                    //閉包語法修正
                    (function (j) {
                        let canvasNow = $(self._Drawer.canvas[j]);
                        //先宣告變形重置大小
                        let ro = new ResizeObserver(function (event) {
                            self._setCanvas(canvasNow.parent().outerWidth(true) - 2, canvasNow.parent().outerHeight(true) - 22, self._Drawer.canvas[j], self._Drawer.signaturePad[j]);
                            self._Drawer.minWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 500;
                            self._Drawer.maxWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 250;
                            self._Drawer.signaturePad[j].minWidth = self._Drawer.minWidth;
                            self._Drawer.signaturePad[j].maxWidth = self._Drawer.maxWidth;
                        });

                        ro.observe(canvasNow.parent().getCtrl('JpPEBG', 'class')[0]);
                        self._setCanvas(canvasNow.parent().outerWidth(true) - 2, canvasNow.parent().outerHeight(true) - 22, self._Drawer.canvas[j], self._Drawer.signaturePad[j]);
                        self._Drawer.minWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 500;
                        self._Drawer.maxWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 250;
                        self._Drawer.signaturePad[j].minWidth = self._Drawer.minWidth;
                        self._Drawer.signaturePad[j].maxWidth = self._Drawer.maxWidth;

                        function changed() {
                            console.log("塗鴉了,監聽 by BeginStroke");
                            self._isChange = true;
                            self.element.removeClass("changed").addClass("changed");
                            self._Drawer.signaturePad.forEach(function (a) {
                                a.removeEventListener("beginStroke", changed);
                            });
                        }

                        self._Drawer.signaturePad[j].addEventListener("beginStroke", changed);


                        self._Drawer.signaturePad[j].onBegin = function (event) {
                            console.log("塗鴉了 呵呵", event);
                            self._isChange = true;
                            self.element.removeClass("changed").addClass("changed");
                            self._Drawer.signaturePad.forEach(function (a) { a.onBegin = null; });
                        };
                    })(i);
                }
            }
            self._loadAllDrawer();
        //});


    },
    //設定Canvas大小，筆觸大小
    _setCanvas: function (width, height, thiscanvas, thissignaturePad) {
        const self = this;

        thiscanvas.setAttribute('width', width);
        thiscanvas.setAttribute('height', height);

        let img = new Image();
        img.onload = function () {
            thissignaturePad.clear();
            thiscanvas.width = width;
            thiscanvas.height = height;
            thissignaturePad.fromDataURL($(thiscanvas).attr('src_'), { width: thiscanvas.width, height: thiscanvas.height });
            self._setPen();
        };

        if ($(thiscanvas).attr('src_')) {
            img.src = $(thiscanvas).attr('src_');
        }
        thissignaturePad.clear();
    },
    //設定筆觸大小
    _setPen: function () {
        const self = this;
        let color = self._hexToRgb(self._Drawer.color);
        for (let i = 0; i < self._Drawer.ctx.length; i++) {
            self._Drawer.ctx[i].globalCompositeOperation = self._Drawer.operation;
            self._Drawer.signaturePad[i].minWidth = self._Drawer.minWidth;
            self._Drawer.signaturePad[i].maxWidth = self._Drawer.maxWidth;
            self._Drawer.signaturePad[i].penColor = 'RGBA(' + color.r + "," + color.g + "," + color.b + "," + self._Drawer.alpha + ")";
            self._Drawer.signaturePad[i].on();
            self._Drawer.canvasOn = true;
        }
    },
    //判斷是否為空畫布
    _isCanvasBlank: function (thiscanvas) {
        let context = thiscanvas.getContext('2d', { willReadFrequently: true });
        let pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, thiscanvas.width, thiscanvas.height).data.buffer
        );
        return !pixelBuffer.some(function (color) { if (color !== 0) { return true; } else { return false; } });
    },
    //Hex色碼轉換成RGB 3色
    _hexToRgb: function (hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    //(內部呼叫)設定直接塗鴉按鈕事件
    __setDrawBtn: function (ele) {
        const self = this;
        self._Drawer = self._Drawer !== undefined ? self._Drawer : {};
        self._Drawer.canvas = self._Drawer.canvas !== undefined ? self._Drawer.canvas : null;
        self._Drawer.ctx = self._Drawer.ctx !== undefined ? self._Drawer.ctx : [];
        self._Drawer.signaturePad = self._Drawer.signaturePad !== undefined ? self._Drawer.signaturePad : [];
        self._Drawer.alpha = self._Drawer.alpha !== undefined ? self._Drawer.alpha : 1;
        self._Drawer.minWidth = self._Drawer.minWidth !== undefined ? self._Drawer.minWidth : 1;
        self._Drawer.maxWidth = self._Drawer.maxWidth !== undefined ? self._Drawer.maxWidth : 2;
        self._Drawer.operation = self._Drawer.operation !== undefined ? self._Drawer.operation : 'Operation';
        self._Drawer.canvasOn = self._Drawer.canvasOn !== undefined ? self._Drawer.canvasOn : true;
        self._Drawer.color = self._Drawer.color !== undefined ? self._Drawer.color : self.options.penColor;
        self._Drawer.action = self._Drawer.action !== undefined ? self._Drawer.action : 1;
        ele.getCtrl("btnDtPencil").on("click", function (event  ) {
            event.preventDefault();                             
            let selfbtn = $(this);
            selfbtn.closest('.JpPETBsec').find('.active').removeClass("active");
            selfbtn.addClass("active");
            self._Drawer.operation = 'source-over';
            self._Drawer.minWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 500;
            self._Drawer.maxWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 400;
            self._Drawer.alpha = 1;
            self._Drawer.action = 1;
            self._setPen();
        });
        ele.getCtrl("btnDtPoint").on("click", function (event) {
            event.preventDefault();
            let selfbtn = $(this);
            selfbtn.closest('.JpPETBsec').find('.active').removeClass("active");
            selfbtn.addClass("active");
            self._Drawer.canvasOn = false;
            self._Drawer.action = 2;
            for (var i = 0; i < self._Drawer.ctx.length; i++) {
                self._Drawer.signaturePad[i].off();
            }
        });
        ele.getCtrl("btnDtHighlight").on("click", function (event) {
            event.preventDefault();
            let selfbtn = $(this);
            selfbtn.closest('.JpPETBsec').find('.active').removeClass("active");
            selfbtn.addClass("active");
            self._Drawer.operation = 'source-over';
            self._Drawer.minWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 200;
            self._Drawer.maxWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 100;
            self._Drawer.alpha = 0.1;
            self._Drawer.action = 3;
            self._setPen();
        });
        ele.getCtrl("btnDtEraser").on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            let selfbtn = $(this);
            selfbtn.closest('.JpPETBsec').find('.active').removeClass("active");
            selfbtn.addClass("active");
            self._Drawer.operation = 'destination-out';
            self._Drawer.minWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 100;
            self._Drawer.maxWidth = ($(self._Drawer.canvas[0]).parent().outerWidth(true) - 2) / 50;
            self._Drawer.alpha = 1;
            self._Drawer.action = 4;
            self._setPen();
        });
        //ele.getCtrl("btnDtColor").on("click", function (event) {
        //    event.preventDefault();
        //    event.stopPropagation();
        //    let selfBtn = $(this);

        //});
        ele.find('.input-colorpicker').on("click", function () {
            console.log('click');
        });
        ele.find('.input-colorpicker').colorpicker({
            format: "hex",
            extensions: [
                {
                    name: 'swatches', // extension name to load
                    options: { // extension options
                        colors: {
                            '#000000': '#000000',
                            '#ffffff': '#ffffff',
                            '#FF0000': '#FF0000',
                            '#777777': '#777777',
                            '#337ab7': '#337ab7',
                            '#5cb85c': '#5cb85c',
                            '#5bc0de': '#5bc0de',
                            '#f0ad4e': '#f0ad4e',
                            '#d9534f': '#d9534f'
                        },
                        namesAsValues: true
                    }
                }
            ]
            //colorSelectors: {
            //    '#000000': '#000000',
            //    '#ffffff': '#ffffff',
            //    '#FF0000': '#FF0000',
            //    '#777777': '#777777',
            //    '#337ab7': '#337ab7',
            //    '#5cb85c': '#5cb85c',
            //    '#5bc0de': '#5bc0de',
            //    '#f0ad4e': '#f0ad4e',
            //    '#d9534f': '#d9534f'
            //}
        }).on("change", function (e) {
            console.log(123);
            self._Drawer.color = e.color.toString('hex');
            self._setPen();
        });
        ele.getCtrl("btnDtReset").on("click", function (event) {
            event.preventDefault();
            self._Drawer.signaturePad.forEach(function (a, b) {
                if ($(a.canvas).parents('.JpPEContenter').attr('name') === self.element.getCtrl('PageShow').val()) {
                    self._isChange = true;
                    self.element.removeClass("changed").addClass("changed");
                    $(a.canvas).attr('src_', '');
                    self._Drawer.signaturePad[b].clear();
                }
            });
        });
        //overflow:hidden;導致會出不來暫時先mark
        ele.getCtrl("tooltip", "data-toggle").tooltip();
        return $(ele);
    },
    //(內部呼叫)載入所有直接塗鴉存檔
    _loadAllDrawer: function () {
        const self = this;
        jCom.ajax(self.options.fdfgetPdfDrawer, { Vno: self.options.Vno, Dno: self.options.Dno, KeyNo: self.options.KeyNo, KeyType: self.options.KeyType, Ord: self.options.NowOrd  }, function (obj) {
            self.__execCallBack(obj, function (objs) {
                if (objs.file !== undefined) {
                    let fileList = $.parseJSON(objs.file);
                    console.log(fileList);
                    for (const element of fileList)
                    {
                        if (jFun.ConvertBool(element["owner"] + "")) {
                            self.element.getCtrl("Drawer_" + element["Pages"] + "_canvas").attr("src_", element["ContentType"] + element["Base64File"]).attr('_user', element["Uno"]);
                        }
                        else {
                            let inner = "<img class='DrawerOtherBG' _user='" + element["Uno"] + "' src='" + element["ContentType"] + element["Base64File"] + "' />";
                            $(inner).appendTo(self.element.getCtrl("Drawer_" + element["Pages"]));
                        }
                    }

                    for (let i = 0; i < self._Drawer.ctx.length; i++) {
                        //閉包語法修正
                        (function (j) {
                            let selfCanvas = $(self._Drawer.canvas[j]);
                            //先宣告變形重置大小
                            let ro = new ResizeObserver(function (event) {


                                self._setCanvas(selfCanvas.parent().outerWidth(true) - 2, selfCanvas.parent().outerHeight(true) - 22, self._Drawer.canvas[j], self._Drawer.signaturePad[j]);
                                self._Drawer.minWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 500;
                                self._Drawer.maxWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 250;
                                self._Drawer.signaturePad[j].minWidth = self._Drawer.minWidth;
                                self._Drawer.signaturePad[j].maxWidth = self._Drawer.maxWidth;
                            });
                            if (selfCanvas.parent().getCtrl('DrawerBG', 'class').length > 0) {
                                ro.observe(selfCanvas.parent().getCtrl('DrawerBG', 'class')[0]);
                            }
                            self._setCanvas(selfCanvas.parent().outerWidth(true) - 2, selfCanvas.parent().outerHeight(true) - 22, self._Drawer.canvas[j], self._Drawer.signaturePad[j]);
                            self._Drawer.minWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 500;
                            self._Drawer.maxWidth = ($(self._Drawer.canvas[j]).parent().outerWidth(true) - 2) / 250;
                            self._Drawer.signaturePad[j].minWidth = self._Drawer.minWidth;
                            self._Drawer.signaturePad[j].maxWidth = self._Drawer.maxWidth;
                        })(i);
                    }
                    self._setLeftTab();
                }
            });
        });
    },
    //#endregion
    //(內部)合併所有PDF資訊
    _mergePdf: function () {
        const self = this;
        jCom.ajax(self.options.fdfmergePdf, {
            Vno: self.options.Vno,
            Dno: self.options.Dno,
            KeyNo: self.options.KeyNo,
            KeyType: self.options.KeyType
        }, function (obj) {
            self.__execCallBack(obj, function (objs) {
                let url = jCom.urlPath(objs.file);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'file.PDF';
                link.click();

            });

        });
    },
    _reload: function () {
        const self = this;
        self.element.empty();
        $(self.options.scrollTrigger).off(".scrollForJpPdf");
    },
    //(內部呼叫)存檔
    _save: function () {
        const self = this;
        let draw = [];
        //有開放塗鴉再轉換存檔
        if (self.options.toolbox.includes('Drawer')) {
            $.each(self._Drawer.signaturePad, function (i, ele) {
                let selfCanvas = $(ele.canvas);
                let img = {};
                let rpW = parseFloat(selfCanvas.parents('.JpPEContenter').attr('_width'));
                let rpH = parseFloat(selfCanvas.parents('.JpPEContenter').attr('_height'));

                img.pages = selfCanvas.parents('.JpPEContenter').attr('_pages');
                img.Width = rpW;
                img.Height = rpH;
                img.Base64File = ele.toDataURL('image/png', 2).replace('data:image/png;base64,', '');
                img.ContentType = 'data:image/png;base64,';
                draw.push(img);
            });
        }
        let stamp = [];
        if (self.options.toolbox.includes('Editor')) {
            let AllImg = self.element.find('.CompositePhotoContentBody');
            $.each(AllImg, function (i, ele) {
                let selfStamp = $(ele);
                if (selfStamp.find('.other').length <= 0) {
                    let img = {};
                    let rpW = parseFloat(selfStamp.parents('.JpPEContenter').attr('_width'));
                    let rpH = parseFloat(selfStamp.parents('.JpPEContenter').attr('_height'));
                    let pW = parseFloat(selfStamp.parents('.JpPEContenter').css('width').replace('px', ''));
                    let pH = parseFloat(selfStamp.parents('.JpPEContenter').css('height').replace('px', ''));
                    let Wpercent = rpW / pW;
                    let Hpercent = rpH / pH;
                    img.pages = selfStamp.parents('.JpPEContenter').attr('_pages');
                    img.X_axis = parseFloat(selfStamp.css("left").replace('px', '')) * Wpercent;
                    img.Y_axis = (pH - parseFloat(selfStamp.css("top").replace('px', '')) - parseFloat(selfStamp.css("height").replace('px', ''))) * Hpercent;
                    //img.Y_axis = parseFloat(self.css("top").replace('px', '')) * Hpercent;//上方 須重算
                    img.Width = parseFloat(selfStamp.css("width").replace('px', '')) * Wpercent;
                    img.Height = parseFloat(selfStamp.css("height").replace('px', '')) * Hpercent;
                    img.Base64File = selfStamp.find('img').attr('src').replace('data:image/png;base64,', '');
                    img.Stamp = selfStamp.attr('_stamp');
                    img.Sno = selfStamp.attr('_sno');
                    img.Pno = selfStamp.attr('_pno');
                    img.ContentType = 'data:image/png;base64,';
                    //增加文字類別
                    img.text = selfStamp.attr('_text');
                    img.txt = selfStamp.attr('_txt');
                    img.color = selfStamp.attr('_color');
                    img.family = selfStamp.attr('_family');
                    img.size = selfStamp.attr('_size');

                    stamp.push(img);
                }
            });
        }
        //console.log(draw, stamp)
        jCom.ajax(self.options.fdfsavePdfStamp, {
            Vno: self.options.Vno,
            Dno: self.options.Dno,
            KeyNo: self.options.KeyNo,
            KeyType: self.options.KeyType,
            Ord: self.options.NowOrd,
            DrawerModel: draw,
            EditorModel: stamp
        }, function (obj) {
            self.__execCallBack(obj, function (objs) {
                //重建 編輯器(?)
                if (self.options.fdfFinalSaveReload) {
                    self.createPdfEditor();
                }
                if ($.isFunction(self.options.fdfFinalSave)) {
                    self._isChange = false;
                    self.options.fdfFinalSave();
                }
            });
        });
        
    },
    //(外部呼叫)摧毀事件
    _destroy: function () {
        const self = this;
        self._loadingTasks.forEach(lt => {
            lt.destroy();
        });
        self._loadingTasks = [];
        self.element.removeAttr("data-jepun-control");
        self.element.empty();
        $(self.options.scrollTrigger).off(".scrollForJpPdf");
    }
});

