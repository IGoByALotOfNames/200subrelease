




track = []
amount = {}
facing = {}
function ex([x,y,z]){
    
    api.playParticleEffect({
        dir1: [-10,-10,-10],
        dir2: [10,10,10],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "glint",
        minLifeTime: 1,
        maxLifeTime: 3,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 1,
        manualEmitCount: 150,
        gravity: [0, -10, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [100, 100, 100, 1],
                maxColor: [224, 238, 244, 1],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 2,
            },
        ],
        blendMode: 1,
    })
    api.playParticleEffect({
        dir1: [-10,-10,-10],
        dir2: [10,10,10],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "critical_hit",
        minLifeTime: 1,
        maxLifeTime: 3,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 1,
        manualEmitCount: 200,
        gravity: [0, -10, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [131, 139, 131, 1],
                maxColor: [108,123 , 139, 1],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 2,
            },
        ],
        blendMode: 1,
    })
    api.playParticleEffect({
        dir1: [-10,-10,-10],
        dir2: [10,10,10],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "critical_hit",
        minLifeTime: 1,
        maxLifeTime: 3,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 1,
        manualEmitCount: 200,
        gravity: [0, -10, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [238 , 185, 0, 1],
                maxColor: [238,44 , 44, 1],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 2,
            },
        ],
        blendMode: 1,
    })    
}

function ptc([x,y,z]){
    
    api.playParticleEffect({
        dir1: [-3,-3,-3],
        dir2: [3,3,3],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "drift effect_5",
        minLifeTime: 0.01,
        maxLifeTime: 0.02,
        minEmitPower: 1,
        maxEmitPower: 1.5,
        minSize: 0.20,
        maxSize: 0.20,
        manualEmitCount: 20,
        gravity: [0, 0, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [255, 215, 0, 1],
                maxColor: [255, 0, 0, 1],
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
    api.playParticleEffect({
        dir1: [-1.5,-1.5,-1.5],
        dir2: [1.5,1.5,1.5],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "square_particle",
        minLifeTime: 0.1,
        maxLifeTime: 0.5,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 0.1,
        manualEmitCount: 50,
        gravity: [0, 0, 0],
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
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1,
    })
    api.playParticleEffect({
        dir1: [-.5,-.5,-1.5],
        dir2: [.5,.5,.5],
        pos1: [x, y, z],
        pos2: [x,y,z],
        texture: "square_particle",
        minLifeTime: 1,
        maxLifeTime: 3,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 1,
        manualEmitCount: 10,
        gravity: [0, 0, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [100, 100, 100, 1],
                maxColor: [200, 200, 200, 1],
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

function onPlayerUsedThrowable(id,name,eid){
    if (name === "Arrow"){
    track.push(eid)
    amount[eid] = 50
    pos_pl = api.getPlayerFacingInfo(id).dir
    facing[eid] = pos_pl
    }
}
strength = 50
function tick(){
    for (i=0;i<track.length;i++){
        eid = track[i]
        try{
        if (amount[eid] > 0){
        amount[eid] -= 1
        }
        if (amount[eid] > 0){
        facer = facing[eid]
        api.setVelocity(eid, facer[0]*strength,facer[1]*strength,facer[2]*strength)
        pos_e = api.getPosition(eid)
        ptc(pos_e)
        }else{
            ex(api.getPosition(eid))
            track = track.filter(item => item !== eid)
        }
        }catch{
            track = track.filter(item => item !== eid)
        }

    }
}
function onPlayerThrowableHitTerrain(id,name,eid){

    if (name === "Arrow"){
        ex(api.getPosition(eid))
        track = track.filter(item => item !== eid)
        amount[eid] = 0
    }
}
function onPlayerDamagingOtherPlayer(id,id1,dmg,itm){
    if (itm === "Arrow"){
        ex(api.getPosition(id1))
    }
}
