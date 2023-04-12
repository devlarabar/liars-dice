/*----------------------------------------
declare variables for gui
----------------------------------------*/
const rollBtn = document.querySelector('#rollDice')
const playerOneBidBtn = document.querySelector('#p1PlaceBid')
const callLiarBtn = document.querySelector('#callLiarBtn')
const nextTurn = document.querySelector('#nextTurn')
const showDice = document.querySelector('#showDice')

const movesList = document.querySelector('#movesList')

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
                    movesList.appendChild(li)
                    li.scrollIntoView({behavior: "smooth"})
                    li.classList.add('li', 'movesListAppend')
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
        movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
        li.classList.add('li', 'movesListAppend')
    },

    liarEvent() {
        console.log("--liarEvent()-- It's time to show your dice!")
    
        playerOneBidBtn.disabled = true
        callLiarBtn.disabled = true
        nextTurn.disabled = true
        showDice.disabled = false
    
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
            console.log(`--liarEvent()-- ${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice.`)
            
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
                // game.loseEvent()
            }
            //if playerOne wins
            if (game.players[0].playerID == 1 && game.players.length == 1) {
                console.log(`${game.players[0].name} wins!`)
                game.winnerEvent()
            }
        }
    
        showDice.disabled = true
        rollBtn.disabled = false
    },

    liarDiceDisplay() {
        let liDice = document.createElement('li')
        document.querySelector('#movesList').appendChild(liDice)
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

    //input validation
    if (game.currentDice[0] == undefined) {
        console.error('Please roll the dice before placing a bid.')
    } else if (bid[0] == '' || bid[1] == '') {
        console.error('Please verify that all bid entries are filled.')
    } else if (bid[1] > game.players.length*5 || bid[1] < 0) {
        console.error(`'Amount' bid must be between 0 and the total number of dice in the game (${game.numDice}). 'Amount' bid was ${bid[1]}.`)
    } else if (bid[0] > 6 || bid[0] < 1) {
        console.error(`'Face' bid must be between 1 and 6. 'Face' bid was ${bid[0]}.`)
    } else if (bid[1] <= game.lastBid[1] && bid[0] <= game.lastBid[0]) {
        console.error(`Either 'Amount' or 'Face' bid must be greater than the last bid. Neither can be lower than the last bid. The bid placed was ${bid[1]} of face ${bid[0]}. The last valid bid was ${game.lastBid[1]} of face ${game.lastBid[0]}`)
    } else if (bid[0] < game.lastBid[0] || bid[1] < game.lastBid[1]) {
        console.error(`Neither can be lower than the last bid. The bid placed was ${bid[1]} of face ${bid[0]}. The last valid bid was ${game.lastBid[1]} of face ${game.lastBid[0]}`)
    } else if (game.currentPlayer != 0 && game.currentPlayer != '' && game.currentPlayer != game.players.length-1) {
        console.error(`It is ${game.players[game.currentPlayer].name}'s turn to play.`)
    }
    //update lastBid
    else {
        game.lastBid = bid

        game.currentPlayer = bid[2]

        console.log(`${this.name} has bid: ${bid[1]} of face ${bid[0]}`) // verify functionality
        console.log(game.lastBid) // verify functionality; check if the game object is updating

        //insert into DOM
        this.movesListAppend()

        //run liar function
        liar.liar()

        //disable bid button for playerOne after their turn
        playerOneBidBtn.disabled = true
    }
}

/*----------------------------------------
bot bid
----------------------------------------*/
Player.prototype.botBid = function() { 

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
    movesList.appendChild(li)

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
                playerOneBidBtn.disabled = false
                callLiarBtn.disabled = false
            } 
        }
    },

    winnerEvent() {
        let li = document.createElement('li')
        li.innerHTML = `${game.players[0].name} wins!`
        li.setAttribute('class', 'winner')
        movesList.appendChild(li)
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

        rollBtn.disabled = true

        this.rollDiceMessage()

        //it gave me a bug without this (said not my turn), will fix this later
        game.currentPlayer = 0

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
        

        // if (!game.lastBid || game.lastRoundWinner == 0) {
            playerOneBidBtn.disabled = false
            nextTurn.disabled = false
        // } else {
        //     game.nextTurn()
        // }
    },

    rollDiceMessage() {
        let li = document.createElement('li')
        li.setAttribute('class', 'rollDiceMessage')
        li.innerHTML = 'All dice have been rolled; a new round begins.'
        movesList.appendChild(li)
        li.scrollIntoView({behavior: "smooth"})
    },

    diceCountDisplay(liarStatus) {
        let lastBidder = game.players[game.lastBid[2]]

        if (liarStatus == true) {
            let li = document.createElement('li')
            li.setAttribute('class', 'liarEvent')
            movesList.appendChild(li)

            if (lastBidder.numDice >= 1) {
                console.log(`--liarEvent()-- ${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice.`)
                li.innerHTML = `${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice.`
            } else {
                console.log(`--liarEvent()-- ${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game.`)
                li.innerHTML = `${lastBidder.name} was a liar! They lose a die; they now have ${lastBidder.numDice} dice, and are out of the game.`
                lastBidder.hasDice = false
                //remove player from the game if they've lost all their dice
                game.players.splice(game.players.indexOf(lastBidder), 1)
            }

            li.scrollIntoView({behavior: "smooth"})
            li.classList.add('li', 'movesListAppend')
        } 
        
        else {
            let li = document.createElement('li')
            li.innerHTML = `${lastBidder.name} was not a liar. They keep their dice, and ${game.players[game.currentPlayer].name} loses a die; they now have ${game.players[game.currentPlayer].numDice} dice`
            li.setAttribute('class', 'liarEvent')
            movesList.appendChild(li)

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
rollBtn.addEventListener('click', dice.rollAllDice.bind(dice))
playerOneBidBtn.addEventListener('click', playerOne.bid.bind(playerOne))
nextTurn.addEventListener('click', game.nextTurn)
callLiarBtn.addEventListener('click', liar.callLiar.bind(liar))
showDice.addEventListener('click', liar.liarShowDice.bind(liar))

/*----------------------------------------
add event listeners for non-game-related things
----------------------------------------*/
//dark mode toggle
darkMode.addEventListener('click', changeMode)
function changeMode() {
    document.body.classList.toggle('darkMode')
}

/* to do:
- functionality to choose how many players (2-5)
- winner of last round goes first after roll
- if game.players.length == 2 && game.currentDice.length == 2, change the game to be the sum of both faces. keep bidding until one calls liar. if the last bid was <= sum, they win.
*/