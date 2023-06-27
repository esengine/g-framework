import {Connection} from "./Connection";
import {Message} from "./Message";

export class WebSocketUtils {
    public static hashPassword(password: string): string {
        let hash = 0, i, chr;
        for (i = 0; i < password.length; i++) {
            chr   = password.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash.toString();
    }

    public static sendToConnection(connection: Connection, message: Message): void {
        connection.send(message);
    }
}
