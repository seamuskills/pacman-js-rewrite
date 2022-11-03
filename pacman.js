class player{ //defining the player
	constructor(x,y){
		this.pos = createVector(x,y) //position
		this.dir = 0 //direction of movement
		this.dirWanted = 0 //direction the player wants to go next
		this.dead = false //am I dead?
		this.deadTicks = 0 //how long have I been dead?
    this.animDir = 1
    this.anim = 0
	}
	update(){ //update loop
		for (let i=0;i<4;i++){ //detect what the player wants to do next
			let keys = Object.keys(directions)
			if (input.includes(keys[i])){
				this.dirWanted = directions[keys[i]]
			}
		}
		if (this.dirWanted != this.dir){ //make sure we arent already going that direction
			if (this.dirWanted == (this.dir + 2)%4){ //pacman is always permitted to reverse direction
				this.dir = this.dirWanted
			}else if (this.dirWanted != this.dir){
				for (let i of inters){ //loop intersections
					if (i.pos.dist(this.pos) < gameSpeed*2){ //if im on an itersection
						var valid = true //valid direction by default
						var cv = i.pos.copy().add(createVector(0.5,0.5)).add(directionVectors[this.dirWanted]) //casted collision point
						for (let w of walls){
							if (	collidePointRect(cv.x,cv.y,w.pos.x,w.pos.y,1,1)){ //if im in a wall
								valid = false //not valid direction
								break
							}
						}
						if (valid){
							this.dir = this.dirWanted
							this.pos = i.pos.copy()
						} //if valid go that direction
						break
					}
				}
			}
		}
		let cast = directionVectors[this.dir].copy().mult(gameSpeed) //cast collisions going in the current direction
		let move = true //I will move by default
		for (let w of walls){ //loop through walls
			if (collideRectRect(this.pos.x+0.1+cast.x,this.pos.y+0.1+cast.y,0.8,0.8,w.pos.x,w.pos.y,1,1)){ //if im in a wall
				let smallCast = cast.copy().div(gameSpeed).mult(0.1) //cast over smaller distance
				while (!collideRectRect(this.pos.x+0.1+smallCast.x,this.pos.y+0.1+smallCast.y,0.8,0.8,w.pos.x,w.pos.y,1,1)){ //while im not just barely touching the wall
					this.pos.add(smallCast) //add smaller cast to my current position
				}
				move = false //I will no longer move
			}
		}
		if (move){ //If I should move
			this.pos.add(cast) //move by cast
		}
		if (this.pos.x > textMap[0].length+1){this.pos.x = -1} //screenwrap
		if (this.pos.x < -1) {this.pos.x = textMap[0].length+1}

		for (let i of dots){ //loop dots
			if (i.pos.dist(this.pos.copy().add(createVector(0.5,0.5))) < 0.5){ //check if inside dot
				if (i instanceof powerPellet){ //if its a power pellet
					fright = 600 - (10*level) //apply fright decreased by level 
					score += dotScore * 5
					for (let g of ghosts){ //loop ghosts
						g.eaten = false //make them not eaten
						frightScore = 200 //reset fright score
					}
				}else{
					new dispText(`${dotScore}`,this.pos.x,this.pos.y,500,0.3)
				}
				dots.splice(dots.indexOf(i),1) //remove eaten dot
				score += dotScore //add to score
				dotsToRamp--
				if (dotsToRamp <= 0 && dotScore < 100){
					dotsToRamp = 10
					dotScore += 10
				}
				break
			}
		}
		for (let i of ghosts){ //loop ghosts
			let roundedPac = createVector(round(this.pos.x),round(this.pos.y)) //round pac position
			let roundedGhost = createVector(round(i.pos.x),round(i.pos.y)) //round ghost position
			let col = roundedGhost.dist(roundedPac) < 0.1
      if (useModulo == false){
        col = collideRectRect(this.pos.x,this.pos.y,1,1,i.pos.x,i.pos.y,1,1)
      }
      if (roundedGhost.dist(roundedPac) < 0.1){ //are they in the same tile?
				if (fright > 0 && i.eyes == false && i.eaten == false){ //if they are frightened and not eyes or eaten
					stopped = true //stop game
					setTimeout(() => {stopped = false},500) //unstop game after 500 ms
					i.eyes = true //they are now eyes
					new dispText(String(frightScore),this.pos.x,this.pos.y) //display score attained
					score += frightScore //add to score
					frightScore *= 2 //double fright score
          ghostsRamp--
					if (speedRamp == 1 && ghostsRamp <= 0){
						gameSpeed = min(round(gameSpeed + speedIncreaseAmount,3),0.2)
            ghostsRamp = 4
					}
				}else if (i.eyes == false){ //if they are not eyes
					this.dead = true //we are dead now X(
					this.deadTicks = 0 //I have not been dead for long...
					stopped = true //stop game
					ghosts = [] //no ghosts anymore
				}
			}
		}
	}
	die(){ // gameloop for dead pacman
		this.deadTicks++ //increase dead ticks
		if (this.deadTicks > 180){ //have I been dead for a minimum of 2 seconds
			if (livesEnabled == true){lives--} //subtract a life
      if (speedRamp > 0){gameSpeed = max(round(gameSpeed - speedIncreaseAmount,3),0.1)}
			dotScore = max(dotScore - 10, 10)
      dotsToRamp = 10
      reset(lives < 1) //reset (only full reset if 0 lives left)
			intro = true //we are in the intro again
		}
	}
	show(){ //display event
    let anim = 0.1+abs(33*sin(ticks*10)) //smooootthhhh animation number that goes back and forth
    let disp = dispCoords(this.pos,true) //get display coords
    
    if (useSprites){
      if (this.dead){
        anim = max(((this.deadTicks-60) / 120),0) * 10
        image(sprites.pacdeath[round(anim)],disp.x,disp.y,CELL*2,CELL*2)
      }else{
        this.anim += ticks % 5 == 0 ? this.animDir : 0
        if (ticks % 5 == 0){this.animDir *= this.anim == 0 || this.anim == 2 ? -1 : 1}
        let directionMod = (this.dir * 2)+1
        let sprite = sprites.pacwalk[this.anim == 0 ? 0 : directionMod + this.anim-1]
        image(sprite,disp.x, disp.y,CELL*2,CELL*2)
      }
      return
    }
    
		noStroke() //no line needed
		fill(0xff,0xff,0) //fill full yellow
		let rot = this.dir*-90 //turn direction into rotation
    
		if (this.dead){anim = min(179,max((this.deadTicks-60)*2,1))} //if im dead make it keep going up instead
		arc(disp.x,disp.y,CELL*1.5,CELL*1.5,anim+rot,(anim*-1)+rot) //using an arc to represent pacman
		fill(0) // fill black
		rect((anchor+textMap[0].length)*CELL,0,CELL*3,textMap.length*CELL)//blacken the sides of the map so it looks better when using warp tunnels.
		rect((anchor-2)*CELL,0,CELL*2,textMap.length*CELL)

		for (let i=0;i<lives;i++){
			fill(0xff,0xff,0)
			circle((anchor+i+0.5)*CELL,(textMap.length+0.5)*CELL,CELL)
		}
	}
}