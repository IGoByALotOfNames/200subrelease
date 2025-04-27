function ptc([x,y,z],dir){
    api.playParticleEffect({
        dir1: [vel*dir[0],vel*dir[1],vel*dir[2]],
        dir2: [vel*dir[0],vel*dir[1],vel*dir[2]],
        pos1: [x-.3, y-.3, z-.3],
        pos2: [x+.3,y+.3,z+.3],
        texture: "square_particle",
        minLifeTime: .5,
        maxLifeTime: 3,
        minEmitPower: 5,
        maxEmitPower: 10,
        minSize: 0.5,
        maxSize: 0.1,
        manualEmitCount: 50,
        gravity: [0, -10, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [255, 165, 0, 1],
                maxColor: [255, 0, 0, 1],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 5,
                factor2: 5,
            },
        ],
        blendMode: 1,
    })
}
vel=1
r=15
trrow= {}
hf = {customDisplayName: "Firethrower", customDescription: "Right click to throw fire!"}
function getDist(id,id1){
    pos1= api.getPosition(id)
    pos2=api.getPosition(id1)
    return Math.sqrt(Math.pow((pos1[0]-pos2[0]),2)+Math.pow((pos1[1]-pos2[1]),2)+Math.pow((pos1[2]-pos2[2]),2))
}
function getDistNum(x,y,z,x1,y1,z1){
    return Math.sqrt(Math.pow((x-x1),2)+Math.pow((y-y1),2)+Math.pow((z-z1),2))
}
function isPlayerorMob(id){
    return (api.getPlayerIds().includes(id) || api.getMobIds().includes(id))
}
cnt = 0
function tick(){
    cnt+=1
    api.getPlayerIds().forEach(id => {
        effcts = api.getEffects(id)
        if (effcts && effcts.length>0 && effcts.includes("Burning") && cnt % 10 ===0){
            api.applyHealthChange(id, -1)
        }
        if (api.isPlayerCrouching(id)){
            asd = api.getSelectedInventorySlotI(id)
            isa = api.getItemSlot(id, asd)
            if (isa && isa.attributes.customDescription === hf.customDescription){
                ptc(api.getPlayerFacingInfo(id).camPos,api.getPlayerFacingInfo(id).dir)
                playerCam=api.getPlayerFacingInfo(id)
                camDir = playerCam.dir

                ptx = camDir[0]*r
                pty = camDir[1]*r
                ptz = camDir[2]*r

                pos = api.getPosition(id)
                r = 12
                enties = api.getEntitiesInRect([pos[0]-r,pos[1]-1,pos[2]-r],[playerCam.camPos[0]+r,playerCam.camPos[1]+1,playerCam.camPos[2]+r])
                for (q=0;q<enties.length;q++){
                    if (!isPlayerorMob(enties[q]) || enties[q] === id){
                        continue;
                    }
                    ePdist = getDist(id, enties[q])
                    if (ePdist < r){
                        
                        x1 = camDir[0]*ePdist
                        y1 = camDir[1]*ePdist
                        z1 = camDir[2]*ePdist
                        
                        per = api.getPosition(enties[q])
                        distattack = getDistNum(x1+playerCam.camPos[0],y1+playerCam.camPos[1],z1+playerCam.camPos[2], per[0],per[1],per[2])

                        if (distattack < 3){
                            trrow[enties[q]] = 10
                            api.applyEffect(enties[q], "Slowness",10000, {inbuiltLevel:1})
                            api.applyEffect(enties[q], "Burning",10000, {inbuiltLevel:1, icon:"Heat Resistance"})
                            api.applyHealthChange(enties[q], -1,id)
                        }
                    }
                }
            }
        }
    });
    
}
function onPlayerJoin(id){
    api.setItemSlot(id, 0, "Stone Crossbow", null,hf)
}
