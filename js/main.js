/*----------------------------------------
declare variables for gui
----------------------------------------*/
const gameBoard = {
    rollBtn: document.querySelector('#rollDice'),
    playerOneBidBtn: document.querySelector('#p1PlaceBid'),
    callLiarBtn: document.querySelector('#callLiarBtn'),
    nextTurnBtn: document.querySelector('#nextTurn'),
    showDiceBtn: document.querySelector('#showDice'),
    movesList: document.querySelector('#movesList'),
    choosePlayersBtns: Array.from(document.querySelectorAll('.choosePlayersBtn')),
    choosePlayersPopup: document.querySelector('.choosePlayersPopup'),
    // playerBoards: [document.querySelector(playerOne.playerBoard), document.querySelector(playerTwo.playerBoard), document.querySelector(playerThree.playerBoard), document.querySelector(playerFour.playerBoard), document.querySelector(playerFive.playerBoard)],

    buttonStatus() {
        //code here
    },

    visiblePlayerBoards() {
        switch(game.players.length) {
            case 2:
                document.querySelector(playerThree.playerBoard).classList.add('hidden')
                document.querySelector(playerFour.playerBoard).classList.add('hidden')
                document.querySelector(playerFive.playerBoard).classList.add('hidden')
                break
            case 3:
                document.querySelector(playerFour.playerBoard).classList.add('hidden')
                document.querySelector(playerFive.playerBoard).classList.add('hidden')
                break
            case 4:
                document.querySelector(playerFive.playerBoard).classList.add('hidden')
        }
    }
}


//non-game-related
const darkMode = document.querySelector('#darkMode')

/*----------------------------------------
create player class
----------------------------------------*/
class Player {
    constructor(playerNum, botOrHuman) {
        this.name = `Player ${playerNum}`
        this.numDice = 5
        this.currentHand = []
        this.playerID = playerNum
        this.playerType = botOrHuman
        this.hasDice = true
        this.playerBoard = `#player${playerNum}Board`
    }
    
    bidStatus() {
        game.diceCounts = game.countDice()
            if (game.lastBid[1] <= game.diceCounts[game.lastBid[0]]) {
                return true
            } else {
                return false
            }
    }
}

/*----------------------------------------
create liar object
----------------------------------------*/

