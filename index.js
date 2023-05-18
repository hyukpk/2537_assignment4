let pokemons = [];
let gameLevel;
const PAIR = 2;
let totalClicks;
let totalMatches;
let pairsLeft;
let timer;
let totaltime;
let isProcessing = false;

const setUpMenu = () => {
    $("#menu-buttons").empty();
    $("#menu-buttons").append(`
    <div class="d-flex justify-content-center align-items-center" >
            <button class="btn btn-primary difficultyBtn mx-2" type="submit" value="easy">Easy</button>
            <button class="btn btn-primary difficultyBtn mx-2" type="submit" value="medium">Medium</button>
            <button class="btn btn-primary difficultyBtn mx-2" type="submit" value="hard">Hard</button>

            <button class="btn btn-primary startBtn mx-2" type="submit" value="start">Start</button>
            <button class="btn btn-primary resetBtn mx-2" type="submit" value="reset">reset</button>

        <div class="form-check form-switch mx-2" id="dark-light">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
            <label class="form-check-label" for="flexSwitchCheckDefault">Dark/Light</label>
        </div>
    </div>
    `);
};

const randomPokemon = (pokemons) => {
    return Math.floor(Math.random() * pokemons.length);
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
};

const setUpGameGrid = (gameLevel, pokemons) => {
    $("#game-grid").empty();
    let pairCount;
    if (gameLevel === "easy") {
        pairCount = 3;
        pairsLeft = 3;
        totaltime = 5;
    } else if (gameLevel === "medium") {
        pairCount = 4;
        pairsLeft = 4;
        totaltime = 120;
    } else {
        pairCount = 6;
        pairsLeft = 6;
        totaltime = 130;
    }

    let cards = [];
    for (let i = 0; i < pairCount; i++) {
        let imageID = randomPokemon(pokemons);
        for (let j = 0; j < 2; j++) {
            cards.push(`
                <div class="card">
                <img id="img${imageID}-${j}" class="front_face" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${imageID}.png" alt="pokemon">
                <img class="back_face" src="back.webp" alt="pokeBall">
                </div>
            `);
        }
    }

    cards = shuffleArray(cards); // Shuffle the cards

    cards.forEach((card) => {
        $("#game-grid").append(card); // Add each card to the game grid
    });

    if (gameLevel === "easy") {
        $("#game-grid").css({
            "grid-template-columns": "repeat(3, 1fr)",
            "grid-template-rows": "repeat(2, 1fr)",
            width: "600px",
            height: "400px",
        });
    } else if (gameLevel === "medium") {
        $("#game-grid").css({
            "grid-template-columns": "repeat(3, 1fr)",
            "grid-template-rows": "repeat(3, 1fr)",
            width: "600px",
            height: "600px",
        });
    } else {
        $("#game-grid").css({
            "grid-template-columns": "repeat(4, 1fr)",
            "grid-template-rows": "repeat(3, 1fr)",
            width: "800px",
            height: "600px",
        });
    }
};

// Update the timer display function
function updateTimer() {
    // Select the timer element from the DOM
    const timerElement = document.getElementById("gameTime");
    const matchElement = document.getElementById("totalMatches");
    const pairElement = document.getElementById("pairsLeft");
    const clicksElement = document.getElementById("totalClicks");
    // Increment the time by 1 second
    timer++;

    // Format the time into hours, minutes, and seconds

    if (timer == totaltime) {
        clearInterval(timerInterval);
        clearInterval(flipInterval);
        $("#menu-buttons").empty();
        $("#stats").empty();
        $("#game-grid").empty();
        $("#stats").append(`
        <h1>Out of time</h1>
        <br>
        <button class="btn btn-primary resetBtn" type="submit" value="reset">Try Again</button>
        `);
    } else if (pairsLeft == 0) {
        clearInterval(timerInterval);
        clearInterval(flipInterval);
        alert("You finished the game, congratulations!");
    } else {
        clicksElement.textContent = `Total Clicks: ${totalClicks}`;
        pairElement.textContent = `Number of pairs left: ${pairsLeft}`;
        matchElement.textContent = `Total Matches: ${totalMatches}`;
        timerElement.textContent = `You have ${totaltime} seconds. ${timer} seconds have passed`;
    }
}

const startStats = () => {
    timer = 0;
    totalClicks = 0;
    totalMatches = 0;
    clearInterval(flipInterval);
    $("#stats").empty();
    $("#stats").append(`
        <h2 id="totalClicks"></h2>
        <h2 id="pairsLeft"></h2>
        <h2 id="totalMatches"></h2>
        <h2 id="gameTime"></h2>
    `);
    timerInterval = setInterval(updateTimer, 1000);
};

let firstCard = null; 
let secondCard = null; 
let imageID1a = null;
let imageID1b = null;
let imageID2a = null;
let imageID2b = null;

