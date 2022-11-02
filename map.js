const textMap =[ //text map
'000000000000000000000000000',
'0+....+.....+0+.....+....+0',
'0O0000.00000.0.00000.0000O0',
'0.0000.00000.0.00000.0000.0',
'0.0000.00000.0.00000.0000.0',
'0+....+..+..+.+..+..+....+0',
'0.0000.00.0000000.00.0000.0',
'0.0000.00.0000000.00.0000.0',
'0+....+00+..+0+..+00+....+0',
'000000.00000.0.00000.000000',
'-----0.00000-0-00000.0-----',
'-----0.00+--+b+--+00.0-----',
'-----0.00|000_000|00.0-----',
'000000.00|0--i--0|00.000000',
'tttttt+--+0-agc-0+--+tttttt',
'000000.00|0000000|00.000000',
'-----0.00+---f---+00.0-----',
'-----0.00-0000000-00.0hello',
'000000.00.0000000.00.000000',
'0+....+..+..+0+..+..+....+0',
'0O0000.00000.0.00000.0000O0',
'0.0000.00000.0.00000.0000.0',
'0+.+00+..+..+p+..+..+00+.+0',
'000.00.00.0000000.00.00.000',
'000.00.00.0000000.00.00.000',
'0+.+..+00+..+0+..+00+..+.+0',
'0.0000000000.0.0000000000.0',
'0.0000000000.0.0000000000.0',
'0+..........+.+..........+0',
'000000000000000000000000000'
];


function setupMap(resetDots){ //set up the map
	let x
	let y
	for (y=0;y < textMap.length;y++){ //loop through rows
		for (x=0;x < textMap[y].length; x++){ //loop through coloums 
			switch (textMap[y][x]){ //case for every valid text item
				case "0": //0 = wall
					new wall(x,y)
				break
				case ".": // . = dot
					if (resetDots){ // we only want this if we are doing a full reset
						new dot(x+0.5,y+0.5)
					}
				break
				case "+": //+ = intersection
					new Intersection(x,y)
					if (resetDots){ //if reset dots we want a dot on the intersections surrounded by dots
						if (textMap[y-1][x] == "." || textMap[y+1][x] == "." || textMap[y][x+1] == "." || textMap[y][x-1] == "."){
							new dot(x+0.5,y+0.5)
						}
					}
				break
				case "t": //t is tunnel which was supposed to slow ghosts until I found out the ghosts can't go in tunnels with the way they are programed.
					new tunnel(x,y)
				break
				case "p": // p = pacman
					p = new player(x,y)
				break
				case "b": //b = blinky
					new ghost(x,y,0)
          new Intersection(x,y)
				break
				case "a": //a = pinky
					new ghost(x,y,1)
				break
				case "i": //i = inky
					new ghost(x,y,2)
				break
				case "c": // c = clyde
					new ghost(x,y,3)
				break
				case "O": // O = power pellet but only if doing a full reset
					if (resetDots){
						new powerPellet(x+0.5,y+0.5)
					}
				break
        case "f":
          fruitSpawn = [x,y]
        break
        case "g":
          penLoc = [x,y]
          new Intersection(x,y)
        break
        case "_":
          new penGate(x,y)
        break
			}
		}
	}
	for (let i of inters){// re-init intersection so they correctly get their connected intersections
		i.init()
	}
}

let walls = [] //list of walls

class wall{ //create a wall that just displays to the screen
	constructor(x,y){
		this.pos = createVector(x,y)
		walls.push(this)
		this.disp = dispCoords(this.pos)
	}

	redoDisp(){
		this.disp = dispCoords(this.pos)
	}
	
	show(){
		rect(this.disp.x,this.disp.y,CELL,CELL)
	}
}

class penGate extends wall{
  show(){
    fill(0xff,0xc0,0xcb)
    rect(this.disp.x,this.disp.y+7,CELL,CELL*0.2)
    fill(0x0,0x0,0xff)
  }
}

inters = [] //list of intersections

class Intersection{
	constructor(x,y){
		this.pos = createVector(x,y) //set position add self to list and make var for connected intersections
		inters.push(this)
		this.connected = {}
	}
	init(){ //initialize this intersection by getting connected intersections
		for (let i of inters){ //loop intersections
			if (i == this){continue} //don't count self
			//console.log(i.pos.x < this.pos.x ? "left" : "right") // <<< debug thingy dw about it
			if (this.pos.y == i.pos.y && abs(inters.indexOf(i)-inters.indexOf(this)) == 1 ){
				this.connected[i.pos.x < this.pos.x ? 2 : 0] = i
			}
			if (i.pos.x == this.pos.x){
				if (i.pos.y < this.pos.y){
					this.connected[1] = i
				}
				if (i.pos.y > this.pos.y){
					this.connected[3] = i
					break
				}
			}
		}
	}
	show(){ //display but only if debug is on (debug if statement is outside this function)
		fill(0xff)
		stroke(0xff)
			rect((anchor+this.pos.x)*CELL,this.pos.y*CELL,CELL,CELL)
	}
}

tunnels = []
class tunnel{ //tunnel blocks for if I implement the ghosts being able to go through the walls
	constructor(x,y){
		this.pos = createVector(x,y)
		tunnels.push(this)
	}
	show(){
		fill(0xff,0xa5,0x0)
		stroke(0xff,0xa5,0x0)
			rect((anchor+this.pos.x)*CELL,this.pos.y*CELL,CELL,CELL)
	}
}