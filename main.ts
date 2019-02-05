/// <reference path="serverconn.ts" />
/// <reference path="gamecore.ts" />

const scs = new ServerconnService();

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