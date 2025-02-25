// Gameboard Module (Handles board state)
const Gameboard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;
    const resetBoard = () => board.fill("");

    const placeMarker = (index, marker) => {
        if (board[index] === "") {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const checkWinner = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // Return winner's marker (X or O)
            }
        }

        return board.includes("") ? null : "Tie"; // Return 'Tie' if board is full
    };

    return { getBoard, placeMarker, checkWinner, resetBoard };
})();

// Player Factory Function
const Player = (name, marker) => {
    return { name, marker, score: 0 };
};

// Game Controller (Handles game logic)
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;
    const WIN_LIMIT = 3; // Number of wins to declare final winner

    const startGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name, "X"),
            Player(player2Name, "O")
        ];
        currentPlayerIndex = 0;
        gameActive = true;
        Gameboard.resetBoard();
        DisplayController.renderBoard();
        DisplayController.updateTurnIndicator(`${players[currentPlayerIndex].name}'s turn!`);
        DisplayController.updateScore(players[0].score, players[1].score);
    };

    const handleMove = (index) => {
        if (!gameActive) return;

        if (Gameboard.placeMarker(index, players[currentPlayerIndex].marker)) {
            DisplayController.renderBoard();
            const winner = Gameboard.checkWinner();

            if (winner) {
                gameActive = false;

                if (winner !== "Tie") {
                    players[currentPlayerIndex].score++;
                    DisplayController.updateScore(players[0].score, players[1].score);

                    // Check if player reached the WIN_LIMIT
                    if (players[currentPlayerIndex].score >= WIN_LIMIT) {
                        DisplayController.updateTurnIndicator(`${players[currentPlayerIndex].name} is the FINAL WINNER! 🏆`);
                        setTimeout(() => {
                            resetGame();
                        }, 3000);
                        return;
                    }
                }

                DisplayController.updateTurnIndicator(
                    winner === "Tie" ? "It's a Tie!" : `${players[currentPlayerIndex].name} Wins this round!`
                );
            } else {
                currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
                DisplayController.updateTurnIndicator(`${players[currentPlayerIndex].name}'s turn!`);
            }
        }
    };

    const resetGame = () => {
        gameActive = false;
        players.forEach(player => player.score = 0);
        DisplayController.updateScore(0, 0);
        DisplayController.updateTurnIndicator("Enter names and press Start!");
        Gameboard.resetBoard();
        DisplayController.renderBoard();
    };

    const restartRound = () => {
        if (players[0].score >= WIN_LIMIT || players[1].score >= WIN_LIMIT) return;
        gameActive = true;
        Gameboard.resetBoard();
        DisplayController.renderBoard();
        DisplayController.updateTurnIndicator(`${players[currentPlayerIndex].name}'s turn!`);
    };

    return { startGame, handleMove, restartRound, resetGame };
})();

// Display Controller (Handles UI updates)
const DisplayController = (() => {
    const boardElement = document.querySelector(".gameboard");
    const turnIndicatorElement = document.getElementById("turn-indicator");
    const scoreElement = document.getElementById("score");
    const startButton = document.getElementById("start-btn");
    const restartButton = document.getElementById("restart-btn");

    const renderBoard = () => {
        boardElement.innerHTML = "";
        Gameboard.getBoard().forEach((mark, index) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (mark !== "") {
                cell.classList.add("taken");
                cell.textContent = mark;
            }
            cell.addEventListener("click", () => GameController.handleMove(index));
            boardElement.appendChild(cell);
        });
    };

    const updateTurnIndicator = (message) => {
        turnIndicatorElement.textContent = message;
    };

    const updateScore = (score1, score2) => {
        scoreElement.textContent = `Score - Player 1: ${score1} | Player 2: ${score2}`;
    };

    startButton.addEventListener("click", () => {
        const player1 = document.getElementById("player1").value || "Player 1";
        const player2 = document.getElementById("player2").value || "Player 2";
        GameController.startGame(player1, player2);
    });

    restartButton.addEventListener("click", GameController.restartRound);

    return { renderBoard, updateTurnIndicator, updateScore };
})();

// Initialize the game board on page load
DisplayController.renderBoard();
d