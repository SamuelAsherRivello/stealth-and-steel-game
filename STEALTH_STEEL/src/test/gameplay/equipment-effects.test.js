import test from "node:test";
import assert from "node:assert/strict";
import { createEquipmentSnapshot, getPlayerIncomingDamage, getPlayerOutgoingDamage } from "../../runtime/gameplay/equipment-effects.js";

test("equipment applies the approved tier percentages and keeps empty baseline stats", () => {
  const baseline = createEquipmentSnapshot({ status: "ready", effective: {} });
  assert.deepEqual([baseline.movementMultiplier, baseline.outgoingDamageMultiplier, baseline.incomingDamageMultiplier], [1, 1, 1]);
  const snapshot = createEquipmentSnapshot({ status: "ready", effective: {
    Shoes: { effectPercent: 10 }, Dagger: { effectPercent: 20 }, Shield: { effectPercent: 30 },
  } });
  assert.deepEqual([snapshot.movementMultiplier, snapshot.outgoingDamageMultiplier, snapshot.incomingDamageMultiplier], [1.1, 1.2, 0.7]);
  const player = { equipment: snapshot };
  assert.equal(getPlayerOutgoingDamage(player, 25), 30);
  assert.equal(getPlayerIncomingDamage(player, 25), 17.5);
});

test("unavailable equipment never prevents baseline gameplay", () => {
  const snapshot = createEquipmentSnapshot({ status: "unavailable" });
  assert.deepEqual([snapshot.movementMultiplier, snapshot.outgoingDamageMultiplier, snapshot.incomingDamageMultiplier], [1, 1, 1]);
});
