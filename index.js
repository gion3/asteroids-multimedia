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
        this.isInvulnerable = false
        this.opacity = 1
    }
    draw(){
        //rotirea jucatorului
        ctx.save()

        ctx.globalAlpha = this.opacity 

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

        ctx.globalAlpha = 1
        
    }
    update(){
        this.draw()
        this.position.x += this.vel.x
        this.position.y += this.vel.y
    }
    // functie ce ne returneaza un array cu varfurile triunghiului jucatorului
    getTrianglePoints(){
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
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
        //desenam asteroidul
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
        //scadem nivelul asteroidului la fiecare hit
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

//constante pentru modificarea optiunilor jocului
const PLAYER_ROTATION_SPEED = 3
const PLAYER_MOVE_SPEED = 2
const PROJECTILE_SPEED = 3
const ASTEROID_FREQ = 0.5
const ASTEROID_MAX_SPEED = 1
const ASTEROID_MIN_SPEED = 0.4
const SCORE_TO_LIFE = 100
const ASTEROID_SCORE = 10

const asteroids = []
const projectiles = []

//variabile aferente jocului
let lives = 3
let gameOver = false
let animationId
let isInvulnerable = false
let score = 0

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

//coliziune intre 2 asteroizi
function circleCollision(c1,c2){
    const xDif = c2.position.x - c1.position.x
    const yDif = c2.position.y - c1.position.y

    const dist = Math.sqrt(xDif * xDif + yDif * yDif)

    if (dist <= c1.rad + c2.rad){
        return true
    }
    return false
}

function circleTriangleCollision(circle, triangle) {
    // verificare coliziune intre cerc(asteroid) si triunghi (player)
    for (let i = 0; i < 3; i++) {
      let start = triangle[i]
      let end = triangle[(i + 1) % 3]
  
      let dx = end.x - start.x
      let dy = end.y - start.y
      let length = Math.sqrt(dx * dx + dy * dy)
  
      let dot =
        ((circle.position.x - start.x) * dx +
          (circle.position.y - start.y) * dy) /
        Math.pow(length, 2)
  
      let closestX = start.x + dot * dx
      let closestY = start.y + dot * dy
  
      if (!isPointOnLineSegment(closestX, closestY, start, end)) {
        closestX = closestX < start.x ? start.x : end.x
        closestY = closestY < start.y ? start.y : end.y
      }
  
      dx = closestX - circle.position.x
      dy = closestY - circle.position.y
  
      let distance = Math.sqrt(dx * dx + dy * dy)
  
      if (distance <= circle.rad) {
        return true
      }
    }
  
    return false
  }
  
  //functie ce verifica daca un punct apartine unei drepte
  function isPointOnLineSegment(x, y, start, end) {
    return (
      x >= Math.min(start.x, end.x) &&
      x <= Math.max(start.x, end.x) &&
      y >= Math.min(start.y, end.y) &&
      y <= Math.max(start.y, end.y)
    )
  }

function animate(){

    animationId = window.requestAnimationFrame(animate)
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
    ctx.fillText('LIVES: ' + lives, canvas.width / 2, 50)

    //score counter
    ctx.fillStyle = 'white'
    ctx.font = '32px Arial'
    ctx.textAlign = 'middle'
    ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height - 100 )

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

    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            if (circleCollision(asteroids[i], asteroids[j])) {
                // la coliziunile dintre asteroizi schimbam directiile de miscare ale acestora
                [asteroids[i].vel.x, asteroids[j].vel.x] = [asteroids[j].vel.x, asteroids[i].vel.x];
                [asteroids[i].vel.y, asteroids[j].vel.y] = [asteroids[j].vel.y, asteroids[i].vel.y];
            }
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
        //coliziune intre proiectile si asteroizi
        for(let j = projectiles.length -1 ; j>= 0; j--){
            const projectile = projectiles[j]
            if (circleCollision(asteroid,projectile)){
                projectiles.splice(j,1)
                if(asteroid.hit()){
                    score += ASTEROID_SCORE
                    if(score % SCORE_TO_LIFE === 0){
                        lives += 1
                    }
                    asteroids.splice(i,1)
                }
            }
        }
        player.isInvulnerable = isInvulnerable
        //coliziune intre jucator si asteroizi
        if (circleTriangleCollision(asteroid, player.getTrianglePoints())) {

            if(!player.isInvulnerable){
                lives -= 1
                player.position = { x: canvas.width / 2, y: canvas.height / 2 }
                player.vel = { x: 0, y: 0 }
                isInvulnerable = true
                player.opacity = 0.3
                setTimeout(() => {isInvulnerable = false
                    player.opacity = 1
                }, 3000)
            }
            if (lives <= 0 && !gameOver) {
                const name = prompt('Game over! Enter your name: ')
                updateHighScores(name, score)
                gameOver = true
                alert("High Scores:\n" + displayHighScores())
                document.location.reload()
            }
        } 
    }


    //logica miscare jucator
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

//salvam highscore-urile in local storage in format JSON
function updateHighScores(name, score) {
    let highScores = JSON.parse(localStorage.getItem('highScores'))
    highScores.push({ name, score })
    highScores.sort((a, b) => b.score - a.score)
    highScores = highScores.slice(0, 5) //pastram doar primii 5
    localStorage.setItem('highScores', JSON.stringify(highScores))
}

//afisare scoruri
function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) 
    if (highScores.length === 0) {
        return "No high scores yet!"
    }
    // formatam scorurile pentru a le afisa
    return highScores
        .map((entry, index) => `${index + 1}. ${entry.name} - ${entry.score}`)
        .join("\n")
}


window.addEventListener('keydown', (event) =>{
    switch(event.code){
        case 'ArrowUp':
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