const liar = {
    liar() {
        let rng = Math.ceil(Math.random()*100)
        let lastBidder = game.players[game.lastBid[2]]
        let playerCallingLiar = game.players[game.lastBid[2]+1] //do not change [2]; index would be +1 of their ID bc it's their turn

        game.currentPlayer = Number(game.lastBid[2])
        
        let diceCount = game.countDice()
        let bidDifference = game.lastBid[1] - diceCount[game.lastBid[0]]
        
        console.log(`Liar RNG roll: ${rng}`)
        
        //if the person who's turn it is, is the last person in the players list, the 'playerCallingLiar' would be p1 (you)
        if (playerCallingLiar == undefined) {
            console.log('Will you call them a liar?')
        }

        //if the next person in line to call liar is not you:
        else {
            if (
                lastBidder.bidStatus() && rng <= 5 
                || bidDifference == 1 && rng >= 85 
                || bidDifference == 2 && rng >= 75 
                || bidDifference == 3 && rng >= 65 
                || bidDifference > 3 && rng >= 50
                || bidDifference >= 5 && rng >= 10
                ) {
                    console.log(`${playerCallingLiar.name} has called ${lastBidder.name} a liar! Show your dice!`)
                    game.lastLiarCaller = playerCallingLiar
                    this.liarEvent()

                    //insert into DOM
                    let li = document.createElement('li')
                    li.innerHTML = `${playerCallingLiar.name} has called ${lastBidder.name} a liar! Show your dice!`
                    li.setAttribute('class', 'liarCall')
                    gameBoard.movesList.appendChild(li)
                    li.scrollIntoView({behavior: "smooth"})
                    li.classList.add('li', 'movesListAppend')
                    
                    gameBoard.nextTurnBtn.disabled = true
            }
        }
    },

    callLiar() {
        //get the index of the current player (should be playerOne, but not hard-coding in case I add multi-player)
        if (game.lastBid[2] == game.players.length-1) {
            game.currentPlayer = 0
        } else {
            game.currentPlayer = Number(game.lastBid[2]+1)
        }
        console.log(`${game.players[game.currentPlayer].name} has called ${game.players[game.lastBid[2]].name} a liar!`)
        this.liarEvent()

        //insert into DOM
        let li = document.createElement('li')
        li.innerHTML = `${game.players[game.currentPlayer].name} has called ${game.players[game.lastBid[2]].name} a liar!`
        li.setAttribute('class', 'liarCall')
        gameBoard.movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
        li.classList.add('li', 'movesListAppend')
        
        gameBoard.nextTurnBtn.disabled = true
    },

    liarEvent() {
        console.log("--liarEvent()-- It's time to show your dice!")
    
        gameBoard.playerOneBidBtn.disabled = true
        gameBoard.callLiarBtn.disabled = true
        gameBoard.nextTurnBtn.disabled = true
        gameBoard.showDiceBtn.disabled = false
    
    },

    liarShowDice() {

        this.liarDiceDisplay()
        

        let lastBidder = game.players[game.lastBid[2]]
        let playerBeingAccused = game.players[game.players.indexOf(lastBidder)]

        if (game.lastBid[2] == game.players.length-1) {
            game.currentPlayer = 0
        } else {
            game.currentPlayer = Number(game.lastBid[2] + 1)
        }

        game.lastLiarCaller = game.currentPlayer
    
        //if the last bidder was not a liar
        if (lastBidder.bidStatus()) {
            game.lastRoundWinner = game.lastBid[2]
            game.players[game.currentPlayer].numDice--
            if (game.players[game.currentPlayer].numDice == 0 && game.currentPlayer != 0) {
                console.log(`--liarEvent()-- ${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice, and are out of the game.`)
            } else if (game.players[game.currentPlayer].numDice == 0 && game.currentPlayer == 0){
                console.log(`--liarEvent()-- ${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice. Game over!`)
            } else {
                console.log(`--liarEvent()-- ${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice.`)
            }
            
            dice.diceCountDisplay(false)
            
        } 
        //if the last bidder WAS a liar, they lose a die; if it's their last die, they are removed from the game
        else {
            game.lastRoundWinner = game.currentPlayer
            lastBidder.numDice--

            //insert into DOM (update player dice counts)
            dice.diceCountDisplay(true)
            
            //if playerOne is out of dice
            if (playerBeingAccused.playerID == 1 && playerBeingAccused.hasDice == false) {
                console.log('Game over!')
            }
            //if playerOne wins
            if (game.players[0].playerID == 1 && game.players.length == 1) {
                console.log(`${game.players[0].name} wins!`)
                game.winnerEvent()
            }
        }
    
        gameBoard.showDiceBtn.disabled = true
        gameBoard.nextTurnBtn.disabled = true
        if (game.players[0].numDice != 0) {
            gameBoard.rollBtn.disabled = false
        }
    },

    liarDiceDisplay() {
        let liDice = document.createElement('li')
        gameBoard.movesList.appendChild(liDice)
        liDice.setAttribute('class', 'showAllDiceLi')
        let diceDisplay = document.createElement('ul')
        diceDisplay.setAttribute('class', 'showAllDice flex')
        liDice.appendChild(diceDisplay)

        game.currentDice.forEach(x => {
            let dieImg = dice[`face${x}`]
            let li = document.createElement('li')
            li.innerHTML = `<img src="${dieImg}">`
            diceDisplay.appendChild(li)
        })

        liDice.scrollIntoView({behavior: "smooth"})
    }
}

