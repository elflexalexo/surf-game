import './style.css'
import Phaser from 'phaser'

const sizes={
  width:500,
  height:500
}

const gameTime = 25000;
const speedDown = 344;

const gameStartDiv = document.querySelector("#gameStart");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEnd");
const gameResultSpan = document.querySelector("#gameResultSpan");
const gameEndScoreSpan = document.querySelector("#endScoreSpan");
const inputPlayerNick = document.querySelector("#nameForm");

const backgroundSelect = document.querySelector("#backgroundSelect");
const defaultBg = "./assets/backgrounds/waterReal.png";
var bgSet = false;


function returnBgAddress() {
  // Kód funkce, vybírat pozadí na základě uživatelské volby
  if (backgroundSelect.value !== null) {
    bgSet = true;
    return backgroundSelect.value;
  }
  else {
    bgSet = true;
    return defaultBg;
  }
  
}


//var preloadScene =

class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown - 24;
    this.target;
    this.enemyTarget;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timeEvent;
    this.remainingTime;
    this.cashSound;
    this.bgMusic;
    this.musicBtn;
    this.emitter
  }

  preload(){
    //console.log(returnAddress());
    this.load.image("bg", defaultBg);
    this.load.image("euro", "./assets/euroTarget.png");
    this.load.spritesheet("board","./assets/boardSprite.png", {frameWidth: 72, frameHeight: 250});
    this.load.audio("cash", "./assets/cash.mp3");
    this.load.audio("bgMusic","./assets/bgMusic.mp3");
    this.load.image("shark","./assets/sharkFun.png");
    this.load.audio("bite", "./assets/bite.mp3");
    this.load.image("musicBtn","./assets/musicButton.png");
    this.load.image("money", "./assets/particle2.png");
  }


  create(){
    this.scene.pause("scene-game");

    this.cashSound = this.sound.add("cash");

    this.biteSound = this.sound.add("bite");

    this.bgMusic = this.sound.add("bgMusic");

    
    
    // promenna pro konfiguraci hudby na pozadi
    var musicConfig = {
      mute:true,
      volume: 0.25,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0
    };
    this.bgMusic.play(musicConfig);
    this.musicBtn = this.add.image(180, 10, "musicBtn").setInteractive();
    this.musicBtn.setOrigin(0, 0);
    this.musicBtn.setDepth(1); // Umožní tlačítku být nad ostatními prvky na scéně

    // Přidání funkcionalit tlačítka pro zapnutí/zakázání zvuku
    this.musicBtn.on('pointerdown', this.toggleMusic, this);

    

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
    //this.player.setCollideWorldBounds//alternativní verze hry, kdy nelze opustit "vlnu"

    //nastavení kolidujících penez a zraloku
    this.target = this.physics.add.image(0,0,"euro").setOrigin(0,0);
    this.enemyTarget = this.physics.add.image(120,-200, "shark");
    this.target.setMaxVelocity(0, speedDown);
    this.enemyTarget.setMaxVelocity(0, speedDown - 24);


    //Nastavení těla "hráče" tak, aby kolize dávala smysl - defakto aby na předměty reagovala pouze přední část prkna
    this.player.setSize(this.player.width-this.player.width/8, this.player.height/3)
    .setOffset(this.player.width/17, this.player.height/10 - this.player.height/35);

    //Nastavení kolize s penězmi
    this.physics.add.overlap(this.target, this.player, this.tarHit, null, this );
    this.physics.add.overlap(this.enemyTarget, this.player, this.enemyTarHit, null, this);
    

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

    this.timeEvent = this.time.delayedCall(gameTime, this.gameOver, [], this);

    this.emitter = this.add.particles(0,0,"money",{
      speed:100,
      gravityY:speedDown - 250,
      scale:0.07,
      duration: 100,
      emitting:false
    });
    this.emitter.startFollow(this.player, this.player.width / 1.5, this.player.height / 14, true);

  }


  update(){
    if (bgSet == false) {
      console.log(returnBgAddress);
      //this.load.image("bgEdit", returnBgAddress());
      //this.add.image(0,0, 'bgEdit').setOrigin(0,0);
      bgSet = true;
    }

    //nastavíme, aby se aktualizoval zbývající čas
    this.remainingTime = this.timeEvent.getRemainingSeconds();
    this.textTime.setText(`Zbývající čas: ${Math.round(this.remainingTime).toString()}`);

    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }

    if (this.enemyTarget.y >= sizes.height) {
      this.enemyTarget.setY(-150);
      this.enemyTarget.setX(this.getRandomX());
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
    this.emitter.start();
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points * 100} €`);
  }

  enemyTarHit() {
    this.biteSound.play();
    this.enemyTarget.setY(-200);
    this.enemyTarget.setX(this.getRandomX());
    this.points -= 3;
    this.textScore.setText(`Score: ${this.points * 100} €`);
  }

  storageFunction() {
    let text = "";
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Seřazení výsledků podle skóre (sestupně)
    highScores.sort((a, b) => b.score - a.score);

    // Omezení počtu výsledků na 5 (nebo jakýkoli počet nejlepších výsledků, který chcete zobrazit)
    highScores = highScores.slice(0, 5);
    
    for (let i = 0; i < highScores.length; i++) {
      text += `<p>${i + 1}. ${highScores[i].nickname}: ${highScores[i].score}</p>`;
    }
    return text;
  }

  gameOver(){
    let scorePoints = this.points * 100;
    this.sys.game.destroy(true);
    if(scorePoints >= 1300){
      gameEndScoreSpan.textContent = scorePoints;
      gameResultSpan.textContent = " are really GREAT! You can now buy another surfing trip.";
    }
    else {
      gameEndScoreSpan.textContent = scorePoints;
      gameResultSpan.textContent = "did not do really well. Try harder";
    }

    gameEndDiv.style.display="flex";
    inputPlayerNick.addEventListener("submit", function(event) {
      event.preventDefault(); // Zabrání výchozímu chování formuláře

      let nickname = document.getElementById("userNick").value;

      let resultText = '<p>Top 5 Scores:</p>';

      if (nickname.trim() !== "") {
        // Uložení jména uživatele (např. do LocalStorage)
        /*localStorage.setItem('nickname', nickname);
        alert("Vaše jméno bylo uloženo: " + nickname);  -- not the best way to implement local storage usage*/
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        // Přidání nového výsledku
        let newScore = { nickname: `${nickname}`, score: `${scorePoints}` };
        highScores.push(newScore);

        // Seřazení výsledků podle skóre (sestupně)
        highScores.sort((a, b) => b.score - a.score);

        // Omezení počtu výsledků na 5 (nebo jakýkoli počet nejlepších výsledků, který chcete zobrazit)
        highScores = highScores.slice(0, 5);

        // Uložení aktualizovaných výsledků zpět do LocalStorage
        localStorage.setItem('highScores', JSON.stringify(highScores));

        //Přidání obsahu z localstorage do zobrazovaného výsledku
        for (let i = 0; i < highScores.length; i++) {
          resultText += `<p>${i + 1}. ${highScores[i].nickname}: ${highScores[i].score}</p>`;
        }
      } else {
        alert("Vaše skóre nebude uloženo.");
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        // Seřazení výsledků podle skóre (sestupně)
        highScores.sort((a, b) => b.score - a.score);

        // Omezení počtu výsledků na 5 (nebo jakýkoli počet nejlepších výsledků, který chcete zobrazit)
        highScores = highScores.slice(0, 5);
        
        for (let i = 0; i < highScores.length; i++) {
          resultText += `<p>${i + 1}. ${highScores[i].nickname}: ${highScores[i].score}</p>`;
        }
      }
      //console.log(`${resultText}`);
      resultText += '<br><p><b>refresh the Page to play again</b></p>';

      inputPlayerNick.style.display = "none";
      gameEndDiv.innerHTML += resultText;
      
      

    });
  }

  toggleMusic() {
    if (this.bgMusic.mute) {
        this.bgMusic.setMute(false);
        this.musicBtn.setFrame(0); // Nastavení rámu pro obrázek tlačítka s hudbou zapnutou
    } else {
        this.bgMusic.setMute(true);
        this.musicBtn.setFrame(1); // Nastavení rámu pro obrázek tlačítka s hudbou vypnutou
    }
}

}



//nastavení konfigurace při vytváření nového Phaser objektu "game"
const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics:{
    default: "arcade",
    arcade: {
      gravity:{y:speedDown},
      debug:false
    }
  },
  scene:[GameScene]
}

//vytvoření základního objektu hry
const game = new Phaser.Game(config);

//tlačítko, které spouští hru
gameStartBtn.addEventListener("click", ()=>{
  gameStartDiv.style.display="none";
  game.scene.resume("scene-game");
});

