/// <reference path="../build/global.d.ts" />

ChangeRF.CurveParams.attr({
	minn: 1.8,
	maxn: 2.6,
	slope: 1.5,
	multi: 1
});
function clearui() {
	graphic.height = window.innerHeight - 200;
	graphic.width = window.innerWidth - 40;
}
function draw() {
	clearui();
	var cxt = graphic.getContext("2d");
	var w = window.innerWidth - 40;
	var h = window.innerHeight - 200;
	cxt.moveTo(0, (a + 1) * h / 2);
	var l = ChangeRF.crf(a * h, { type: se.value });
	console.log(a * h);
	for (i = 0; i < l.length; i++) {
		cxt.lineTo(i + 1, (a + 1) * h / 2 - l[i]);
	}
	cxt.stroke();
}
window.onload = function () {
	a = 1;
	clearui();
}
window.onresize = clearui;
function setAt(n, t) {
	ChangeRF.CurveParams.attr(n, t.value);
}