/*----------------------------------------
player bid
----------------------------------------*/
Player.prototype.bid = function() {  
    
    const bid = [Number(document.querySelector(`#p${this.playerID}BidFace`).value), Number(document.querySelector(`#p${this.playerID}BidAmount`).value), game.players.indexOf(this)]

    //input validation & inserting any errors into movesList/DOM
    let li = document.createElement('li')
    if (game.currentDice[0] == undefined) {
        console.error('Please roll the dice before placing a bid.')
        li.innerHTML = 'Please roll the dice before placing a bid.'
    } else if (bid[0] == '' || bid[1] == '') {
        console.error('Please verify that all bid entries are filled.')
        li.innerHTML = 'Please verify that all bid entries are filled.'
    } else if (bid[1] > game.players.length*5 || bid[1] < 0) {
        console.error(`'Amount' bid must be between 0 and the total number of dice in the game (${game.numDice}). 'Amount' bid was ${bid[1]}.`)
        li.innerHTML = `'Amount' bid must be between 0 and the total number of dice in the game (${game.numDice}). 'Amount' bid was ${bid[1]}.`
    } else if (bid[0] > 6 || bid[0] < 1) {
        console.error(`'Face' bid must be between 1 and 6. 'Face' bid was ${bid[0]}.`)
        li.innerHTML = `'Face' bid must be between 1 and 6. 'Face' bid was ${bid[0]}.`
    } else if (bid[1] <= game.lastBid[1] && bid[0] <= game.lastBid[0]) {
        console.error(`Either 'Amount' or 'Face' bid must be greater than the last bid. The bid placed was ${bid[1]} of face ${bid[0]}. The last valid bid was ${game.lastBid[1]} of face ${game.lastBid[0]}`)
        li.innerHTML = `Either 'Amount' or 'Face' bid must be greater than the last bid. The bid placed was ${bid[1]} of face ${bid[0]}. The last valid bid was ${game.lastBid[1]} of face ${game.lastBid[0]}`
    } else if (game.currentPlayer != 0 && game.currentPlayer != '' && game.currentPlayer != game.players.length-1) {
        console.error(`It is ${game.players[game.currentPlayer].name}'s turn to play.`)
        li.innerHTML = `It is ${game.players[game.currentPlayer].name}'s turn to play.`
    }
    //update lastBid
    else {
        game.lastBid = bid

        game.currentPlayer = bid[2]

        console.log(`${this.name} has bid: ${bid[1]} of face ${bid[0]}`) // verify functionality
        console.log(game.lastBid) // verify functionality; check if the game object is updating

        //clear bid inputs
        document.querySelector(`#p${this.playerID}BidFace`).value = ''
        document.querySelector(`#p${this.playerID}BidAmount`).value = ''

        //insert into DOM
        this.movesListAppend()

        //disable bid button for playerOne after their turn
        gameBoard.playerOneBidBtn.disabled = true
        gameBoard.callLiarBtn.disabled = true
        gameBoard.nextTurnBtn.disabled = false

        //run liar function
        liar.liar()
    }
    li.setAttribute('class', 'bidError')
    gameBoard.movesList.appendChild(li)
    li.scrollIntoView({behavior: "smooth"})
    li.classList.add('li', 'movesListAppend')
}

/*----------------------------------------
bot bid
----------------------------------------*/ //if last bid is falsy, bot needs to make his own new bid
Player.prototype.botBid = function() { 

    if (game.lastBid[0] == undefined) {
        this.botBidNewRound()
    } else {
        this.botBidPlace()
    }
}

