//RAM and register declaration up here
let instructionRAM = [];
let programRAM = [];
let monitorRAM = [];
let registers = [0, 0, 0];
let programCounter = 0;
let RAMCounter = 0;

//For readability purposes. Just makes state switching easier.
const MONITOR = 0;
const INSTRUCTION_RAM = 1;
const PROGRAM_RAM = 2;

const MENU = 0;
const GAME = 1;
const GUIDE = 2;

let gameState = MENU;
let viewState = MONITOR;

let selectedX = 0;
let selectedY = 0;

let running = false;

let clockSpeed = 60;

let sampleProgram1 = [1, 5, 2, 1, 1, 1, 6, 1, 5, 1, 5, 12, 3];
let sampleProgram2 = [1, 25, 2, 1, 63, 0, 5, 8, 1, 1, 1, 6, 8, 1, 50, 0, 7, 14, 3, 15];
let sampleProgram3 = [1, 63, 0, 2, 1, 5, 8, 1, 1, 1, 6, 4, 0, 8, 1, 50, 0, 7, 14, 0, 3, 49, 2, 1, 11, 1, 1, 49, 1, 1, 63, 0, 2, 2, 5, 9, 1, 1, 1, 6, 4, 0, 8, 1, 50, 0, 7, 14, 26, 3, 49, 2, 2, 11, 0, 1, 63, 0, 2, 1, 5, 8, 1, 1, 1, 7, 4, 0, 14, 55, 11, 1, 1, 0, 1, 1, 63, 0, 2, 2, 5, 9, 1, 1, 1, 7, 4, 0, 14, 72, 15];
let sampleProgram4 = [3, 60, 11, 255, 2, 0, 1, 1, 1, 6, 4, 0, 10, 3, 60, 8, 1, 63, 0, 7, 14, 2, 1, 63, 0, 11, 0, 4, 0, 11, 1, 4, 0, 11, 6, 4, 0, 11, 7, 4, 0, 11, 8, 4, 0, 11, 15, 4, 0, 11, 48, 4, 0, 11, 55, 4, 0, 11, 56, 4, 0, 11, 57, 4, 0, 11, 62, 4, 0, 11, 63, 4, 0, 1, 21, 0, 11, 18, 4, 0, 11, 21, 4, 0, 11, 42, 4, 0, 11, 45, 4, 0, 11, 51, 4, 0, 11, 52, 4, 0, 11, 255, 3, 0, 2, 0, 10, 8, 2, 0, 11, 254, 2, 1, 11, 253, 2, 2, 5, 11, 254, 2, 0, 1, 1, 1, 6, 4, 0, 8, 1, 8, 0, 7, 14, 148, 3, 0, 11, 253, 2, 0, 1, 1, 1, 6, 4, 0, 11, 255, 2, 0, 1, 1, 1, 6, 4, 0, 8, 1, 64, 0, 7, 14, 104, 15];

//The class for state switch buttons. I'm probably overengineering this, but idk, I guess I wanted to flex lol.
class Button {
  constructor(x, y, bWidth, bHeight, displayText) {
    this.x = x;
    this.y = y;
    this.width = bWidth;
    this.height = bHeight;
    this.displayText = displayText;
  }

  drawButton() {
    stroke("black");
    strokeWeight(5);
    fill("white");
    rect(this.x, this.y, this.width, this.height);
    fill("black");
    noStroke();
    textSize(18);
    text(this.displayText, this.x + this.width / 2, this.y + this.height / 2);
  }
};

