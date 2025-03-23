class OBJLoader {
    constructor() {
        this.vertices = [];
        this.textureCoords = [];
        this.normals = [];
        this.indices = [];
    }

    loadOBJ(objText) {
        const vertexTemp = [];
        const texCoordTemp = [];
        const normalTemp = [];

        const lines = objText.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#') || line.length === 0) continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            switch (type) {
                case 'v': // Vertex position
                    vertexTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                case 'vt': // Texture coordinate
                    texCoordTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2])
                    );
                    break;
                case 'vn': // Vertex normal
                    normalTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                case 'f': // Face
                    for (let i = 1; i <= 3; i++) {
                        const indices = parts[i].split('/');
                        const vIndex = parseInt(indices[0]) - 1;
                        const vtIndex = indices[1] ? parseInt(indices[1]) - 1 : -1;
                        const vnIndex = indices[2] ? parseInt(indices[2]) - 1 : -1;

                        // Store the actual indices
                        this.indices.push(this.vertices.length / 3);
                        
                        // Store the vertex data
                        this.vertices.push(
                            vertexTemp[vIndex * 3],
                            vertexTemp[vIndex * 3 + 1],
                            vertexTemp[vIndex * 3 + 2]
                        );

                        if (vtIndex >= 0) {
                            this.textureCoords.push(
                                texCoordTemp[vtIndex * 2],
                                texCoordTemp[vtIndex * 2 + 1]
                            );
                        }

                        if (vnIndex >= 0) {
                            this.normals.push(
                                normalTemp[vnIndex * 3],
                                normalTemp[vnIndex * 3 + 1],
                                normalTemp[vnIndex * 3 + 2]
                            );
                        }
                    }
                    break;
            }
        }
        return this;
    }
}