Player.prototype.botBidNewRound = function() {
    let rngBidFace = Math.ceil(Math.random()*100) //rng to see how much they'll bit for face
    let rngBidAmt = Math.ceil(Math.random()*100) //rng to see how much they'll bid for amt

    let bidFace
    let bidAmt

    let numDice = game.numDice

    switch(true) {
        case rngBidFace > 97:
            bidFace = 6
            break
        case rngBidFace > 90:
            bidFace = 5
            break
        case rngBidFace > 80:
            bidFace = 4
            break
        case rngBidFace > 70:
            bidFace = 3
            break
        case rngBidFace > 45:
            bidFace = 2
            break
        default:
            bidFace = 1
    }
    switch(true) {
        case rngBidAmt > 97:
            bidAmt = Math.ceil(numDice*0.33)
            break
        case rngBidAmt > 90:
            bidAmt = Math.ceil(numDice*0.15)
            break
        case rngBidAmt > 80:
            bidAmt = Math.ceil(numDice*0.1)
            break
        case rngBidAmt > 60:
            bidAmt = 2
            break
        default:
            bidAmt = 1
    }

    let botBid = [Number(bidFace), Number(bidAmt), game.players.indexOf(this)]
    game.lastBid = botBid

    //insert into DOM
    this.movesListAppend()

    //run liar function
    liar.liar()

    gameBoard.nextTurnBtn.disabled = false;
    //if the bidder is the last player in the game, re-enable playerOne buttons
    if (game.currentPlayer == game.players.length-1) {
        gameBoard.playerOneBidBtn.disabled = false, gameBoard.nextTurnBtn.disabled = true, gameBoard.callLiarBtn.disabled = false
    } 
}

Player.prototype.botBidPlace = function() {

    if (Number(game.lastBid[0]) == 6 && Number(game.lastBid[1]) == game.numDice) {
        console.log('No more bids can be placed. Call the last bidder a liar, or re-roll all dice.')
    } else {
        let rngBidFace = Math.ceil(Math.random()*100) //rng to see how much they'll raise the face by
        let rngBidAmt = Math.ceil(Math.random()*100) //rng to see how much they'll raise the amt by

        lastBidFace = Number(game.lastBid[0])
        lastBidAmt = Number(game.lastBid[1])

        let bidFace 
        let bidAmt 

        let botBid = []

        let rngWhichBidGoesUp = Math.ceil(Math.random()*100) //flip to see if they'll raise face or amt

        switch(true) {
            case rngWhichBidGoesUp > 94:
                raiseBidFace()
                raiseBidAmt()
                break
            case rngWhichBidGoesUp > 55:
                bidAmt = lastBidAmt
                raiseBidFace()
                break
            default:
                bidFace = lastBidFace
                raiseBidAmt()
        }
        function raiseBidFace() {
            if (lastBidFace < 6) {
                switch(true) {
                    case rngBidFace > 95:
                        bidFace = lastBidFace + 3
                        break
                    case rngBidFace > 80:
                        bidFace = lastBidFace + 2
                        break
                    default:
                        bidFace = lastBidFace + 1
                }
            } else if (lastBidAmt < game.numDice) {
                raiseBidAmt()
                bidFace = lastBidFace
            } else {
                console.log('No more bids can be placed. Call the last bidder a liar, or re-roll all dice.')
            }
        }
        function raiseBidAmt() {
            if (lastBidAmt < game.numDice) {
                switch(true) {
                    case rngBidAmt > 95:
                        bidAmt = lastBidAmt + 3
                        break
                    case rngBidAmt > 80:
                        bidAmt = lastBidAmt + 2
                        break
                    default:
                        bidAmt = lastBidAmt + 1
                }
            } else if (lastBidFace < 6) {
                raiseBidFace()
                bidAmt = lastBidAmt
            } else {
                console.log('No more bids can be placed. Call the last bidder a liar, or re-roll all dice.')
            }
        }

        if (bidFace > 6) {
            bidFace = 6
        }
        if (bidAmt > game.numDice) {
            bidAmt = game.numDice
        }

        botBid = [bidFace, bidAmt, game.players.indexOf(this)]
        console.log(botBid)
        console.log(`Roll for which goes up, bidFace or bidAmt: ${rngWhichBidGoesUp}`)
        console.log(`Roll for bidFace: ${rngBidFace}, Roll for bidAmt: ${rngBidAmt}`)

        game.lastBid = botBid

        game.currentPlayer = botBid[2]

        //insert into DOM
        this.movesListAppend()

        //run liar function
        liar.liar()

        //if the bidder is the last player in the game, re-enable playerOne buttons
        if (game.currentPlayer == game.players.length-1) {
            gameBoard.playerOneBidBtn.disabled = false, gameBoard.nextTurnBtn.disabled = false, gameBoard.callLiarBtn.disabled = false
        } 
    }
}

