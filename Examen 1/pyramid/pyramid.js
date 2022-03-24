let projectionMatrix = null, shaderProgram = null;

let shaderVertexPositionAttribute = null, shaderVertexColorAttribute = null, shaderProjectionMatrixUniform = null, shaderModelViewMatrixUniform = null;

let mat4 = glMatrix.mat4;

let duration = 10000;

let vertexShaderSource = `#version 300 es
in vec3 vertexPos;
in vec4 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec4 vColor;

void main(void) {
    // Return the transformed and projected vertex value
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
    // Output the vertexColor in vColor
    vColor = vertexColor;
}`;

let fragmentShaderSource = `#version 300 es
    precision lowp float;
    in vec4 vColor;
    out vec4 fragColor;

    void main(void) {
    // Return the pixel color: always output white
    fragColor = vColor;
}
`;

function createShader(glCtx, str, type)
{
    let shader = null;
    
    if (type == "fragment") 
        shader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
    else if (type == "vertex")
        shader = glCtx.createShader(glCtx.VERTEX_SHADER);
    else
        return null;

    glCtx.shaderSource(shader, str);
    glCtx.compileShader(shader);

    if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        throw new Error(glCtx.getShaderInfoLog(shader));
    }

    return shader;
}

function initShader(glCtx, vertexShaderSource, fragmentShaderSource)
{
    const vertexShader = createShader(glCtx, vertexShaderSource, "vertex");
    const fragmentShader = createShader(glCtx, fragmentShaderSource, "fragment");

    let shaderProgram = glCtx.createProgram();

    glCtx.attachShader(shaderProgram, vertexShader);
    glCtx.attachShader(shaderProgram, fragmentShader);
    glCtx.linkProgram(shaderProgram);
    
    if (!glCtx.getProgramParameter(shaderProgram, glCtx.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    return shaderProgram;
}

function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("webgl2");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(const obj of objs)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}


function createPyramid(gl, translation, rotationAxis) 
{
    let verts = [];
    //Llamamos esta función 4 veces, una por cada cara de nuestra pirámide
    drawSierpinsky(2, 0, verts, [-2.0, 0.0, 0.0],[2.0, 0.0, 0.0],[0.0, 0.0, 3.46]) //ABC
    drawSierpinsky(2, 0, verts, [2.0, 0.0, 0.0],[0.0, 0.0, 3.46],[0.0, 3.0, 1.15]) //BCD
    drawSierpinsky(2, 0, verts, [0.0, 0.0, 3.46],[-2.0, 0.0, 0.0],[0.0, 3.0, 1.15]) //CAD
    drawSierpinsky(2, 0, verts, [-2.0, 0.0, 0.0],[2.0, 0.0, 0.0],[0.0, 3.0, 1.15]) //ABD
    
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);


    let faceColors = [
        //Hola profe aunque no lo parezca cada triangulin tiene un color distinto
        //Cara verde
        [0.372, 0.513, 0.494, 1.0],
        [0.450, 0.619, 0.6, 1.0],
        [0.498, 0.682, 0.658, 1.0],
        [0.337, 0.466, 0.450, 1.0],
        [0.278, 0.384, 0.372, 1.0],
        [0.305, 0.423, 0.411, 1.0],
        [0.603, 0.823, 0.796, 1.0],
        [0.549, 0.749, 0.725, 1.0],
        [0.254, 0.349, 0.337, 1.0],

        //Cara azul
        [0.337, 0.490, 0.674, 1.0],
        [0.411, 0.596, 0.815, 1.0],
        [0.458, 0.607, 0.874, 1.0],
        [0.278, 0.407, 0.556, 1.0],
        [0.211, 0.305, 0.415, 1.0],
        [0.231, 0.337, 0.458, 1.0],
        [0.254, 0.372, 0.505, 1.0],
        [0.372, 0.541, 0.741, 1.0],
        [0.305, 0.447, 0.611, 1.0],
        
        //Cara roja
        [0.596, 0.305, 0.305, 1.0],
        [0.882, 0.501, 0.501, 1.0],
        [0.721, 0.372, 0.372, 1.0],
        [0.792, 0.411, 0.411, 1.0],
        [0.870, 0.450, 0.450, 1.0],
        [0.894, 0.549, 0.549, 1.0],
        [0.654, 0.337, 0.337, 1.0],
        [0.541, 0.278, 0.278, 1.0],
        [0.901, 0.588, 0.588, 1.0],
        
        //Cara amarilla
        [0.945, 1, 0.533, 1.0],
        [0.729, 0.792, 0.301, 1.0],
        [0.941, 1, 0.486, 1.0],
        [0.937, 1, 0.435, 1.0],
        [0.843, 0.909, 0.345, 1.0],
        [0.929, 1, 0.380, 1.0],
        [0.764, 0.827, 0.313, 1.0],
        [0.956, 1, 0.631, 1.0],
        [0.949, 1, 0.576, 1.0]
        
    ];
    // Color data
    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let i=0; i < 3; i++)
            vertexColors.push(...color);
    });

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    //Son 108 índices porque cada cara tiene 9 triángulos y cada triángulo tiene 3 vértices, son 4 caras 9x3x4=108
    let pyramidIndices = [
        0, 1, 2,          
        3, 4, 5,          
        6, 7, 8,          
        9, 10, 11,
        12, 13, 14,       
        15, 16, 17,       
        18, 19, 20,
        21, 22, 23, 
        24, 25, 26,
        27, 28, 29,
        30, 31, 32,
        33, 34, 35,
        36, 37, 38,
        39, 40, 41,
        42, 43, 44,       
        45, 46, 47,       
        48, 49, 50,
        51, 52, 53, 
        54, 55, 56,
        57, 58, 59,
        60, 61, 62,
        63, 64, 65,
        66, 67, 68,
        69, 70, 71,
        72, 73, 74,       
        75, 76, 77,       
        78, 79, 80,
        81, 82, 83, 
        84, 85, 86,
        87, 88, 89,
        90, 91, 92,
        93, 94, 95,
        96, 97, 98,
        99, 100, 101,
        102, 103, 104,       
        105, 106, 107,       
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    let pyramid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:verts.length/3, colorSize:4, nColors: vertexColors.length / 4, nIndices: pyramidIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);
    mat4.rotate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, Math.PI/8, [1, 0, 0]);

    pyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

