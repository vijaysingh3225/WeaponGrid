const rootCell = new Cell();
const grid = { "0,0": rootCell };

// Sample artifacts with image URLs
const sampleArtifacts = [
    new Artifact("Gaia's Tear", 10, 5, 0, "./images/Artifact-1.png"),
    new Artifact("Starfall Fragment", 0, 0, 10, "./images/Artifact-2.png"),
    new Artifact("MoonStone", 20, 0, 0, "./images/Artifact-3.png"),
    new StrengthStone("StrengthStone", 20, 0, 0, "./images/Artifact-4.png"),
    new Artifact("VoidReaver", 20, 0, 0, "./images/VoidArtifact2.png"),
    new Artifact("Artifact 5", 20, 0, 0, "./images/Artifact-5.png"),
    new Artifact("Artifact 6", 20, 0, 0, "./images/Artifact-6.png"),
];

// Tooltip
const tooltip = document.createElement("div");
tooltip.id = "tooltip";
document.body.appendChild(tooltip);

// Hovered cell tracking for rotation
let hoveredCellKey = null;

// Tooltip functions
function showTooltip(e, artifact, grid, position) {
    const stats = artifact.calculateStats(grid, position);
    tooltip.innerHTML = `
        <strong>${artifact.name}</strong><br>
        Health: ${stats.health}<br>
        Physical: ${stats.physical}<br>
        Magical: ${stats.magical}
    `;
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.style.display = "block";
}
function hideTooltip() {
    tooltip.style.display = "none";
}

// Grid statistics
function getGridStats() {
    let totalHealth = 0, totalPhysical = 0, totalMagical = 0, totalArtifacts = 0, openSlots = 0, takenSlots = 0;

    for (const [position, cell] of Object.entries(grid)) {
        if (cell.artifact) {
            const stats = cell.artifact.calculateStats(grid, position);
            totalHealth += stats.health;
            totalPhysical += stats.physical;
            totalMagical += stats.magical;
            totalArtifacts++;
            takenSlots++;
        } else {
            openSlots++;
        }
    }

    return { totalHealth, totalPhysical, totalMagical, totalArtifacts, openSlots, takenSlots };
}

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

// Populate toolbar
function populateToolbar() {
    const toolbar = document.getElementById("tool-bar");
    toolbar.innerHTML = "";

    const artifactContainer = document.createElement("div");
    artifactContainer.id = "artifact-container";

    sampleArtifacts.forEach(artifact => {
        const artifactElem = document.createElement("img");
        artifactElem.src = artifact.image;
        artifactElem.alt = artifact.name;
        artifactElem.classList.add("artifact");
        artifactElem.draggable = true;
        artifactElem.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", JSON.stringify({ name: artifact.name }));
        });
        artifactElem.addEventListener("mouseenter", (e) => showTooltip(e, artifact, null, null));
        artifactElem.addEventListener("mouseleave", hideTooltip);
        artifactContainer.appendChild(artifactElem);
    });

    // Delete area
    const deleteArea = document.createElement("div");
    deleteArea.id = "delete-area";
    deleteArea.textContent = "🗑";
    deleteArea.classList.add("delete-area");
    deleteArea.addEventListener("dragover", (e) => e.preventDefault());
    deleteArea.addEventListener("drop", (e) => {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.fromCell && grid[data.fromCell]) {
            grid[data.fromCell].artifact = null;
            renderGrid();
            updateStats();
        }
    });

    const statsSection = document.createElement("div");
    statsSection.id = "stats-section";

    toolbar.appendChild(artifactContainer);
    toolbar.appendChild(deleteArea);
    toolbar.appendChild(statsSection);

    updateStats();
}

