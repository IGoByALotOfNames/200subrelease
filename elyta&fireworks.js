/*
	tick onClose onPlayerJoin onPlayerLeave onPlayerJump onRespawnRequest
	playerCommand onPlayerChat onPlayerChangeBlock onPlayerDropItem
	onPlayerPickedUpItem onPlayerSelectInventorySlot onBlockStand
	onPlayerAttemptCraft onPlayerCraft onPlayerAttemptOpenChest
	onPlayerOpenedChest onPlayerMoveItemOutOfInventory onPlayerMoveInvenItem
	onPlayerMoveItemIntoIdxs onPlayerSwapInvenSlots onPlayerMoveInvenItemWithAmt
	onPlayerAttemptAltAction onPlayerAltAction onPlayerClick
	onClientOptionUpdated onInventoryUpdated onChestUpdated onWorldChangeBlock
	onCreateBloxdMeshEntity onEntityCollision onPlayerAttemptSpawnMob
	onWorldAttemptSpawnMob onPlayerSpawnMob onWorldSpawnMob onMobDespawned
	onPlayerAttack onPlayerDamagingOtherPlayer onPlayerDamagingMob
	onPlayerKilledOtherPlayer onMobKilledPlayer onPlayerKilledMob
	onPlayerPotionEffect onPlayerDamagingMeshEntity onPlayerBreakMeshEntity
	onPlayerUsedThrowable onPlayerThrowableHitTerrain onTouchscreenActionButton
	onTaskClaimed onChunkLoaded onPlayerRequestChunk onItemDropCreated
	onPlayerStartChargingItem onPlayerFinishChargingItem doPeriodicSave

	To use a callback, just assign a function to it in the world code!
	tick = () => {}			 or			 function tick() {}
*/

// --- Configuration Constants ---
const ELYTRA_ITEM_ATTRIBUTES = { customDisplayName: "Elytra", customDescription: "Real Elytra!!!" };
const FIREWORK_ITEM_ATTRIBUTES = { customDisplayName: "Fireworks", customDescription: "REAL FIREWORKS TO PROPEL!" };

const GLIDE_PITCH_DOWN_ACCEL_FACTORS = [3, 5, 3]; // Original: deas - factors for speed change when looking down
const GLIDE_PITCH_UP_DECEL_FACTORS = [0.05, 0.8, 0.05]; // Original: adsa - factors for speed change when looking up/level
const MAX_GLIDE_VELOCITY_COMPONENT = 20; // Original: der - max component value for glide velocity
const MAX_BOOST_VELOCITY_COMPONENT = 20; // Original: der - max component value for glide velocity
const INITIAL_GLIDE_VELOCITY_COMPONENT = 10; // Original: der - max component value for glide velocity

const BOOST_DURATION_DECREMENT_INTERVAL = 20; // Ticks after which boost duration decreases
const FIREWORK_BOOST_TICKS = 3; // How many "boosted" ticks a firework gives

const ELYTRA_EFFECT_NAME = "Elytra";
const FROZEN_EFFECT_NAME = "Frozen"; // Applied during gliding to alter physics
const GLIDING_POSE = "gliding";
const STANDING_POSE = "standing";
const FIREWORK_ITEM_NAME = "Arrow of Knockback"; // Item used as fireworks

// --- Player-Specific State ---
let playerBoostDurations = {}; // Stores boost ticks remaining {playerId: count}
let playerGlideVelocities = {}; // Stores current glide velocity {playerId: [vx,vy,vz]}

let tickCounter = 0;