/*----------------------------------------
insert bids into DOM
----------------------------------------*/

Player.prototype.movesListAppend = function() {

    let faceImg = dice[`face${game.lastBid[0]}fa`]

    let li = document.createElement('li')
    li.innerHTML = `${this.name} has bid: ${game.lastBid[1]} ${faceImg}`
    if (game.lastBid[2] == 0) {
        li.setAttribute('class', 'playerBid')
    } else {
        li.setAttribute('class', 'botBidLi')
    }
    gameBoard.movesList.appendChild(li)

    li.scrollIntoView({behavior: "smooth"})
    li.classList.add('li', 'movesListAppend')

    //update lastBid display on playerBoards
    let lastBidDisplay = document.querySelector(`${this.playerBoard} .lastBid span`)
    lastBidDisplay.innerHTML = `${game.lastBid[1]} ${faceImg}`
    
}

/*----------------------------------------
set players
----------------------------------------*/
const playerOne = new Player('1', 'human')
const playerTwo = new Player('2', 'bot')
const playerThree = new Player('3', 'bot')
const playerFour = new Player('4', 'bot')
const playerFive = new Player('5', 'bot')

/*----------------------------------------
create game object
----------------------------------------*/
const game = {
    players: [playerOne, playerTwo, playerThree, playerFour, playerFive],
    numPlayersChosen: 5,
    lastBid: [],
    currentDice: [],
    diceCounts: {},
    lastLiarCaller: '',
    currentPlayer: '',
    lastRoundWinner: 0,

    listNumPlayers() {
        console.log(this.players.length)
    },

    countDice() {
        const counts = {}
        for (let face of game.currentDice) {
            counts[face] = counts[face] ? counts[face] + 1 : 1;
        }
        return counts
    },

    nextTurn() {
        
        if (game.lastBid[2] == undefined) {
            console.error('You must place a bid before proceeding to the next turn.')
        }
        else {
            let currentPlayer //the person who will bid next 
            if (game.lastBid[2] == game.players.length-1) {
                currentPlayer = 0
                console.log('It is your turn to bid.')
            } else {
                currentPlayer = Number(game.lastBid[2]+1)
                console.log(`It is now ${game.players[currentPlayer].name}'s turn to bid (Index in game.players: ${currentPlayer}).`)
                game.players[currentPlayer].botBid()
            }
            //re-enable bid & callLiar buttons for player one if it's their turn
            if (currentPlayer == 0 || currentPlayer == game.players.length-1) {
                gameBoard.playerOneBidBtn.disabled = false
                gameBoard.callLiarBtn.disabled = false
                gameBoard.nextTurnBtn.disabled = true
            } 
        }
    },

    winnerEvent() {
        let li = document.createElement('li')
        li.innerHTML = `${game.players[0].name} wins!`
        li.setAttribute('class', 'winner')
        gameBoard.movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
        li.classList.add('li', 'movesListAppend')

        let li2 = document.createElement('li')
        li2.innerHTML = `Click <a href="#" id="newGame">here</a> to start a new game.`
        li2.setAttribute('class', 'startNewGame')
        gameBoard.movesList.appendChild(li2)
        li2.scrollIntoView({behavior: "smooth"})
        li2.classList.add('li', 'movesListAppend')
    },

    choosePlayers() {
        console.log(gameBoard.choosePlayersBtns)
        gameBoard.choosePlayersBtns.forEach(x => {
            x.addEventListener('click', () => {
                switch(true) {
                    case x.innerHTML.includes('1'):
                        this.numPlayersChosen = 2
                        break
                    case x.innerHTML.includes('2'):
                        this.numPlayersChosen = 3
                        break
                    case x.innerHTML.includes('3'):
                        this.numPlayersChosen = 4
                        break
                    default: 
                        this.numPlayersChosen = 5
                }
                game.players = game.players.splice(0, this.numPlayersChosen)
                gameBoard.visiblePlayerBoards()
                gameBoard.choosePlayersPopup.classList.add('hidden')
            })
        })
    },

    gameOver() {
        gameBoard.rollBtn.disabled = true
        gameBoard.playerOneBidBtn.disabled = true
        gameBoard.callLiarBtn.disabled = true
        gameBoard.nextTurnBtn.disabled = true
        gameBoard.showDiceBtn.disabled = true
        
        let li = document.createElement('li')
        li.innerHTML = `Click <a href="#" id="newGame">here</a> to start a new game.`
        li.setAttribute('class', 'startNewGame')
        gameBoard.movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
        li.classList.add('li', 'movesListAppend')
    }
}
game.numDice = game.players.length*5

