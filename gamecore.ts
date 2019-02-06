/// <reference path="gameobject.ts" />
/// <reference path="main.ts" />

let objects: GameObject[] = [];

function getCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    return [canvas, ctx];
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getTouchPos(canvas, touchEvt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: touchEvt.touches[0].clientX - rect.left,
        y: touchEvt.touches[0].clientY - rect.top
    };
}

function startNewGame() {
    let select = document.getElementById("selectgame") as HTMLSelectElement;
    let option = select.options[select.selectedIndex].value;

    document.getElementsByTagName("body")[0].innerHTML = "<canvas id='canvas'></canvas>"

    scs.add({'request': 'newgame', 'type': option}, (response) => {
        console.log(response);
    });

    let canvas = getCanvas()[0];
    document.body.addEventListener("touchstart", (e) => {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", (e) => {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", (e) => {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);

    resetCanvas();


    objects.push(new GameObject(GameObjectType.Image, 
        { x: 0, y: 0 }, 
        { x: 75, y: 100 }, 
        "cardimgs/clovers-1.png"))

    objects.push(new GameObject(GameObjectType.Image, 
        { x: 300, y: 300 }, 
        { x: 75, y: 100 }, 
        "cardimgs/diamonds-13.png"))

    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup)
    canvas.addEventListener("touchstart", touchstart);
    canvas.addEventListener("touchmove", touchmove);
    canvas.addEventListener("touchend", () => { canvas.dispatchEvent(new MouseEvent("mouseup")) });

    scs.add({'request': "getpos"}, (data) => { objects[data.index].pos.x = data.x; objects[data.index].pos.y = data.y; })
    console.log("hello")
    setInterval(resetCanvas, 100);
}

function resetCanvas() {
    let canvas = getCanvas()[0]; let ctx = getCanvas()[1];

    canvas.style.display = "block";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.moveTo(0, 0);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill()  

    objects.forEach(obj => {
        if (obj.type == GameObjectType.Image) {
            let im = new Image();
            im.src = obj.data;
            ctx.drawImage(im, obj.pos.x, obj.pos.y, obj.size.x, obj.size.y);
            console.log();
        }
    });
}

function mousedown(evt: Event) {
    console.log("down");
    let canvas = getCanvas()[0];
    let pos = getMousePos(canvas, evt)
    objects.forEach(obj => {
        if (pos.x >= obj.pos.x && pos.x <= obj.pos.x + obj.size.x && pos.y >= obj.pos.y && pos.y <= obj.pos.y + obj.size.y) {
            obj.selected = true;
        } else {
            obj.selected = false;
        }
    });
}

function mouseup(evt: Event) {
    console.log("up");
    objects.forEach(obj => {
        obj.selected = false;
    })
}

function mousemove(evt: Event) {
    let canvas = getCanvas()[0];
    resetCanvas()
    objects.forEach((obj, index) => {
        if (obj.selected) {
            obj.pos = getMousePos(canvas, evt);
            scs.add({'request': "move", 'index': index, 'x': obj.pos.x, 'y': obj.pos.y}, () => {});
        }
    })
}

function touchstart(evt: TouchEvent) {
    console.log("down");
    let canvas = getCanvas()[0];
    let pos = getTouchPos(canvas, evt)
    objects.forEach(obj => {
        if (pos.x >= obj.pos.x && pos.x <= obj.pos.x + obj.size.x && pos.y >= obj.pos.y && pos.y <= obj.pos.y + obj.size.y) {
            obj.selected = true;
        } else {
            obj.selected = false;
        }
    });
}

function touchmove(evt: TouchEvent) {
    let canvas = getCanvas()[0];
    resetCanvas()
    objects.forEach((obj, index) => {
        if (obj.selected) {
            obj.pos = getTouchPos(canvas, evt);
            scs.add({'request': "move", 'index': index, 'x': obj.pos.x, 'y': obj.pos.y}, () => {});
        }
    })
}

