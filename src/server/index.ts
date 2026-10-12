import {
  defineServer,
  defineRoom,
  createRouter,
  createEndpoint
} from "colyseus";
import { MyRoom } from "./MyRoom";

export const server = defineServer({
  rooms: {
    my_room: defineRoom(MyRoom)
  },

  // Type-safe HTTP routes, hot-swapped on reload
  routes: createRouter({
    hello: createEndpoint("/hello", { method: "GET" }, async () => {
      return { message: "Hello world!" };
    })
  }),

  express: (app) => {
    app.get("/express-hello", (_req, res) => {
      res.json({ message: "Hello from Express!" });
    });
  }
});
