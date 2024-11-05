/*
TODO:
-asteroid collision
-life counter
-asteroid and ship collision
-scoring system: reaching a certain number of points gains one life
-restart the game after every 'death'
-cam atat...
TBD:
-does a hit restore one ammo or not?

*/


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

class Projectile{
    constructor({position,vel}){
        this.position = position
        this.vel = vel
        this.rad = 5
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x,this.position.y, this.rad, 0, Math.PI * 2,false)
        ctx.closePath()
        ctx.fillStyle = 'white'
        ctx.fill()
    }
    update(){
        this.draw()
        this.position.x += this.vel.x
        this.position.y += this.vel.y
    }
}

class Asteroid{
    constructor({position,vel,rad}){
        this.position = position
        this.vel = vel
        this.rad = rad
        this.setSize()
    }
    setSize(){
        switch(this.rad){
            case 25:
                this.sizeLevel = 1
                this.color = 'yellow'
                break
            case 50:
                this.sizeLevel = 2
                this.color = 'orange'
                break
            case 75:
                this.sizeLevel = 3
                this.color = 'brown'
                break
            case 100:
                this.sizeLevel = 4
                this.color = 'red'
                break
        }
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x,this.position.y, this.rad, 0, Math.PI * 2,false)
        ctx.closePath()
        ctx.strokeStyle = this.color
        ctx.stroke()

        //colorare si fill numar 1-4 in asteroid in functie de dimensiune
        ctx.fillStyle = this.color
        ctx.font = this.rad + 'px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.sizeLevel, this.position.x, this.position.y)

    }
    update(){
        this.draw()
        this.position.x += this.vel.x
        this.position.y += this.vel.y
    }
    hit(){
        if(this.sizeLevel > 1){
            this.sizeLevel -= 1
            this.rad -= 25
            this.setSize()
        }
        else{
            return true
        }
        return false
    }
}

const ast = new Asteroid({
    position: {x:100,y:100},
    vel:{x:0, y:0}
})


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

const PLAYER_ROTATION_SPEED = 3
const PLAYER_MOVE_SPEED = 2
const PROJECTILE_SPEED = 3
const ASTEROID_FREQ = 1
const ASTEROID_MAX_SPEED = 1
const ASTEROID_MIN_SPEED = 0.4

const asteroids = []
const projectiles = []


window.setInterval(() =>{
    const index = Math.floor(Math.random() * 4)
    const sizeArr = [25,50,75,100]
    let x,y
    let vx,vy
    let rad = sizeArr[Math.floor(Math.random() * 4)]
    let speed = Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED) + ASTEROID_MIN_SPEED
    //alegem random din ce parte a ecranului vin asteroizii
    switch(index){
        case 0: //partea stanga a ecranului
            x = 0 - rad
            y = Math.random() * canvas.height
            vx = speed
            vy = 0
            break
        case 1: //partea de jos a ecranului
            x = Math.random() * canvas.width
            y = canvas.height + rad
            vx = 0
            vy = -1 * speed
            break
        case 2: //partea dreapta a ecranului
            x = canvas.width + rad
            y = Math.random() * canvas.height
            vx = -1 * speed
            vy = 0
            break
        case 3: //partea de sus a ecranului
            x = Math.random() * canvas.width
            y = 0 - rad
            vx = 0
            vy = speed
            break
    }

    asteroids.push(new Asteroid({
        position:{
            x:x,
            y:y
        },
        vel:{
            x:vx,
            y:vy
        },
        rad
    }))
}, 1000 / ASTEROID_FREQ)

function circleCollision(c1,c2){
    const xDif = c2.position.x - c1.position.x
    const yDif = c2.position.y - c1.position.y

    const dist = Math.sqrt(xDif * xDif + yDif * yDif)

    if (dist <= c1.rad + c2.rad){
        return true
    }
    return false
}

function animate(){
    window.requestAnimationFrame(animate)
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.update()

    //ammo counter
    ctx.fillStyle = 'white'
    ctx.font = '24px Arial'
    ctx.textAlign = 'right'
    ctx.fillText('AMMO: ' + (3 - projectiles.length), canvas.width - 100, canvas.height - 100)

    //lives counter
    ctx.fillStyle = 'white'
    ctx.font = '24px Arial'
    ctx.textAlign = 'middle'
    ctx.fillText('LIVES: ..........', canvas.width / 2, 50)

    for(let i = projectiles.length -1 ; i>= 0; i--){
        const projectile = projectiles[i]
        projectile.update()
        //stergere proiectile odata ce ies din ecran
        if(projectile.position.x + projectile.rad < 0 ||
            projectile.position.x - projectile.rad > canvas.width ||
            projectile.position.y - projectile.rad > canvas.height ||
            projectile.position.y + projectile.rad < 0
        ){
            projectiles.splice(i, 1)
        }
    }

    for(let i = asteroids.length -1 ; i>= 0; i--){
        const asteroid = asteroids[i]
        asteroid.update()
        //stergere asteroizi odata ce ies din ecran
        if(asteroid.position.x + asteroid.rad < 0 ||
            asteroid.position.x - asteroid.rad > canvas.width ||
            asteroid.position.y - asteroid.rad > canvas.height ||
            asteroid.position.y + asteroid.rad < 0
        ){
            asteroids.splice(i, 1)
        }

        for(let j = projectiles.length -1 ; j>= 0; j--){
            const projectile = projectiles[j]
            if (circleCollision(asteroid,projectile)){
                projectiles.splice(j,1)
                if(asteroid.hit()){
                    asteroids.splice(i,1)
                }
            }
        }
    }

    if(keys.aRight.pressed) {
        player.vel.x = 1 * PLAYER_MOVE_SPEED
    } else if(!keys.aRight.pressed){
        player.vel.x *= 0.99
    }
    if(keys.aLeft.pressed){
        player.vel.x = -1 * PLAYER_MOVE_SPEED
    }
    else if(!keys.aLeft.pressed){
        player.vel.x *= 0.99
    }
    if(keys.aUp.pressed){
        player.vel.y = -1 * PLAYER_MOVE_SPEED
    }
    else if (!keys.aUp.pressed){
        player.vel.y *= 0.99
    }
    if(keys.aDown.pressed) {
        player.vel.y = 1 * PLAYER_MOVE_SPEED
    }
    else if (!keys.aDown.pressed){
        player.vel.y *= 0.99
    }

    if(keys.c.pressed) player.rotation += 0.01 * PLAYER_ROTATION_SPEED
    if(keys.z.pressed) player.rotation -= 0.01 * PLAYER_ROTATION_SPEED

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
            //conditie: maxim 3 rachete simultan
            if(projectiles.length < 3){
                projectiles.push(new Projectile({
                    position: {
                        x : player.position.x + Math.cos(player.rotation) * 30,
                        y : player.position.y + Math.sin(player.rotation) * 30
                    },
                    vel:{
                        x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                        y: Math.sin(player.rotation) * PROJECTILE_SPEED
                    }
                }))
            }
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