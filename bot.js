// Import necessary Libs
const tmi = require('tmi.js');
const robot = require('robotjs');
const ioHook = require('iohook');
require ('custom-env').env('default');

robot.setMouseDelay(25);

// Load sensitive Data from .env
const botUsername = process.env.BOT_USERNAME;
const botOAuth = process.env.BOT_OAUTH;

// Define Twitch-Chat Options
const opts = {
    identity : {
        username : botUsername,
        password : botOAuth,
    },
    channels: [
        "sirquackington",
        // "noway4u_sir",
    ]
};

// Define Position of Elements
const menuPos = {
    "roll": {x: 185, y: 990},
    "ice": {x: 1070, y: 990},
    "sell": {x: 1070, y: 990},
    "end": {x: 1625, y: 990},
    "confirm": {x: 1260, y:655},
}

const activePetSlots = {
    "ap1": {x: 530, y: 390},
    "ap2": {x: 675, y: 390},
    "ap3": {x: 820, y: 390},
    "ap4": {x: 965, y: 390},
    "ap5": {x: 1100, y: 390}
};
const buyPetSlots = {
    "bp1": {x: 530, y: 680},
    "bp2": {x: 675, y: 680},
    "bp3": {x: 820, y: 680},
    "bp4": {x: 965, y: 680},
    "bp5": {x: 1100, y: 680}
};
const buyItemSlots = {
    "bi1": {x: 1245, y: 680},
    "bi2": {x: 1390, y: 680}
}


var pauseChatbot = false;
ioHook.on("keypress", event => {
    if(event.shiftKey && event.ctrlKey && event.keychar === 83){
        pauseChatbot = !pauseChatbot;
        if(pauseChatbot){
            console.log("Paused Twitch-Chat parser.");
        }else{
            console.log("Activated Twitch-Chat parser.");
        }
    }
});
ioHook.start();


const client = new tmi.client(opts);
client.on('message', function(target, context, msg, self){
    if(pauseChatbot) return;
    
    // Ignore messages from myself
    if (self) { return; }

    let commandMsg = msg.trim().toLowerCase();
    if(commandMsg.indexOf("!") != 0) return;

    commandMsg = commandMsg.split(" ") ?? [];
    
    switch(commandMsg[0]){
        case "!sell":
            if(activePetSlots[commandMsg[1]] === undefined) return;
            var target = activePetSlots[commandMsg[1]];
            console.log("Selling Pet on ", commandMsg[1]);
            sellPet(target);
            break;
        case "!ice":
            if(buyPetSlots[commandMsg[1]] === undefined && buyItemSlots[commandMsg[1]] === undefined) return;
            var target = buyPetSlots[commandMsg[1]] !== undefined ? buyPetSlots[commandMsg[1]] : buyItemSlots[commandMsg[1]];
            console.log("Toggle freeze on ", commandMsg[1]);
            freezeElement(target);
            break;
        case "!roll":
            console.log("Rolling new Pets and Items");
            roll();
            break;
        case "!end":
            console.log("Ending current turn")
            end();
            break;
        default:
            if(commandMsg[0].indexOf("!ap") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(activePetSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;
                console.log("Moving Pet from", commandMsg[0], "to", commandMsg[1]);

                var target = activePetSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];

                movePet(target, destination);

            }else if(commandMsg[0].indexOf("!bp") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(buyPetSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;

                console.log("Buying Pet from", commandMsg[0], "and placing on", commandMsg[1]);
                var target = buyPetSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];
                buyPet(target, destination);

            }else if(commandMsg[0].indexOf("!bi") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(buyItemSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;

                console.log("Buying Item from", commandMsg[0], "and giving to", commandMsg[1]);
                var target = buyItemSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];
                buyPet(target, destination);
            }
            break;




        case "!md":
            robot.setMouseDelay(commandMsg[1]);
            console.log("Set mouseDelay to ", commandMsg[1], "ms");
            break;
    }



    // amountMsg++;
    // process.stdout.write(".");
});
client.on('connected', function(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
});

client.connect();


// Action helper functions
function buyPet(target, destination){
    clickElement(target);
    clickElement(destination);
}
function movePet(target, destination){
    clickElement(target);
    clickElement(destination);
}
function sellPet(target){
    const sellPos = menuPos['sell'];
    clickElement(target);
    clickElement(sellPos);
}

function buyItem(target, destination){
    clickElement(target);
    clickElement(destination);
}

function freezeElement(target){
    const freezePos = menuPos['ice'];
    clickElement(target);
    clickElement(freezePos);
}
function roll(){
    const rollPos = menuPos['roll'];
    clickElement(rollPos);
}
function end(){
    const endPos = menuPos['end'];
    const confirmPos = menuPos['confirm'];
    clickElement(endPos);
    clickElement(confirmPos);
}

// Python-Robot helper functions
function dragMouseFromTo(pos1, pos2){
    robot.moveMouse(pos1.x, pos1.y);
    robot.mouseToggle("down");
    robot.dragMouse(pos2.x, pos2.y);
    robot.mouseToggle("up");
}
function clickElement(pos){
    robot.moveMouse(pos.x, pos.y);
    robot.mouseClick();
}