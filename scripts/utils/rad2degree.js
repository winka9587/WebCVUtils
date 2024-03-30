// 更新 GUI 显示的函数，接受一个物体作为参数
export function updateRotationInGUI(objToUpdate, rotationInDegrees, objFolder) {
    // 将指定物体的当前旋转（弧度）转换为角度并更新 rotationInDegrees 对象
    rotationInDegrees.x = THREE.MathUtils.radToDeg(objToUpdate.rotation.x);
    rotationInDegrees.y = THREE.MathUtils.radToDeg(objToUpdate.rotation.y);
    rotationInDegrees.z = THREE.MathUtils.radToDeg(objToUpdate.rotation.z);

    // 手动触发每个控制器的 updateDisplay 方法来刷新 GUI 显示
    objFolder.__controllers.forEach(controller => controller.updateDisplay());
}