var CONNURL = "ws://localhost:9001";
var ServerconnService = /** @class */ (function () {
    function ServerconnService() {
        this._callbacks = [];
        this._caches = [];
        this.openCallbacks = [function () { }];
        this._initialize();
    }
    ServerconnService.prototype._check = function () {
        if (!this._ws || this._ws.readyState == 3) {
            this._initialize();
        }
    };
    ServerconnService.prototype._initialize = function () {
        var _this = this;
        this._ws = new WebSocket(CONNURL);
        this._ws.onmessage = function (e) {
            var data = JSON.parse(e.data);
            _this._callbacks.forEach(function (callback) {
                if (data.response_id === callback[0]) {
                    callback[1](data);
                }
            });
        };
        this._ws.onerror = function (e) {
            _this._check();
        };
        this._ws.onclose = function (e) {
            _this._check();
        };
        this._ws.onopen = function (e) {
            for (var _i = 0, _a = _this.openCallbacks; _i < _a.length; _i++) {
                var callback = _a[_i];
                callback();
            }
            _this._caches.forEach(function (element) {
                _this._ws.send(element);
            });
        };
    };
    ServerconnService.prototype.add = function (data, callback) {
        var identifier = this._generateIdentifier();
        data.request_id = identifier;
        this._callbacks.push([identifier, callback]);
        if (this._ws.readyState == this._ws.OPEN) {
            this._ws.send(JSON.stringify(data));
        }
        else {
            this._caches.push(JSON.stringify(data));
        }
    };
    ServerconnService.prototype._generateIdentifier = function () {
        return uuidv4();
    };
    return ServerconnService;
}());
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
var SCS = new ServerconnService();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
function checkValidGameType() {
    var select = document.getElementById("selectgame");
    var option = select.options[select.selectedIndex].value;
    var button = document.getElementById("startgame");
    if (option.length != 0) {
        button.disabled = false;
    }
    else {
        button.disabled = true;
    }
}
function startNewGame() {
    var select = document.getElementById("selectgame");
    var option = select.options[select.selectedIndex].value;
    SCS.add({ 'request': 'newgame', 'type': option }, function (response) {
        console.log(response);
    });
    resetCanvas();
    var im = new Image();
    im.src = "cardimgs/clovers-1.png";
    ctx.drawImage(im, findPos(canvas).x, findPos(canvas).y, 70, 100);
    canvas.onmousemove = mousemove;
}
function resetCanvas() {
    canvas.style.display = "block";
    canvas.width = 1920;
    canvas.height = 1080;
    ctx.moveTo(0, 0);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
}
function mousemove() {
    resetCanvas();
    var im = new Image();
    im.src = "cardimgs/clovers-1.png";
    ctx.drawImage(im, findPos(canvas).x, findPos(canvas).y, 70, 100);
}