//Declaring all the buttons.
let playButton = new Button(500, 450, 200, 100, "Play");
let guideButton = new Button(500, 570, 200, 100, "Guide");
let monitorButton = new Button(10, 10, 200, 100, "Monitor");
let instructionRAMButton = new Button(10, 120, 200, 100, "Instruction RAM");
let programRAMButton = new Button(10, 230, 200, 100, "Program RAM");
let clockSpeedButton = new Button(10, 390, 200, 50, "Clock Speed");
let runButton = new Button(1030, 715, 75, 75, "Run");
let stopButton = new Button(1115, 715, 75, 75, "Stop");
let backButton = new Button(10, 740, 100, 50, "Back");
let resetButton = new Button(10, 600, 200, 50, "Reset");
let sample1Button = new Button(990, 50, 200, 40, "Incrementer");
let sample2Button = new Button(990, 100, 200, 40, "Draw Line");
let sample3Button = new Button(990, 150, 200, 40, "Draw Perimeter");
let sample4Button = new Button(990, 200, 200, 40, "Save/Load Image");

function setup() {
  createCanvas(1200, 800);
  frameRate(240);
  noStroke();
  textAlign(CENTER, CENTER);

  //Setting up the RAM.
  for (let i = 0; i < 256; i++) {
    instructionRAM.push(0);
    programRAM.push(0);
  }
  for (let i = 0; i < 50; i++) {
    monitorRAM.push([]);
    for (let j = 0; j < 50; j++) {
      monitorRAM[i].push(0);
    }
  }

  //Just a test, not a permanent feature. I wanted to make sure the 6-bit colour pallete actually worked. It does, and it looks pretty cool tbh. I also tested out the RAM visualisations, although that's not as flashy.
  /*for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      monitorRAM[j][i] = (i * 8) + j;
    }
  }
  for (let i = 0; i < 256; i++) {
    instructionRAM[i] = i;
    programRAM[i] = 255 - i;
  }*/
}

//This function converts a decimal number into a binary value as an array of 1s and 0s. I just used a method I looked up online.
function decToBinary(x) {
  let binaryValue = [0, 0, 0, 0, 0, 0];
  for (let i = 5; i >= 0; i--) {
    binaryValue[i] = x % 2;
    x = Math.floor(x / 2);
  }
  return binaryValue;
}

function numToRGBValue(x) {
  //This turns the number x into an RGB value, emulating a six-bit colour palette. I know it's very ugly code, but I can't be bothered to make it cleaner, and besides, this would technically perform better than some alternatives.
  let increment = 85; //255 / 3
  if (x >= 128) x -= 128;
  if (x >= 64) x -= 64;
  let rgb = [0, 0, 0];
  let binaryValue = decToBinary(x);
  rgb[0] += (binaryValue[0] * 2 + binaryValue[1]) * increment;
  rgb[1] += (binaryValue[2] * 2 + binaryValue[3]) * increment;
  rgb[2] += (binaryValue[4] * 2 + binaryValue[5]) * increment;
  return rgb;
}

//For convenience's sake, since I have to do this twice in the code.
function resetRAM() {
  for (let i = 0; i < 256; i++) {
    programRAM[i] = 0;
  }
  for (let i = 0; i < 3; i++) {
    registers[i] = 0;
  }
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
      monitorRAM[j][i] = 0;
    }
  }
}

//I think my spaghetti code is becoming a bit too real. This function is used exactly once in the entire program, way down in the already incredibly bloated draw function.
//Of course I used center rect mode for just the registers and literally nothing else. Of course I now have to do the math to undo that in this one almost useless function. Because what's the point of coding if you don't actively make things harder for yourself? I swear I love programming, but damn it if my patience isn't being tested right now.
function mouseOnRegister(x) {
  x -= 1;
  let blockX = 975;
  let blockY = (height / 2) - 25 + (100 * x);
  return blockX < mouseX && mouseX < blockX + 50 && blockY < mouseY && mouseY < blockY + 50;
}

function drawFollowingNumber(x) {
  fill("white");
  stroke("black");
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text(x, mouseX + 10, mouseY);
  textAlign(CENTER, CENTER);
}

