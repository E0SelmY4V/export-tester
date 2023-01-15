import ChangeRF from 'changerf'

let delta = 100; // 曲线的高度
let curve = ChangeRF.ctf(40, 20, { round: true }); // 生成曲线数组
console.log(curve); // 输出以便欣赏数组