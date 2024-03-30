// 确保OpenCV已经完全加载
cv['onRuntimeInitialized'] = () => {
    document.getElementById('calibrate').addEventListener('click', startCalibration);
};

function startCalibration() {
    let width = parseInt(document.getElementById('width').value);
    let height = parseInt(document.getElementById('height').value);
    let squareSize = parseFloat(document.getElementById('squareSize').value);
    let files = document.getElementById('fileInput').files;

    if (!width || !height || !squareSize || files.length === 0) {
        alert("请确保填写了所有字段并上传了图像！");
        return;
    }

    let objectPoints = [];
    let imagePoints = [];
    let cornerPoints = [];
    let objectPoint = [];
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            objectPoint.push(j * squareSize, i * squareSize, 0);
        }
    }

    let processImages = async () => {
        for (let file of files) {
            await processImage(file, width, height);
        }
        calibrateCamera(objectPoints, imagePoints, width, height);
    };

    processImages();
}

async function processImage(file, width, height) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = new Image();
            img.onload = function() {
                let canvas = document.createElement('canvas');
                document.body.appendChild(canvas); // 必须添加到DOM中
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                let src = cv.imread(canvas);
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
                let corners = new cv.Mat();
                let ret = cv.findChessboardCorners(gray, new cv.Size(width, height), corners, cv.CALIB_CB_ADAPTIVE_THRESH + cv.CALIB_CB_NORMALIZE_IMAGE + cv.CALIB_CB_FAST_CHECK);
                if (ret) {
                    let cornerSubPix = new cv.Mat();
                    cv.find4QuadCornerSubpix(gray, corners, new cv.Size(11, 11), cornerSubPix);
                    imagePoints.push(cornerSubPix.data32F);
                    objectPoints.push([].concat(...objectPoint));
                    document.body.removeChild(canvas); // 完成后删除canvas
                    resolve();
                } else {
                    document.body.removeChild(canvas); // 删除canvas即使找不到角点
                    reject('找不到棋盘格角点');
                }
                src.delete();
                gray.delete();
                corners.delete();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function calibrateCamera(objectPoints, imagePoints, width, height) {
    let cameraMatrix = new cv.Mat();
    let distCoeffs = new cv.Mat();
    let rvecs = new cv.MatVector();
    let tvecs = new cv.MatVector();
    let objectPointsMat = cv.matFromArray(objectPoints.length, 1, cv.CV_64FC3, [].concat.apply([], objectPoints));
    let imagePointsMat = cv.matFromArray(imagePoints.length, 1, cv.CV_64FC2, [].concat.apply([], imagePoints));
    cv.calibrateCamera(objectPointsMat, imagePointsMat, new cv.Size(width, height), cameraMatrix, distCoeffs, rvecs, tvecs);

    // 输出相机内参矩阵
    console.log('Camera Matrix:', cameraMatrix.data64F);

    objectPointsMat.delete();
    imagePointsMat.delete();
    cameraMatrix.delete();
    distCoeffs.delete();
    rvecs.delete();
    tvecs.delete();
}