/*----------------------------------------
create dice object
----------------------------------------*/
const dice = {
    faces: 6,
    face1: 'assets/die-1.png',
    face2: 'assets/die-2.png',
    face3: 'assets/die-3.png',
    face4: 'assets/die-4.png',
    face5: 'assets/die-5.png',
    face6: 'assets/die-6.png',
    face1fa: '<i class="fa-solid fa-dice-one"></i>',
    face2fa: '<i class="fa-solid fa-dice-two"></i>',
    face3fa: '<i class="fa-solid fa-dice-three"></i>',
    face4fa: '<i class="fa-solid fa-dice-four"></i>',
    face5fa: '<i class="fa-solid fa-dice-five"></i>',
    face6fa: '<i class="fa-solid fa-dice-six"></i>',
    roll() {
        return Math.ceil(Math.random()*6)
    },
    rollAllDice() {

        gameBoard.rollBtn.disabled = true

        this.rollDiceMessage()

        game.lastBid = []
        game.currentDice = []
        document.querySelector('.p1DiceDisplay').innerHTML = '' //clear playerOne dice display
        game.players.forEach(x => {
            x.currentHand = []
            for (let i = 0; i < x.numDice; i++) {
                let die = dice.roll()
                x.currentHand.push(die)

                //insert dice imgs into DOM for playerOne
                if (x == playerOne) {
                    let dieImg = this[`face${die}`]
                    let li = document.createElement('li')
                    li.innerHTML = `<img src="${dieImg}">`
                    document.querySelector('.p1DiceDisplay').appendChild(li)
                }
            }
            console.log(`${x.name}'s current hand: ${x.currentHand}`) //verify functionality
            game.currentDice.push(...x.currentHand)
        })
        console.log(game.currentDice)//verify functionality
        console.log(game.countDice())//check how many of each dice are currently in the game

        console.log(game.lastBid)
        
        //if the last round winner was not playerOne, start the botBids; if playerOne, let them bid
        if (game.lastRoundWinner != 0) {
            setTimeout(game.players[game.lastRoundWinner].botBid(), 1000)
        } else {
            game.currentPlayer = 0
            gameBoard.playerOneBidBtn.disabled = false
            gameBoard.nextTurnBtn.disabled = true
        }
    },

    rollDiceMessage() {
        let li = document.createElement('li')
        li.setAttribute('class', 'rollDiceMessage')
        li.innerHTML = 'All dice have been rolled; a new round begins.'
        gameBoard.movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
    },

    diceCountDisplay(liarStatus) {
        let lastBidder = game.players[game.lastBid[2]]

        if (liarStatus == true) {
            let li = document.createElement('li')
            li.setAttribute('class', 'liarEvent')
            gameBoard.movesList.appendChild(li)

            if (game.players[game.currentPlayer].numDice < 1 && game.currentPlayer == 0 || game.players[game.lastBid[2]].numDice < 1 && game.players[game.lastBid[2]].playerID == 1) {
                console.log(`--liarEvent()-- ${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game. Game over!`)
                li.innerHTML = `${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game. Game over!`
                
            } else if (lastBidder.numDice >= 1) {
                console.log(`--liarEvent()-- ${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice.`)
                li.innerHTML = `${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice.`
            } 
            else {
                console.log(`--liarEvent()-- ${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game.`)
                li.innerHTML = `${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game.`
                lastBidder.hasDice = false
                //remove player from the game if they've lost all their dice
                game.players.splice(game.players.indexOf(lastBidder), 1)
            }

            li.scrollIntoView({behavior: "smooth"})
            li.classList.add('li', 'movesListAppend')

            if (playerOne.numDice < 1) {
                game.gameOver()
            }
        } 
        
        else {
            //insert into DOM
            let li = document.createElement('li')
            if (game.players[game.currentPlayer].numDice < 1 && game.currentPlayer == 0) {
                li.innerHTML = `${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice, and are out of the game. Game over!`
                li.setAttribute('class', 'liarEvent')
                gameBoard.movesList.appendChild(li)
                game.gameOver()
            }
            else {
                li.innerHTML = `${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice`
                li.setAttribute('class', 'liarEvent')
                gameBoard.movesList.appendChild(li)
            }

            li.scrollIntoView({behavior: "smooth"})
            li.classList.add('li', 'movesListAppend')
        }
        
        //decide which dice count goes down
        let whoLosesDice
        switch(true) {
            case liarStatus:
                whoLosesDice = lastBidder
                break
            case !liarStatus:
                whoLosesDice = game.players[game.currentPlayer]
        }
        let diceRemainingDisplay = document.querySelector(`${whoLosesDice.playerBoard} .diceRemaining span`)
        diceRemainingDisplay.innerHTML = `${whoLosesDice.numDice}`
    }
}

