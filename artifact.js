class Artifact {
    constructor(name, health, physical, magical, image) {
        this.name = name;
        this.health = health;
        this.physical = physical;
        this.magical = magical;
        this.image = image;
    }

    calculateStats(grid, position) {
        return {
            health: this.health,
            physical: this.physical,
            magical: this.magical
        };
    }
}

