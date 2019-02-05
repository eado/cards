var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["Image"] = 0] = "Image";
    GameObjectType[GameObjectType["Text"] = 1] = "Text";
    GameObjectType[GameObjectType["Box"] = 2] = "Box";
})(GameObjectType || (GameObjectType = {}));
var GameObject = /** @class */ (function () {
    function GameObject(type, position, size, data, visible) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        if (size === void 0) { size = { x: 0, y: 0 }; }
        if (data === void 0) { data = ""; }
        if (visible === void 0) { visible = true; }
        this.selected = false;
        this.type = type;
        this.data = data;
        this.pos = position;
        this.visible = visible;
        this.size = size;
    }
    return GameObject;
}());
/// <reference path="gameobject.ts" />
var objects = [];
function getCanvas() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    return [canvas, ctx];
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function startNewGame() {
    var select = document.getElementById("selectgame");
    var option = select.options[select.selectedIndex].value;
    scs.add({ 'request': 'newgame', 'type': option }, function (response) {
        console.log(response);
    });
    var canvas = getCanvas()[0];
    var ctx = getCanvas()[1];
    resetCanvas();
    objects.push(new GameObject(GameObjectType.Image, { x: 0, y: 0 }, { x: 75, y: 100 }, "cardimgs/clovers-1.png"));
    objects.push(new GameObject(GameObjectType.Image, { x: 300, y: 300 }, { x: 75, y: 100 }, "cardimgs/diamonds-13.png"));
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("touchstart", mousedown);
    canvas.addEventListener("touchend", mouseup);
    canvas.addEventListener("touchmove", mousedown);
    setInterval(resetCanvas, 100);
}
function resetCanvas() {
    var canvas = getCanvas()[0];
    var ctx = getCanvas()[1];
    canvas.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.moveTo(0, 0);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
    objects.forEach(function (obj) {
        if (obj.type == GameObjectType.Image) {
            var im = new Image();
            im.src = obj.data;
            ctx.drawImage(im, obj.pos.x, obj.pos.y, obj.size.x, obj.size.y);
            console.log();
        }
    });
}
function mousedown(evt) {
    console.log("down");
    var canvas = getCanvas()[0];
    var pos = getMousePos(canvas, evt);
    objects.forEach(function (obj) {
        if (pos.x >= obj.pos.x && pos.x <= obj.pos.x + obj.size.x && pos.y >= obj.pos.y && pos.y <= obj.pos.y + obj.size.y) {
            obj.selected = true;
        }
        else {
            obj.selected = false;
        }
    });
}
function mouseup(evt) {
    console.log("up");
    objects.forEach(function (obj) {
        obj.selected = false;
    });
}
function mousemove(evt) {
    var canvas = getCanvas()[0];
    resetCanvas();
    objects.forEach(function (obj) {
        if (obj.selected) {
            obj.pos = getMousePos(canvas, evt);
        }
    });
}
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
/// <reference path="serverconn.ts" />
/// <reference path="gamecore.ts" />
var scs = new ServerconnService();
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
