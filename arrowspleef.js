function onPlayerThrowableHitTerrain(id,name,eid){
	api.log(id,name,eid)
    if (name === "Arrow"){
        api.setBlock([Math.floor(api.getPosition(eid)[0]),Math.floor(api.getPosition(eid)[1])-1,Math.floor(api.getPosition(eid)[2])],"Air")
        
    }
}
