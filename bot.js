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
        process.env.TWITCH_CHANNEL
        // "noway4u_sir",
    ]
};

// Define screen positions of all Menu-Buttons
const menuPos = {
    "roll": {x: 185, y: 990},
    "ice": {x: 1070, y: 990},
    "sell": {x: 1070, y: 990},
    "end": {x: 1625, y: 990},
    "confirm": {x: 1260, y:655},
}
// Define screen positions of all active pet slots
const activePetSlots = {
    "ap1": {x: 530, y: 390},
    "ap2": {x: 675, y: 390},
    "ap3": {x: 820, y: 390},
    "ap4": {x: 965, y: 390},
    "ap5": {x: 1100, y: 390}
};
// Define screen positions of all buy pet slots
const buyPetSlots = {
    "bp1": {x: 530, y: 680},
    "bp2": {x: 675, y: 680},
    "bp3": {x: 820, y: 680},
    "bp4": {x: 965, y: 680},
    "bp5": {x: 1100, y: 680}
};
// Define screen positions of all buy item slots
const buyItemSlots = {
    "bi1": {x: 1245, y: 680},
    "bi2": {x: 1390, y: 680}
}

// Hotkey hook for disabling twitch-chat parser
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

// Connecting the Twitch-Bot to the specified channels
const client = new tmi.client(opts);

// Added Hook for each incoming Twitch-Chat message
client.on('message', function(target, context, msg, self){
    if(pauseChatbot) return;
    
    // Ignore messages from myself
    if (self) { return; }

    // Unify all incoming messages and ignore all without a exclamation mark
    let commandMsg = msg.trim().toLowerCase();
    if(commandMsg.indexOf("!") != 0) return;

    // Splitting the Command in multiple arguments
    commandMsg = commandMsg.split(" ") ?? [];
    
    // Check the Command for defined Commands
    switch(commandMsg[0]){
        // Sell a Pet by defined Target
        case "!sell":
            if(activePetSlots[commandMsg[1]] === undefined) return;
            var target = activePetSlots[commandMsg[1]];
            console.log("Selling Pet on ", commandMsg[1]);
            sellPet(target);
            break;


        // Toggle Freeze of a targeted Pet or Item
        case "!ice":
            if(buyPetSlots[commandMsg[1]] === undefined && buyItemSlots[commandMsg[1]] === undefined) return;
            var target = buyPetSlots[commandMsg[1]] !== undefined ? buyPetSlots[commandMsg[1]] : buyItemSlots[commandMsg[1]];
            console.log("Toggle freeze on ", commandMsg[1]);
            freezeElement(target);
            break;


        // Reroll all unfrozen Pets and Items
        case "!roll":
            console.log("Rolling new Pets and Items");
            roll();
            break;


        // End current Turn
        case "!end":
            console.log("Ending current turn")
            end();
            break;


        default:
            // We need to check those commands in special, because it has a number following, therefore the first entry of commandMsg is not always the same.
            
            // Swap an active Pet position
            if(commandMsg[0].indexOf("!ap") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(activePetSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;
                console.log("Moving Pet from", commandMsg[0], "to", commandMsg[1]);

                var target = activePetSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];

                movePet(target, destination);

            // Buy a new Pet
            }else if(commandMsg[0].indexOf("!bp") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(buyPetSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;

                console.log("Buying Pet from", commandMsg[0], "and placing on", commandMsg[1]);
                var target = buyPetSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];
                buyPet(target, destination);

            // Buy a new Item
            }else if(commandMsg[0].indexOf("!bi") >= 0){
                commandMsg[0] = commandMsg[0].replace("!","");
                if(buyItemSlots[commandMsg[0]] === undefined || activePetSlots[commandMsg[1]] === undefined) return;

                console.log("Buying Item from", commandMsg[0], "and giving to", commandMsg[1]);
                var target = buyItemSlots[commandMsg[0]];                
                var destination = activePetSlots[commandMsg[1]];
                buyItem(target, destination);
            }
            break;
    }
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