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
last_pos = {}
tg = 0
hf = {customDisplayName: "Elytra", customDescription: "Real Elytra!!!"}
fw = {customDisplayName: "Fireworks", customDescription: "REAL FIREWORKS TO PROPEL!"}
ste = [10,1,10]
elv = {}
boosted={}
lvel = [0,1,0]
gvel = [0,-1,0]
der = 10
eq = {}
deas=[3,5,3]
adsa=[0.05,0.8,0.05]
dr = {}
ct = 0
function ctx([x,y,z]){
    api.playParticleEffect({
        dir1: [-1,-1,-1],
        dir2: [1,1,1],
        pos1: [x, y, z],
        pos2: [x,y,z],
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
                minColor: [200,200,200, 0, 1],
                maxColor: [255, 255, 255, 1],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1,
    })
}
function tick(){
    ct ++
    
    api.getPlayerIds().forEach(id => {
        if (ct%20===0 && boosted[id] > 0){
            boosted[id]--
        }
        slt= api.getItemSlot(id, api.getSelectedInventorySlotI(id))

        if (api.getBlockTypesPlayerStandingOn(id).length === 0 && ((slt && slt.attributes.customDescription === hf.customDescription)||api.getEffects(id).includes("Elytra"))){
            if(last_pos[id]){
                n=api.getPosition(id)
                lp = last_pos[id]
                v = [lp[0]-n[0],lp[1]-n[1],lp[2]-n[2]]
                last_pos[id]=api.getPosition(id)
                /*api.setPlayerPhysicsState(id, { type: 4, tier: 1 })*/
                api.applyEffect(id, "Elytra", null,{inbuiltLevel:1, icon: "Diamond Hang Glider"})
                api.applyEffect(id, "Frozen", null,{inbuiltLevel:1})
                fi = api.getPlayerFacingInfo(id).dir
                if (boosted[id]===0){
                    if (fi[1] < 0){
                        lvel[id][0]-=fi[1]*deas[0]
                        lvel[id][1]-=fi[1]*deas[1]
                        lvel[id][2]-=fi[1]*deas[2]
                    }else{
                        
                        lvel[id][0]-=fi[1]*adsa[0]
                        lvel[id][1]-=fi[1]*adsa[1]
                        lvel[id][2]-=fi[1]*adsa[2]
                    }
                    
                    if (lvel[id][0] < 0){
                        lvel[id][0]=0
                    }
                    if (lvel[id][1] < 0){
                        lvel[id][1]=0
                    }
                    if (lvel[id][2] < 0){
                        lvel[id][2]=0
                    }

                    if (lvel[id][0] > der){
                        lvel[id][0]=der
                    }
                    if (lvel[id][1] > der){
                        lvel[id][1]=der
                    }
                    if (lvel[id][2] >der){
                        lvel[id][2]=der
                    }
                    
                    
                }else{
                    lvel[id][0]=der
                    lvel[id][1]=der
                    lvel[id][2]=der
                }
                if (boosted[id]>0){
                    ctx(n)
                    fi[0] *= lvel[id][0]*2
                    fi[1] *= lvel[id][1]*2
                    fi[2] *= lvel[id][2]*2

                }else{
                    fi[0] *= lvel[id][0]
                    fi[1] *= lvel[id][1]
                    fi[2] *= lvel[id][2]
                }
                
				api.setPlayerPose(id,"gliding")
                
                api.setVelocity(id, fi[0],fi[1],fi[2])
            }else{
                last_pos[id]=api.getPosition(id)
                

            }
            
        }else{
            
			api.setPlayerPose(id,"standing")
            api.removeEffect(id, "Frozen")
            api.removeEffect(id, "Elytra")
            lvel[id] = [der,der,der]
        }
    });
}

const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
function onPlayerClick(id, alt){
    slt= api.getItemSlot(id, api.getSelectedInventorySlotI(id))
    if (api.getEffects(id).includes("Elytra") && alt && slt && slt.attributes.customDescription === fw.customDescription){

        boosted[id]=3
        api.removeItemName(id, "Arrow of Knockback",1)
        
    }

}
function onPlayerJoin(id){
    boosted[id] = 0
    api.setItemSlot(id, 0, "Diamond Hang Glider", null, hf)
    api.setItemSlot(id, 1, "Arrow of Knockback", 16, fw)
    
}
