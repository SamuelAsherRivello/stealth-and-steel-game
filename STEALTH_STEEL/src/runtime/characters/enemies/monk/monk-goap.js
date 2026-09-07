import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const monkProfile = createEnemyProfile({ id: 'monk', actions: [...COMMON_ACTIONS], targets: [] });
