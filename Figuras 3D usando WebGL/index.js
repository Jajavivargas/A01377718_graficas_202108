// Tarea Figuras 3D con WebGL
// Javier Alexandro Vargas Sanchez
// A01377718
// Utilicé como base el programa 3d_cube.js
"use strict";

import * as shaderUtils from '../common/shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms

// in: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor * 0.8;
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

// En esta función inicializo  mis figuras 3D, defino la posición en la que aparecerán en el canvas
// así como su rotación al crearlas con sus respectivas funciones create
function main() 
{
    const canvas = document.getElementById("webglcanvas");
    const gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initGL(canvas);
    
    let octahedron = createOctahedron(gl, [4.5, -2, -3], [0, 1, 0]);
    let dodecahedron = createDodecahedron(gl, [0.8, 0, -2], [-0.4, 1.0, 0.1]);
    let scutoid = createScutoid(gl, [-7, -1, -8], [1.0, 1.0, 0.2]);
    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(gl, shaderProgram);

    update(gl, shaderProgram, [dodecahedron, scutoid, octahedron]);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    // mat4.orthoNO(projectionMatrix, -4, 4, -3.5, 3.5, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -8]);
}

//Esta es mi función para crear el octaedro 
function createOctahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face top
       -1.0, -1.0, 1.0,
        0.0, -1.0, 1.0,
       -0.5,  0.0, 0.5,
       
       // Back face top
       -1.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
       -0.5,  0.0, 0.5,
        
       // Left face top
       -1.0, -1.0, 0.0,
       -1.0, -1.0, 1.0,
        -0.5,  0.0, 0.5,

       // Right face top
        0.0, -1.0,  1.0,
        0.0, -1.0,  0.0,
       -0.5,  0.0,  0.5,

       //Front face bottom
       -1.0, -1.0, 1.0,
        0.0, -1.0, 1.0,
       -0.5, -2.0, 0.5,

      //Back face bottom
       -1.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
       -0.5, -2.0, 0.5,

      //Left face bottom
       -1.0, -1.0, 0.0,
       -1.0, -1.0, 1.0,
       -0.5, -2.0, 0.5,

      //Right face bottom
        0.0, -1.0,  1.0,
        0.0, -1.0,  0.0,
        -0.5, -2.0, 0.5,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    //En este arreglo colocamos un color por cada cara de la figura 3D, para conseguir mis colores use https://coolors.co/
    // Y para cambiarlos a términos de 0 a 1 en vez de 0 a 255, utilicé https://doc.instantreality.org/tools/color_calculator/
    let faceColors = [
        [0.909, 0.682, 0.717, 1.0], // Front face
        [0.721, 0.882, 1, 1.0], // Back face
        [0.662, 1, 0.968, 1.0], // Left face
        [0.580, 0.984, 0.670, 1.0], // Right face
        [0.509, 0.670, 0.631, 1.0], // Front face
        [1, 0.949, 0.458, 1.0], // Back face
        [0.635, 0.243, 0.282, 1.0], // Left face
        [0.117, 0.176, 0.184, 1.0],  // Right face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2,          // Front face
        3, 4, 5,          // Back face
        6, 7, 8,          // Top face
        9, 10, 11,
        12, 13, 14,       // Bottom face
        15, 16, 17,       // Right face
        18, 19, 20,
        21, 22, 23        // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    let octahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
    let contador = 1


    //Para conseguir subir y bajar el octaedro inicialicé un contador que va de 1 a 26 y se reinicia en 0
    //este aumenta en función del tiempo de la app,
    //definí 13 como el punto medio del contador, pues la mitad del tiempo sube y la otra mitad baja
    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        
        contador += 0.1
        if(contador < 13 ){
            mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0.0,0.05,0.0]);
        }else if(contador > 13){
            mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0.0,-0.05,0.0]);
        }
        if(contador > 26){
            contador = 0
        }
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octahedron;
}

