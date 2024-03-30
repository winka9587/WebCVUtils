// import * as THREE from 'three';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
// import { GUI } from 'dat.gui';
// import * as THREE from 'three';

// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { TransformControls } from 'three/addons/controls/TransformControls.js';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'dat.gui';

// import { GUI } from 'dat.gui';
import { updateRotationInGUI } from './utils/rad2degree.js';



const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa); // 设置背景颜色以避免黑色背景

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);





//Grid
// 创建一个大小为 500x500，每格1单位的网格，并设置网格颜色
const gridSize = 500;
const gridDivisions = 100;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xCCCCCC, 0x888888);

// 将网格添加到场景中
scene.add(gridHelper);

// Cameras
const cam1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00000001, 100000);
cam1.position.set(0, 0, 0);
const cam1_helper = new THREE.CameraHelper( cam1 );
scene.add( cam1_helper );

const cam2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00000001, 100000);
cam2.position.set(500, 500, 500);
let activeCamera = cam2;

// OrbitControls for cam2
const orbitControls = new OrbitControls(cam2, renderer.domElement);

// TransformControls for interactive object manipulation
const transformControls = new TransformControls(activeCamera, renderer.domElement);
transformControls.addEventListener('dragging-changed', function (event) {
    orbitControls.enabled = !event.value;
});
scene.add(transformControls);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 定义一个常量来存储 cam1 不显示的对象所在的图层索引
const cam1HideLayerIndex = 1;  // 使用图层 1 作为 cam1 不显示的对象所在的图层
// 将 TransformControls 和 GridHelper 分配到 cam1HideLayer
transformControls.layers.set(cam1HideLayerIndex);
gridHelper.layers.set(cam1HideLayerIndex);

// GUI
const gui = new GUI();
const cameraFolder = gui.addFolder('Cameras');
cameraFolder.add({ switchToCam1: () => switchCamera(cam1) }, 'switchToCam1').name('Switch to Cam1');
cameraFolder.add({ switchToCam2: () => switchCamera(cam2) }, 'switchToCam2').name('Switch to Cam2');
cameraFolder.open();
// 定义一个对象来保存CameraHelper的可见性状态
const helperSettings = {
    cameraHelperVisible: true  // 初始值为 true
};
// 添加GUI开关控制CameraHelper的可见性
gui.add(helperSettings, 'cameraHelperVisible').name('Camera Helper').onChange((visible) => {
    cam1_helper.visible = visible;  // 根据GUI开关的状态设置CameraHelper的可见性
});
// 控制子视角
const settings = { showSubView: true };  // 初始时显示子视角
gui.add(settings, 'showSubView').name('Show Sub View');


// 存储当前的控制模式
let currentMode = 'translate'; // 初始模式设置为位移

let objFolder; // 用于存储模型相关的GUI控件
// 模型加载
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const loader = new OBJLoader();
            loader.load(e.target.result, function(obj) {
                // 在场景中添加模型
                scene.add(obj);
                transformControls.attach(obj); // 将TransformControls附加到加载的模型上

                // 如果之前加载过模型，移除之前的GUI控件
                if (objFolder) {
                    gui.removeFolder(objFolder);
                }

                // 为新加载的模型创建GUI控件
                objFolder = gui.addFolder('Model Controls');
                // 添加切换控制模式的按钮
                objFolder.add({ toggleMode: function() {
                    // 切换控制模式
                    currentMode = currentMode === 'translate' ? 'rotate' : 'translate';
                    // 设置TransformControls的模式
                    transformControls.setMode(currentMode);
                }}, 'toggleMode').name('Toggle Mode (Translate/Rotate)');
                objFolder.add(obj.position, 'x').name('Position X').step(0.1); // 使用step来允许更细致的控制
                objFolder.add(obj.position, 'y').name('Position Y').step(0.1);
                objFolder.add(obj.position, 'z').name('Position Z').step(0.1);
                // objFolder.add(obj.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
                // objFolder.add(obj.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
                // objFolder.add(obj.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');
                const rotationDegrees = {
                    x: THREE.MathUtils.radToDeg(obj.rotation.x),
                    y: THREE.MathUtils.radToDeg(obj.rotation.y),
                    z: THREE.MathUtils.radToDeg(obj.rotation.z),
                };
                
                objFolder.add(rotationDegrees, 'x', -180, 180).name('Rotation X').onChange(function(value) {
                    // 当控件值变化时，将角度转换为弧度并更新物体的旋转
                    obj.rotation.x = THREE.MathUtils.degToRad(value);
                });
                objFolder.add(rotationDegrees, 'y', -180, 180).name('Rotation Y').onChange(function(value) {
                    obj.rotation.y = THREE.MathUtils.degToRad(value);
                });
                objFolder.add(rotationDegrees, 'z', -180, 180).name('Rotation Z').onChange(function(value) {
                    obj.rotation.z = THREE.MathUtils.degToRad(value);
                });

                // 模型尺寸控件（缩放）
                const scaleControl = objFolder.add(obj.scale, 'x', 0.0001, 5).name('Size').listen(); // 监听scale.x的变化
                scaleControl.onChange(function(value) {
                    // 保持模型的缩放比例一致
                    obj.scale.set(value, value, value);
                });

                transformControls.addEventListener('objectChange', function() {
                    updateRotationInGUI(obj, rotationDegrees, objFolder);
                });

                objFolder.open();
            });
        };
        reader.readAsDataURL(file);
    }
});