const handleGameLogic = (event) => {
    if (isProcessing) {
        console.log("access denied");
        return;
    }

    const currentCard = event;
    //   console.log(currentCard)
    const frontFaceImg = $(currentCard).find(".front_face").get(0);
    console.log(frontFaceImg);
    if (!frontFaceImg) {
        console.log("could not find frontFaceImg");
        return; // Return if frontFaceImg is not found
    }

    //   const cardId = frontFaceImg.id;
    //   console.log(cardId)
    // If the clicked card is already matched or the second click on the same card, return
    if ($(currentCard).hasClass("matched") || currentCard === secondCard) {
        return;
    }

    

    if (!firstCard) {
        $(currentCard).toggleClass("flip");
        console.log("first card is clicked");
        // First card clicked
        firstCard = frontFaceImg;
        totalClicks++;
        console.log(firstCard.id);
    } else if (firstCard.id === frontFaceImg.id){
        console.log("should cancel")
        return 
    } else {
        $(currentCard).toggleClass("flip");
        
        console.log("second card is clicked");
        // Second card clicked
        secondCard = frontFaceImg;
        totalClicks++;
        console.log(secondCard.id);

        //grabs the image ID and makes sure it follows the format img(digits)-(digits), and also extrapolates the different digits
        //to be able to fix edge case where if the same image is clicked twice, a match isn't made
        const regex = /img(\d+)-(\d+)/;

        const match1 = firstCard.id.match(regex);
        const match2 = secondCard.id.match(regex);

        if (match1 && match2) {
            imageID1a = match1[1];
            imageID1b = match1[2];
            console.log(imageID1a);
            console.log(imageID1b);
            imageID2a = match2[1];
            imageID2b = match2[2];
            console.log(imageID2a);
            console.log(imageID2b);
        } else {
            console.log("image ID attribute are not following the same format");
        }

        //if the imageID is the same, and it they are different images that form a pair, match the cards
        if (imageID1a === imageID2a && imageID1b !== imageID2b) {
            // Matched cards
            console.log("matched");
            $(firstCard).parent().addClass("matched");
            $(secondCard).parent().addClass("matched");
            firstCard = null;
            secondCard = null;
            imageID1a = null;
            imageID1b = null;
            imageID2a = null;
            imageID2b = null;
            totalMatches++;
            pairsLeft--;
        } else {
            isProcessing = true;
            // Not matched cards, flip them back
            console.log("no match");
            setTimeout(() => {
                $(firstCard).parent().toggleClass("flip");
                $(secondCard).parent().toggleClass("flip");
                firstCard = null;
                secondCard = null;
                imageID1a = null;
                imageID1b = null;
                imageID2a = null;
                imageID2b = null;
                isProcessing = false;
            }, 1000);
        }
    }
};

const changeBackGroundColor = (checked) => {
    if (checked) {
        $("body").css({
            "background-color": "black"
        });
        $("#game-grid").css({
            "background-color": "black"
        });
        $(".card").css({
            "background-color": "black"
        });
        $("#stats").css({
            "color": "white"
        })
        $(".form-check-label").css({
            "color": "white"
        })
    } else {
        $("body").css({
            "background-color": "white"
        });
        $("#game-grid").css({
            "background-color": "white"
        });
        $(".card").css({
            "background-color": "white"
        });
        $("#stats").css({
            "color": "black"
        })
        $(".form-check-label").css({
            "color": "black"
        })
    }
};

let flipInterval;

const flipCards = () => {
    // Grab all cards
    const cards = $(".card");

    // Flip all cards
    cards.toggleClass("flip");

    // After 1 second, unflip all cards
    setTimeout(() => {
        cards.toggleClass("flip");
    }, 1000);

    // Repeat the process every 15 seconds
    flipInterval = setInterval(() => {
        alert("Power Up!");
        cards.toggleClass("flip");
        setTimeout(() => {
            cards.toggleClass("flip");
        }, 1000);
    }, 15000);
};

const setup = async () => {
    setUpMenu();
    const response = await axios.get(
        "https://pokeapi.co/api/v2/pokemon?limit=810&offset=0"
    );
    pokemons = response.data.results;

    $("body").on("click", ".difficultyBtn", function (e) {
        $(".difficultyBtn").removeClass("active");
        $(this).addClass("active");
        gameLevel = e.target.value;
        console.log(gameLevel);
    });

    $("body").on("click", ".startBtn", function (e) {
        setUpGameGrid(gameLevel, pokemons);
        startStats();
        flipCards();
    });

    $("body").on("click", ".resetBtn", function (e) {
        location.reload();
    });

    $("body").on("click", ".card", function (e) {
        handleGameLogic(this);
    });

    $("body").on("click", ".form-check-input", function (e) {
        changeBackGroundColor(e.target.checked);
    });
};

$(document).ready(setup);
