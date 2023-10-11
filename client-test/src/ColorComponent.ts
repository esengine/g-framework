class ColorComponent extends gs.Component {
    public color: string;

    onInitialize() {
        this.color = this.getRandomColor();
        this.markUpdated(lastSnapshotVersion + 1);
    }

    private getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}