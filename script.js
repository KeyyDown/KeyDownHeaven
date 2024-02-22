const board = document.getElementById("game-board");

const circle = document.createElement("div");
circle.classList.add("circle");
const npc = document.createElement("div");
npc.classList.add("npc");
let npchandler;

let rows;
let cols;
let x = 0;
let y = 0;
let x_npc = 9;
let y_npc = 9;
let score = 0;
let steps = 0;
let coinsInGame = 0;
let coinsPicked = 0;
let gameRunning = false;
let level = 1;
let NPCspeed = 500;
let totaltime = 0;
let totalseconds = totaltime / 1000;


// Function to toggle between light and dark modes


const playButton = document.getElementById("play-button");

playButton.addEventListener("click", startNewGame);
document.addEventListener("keydown", movePlayer);

function startNewGame() {
  level = 0;
  score = 0;
  rows = 9;
  cols = 9;
  NPCspeed = 500;
  totaltime = 0;
  startNewLevel(true);
}

function startNewLevel(firstGame) {
  clearBoard();
  level += 1;
  rows += 1;
  cols += 1;
  if (NPCspeed >= 200) {
    NPCspeed -= 50;
  }
  game_board = generateRandomBoard(rows, cols);
  createBoard();
  posunNPC();
  if (!firstGame) clearInterval(npchandler)
  npchandler = setInterval(posunNPC, NPCspeed)
}

function clearBoard() {
  x = 0;
  y = 0;
  x_npc = 9;
  y_npc = 9;
  coinsInGame = 0;
  coinsPicked = 0;
  game_board = [];
  board.innerHTML = "";
}

// Function to generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to randomly generate the game board
function generateRandomBoard(rows, cols) {
  let board = [];

  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      // Randomly assign values (0, 1, or 2) to each cell
      let randomValue = Math.floor((Math.random() * 10) + 1);
      // row.push(randomValue);
      if (i == 0 && j == 0) row.push(0);
      else if (i == 1 && j == 0) row.push(0);
      else if (i == 0 && j == 1) row.push(0);
      else if (i == 9 && j == 9) row.push(0);
      else if (i == 8 && j == 9) row.push(0);
      else if (i == 9 && j == 8) row.push(0);
      else {
        if (randomValue <= 7) row.push(0);
        if (randomValue > 7 && randomValue <= 8) row.push(1);
        if (randomValue > 8) {
          row.push(2);
          coinsInGame += 1;
        }
      }
    }
    board.push(row);
  }
  return board;
}


function createBoard() {
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");
      row.appendChild(cell);

      if (game_board[i][j] == 1) {
        const square = document.createElement("div");
        square.classList.add("square");
        cell.appendChild(square);
      }
      if (game_board[i][j] == 2) {
        const coin = document.createElement("div");
        coin.classList.add("coin");
        cell.appendChild(coin);
      }
    }
    board.appendChild(row);
  }
  board.rows[y].cells[x].appendChild(circle);
  board.rows[y_npc].cells[x_npc].appendChild(npc);
}

function shortestPathSearch(game_board, y_npc, x_npc, yp, xp) {
  const numRows = game_board.length;
  const numCols = game_board[0].length;

  // Define movement directions (up, down, left, right)
  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  // Create a 2D array to mark visited cells and store parent cells
  const visited = Array(numRows)
    .fill(false)
    .map(() => Array(numCols).fill(false));
  const parent = Array(numRows)
    .fill(null)
    .map(() => Array(numCols).fill(null));

  // Create a queue for BFS
  const queue = [];

  // Push the NPC's position into the queue
  queue.push([y_npc, x_npc]);
  visited[y_npc][x_npc] = true;

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    if (x === yp && y === xp) {
      // Found the player's position, reconstruct the path
      const path = [];
      let curX = yp;
      let curY = xp;
      while (curX !== y_npc || curY !== x_npc) {
        path.push([curX, curY]);
        const [prevX, prevY] = parent[curX][curY];
        curX = prevX;
        curY = prevY;
      }
      path.push([y_npc, x_npc]);
      path.reverse(); // Reverse the path to start from player's position
      return path;
    }

    // Explore adjacent cells
    for (let i = 0; i < 4; i++) {
      const newX = x + dx[i];
      const newY = y + dy[i];

      if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols && game_board[newX][newY] === 0 && !visited[newX][newY]) {
        queue.push([newX, newY]);
        visited[newX][newY] = true;
        parent[newX][newY] = [x, y];
      }
    }
  }

  // If no path is found, return an empty array
  return [];
}



function posunNPC() {
  const shortestPath = shortestPathSearch(game_board, y_npc, x_npc, y, x);

  if (shortestPath.length > 1) {
    const newNPCRow = shortestPath[1][0];
    const newNPCColumn = shortestPath[1][1];
    const newNPCCell = board.rows[newNPCRow].cells[newNPCColumn];
    const oldNPCCell = board.rows[y_npc].cells[x_npc];

    // Remove NPC from the old cell
    oldNPCCell.innerHTML = '';

    // Update NPC's position
    y_npc = newNPCRow;
    x_npc = newNPCColumn;

    // Append NPC to the new cell
    newNPCCell.appendChild(npc);

    checkColision();

    // console.log("New NPC Position:", y_npc, x_npc); // Debugging output
  }
}


function updateScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = score;
}

// function movePlayer(event) {


//   // Check if NPC reached the player's position
//   if (x === x_npc && y === y_npc) {
//     alert("Game Over - NPC caught you!");
//     // Handle game over logic here
//   }
// }

function movePlayer(event) {
  // Existing move player logic
  let newX = x;
  let newY = y;



  switch (event.key) {
    case "ArrowUp":
      if (y > 0) {
        newY = y - 1;
        steps += 1;
      }
      break;
    case "ArrowDown":
      if (y < rows - 1) {
        newY = y + 1;
        steps += 1;
      }
      break;
    case "ArrowLeft":
      if (x > 0) {
        newX = x - 1;
        steps += 1;
      }
      break;

    case "ArrowRight":
      if (x < cols - 1) {
        newX = x + 1;
        steps += 1;
      }
      break;
  }

  if (!board.rows[newY].cells[newX].querySelector(".square")) {
    x = newX;
    y = newY;
  }

  board.rows[y].cells[x].appendChild(circle);

  const coin = board.rows[y].cells[x].querySelector(".coin");
  if (coin) {
    coin.remove();
    game_board[y][x] = 0;
    score++;
    coinsPicked += 1;
    console.log(coinsPicked);
    console.log(coinsInGame);

    // updateScore();
    if (coinsPicked == coinsInGame) {
      startNewLevel(false)
    }
  }

  checkColision();
}

function checkColision() {
  // Check if NPC caught player
  if (x === x_npc && y === y_npc) {
    showDeathScreen();
    return; // Stop player movement
  }
}

function showDeathScreen() {
  const deathScreen = document.getElementById("death-screen");
  deathScreen.classList.remove("hidden");
  document.getElementById("steps").textContent = steps;
  document.getElementById("final-score").textContent = score;
  document.getElementById("level").textContent = level;
  // Stop player and NPC movement (optional, depending on your game logic)
  document.removeEventListener("keydown", movePlayer);
  clearInterval(npcMovementInterval);
}

document.getElementById("restart-button").addEventListener("click", function() {
  location.reload(); // Reload the page to restart the game
  level = 1
});


document.getElementById("restart-button").addEventListener("click", function() {
  location.reload(); // Reload the page to restart the game
});




