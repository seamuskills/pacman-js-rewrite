let changeCooldown = 0
let unselectable = false
let menuIndex = "main"
let selectedIndex = 0

buttons = {
	"main":{
		"play": () => {gameState = "game"; lives = 0; reset(true);},
		"options": () => {menuIndex = "options";selectedIndex = 0}
	},
	"options":{
		"back": () => {menuIndex = "main";selectedIndex = 0},
		"`wavey dots enabled:${dotWave}`": () => {dotWave = !dotWave; localStorage.setItem("dotWave",String(dotWave))},
		"`lives enabled:${livesEnabled}`": () => {livesEnabled = !livesEnabled; localStorage.setItem("livesEnabled",String(livesEnabled))},
		"`starting speed:x${round(startSpeed * 10,1)}`": () => {startSpeed += 0.01; if (startSpeed > 0.2){startSpeed = 0.1}},
		"`starting level:${startLevel}`" : changeLevel,
		"`speed added per ramp: +${round(speedIncreaseAmount * 10,3)}`": () => {speedIncreaseAmount += 0.001; if (speedIncreaseAmount > 0.1){speedIncreaseAmount = 0.01}; speedIncreaseAmount = round(speedIncreaseAmount,3); localStorage.setItem("speedIncreaseAmount",speedIncreaseAmount)},
		"`speed ramp setting: ${rampValues[speedRamp]}`": () => {speedRamp = (speedRamp + 1) % 3; localStorage.setItem("speedRamp",speedRamp)},
    "`use sprites: ${useSprites}`" : () => {useSprites = !useSprites; localStorage.setItem("useSprites",useSprites)},
    "`accurate ghost hitbox: ${useModulo}`": () => {useModulo = !useModulo; localStorage.setItem("useModulo",useModulo)}
	}
}

function changeLevel(){
	let lvl = prompt("type a number for the new starting level")
	lvl = round(Number(lvl))
	if (Number.isNaN(lvl)){
		alert("Input was not a number!")
		lvl = 1
	}
	if (lvl <= 0){
		alert("Input must be above 0")
		lvl = 1
	}
	startLevel = lvl
	localStorage.setItem("startLevel",lvl)
}

drawMenuButtons = () => {
	gameSpeed = round(gameSpeed, 2)
	let width = window.innerWidth
	let height = window.innerHeight
	background(0)
	textSize(CELL)
	changeCooldown--
	let len = Object.keys(buttons[menuIndex]).length
	for (let i=0; i < len;i++){
		selectedIndex == i ? fill(0xff,0xff,0x00) : fill(0x55)
		if (Object.keys(buttons[menuIndex])[i][0] == "`"){
			text(eval(Object.keys(buttons[menuIndex])[i]),width/2,height*0.25+((height/len)*0.3*(i+1)))
		}else{
			text(Object.keys(buttons[menuIndex])[i],width/2,height*0.25+((height/len)*0.3*(i+1)))
		}
	}
	if (changeCooldown <= 0 && input.includes("s")){
		changeCooldown = 15
		selectedIndex++
	}
	if (changeCooldown <= 0 && input.includes("w")){
		changeCooldown = 15
		selectedIndex--
	}
	selectedIndex = Math.min(len-1,selectedIndex)
	selectedIndex = Math.max(0,selectedIndex)
	if (!unselectable && input.includes("Enter")){
		buttons[menuIndex][Object.keys(buttons[menuIndex])[selectedIndex]]()
		unselectable = true
	}
	if (!input.includes("Enter") && unselectable){
		unselectable = false
	}
}