/*----------------------------------------
set player names
----------------------------------------*/
document.querySelector('#submitPlayerOneName').addEventListener('click', setPlayerOneName)
function setPlayerOneName() {
    playerOne.name = document.querySelector('#playerOneName').value
    console.log(`Player One's name has been set to: "${playerOne.name}"`)
}
document.querySelector('#submitPlayerTwoName').addEventListener('click', setPlayerTwoName)
function setPlayerTwoName() {
    playerTwo.name = document.querySelector('#playerTwoName').value
    console.log(`Player Two's name has been set to: "${playerTwo.name}"`)
}

/*----------------------------------------
add event listeners to roll and bid buttons
----------------------------------------*/
gameBoard.rollBtn.addEventListener('click', dice.rollAllDice.bind(dice))
gameBoard.playerOneBidBtn.addEventListener('click', playerOne.bid.bind(playerOne))
gameBoard.nextTurnBtn.addEventListener('click', game.nextTurn)
gameBoard.callLiarBtn.addEventListener('click', liar.callLiar.bind(liar))
gameBoard.showDiceBtn.addEventListener('click', liar.liarShowDice.bind(liar))

/*----------------------------------------
add event listeners for non-game-related things
----------------------------------------*/
//dark mode toggle
darkMode.addEventListener('click', changeMode)
function changeMode() {
    document.body.classList.toggle('darkMode')
}

/*----------------------------------------
on page load, choose players
----------------------------------------*/

game.choosePlayers()
gameBoard.playerOneBidBtn.disabled = true

/* to do:
- if game.players.length == 2 && game.currentDice.length == 2, change the game to be the sum of both faces. keep bidding until one calls liar. if the last bid was <= sum, they win.
- a separate function in game object to see which buttons should be disabled or not
*/