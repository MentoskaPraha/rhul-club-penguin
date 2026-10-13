import { Room, Client, CloseCode } from "colyseus";

export class MyRoom extends Room {
  maxClients = 4;

  messages = {
    yourMessageType: (client: Client, message: any) => {
      console.log(client.sessionId, "sent a message:", message);
    },
  };

  onCreate(_options: any) {
    console.log("Room Created!");
  }

  onJoin(client: Client, _options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!", code);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
