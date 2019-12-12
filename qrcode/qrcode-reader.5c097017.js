parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"jg7v":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;class e{static hasCamera(){return navigator.mediaDevices.enumerateDevices().then(e=>e.some(e=>"videoinput"===e.kind)).catch(()=>!1)}constructor(t,i,s=e.DEFAULT_CANVAS_SIZE){this.$video=t,this.$canvas=document.createElement("canvas"),this._onDecode=i,this._paused=this._active=!1,this.$canvas.width=s,this.$canvas.height=s,this._sourceRect={x:0,y:0,width:s,height:s},this._onCanPlay=this._onCanPlay.bind(this),this._onPlay=this._onPlay.bind(this),this._onVisibilityChange=this._onVisibilityChange.bind(this),this.$video.addEventListener("canplay",this._onCanPlay),this.$video.addEventListener("play",this._onPlay),document.addEventListener("visibilitychange",this._onVisibilityChange),this._qrWorker=new Worker(e.WORKER_PATH)}destroy(){this.$video.removeEventListener("canplay",this._onCanPlay),this.$video.removeEventListener("play",this._onPlay),document.removeEventListener("visibilitychange",this._onVisibilityChange),this.stop(),this._qrWorker.postMessage({type:"close"})}start(){if(this._active&&!this._paused)return Promise.resolve();if("https:"!==window.location.protocol&&console.warn("The camera stream is only accessible if the page is transferred via https."),this._active=!0,this._paused=!1,document.hidden)return Promise.resolve();if(clearTimeout(this._offTimeout),this._offTimeout=null,this.$video.srcObject)return this.$video.play(),Promise.resolve();let e="environment";return this._getCameraStream("environment",!0).catch(()=>(e="user",this._getCameraStream())).then(t=>{this.$video.srcObject=t,this._setVideoMirror(e)}).catch(e=>{throw this._active=!1,e})}stop(){this.pause(),this._active=!1}pause(){this._paused=!0,this._active&&(this.$video.pause(),this._offTimeout||(this._offTimeout=setTimeout(()=>{let e=this.$video.srcObject&&this.$video.srcObject.getTracks()[0];e&&(e.stop(),this._offTimeout=this.$video.srcObject=null)},300)))}static scanImage(t,i=null,s=null,a=null,r=!1,n=!1){let o=!1,h=new Promise((n,h)=>{let d,c,m;s||(s=new Worker(e.WORKER_PATH),o=!0,s.postMessage({type:"inversionMode",data:"both"})),c=(e=>{"qrResult"===e.data.type&&(s.removeEventListener("message",c),s.removeEventListener("error",m),clearTimeout(d),null!==e.data.data?n(e.data.data):h("QR code not found."))}),m=(e=>{s.removeEventListener("message",c),s.removeEventListener("error",m),clearTimeout(d),h("Scanner error: "+(e?e.message||e:"Unknown Error"))}),s.addEventListener("message",c),s.addEventListener("error",m),d=setTimeout(()=>m("timeout"),3e3),e._loadImage(t).then(t=>{t=e._getImageData(t,i,a,r),s.postMessage({type:"decode",data:t},[t.data.buffer])}).catch(m)});return i&&n&&(h=h.catch(()=>e.scanImage(t,null,s,a,r))),h.finally(()=>{o&&s.postMessage({type:"close"})})}setGrayscaleWeights(e,t,i,s=!0){this._qrWorker.postMessage({type:"grayscaleWeights",data:{red:e,green:t,blue:i,useIntegerApproximation:s}})}setInversionMode(e){this._qrWorker.postMessage({type:"inversionMode",data:e})}_onCanPlay(){this._updateSourceRect(),this.$video.play()}_onPlay(){this._updateSourceRect(),this._scanFrame()}_onVisibilityChange(){document.hidden?this.pause():this._active&&this.start()}_updateSourceRect(){let e=Math.round(2/3*Math.min(this.$video.videoWidth,this.$video.videoHeight));this._sourceRect.width=this._sourceRect.height=e,this._sourceRect.x=(this.$video.videoWidth-e)/2,this._sourceRect.y=(this.$video.videoHeight-e)/2}_scanFrame(){if(!this._active||this.$video.paused||this.$video.ended)return!1;requestAnimationFrame(()=>{e.scanImage(this.$video,this._sourceRect,this._qrWorker,this.$canvas,!0).then(this._onDecode,e=>{this._active&&"QR code not found."!==e&&console.error(e)}).then(()=>this._scanFrame())})}_getCameraStream(e,t=!1){let i=[{width:{min:1024}},{width:{min:768}},{}];return e&&(t&&(e={exact:e}),i.forEach(t=>t.facingMode=e)),this._getMatchingCameraStream(i)}_getMatchingCameraStream(e){return 0===e.length?Promise.reject("Camera not found."):navigator.mediaDevices.getUserMedia({video:e.shift()}).catch(()=>this._getMatchingCameraStream(e))}_setVideoMirror(e){this.$video.style.transform="scaleX("+("user"===e?-1:1)+")"}static _getImageData(e,t=null,i=null,s=!1){i=i||document.createElement("canvas");let a=t&&t.x?t.x:0,r=t&&t.y?t.y:0,n=t&&t.width?t.width:e.width||e.videoWidth;return t=t&&t.height?t.height:e.height||e.videoHeight,s||i.width===n&&i.height===t||(i.width=n,i.height=t),(s=i.getContext("2d",{alpha:!1})).imageSmoothingEnabled=!1,s.drawImage(e,a,r,n,t,0,0,i.width,i.height),s.getImageData(0,0,i.width,i.height)}static _loadImage(t){if(t instanceof HTMLCanvasElement||t instanceof HTMLVideoElement||window.ImageBitmap&&t instanceof window.ImageBitmap||window.OffscreenCanvas&&t instanceof window.OffscreenCanvas)return Promise.resolve(t);if(t instanceof Image)return e._awaitImageLoad(t).then(()=>t);if(t instanceof File||t instanceof URL||"string"==typeof t){let i=new Image;return i.src=t instanceof File?URL.createObjectURL(t):t,e._awaitImageLoad(i).then(()=>(t instanceof File&&URL.revokeObjectURL(i.src),i))}return Promise.reject("Unsupported image type.")}static _awaitImageLoad(e){return new Promise((t,i)=>{if(e.complete&&0!==e.naturalWidth)t();else{let s,a;s=(()=>{e.removeEventListener("load",s),e.removeEventListener("error",a),t()}),a=(()=>{e.removeEventListener("load",s),e.removeEventListener("error",a),i("Image load error")}),e.addEventListener("load",s),e.addEventListener("error",a)}})}}e.DEFAULT_CANVAS_SIZE=400,e.WORKER_PATH="qr-scanner-worker.min.js";var t=e;exports.default=t;
},{}],"Focm":[function(require,module,exports) {
"use strict";var e=n(require("qr-scanner"));function n(e){return e&&e.__esModule?e:{default:e}}var r=document.getElementById("preview"),t=new e.default(r,function(e){return console.log(e)});
},{"qr-scanner":"jg7v"}]},{},["Focm"], null)
//# sourceMappingURL=/qrcode-reader.5c097017.js.map