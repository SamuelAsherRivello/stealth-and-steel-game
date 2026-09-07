import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const warriorProfile = createEnemyProfile({ id: 'warrior', actions: [...COMMON_ACTIONS, 'melee'] });
