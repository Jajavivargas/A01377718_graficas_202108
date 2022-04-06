//Utilicé como base el código de threeJSScene  y lo modifiqué
   
"use strict"; 

import * as THREE from "../common/three.module.js"
import {addMouseHandler} from "./sceneHandler.js"

let renderer = null, scene = null, camera = null, armGroup = null, shoulder = null, arm = null, elbow = null, forearm = null, wrist = null, hand = null;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

/**
 * Runs the update loop: updates the objects in the scene
 */
 function update()
 {
     requestAnimationFrame(function() { update(); });
     renderer.render( scene, camera );
}
 
/**
 * Creates a basic scene with lights, a camera, and 3 objects
 * @param {canvas} canvas The canvas element to render on
 */
function createScene(canvas)
{   
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 20 );
    camera.position.z = 10;
    scene.add(camera);

    // Add a directional light to show off the objects
    const light = new THREE.DirectionalLight( 0xffffff, 1.0);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    const textureUrl = "../images/ash_uvgrid01.jpg";
    const texture = new THREE.TextureLoader().load(textureUrl);
    const material = new THREE.MeshPhongMaterial({ map: texture });

    // Creamos un grupo que sostendrá todos nuestro objetos
    armGroup = new THREE.Object3D;
    //Definimos las texturas que utilizaremos en el brazo
    let skinMaterial = new THREE.MeshBasicMaterial({color: 0x3D86BF});
    let jointMaterial = new THREE.MeshBasicMaterial({color: 0x09090B});
    //Definimos la geometria y creamos el mesh que contiene geometría y material de cada parte del brazo
    let shoulderGeometry = new THREE.BoxGeometry(0.4,0.4,0.4);
    shoulder = new THREE.Mesh(shoulderGeometry, jointMaterial);

    let armGeometry = new THREE.BoxGeometry(1,0.6,0.6);
    arm = new THREE.Mesh(armGeometry, skinMaterial);

    let elbowGeometry = new THREE.BoxGeometry(0.4,0.4,0.4);
    elbow = new THREE.Mesh(elbowGeometry, jointMaterial);

    let forearmGeometry = new THREE.BoxGeometry(0.4,1,0.4);
    forearm = new THREE.Mesh(forearmGeometry, skinMaterial);

    let wristGeometry = new THREE.BoxGeometry(0.3,0.3,0.3);
    wrist = new THREE.Mesh(wristGeometry, jointMaterial);

    let handGeometry = new THREE.BoxGeometry(0.4,0.4,0.4);
    hand = new THREE.Mesh(handGeometry, skinMaterial);

    //Añadimos el grupo a la escena y creamos la jerarquía con la que el objeto/mesh padre moverá a los objetos/meshes hijos
    scene.add(armGroup);
    armGroup.add(shoulder);
    shoulder.add(arm);
    arm.add(elbow);
    elbow.add(forearm);
    forearm.add(wrist);
    wrist.add(hand);

    //Definimos la posición inicial relativa para cada parte del brazo
    arm.position.set(0.7, 0, 0);
    elbow.position.set(0.7, 0, 0);
    forearm.position.set(0, 0.7, 0);
    wrist.position.set(0, 0.65, 0);
    hand.position.set(0, 0.35, 0);

    // añadimos el mouse handler para rotar la escena, escalar el grupo y rotar las distintas partes del brazo
    addMouseHandler(canvas, armGroup, shoulder, arm, elbow, forearm, wrist, hand);
    armGroup.updateMatrixWorld();
}

main();