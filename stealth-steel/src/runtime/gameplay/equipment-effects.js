export const EMPTY_EQUIPMENT_SNAPSHOT = Object.freeze({
  slots: Object.freeze({}),
  movementMultiplier: 1,
  outgoingDamageMultiplier: 1,
  incomingDamageMultiplier: 1,
});

function multiplier(item, direction) {
  const percent = Number(item?.effectPercent);
  if (![10, 20, 30].includes(percent)) return 1;
  return direction === "down" ? 1 - percent / 100 : 1 + percent / 100;
}

export function createEquipmentSnapshot(state) {
  if (state?.status !== "ready") return EMPTY_EQUIPMENT_SNAPSHOT;
  const slots = Object.freeze({
    ...(state.effective?.Shoes ? { Shoes: state.effective.Shoes } : {}),
    ...(state.effective?.Dagger ? { Dagger: state.effective.Dagger } : {}),
    ...(state.effective?.Shield ? { Shield: state.effective.Shield } : {}),
  });
  return Object.freeze({
    slots,
    movementMultiplier: multiplier(slots.Shoes, "up"),
    outgoingDamageMultiplier: multiplier(slots.Dagger, "up"),
    incomingDamageMultiplier: multiplier(slots.Shield, "down"),
  });
}

export function getPlayerOutgoingDamage(player, baseDamage) {
  return baseDamage * (player?.equipment?.outgoingDamageMultiplier ?? 1);
}

export function getPlayerIncomingDamage(player, baseDamage) {
  return baseDamage * (player?.equipment?.incomingDamageMultiplier ?? 1);
}