function draw() {
  background("#F3E5AB");

  if (gameState === MENU) {
    textSize(200);
    text("LP-8", 600, 150);
    textSize(24);
    text("The world's least user-friendly computer", 600, 300);
    textSize(16);
    textAlign(LEFT, BOTTOM);
    text("Lars Petersen, CS 10 Day 1 Block 2, 2023", 10, 790);
    textAlign(CENTER, CENTER);
    playButton.drawButton();
    guideButton.drawButton();
  }
  else if (gameState === GAME) {
    //I have no idea why, but for some reason this equation only works if I add 1. It's meant for the RAM, so you can edit the instruction RAM, and so you can view the values of program RAM with just the mouse.
    if (viewState !== PROGRAM_RAM) {
      selectedX = Math.floor((mouseX - 320) / 40) + 1;
      selectedY = Math.floor((mouseY - 120) / 40) + 1;
    }
    //If I do the if-else any differently it causes a really weird bug, so excuse the confusion.
    //Even more confusingly, the previously mentioned weirdness with the last equation is just not present with the program RAM. For the instruction RAM, I have to add one, but for some reason here I don't. I don't know if this is just my terrible code or if I'm having a stroke, but I guess this is my reality now.
    else {
      selectedX = Math.floor((mouseX - 320) / 35);
      selectedY = Math.floor((mouseY - 120) / 35);
    }

    if (viewState === MONITOR) {
      rectMode(CENTER);
      fill("gray");
      rect(600, 400, 740, 740)
      rectMode(CORNER);

      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          //Tile size: 14 pixels.
          let rgb = numToRGBValue(monitorRAM[i][j]);
          fill(rgb[0], rgb[1], rgb[2]);
          let x = (width / 2) + (i - 25) * 14;
          let y = (height / 2) + (j - 25) * 14;
          rect(x, y, 14, 14);
        }
      }
    }
    else if (viewState === INSTRUCTION_RAM) {
      rectMode(CENTER);
      fill("green");
      rect(600, 400, 680, 680);
      rectMode(CORNER);
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          if (selectedX !== i || selectedY !== j) {
            //Tile size: 40 pixels.
            let brightnessValue = instructionRAM[(j * 16) + i];
            fill(brightnessValue);
            let x = (width / 2) + (i - 8) * 40;
            let y = (height / 2) + (j - 8) * 40;
            rect(x, y, 40, 40);
          }
        }
      }
      //I had to do it like this because the stroke from the selected box would always be partially covered up by boxes drawn afterwards. I had to make sure the selected box is always the last box drawn.
      if (selectedX >= 0 && selectedX < 16 && selectedY >= 0 && selectedY < 16) {
        let x = (width / 2) + (selectedX - 8) * 40;
        let y = (height / 2) + (selectedY - 8) * 40;
        let brightnessValue = instructionRAM[(selectedY * 16) + selectedX];
        fill(brightnessValue);
        stroke(255 - brightnessValue);
        rect(x, y, 40, 40);
        drawFollowingNumber(brightnessValue);
        noStroke();
      }

      //Displaying the program counter's value.
      fill("black");
      textSize(24);
      text("Program counter: " + programCounter, 600, 780);

      resetButton.drawButton();
    }
    else if (viewState === PROGRAM_RAM) {
      rectMode(CENTER);
      fill("green");
      rect(600, 400, 600, 600);
      rectMode(CORNER);
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          if (selectedX !== i || selectedY !== j) {
            //Tile size: 35 pixels.
            let brightnessValue = programRAM[(j * 16) + i];
            fill(brightnessValue);
            let x = (width / 2) + (i - 8) * 35;
            let y = (height / 2) + (j - 8) * 35;
            rect(x, y, 35, 35);
          }
        }
      }
      if (selectedX >= 0 && selectedX < 16 && selectedY >= 0 && selectedY < 16) {
        let x = (width / 2) + (selectedX - 8) * 35;
        let y = (height / 2) + (selectedY - 8) * 35;
        let brightnessValue = programRAM[(selectedY * 16) + selectedX];
        fill(brightnessValue);
        stroke(255 - brightnessValue);
        rect(x, y, 35, 35);
        drawFollowingNumber(brightnessValue);
        noStroke();
      }
      //Forgive me father, for I have sinned, and have used the Javascript ternary operator.
      rectMode(CENTER);
      fill(registers[0]);
      mouseOnRegister(0) ? stroke(255 - registers[0]) : stroke("green");
      rect(1000, (height / 2) - 100, 50, 50);
      fill(registers[1]);
      mouseOnRegister(1) ? stroke(255 - registers[1]) : stroke("green");
      rect(1000, (height / 2), 50, 50);
      fill(registers[2]);
      mouseOnRegister(2) ? stroke(255 - registers[2]) : stroke("green");
      rect(1000, (height / 2) + 100, 50, 50);
      rectMode(CORNER);
      noStroke();
      fill("black");
      textSize(18);
      text("Register A", 1100, (height / 2) - 100);
      text("Register B", 1100, height / 2);
      text("Register C", 1100, (height / 2) + 100);

      for (let i = 0; i < 3; i++) {
        if (mouseOnRegister(i)) {
          drawFollowingNumber(registers[i]);
          break;
        }
      }

      //Displaying the RAM counter's value.
      noStroke();
      fill("black");
      textSize(24);
      text("RAM counter: " + RAMCounter, 600, 780);
    }

    //I could just put all these buttons in an array, but I think that would use even more code and probably wouldn't be as efficient. Sure, it doesn't look nice this way, but it's a bit more practical if you think about it.
    monitorButton.drawButton();
    instructionRAMButton.drawButton();
    programRAMButton.drawButton();
    clockSpeedButton.drawButton();
    runButton.drawButton();
    stopButton.drawButton();

    textAlign(RIGHT, TOP);
    textSize(18);
    text("Sample Programs", 1190, 10);
    textAlign(LEFT, TOP);
    textSize(11);
    text("Current Clock Speed: " + clockSpeed + "Hz", 10, 450);
    textAlign(CENTER, CENTER);

    sample1Button.drawButton();
    sample2Button.drawButton();
    sample3Button.drawButton();
    sample4Button.drawButton();
  }
  else if (gameState === GUIDE) {
    textAlign(LEFT, TOP);
    textSize(36);
    text("Components", 10, 10);
    text("Instruction Set", 610, 10);
    text("Tips", 10, 410);
    textSize(14);
    text("The monitor is a 50x50 grid of pixels with a 6-bit colour palette,\n meaning 64 colours in all for each pixel.\n\nThe instruction RAM is the mutable part of the RAM, and contains\n256 squares, each of which can be clicked on and set to a value\nbetween 0 and 256. The value of these squares represents the\ninstructions and parameters of your program.\n\nThe program RAM is not directly mutable through user input, and\nmust be edited with code. It also contains 256 squares, although\nthey are purely for data storage and do not affect program\nlogic. It also contains 3 registers, which are also not directly\nmutable.\n\nThe program counter and RAM counter point to a space in their\nrespective components.", 10, 60);
    text("0: No operation\n1: Move a literal value (Param 1) into a register (Param 2)\n2: Move a RAM value (Param 1) into a register (Param 2)\n3: Move a register value (Param 1) into a RAM space (Param 2)\n4: Move a register value (Param 1) into a RAM space (Param 2)\n5: Set pixel value to value of register A, where X is register B\n\tand Y is register C\n6: Add the value in register B to the value in Register A\n7: Subtract the value of register B from register A\n8: Swap the values of register A and register B\n9: Swap the values of register A and register C\n10: Set the RAM counter to the value of register A\n11: Set the RAM counter to a literal value (Param 1)\n12: Unconditionally jump to an index (Param 1) in the instruction\n\tRAM\n13: Jump to an index (Param 1) if register A is equal to 0\n14: Jump to an index (Param 1) if register A is not equal to 0\n15: Halt the program", 610, 60);
    text("- When reading an instruction, the first four bits of the opcode are not read. To increase visibility in the editor, you can add 16, 32, 64,\n\tor 128 to the opcode to make it more visible without changing the meaning of the instruction. This also works with the first two bits\n\tof RGB values, and the first six bits of register addresses.\n- Try working with pseudocode to help wrap your head around a program, it's almost impossible to make anything just by looking at\n\tboxes in a grid. Write your program in pseudocode, and then convert it into numbers the computer can read.\n- If there's a bug in your program, make sure to slow down the clock speed so you can see what's going on. It can be as slow as 1Hz, or\n\tone clock cycle per second.\n- When an 8 bit value, such as the registers, RAM values, or program counter, go above 255, they automatically reset to 0. The\n\topposite is true if they go below 0, looping back to 255. You can use this to your advantage.", 10, 460);
    textAlign(CENTER, CENTER);
  }

  if (gameState !== MENU) {
    backButton.drawButton();
  }
}

