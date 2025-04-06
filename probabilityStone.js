class ProbabilityStone extends Artifact {
    constructor(name, health, physical, magical, image) {
        super(name, health, physical, magical, image);
        this.probabilityBoost = 10; // 10% boost to adjacent slots
    }

    calculateStats(grid, position) {
        return {
            health: this.health,
            physical: this.physical,
            magical: this.magical
        };
    }
}