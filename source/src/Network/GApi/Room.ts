module gs {
    export interface Room {
        id: string;
        owner: string;
        maxPlayers: number;
        players: Player[];
    }
}