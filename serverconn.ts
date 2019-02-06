const CONNURL = "ws://10.10.221.88:9001"; 

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