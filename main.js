const rootCell = new Cell();
const grid = { "0,0": rootCell };

// Sample artifacts with image URLs
const sampleArtifacts = [
    new Artifact("Gaia's Tear", 10, 5, 0, "./images/Artifact-1.png"),
    new Artifact("Starfall Fragment", 0, 0, 10, "./images/Artifact-2.png"),
    new Artifact("MoonStone", 20, 0, 0, "./images/Artifact-3.png")
];

// Function to calculate grid statistics
function getGridStats() {
    let totalHealth = 0;
    let totalPhysical = 0;
    let totalMagical = 0;
    let totalArtifacts = 0;
    let openSlots = 0;
    let takenSlots = 0;

    for (const cell of Object.values(grid)) {
        if (cell.artifact) {
            totalHealth += cell.artifact.health;
            totalPhysical += cell.artifact.physical;
            totalMagical += cell.artifact.magical;
            totalArtifacts++;
            takenSlots++;
        } else {
            openSlots++;
        }
    }

    return {
        totalHealth,
        totalPhysical,
        totalMagical,
        totalArtifacts,
        openSlots,
        takenSlots
    };
}

// Function to update the stats section in the toolbar
function updateStats() {
    const stats = getGridStats();
    const statsSection = document.getElementById("stats-section");
    statsSection.innerHTML = `
        <h3>Grid Statistics</h3>
        <p>Total Artifacts: ${stats.totalArtifacts}</p>
        <p>Open Slots: ${stats.openSlots}</p>
        <p>Taken Slots: ${stats.takenSlots}</p>
        <p>Total Health: ${stats.totalHealth}</p>
        <p>Total Physical: ${stats.totalPhysical}</p>
        <p>Total Magical: ${stats.totalMagical}</p>
    `;
}

// Function to populate the toolbar with draggable artifact images
function populateToolbar() {
    const toolbar = document.getElementById("tool-bar");
    toolbar.innerHTML = ""; // Clear existing content

    // Create a container for artifacts
    const artifactContainer = document.createElement("div");
    artifactContainer.id = "artifact-container";

    // Add artifact images
    sampleArtifacts.forEach(artifact => {
        const artifactElem = document.createElement("img");
        artifactElem.src = artifact.image;
        artifactElem.alt = artifact.name;
        artifactElem.classList.add("artifact");
        artifactElem.draggable = true;
        artifactElem.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", artifact.name);
        });
        artifactContainer.appendChild(artifactElem);
    });

    // Add stats section
    const statsSection = document.createElement("div");
    statsSection.id = "stats-section";

    // Append everything to the toolbar
    toolbar.appendChild(artifactContainer);
    toolbar.appendChild(statsSection);

    updateStats(); // Initial update
}

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
                if (cell.artifact) {
                    const img = document.createElement("img");
                    img.src = cell.artifact.image;
                    img.alt = cell.artifact.name;
                    img.classList.add("cell-image");
                    cellTd.appendChild(img);
                }
                // Make cell droppable
                cellTd.addEventListener("dragover", (e) => {
                    e.preventDefault(); // Allow drop
                });
                cellTd.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const artifactName = e.dataTransfer.getData("text/plain");
                    const artifact = sampleArtifacts.find(a => a.name === artifactName);
                    if (artifact) {
                        cell.artifact = artifact; // Set the cell's artifact
                        renderGrid(); // Re-render to update display
                        updateStats(); // Update stats after change
                    }
                });
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
                        updateStats(); // Update stats after change
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

// Initial render of the grid and populate toolbar
renderGrid();
populateToolbar();