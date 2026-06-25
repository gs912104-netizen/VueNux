/**
 * @description Pdf設定器 底層化
 * @najespace jepun.JPpdfDeveloper
 * @returns {string} str
*/
$.widget("jepun.jepunPdfDeveloper", {
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
        toolbox: ['Drawer', 'Editor', 'TLayer', 'PdfSave', 'Print', 'Merge'],
        //預設上限頁數
        maxPage: 100,
        //預設是否Loading
        loadingEnable: false,
        //預設使用工具
        defaultWorks: '',
        //是否使用影音背景
        useVideo: false,
        //#region Draw 相關參數 
        //是否可以編輯 預設不能修改
        DrawCanEditor: false,
        //#endregion

        //#region Editor 相關參數 
        //是否可以編輯 預設不能修改
        EditCanEditor: false,
        //可使用之物件
        editToolbox: '1@@2',
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
        fdfgetFdfModulePdf: 'ModulePdfEditor/GetFdfModulePdfT2',

        //產出圖檔切圖使用
        fdfCutImg: 'ModulePdfEditor/CutImg',
        //產出文字圖檔
        fdfWritetextJpg: 'ModulePdfEditor/WritetextJpg',
        //取得自己的個人印章
        fdfPersonSign: 'ModulePdfEditor/GetFdfSignFileT1',
        //取得傳入的公司印章
        fdfCompanySign: 'ModulePdfEditor/GetFdfStamperT5',
        //轉換個人印章大小至編輯器上
        fdfsetPersonSign: 'ModulePdfEditor/SetNewStamp',
        //取得傳入的公司印章
        fdfsetCompanySign: 'ModulePdfEditor/SetNewChopStamp',

        //取得所有塗鴉存檔
        fdfgetPdfStamp: 'ModulePdfEditor/GetFdfFormPdfStamperT1',
        fdfgetPdfDrawer: 'ModulePdfEditor/GetFdfFormDrawerStamperT1',

        //存檔路徑
        fdfsavePdfStamp: 'ModulePdfEditor/SetFdfModulePdfAllInsXml',

        //列印另開錄徑
        fdfprintPdf: 'HomeIframe/Index?controller=TestPdfPrint&action=index',

        //另開 多頁使用PDF瀏覽器
        fdfPdfReader: 'view/pdfjs/web/viewer.html',

        //UserJson
        fdfgetUserList: 'Common/GetFdfUserT8?deptno=-1&showPleaseSelect=false',

        //合成路徑
        fdfmergePdf: 'ModulePdfEditor/SetFdfModulePdfMerge',

        //
        fdfgetKeeper: 'ModulePdfEditor/GetKeeper',
        //#endregion
        //#region 回呼
        //存檔完成回呼事件
        fdfFinalSaveReload: true,
        fdfFinalSave: function () { console.log('Final Save'); jCom.BootstrapAlert('', 'Save OK'); },

        funAddStamp: function (obj) { console.log(obj); },
        funAddColumn: function (obj) { console.log(obj); },

        funMaskDeleteStamp: function (obj) { console.log('funMaskDelete'); obj.ele.remove(); },
        funMaskDeleteText: function (obj) { console.log('funMaskDelete'); obj.ele.remove(); },
        funMaskMoveStamp: function (obj) { console.log(obj); },
        funMaskMoveText: function (obj) { console.log(obj); },
        funMaskbtnEditStamp: function (obj) { console.log(obj); },
        funMaskbtnEditText: function (obj) { console.log(obj); },

        //#endregion
        //#region 多語系使用
        LblBtnDrawer: '直接塗鴉',
        LblBtnEditor: '圖層貼圖，請直接點選畫布',
        LblBtnTLayer: '原始檔案文字選取',
        LblBtnPdfSave: '存檔',
        LblBtnPrint: '列印',
        LblBtnMerge: '合成PDF',

        LblbtnDtPencil: '塗鴉',
        LblbtnDtPoint: '拖曳',
        LblbtnDtHighlight: '重點',
        LblbtnDtEraser: '擦布',
        LblbtnDtColor: '顏色',
        LblbtnDtReset: '清空',

        LblbtnStamp: '簽印設定',
        LblbtnColumn: '欄位設定',

        LblJpPEDownloadFile: '完成檔案檢視',
        LblJpPENoFiles: 'No Any Files, Please Upload!!',
        LblJpPETooManyPage: 'PDF檔案頁數太多，請使用另開的檢視器頁面檢視',
        LblJpPEOpen: '打開',
        //#endregion
        //預設使用筆觸Color
        penColor: '#000000'
    },
    _create: async function () {
        console.log("jepun.jepunPdfDeveloper");
        const self = this;
        self.element.attr("data-jepun-control", "jepunPdfDeveloper");
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
        self._createElement();
        
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
    createPdfDeveloper: function () {
        const self = this;
        if (self._isinit === undefined || self._isinit === false) {
            setTimeout(function () { self.createPdfDeveloper(); }, 500);
            return;
        }
        self._beforecreatePdfDeveloper();
    },
    //(外部呼叫)重載貼圖編輯器
    Refesh: function () {
        const self = this;
      
        self._createPdfEditor();
    },
    //(外部呼叫)存檔編輯器內容
    Save: function () {
        const self = this;
        self._save();
    },
    PdfInfo: function () {
        const self = this;
        return self.datas;
    },
    //#endregion
    //#region 共用呼叫
    //(內部呼叫)建立編輯器主體
    _createElement: function () {
        const self = this;
        if (self.options.IsUpload === false) {
            return;
        }
        //先裝載容器  Jepun Pdf Editor ToolBox => JpPEToolBox , Jepun Pdf Editor Group => JpPEGroup



        self.element.append('<div class="JpPEToolBox" name="JpPEToolBox" ><div class="JpPEArea"><div class="JpPETB" name="JpPETB">' +
            '<div class="JpPETool" _dtb="0"><select name="PageShow"></select></div></div></div></div>' +
            //編輯器區段
            '<div calss="" name="DrawEdit"><div calss="" name="DrawEditGroup"></div></div>'+
            //'<div class="" name="JpPEGroup" ></div>' +
            //modal區段
            '<div name="JpPEModal" class="modal" style="overflow:hidden" tabindex="-1" role="dialog" aria-hidden="true" data-bs-backdrop="false" data-bs-keyboard="false"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document"><div class="modal-content">' +
            '<div class="modal-header "><h4  class="modal-title mb-0"></h4><button type="button" name="JpPEModalclose" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body-pdf modal-body-height"></div></div></div></div>' +

            '');
        self._isinit = true;
        //工具箱內容綁定
        self._createInitFun();

    },
    //(內部呼叫)主體已存在渲染內容
    _beforecreatePdfDeveloper: function () {
        const self = this;
        if (self.options.IsUpload === false) {
            self.element.append('<div class="alert alert-danger alert-dismissable"><h4><i class="fa fa-frown-o"></i><strong> ' + self.options.LblJpPENoFiles + ' </strong></h4></div>');
            return;
        }
        self._loadingTasks[0].promise.then(function (pdfDoc_) {
            self.pdfDoc = pdfDoc_;
            self.datas.numPages = self.pdfDoc.numPages;
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
                self.element.addClass("hasLoad");
            }
            self._allpage = self.pdfDoc.numPages > self.options.maxPage ? self.options.maxPage : self.pdfDoc.numPages;
            //self._allpage = 100;
            self._finalpage = 0;
            let option = '';
            //重置所有事件 start
            self.element.getCtrl("DrawEditGroup").empty();
            self._funRefesh();
            self.element.getCtrl('JpPEToolBox').find('.active').removeClass("active");
            self._isChange = false;
            self.element.removeClass("changed");
            self._nowWork = 'doEditor';
            //重置所有事件 end
            for (let i = 1; i <= self.pdfDoc.numPages && i <= self.options.maxPage; i++) {
                let id = 'canvaspage' + i;
                //PdfContenter ui-droppable signature-cursor-cell
                let div = $('<div class="JpPEContenter ui-droppable" name="Drawer_' + i + '" _pages="' + i + '" _dpi="72" ></div >');
                div.append('<div class="JpPENoWorkMask"></div><div class="JpPEEditor"></div><img class="JpPEBG" name="JpPEBG" ><canvas name="' + id + '" class="JpPECanvasLoad"></canvas><div class="JpPELoading fa"></div>');
                self.element.getCtrl("DrawEditGroup").append(div);
                self._renderPage(i, id);
                option += '<option value="Drawer_' + i + '">' + i + '</option>';
            }
            self.element.getCtrl("PageShow").html(option);
        });
    },
    //(內部呼叫)綁定按鈕事件，換頁事件，捲動事件
    _createInitFun: function () {
        const self = this;
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
            self.options.scrollTarget.stop().animate({
                scrollTop: self.options.scrollTarget.scrollTop() + self.element.getCtrl(now).offset().top - self.options.defaultHeight
            }, 800);
        });
        //綁定Scroll控制物件
        $(self.options.scrollTrigger).off(".scrollForJpPdf").one("scroll.scrollForJpPdf", function (event) {
            self._scrollTrigger();
        });
        //綁Modal
        self._ActionModal = self.element.getCtrl("JpPEModal");
        console.log(self.element.getCtrl("tooltip", "data-toggle"));
        self.element.getCtrl("tooltip", "data-toggle").tooltip();
       // $("#" + self.options.fromForm).setTopBtn(self.element.getCtrl("TopBtn", "data-jepun-button"));

  
        ////下載按鈕
        //self.element.getCtrl("JpPEDownloadFile").on('click', function (e) {
        //    e.preventDefault();
        //});
        //self.options.IsFinal
    },
    //(內部呼叫)渲染一頁(如遇到與總頁數相同，呼叫後續衍伸事件)
    _renderPage: async function (num, id) {

        const self = this;
        const selfDiv = self.element.getCtrl("Drawer_" + num);
        self.pdfDoc.getPage(num).then(function (page) {
            const canvasEl = self.element.getCtrl(id)[0];//document.getElementById(id);
            const canvas = 'OffscreenCanvas' in window ? canvasEl.transferControlToOffscreen() : canvasEl;
            let ctx = canvas.getContext('2d', { willReadFrequently: true });
            let orgin_viewport = page.getViewport({ scale: self.options.scale });
            selfDiv.attr("_width", orgin_viewport.width).attr("_height", orgin_viewport.height);

            //console.log(parentW, orgin_viewport.width, self.element.outerWidth());
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
            var renderContext = {
                canvasContext: ctx,
                viewport: doubleviewport
            };
            var renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                //PDF轉換Canvas第一次完成
                // canvas.toDataURL()
                //selfDiv.getCtrl("JpPEBG").attr("src", canvas.toDataURL());
                if ('OffscreenCanvas' in window) {
                    canvas.convertToBlob().then(function (blob) { self._renderBlob(blob, selfDiv, canvasEl, num); });
                } else {
                    canvas.toBlob(function (blob) { self._renderBlob(blob, selfDiv, canvasEl, num); }, 'image/jpeg', 0.5);
                }
               
            }).then(function (textContent) {

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
        console.log('renderPage final', num, new Date(), self._finalpage, self._allpage);
        if (self._finalpage === self._allpage) {
            console.log('all final');
            self.element.removeClass("hasLoad");
            //渲染塗鴉功能
            //if (self.options.toolbox.includes('Drawer')) { self._createPdfDrawer(); }
            //if (self.options.toolbox.includes('Editor')) { self._createPdfEditor(); }
            self._createPdfEditor();
            self._loadingTasks.forEach(lt => {
                lt.destroy();
            });
            self._loadingTasks = [];
            let loadingTask = self._pdfjsLib.getDocument(self.options.pdfFile);
            self._loadingTasks.push(loadingTask);
            self.element.addClass('doEditor');
            let ro = new ResizeObserver(function (event) {
                if ($(self.element).is(":visible")) {
                    GlbWorks['glbJpPdfDeveloper'] = function () { self._createPdfEditor(); };
                    glbWorkerSend({
                        type: 1
                        , tid: 'glbJpPdfDeveloper'
                        , times: 250
                    });
                }
            });

            ro.observe(self.element[0]);
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
            let orgin_viewport = pdfPage.getViewport({ scale: self.options.scale });
            let parentW = self.element.outerWidth();
            let newscale = parentW  / orgin_viewport.width;
            let viewport = pdfPage.getViewport({ scale: newscale });

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
        //const image = new Image(105, 25); // Using optional size for image
        const image = new Image(0, 0); // Using optional size for image
        image.onload = drawImageActualSize; // Draw when image has loaded

        // Load an image of intrinsic size 300x227 in CSS pixels
        image.src = jCom.urlPath('img/logo.png');
        function drawImageActualSize() {
            //var x = scratchCanvas.width - 80;// / 2;
            //var y = 80;//canvas.height / 2;
            var x = scratchCanvas.width - 600;//scratchCanvas.width / 2;
            var y = 200;//scratchCanvas.height / 2;
            var width = image.width;
            var height = image.height;
            let angleInRadians = 45 * Math.PI / 180;
            ctx.translate(x, y);
            ctx.rotate(angleInRadians);
            ctx.drawImage(image, -width / 2, -height / 2, width, height);
            ctx.font = "160px fantasy,'Microsoft JhengHei'";
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillText(self.options.watermark, -110, 45);
            //ctx.fillText(new Date().toLocaleDateString(), -110, 45);
            ctx.rotate(-angleInRadians);
            ctx.translate(-x, -y);
            //var x = scratchCanvas.width / 2;
            //var y = scratchCanvas.height / 2;
            //var width = image.width;
            //var height = image.height;
            //let angleInRadians = -45 * Math.PI / 180;
            //ctx.translate(x, y);
            //ctx.rotate(angleInRadians);
            //ctx.drawImage(image, -width / 2, -height / 2, width, height);
            //ctx.font = "12px fantasy,'Microsoft JhengHei'";
            //ctx.fillText("Jepun know your needs", -width / 2, -height / 2 + 25);
            //ctx.rotate(-angleInRadians);
            //ctx.translate(-x, -y);
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
        self.element.getCtrl("DrawEditGroup").append(wrapper);
        return new Promise(function (resolve, reject) {
            img.onload = resolve;
            img.onerror = reject;
        });
    },
    //(內部呼叫)延後呼叫瀏覽器底層列印事件
    _performPrint() {
        //this.throwIfInactive();
        return new Promise(resolve => {
            setTimeout(() => {
                //if (!this.active) {
                //    resolve();
                //    return;
                //}
                console.log('_performPrint');
                window.print();
                setTimeout(resolve, 20);
            }, 0);
        });
    },
    //(內部呼叫)Scroll拖拉偵測
    _scrollTrigger: function () {
        const self = this;
        if ($(self.element).is(":visible")) {
            let thisP = self.element.closest(self.options.selfParent);
            //console.log('scroll fun', thisP,thisP.offset().top - self.options.defaultHeight - self.options.defaultTop, thisP.offset().top, self.options.defaultHeight);
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
 
    //(內部呼叫)左邊選單控制顯示隱藏
    ___iniShow: function (ele) {
        const self = this;
        ele.on('click', function (event) {
            event.preventDefault();
            let selfitem = $(this);
            selfitem.toggleClass('active');
            self.element.getCtrl("DrawEditGroup").find('.CompositePhotoContentBody[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            self.element.getCtrl("DrawEditGroup").find('.DrawerOtherBG[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            self.element.getCtrl("DrawEditGroup").find('.JpPESign[_user="' + selfitem.attr('_user') + '"]').toggle(100);
            
        });
        ele.tooltip();
        return $(ele);
    },
    //(內部呼叫)控制彈出OpenWindow視窗
    _openWindow: function (url) {
        let options, width, height;
        width = width || '80%';
        height = height || '70%';

        if (typeof width === 'string' && width.length > 1 && width.substr(width.length - 1, 1) === '%') {
            width = parseInt(window.screen.width * parseInt(width, 10) / 100, 10);
        }
        if (typeof height === 'string' && height.length > 1 && height.substr(height.length - 1, 1) === '%') {
            height = parseInt(window.screen.height * parseInt(height, 10) / 100, 10);
        }
        if (width < 640) { width = 640; }

        if (height < 420) { height = 420; }

        var top = parseInt((window.screen.height - height) / 2, 10),
            left = parseInt((window.screen.width - width) / 2, 10);

        options = (options || 'location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,resizable=yes,scrollbars=yes') + ',width=' + width +
            ',height=' + height +
            ',top=' + top +
            ',left=' + left;

        var popupWindow = window.open('', url, options, true);

        // Blocked by a popup blocker.
        if (!popupWindow) {
            return false;
        }

        try {
            var ua = navigator.userAgent.toLowerCase();
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
        //var jQ;
        if (cmds.customHandleError === true) {
            window.location = cmds.loginUrl;
            return;
        }
        try {
            for (var i = 0; i < cmds.length; i++) {
                //jQ = $(cmds[i].selectors);
                switch (cmds[i].valType) {
                    case "FireHandler":
                        //FireHandler 才回呼事件
                        if ($.isFunction(fn)) {
                            fn($.extend({}, $.parseJSON(cmds[i].arg1), plainObject));
                        }
                        break;
                    case "Eval":
                        eval(cmds[i].arg0);
                        break;
                    case "Modal":
                        jCom.BootstrapAlert(cmds[i].arg1, cmds[i].arg0,'danger');
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
        self.element.find('.CompositePhotoContentBody').remove();
        self.element.find('.JpPEEditorTB').remove();
        self.element.addClass("hasLoad");
        //self.element.getCtrl('JpPEBG').isImgLoad(function () {
            if (self.options.EditCanEditor) {
                self.element.find('.JpPEEditor').off("click").on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    let eX = e.originalEvent.offsetX;
                    let eY = e.originalEvent.offsetY;
                    let nowself = $(this);
                    //物件重置顯示 依目前點擊為優先
                    self.element.find('.JpPEEditorTB').remove();
                    self.element.find('.edit-ui').hide();
                    let toolList = ['1', '2'];//定義工具箱
                    let toolBox = self.options.editToolbox.split('@@').filter(function (a) { return toolList.indexOf(a) > -1; });//只需要抓取有在工具箱內的工具選項
                    let newX = eX + (toolBox.length * 38 / 2) > nowself.width() ? nowself.width() - (toolBox.length * 38) : (eX - (toolBox.length * 38 / 2) < 0 ? 0 : eX - (toolBox.length * 38 / 2));
                    let newY = eY - 50 < 0 ? 0 : eY - 50;
                    let html = '<div class="JpPEEditorTB" style="position:absolute;left:' + newX + 'px;top:' + newY + 'px;"><div class="JpPEPeArea"><div class="JpPEPeToolBox">';
                    for (var i = 0; i < toolBox.length; i++) {
                        switch (toolBox[i]) {
                            case "1":
                                html += '<div name="btnStamp" class="JpPEPeTool" title="' + self.options.LblbtnStamp + '" data-toggle="tooltip" data-container="body" data-placement="bottom" ><i class="fa fa-file-signature"></i></div>';
                                break;
                            case "2":
                                html += '<div name="btnColumn" class="JpPEPeTool" title="' + self.options.LblbtnColumn + '" data-toggle="tooltip" data-container="body" data-placement="bottom"><i class="fa fa-database"></i></div>';
                                break;
                           
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
        ele.getCtrl("btnStamp").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBParent = TBself.parent();
            let rpW = parseFloat(TBParent.attr('_width'));
            let rpH = parseFloat(TBParent.attr('_height'));
            let pW = parseFloat(TBParent.css('width').replace('px', ''));
            let pH = parseFloat(TBParent.css('height').replace('px', ''));
            let Wpercent = pW / rpW;
            let Hpercent = pH / rpH;
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + (parseFloat(TBself.css('width').replace('px', '')) / 2);
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + parseFloat(TBself.css('height').replace('px', '')) + 19 ;
            let AX = Math.abs(Math.round(TBleft / Wpercent));
            let AY = Math.abs(Math.round(rpH - TBtop / Hpercent));
            let Pages = parseFloat(TBParent.attr('_pages')); 

            //let obj = { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop, AX: AX, AY: AY, Pages: Pages };
            let obj = { AX: AX, AY: AY, Pages: Pages };
            
            if (typeof (self.options.funAddStamp) === "function") {
                self.options.funAddStamp(obj);
            }

            //self.element.find('.JpPEEditorTB').remove();
        });
        ele.getCtrl("btnColumn").on("click", function (event) {
            let TBself = self.element.find('.JpPEEditorTB');
            let TBParent = TBself.parent();
            let rpW = parseFloat(TBParent.attr('_width'));
            let rpH = parseFloat(TBParent.attr('_height'));
            let pW = parseFloat(TBParent.css('width').replace('px', ''));
            let pH = parseFloat(TBParent.css('height').replace('px', ''));
            let Wpercent = pW / rpW;
            let Hpercent = pH / rpH;
            let TBleft = parseInt(TBself.css("left").replace("px", "")) + (parseFloat(TBself.css('width').replace('px', '')) / 2);
            let TBtop = parseInt(TBself.css("top").replace("px", "")) + parseFloat(TBself.css('height').replace('px', '')) + 19;
            let AX = Math.abs(Math.round(TBleft / Wpercent));
            let AY = Math.abs(Math.round(rpH - TBtop / Hpercent));
            let Pages = parseFloat(TBParent.attr('_pages'));

            //let obj = { TBParent: TBParent, TBleft: TBleft, TBtop: TBtop, AX: AX, AY: AY, Pages: Pages};
            let obj = { AX: AX, AY: AY, Pages: Pages };
            /* console.log('btnStamp data:',obj);*/
            if (typeof (self.options.funAddColumn) === "function") {
                self.options.funAddColumn(obj);
            }

            //self.element.find('.JpPEEditorTB').remove();
        });
        //回呼事件 增加新貼圖
        ele.getCtrl("tooltip", "data-toggle").tooltip();
        return $(ele);
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
            if (!self.options.EditCanEditor) {
                return;
            }

            self.element.find('.edit-ui').hide();
            nowself.parent().parent().children('.edit-ui').show();

        });
        //刪除圖層
        self.element.find(".delete-btn").unbind('click').bind('click', function (e) {
            e.preventDefault();
            //self._isChange = true;
            //self.element.removeClass("changed").addClass("changed");
            //$(this).tooltip('dispose');
            let $mBtn = $(this);
            let TBParent = $mBtn.closest('.JpPEContenter');

            let rpW = parseFloat(TBParent.attr('_width'));
            let rpH = parseFloat(TBParent.attr('_height'));
            let pW = parseFloat(TBParent.getCtrl("JpPEBG").outerWidth(true));
            let pH = parseFloat(TBParent.getCtrl("JpPEBG").css('height').replace('px', ''));
            let Wpercent = pW / rpW;
            let Hpercent = pH / rpH;
            let ele = $mBtn.closest('.CompositePhotoContentBody').length > 0 ? $mBtn.closest('.CompositePhotoContentBody') : $mBtn;
            let AX = Math.abs(Math.round(parseFloat(ele.css('left').replace('px', '')) / Wpercent));
            let AY = Math.abs(Math.round(rpH - ele.css('height').replace('px', '') / Hpercent - parseFloat(ele.css('top').replace('px', '')) / Hpercent));

            let obj = {
                mbtn: $mBtn
                , TBParent: TBParent
                , rpW: rpW
                , rpH: rpH
                , pW: pW
                , pH: pH
                , Wpercent: Wpercent
                , Hpercent: Hpercent
                , ele: ele
                , AX: AX
                , AY: AY
                , Sno: $mBtn.getKeyVal()
            };
            switch ($mBtn.getKeyVal("data-jepun-funtype")) {
                case "1":
                    if (typeof (self.options.funMaskDeleteStamp) === "function") {
                        self.options.funMaskDeleteStamp(obj);
                    }
                    break;
                case "2":
                    if (typeof (self.options.funMaskDeleteText) === "function") {
                        self.options.funMaskDeleteText(obj);
                    }
                    break;
            }
           
        });
        //移動圖層
        function movedraggable(ele) {
            let nowself = $(ele);
            let _xxx = 0, _yyy = 0;
            //let atom = $(this).parent().parent();
            //console.log(".move-btn atom:", atom , this);
            let $img = $(nowself).parent().parent();//$(atom);
            console.log(".move-btn $img:", $img);
            let imgleft = $img.offset().left;
            let imgtop = $img.offset().top;
            let imgcssLeft = parseInt($img.css("left").replace("px", ""));
            let imgcsstop = parseInt($img.css("top").replace("px", ""));
            let $parent;
            if ($img.closest('.JpPEContenter').length > 0) {
                $parent = $img.closest('.JpPEContenter');
            }
            else {
                $parent = $img.parent();
            }


            if ($img.closest('.JpPEContenter').length === 0) {
                imgleft = imgleft - $parent.offset().left + $parent.parent().offset().left;
            }
            _yyy = $parent.offset().left + imgcssLeft - imgleft;
            _xxx = $parent.offset().top + imgcsstop - imgtop;


            let $mBtn = $(nowself);
            let $layer = $mBtn.parents('.CompositePhotoContentBody');
            let $mBtnPar;
            if ($mBtn.closest('.JpPEContenter').length > 0) {
                $mBtnPar = $mBtn.closest('.JpPEContenter');
            }
            else {
                $mBtnPar = $mBtn.parent();
            }
            $mBtn.closest('.CompositePhotoContentBody').draggable({
                stop: function () {
                    //let $mBtn = $(this);
                    let TBParent = $mBtn.closest('.JpPEContenter');

                    let rpW = parseFloat(TBParent.attr('_width'));
                    let rpH = parseFloat(TBParent.attr('_height'));
                    let pW = parseFloat(TBParent.getCtrl("JpPEBG").outerWidth(true));
                    let pH = parseFloat(TBParent.getCtrl("JpPEBG").css('height').replace('px', ''));
                    let Wpercent = pW / rpW;
                    let Hpercent = pH / rpH;
                    let ele = $mBtn.closest('.CompositePhotoContentBody').length > 0 ? $mBtn.closest('.CompositePhotoContentBody') : $mBtn;
                    let AX = Math.abs(Math.round(parseFloat(ele.css('left').replace('px', '')) / Wpercent));
                    let AY = Math.abs(Math.round(rpH - ele.css('height').replace('px', '') / Hpercent - parseFloat(ele.css('top').replace('px', '')) / Hpercent));

                    let obj = {
                        mbtn: $mBtn
                        //, TBParent: TBParent
                        //, rpW: rpW
                        //, rpH: rpH
                        //, pW: pW
                        //, pH: pH
                        //, Wpercent: Wpercent
                        //, Hpercent: Hpercent
                        //, ele: ele
                        , AX: AX
                        , AY: AY
                        , Sno: $mBtn.getKeyVal()
                    };
                    switch ($mBtn.getKeyVal("data-jepun-funtype")) {
                        case "1":
                            if (typeof (self.options.funMaskMoveStamp) === "function") {
                                self.options.funMaskMoveStamp(obj);
                            }
                            break;
                        case "2":
                            if (typeof (self.options.funMaskMoveText) === "function") {
                                self.options.funMaskMoveText(obj);
                            }
                            break;
                    }
                   
                    $mBtn.siblings('.move-btn').click();
                    movedraggable(nowself);
                   
                },
                containment: [
                    $mBtnPar.offset().left + _yyy + 1,
                    $mBtnPar.offset().top + _xxx + 1,
                    $mBtnPar.offset().left + $mBtnPar.outerWidth(true) - $layer.outerWidth(true) - _yyy - 1,
                    $mBtnPar.offset().top + $mBtnPar.outerHeight(true) - $layer.outerHeight(true) - _xxx - 1 - 20
                ],
                handle: '.move-btn'
            });
        }
        self.element.find(".move-btn").off('mousedown').one('mousedown', function () {
            movedraggable($(this));
        });
        
       // self.element.getCtrl('edit-ui', 'class').getCtrl("tooltip", "data-toggle").tooltip();

        self.element.getCtrl("btnEditSno").unbind('click').bind("click", function (e) {

            let $mBtn = $(this);
            let TBParent = $mBtn.closest('.JpPEContenter');

            let rpW = parseFloat(TBParent.attr('_width'));
            let rpH = parseFloat(TBParent.attr('_height'));
            let pW = parseFloat(TBParent.getCtrl("JpPEBG").outerWidth(true));
            let pH = parseFloat(TBParent.getCtrl("JpPEBG").css('height').replace('px', ''));
            let Wpercent = pW / rpW;
            let Hpercent = pH / rpH;
            let ele = $mBtn.closest('.CompositePhotoContentBody').length > 0 ? $mBtn.closest('.CompositePhotoContentBody') : $mBtn;
            let AX = Math.abs(Math.round(parseFloat(ele.css('left').replace('px', '')) / Wpercent));
            let AY = Math.abs(Math.round(rpH - ele.css('height').replace('px', '') / Hpercent - parseFloat(ele.css('top').replace('px', '')) / Hpercent));

            let obj = {
                mbtn: $mBtn
                , TBParent: TBParent
                , rpW: rpW
                , rpH: rpH
                , pW: pW
                , pH: pH
                , Wpercent: Wpercent
                , Hpercent: Hpercent
                , ele: ele
                , AX: AX
                , AY: AY
                , Sno: $mBtn.getKeyVal()
            };
            switch ($mBtn.getKeyVal("data-jepun-funtype")) {
                case "1":
                    if (typeof (self.options.funMaskbtnEditStamp) === "function") {
                        self.options.funMaskbtnEditStamp(obj);
                    }
                    break;
                case "2":
                    if (typeof (self.options.funMaskbtnEditText) === "function") {
                        self.options.funMaskbtnEditText(obj);
                    }
                    break;
            }

        });
    },
    //(內部呼叫)綁定全域事件，移動等故採用one進行一次性行為
    _setFormControl: function () {
        const self = this;
        //console.log('_setFormControl');
        //reset版面
        if ($(self.element).is(":visible")) {
            //修正file類物件員生事件被綁走導致無法觸發上傳問題發生
            self.element.closest(self.options.selfParent).find('input[type="file"]').one("click", function (event) {
                event.stopPropagation();
                self._setFormControl();
            });
            self.element.closest(self.options.selfParent).off('.clickForJpPdf').one('click.clickForJpPdf', function (event) {
                event.preventDefault();
                ////console.log(event);
                if ($(event.target).closest('.JpPEContenter').length === 0) {
                    self.element.find('.JpPEEditorTB').remove();
                }
                if ($(event.target).closest('.JpPEContenter').length === 0 && $(event.target).parents('.WordEditorTB').length === 0) {
                    self.element.find('.edit-ui').hide();
                }
                self._Editor.isScale = false;
                self._setFormControl();
            });
            self.element.closest(self.options.selfParent).off('.mousemoveForJpPdf').one("mousemove.mousemoveForJpPdf", function (e) {
                ////console.log('mousemove');
                //sx = e.pageX + document.documentElement.scrollTop;
                //sy = e.pageY + document.documentElement.scrollLeft;
                //////console.log("ismove:" + ismove);
                var _mx, _my, _curX, _curY, _curW, _curH, _prop, _newW, _newH;
                //普通縮放
                if (self._Editor.isScale) {
                    if (navigator.userAgent.match("MSIE")) {
                        _mx = e.clientX + document.body.scrollLeft;
                        _my = e.clientY + document.body.scrollTop;
                    } else {
                        _mx = e.pageX;
                        _my = e.pageY;
                    }

                    var $atom = $(self._Editor.MovingItem);
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
                    var $atomParent = null;
                    if ($atom.closest('.JpPEContenter').length > 0) {
                        $atomParent = $atom.closest('.JpPEContenter');
                    }
                    else {
                        $atomParent = $atom.parent().parent('.WordContenter').length > 0 ? $atom.parent().parent('.WordContenter') : $atom.parent().closest('.JpPEContenter');
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
            self.element.closest(self.options.selfParent).unbind('mouseup').bind('mouseup', function (event) {
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
            //console.log(obj);
            self.__execCallBack(obj, function (objs) {
                if (objs.file !== undefined) {
                    self.element.find('.CompositePhotoContentBody').remove();
                    self.element.find('.JpPEEditorTB').remove();
                    let fileList = $.parseJSON(objs.file);
                    let inner = '';
                    for (let i = 0; i < fileList.length; i++) {
                        let pageStamp = fileList[i];
                        //抓到要顯示的頁數 渲染
                        let pagedata = self._loadPages(pageStamp);
                        let sno = pageStamp.Sno;
                        console.log(pageStamp);
                        switch (pageStamp.FunType) {
                            //印章
                            case 1:
                                $.each(pagedata, function (ints, ele) {
                                    let rpW = parseFloat(self.element.getCtrl("Drawer_" + ele).attr('_width'));
                                    let rpH = parseFloat(self.element.getCtrl("Drawer_" + ele).attr('_height'));
                                    let pW = parseFloat(self.element.getCtrl("Drawer_" + ele).css('width').replace('px', ''));
                                    let pH = parseFloat(self.element.getCtrl("Drawer_" + ele).css('height').replace('px', ''));
                                    let Wpercent = pW / rpW;
                                    let Hpercent = pH / rpH;
                                    let PhotoHeight = 0, PhotoWidth = 0, PhotoLeft = 0, PhotoTop = 0;
                                    switch (pageStamp.SType) {
                                        //by關簽章
                                        case 0:
                                            PhotoWidth = 51 * Wpercent;
                                            PhotoHeight = 19 * Hpercent;
                                            PhotoLeft = parseFloat(pageStamp.AX) * Wpercent;
                                            PhotoTop = (rpH * Wpercent) - (parseFloat(pageStamp.AY) * Wpercent) - PhotoHeight;
                                            if (jFun.ConvertBool(pageStamp.IncLabel)) {
                                                PhotoWidth = 51 * 2 * Wpercent;
                                            }
                                            //<div class="marqueecontent" name="content_${sno}">${pageStamp.LabelName}</div>
                                            inner = `<div name="CPCB_L_${sno}" data-jepun-key="${sno}" data-jepun-funtype="${pageStamp.FunType}" style="height:${PhotoHeight}px;left:${PhotoLeft}px;top:${PhotoTop}px;width:${PhotoWidth}px;" class="CompositePhotoContentBody">
                                                           <div name="CompositePhotoContent_${self._Editor.count}" class="CompositePhotoContent" style="height:${PhotoHeight}px;width:${PhotoWidth}px;">
                                                               <div class="stampmask mask" style="left:0px;top:0px;width:${PhotoWidth}px;height:${PhotoHeight}px;"></div>
                                                               <div class="chopmask alginleft text-nowrap">
                                                                    
                                                                    <marquee class="marqueecontents" scrollamount="2" behavior="alternate" name="content_${sno}">${pageStamp.LabelName}</marquee>
                                                               </div>
                                                           </div>
                                                           <div class="edit-ui" style="display: none;">
                                                               <a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                               <a class="tool-btn" title="設定" name="btnEditSno" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>
                                                               <a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                           </div>
                                                        </div>`;
                                            break;
                                        //公司印章
                                        case 1:
                                            PhotoWidth = parseFloat(pageStamp.Width) * Wpercent;
                                            PhotoHeight = parseFloat(pageStamp.Height) * Hpercent;
                                            PhotoLeft = parseFloat(pageStamp.AX) * Wpercent;
                                            PhotoTop = (rpH - (pageStamp.Height) - (pageStamp.AY)) * Hpercent;
                                            inner = `<div name="CPCB_L_${sno}" data-jepun-key="${sno}" data-jepun-funtype="${pageStamp.FunType}"  style="height:${PhotoHeight}px;left:${PhotoLeft}px;top:${PhotoTop}px;width:${PhotoWidth}px;" class="CompositePhotoContentBody">
                                                           <div name="CompositePhotoContent_${self._Editor.count}" class="CompositePhotoContent" style="height:${PhotoHeight}px;width:${PhotoWidth}px;">
                                                                <img  style="left:0px;top:0px; width:${PhotoWidth}px ;height:${PhotoHeight}px" src="data:image/png;base64,${pageStamp.Base64File}" />
                                                                <div class="stampmask compstamp mask" style="left:0px;top:0px;width:${PhotoWidth}px;height:${PhotoHeight}px;"></div>
                                                           </div>
                                                           <div class="edit-ui" style="display: none;">
                                                               <a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                               <a class="tool-btn" title="設定" name="btnEditSno" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>
                                                               <a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                           </div>
                                                      </div>`;
                                            break;
                                    }
                                    $(inner).appendTo(self.element.getCtrl("Drawer_" + ele));
                                    self._setMask();
                                });
                                break;
                            //欄位資料
                            case 2:
                                $.each(pagedata, function (ints, ele) {
                                    let rpW = parseFloat(self.element.getCtrl("Drawer_" + ele).attr('_width'));
                                    let rpH = parseFloat(self.element.getCtrl("Drawer_" + ele).attr('_height'));
                                    let pW = parseFloat(self.element.getCtrl("Drawer_" + ele).css('width').replace('px', ''));
                                    let pH = parseFloat(self.element.getCtrl("Drawer_" + ele).css('height').replace('px', ''));
                                    let Wpercent = pW / rpW;
                                    let Hpercent = pH / rpH;
                                    let PhotoHeight = 0, PhotoWidth = 0, PhotoLeft = 0, PhotoTop = 0;
                                    PhotoWidth = pageStamp.FontWidth * Wpercent;
                                    PhotoHeight = pageStamp.FontHeight * Hpercent;
                                    PhotoLeft = parseFloat(pageStamp.AX) * Wpercent;
                                    PhotoTop = (rpH * Wpercent) - (parseFloat(pageStamp.AY) * Wpercent) - PhotoHeight;
                                    inner = `<div name="CPCB_L_${sno}" data-jepun-key="${sno}" data-jepun-funtype="${pageStamp.FunType}" style="height:${PhotoHeight}px;left:${PhotoLeft}px;top:${PhotoTop}px;width:${PhotoWidth}px;" class="CompositePhotoContentBody">
                                                           <div name="CompositePhotoContent_${self._Editor.count}" class="CompositePhotoContent" style="height:${PhotoHeight}px;width:${PhotoWidth}px;">
                                                               <div class="columnmask mask" style="left:0px;top:0px;width:${PhotoWidth}px;height:${PhotoHeight}px;"></div>
                                                               <div class="chopmask alginleft text-nowrap">
                                                                    <marquee class="marqueecontents" scrollamount="2" behavior="alternate" name="content_${sno}">${pageStamp.LabelName}</marquee>
                                                               </div>
                                                           </div>
                                                           <div class="edit-ui" style="display: none;">
                                                               <a class="move-btn" title="移動" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                               <a class="tool-btn" title="設定" name="btnEditSno" data-toggle="tooltip" data-placement="bottom" ><i class="fa fa-cog"></i></a>
                                                               <a class="delete-btn" title="刪除" data-toggle="tooltip" data-container="body" data-placement="bottom" ></a>
                                                           </div>
                                                        </div>`;
                                    $(inner).appendTo(self.element.getCtrl("Drawer_" + ele));
                                    self._setMask();
                                });


                                break;
                        }
                       
                    }
                    self._setMark();
                }
            });
            self.element.removeClass("hasLoad");
        });
    },
    //(內部呼叫)產生頁數
    _loadPages: function (data) {
      
        const self = this;
        let datas = [];
        switch (data["PageType"]) {
            //奇數頁
            case "1":
                for (let i = 1; i <= self.datas.numPages; i+=2) {
                    datas.push(i);
                }
                break;
            //偶數頁
            case "2":
                for (let i = 2; i <= self.datas.numPages; i+=2) {
                    datas.push(i);
                }
                break;
            //最後一頁
            case "3":
                datas.push(self.datas.numPages);
                break;
            //自訂頁
            case "99":
                let pageset = data["Pages"].split("、");
                $.each(pageset, function (i, ele) {
                    //console.log(ele);
                    if (ele.indexOf("-") < 0) {
                        datas.push(ele);
                        return;
                    }
                    let eleData = ele.split("-");
                    let end = parseInt(eleData[1]) > self.datas.numPages ? self.datas.numPages : parseInt(eleData[1]);
                    let start = parseInt(eleData[0]) <= 0 ? 0 : (parseInt(eleData[0]) > self.datas.numPages ? end : parseInt(eleData[0]));
                    for (let i = start; i <= end; i++) {
                        datas.push(i+"");
                    }
                });
                break;
            //All
            case "0":
            case undefined:
            default:
                for (let i = 1; i <= self.datas.numPages; i++) {
                    datas.push(i);
                }
                break;
        }
        return datas.filter((x, i) => datas.indexOf(x) === i);
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
                self.element.find('.chopmask').removeClass("hidden").removeClass("show").addClass("show");
                if (!self.options.setMarkType.includes('Sno')) {
                    self.element.find(".CompositePhotoContentBody:not([_sno='0'])").find('.chopmask').removeClass("show").removeClass("hidden").addClass("hidden");
                }
                let SnoList = $.parseJSON(objs.Snos);
                SnoList.forEach(function (a, b) {
                    self.element.find(".CompositePhotoContentBody[_sno='" + a + "']").find('.chopmask').removeClass("show").removeClass("hidden").addClass("hidden");
                });
                if (!self.options.setMarkType.includes('Pno')) {
                    self.element.find(".CompositePhotoContentBody:not([_pno='0'])").find('.chopmask').removeClass("show").removeClass("hidden").addClass("hidden");
                }
                let PnoList = $.parseJSON(objs.Pnos);
                PnoList.forEach(function (a, b) {
                    self.element.find(".CompositePhotoContentBody[_pno='" + a + "']").find('.chopmask').removeClass("show").removeClass("hidden").addClass("hidden");
                });

                let t1Type = $.parseJSON(objs.T1Type);

                if (((t1Type === "99" || t1Type === "1299") || self.options.FormState === 2)) {
                    self.element.find('.chopmask').removeClass("show").removeClass("hidden").addClass("hidden");
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
                //console.log(objs.file);
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
                let rpW = parseFloat(selfCanvas.closest('.JpPEContenter').attr('_width'));
                let rpH = parseFloat(selfCanvas.closest('.JpPEContenter').attr('_height'));

                img.pages = selfCanvas.closest('.JpPEContenter').attr('_pages');
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
                var selfStamp = $(ele);
                if (selfStamp.find('.other').length <= 0) {
                    var img = {};
                    var rpW = parseFloat(selfStamp.closest('.JpPEContenter').attr('_width'));
                    var rpH = parseFloat(selfStamp.closest('.JpPEContenter').attr('_height'));
                    var pW = parseFloat(selfStamp.closest('.JpPEContenter').css('width').replace('px', ''));
                    var pH = parseFloat(selfStamp.closest('.JpPEContenter').css('height').replace('px', ''));
                    var Wpercent = rpW / pW;
                    var Hpercent = rpH / pH;
                    img.pages = selfStamp.closest('.JpPEContenter').attr('_pages');
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
            //console.log(obj);
            self.__execCallBack(obj, function (objs) {
                //console.log(objs);
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
        //移除有綁定的TopBtn殘留
        //try {
        //    $("#" + self.options.fromForm).removeTopBtn(self.element.getCtrl("TopBtn", "data-jepun-button"));
        //}
        //catch (e){
        //    console.log(e);
        //}
        self.element.empty();
        $(self.options.scrollTrigger).off(".scrollForJpPdf");
    }
});