// Grid rendering
function renderGrid() {
    const container = document.getElementById("cell-container");
    container.innerHTML = "";

    const positions = Object.keys(grid).map(key => key.split(",").map(Number));
    if (positions.length === 0) return;

    const minX = Math.min(...positions.map(p => p[0])) - 1;
    const maxX = Math.max(...positions.map(p => p[0])) + 1;
    const minY = Math.min(...positions.map(p => p[1])) - 1;
    const maxY = Math.max(...positions.map(p => p[1])) + 1;

    const table = document.createElement("table");
    for (let y = minY; y <= maxY; y++) {
        const row = document.createElement("tr");
        for (let x = minX; x <= maxX; x++) {
            const key = `${x},${y}`;
            const cell = grid[key];
            const cellTd = document.createElement("td");

            const isAdjacent = ["up", "down", "left", "right"].some(dir => getNeighbor(x, y, dir));

            if (cell) {
                cellTd.classList.add("existing-cell");
                if (cell.artifact) {
                    const img = document.createElement("img");
                    img.src = cell.artifact.image;
                    img.alt = cell.artifact.name;
                    img.classList.add("cell-image");
                    img.style.transform = `rotate(${cell.artifact.rotation || 0}deg)`;
                    img.draggable = true;
                    img.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", JSON.stringify({ name: cell.artifact.name, fromCell: key }));
                    });
                    img.addEventListener("mouseenter", (e) => {
                        showTooltip(e, cell.artifact, grid, key);
                        hoveredCellKey = key;
                    });
                    img.addEventListener("mouseleave", () => {
                        hideTooltip();
                        hoveredCellKey = null;
                    });
                    cellTd.appendChild(img);
                }

                cellTd.addEventListener("dragover", (e) => e.preventDefault());
                cellTd.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                    const baseArtifact = sampleArtifacts.find(a => a.name === data.name);
                    if (baseArtifact) {
                        const artifact = new Artifact(
                            baseArtifact.name,
                            baseArtifact.health,
                            baseArtifact.physical,
                            baseArtifact.magical,
                            baseArtifact.image
                        );
                        if (data.fromCell && grid[data.fromCell]) {
                            artifact.rotation = grid[data.fromCell].artifact?.rotation || 0;
                            grid[data.fromCell].artifact = null;
                        }
                        cell.artifact = artifact;
                        renderGrid();
                        updateStats();
                    }
                });

            } else {
                cellTd.classList.add("empty-slot");
                if (isAdjacent) {
                    const adjacentPositions = getAdjacentPositions();
                    const chance = (100 / adjacentPositions.length).toFixed(1);

                    const wrapper = document.createElement("div");
                    wrapper.classList.add("add-cell-wrapper");

                    const btn = document.createElement("button");
                    btn.classList.add("add-cell-button");
                    btn.textContent = "+";
                    btn.onclick = () => {
                        const newCell = new Cell();
                        grid[key] = newCell;
                        ["up", "down", "left", "right"].forEach(dir => {
                            const neighbor = getNeighbor(x, y, dir);
                            if (neighbor) {
                                if (dir === "up") { newCell.up = neighbor; neighbor.down = newCell; }
                                else if (dir === "down") { newCell.down = neighbor; neighbor.up = newCell; }
                                else if (dir === "left") { newCell.left = neighbor; neighbor.right = newCell; }
                                else if (dir === "right") { newCell.right = neighbor; neighbor.left = newCell; }
                            }
                        });
                        renderGrid();
                        updateStats();
                    };

                    const percentText = document.createElement("div");
                    percentText.classList.add("percent-label");
                    percentText.textContent = `${chance}%`;

                    wrapper.appendChild(btn);
                    wrapper.appendChild(percentText);
                    cellTd.appendChild(wrapper);
                }
            }

            row.appendChild(cellTd);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

// Neighbor helper
function getNeighbor(x, y, direction) {
    const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = offsets[direction];
    return grid[`${x + dx},${y + dy}`] || null;
}

// Get adjacent positions
function getAdjacentPositions() {
    const adjacentPositions = new Set();
    for (const position of Object.keys(grid)) {
        const [x, y] = position.split(",").map(Number);
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
            const newKey = `${x + dx},${y + dy}`;
            if (!grid[newKey]) adjacentPositions.add(newKey);
        });
    }
    return Array.from(adjacentPositions);
}

// Add random cell button
function addRandomCellButton() {
    const toolbar = document.getElementById("tool-bar");
    const button = document.createElement("button");
    button.id = "level-button";
    button.textContent = "Level Up";
    button.onclick = () => {
        const adjacentPositions = getAdjacentPositions();
        if (adjacentPositions.length > 0) {
            const randomPosition = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
            const newCell = new Cell();
            grid[randomPosition] = newCell;

            const [x, y] = randomPosition.split(",").map(Number);
            [["up", 0, -1], ["down", 0, 1], ["left", -1, 0], ["right", 1, 0]].forEach(([dir, dx, dy]) => {
                const neighbor = getNeighbor(x, y, dir);
                if (neighbor) {
                    if (dir === "up") { newCell.up = neighbor; neighbor.down = newCell; }
                    else if (dir === "down") { newCell.down = neighbor; neighbor.up = newCell; }
                    else if (dir === "left") { newCell.left = neighbor; neighbor.right = newCell; }
                    else if (dir === "right") { newCell.right = neighbor; neighbor.left = newCell; }
                }
            });

            renderGrid();
            updateStats();
        }
    };
    toolbar.appendChild(button);
}

// Rotate on key press
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && hoveredCellKey && grid[hoveredCellKey]) {
        const cell = grid[hoveredCellKey];
        if (cell.artifact) {
            cell.artifact.rotation = (cell.artifact.rotation || 0) + 90;
            renderGrid();
        }
    }
});

// Initialize
renderGrid();
populateToolbar();
addRandomCellButton();
