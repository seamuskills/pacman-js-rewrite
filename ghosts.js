//types:
// blinky = 0
// pinky = 1
// inky = 2
// clyde = 3

let ghosts = [] //list of ghosts

class ghost{
	constructor(x,y,type){
		this.type = type //which ghost is this
		this.pos = createVector(x,y) //where is this ghost?
		this.target = (0,0) //where is this ghost going?
		this.dir = 0 //what direction is this ghost traveling
		ghosts.push(this) //add to list of ghosts
		this.lastUsed = null //last used terrain tile
		this.pen = !(this.type == 0) //am I in the ghost pen? blinky is exempt from beginning in the pen.
		this.exit = false // is this ghost exiting the pen?
		this.eyes = false // is this ghost eaten?
		this.eaten = false // is this ghost exempt from current power pellet because it has just respawned?
		this.scatter = 0 // is the ghost phase scatter?

    this.sprite = null
    switch (this.type){
      case 0:
        this.sprite = sprites.blinky
        break
      case 1:
        this.sprite = sprites.pinky
        break
      case 2:
        this.sprite = sprites.inky
        break
      case 3:
        this.sprite = sprites.clyde
        break
    }
	}
	exitPen(){ //exiting the ghost pen
		this.pen = false //im not in the pen anymore
		this.pos = createVector(penLoc[0],penLoc[1]) //position correctly
		this.exit = true //I am exiting
	}
	exiting(){ //ghosts mid exit
		if (this.pos.y > penLoc[1]-3){ //am I out of the pen yet?
			this.pos.y -= gameSpeed //move up if not
		}else{ //if I am clear of the pen
			this.pos.y = penLoc[1]-3 //The game doesn't like it if I don't make sure the ghost is exactly on y=11
			this.exit = false //no longer exiting.
		}
	}
	setHuntTarget(){ //set target for chasing pacman
		switch (this.type){ //get target
			case 0:
				//blinky
				this.target = p.pos.copy() //target pacman
			break
			case 1: //pinky
				this.target = p.pos.copy().add(directionVectors[p.dir].copy().mult(4)) //target ahead of pacman.
				if (p.dir == 1){ //if pacman is looking up
					this.target = p.pos.copy().add(createVector(-4,-4)) //replicate the bug from the original game where it targets the wrong square
				}
			break
			case 2: //inky
				let pacTarg = p.pos.copy().add(directionVectors[p.dir].copy().mult(4))
				//target ahead of pacman
				let blinky = p //if blinky for some reason doesn't exist use pacman
				for (let i of ghosts){ //get blinky
					if (i.type == 0){blinky = i; break}
				}
				this.target = blinky.pos.copy().add(createVector(pacTarg.x-blinky.pos.x,blinky.pos.y-pacTarg.y).mult(2)) //target ahead of pacman and blinky, the closer blinky is to pacman the closer inky gets
			break
			case 3: //clyde
				this.target = p.pos.copy() //target pacman
				if (p.pos.dist(this.pos) < 8){ //oh no im too close
					this.target = createVector(0,textMap.length) //im gonna run to the bottom left because im the stupidest ghost....
				}
		}
	}
	setEyesTarget(){ //set target for if a ghost is in its eyes state
		this.target = createVector(penLoc[0],penLoc[1]) //target the ghost pen
		// let rounded = this.pos.copy() //round the positional coordinates to avoid bugs with scientific notation with really really small numbers
		// rounded.x = round(rounded.x,2)
		// rounded.y = round(rounded.y,2)
			if (this.pos.dist(this.target) < 1){ //if im near enough to the ghost pen
				this.eyes = false //I am no longer eyes
				this.eaten = true //I am eaten so current power pellet doesn't work on me
				this.exitPen() // run the code for exiting the pen
			}
	}
	setScatterTarget(){ //set target for scatter mode
		this.target = createVector(this.type == 0 || this.type == 2 ? 100 : 0, this.type == 1 || this.type == 3 ? 100 : 0) //target the corners of the maze based on what ghost this is
	}
	update(){ //mainloop of ghost behavior
		if (this.exit){ //am I exiting the pen?
			this.exiting()
			return null
		}
		let otherExit = false //is another ghost exiting?
		for (let i of ghosts){ //loop through ghosts
			if (i == this){continue} //dont count me
			if (i.exit == true){otherExit = true; break} //another ghost is exiting
		}
		if (this.pen){// am I in the pen?
			switch (this.type){ // go through the ghosts
				case 1: //pinky exits at 310 dots remaining
					if (dots.length <= 310 && !otherExit){this.exitPen()}
				break
				case 2: //inky exits at 190
					if (dots.length <= 190 && !otherExit){this.exitPen()}
				break
				case 3: //clyde exits at 106
					if (dots.length <= 106 && !otherExit){this.exitPen()}
				break
			} //blinky = skipped because he spawns outside the pen
			return null
		}
		if (ticks % 10 == 0){ //skip this unless this is the 10th tick for better performance.
			if (this.eyes == false && this.scatter <= 0){ //am I not eyes and not scattering
				this.setHuntTarget() //hunt pacman
			}else if (this.eyes){ //if im eyes
				this.setEyesTarget() //go to pen
			}else{ //otherwise I must be in scatter mode
				this.scatter-- //decrease scatter time
				this.setScatterTarget() //scatter
			}
			if (fright > 0 && !this.eyes){ //if im in fright mode and not not eyes
				this.target = createVector(Math.random()*25,Math.random()*30) //go random direction because oooo powered up pacman scary!
			}
		}
		
		for (let i of inters){ //loop through interestions
			if (i == this.lastUsed){continue} //don't use the intersection i just arrived from.
			if (this.pos.dist(i.pos) < gameSpeed){ //am I touching the intersection
				let validDirections = [] //get valid directions to move
				for (let h=0;h<4;h++){ //loop 4 times for each direction
					if (h == (this.dir+2)%4){continue} //can't go backwards
					var valid = true //valid by default
					var cv = i.pos.copy().add(createVector(0.5,0.5)).add(directionVectors[h]) //set up position for collision checking ahead of time
					for (let w of walls){ //loop walls
            if (this.eyes && w instanceof penGate){
              continue
            }
						if (	collidePointRect(cv.x,cv.y,w.pos.x,w.pos.y,1,1)){ //if I would be inside a wall than this direction is no longer valid.
							valid = false
							break //no need to keep looping if I already know I cant move
						}
					}
					if (valid){validDirections.push(h)} //if valid add to valid directions
				}
				let shortest = 0 //which direction is the "shortest" path
				let shortestInter = null //get intersection connected to the shortest direction
				for (let c=0;c<Object.keys(i.connected).length;c++){ //loop connected intersections
					let direction = Object.keys(i.connected)[c]
					direction = parseInt(direction) //get direction of intersection
					let inter = inters[inters.indexOf(i.connected[direction])] //get intersection object 
					if (!validDirections.includes(direction)){continue} //if this isn't a valid direction, skip this intersection
					if (shortestInter == null){shortestInter = inter; shortest = direction; continue} //set this to the shortest intersection if there isn't one
					else{
						try{
						if (inter.pos.dist(this.target) < shortestInter.pos.dist(this.target)){ //if this connected intersection is closer to pacman than the current shortest than this is the shortest
							shortestInter = inter
							shortest = direction
						}
						}catch(e){
						}
					}
				}
				this.dir = shortest //set the ghosts direction to the shortest dir
				this.lastUsed = i //set last use intersection
				this.pos = i.pos.copy() //make sure ghost is aligned perfectly
			}
		}
		this.pos.add(directionVectors[this.dir].copy().mult(gameSpeed/((fright>0 && this.eaten == false && this.eyes == false)+1))) // move forward and at half speed if frightened.
		if (this.pos.x > textMap[0].length+1){this.pos.x = -1} //wrap the screen
		if (this.pos.x < -1) {this.pos.x = textMap[0].length+1} //wrap the screen
	}
	show(){ //display
		let disp = dispCoords(this.pos,true) //get display coordinates
    
    if (useSprites){
      if ((fright <= 0 || this.eaten == true) && !this.eyes){
        image(this.sprite[this.dir*2 + (ticks % 30 < 15 ? 1 : 0)],disp.x,disp.y,CELL*2,CELL*2)
      } else if (fright > 0 && !this.eaten && !this.eyes){
        image(sprites.fright[ticks % 60 <= 30 && fright <= 180 ? 2 : 0 + ticks % 30 < 15 ? 1 : 0],disp.x,disp.y,CELL*2,CELL*2)
      }else if (this.eyes){
        image(sprites.eyes[this.dir],disp.x,disp.y,CELL*2,CELL*2)
      }
      
      return //dont do the rest
    }
    
		if (!this.eyes && (fright <= 0 || this.eaten)){ // if not frightened or eyes
			switch (this.type){ //display color based on ghost
				case 0: //blinky: red
					fill(0xff,0,0)
				break
				case 1: //pinky: pink
					fill(0xff,0xc0,0xcb)
				break
				case 2: //blinky: bright cyan
					fill(0x0,0xff,0xff)
				break
				case 3: //clyde: orange
					fill(0xff,0xa5,0x00)
				break
			}
		}else if (this.eyes){ //if eyes be gray and transparent
			fill(0xaa,0xaa,0xaa,128)
		}else if (fright >= 0){ //or be blue and flash white toward the end of the power pellet
			fill(0x0,0x0,0xaa)
			if (fright <= 180 && ticks % 60 < 30){
				fill(0xff)
			}
		}
		noStroke() //no lines needed
		circle(disp.x,disp.y,CELL*1.5) //draw a circle representing the ghost
		if (debug){ //if debug enabled
			circle((anchor+this.target.x+0.5)*CELL,(this.target.y+0.5)*CELL,CELL*1.5) //draw circle representing the target location.
		}
	}
}