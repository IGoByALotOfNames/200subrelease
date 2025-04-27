track = []
function onPlayerUsedThrowable(id,name,eid){
    track.push(eid)
}
function tick(){
    for (i=0;i<track.length;i++){
        try{
            pos_e = api.getPosition(track[i])
            bp= [Math.floor(pos_e[0]),Math.floor(pos_e[1]),Math.floor(pos_e[2])]
            bOnP = api.getBlock(bp)
            if (bOnP === "Water"){
                api.setVelocity(track[i],0,5,0)

            }
        }catch{
            track = track.filter(item => item !== track[i])
        }
    }
}
function onPlayerThrowableHitTerrain(id,name,eid){
    track = track.filter(item => item !== eid)
}
