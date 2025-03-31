class Artifact {
    constructor(name, health, physical, magical) {
        this.name = name;
        this.health = health;
        this.physical = physical;
        this.magical = magical;
    }
}

class Cell {
    constructor(artifact = null) {
        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;
        this.artifact = artifact;
    }
}

// Create initial cell without an artifact
const rootCell = new Cell();
const grid = { "0,0": rootCell };

document.body.innerHTML = `<div id='cell-container' style='display: flex; justify-content: center;'></div>`;

function renderGrid() {
    const container = document.getElementById("cell-container");
    container.innerHTML = "";

    const positions = Object.keys(grid).map(key => key.split(",").map(Number));
    const minX = Math.min(...positions.map(p => p[0]));
    const maxX = Math.max(...positions.map(p => p[0]));
    const minY = Math.min(...positions.map(p => p[1]));
    const maxY = Math.max(...positions.map(p => p[1]));

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    table.style.width = "auto";

    for (let y = minY; y <= maxY; y++) {
        const row = document.createElement("tr");
        for (let x = minX; x <= maxX; x++) {
            const key = `${x},${y}`;
            const cell = grid[key];
            const cellTd = document.createElement("td");

            cellTd.style = `
                width: 100px;
                height: 100px;
                text-align: center;
                position: relative;
                vertical-align: middle;
                background-color: ${cell ? "rgb(110, 110, 110)" : "#444444"};
                border: ${cell ? "2px solid rgb(139, 139, 139)" : "none"};
                color: white;
                font-weight: bold;
            `;

            if (cell) {
                cellTd.textContent = cell.artifact ? cell.artifact.name : "Empty";
                ["up", "down", "left", "right"].forEach(direction => {
                    const neighbor = getNeighbor(x, y, direction);
                    if (!neighbor) {
                        const btn = document.createElement("button");
                        btn.textContent = `+`;
                        btn.style = "position: absolute; width: 30px; height: 30px;";
                        if (direction === "up") { btn.style.top = "0"; btn.style.transform = "translate(-50%, -150%)"; btn.style.left = "50%"; }
                        if (direction === "down") { btn.style.bottom = "0"; btn.style.transform = "translate(-50%, 150%)"; btn.style.left = "50%"; }
                        if (direction === "left") { btn.style.left = "0"; btn.style.top = "50%"; btn.style.transform = "translate(-150%, -50%)"; }
                        if (direction === "right") { btn.style.right = "0"; btn.style.top = "50%"; btn.style.transform = "translate(150%, -50%)"; }
                        btn.onclick = () => addCell(x, y, direction);
                        cellTd.appendChild(btn);
                    }
                });
            }

            row.appendChild(cellTd);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

function getNeighbor(x, y, direction) {
    const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = offsets[direction];
    return grid[`${x + dx},${y + dy}`] || null;
}

function addCell(x, y, direction) {
    const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = offsets[direction];
    const newX = x + dx;
    const newY = y + dy;

    const newCell = new Cell();
    grid[`${newX},${newY}`] = newCell;
    renderGrid();
}

renderGrid();