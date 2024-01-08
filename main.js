import './style.css'
import Phaser from 'phaser'

const sizes={
  width:500,
  height:500
}

const speedDown = 444;

const gameStartDiv = document.querySelector("#gameStart");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEnd");
const gameResultSpan = document.querySelector("#gameResultSpan");
const gameEndScoreSpan = document.querySelector("#endScoreSpan");






class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 64;
    this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timeEvent;
    this.remainingTime;
    this.cashSound;
    this.bgMusic;
  }

  preload(){
    this.load.image("bg", "/assets/blueBg.png");
    this.load.image("euro", "/assets/euroTarget.png");
    this.load.spritesheet("board","/assets/boardSprite.png", {frameWidth: 72, frameHeight: 250});
    this.load.audio("cash", "/assets/cash.mp3");
    this.load.audio("bgMusic","/assets/bgMusic.mp3");
  }


  create(){
    this.scene.pause("scene-game");

    this.cashSound = this.sound.add("cash");
    this.bgMusic = this.sound.add("bgMusic");
    this.bgMusic.play();

    //Základní nastavení - pozadí a sprite "postavy" hráče
    this.add.image(0,0,"bg").setOrigin(0,0);
    this.player = this.physics.add.sprite(0, sizes.height - 125 ,"board").setOrigin(0,0);

    this.player.setImmovable(true);
    this.player.body.allowGravity = false;

    this.anims.create({
      key: 'default',
      frames: this.anims.generateFrameNumbers('board', {start: 0, end: 2}),
      frameRate: 14,
      repeat: -1
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('board', {start: 3, end:5}),
      frameRate: 14,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('board', {start: 6, end: 8}),
      frameRate: 14,
      repeat: -1
    });
    //this.player.setCollideWorldBounds(true);  alternativní verze hry, kdy nelze opustit "vlnu"

    this.target = this.physics.add.image(0,0,"euro").setOrigin(0.0);
    this.target.setMaxVelocity(0, speedDown);


    //Nastavení těla "hráče" tak, aby kolize dávala smysl - defakto aby na předměty reagovala pouze přední část prkna
    this.player.setSize(this.player.width-this.player.width/8, this.player.height/3)
    .setOffset(this.player.width/17, this.player.height/10 - this.player.height/35);
    //Nastavení kolize
    this.physics.add.overlap(this.target,this.player, this.tarHit, null, this );
    

    this.cursor=this.input.keyboard.createCursorKeys();


    //Přidání zobrazení score a zbývajícího času
    this.textScore = this.add.text(sizes.width - 145, 10, "Skóre: 0 €", {
      font: "20px Arial",
      fill: "#000000"
    });
    this.textTime = this.add.text(10, 10, "Zbývající čas: 0", {
      font: "20px Arial",
      fill: "#000000"
    });

    this.timeEvent = this.time.delayedCall(30000, this.gameOver, [], this)

  }


  update(){
    //nastavíme, aby se aktualizoval zbývající čas
    this.remainingTime = this.timeEvent.getRemainingSeconds();
    this.textTime.setText(`Zbývající čas: ${Math.round(this.remainingTime).toString()}`);

    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }

    
    const { left, right } = this.cursor;

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.anims.play('left', true);
    }
    else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.anims.play('right', true);
    }
    else {
      this.player.setVelocityX(0);
      this.player.anims.play('default', true);
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * 470);
  }

  tarHit() {
    this.cashSound.play();
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points * 100} €`);
  }

  gameOver(){
    this.sys.game.destroy(true);
    if(this.points >= 10){
      gameEndScoreSpan.textContent = this.points * 100;
      gameResultSpan.textContent = "You WIN!";
    }
    else {
      gameEndScoreSpan.textContent = this.points * 100;
      gameResultSpan.textContent = "Try harder"
    }
  }

}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics:{
    default: "arcade",
    arcade: {
      gravity:{y:speedDown},
      debug:true
    }
  },
  scene:[GameScene]
}

const game = new Phaser.Game(config)

gameStartBtn.addEventListener("click", ()=>{
  gameStartDiv.style.display="none"
  game.scene.resume("scene-game")
})