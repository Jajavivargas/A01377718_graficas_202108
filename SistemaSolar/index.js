import * as THREE from "../common/three.module.js"
import { OrbitControls } from '../common/OrbitControls.js';
import { OBJLoader } from '../common/OBJLoader.js';
let renderer = null, scene = null, camera = null, orbitControls = null, sun = null, mercury = null, venus = null, earth = null, mars = null, jupiter = null, saturn = null, uranus = null, neptune = null, pluto = null, moon = null, jMoon = null

const duration = 5000; // ms
let currentTime = Date.now();

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

class Sphere{
    constructor(parent, speed, objectRadius, orbitRadius, textureFile, isPlanet, isJMoon, isSun){
        this.speed = speed
        this.objectRadius = objectRadius
        this.orbitRadius = orbitRadius
        this.degrees = 0
        this.isPlanet = isPlanet
        this.isJMoon= isJMoon
        this.isSun= isSun
        const texture = new THREE.TextureLoader().load(textureFile);
        if(isSun != true){
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(objectRadius),
            new THREE.MeshStandardMaterial({map: texture}));
        }else{
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(objectRadius),
            new THREE.MeshStandardMaterial({map: texture, emissive: 0xffffff, emissiveIntensity : 0.5}));
        }
        this.mesh.position.set(orbitRadius, 0, 0)
        this.mesh.geometry.rotateX(Math.PI/2);
        this.mesh.geometry.rotateZ(Math.PI/2);
        parent.add(this.mesh);
        if(isPlanet == true){
            const material = new THREE.LineBasicMaterial( { color: 0xffffff } ),
            orbitGeometry = new THREE.RingGeometry(orbitRadius, orbitRadius, 64);
            const orbit = new THREE.Line(orbitGeometry, material)
            scene.add(orbit);
        }else if(isJMoon == true){
            for(let i = 0; i < 65; i++){
                let newMoon = this.mesh.clone();
                let randomX = Math.random()*5;
                let randomY = Math.random()*5;
                let randomZ = Math.random()*5;
                randomX *= Math.round(Math.random()) ? 1 : -1;
                randomY *= Math.round(Math.random()) ? 1 : -1;
                randomZ *= Math.round(Math.random()) ? 1 : -1;
                newMoon.position.set(randomX,randomY, randomZ);
                parent.add(newMoon);
            }
        }
    }

    animate(){
        this.mesh.rotation.z += this.speed*0.01;
        let newX = this.orbitRadius * Math.cos(this.degrees*(Math.PI/180));
        let newY = this.orbitRadius * Math.sin(this.degrees*(Math.PI/180));

        this.mesh.position.x = newX;
        this.mesh.position.y = newY;
        this.degrees += this.speed*0.01;
    }
}

async function createAsteroids(parent){
    const texture = new THREE.TextureLoader().load("./assets/asteroid.jpg");
    const ast  = await new OBJLoader().loadAsync("./assets/asteroid.obj")
    ast.scale.set(0.0005, 0.0005, 0.0005);
    for (let i = 0; i < 600; i++){
        let newAst = ast.clone();
        let randomX = (Math.random() * (65-45) + 45)*Math.cos((Math.PI/180)*i);
        let randomZ = (Math.random() * (65-45) + 45)*Math.sin((Math.PI/180)*i);
        randomX *= Math.round(Math.random()) ? 1 : -1;
        randomZ *= Math.round(Math.random()) ? 1 : -1;
        newAst.position.set(randomX, randomZ, 0);
        parent.add(newAst)
    }
}

function update()
{
    requestAnimationFrame(function() { update(); });
    sun.animate()
    mercury.animate()
    venus.animate()
    earth.animate()
    mars.animate()
    jupiter.animate()
    saturn.animate()
    uranus.animate()
    neptune.animate()
    pluto.animate()
    moon.animate()
    jMoon.animate()
    
    // Render the scene
    renderer.render( scene, camera );
    orbitControls.update();
}

function createScene(canvas)
{   
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color( 0, 0, 0 );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 1000 );
    camera.position.y = 100;
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement);
    
    //Luz solar
    const sunLight = new THREE.PointLight( 0xffffff, 1);
    sunLight.position.set(0,0,0);
    scene.add(sunLight);


    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    sun = new Sphere(scene, 0.1, 7, 0, "./assets/sun.jpg",false, false, true)
    mercury = new Sphere(sun.mesh, 2, 1, 10, "assets/mercury.jpg", true)
    venus = new Sphere(sun.mesh, 1, 1.5, 20, "assets/venus.jpg", true)
    earth = new Sphere(sun.mesh, 3, 2, 30, "assets/earth.jpg", true)
    mars = new Sphere(sun.mesh, 4, 1.8, 40, "assets/mars.jpg", true)
    jupiter = new Sphere(sun.mesh, 5, 4.5, 70, "assets/jupiter.jpg", true)
    saturn = new Sphere(sun.mesh, 6, 3.5, 80, "assets/saturn.jpg", true)
    uranus = new Sphere(sun.mesh, 4.5, 2.2, 90, "assets/uranus.jpg", true)
    neptune = new Sphere(sun.mesh, 2.3, 1.8, 100, "assets/neptune.jpg", true)
    pluto = new Sphere(sun.mesh, 0.3, 0.5, 105, "assets/pluto.jpg", true)
    moon = new Sphere(earth.mesh, 3, 0.3, 3, "assets/moon.jpg", false)
    jMoon = new Sphere(jupiter.mesh, 0.0001, 0.2, 3, "assets/moon.jpg", false, true)
    createAsteroids(sun.mesh)
}

main();