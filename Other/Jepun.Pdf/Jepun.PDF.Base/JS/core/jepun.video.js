/**
 * @description 用來錄影
 * @namespace jepun.videoRecord
 */
$.widget("jepun.videoRecord", {
    options: {
        classVal: "videoRecord",
        width: 300,
        height: 0,
        left: 0,
        top: 0,
        //回聲消除
        hasEchoCancellation: true,
        audioSource: undefined,
        videoSource: undefined
    },
    _create: function () {
        //console.log("jepun.videoRecord");
        const self = this;
        self.element.attr("data-jepun-control", "videoRecord");
        self.videoRecord = $("<video playsinline autoplay muted ></video>").addClass(self.options.classVal).css("left", self.options.left).css("top", self.options.top).css("width", self.options.width + "px").css("height", (self.options.height === 0 ? self.options.width * 0.5625 : self.options.height) + "px");
        self.element.append(self.videoRecord);
    },
    //每次被呼叫都執行
    _init: async function () {
        const self = this;
        self._isReady = false;
        self.recordedBlobs = [];
        console.log(self.options);
        //self.stream = `stream_${self.element.attr("name")}`;
        const constraints = {
            audio: {
                echoCancellation: {
                    exact: self.options.hasEchoCancellation
                },
                deviceId: {
                    exact: self.options.audioSource
                }
            },
            video: {
                width: self.options.width,
                height: self.options.height === 0 ? self.options.width * 0.5625 : self.options.height,
                deviceId: {
                    exact: self.options.videoSource
                }
            }
        };
        try {
            //console.info(constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            self._handleSuccess(stream);
        } catch (e) {
            console.error('navigator.getUserMedia error:', e);
            //self.videoRecord.hide();
            self._isReady = false;
        }
    },
    _handleSuccess: function (stream) {
        const self = this;
        console.log('getUserMedia() got stream:', stream);
        //window[self.stream] = stream;     
        self.stream = stream;
        self.videoRecord[0].srcObject = stream;
        self._isReady = true;
        self.startRecording();
    },
    isReady: function () {
        const self = this;
        return self._isReady;
    },
    startRecording: function () {
        const self = this;
        self.recordedBlobs = [];
        let options = self.fileOption();
        try {
            //self.mediaRecorder = new MediaRecorder(window[self.stream], options);
            self.mediaRecorder = new MediaRecorder(self.stream, options);
        } catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            return;
        }
        console.log('Created MediaRecorder', self.mediaRecorder, 'with options', options);
        self.mediaRecorder.onstop = (event) => {
            //console.log('Recorder stopped: ', event);
            //console.log('Recorded Blobs: ', self.recordedBlobs);
        };
        self.mediaRecorder.ondataavailable = function (event) {
            //console.log('handleDataAvailable', event);
            if (event.data && event.data.size > 0 && self.recordedBlobs !== null && self.recordedBlobs !== undefined) {
                self.recordedBlobs.push(event.data);
            }
        };
        self.mediaRecorder.start();
        console.log('MediaRecorder started', self.mediaRecorder);
    },
    stopRecording: function () {
        const self = this;
        self.mediaRecorder.stop();
    },
    play: function (ele) {
        const self = this;
        let options = self.fileOption();
        ele.empty();
        let recordedVideo = $("<video playsinline ></video>").appendTo(ele)[0];
        const superBuffer = new Blob(self.recordedBlobs, { type: options.mimeType });
        recordedVideo.src = null;
        recordedVideo.srcObject = null;
        recordedVideo.src = window.URL.createObjectURL(superBuffer);
        recordedVideo.controls = true;
        recordedVideo.width = self.options.width;
        recordedVideo.height = self.options.height === 0 ? self.options.width * 0.5625 : self.options.height;
        recordedVideo.play();
    },
    download: function () {
        const self = this;
        let options = self.fileOption();
        const blob = new Blob(self.recordedBlobs, { type: options.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${self.element.attr("name")}_videoRecord.${options.type}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    },
    getBlob: function () {
        const self = this;
        let options = self.fileOption();
        const blob = new Blob(self.recordedBlobs, { type: options.mimeType });
        return blob;
    },
    fileOption: function () {
        let options;
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            options = { mimeType: 'video/webm; codecs=vp9', type: 'webm' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm', type: 'webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4', type: 'mp4', videoBitsPerSecond: 100000 };
        } else {
            console.error("no suitable mimetype found for this device");
        }
        return options;
    },
    _destroy: function () {
        const self = this;
        console.log('_destroy');
        self.recordedBlobs = null;
        self.stream.getTracks().forEach(track => {
            track.stop();
        });
        self.stream = null;

    }
});
$.widget("jepun.videoCanvas", {
    options: {
        width: 300
    },
    _create: function () {
        console.log("jepun.videoCanvas");
        const self = this;
        self.element.attr("data-jepun-control", "videoCanvas");
    },
    //每次被呼叫都執行
    _init: async function () {
        const self = this;
        self._isReady = false;
        self.recordedBlobs = [];
        self.stream = self.element[0].captureStream(); // frames per second
    },
    isReady: function () {
        const self = this;
        return self._isReady;
    },
    startRecording: function () {
        const self = this;
        self.recordedBlobs = [];
        let options = self.fileOption();
        self.mediaRecorder = new MediaRecorder(self.stream, options);
        console.log('Created MediaRecorder', self.mediaRecorder, 'with options', options);
        self.mediaRecorder.onstop = (event) => {
            console.log('Recorder stopped: ', event);
            console.log('Recorded Blobs: ', self.recordedBlobs);
        };
        self.mediaRecorder.ondataavailable = function (event) {
            console.log('handleDataAvailable', event);
            if (event.data && event.data.size > 0) {
                self.recordedBlobs.push(event.data);
            }
        };
        // collect 100ms of data
        self.mediaRecorder.start(500);
        console.log('MediaRecorder started', self.mediaRecorder);
    },
    stopRecording: function () {
        const self = this;
        self.mediaRecorder.stop();

    },
    play: function (ele) {
        const self = this;
        let options = self.fileOption();
        ele.empty();
        self.recordedVideo = $("<video playsinline ></video>").appendTo(ele)[0];
        const superBuffer = new Blob(self.recordedBlobs, { type: options.mimeType });
        self.recordedVideo.src = null;
        self.recordedVideo.srcObject = null;
        self.recordedVideo.src = window.URL.createObjectURL(superBuffer);
        self.recordedVideo.controls = true;
        self.recordedVideo.width = self.options.width;
        self.recordedVideo.height = self.options.width * 0.5625;
        self.recordedVideo.play();
    },
    download: function () {
        const self = this;
        let options = self.fileOption();
        const blob = new Blob(self.recordedBlobs, { type: options.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${self.element.attr("name")}_videoCanvas.${options.type}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    },
    getBlob: function () {
        const self = this;
        let options = self.fileOption();
        const blob = new Blob(self.recordedBlobs, { type: options.mimeType });
        return blob;
    },
    fileOption: function () {
        let options;
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            options = { mimeType: 'video/webm; codecs=vp9', type: 'webm' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm', type: 'webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4', type: 'mp4', videoBitsPerSecond: 100000 };
        } else {
            console.error("no suitable mimetype found for this device");
        }
        return options;
    },
    _destroy: function () {
        const self = this;
        self.recordedBlobs = null;
        self.stream.getTracks().forEach(track => {
            track.stop();
        });
        self.stream = null;
    }
});