function buttonClicked(button) {
  //Button width is 200, height is 100.
  return button.x < mouseX && mouseX < button.x + button.width && button.y < mouseY && mouseY < button.y + button.height;
}

//Argument to pass to clearInterval.
let interval;

function resetInstructions() {
  for (let i = 0; i < 256; i++) {
    instructionRAM[i] = 0;
  }
}

function loadSampleProgram(x) {
  resetInstructions();
  for (let i = 0; i < x.length; i++) {
    instructionRAM[i] = x[i];
  }
}

function mousePressed() {
  if (gameState === MENU) {
    if (buttonClicked(playButton)) gameState = GAME;
    if (buttonClicked(guideButton)) gameState = GUIDE;
  }
  else if (gameState === GAME) {
    //View state switching.
    if (buttonClicked(monitorButton)) viewState = MONITOR;
    if (buttonClicked(instructionRAMButton)) viewState = INSTRUCTION_RAM;
    if (buttonClicked(programRAMButton)) viewState = PROGRAM_RAM;
    if (buttonClicked(runButton) && !running) {
      running = true;
      resetRAM();
      interval = setInterval(clockCycle, Math.floor(1000 / clockSpeed));
    }
    if (buttonClicked(stopButton) && running) {
      running = false;
      programCounter = 0;
      RAMCounter = 0;
      clearInterval(interval);
    }

    //Sample program loading and clock speed editing.
    if (!running) {
      if (buttonClicked(sample1Button)) {
        loadSampleProgram(sampleProgram1);
      }
      if (buttonClicked(sample2Button)) {
        loadSampleProgram(sampleProgram2);
      }
      if (buttonClicked(sample3Button)) {
        loadSampleProgram(sampleProgram3);
      }
      if (buttonClicked(sample4Button)) {
        loadSampleProgram(sampleProgram4);
      }
      if (buttonClicked(clockSpeedButton)) {
        //For whatever reason, the setInterval function works differently on Chrome than on Girefox, more specifically a bug in Firefox's implemenation makes higher clock speeds not run as they should. This shouldn't be a problem for demoing on school computers running Chrome, but working on it at home is annoying because I use Firefox.
        let backup = clockSpeed;
        clockSpeed = Math.floor(Number(window.prompt("Please input a value. Clock speed cannot be greater than 200.")));
        if (clockSpeed > 200) clockSpeed = 200;
        if (clockSpeed < 1) clockSpeed = 1;
        if (isNaN(clockSpeed)) {
          clockSpeed = backup;
          alert("That is not a valid number.");
        }
      }
    }

    //RAM editing.
    if (viewState === INSTRUCTION_RAM && !running && selectedX >= 0 && selectedX < 16 && selectedY >= 0 && selectedY < 16) {
      //The index equation is used to get the right square in the grid, as the array in memory is one dimensional but the grid is two dimensional.
      let index = (selectedY * 16) + selectedX;
      let currentValue = instructionRAM[index];
      let newValue = Math.floor(Number(window.prompt("Please input a value lower than 256.")));
      instructionRAM[index] = newValue;
      if (isNaN(newValue)) {
        alert("That is not a valid number.");
        instructionRAM[index] = currentValue;
      }
      if (newValue > 255) instructionRAM[index] = 255;
      if (newValue < 0) instructionRAM[index] = 0;
    }
  }

  if (gameState === GAME && viewState === INSTRUCTION_RAM && buttonClicked(resetButton)) {
    resetInstructions();
  }

  if (gameState !== MENU && buttonClicked(backButton)) {
    if (gameState === GAME) {
      running = false;
      clearInterval(interval);
      programCounter = 0;
      RAMCounter = 0;
      resetRAM();
    }
    gameState = MENU;
  }
}

