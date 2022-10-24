const SIZES = {
  '3x3': 3,
  '4x4': 4,
  '5x5': 5,
  '6x6': 6,
  '7x7': 7,
  '8x8': 8,
};

class Puzzle {
  constructor() {
    this.moves = 0;
    this.time = 0;
    this.timerStart = 0;
    this.size = SIZES['4x4'];
    this.shuffled = false;
    this.records = localStorage.getItem('records');

    if (!this.records) {
      this.records = {};
      for (const key of Object.keys(SIZES)) {
        this.records[key] = {};
      }
    }
  }

  createButtons() {
    this.buttons.innerHTML = '';

    const btnShuffle = document.createElement('button');
    btnShuffle.textContent = 'Shuffle and start';
    btnShuffle.id = 'btn-shuffle';
    btnShuffle.classList.add('btn', 'btn-big');
    this.buttons.appendChild(btnShuffle);

    const btnSave = document.createElement('button');
    btnSave.textContent = 'Save';
    btnSave.id = 'btn-save';
    btnSave.classList.add('btn', 'btn-big');
    this.buttons.appendChild(btnSave);

    const btnRestore = document.createElement('button');
    btnRestore.textContent = 'Restore';
    btnRestore.id = 'btn-restore';
    btnRestore.classList.add('btn', 'btn-big');
    this.buttons.appendChild(btnRestore);

    const btnResults = document.createElement('button');
    btnResults.textContent = 'Results';
    btnResults.id = 'btn-results';
    btnResults.classList.add('btn', 'btn-big');
    this.buttons.appendChild(btnResults);

    const btnWin = document.createElement('button');
    btnWin.textContent = 'Check  message';
    btnWin.id = 'btn-winner';
    btnWin.classList.add('btn', 'btn-big');
    this.buttons.appendChild(btnWin);
  }

  createInformation() {
    this.information.innerHTML = '';

    const movesLabel = document.createElement('span');
    movesLabel.textContent = 'Moves: ';
    this.information.appendChild(movesLabel);

    this.movesCount = document.createElement('span');
    this.movesCount.id = 'moves';
    this.movesCount.textContent = '000';
    this.information.appendChild(this.movesCount);

    const timeLabel = document.createElement('span');
    timeLabel.textContent = 'Time: ';
    this.information.appendChild(timeLabel);

    this.timeCount = document.createElement('span');
    this.timeCount.id = 'time';
    this.timeCount.textContent = '00:00';
    this.information.appendChild(this.timeCount);
  }

  createBoard() {
    this.board.innerHTML = '';
    let n = 0;

    for (let i = 1; i <= this.size; i += 1) {
      for (let j = 1; j <= this.size; j += 1) {
        const cell = document.createElement('div');
        cell.id = `cell-${i}-${j}`;
        cell.classList.add('cell');

        n += 1;
        cell.style.order = n;

        if (n < this.size ** 2) {
          cell.classList.add('number');
          cell.textContent = n;
        } else {
          cell.classList.add('empty');
        }

        this.board.appendChild(cell);
      }
    }

    this.board.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    if (this.timerId) {
      this.moves = 0;
      this.movesCount.textContent = '000';
      clearTimeout(this.timerId);
      this.timeCount.textContent = '00:00';
    }
  }

  createInfoBottom() {
    this.infoBottom.innerHTML = '';

    for (const sizeKey of Object.keys(SIZES)) {
      const btn = document.createElement('button');
      btn.id = sizeKey;
      btn.classList.add('btn', 'btn-small');
      btn.textContent = sizeKey;
      this.infoBottom.appendChild(btn);
    }
  }

