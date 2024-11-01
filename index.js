const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = 'black'
ctx.fillRect(0,0,canvas.width,canvas.height)

class Player{
    constructor({position,vel}){
        this.position = position
        this.vel = vel
        this.rotation = 0
    }
    draw(){
        //rotirea jucatorului
        ctx.save()
        ctx.translate(this.position.x,this.position.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x, -this.position.y)
        //desenarea jucatorului in forma de triunghi
        ctx.beginPath()
        ctx.moveTo(this.position.x + 30,this.position.y)
        ctx.lineTo(this.position.x - 10, this.position.y - 10)
        ctx.lineTo(this.position.x - 10, this.position.y + 10)
        ctx.closePath()
        ctx.strokeStyle = 'white'
        ctx.stroke()

        ctx.restore()
    }
    update(){
        this.draw()
        this.position.x += this.vel.x
        this.position.y += this.vel.y
    }
}

const player = new Player({
    position: {x:canvas.width/2,y:canvas.height/2},
    vel: {x:0,y:0},
})
player.draw()

const keys = {
    aUp:{
        pressed: false
    },
    aLeft:{
        pressed: false
    },
    aDown:{
        pressed: false
    },
    aRight:{
        pressed: false
    },
    z:{
        pressed: false
    },
    x:{
        pressed: false
    },
    c:{
        pressed: false
    },
}

const ROTATION_SPEED = 2
const MOVE_SPEED = 1.5

function animate(){
    window.requestAnimationFrame(animate)
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.update()

    // player.vel.x = 0
    // player.vel.y = 0
    if(keys.aRight.pressed) {
        player.vel.x = 1 * MOVE_SPEED
    } else if(!keys.aRight.pressed){
        player.vel.x *= 0.99
    }
    if(keys.aLeft.pressed){
        player.vel.x = -1 * MOVE_SPEED
    }
    else if(!keys.aLeft.pressed){
        player.vel.x *= 0.99
    }
    if(keys.aUp.pressed){
        player.vel.y = -1 * MOVE_SPEED
    }
    else if (!keys.aUp.pressed){
        player.vel.y *= 0.99
    }
    if(keys.aDown.pressed) {
        player.vel.y = 1 * MOVE_SPEED
    }
    else if (!keys.aDown.pressed){
        player.vel.y *= 0.99
    }

    if(keys.c.pressed) player.rotation += 0.01 * ROTATION_SPEED
    if(keys.z.pressed) player.rotation -= 0.01 * ROTATION_SPEED
}
animate()


window.addEventListener('keydown', (event) =>{
    console.log(event)
    switch(event.code){
        case 'ArrowUp':
            console.log('arrow up pressed')
            keys.aUp.pressed = true
            break
        case 'ArrowLeft':
            keys.aLeft.pressed = true
            break
        case 'ArrowRight':
            keys.aRight.pressed = true
            break
        case 'ArrowDown':
            keys.aDown.pressed = true
            break
        case 'KeyZ':
            keys.z.pressed = true
            break
        case 'KeyX':
            keys.x.pressed = true
            break
        case 'KeyC':
            keys.c.pressed = true
            break
    }
})

window.addEventListener('keyup', (event) =>{
    switch(event.code){
        case 'ArrowUp':
            keys.aUp.pressed = false
            break
        case 'ArrowLeft':
            keys.aLeft.pressed = false
            break
        case 'ArrowRight':
            keys.aRight.pressed = false
            break
        case 'ArrowDown':
            keys.aDown.pressed = false
            break
        case 'KeyZ':
            keys.z.pressed = false
            break
        case 'KeyX':
            keys.x.pressed = false
            break
        case 'KeyC':
            keys.c.pressed = false
            break
    }
})