//Esta es mi función para crear el dodecaedro
function createDodecahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Los vértices de este dodecaedro los conseguí de está página https://www.geogebra.org/classic/c6upktjh
    let verts = [
       // Front face 
        1.62, -0.62, 0.0,
        1.62, 0.62, 0.0,
        0.62, 0.0, 1.62,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        
       // Front top right
       0.62, 0.0, 1.62,
       1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,
       0.0, 1.62, 0.62,
      -0.62,  0.0, 1.62,
        
       // Front top left
       1.0, -1.0, 1.0, 
       0.62, 0.0, 1.62,
      -1.0, -1.0, 1.0, 
      -0.62, 0.0, 1.62,
       0.0, -1.62, 0.62,

       // Front bottom right
        1.0, 1.0, 1.0,
        1.62, 0.62, 0.0,
        0.0, 1.62, -0.62,
        1.0, 1.0, -1.0,
        0.0, 1.62, 0.62,

       //Front bottom left
       0.0, -1.62, -0.62,
       1.0, -1.0, -1.0,
       1.0, -1.0, 1.0,
       1.62, -0.62, 0.0,
       0.0, -1.62, 0.62,
       
      //Front bottom 
      1.0, -1.0, -1.0,
      0.62, 0.0, -1.62,
      1.62, 0.62, 0.0,
      1.0, 1.0, -1.0,
      1.62, -0.62, 0.0,
      
       
       //Back face
       -1.0, 1.0, -1.0,
       -0.62, 0.0, -1.62,
       -1.62, -0.62, 0.0,
       -1.0, -1.0, -1.0,
       -1.62, 0.62, 0.0,

       //Back top right
       -1.62, -0.62, 0.0,
       -1.0, -1.0, -1.0,
       0.0, -1.62, 0.62,
       0.0, -1.62, -0.62,
       -1.0, -1.0, 1.0,

       //Back top left
       -1.62, 0.62, 0.0,
       -1.62, -0.62, 0.0,
       -0.62, 0.0, 1.62,
       -1.0, -1.0, 1.0,
       -1.0, 1.0, 1.0,
       
       //Back bottom right
       -1.0, -1.0, -1.0,
       -0.62, 0.0, -1.62,
        1.0, -1.0, -1.0,
        0.62, 0.0, -1.62,
        0.0, -1.62, -0.62,

       //Back bottom left
       0.0, 1.62, -0.62,
       -1.0, 1.0, -1.0,
       -1.0, 1.0, 1.0,
       -1.62, 0.62, 0.0,
       0.0, 1.62, 0.62,


       //Back bottom
       -0.62, 0.0, -1.62,
       -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        0.0, 1.62, -0.62,
        0.62, 0.0, -1.62

       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [0.090, 0.721, 0.564, 1.0], // Front face 
        [0.341, 0.768, 0.898, 1.0], // Top right 
        [0.133, 0.486, 0.615, 1.0], // Top left 
        [0.109, 0.156, 0.149, 1.0], // Bottom right  
        [0.968, 0.556, 0.411, 1.0], // Bottom left  
        [0, 0.164, 0.196, 1.0], // Bottom 
        [0.792, 0.019, 0.301, 1.0], // Back face
        [0.098, 0.482, 0.741, 1.0],  // Top right 
        [0.968, 0.556, 0.411, 1.0], // Top left 
        [0.176, 0.188, 0.278, 1.0], // Bottom right 
        [0.615, 0.772, 0.733, 1.0], // Bottom left 
        [0.870, 0.898, 0.898, 1.0], // Bottom 

    ];

    let vertexColors = [];
    
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    //Para crear el "mesh" con la primitiva triangular dividí cada cara del dodecaedro en 3 triángulos
    let dodecahedronIndices = [
        0, 1, 2,    1, 2, 3,   0, 2, 4,          // Front face
        5, 6, 7,    6, 7, 8,   5, 7, 9,                          
       10,11,12,   11,12,13,  10,12,14,                           
       15,16,17,   16,17,18,  15,17,19,
       20,21,22,   21,22,23,  20,22,24,                           
       25,26,27,   26,27,28,  25,27,29,                            
       30,31,32,   31,32,33,  30,32,34,                           
       35,36,37,   36,37,38,  35,37,39,
       40,41,42,   41,42,43,  40,42,44,                           
       45,46,47,   46,47,48,  45,47,49,
       50,51,52,   51,52,53,  50,52,54,                           
       55,56,57,   56,57,58,  55,57,59                             
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    let dodecahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 48, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}