//These are just some handy functions to avoid 8-bit overflow, since Javascript is weak AND dynamically typed (Which, in my opinion, is the dumbest decision you could possibly make when making a programming language.)
function add8Bit(x, y) {
  for (let i = 0; i < y; i++) {
    x++;
    if (x > 255) {
      x = 0;
    } else if (x < 0) {
      x = 255;
    }
  }
  return x;
}

function subtract8Bit(x, y) {
  for (let i = 0; i < y; i++) {
    x--;
    if (x > 255) {
      x = 0;
    } else if (x < 0) {
      x = 255;
    }
  }
  return x;
}

//This effectively cuts off the first 4 bits of the number, so it doesn't interfer.
function getInstruction(x) {
  if (x >= 128) x -= 128;
  if (x >= 64) x -= 64;
  if (x >= 32) x -= 32;
  if (x >= 16) x -= 16;
  return x;
}

//This cuts off two more bits.
function getRegister(x) {
  x = getInstruction(x);
  if (x >= 8) x -= 8;
  if (x >= 4) x -= 4;
  return x;
}

function clockCycle() {
  //The clock cycle function. Effectively the whole CPU in a single function. It's a very messy chunk of code that I'd not like to ever look at again.
  //Update: I was able to make it a bit more readable, but I would still recommend limiting your exposure to it, as directly viewing the code for longer than 10 seconds at a time may result in blindness, vertigo, psychotic rage, and acute total organ failure.
  let instruction = getInstruction(instructionRAM[programCounter]);
  let param1 = instructionRAM[add8Bit(programCounter, 1)];
  let param2 = instructionRAM[add8Bit(programCounter, 2)];
  if (instruction === 0) {
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 1) {
    programCounter = add8Bit(programCounter, 3);
    registers[getRegister(param2)] = param1;
  } else if (instruction === 2) {
    programCounter = add8Bit(programCounter, 2);
    registers[getRegister(param1)] = programRAM[RAMCounter];
  } else if (instruction === 3) {
    programCounter = add8Bit(programCounter, 2);
    programRAM[RAMCounter] = param1;
  } else if (instruction === 4) {
    programCounter = add8Bit(programCounter, 2);
    programRAM[RAMCounter] = registers[param1];
  } else if (instruction === 5) {
    monitorRAM[registers[1]][registers[2]] = registers[0];
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 6) {
    registers[0] = add8Bit(registers[0], registers[1]);
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 7) {
    registers[0] = subtract8Bit(registers[0], registers[1]);
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 8) {
    let a = registers[1];
    let b = registers[0];
    registers[0] = a;
    registers[1] = b;
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 9) {
    let a = registers[2];
    let c = registers[0];
    registers[0] = a;
    registers[2] = c;
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 10) {
    RAMCounter = registers[0];
    programCounter = add8Bit(programCounter, 1);
  } else if (instruction === 11) {
    RAMCounter = param1;
    programCounter = add8Bit(programCounter, 2);
  } else if (instruction === 12) {
    programCounter = param1;
  } else if (instruction === 13) {
    if (registers[0] === 0) {
      programCounter = param1;
    } else { programCounter = add8Bit(programCounter, 2); }
  } else if (instruction === 14) {
    if (registers[0] !== 0) {
      programCounter = param1;
    } else { programCounter = add8Bit(programCounter, 2); }
  } else if (instruction === 15) {
    running = false;
    programCounter = 0;
    RAMCounter = 0;
    clearInterval(interval);
  }
}