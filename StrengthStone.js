class StrengthStone extends Artifact {
    constructor(name, health, physical, magical, image) {
        super(name, health, physical, magical, image);
    }

    calculateStats(grid, position) {
        const baseStats = super.calculateStats(grid, position);
        const adjacentCount = this.getAdjacentArtifactCount(grid, position);
        baseStats.physical += 10 * adjacentCount;
        return baseStats;
    }

    getAdjacentArtifactCount(grid, position) {
        const [x, y] = position.split(",").map(Number);
        const directions = [
            [0, -1], // up
            [0, 1],  // down
            [-1, 0], // left
            [1, 0]   // right
        ];
        let count = 0;
        directions.forEach(([dx, dy]) => {
            const neighborKey = `${x + dx},${y + dy}`;
            const neighbor = grid[neighborKey];
            if (neighbor && neighbor.artifact) {
                count++;
            }
        });
        return count;
    }
}