//Esta es mi función para crear el escutoide
function createScutoid(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Las coordenadas de los vértices para este escutoide fueron obtenidas aquí https://www.geogebra.org/classic/xvvzmpfy
    let verts = [
       // Bottom face 
       0.0, 0.0, 0.0, // A
       2.0, 0.0, 0.0, // B
       1.0, 0.0, 3.2, // D
       2.62, 0.0, 1.9,// C
       -0.62, 0.0, 1.9,// E
       
       
       // Top face
       0.22, 3.4, -0.36,// J 
        1.96, 3.4, -0.07,// K
       1.46,  3.4, 2.93,// M
       2.58, 3.4, 1.58,// L
       -0.28, 3.4, 2.65, // C hex
       -0.9, 3.4, 1.0, // B hex
        
       // Front face
       0.0, 0.0, 0.0, // A
       2.0, 0.0, 0.0, // B
       0.22, 3.4, -0.36,// J 
       1.96, 3.4, -0.07,// K

       // Right face 
       2.0, 0.0, 0.0, // B
       2.62, 0.0, 1.9,// C
       1.96, 3.4, -0.07,// K
       2.58, 3.4, 1.58,// L

       //Back right face
       2.62, 0.0, 1.9,// C
       1.0, 0.0, 3.2, // D
       2.58, 3.4, 1.58, // L
       1.46, 3.4, 2.93,// M
       

      //Triangle face
       -0.62, 1.5, 1.9, //PICO
       -0.28, 3.4, 2.65, // C hex
       -0.9, 3.4, 1.0, // B hex

      //Left face bottom
      1.0, 0.0, 3.2, // D
       -0.62, 0.0, 1.9,// E
      -0.62, 1.5, 1.9, //PICO
       -0.28, 3.4, 2.65, // C hex
       1.46,  3.4, 2.93,// M

      //Right face bottom
      -0.62, 0.0, 1.9,// E
       0.0, 0.0, 0.0, // A
      -0.9, 3.4, 1.0, // B hex
       0.22, 3.4, -0.36, // J 
      -0.62, 1.5, 1.9 //PICO
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [0.909, 0.682, 0.717, 1.0], // Bottom face rojo rosita
        [0.721, 0.882, 1, 1.0], // Top face azul claro
        [0.662, 1, 0.968, 1.0], // Front face azul claro verde
        [0.580, 0.984, 0.670, 1.0], // Right face verde aqua claro
        [0.509, 0.670, 0.631, 1.0], // Back right face verde aqua osc
        [1, 0.949, 0.458, 1.0], // Triangle face amarillo
        [0.635, 0.243, 0.282, 1.0], // Left face below dark red
        [0.117, 0.176, 0.184, 1.0],  // Right face below black
    ];

    let vertexColors = [];
    
    //No entendí muy bien cómo hacer que no existieran degradados en mi figura, sin embargo considero que es visible cada cara
    faceColors.forEach(color =>{
        if(color[0] || color[6] || color[7]){
            for (let j=0; j < 5; j++)
            vertexColors.push(...color);
        }else if(color[2] || color[3] || color [4]){
            for (let j=0; j < 4; j++)
            vertexColors.push(...color);
        }else if(color[5]){
            for (let j=0; j < 3; j++)
            vertexColors.push(...color);
        }else{
            for (let j=0; j < 6; j++)
            vertexColors.push(...color);
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);

    //Los índices para esta figura no tienen un patrón 
    //Para la caras con 5 vértices fueron 3 triángulos 
    //Para la cara hexagonal fueron 4 triángulos
    //Para las caras con 4 vértices fueron 2 triángulos
    let scutoidIndices = [
        0, 1, 2,    1, 2, 3,    0, 2, 4, // Bottom face
        5, 6, 7,    6, 7, 8,    5, 7, 9,   5, 9, 10, // Top face
        11, 12, 13, 12, 13, 14, // Front face
        15, 16, 17, 16, 17, 18, //Right face 33
        19, 20, 21, 20, 21, 22, //Back right face
        23, 24, 25, // Triangle face 42
        26, 27, 28, 26, 28, 29, 26, 29, 30, //Below left 51
        31, 32, 33, 32, 33, 34, 31, 33, 35 //Below right
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);
    
    let scutoid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:36, colorSize:4, nColors: 24, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return scutoid;
}

function bindShaderAttributes(gl, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(gl, shaderProgram, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
    // for(const obj of objs)
    //     obj.update();
    // for(let i = 0; i<objs.length; i++)
    //     objs[i].update();
}

main();