// // File input listener for model importing
// document.getElementById('file-input').addEventListener('change', function (event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             const loader = new OBJLoader();
//             const obj = loader.parse(e.target.result);
//             scene.add(obj);
//             transformControls.attach(obj);
//         };
//         reader.readAsText(file);
//     }
// });
// // 加载模型
// const loader = new OBJLoader();
// let objMesh; // 用于存储加载的模型

// document.getElementById('file-input').addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             loader.load(e.target.result, function(obj) {
//                 objMesh = obj;
//                 scene.add(objMesh);
//                 transformControls.attach(objMesh); // 将TransformControls附加到加载的模型上
//             });
//         };
//         reader.readAsDataURL(file);
//     }
// });

// 初始化TransformControls
const model_transformControls = new TransformControls(cam1, renderer.domElement);
model_transformControls.addEventListener('dragging-changed', function(event) {
    orbitControls.enabled = !event.value;
});
scene.add(model_transformControls);


// Camera switch function
// 相机切换函数
function switchCamera(camera) {
    activeCamera = camera;
    transformControls.camera = activeCamera; // 更新TransformControls使用的相机
    orbitControls.object = activeCamera; // 更新OrbitControls使用的相机
    orbitControls.update();

    // 更新显示当前相机的信息
    const cameraInfoDiv = document.getElementById('camera-info');
    if (activeCamera === cam1) {
        cameraInfoDiv.textContent = 'Current Camera: cam1';
    } else {
        cameraInfoDiv.textContent = 'Current Camera: cam2';
    }
}


// 监听TransformControls的objectChange事件
transformControls.addEventListener('objectChange', function() {
    // 当TransformControls操作导致模型位移或旋转发生变化时，更新GUI控件显示的值
    for (let i = 0; i < objFolder.__controllers.length; i++) {
        objFolder.__controllers[i].updateDisplay();
    }
});


cam2.layers.enableAll()

let sub_window_offset_x = 50
let sub_window_offset_y = 50

// Render loop
function animate() {
    requestAnimationFrame(animate);
    // renderer.render(scene, activeCamera);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, activeCamera);

    // 根据GUI开关决定是否渲染子视角
    if (settings.showSubView) {
        const width = window.innerWidth * 0.2;  // 子视角的宽度为主视角宽度的 20%
        const height = window.innerHeight * 0.2;  // 子视角的高度为主视角高度的 20%
        renderer.setViewport(0+sub_window_offset_x, 0+sub_window_offset_y, width, height);  // 设置子视角的视口
        renderer.setScissor(0+sub_window_offset_x, 0+sub_window_offset_x, width, height);  // 设置裁剪区域以限制子视角的渲染区域
        renderer.setScissorTest(true);
        // 配置 cam1 以忽略 cam1HideLayerIndex 图层中的对象
        cam1.layers.disableAll();  // 首先禁用所有图层
        cam1.layers.enable(0);
        renderer.render(scene, cam1);  // 渲染子视角
    }
    orbitControls.update();
}
animate();