// Model class to represent a 3D object
class Model {
    constructor(gl, vertexData, uvData, normalData, indexData, texture) {
        this.gl = gl;
        this.texture = texture;
        this.indexCount = indexData.length;
        
        // Position transform properties
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.modelMatrix = mat4.create();
        this.updateModelMatrix();
        
        // Create buffers
        this.buffers = {};
        
        // Create and populate the position buffer
        this.buffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

        // Create and populate the UV buffer
        this.buffers.uv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

        // Create and populate the normal buffer
        this.buffers.normal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

        // Create and populate the index buffer
        this.buffers.index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexData), gl.STATIC_DRAW);
    }
    
    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    setScale(x, y, z) {
        this.scale = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }
    
    rotateY(angle) {
        this.rotation[1] += angle;
        this.updateModelMatrix();
    }
    
    bindBuffers(program) {
        const gl = this.gl;
        
        // Set up attributes
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const uvLocation = gl.getAttribLocation(program, 'uv');
        gl.enableVertexAttribArray(uvLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

        const normalLocation = gl.getAttribLocation(program, 'normal');
        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
    }
    
    bindTexture() {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}

// Renderer class to handle individual WebGL contexts and rendering
class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        // Enable WebGL features
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        // Enable unsigned int extension
        const ext = this.gl.getExtension('OES_element_index_uint');
        if (!ext) {
            throw new Error('OES_element_index_uint extension not supported');
        }
        
        this.spinSpeed = 0;
        
        this.moveSpeed = 0;

        // Matrix storage
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.mvMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        this.normalMatrix = mat4.create();
        this.inverseViewMatrix = mat4.create();
        
        // Set up matrices
        this.setupProjectionMatrix();
        this.setupViewMatrix();
        
        // Compile shaders
        this.program = this.initShaders();
        
        // Storage for models
        this.models = [];
    }
    
    setupProjectionMatrix() {
        // Set up orthographic projection
        const aspect = this.canvas.width / this.canvas.height;
        const orthoSize = 4;
        mat4.ortho(
            this.projectionMatrix,
            -orthoSize * aspect,  // Left
            orthoSize * aspect,   // Right
            -orthoSize,           // Bottom
            orthoSize,            // Top
            1,                  // Near
            20                   // Far
        );
    }
    
    reProjectionMatrix(width, height) {
        const aspect = width / height;
        const orthoSize = height/500;
        mat4.ortho(
            this.projectionMatrix,
            -orthoSize * aspect,  // Left
            orthoSize * aspect,   // Right
            -orthoSize,           // Bottom
            orthoSize,            // Top
            1,                  // Near
            20                   // Far
        );
    }
    
    setupViewMatrix() {
        // Set up view matrix - position camera
        mat4.identity(this.viewMatrix);
        mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0.1, 10]);
        mat4.invert(this.viewMatrix, this.viewMatrix);
        
        // Compute the inverse view matrix for lighting calculations
        mat4.invert(this.inverseViewMatrix, this.viewMatrix);
    }

    initShaders() {
        const gl = this.gl;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `
            precision mediump float;

            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            varying vec2 vUV;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            uniform mat4 matrix;
            uniform mat4 normalMatrix;
            uniform mat4 modelMatrix;

            void main() {   
                vUV = uv;
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                vWorldNormal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);

                gl_Position = matrix * vec4(position, 1);
            }
        `);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
            precision mediump float;

            varying vec2 vUV;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            uniform sampler2D textureID;
            uniform mat4 inverseViewMatrix;
            
            const vec3 lightDirection = normalize(vec3(0, 1.0, 1.0));
            const float ambient = 0.3;
            const float shininess = 30.0;
            const vec3 specularColor = vec3(1.0,1.0,1.0);

            void main() {
              
                // Normalize the interpolated normal
                vec3 normal = normalize(vWorldNormal);
                
                // Compute diffuse lighting
                float diffuse = max(dot(normal, lightDirection), 0.0);
                
                // Compute view direction (camera position is at (0,0,0) in view space)
                vec3 cameraPosition = (inverseViewMatrix * vec4(0, 0, 0, 1)).xyz;
                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                
                // Compute specular lighting using Blinn-Phong reflection model
                vec3 halfVector = normalize(lightDirection + viewDir);
                float specular = pow(max(dot(normal, halfVector), 0.0), shininess);

                vec2 newT = vec2(vUV.x, -vUV.y);

                // Get texture color
                vec4 texel = texture2D(textureID, newT);
                
                if (texel.a < 0.5) {
                    discard;
                }
                
                // Apply lighting
                vec3 color = texel.xyz * (ambient + diffuse) + specular * specularColor;

                gl_FragColor = vec4(color, texel.a);
            }
        `);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
        }

        gl.useProgram(program);

        // Store uniform locations
        this.uniformLocations = {
            matrix: gl.getUniformLocation(program, 'matrix'),
            normalMatrix: gl.getUniformLocation(program, 'normalMatrix'),
            modelMatrix: gl.getUniformLocation(program, 'modelMatrix'),
            textureID: gl.getUniformLocation(program, 'textureID'),
            inverseViewMatrix: gl.getUniformLocation(program, 'inverseViewMatrix'),
        };

        gl.uniform1i(this.uniformLocations.textureID, 0);
        
        return program;
    }

    loadTexture(url) {
        const gl = this.gl;
        const texture = gl.createTexture();
        const image = new Image();

        image.onload = e => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            
            
            // Set texture parameters
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            
        };

        image.src = url;
        return texture;
    }
    
    async addModel(objUrl, textureUrl, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
        // Load and set up object
        const objLoader = new OBJLoader();
        const objText = await (await fetch(objUrl)).text();
        await objLoader.loadOBJ(objText);
        
        // Load texture
        const texture = this.loadTexture(textureUrl);
        
        // Create model
        const model = new Model(
            this.gl, 
            objLoader.vertices,
            objLoader.textureCoords,
            objLoader.normals,
            objLoader.indices,
            texture
        );
        
        // Set position, rotation, and scale
        model.setPosition(position[0], position[1], position[2])
             .setRotation(rotation[0], rotation[1], rotation[2])
             .setScale(scale[0], scale[1], scale[2]);
        
        // Add to models array
        this.models.push(model);
        
        return model;
    }
    
    async addModel2(objLoader, texture, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
        
        // Create model
        const model = new Model(
            this.gl, 
            objLoader.vertices,
            objLoader.textureCoords,
            objLoader.normals,
            objLoader.indices,
            texture
        );
        
        // Set position, rotation, and scale
        model.setPosition(position[0], position[1], position[2])
             .setRotation(rotation[0], rotation[1], rotation[2])
             .setScale(scale[0], scale[1], scale[2]);
        
        // Add to models array
        this.models.push(model);
        
        return model;
    }
    
    render(spinSpeed, moveSpeed) {
        const gl = this.gl;
        
        // Clear the canvas
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Update all models (e.g., rotation)
        this.models.forEach(model => {
            model.rotateY(Math.PI * spinSpeed); // Rotate at a constant speed or use deltaTime
        });
        
        this.models.forEach(model => {
            if (model.position[1] < -10) {
                model.position[1] = 10
            }
            model.setPosition(model.position[0], model.position[1] - moveSpeed, model.position[2]);
        });

        // Set the inverse view matrix once for all models
        gl.uniformMatrix4fv(this.uniformLocations.inverseViewMatrix, false, this.inverseViewMatrix);
        
        // Render each model
        this.models.forEach(model => {
            // Bind the model's buffers
            model.bindBuffers(this.program);
            
            // Bind the model's texture
            model.bindTexture();
            
            // Compute the model-view-projection matrix
            mat4.multiply(this.mvMatrix, this.viewMatrix, model.modelMatrix);
            mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.mvMatrix);
            
            // Compute the normal matrix
            mat4.invert(this.normalMatrix, this.mvMatrix);
            mat4.transpose(this.normalMatrix, this.normalMatrix);
            
            // Set uniforms for this model
            gl.uniformMatrix4fv(this.uniformLocations.normalMatrix, false, this.normalMatrix);
            gl.uniformMatrix4fv(this.uniformLocations.matrix, false, this.mvpMatrix);
            gl.uniformMatrix4fv(this.uniformLocations.modelMatrix, false, model.modelMatrix);
            
            // Draw the model
            gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_INT, 0);
        });
    }
}

// Main application code
const renderers = new Map();

// Create a renderer for a canvas
async function createRenderer(canvasId) {
    const canvas = document.getElementById(canvasId);
    const renderer = new WebGLRenderer(canvas);
    renderers.set(canvasId, renderer);
    return renderer;
}

async function getRenderer(canvasId) {
    if (!renderers.has(canvasId)) {
        console.warn(`Renderer for canvasId "${canvasId}" does not exist.`);
        return null;
    }
    return renderers.get(canvasId);
}

function animate() {
    requestAnimationFrame(() => animate());
    
    // Render all scenes
    for (const renderer of renderers.values()) {
        renderer.render(renderer.spinSpeed, renderer.moveSpeed);
    }
}

export async function update_projection(width, height) {
    const renderer2 = await getRenderer('canvas1');
    
    renderer2.reProjectionMatrix(width, height);
    
    renderer2.gl.viewport(0,0,width, height);
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export async function create_background_models(renderer) {
    const objLoader = new OBJLoader();
    const objText = await (await fetch('objects/noob.obj')).text();
    await objLoader.loadOBJ(objText);
    
    const texture = renderer.loadTexture('textures/noob.png');
    
    const scale = 0.1;
    
    for (let i = 0; i < 500; i++) {
        const randomX = getRandomFloat(-5,5);
        const randomY = getRandomFloat(-10,10);
        
        const rotX = getRandomFloat(-Math.PI, Math.PI);
        const rotY = getRandomFloat(-Math.PI, Math.PI);
        const rotZ = getRandomFloat(-Math.PI, Math.PI);
        
        await renderer.addModel2(objLoader, texture, [randomX,randomY,0], [scale,scale,scale], [rotX,rotY,rotZ]);
    }
}

export async function draw() {
    const renderer1 = await createRenderer('canvas1');

    create_background_models(renderer1);

    renderer1.spinSpeed = 0.002;
    
    renderer1.moveSpeed = 0.002;

    animate();
}