// --- Custom Particle Effect Function (unchanged as per instructions) ---
function ctx([x, y, z]) {
    api.playParticleEffect({
        dir1: [-1, -1, -1],
        dir2: [1, 1, 1],
        pos1: [x, y, z],
        pos2: [x, y, z],
        texture: "glint",
        minLifeTime: 0.5,
        maxLifeTime: 1,
        minEmitPower: 0.2,
        maxEmitPower: 0.5,
        minSize: 0.2,
        maxSize: 0.8,
        manualEmitCount: 10,
        gravity: [0, 0, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [200, 200, 200, 0, 1], // Assuming alpha is the 4th or 5th component
                maxColor: [255, 255, 255, 1],   // Ensure color array lengths are consistent if alpha is intended
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1, // Assuming 1 is a valid blend mode (e.g., Additive)
    });
}

// --- Game Tick Logic ---
function tick() {
    tickCounter++;
    const playerIds = api.getPlayerIds();

    playerIds.forEach(id => {
        // --- Boost Management ---
        if (tickCounter % BOOST_DURATION_DECREMENT_INTERVAL === 0 && playerBoostDurations[id] > 0) {
            playerBoostDurations[id]--;
        }

        // --- Get Player State for Gliding ---
        const currentPosition=api.getPosition(id)
        const isPlayerInAir = api.getBlockTypesPlayerStandingOn(id).length === 0;
        const hasElytraEffect = api.getEffects(id).includes(ELYTRA_EFFECT_NAME);
        const canGlide = isPlayerInAir && hasElytraEffect;

        if (canGlide) {
            // --- Player is attempting to or is already gliding ---
            if (!api.getEffects(id).includes(FROZEN_EFFECT_NAME)){
                api.applyEffect(id, FROZEN_EFFECT_NAME, null, { inbuiltLevel: 1 });
            }
            
            api.setPlayerPose(id, GLIDING_POSE);

            // Ensure glide velocity state is initialized (should be from onPlayerJoin or stop-glide event)
            if (!playerGlideVelocities[id]) {
                playerGlideVelocities[id] = [INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT];
            }


            const playerFacing = api.getPlayerFacingInfo(id).dir;
            let currentGlideVel = playerGlideVelocities[id]; // This is an array [vx,vy,vz]

            if (playerBoostDurations[id] > 0) { // Boosted flight
                for (let i = 0; i < 3; i++) {
                    currentGlideVel[i] = MAX_BOOST_VELOCITY_COMPONENT;
                }

                ctx(currentPosition); // Particle effect for boost
                for (let i = 0; i < 3; i++) {
                    playerFacing[i] *= currentGlideVel[i] * 2;
                }
            } else { // Normal (unboosted) gliding
                const pitchFactor = playerFacing[1]; // fi[1] from original code
                if (pitchFactor < 0) { // Looking down: pitchFactor is negative, increases speed components
                    for (let i = 0; i < 3; i++) {
                        currentGlideVel[i] -= pitchFactor * GLIDE_PITCH_DOWN_ACCEL_FACTORS[i];
                    }

                } else { // Looking up or level: pitchFactor is positive or zero, decreases speed components
                    for (let i = 0; i < 3; i++) {
                        currentGlideVel[i] -= pitchFactor * GLIDE_PITCH_UP_DECEL_FACTORS[i];
                    }
                }

                // Clamp velocity components
                for (let i = 0; i < 3; i++) {
                    currentGlideVel[i]=Math.min(Math.max(currentGlideVel[i],0),MAX_GLIDE_VELOCITY_COMPONENT)
                    playerFacing[i] *= currentGlideVel[i];
                }
            }
            playerGlideVelocities[id] = currentGlideVel; // Store updated velocity array
            api.setVelocity(id, playerFacing[0], playerFacing[1], playerFacing[2]);


        } else {


            api.setPlayerPose(id, STANDING_POSE);
            api.removeEffect(id, FROZEN_EFFECT_NAME);
            if (!isPlayerInAir){
                // Reset glide velocity to the base state for a new glide, matching original behavior.
                playerGlideVelocities[id] = [INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT];
            }
            

        }
    });
}

// --- Player Click Event ---
function onPlayerClick(id, alt) {
    const selectedSlotIndex = api.getSelectedInventorySlotI(id);
    const selectedItem = api.getItemSlot(id, selectedSlotIndex);

    // Check if player is alt-clicking, has Elytra effect, and is holding the "firework" item
    if (alt){
        if (api.getEffects(id).includes(ELYTRA_EFFECT_NAME)){
            if (selectedItem && selectedItem.attributes.customDescription === FIREWORK_ITEM_ATTRIBUTES.customDescription) {

                playerBoostDurations[id] = FIREWORK_BOOST_TICKS;
                api.removeItemName(id, FIREWORK_ITEM_NAME, 1); // Consume one firework
            }else if (selectedItem && selectedItem.attributes.customDescription === ELYTRA_ITEM_ATTRIBUTES.customDescription){
                api.removeEffect(id, ELYTRA_EFFECT_NAME);
                api.removeEffect(id, FROZEN_EFFECT_NAME);
            }
        }else if (selectedItem && selectedItem.attributes.customDescription === ELYTRA_ITEM_ATTRIBUTES.customDescription){
            api.applyEffect(id, ELYTRA_EFFECT_NAME, null, { inbuiltLevel: 1, icon: "Diamond Hang Glider" });
            api.applyEffect(id, FROZEN_EFFECT_NAME, null, { inbuiltLevel: 1 });
        }
    }
}

// --- Player Join Event ---
function onPlayerJoin(id) {
    playerBoostDurations[id] = 0; // Initialize boost duration
    // Initialize glide velocity. This is the base from which unboosted glide calculations start.
    playerGlideVelocities[id] = [INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT, INITIAL_GLIDE_VELOCITY_COMPONENT];
    // lastPlayerPositions[id] will be undefined here, correctly indicating not currently gliding.

    // Give player starting items
    api.setItemSlot(id, 0, "Diamond Hang Glider", null, ELYTRA_ITEM_ATTRIBUTES); // Elytra item
    api.setItemSlot(id, 1, FIREWORK_ITEM_NAME, 16, FIREWORK_ITEM_ATTRIBUTES); // Firework items
}