function update(glCtx, objs)
{
    requestAnimationFrame(()=>update(glCtx, objs));

    draw(glCtx, objs);
    objs.forEach(obj => obj.update())
}

function bindShaderAttributes(glCtx, shaderProgram)
{
    shaderVertexPositionAttribute = glCtx.getAttribLocation(shaderProgram, "vertexPos");
    glCtx.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = glCtx.getAttribLocation(shaderProgram, "vertexColor");
    glCtx.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = glCtx.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = glCtx.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function main()
{
    let canvas = document.getElementById("pyramidCanvas");
    let glCtx = initWebGL(canvas);

    initViewport(glCtx, canvas);
    initGL(glCtx, canvas);

    //Aqui inicializamos nuestra pirámide, la coloqué en -1, 0 , -9 y le ponemos una rotación de 0, 1, 0 para que 
    //gire alrededor del eje y 
    let pyramid = createPyramid(glCtx,  [-1, 0, -9], [0, 1, 0]);

    shaderProgram = initShader(glCtx, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(glCtx, shaderProgram);

    update(glCtx, [pyramid]);
}

//Esta es mi función drawSierpinsky, adapté la función recursiva que tenía en mi tarea para funcionar en 3 dimensiones 
//Recibe el máximo número de iteraciones al que debe llegar, "step" es la iteración actual y 3 vértices, el vértice de
//la inzquierda, derecha y arriba,cada vértice tiene 3 elementos su "x", "y" y su "z" 
function drawSierpinsky(max, step, verts, left, right, top){

    //El caso base es dibujar un triangulo
    if(step == max){
        verts.push(left[0], left[1], left[2])
        verts.push(right[0], right[1], right[2])
        verts.push(top[0], top[1], top[2])
        
    }else{
        //triangulo izquierda chiquito
        drawSierpinsky(max, step+1, verts, left, 
        [(left[0]+right[0])/2, (left[1]+right[1])/2, (left[2]+right[2])/2], 
        [(left[0]+top[0])/2, (left[1]+top[1])/2, (left[2]+top[2])/2])
        //triangulo derecha chiquito
        drawSierpinsky(max, step+1, verts, [(left[0]+right[0])/2, (left[1]+right[1])/2, (left[2]+right[2])/2], 
        right, 
        [(top[0]+right[0])/2, (top[1]+right[1])/2, (top[2]+right[2])/2])
        //triangulo arriba chiquito
        drawSierpinsky(max, step+1, verts, [(left[0]+top[0])/2, (left[1]+top[1])/2, (left[2]+top[2])/2],
        [(top[0]+right[0])/2, (top[1]+right[1])/2, (top[2]+right[2])/2], 
        top)
    }

}


main();