class WaterWall {
  constructor(poolWidth=30, poolHeight=30, sideLength=2){
    this.poolWidth = poolWidth;
    this.poolHeight = poolHeight;
    this.sideLength = sideLength;
    this.waterObjects = [];
    this.fs_water = document.getElementById('waterFrag').textContent;
    this.vs_water = document.getElementById('waterVert').textContent;
    this.pivot = new THREE.Group();
    scene.add(this.pivot);
  }

    moveX(offset){
      this.pivot.position.x += offset;
    }
    moveY(offset){
        this.pivot.position.y +=offset;
    }
    moveZ(offset){
      this.pivot.position.z +=offset;
    }

    rotateX(offset){
      this.pivot.rotation.x += offset;
    }
    rotateY(offset){
        this.pivot.rotation.y += offset;
    }
    rotateZ(offset){
        this.pivot.rotation.z += offset;
    }

    addWaterWall(){
      var light = new THREE.DirectionalLight("rgb(200,200,255)");
      light.position.z = 2;
      objectsInScene.push(light);
      this.waterObjects.push(light);
    //  scene.add(light);
      this.addWater();
      for(let i =0; i < 4; i++){
        this.addWall(i);
      }
      this.addFloor();
      for(let i =0; i < this.waterObjects.length; i++){
        this.pivot.add(this.waterObjects[i]);
      }
      objectsInScene.push(this.pivot);
    }
    addWater(){
      const geometry = new THREE.PlaneBufferGeometry( this.poolWidth, this.poolHeight, 100 ,100); //(width, height, widthSegments, heightSegments)
      const mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: this.vs_water, fragmentShader: this.fs_water});
      mat.transparent = true;
      // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      var ground = new THREE.Mesh( geometry, mat );
  //    scene.add(ground);
      ground.rotation.x = Math.PI/2;
      ground.rotation.y = Math.PI ;
      ground.position.y = -playerHeight;
      this.waterObjects.push(ground);
    }
    addWall(idx){
      var widthOffs_wateret = 0;
      var posZCoeff = 1;
      var posXCoeff = 0;
      var yRot = Math.PI;
      switch(idx){
        case 0: //RIGHT
        posZCoeff = -1;
        break;
        case 1: //LEFT
        break;
        case 2://TOP
        widthOffs_wateret = this.sideLength;
        posXCoeff = 1;
        posZCoeff = 0;
        yRot /= 2;
        break;
        case 3://BOTTOM
        widthOffs_wateret = this.sideLength;
        posXCoeff = -1;
        posZCoeff = 0;
        yRot /= 2;
        break;
      }
      const geometry_ = new THREE.BoxGeometry( this.poolWidth+widthOffs_wateret, 5,this.sideLength); //(width, height, depth)
      const mat_ = new THREE.MeshPhongMaterial({color: 0x999999, reflectivity: 0.5});
      // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      var right = new THREE.Mesh( geometry_, mat_ );
    //  scene.add(right);
      right.position.z +=	posZCoeff*this.poolWidth/2;
      right.position.x +=	posXCoeff*this.poolWidth/2;
      right.rotation.x = Math.PI;
      right.rotation.y = yRot ;
      right.position.y = -playerHeight;
      this.waterObjects.push(right);
    }


    addFloor(){
      const geometry_ = new THREE.BoxGeometry( this.poolWidth+this.sideLength, this.poolHeight+this.sideLength,this.sideLength); //(width, height, depth)
      const mat_ = new THREE.MeshPhongMaterial({color: 0x999999, reflectivity: 0.5});
      // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      var right = new THREE.Mesh( geometry_, mat_ );
      //scene.add(right);
      right.rotation.x = Math.PI/2;
      right.rotation.y = Math.PI ;
      right.position.y = -playerHeight*1.5; //1.2 creates cool effect
      this.waterObjects.push(right);
    }

}