  createListeners() {
    document
      .getElementById('btn-shuffle')
      .addEventListener('click', () => this.shuffleBoard());

    document
      .getElementById('btn-save')
      .addEventListener('click', () => this.saveBoard());

    document
      .getElementById('btn-restore')
      .addEventListener('click', () => this.restoreBoard());

    document
      .getElementById('btn-results')
      .addEventListener('click', () => this.showResults());

    document
      .getElementById('btn-winner')
      .addEventListener('click', () => this.showMessage());

    this.board.addEventListener('click', (e) => {
      this.shiftCell(e.target);
    });

    this.infoBottom.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.size = SIZES[e.target.id];
        this.createBoard();
      }
    });
  }

  checkSolved() {
    if (!this.getCell(this.size, this.size).classList.contains('empty')) {
      return false;
    }

    let n = 0;
    let maxN = this.size ** 2 - 1;

    for (let i = 1; i <= this.size; i += 1) {
      for (let j = 1; j <= this.size; j += 1) {
        n += 1;
        if (n <= maxN) {
          if (parseInt(this.getCell(i, j).textContent) !== n) {
            return false;
          }
        }
      }
    }

    return true;
  }

  shiftCell(cell) {
    if (!cell.classList.contains('empty')) {
      const emptyAdjacentCell = this.getEmptyAdjacentCell(cell);

      if (emptyAdjacentCell) {
        const tmp = {
          id: cell.id,
          order: cell.style.order,
        };

        cell.id = emptyAdjacentCell.id;
        cell.style.order = emptyAdjacentCell.style.order;

        emptyAdjacentCell.id = tmp.id;
        emptyAdjacentCell.style.order = tmp.order;
      }
    }

    if (this.shuffled) {
      this.moves += 1;
      this.movesCount.textContent = this.moves.toString().padStart(3, '0');
      if (this.checkSolved()) {
        this.shuffled = false;
        clearInterval(this.timerId);

        this.time = (Date.now() - this.timerStart) / 1000;
        this.timeCount.textContent =
          parseInt(this.time / 60)
            .toString()
            .padStart(2, '0') +
          ':' +
          parseInt(this.time % 60)
            .toString()
            .padStart(2, '0');

        setTimeout(
          () =>
            alert(
                `Hooray! You solved the puzzle in ${this.timeCount.textContent} and ${this.moves} moves`,
            ),
          250,
        );
      }
    }
  }

  getEmptyAdjacentCell(cell) {
    const adjacentCells = this.getAdjacentCells(cell);

    for (const e of adjacentCells) {
      if (e.classList.contains('empty')) {
        return e;
      }
    }

    return false;
  }

  getAdjacentCells(cell) {
    const adjacentCells = [];

    const cellLocation = cell.id.split('-');
    const cellRow = parseInt(cellLocation[1]);
    const cellCol = parseInt(cellLocation[2]);

    if (cellRow < this.size) {
      adjacentCells.push(this.getCell(cellRow + 1, cellCol));
    }

    if (cellRow > 1) {
      adjacentCells.push(this.getCell(cellRow - 1, cellCol));
    }

    if (cellCol < this.size) {
      adjacentCells.push(this.getCell(cellRow, cellCol + 1));
    }

    if (cellCol > 1) {
      adjacentCells.push(this.getCell(cellRow, cellCol - 1));
    }

    return adjacentCells;
  }

  getCell(row, col) {
    return document.getElementById(`cell-${row}-${col}`);
  }

  getEmptyCell() {
    return this.board.querySelector('.empty');
  }

  rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }

  shuffleBoard() {
    let previousCell;

    for (let i = 0; i < 100; i += 1) {
      const emptyCell = this.getEmptyCell();
      const adjacentCells = this.getAdjacentCells(emptyCell);

      if (previousCell) {
        for (let j = adjacentCells.length - 1; j >= 0; j -= 1) {
          if (adjacentCells[j].innerHTML === previousCell.innerHTML) {
            adjacentCells.splice(j, 1);
          }
        }
      }

      previousCell = adjacentCells[this.rand(0, adjacentCells.length - 1)];
      this.shiftCell(previousCell);
    }

    this.shuffled = true;

    if (this.timerId) {
      this.moves = 0;
      this.movesCount.textContent = '000';
      clearTimeout(this.timerId);
      this.timeCount.textContent = '00:00';
    }

    this.timerStart = Date.now();
    this.startTimer();
  }

  saveBoard() {
    if (confirm('Save current position?')) {
      const cellsObject = {
        moves: this.moves,
        time: this.time,
        timerStart: this.timerStart,
        shuffled: this.shuffled,
        size: this.size,
      };

      for (const cell of this.board.children) {
        cellsObject[cell.style.order] = JSON.stringify(cell, [
          'id',
          'className',
          'textContent',
        ]);
      }

      localStorage.setItem('lastSaved', JSON.stringify(cellsObject));
    }
  }

  restoreBoard() {
    if (confirm('Load saved game?')) {
      const lastSaved = JSON.parse(localStorage.getItem('lastSaved'));
      if (lastSaved) {
        if (this.timerId) {
          clearTimeout(this.timerId);
        }

        this.moves = lastSaved.moves;
        this.movesCount.textContent = this.moves.toString().padStart('0', 3);

        this.time = lastSaved.time;
        this.timeCount.textContent =
          parseInt(this.time / 60)
            .toString()
            .padStart(2, '0') +
          ':' +
          parseInt(this.time % 60)
            .toString()
            .padStart(2, '0');

        this.shuffled = lastSaved.shuffled;
        this.size = lastSaved.size;

        this.board.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        while (this.board.firstChild) {
          this.board.removeChild(this.board.firstChild);
        }

        for (let i = 1; i <= this.size ** 2; i += 1) {
          const cellObject = JSON.parse(lastSaved[i]);
          const cell = document.createElement('div');

          cell.id = cellObject.id;
          cell.className = cellObject.className;
          cell.textContent = cellObject.textContent;
          cell.style.order = i;

          this.board.appendChild(cell);
        }

        this.timerStart = Date.now() - this.time * 1000;
        this.startTimer();
      } else {
        alert('No saved games!');
      }
    }
  }

  startTimer() {
    this.timerId = setInterval(() => {
      this.time = (Date.now() - this.timerStart) / 1000;
      this.timeCount.textContent =
        parseInt(this.time / 60)
          .toString()
          .padStart(2, '0') +
        ':' +
        parseInt(this.time % 60)
          .toString()
          .padStart(2, '0');
    }, 1000);
  }

  showResults() {
    alert('Not implemented yet..');
  }

  showMessage() {
    alert(
        `Hooray! You solved the puzzle in ${this.timeCount.textContent} and ${this.moves} moves`,
    );
  }

  init() {
    document.body.innerHTML = '';

    this.wrapper = document.createElement('main');
    this.buttons = document.createElement('div');
    this.information = document.createElement('div');
    this.board = document.createElement('div');
    this.infoBottom = document.createElement('div');

    this.wrapper.classList.add('wrapper');
    this.buttons.classList.add('buttons');
    this.information.classList.add('information');
    this.board.classList.add('board');
    this.infoBottom.classList.add('infoBottom');

    this.wrapper.appendChild(this.buttons);
    this.wrapper.appendChild(this.information);
    this.wrapper.appendChild(this.board);
    this.wrapper.appendChild(this.infoBottom);

    document.body.appendChild(this.wrapper);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const puzzle = new Puzzle();

  puzzle.init();
  puzzle.createButtons();
  puzzle.createInformation();
  puzzle.createBoard();
  puzzle.createInfoBottom();
  puzzle.createListeners();
});