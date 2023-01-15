const { ChangeRF } = require('changerf')

let curve = ChangeRF.ctf(40, 20, { round: true }); // 生成曲线数组
console.log(curve); // 输出以便欣赏数组