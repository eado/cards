const CONNURL = "ws://localhost:9001";

class ServerconnService {
    
    private _ws: WebSocket
    private _callbacks: [String, (data: any) => void][] = []
    private _caches: String[] = []

    openCallbacks = [() => {}]

    constructor() {
        this._initialize()
    }

    private _check() {
        if (!this._ws || this._ws.readyState == 3) {
            this._initialize()
        }
    }

    private _initialize() {
        this._ws = new WebSocket(CONNURL);

        this._ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            this._callbacks.forEach(
                callback => {

                    if (data.response_id === callback[0]) {
                        callback[1](data);
                    }
                }
            );
        }
        this._ws.onerror = (e) => {
            this._check()
        }

        this._ws.onclose = (e) => {
            this._check()
        }

        this._ws.onopen = (e) => {
            for (let callback of this.openCallbacks) {
                callback()
            }
            this._caches.forEach(element => {
                this._ws.send(element as string);
            });
        }
    }

    add(data: any, callback: ((any) => void)) {
        let identifier = this._generateIdentifier();
        data.request_id = identifier;
        this._callbacks.push([identifier, callback]);
        if (this._ws.readyState == this._ws.OPEN) {
            this._ws.send(JSON.stringify(data));
        } else {
            this._caches.push(JSON.stringify(data));
        }
    }

    private _generateIdentifier() {
        return uuidv4()
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const SCS = new ServerconnService();

let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = canvas.getContext("2d");

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
    let select = document.getElementById("selectgame") as HTMLSelectElement;

    let option = select.options[select.selectedIndex].value;

    let button = document.getElementById("startgame") as HTMLButtonElement;
    if (option.length != 0) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

function startNewGame() {
    let select = document.getElementById("selectgame") as HTMLSelectElement;
    let option = select.options[select.selectedIndex].value;

    SCS.add({'request': 'newgame', 'type': option}, (response) => {
        console.log(response);
    });

    resetCanvas();

    let im = new Image()
    im.src = "cardimgs/clovers-1.png";
    ctx.drawImage(im, findPos(canvas).x, findPos(canvas).y, 70, 100);

    canvas.onmousemove = mousemove;
}

function resetCanvas() {
    canvas.style.display = "block";

    canvas.width = 1920
    canvas.height = 1080

    ctx.moveTo(0, 0);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill()
}

function mousemove() {
    resetCanvas()
    let im = new Image()
    im.src = "cardimgs/clovers-1.png";
    ctx.drawImage(im, findPos(canvas).x, findPos(canvas).y, 70, 100);
}