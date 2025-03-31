// Initialize the grid with a root cell at (0,0)
const rootCell = new Cell();
const grid = { "0,0": rootCell };

// Render the grid as an HTML table
function renderGrid() {
    const container = document.getElementById("cell-container");
    container.innerHTML = ""; // Clear the container

    // Get all existing cell positions
    const positions = Object.keys(grid).map(key => key.split(",").map(Number));
    if (positions.length === 0) return; // Handle empty grid

    // Calculate table bounds, expanding by 1 in each direction for adjacent slots
    const minX = Math.min(...positions.map(p => p[0])) - 1;
    const maxX = Math.max(...positions.map(p => p[0])) + 1;
    const minY = Math.min(...positions.map(p => p[1])) - 1;
    const maxY = Math.max(...positions.map(p => p[1])) + 1;

    // Create the table
    const table = document.createElement("table");
    for (let y = minY; y <= maxY; y++) {
        const row = document.createElement("tr");
        for (let x = minX; x <= maxX; x++) {
            const key = `${x},${y}`;
            const cell = grid[key];
            const cellTd = document.createElement("td");

            // Check if this position is adjacent to an existing cell
            const isAdjacent = ["up", "down", "left", "right"].some(dir => getNeighbor(x, y, dir));

            if (cell) {
                // Render existing cell
                cellTd.classList.add("existing-cell");
                cellTd.textContent = cell.artifact ? cell.artifact.name : "Empty";
            } else {
                // Render empty slot
                cellTd.classList.add("empty-slot");
                if (isAdjacent) {
                    // Add button for adjacent slots
                    const btn = document.createElement("button");
                    btn.classList.add("add-cell-button");
                    btn.textContent = "+";
                    btn.onclick = () => {
                        const newCell = new Cell();
                        grid[key] = newCell;
                        // Link the new cell to its neighbors
                        ["up", "down", "left", "right"].forEach(dir => {
                            const neighbor = getNeighbor(x, y, dir);
                            if (neighbor) {
                                if (dir === "up") {
                                    newCell.up = neighbor;
                                    neighbor.down = newCell;
                                } else if (dir === "down") {
                                    newCell.down = neighbor;
                                    neighbor.up = newCell;
                                } else if (dir === "left") {
                                    newCell.left = neighbor;
                                    neighbor.right = newCell;
                                } else if (dir === "right") {
                                    newCell.right = neighbor;
                                    neighbor.left = newCell;
                                }
                            }
                        });
                        renderGrid(); // Re-render the grid
                    };
                    cellTd.appendChild(btn);
                }
            }
            row.appendChild(cellTd);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

// Helper function to get a neighboring cell
function getNeighbor(x, y, direction) {
    const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = offsets[direction];
    return grid[`${x + dx},${y + dy}`] || null;
}

// Initial render of the grid
renderGrid();