mobile = ('ontouchstart' in document.documentElement)

totalButtons = 0

function createJoyStick(){
    let pad = document.createElement('div')
    pad.style.position = 'fixed'
    pad.style.bottom = '0.5em'
    pad.style.left = '0.5em'
    pad.style.width = '20vw'
    pad.style.height = '20vw'
    pad.style.borderRadius = '100%'
    pad.style.backgroundColor = '#222222'
    pad.id = "joystick"
    document.body.appendChild(pad)

    pad.addEventListener('mousemove', (event) => {
        for (i of ['w', 'a', 's', 'd']){
            try{
                input.splice(input.indexOf(i))
            }catch(e){
            }
        }

        let pos = [event.x, event.y]
        let mid = [pad.clientLeft + pad.clientWidth / 2, pad.offsetTop + pad.clientHeight / 2]
        let xdif = pos[0] - mid[0]
        let ydif = mid[1] - pos[1]

        if (abs(xdif) > abs(ydif)){
            input.push(xdif > 0 ? 'd' : 'a')
        }else{
            input.push(ydif > 0 ? 'w' : 's')
        }
    })
}

function addButton(text, func){
    let butt = document.createElement('button')
    butt.style.position = 'fixed'
    butt.style.right = `0.5em`
    butt.style.bottom = `${10 * totalButtons}vw`
    butt.style.background = '#222222'
    butt.style.color = '#eeeeee'
    butt.textContent = text
    butt.style.width = '10vw'
    butt.style.height = '10vw'
    butt.style.borderRadius = '100%'

    butt.addEventListener('click', func)

    document.body.appendChild(butt)
    totalButtons++
}

if (mobile){
    createJoyStick()
    addButton("pause", () => pause())
    addButton('menu', () => {
        if (gameState == "menu"){
            input.push('Enter')
            setTimeout(() => {
                input.splice(input.indexOf('Enter'), 1)
            }, 50)
        }else {
            pause(true)
            input.push('Backspace')
            setTimeout(() => {
                input.splice(input.indexOf('Backspace'), 1)
            }, 100)
        }
    })
}