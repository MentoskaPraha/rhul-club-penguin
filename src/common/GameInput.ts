import { Data, schema, t, type SchemaType } from "@colyseus/schema";
import { Velocity } from "@common/constants";

export const MoveInput = schema({
  left: t.boolean(),
  right: t.boolean(),
  up: t.boolean(),
  down: t.boolean(),
});
export type MoveInput = SchemaType<typeof MoveInput>;

export function applyInput(
  state: { x: number; y: number },
  cmd: Data<MoveInput>,
) {
  if (cmd.left) {
    state.x -= Velocity;
  } else if (cmd.right) {
    state.x += Velocity;
  }
  if (cmd.up) {
    state.y -= Velocity;
  } else if (cmd.down) {
    state.y += Velocity;
  }
}
