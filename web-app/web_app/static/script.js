(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var ChartGeo = require("chartjs-chart-geo");
var feature = require("topojson-client").feature

var myChart = new Chart(document.getElementById("successful-students"), {
    type: rows[0].plot_type,
    title: rows[0].title,
    data: {
      labels: rows[0].points.map(d => d[0]),
      datasets: [{
        data: rows[0].points.map(d => parseFloat(d[1])),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      title : {
        display: true,
        text: "Most successful students"
      },
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

  var companiesRecruiting = new Chart(document.getElementById("companies-recruiting"), {
	type: "pie",
	title : "Random data",
    data: {
      labels: ["A","B", "C", "D"],
      datasets: [{
        data: Array.from({length: 4}, () => Math.floor(Math.random() * 40)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio: false
    }
  });

fetch('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/france/fr-departments.json').then(r => r.json()).then(departements => {
    console.log(departements)
    departements = feature(departements, departements.objects.FRA_adm2).features;
    console.log(departements)
    departements.forEach((element, index) => {
        if (element.properties.name == "Guyane française"){
            departements.splice(index, 1)
        }
    });
    const chart = new ChartGeo.ChoroplethChart(document.getElementById('region-pro-contact-france').getContext('2d'), {
        data: {
          labels: departements.map((d) => d.properties.NAME_2),
          datasets: [
            {
              label: 'Departements',
              outline: departements,
              data: departements.map((d) => ({
                feature: d,
                value: Math.random(),
              })),
            },
          ],
        },
        options: {
          showOutline: false,
          showGraticule: false,
          plugins: {
            legend: {
              display: false
            },
          },
          maintainAspectRatio: false,
          scales: {
            xy: {
              projection: 'mercator',
            },
          },
        },
      });
})

      
},{"chartjs-chart-geo":4,"topojson-client":10}],2:[function(require,module,exports){
/*!
 * Chart.js v3.0.0-beta.7
 * https://www.chartjs.org
 * (c) 2020 Chart.js Contributors
 * Released under the MIT License
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Chart = factory());
}(this, (function () { 'use strict';

function fontString(pixelSize, fontStyle, fontFamily) {
	return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
}
const requestAnimFrame = (function() {
	if (typeof window === 'undefined') {
		return function(callback) {
			return callback();
		};
	}
	return window.requestAnimationFrame;
}());
function throttled(fn, thisArg, updateFn) {
	const updateArgs = updateFn || ((args) => Array.prototype.slice.call(args));
	let ticking = false;
	let args = [];
	return function(...rest) {
		args = updateArgs(rest);
		if (!ticking) {
			ticking = true;
			requestAnimFrame.call(window, () => {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}

function drawFPS(chart, count, date, lastDate) {
	const fps = (1000 / (date - lastDate)) | 0;
	const ctx = chart.ctx;
	ctx.save();
	ctx.clearRect(0, 0, 50, 24);
	ctx.fillStyle = 'black';
	ctx.textAlign = 'right';
	if (count) {
		ctx.fillText(count, 50, 8);
		ctx.fillText(fps + ' fps', 50, 18);
	}
	ctx.restore();
}
class Animator {
	constructor() {
		this._request = null;
		this._charts = new Map();
		this._running = false;
		this._lastDate = undefined;
	}
	_notify(chart, anims, date, type) {
		const callbacks = anims.listeners[type] || [];
		const numSteps = anims.duration;
		callbacks.forEach(fn => fn({
			chart,
			numSteps,
			currentStep: Math.min(date - anims.start, numSteps)
		}));
	}
	_refresh() {
		const me = this;
		if (me._request) {
			return;
		}
		me._running = true;
		me._request = requestAnimFrame.call(window, () => {
			me._update();
			me._request = null;
			if (me._running) {
				me._refresh();
			}
		});
	}
	_update() {
		const me = this;
		const date = Date.now();
		let remaining = 0;
		me._charts.forEach((anims, chart) => {
			if (!anims.running || !anims.items.length) {
				return;
			}
			const items = anims.items;
			let i = items.length - 1;
			let draw = false;
			let item;
			for (; i >= 0; --i) {
				item = items[i];
				if (item._active) {
					item.tick(date);
					draw = true;
				} else {
					items[i] = items[items.length - 1];
					items.pop();
				}
			}
			if (draw) {
				chart.draw();
				me._notify(chart, anims, date, 'progress');
			}
			if (chart.options.animation.debug) {
				drawFPS(chart, items.length, date, me._lastDate);
			}
			if (!items.length) {
				anims.running = false;
				me._notify(chart, anims, date, 'complete');
			}
			remaining += items.length;
		});
		me._lastDate = date;
		if (remaining === 0) {
			me._running = false;
		}
	}
	_getAnims(chart) {
		const charts = this._charts;
		let anims = charts.get(chart);
		if (!anims) {
			anims = {
				running: false,
				items: [],
				listeners: {
					complete: [],
					progress: []
				}
			};
			charts.set(chart, anims);
		}
		return anims;
	}
	listen(chart, event, cb) {
		this._getAnims(chart).listeners[event].push(cb);
	}
	add(chart, items) {
		if (!items || !items.length) {
			return;
		}
		this._getAnims(chart).items.push(...items);
	}
	has(chart) {
		return this._getAnims(chart).items.length > 0;
	}
	start(chart) {
		const anims = this._charts.get(chart);
		if (!anims) {
			return;
		}
		anims.running = true;
		anims.start = Date.now();
		anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
		this._refresh();
	}
	running(chart) {
		if (!this._running) {
			return false;
		}
		const anims = this._charts.get(chart);
		if (!anims || !anims.running || !anims.items.length) {
			return false;
		}
		return true;
	}
	stop(chart) {
		const anims = this._charts.get(chart);
		if (!anims || !anims.items.length) {
			return;
		}
		const items = anims.items;
		let i = items.length - 1;
		for (; i >= 0; --i) {
			items[i].cancel();
		}
		anims.items = [];
		this._notify(chart, anims, Date.now(), 'complete');
	}
	remove(chart) {
		return this._charts.delete(chart);
	}
}
var animator = new Animator();

function noop() {}
const uid = (function() {
	let id = 0;
	return function() {
		return id++;
	};
}());
function isNullOrUndef(value) {
	return value === null || typeof value === 'undefined';
}
function isArray(value) {
	if (Array.isArray && Array.isArray(value)) {
		return true;
	}
	const type = Object.prototype.toString.call(value);
	if (type.substr(0, 7) === '[object' && type.substr(-6) === 'Array]') {
		return true;
	}
	return false;
}
function isObject(value) {
	return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}
const isNumberFinite = (value) => (typeof value === 'number' || value instanceof Number) && isFinite(+value);
function finiteOrDefault(value, defaultValue) {
	return isNumberFinite(value) ? value : defaultValue;
}
function valueOrDefault(value, defaultValue) {
	return typeof value === 'undefined' ? defaultValue : value;
}
function callback(fn, args, thisArg) {
	if (fn && typeof fn.call === 'function') {
		return fn.apply(thisArg, args);
	}
}
function each(loopable, fn, thisArg, reverse) {
	let i, len, keys;
	if (isArray(loopable)) {
		len = loopable.length;
		if (reverse) {
			for (i = len - 1; i >= 0; i--) {
				fn.call(thisArg, loopable[i], i);
			}
		} else {
			for (i = 0; i < len; i++) {
				fn.call(thisArg, loopable[i], i);
			}
		}
	} else if (isObject(loopable)) {
		keys = Object.keys(loopable);
		len = keys.length;
		for (i = 0; i < len; i++) {
			fn.call(thisArg, loopable[keys[i]], keys[i]);
		}
	}
}
function _elementsEqual(a0, a1) {
	let i, ilen, v0, v1;
	if (!a0 || !a1 || a0.length !== a1.length) {
		return false;
	}
	for (i = 0, ilen = a0.length; i < ilen; ++i) {
		v0 = a0[i];
		v1 = a1[i];
		if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
			return false;
		}
	}
	return true;
}
function clone(source) {
	if (isArray(source)) {
		return source.map(clone);
	}
	if (isObject(source)) {
		const target = Object.create(null);
		const keys = Object.keys(source);
		const klen = keys.length;
		let k = 0;
		for (; k < klen; ++k) {
			target[keys[k]] = clone(source[keys[k]]);
		}
		return target;
	}
	return source;
}
function isValidKey(key) {
	return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1;
}
function _merger(key, target, source, options) {
	if (!isValidKey(key)) {
		return;
	}
	const tval = target[key];
	const sval = source[key];
	if (isObject(tval) && isObject(sval)) {
		merge(tval, sval, options);
	} else {
		target[key] = clone(sval);
	}
}
function merge(target, source, options) {
	const sources = isArray(source) ? source : [source];
	const ilen = sources.length;
	if (!isObject(target)) {
		return target;
	}
	options = options || {};
	const merger = options.merger || _merger;
	for (let i = 0; i < ilen; ++i) {
		source = sources[i];
		if (!isObject(source)) {
			continue;
		}
		const keys = Object.keys(source);
		for (let k = 0, klen = keys.length; k < klen; ++k) {
			merger(keys[k], target, source, options);
		}
	}
	return target;
}
function mergeIf(target, source) {
	return merge(target, source, {merger: _mergerIf});
}
function _mergerIf(key, target, source) {
	if (!isValidKey(key)) {
		return;
	}
	const tval = target[key];
	const sval = source[key];
	if (isObject(tval) && isObject(sval)) {
		mergeIf(tval, sval);
	} else if (!Object.prototype.hasOwnProperty.call(target, key)) {
		target[key] = clone(sval);
	}
}
function _deprecated(scope, value, previous, current) {
	if (value !== undefined) {
		console.warn(scope + ': "' + previous +
			'" is deprecated. Please use "' + current + '" instead');
	}
}
function resolveObjectKey(obj, key) {
	if (key === 'x') {
		return obj.x;
	}
	if (key === 'y') {
		return obj.y;
	}
	const keys = key.split('.');
	for (let i = 0, n = keys.length; i < n && obj; ++i) {
		const k = keys[i];
		if (!k) {
			break;
		}
		obj = obj[k];
	}
	return obj;
}
function _capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getScope(node, key) {
	if (!key) {
		return node;
	}
	const keys = key.split('.');
	for (let i = 0, n = keys.length; i < n; ++i) {
		const k = keys[i];
		node = node[k] || (node[k] = Object.create(null));
	}
	return node;
}
class Defaults {
	constructor() {
		this.backgroundColor = 'rgba(0,0,0,0.1)';
		this.borderColor = 'rgba(0,0,0,0.1)';
		this.color = '#666';
		this.controllers = {};
		this.elements = {};
		this.events = [
			'mousemove',
			'mouseout',
			'click',
			'touchstart',
			'touchmove'
		];
		this.font = {
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 12,
			style: 'normal',
			lineHeight: 1.2,
			weight: null
		};
		this.hover = {
			onHover: null
		};
		this.interaction = {
			mode: 'nearest',
			intersect: true
		};
		this.maintainAspectRatio = true;
		this.onHover = null;
		this.onClick = null;
		this.plugins = {};
		this.responsive = true;
		this.scale = undefined;
		this.scales = {};
		this.showLine = true;
	}
	set(scope, values) {
		if (typeof scope === 'string') {
			return merge(getScope(this, scope), values);
		}
		return merge(getScope(this, ''), scope);
	}
	get(scope) {
		return getScope(this, scope);
	}
	route(scope, name, targetScope, targetName) {
		const scopeObject = getScope(this, scope);
		const targetScopeObject = getScope(this, targetScope);
		const privateName = '_' + name;
		Object.defineProperties(scopeObject, {
			[privateName]: {
				writable: true
			},
			[name]: {
				enumerable: true,
				get() {
					return valueOrDefault(this[privateName], targetScopeObject[targetName]);
				},
				set(value) {
					this[privateName] = value;
				}
			}
		});
	}
}
var defaults = new Defaults();

const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;
const INFINITY = Number.POSITIVE_INFINITY;
const RAD_PER_DEG = PI / 180;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;
function _factorize(value) {
	const result = [];
	const sqrt = Math.sqrt(value);
	let i;
	for (i = 1; i < sqrt; i++) {
		if (value % i === 0) {
			result.push(i);
			result.push(value / i);
		}
	}
	if (sqrt === (sqrt | 0)) {
		result.push(sqrt);
	}
	result.sort((a, b) => a - b).pop();
	return result;
}
const log10 = Math.log10 || function(x) {
	const exponent = Math.log(x) * Math.LOG10E;
	const powerOf10 = Math.round(exponent);
	const isPowerOf10 = x === Math.pow(10, powerOf10);
	return isPowerOf10 ? powerOf10 : exponent;
};
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function almostEquals(x, y, epsilon) {
	return Math.abs(x - y) < epsilon;
}
function almostWhole(x, epsilon) {
	const rounded = Math.round(x);
	return ((rounded - epsilon) <= x) && ((rounded + epsilon) >= x);
}
function _setMinAndMaxByKey(array, target, property) {
	let i, ilen, value;
	for (i = 0, ilen = array.length; i < ilen; i++) {
		value = array[i][property];
		if (!isNaN(value)) {
			target.min = Math.min(target.min, value);
			target.max = Math.max(target.max, value);
		}
	}
}
const sign = Math.sign ?
	function(x) {
		return Math.sign(x);
	} :
	function(x) {
		x = +x;
		if (x === 0 || isNaN(x)) {
			return x;
		}
		return x > 0 ? 1 : -1;
	};
function toRadians(degrees) {
	return degrees * (PI / 180);
}
function toDegrees(radians) {
	return radians * (180 / PI);
}
function _decimalPlaces(x) {
	if (!isNumberFinite(x)) {
		return;
	}
	let e = 1;
	let p = 0;
	while (Math.round(x * e) / e !== x) {
		e *= 10;
		p++;
	}
	return p;
}
function getAngleFromPoint(centrePoint, anglePoint) {
	const distanceFromXCenter = anglePoint.x - centrePoint.x;
	const distanceFromYCenter = anglePoint.y - centrePoint.y;
	const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
	let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
	if (angle < (-0.5 * PI)) {
		angle += TAU;
	}
	return {
		angle,
		distance: radialDistanceFromCenter
	};
}
function distanceBetweenPoints(pt1, pt2) {
	return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
function _angleDiff(a, b) {
	return (a - b + PITAU) % TAU - PI;
}
function _normalizeAngle(a) {
	return (a % TAU + TAU) % TAU;
}
function _angleBetween(angle, start, end) {
	const a = _normalizeAngle(angle);
	const s = _normalizeAngle(start);
	const e = _normalizeAngle(end);
	const angleToStart = _normalizeAngle(s - a);
	const angleToEnd = _normalizeAngle(e - a);
	const startToAngle = _normalizeAngle(a - s);
	const endToAngle = _normalizeAngle(a - e);
	return a === s || a === e || (angleToStart > angleToEnd && startToAngle < endToAngle);
}
function _limitValue(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function _int16Range(value) {
	return _limitValue(value, -32768, 32767);
}

function toFontString(font) {
	if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
		return null;
	}
	return (font.style ? font.style + ' ' : '')
		+ (font.weight ? font.weight + ' ' : '')
		+ font.size + 'px '
		+ font.family;
}
function _measureText(ctx, data, gc, longest, string) {
	let textWidth = data[string];
	if (!textWidth) {
		textWidth = data[string] = ctx.measureText(string).width;
		gc.push(string);
	}
	if (textWidth > longest) {
		longest = textWidth;
	}
	return longest;
}
function _longestText(ctx, font, arrayOfThings, cache) {
	cache = cache || {};
	let data = cache.data = cache.data || {};
	let gc = cache.garbageCollect = cache.garbageCollect || [];
	if (cache.font !== font) {
		data = cache.data = {};
		gc = cache.garbageCollect = [];
		cache.font = font;
	}
	ctx.save();
	ctx.font = font;
	let longest = 0;
	const ilen = arrayOfThings.length;
	let i, j, jlen, thing, nestedThing;
	for (i = 0; i < ilen; i++) {
		thing = arrayOfThings[i];
		if (thing !== undefined && thing !== null && isArray(thing) !== true) {
			longest = _measureText(ctx, data, gc, longest, thing);
		} else if (isArray(thing)) {
			for (j = 0, jlen = thing.length; j < jlen; j++) {
				nestedThing = thing[j];
				if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) {
					longest = _measureText(ctx, data, gc, longest, nestedThing);
				}
			}
		}
	}
	ctx.restore();
	const gcLen = gc.length / 2;
	if (gcLen > arrayOfThings.length) {
		for (i = 0; i < gcLen; i++) {
			delete data[gc[i]];
		}
		gc.splice(0, gcLen);
	}
	return longest;
}
function _alignPixel(chart, pixel, width) {
	const devicePixelRatio = chart.currentDevicePixelRatio;
	const halfWidth = width / 2;
	return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
function clear(chart) {
	chart.ctx.clearRect(0, 0, chart.width, chart.height);
}
function drawPoint(ctx, options, x, y) {
	let type, xOffset, yOffset, size, cornerRadius;
	const style = options.pointStyle;
	const rotation = options.rotation;
	const radius = options.radius;
	let rad = (rotation || 0) * RAD_PER_DEG;
	if (style && typeof style === 'object') {
		type = style.toString();
		if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(rad);
			ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
			ctx.restore();
			return;
		}
	}
	if (isNaN(radius) || radius <= 0) {
		return;
	}
	ctx.beginPath();
	switch (style) {
	default:
		ctx.arc(x, y, radius, 0, TAU);
		ctx.closePath();
		break;
	case 'triangle':
		ctx.moveTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		ctx.closePath();
		break;
	case 'rectRounded':
		cornerRadius = radius * 0.516;
		size = radius - cornerRadius;
		xOffset = Math.cos(rad + QUARTER_PI) * size;
		yOffset = Math.sin(rad + QUARTER_PI) * size;
		ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
		ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad);
		ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI);
		ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
		ctx.closePath();
		break;
	case 'rect':
		if (!rotation) {
			size = Math.SQRT1_2 * radius;
			ctx.rect(x - size, y - size, 2 * size, 2 * size);
			break;
		}
		rad += QUARTER_PI;
	case 'rectRot':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + yOffset, y - xOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		ctx.closePath();
		break;
	case 'crossRot':
		rad += QUARTER_PI;
	case 'cross':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'star':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		rad += QUARTER_PI;
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'line':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		break;
	case 'dash':
		ctx.moveTo(x, y);
		ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius);
		break;
	}
	ctx.fill();
	if (options.borderWidth > 0) {
		ctx.stroke();
	}
}
function _isPointInArea(point, area) {
	const epsilon = 0.5;
	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
}
function clipArea(ctx, area) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
	ctx.clip();
}
function unclipArea(ctx) {
	ctx.restore();
}
function _steppedLineTo(ctx, previous, target, flip, mode) {
	if (!previous) {
		return ctx.lineTo(target.x, target.y);
	}
	if (mode === 'middle') {
		const midpoint = (previous.x + target.x) / 2.0;
		ctx.lineTo(midpoint, previous.y);
		ctx.lineTo(midpoint, target.y);
	} else if (mode === 'after' !== !!flip) {
		ctx.lineTo(previous.x, target.y);
	} else {
		ctx.lineTo(target.x, previous.y);
	}
	ctx.lineTo(target.x, target.y);
}
function _bezierCurveTo(ctx, previous, target, flip) {
	if (!previous) {
		return ctx.lineTo(target.x, target.y);
	}
	ctx.bezierCurveTo(
		flip ? previous.controlPointPreviousX : previous.controlPointNextX,
		flip ? previous.controlPointPreviousY : previous.controlPointNextY,
		flip ? target.controlPointNextX : target.controlPointPreviousX,
		flip ? target.controlPointNextY : target.controlPointPreviousY,
		target.x,
		target.y);
}

function _lookup(table, value, cmp) {
	cmp = cmp || ((index) => table[index] < value);
	let hi = table.length - 1;
	let lo = 0;
	let mid;
	while (hi - lo > 1) {
		mid = (lo + hi) >> 1;
		if (cmp(mid)) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	return {lo, hi};
}
const _lookupByKey = (table, key, value) =>
	_lookup(table, value, index => table[index][key] < value);
const _rlookupByKey = (table, key, value) =>
	_lookup(table, value, index => table[index][key] >= value);
function _filterBetween(values, min, max) {
	let start = 0;
	let end = values.length;
	while (start < end && values[start] < min) {
		start++;
	}
	while (end > start && values[end - 1] > max) {
		end--;
	}
	return start > 0 || end < values.length
		? values.slice(start, end)
		: values;
}
const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];
function listenArrayEvents(array, listener) {
	if (array._chartjs) {
		array._chartjs.listeners.push(listener);
		return;
	}
	Object.defineProperty(array, '_chartjs', {
		configurable: true,
		enumerable: false,
		value: {
			listeners: [listener]
		}
	});
	arrayEvents.forEach((key) => {
		const method = '_onData' + _capitalize(key);
		const base = array[key];
		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value(...args) {
				const res = base.apply(this, args);
				array._chartjs.listeners.forEach((object) => {
					if (typeof object[method] === 'function') {
						object[method](...args);
					}
				});
				return res;
			}
		});
	});
}
function unlistenArrayEvents(array, listener) {
	const stub = array._chartjs;
	if (!stub) {
		return;
	}
	const listeners = stub.listeners;
	const index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}
	if (listeners.length > 0) {
		return;
	}
	arrayEvents.forEach((key) => {
		delete array[key];
	});
	delete array._chartjs;
}
function _arrayUnique(items) {
	const set = new Set();
	let i, ilen;
	for (i = 0, ilen = items.length; i < ilen; ++i) {
		set.add(items[i]);
	}
	if (set.size === ilen) {
		return items;
	}
	const result = [];
	set.forEach(item => {
		result.push(item);
	});
	return result;
}

function _getParentNode(domNode) {
	let parent = domNode.parentNode;
	if (parent && parent.toString() === '[object ShadowRoot]') {
		parent = parent.host;
	}
	return parent;
}
function parseMaxStyle(styleValue, node, parentProperty) {
	let valueInPixels;
	if (typeof styleValue === 'string') {
		valueInPixels = parseInt(styleValue, 10);
		if (styleValue.indexOf('%') !== -1) {
			valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
		}
	} else {
		valueInPixels = styleValue;
	}
	return valueInPixels;
}
const getComputedStyle = (element) => window.getComputedStyle(element, null);
function getStyle(el, property) {
	return getComputedStyle(el).getPropertyValue(property);
}
const positions = ['top', 'right', 'bottom', 'left'];
function getPositionedStyle(styles, style, suffix) {
	const result = {};
	suffix = suffix ? '-' + suffix : '';
	for (let i = 0; i < 4; i++) {
		const pos = positions[i];
		result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
	}
	result.width = result.left + result.right;
	result.height = result.top + result.bottom;
	return result;
}
const useOffsetPos = (x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot);
function getCanvasPosition(evt, canvas) {
	const e = evt.originalEvent || evt;
	const touches = e.touches;
	const source = touches && touches.length ? touches[0] : e;
	const {offsetX, offsetY} = source;
	let box = false;
	let x, y;
	if (useOffsetPos(offsetX, offsetY, e.target)) {
		x = offsetX;
		y = offsetY;
	} else {
		const rect = canvas.getBoundingClientRect();
		x = source.clientX - rect.left;
		y = source.clientY - rect.top;
		box = true;
	}
	return {x, y, box};
}
function getRelativePosition(evt, chart) {
	const {canvas, currentDevicePixelRatio} = chart;
	const style = getComputedStyle(canvas);
	const borderBox = style.boxSizing === 'border-box';
	const paddings = getPositionedStyle(style, 'padding');
	const borders = getPositionedStyle(style, 'border', 'width');
	const {x, y, box} = getCanvasPosition(evt, canvas);
	const xOffset = paddings.left + (box && borders.left);
	const yOffset = paddings.top + (box && borders.top);
	let {width, height} = chart;
	if (borderBox) {
		width -= paddings.width + borders.width;
		height -= paddings.height + borders.height;
	}
	return {
		x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
		y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
	};
}
function getContainerSize(canvas, width, height) {
	let maxWidth, maxHeight;
	if (width === undefined || height === undefined) {
		const container = _getParentNode(canvas);
		if (!container) {
			width = canvas.clientWidth;
			height = canvas.clientHeight;
		} else {
			const rect = container.getBoundingClientRect();
			const containerStyle = getComputedStyle(container);
			const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
			const containerPadding = getPositionedStyle(containerStyle, 'padding');
			width = rect.width - containerPadding.width - containerBorder.width;
			height = rect.height - containerPadding.height - containerBorder.height;
			maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
			maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
		}
	}
	return {
		width,
		height,
		maxWidth: maxWidth || INFINITY,
		maxHeight: maxHeight || INFINITY
	};
}
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
	const style = getComputedStyle(canvas);
	const margins = getPositionedStyle(style, 'margin');
	const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
	const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
	const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
	let {width, height} = containerSize;
	if (style.boxSizing === 'content-box') {
		const borders = getPositionedStyle(style, 'border', 'width');
		const paddings = getPositionedStyle(style, 'padding');
		width -= paddings.width + borders.width;
		height -= paddings.height + borders.height;
	}
	width = Math.max(0, width - margins.width);
	height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height);
	return {
		width: Math.min(width, maxWidth, containerSize.maxWidth),
		height: Math.min(height, maxHeight, containerSize.maxHeight)
	};
}
function retinaScale(chart, forceRatio) {
	const pixelRatio = chart.currentDevicePixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
	const {canvas, width, height} = chart;
	canvas.height = height * pixelRatio;
	canvas.width = width * pixelRatio;
	chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	if (canvas.style && !canvas.style.height && !canvas.style.width) {
		canvas.style.height = height + 'px';
		canvas.style.width = width + 'px';
	}
}
const supportsEventListenerOptions = (function() {
	let passiveSupported = false;
	try {
		const options = {
			get passive() {
				passiveSupported = true;
				return false;
			}
		};
		window.addEventListener('test', null, options);
		window.removeEventListener('test', null, options);
	} catch (e) {
	}
	return passiveSupported;
}());
function readUsedSize(element, property) {
	const value = getStyle(element, property);
	const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	return matches ? +matches[1] : undefined;
}

function getRelativePosition$1(e, chart) {
	if ('native' in e) {
		return {
			x: e.x,
			y: e.y
		};
	}
	return getRelativePosition(e, chart);
}
function evaluateAllVisibleItems(chart, handler) {
	const metasets = chart.getSortedVisibleDatasetMetas();
	let index, data, element;
	for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
		({index, data} = metasets[i]);
		for (let j = 0, jlen = data.length; j < jlen; ++j) {
			element = data[j];
			if (!element.skip) {
				handler(element, index, j);
			}
		}
	}
}
function binarySearch(metaset, axis, value, intersect) {
	const {controller, data, _sorted} = metaset;
	const iScale = controller._cachedMeta.iScale;
	if (iScale && axis === iScale.axis && _sorted && data.length) {
		const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
		if (!intersect) {
			return lookupMethod(data, axis, value);
		} else if (controller._sharedOptions) {
			const el = data[0];
			const range = typeof el.getRange === 'function' && el.getRange(axis);
			if (range) {
				const start = lookupMethod(data, axis, value - range);
				const end = lookupMethod(data, axis, value + range);
				return {lo: start.lo, hi: end.hi};
			}
		}
	}
	return {lo: 0, hi: data.length - 1};
}
function optimizedEvaluateItems(chart, axis, position, handler, intersect) {
	const metasets = chart.getSortedVisibleDatasetMetas();
	const value = position[axis];
	for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
		const {index, data} = metasets[i];
		const {lo, hi} = binarySearch(metasets[i], axis, value, intersect);
		for (let j = lo; j <= hi; ++j) {
			const element = data[j];
			if (!element.skip) {
				handler(element, index, j);
			}
		}
	}
}
function getDistanceMetricForAxis(axis) {
	const useX = axis.indexOf('x') !== -1;
	const useY = axis.indexOf('y') !== -1;
	return function(pt1, pt2) {
		const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
		const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	};
}
function getIntersectItems(chart, position, axis, useFinalPosition) {
	const items = [];
	if (!_isPointInArea(position, chart.chartArea)) {
		return items;
	}
	const evaluationFunc = function(element, datasetIndex, index) {
		if (element.inRange(position.x, position.y, useFinalPosition)) {
			items.push({element, datasetIndex, index});
		}
	};
	optimizedEvaluateItems(chart, axis, position, evaluationFunc, true);
	return items;
}
function getNearestItems(chart, position, axis, intersect, useFinalPosition) {
	const distanceMetric = getDistanceMetricForAxis(axis);
	let minDistance = Number.POSITIVE_INFINITY;
	let items = [];
	if (!_isPointInArea(position, chart.chartArea)) {
		return items;
	}
	const evaluationFunc = function(element, datasetIndex, index) {
		if (intersect && !element.inRange(position.x, position.y, useFinalPosition)) {
			return;
		}
		const center = element.getCenterPoint(useFinalPosition);
		const distance = distanceMetric(position, center);
		if (distance < minDistance) {
			items = [{element, datasetIndex, index}];
			minDistance = distance;
		} else if (distance === minDistance) {
			items.push({element, datasetIndex, index});
		}
	};
	optimizedEvaluateItems(chart, axis, position, evaluationFunc);
	return items;
}
function getAxisItems(chart, e, options, useFinalPosition) {
	const position = getRelativePosition$1(e, chart);
	const items = [];
	const axis = options.axis;
	const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
	let intersectsItem = false;
	evaluateAllVisibleItems(chart, (element, datasetIndex, index) => {
		if (element[rangeMethod](position[axis], useFinalPosition)) {
			items.push({element, datasetIndex, index});
		}
		if (element.inRange(position.x, position.y, useFinalPosition)) {
			intersectsItem = true;
		}
	});
	if (options.intersect && !intersectsItem) {
		return [];
	}
	return items;
}
var Interaction = {
	modes: {
		index(chart, e, options, useFinalPosition) {
			const position = getRelativePosition$1(e, chart);
			const axis = options.axis || 'x';
			const items = options.intersect
				? getIntersectItems(chart, position, axis, useFinalPosition)
				: getNearestItems(chart, position, axis, false, useFinalPosition);
			const elements = [];
			if (!items.length) {
				return [];
			}
			chart.getSortedVisibleDatasetMetas().forEach((meta) => {
				const index = items[0].index;
				const element = meta.data[index];
				if (element && !element.skip) {
					elements.push({element, datasetIndex: meta.index, index});
				}
			});
			return elements;
		},
		dataset(chart, e, options, useFinalPosition) {
			const position = getRelativePosition$1(e, chart);
			const axis = options.axis || 'xy';
			let items = options.intersect
				? getIntersectItems(chart, position, axis, useFinalPosition) :
				getNearestItems(chart, position, axis, false, useFinalPosition);
			if (items.length > 0) {
				const datasetIndex = items[0].datasetIndex;
				const data = chart.getDatasetMeta(datasetIndex).data;
				items = [];
				for (let i = 0; i < data.length; ++i) {
					items.push({element: data[i], datasetIndex, index: i});
				}
			}
			return items;
		},
		point(chart, e, options, useFinalPosition) {
			const position = getRelativePosition$1(e, chart);
			const axis = options.axis || 'xy';
			return getIntersectItems(chart, position, axis, useFinalPosition);
		},
		nearest(chart, e, options, useFinalPosition) {
			const position = getRelativePosition$1(e, chart);
			const axis = options.axis || 'xy';
			return getNearestItems(chart, position, axis, options.intersect, useFinalPosition);
		},
		x(chart, e, options, useFinalPosition) {
			options.axis = 'x';
			return getAxisItems(chart, e, options, useFinalPosition);
		},
		y(chart, e, options, useFinalPosition) {
			options.axis = 'y';
			return getAxisItems(chart, e, options, useFinalPosition);
		}
	}
};

function toLineHeight(value, size) {
	const matches = ('' + value).match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
	if (!matches || matches[1] === 'normal') {
		return size * 1.2;
	}
	value = +matches[2];
	switch (matches[3]) {
	case 'px':
		return value;
	case '%':
		value /= 100;
		break;
	}
	return size * value;
}
const numberOrZero = v => +v || 0;
function toTRBL(value) {
	let t, r, b, l;
	if (isObject(value)) {
		t = numberOrZero(value.top);
		r = numberOrZero(value.right);
		b = numberOrZero(value.bottom);
		l = numberOrZero(value.left);
	} else {
		t = r = b = l = numberOrZero(value);
	}
	return {
		top: t,
		right: r,
		bottom: b,
		left: l
	};
}
function toTRBLCorners(value) {
	let tl, tr, bl, br;
	if (isObject(value)) {
		tl = numberOrZero(value.topLeft);
		tr = numberOrZero(value.topRight);
		bl = numberOrZero(value.bottomLeft);
		br = numberOrZero(value.bottomRight);
	} else {
		tl = tr = bl = br = numberOrZero(value);
	}
	return {
		topLeft: tl,
		topRight: tr,
		bottomLeft: bl,
		bottomRight: br
	};
}
function toPadding(value) {
	const obj = toTRBL(value);
	obj.width = obj.left + obj.right;
	obj.height = obj.top + obj.bottom;
	return obj;
}
function toFont(options, fallback) {
	options = options || {};
	fallback = fallback || defaults.font;
	let size = valueOrDefault(options.size, fallback.size);
	if (typeof size === 'string') {
		size = parseInt(size, 10);
	}
	const font = {
		family: valueOrDefault(options.family, fallback.family),
		lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
		size,
		style: valueOrDefault(options.style, fallback.style),
		weight: valueOrDefault(options.weight, fallback.weight),
		string: ''
	};
	font.string = toFontString(font);
	return font;
}
function resolve(inputs, context, index, info) {
	let cacheable = true;
	let i, ilen, value;
	for (i = 0, ilen = inputs.length; i < ilen; ++i) {
		value = inputs[i];
		if (value === undefined) {
			continue;
		}
		if (context !== undefined && typeof value === 'function') {
			value = value(context);
			cacheable = false;
		}
		if (index !== undefined && isArray(value)) {
			value = value[index % value.length];
			cacheable = false;
		}
		if (value !== undefined) {
			if (info && !cacheable) {
				info.cacheable = false;
			}
			return value;
		}
	}
}

const STATIC_POSITIONS = ['left', 'top', 'right', 'bottom'];
function filterByPosition(array, position) {
	return array.filter(v => v.pos === position);
}
function filterDynamicPositionByAxis(array, axis) {
	return array.filter(v => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
function sortByWeight(array, reverse) {
	return array.sort((a, b) => {
		const v0 = reverse ? b : a;
		const v1 = reverse ? a : b;
		return v0.weight === v1.weight ?
			v0.index - v1.index :
			v0.weight - v1.weight;
	});
}
function wrapBoxes(boxes) {
	const layoutBoxes = [];
	let i, ilen, box;
	for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
		box = boxes[i];
		layoutBoxes.push({
			index: i,
			box,
			pos: box.position,
			horizontal: box.isHorizontal(),
			weight: box.weight
		});
	}
	return layoutBoxes;
}
function setLayoutDims(layouts, params) {
	let i, ilen, layout;
	for (i = 0, ilen = layouts.length; i < ilen; ++i) {
		layout = layouts[i];
		if (layout.horizontal) {
			layout.width = layout.box.fullWidth && params.availableWidth;
			layout.height = params.hBoxMaxHeight;
		} else {
			layout.width = params.vBoxMaxWidth;
			layout.height = layout.box.fullWidth && params.availableHeight;
		}
	}
}
function buildLayoutBoxes(boxes) {
	const layoutBoxes = wrapBoxes(boxes);
	const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
	const right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
	const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
	const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
	const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
	const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');
	return {
		leftAndTop: left.concat(top),
		rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
		chartArea: filterByPosition(layoutBoxes, 'chartArea'),
		vertical: left.concat(right).concat(centerVertical),
		horizontal: top.concat(bottom).concat(centerHorizontal)
	};
}
function getCombinedMax(maxPadding, chartArea, a, b) {
	return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
function updateDims(chartArea, params, layout) {
	const box = layout.box;
	const maxPadding = chartArea.maxPadding;
	if (isObject(layout.pos)) {
		return;
	}
	if (layout.size) {
		chartArea[layout.pos] -= layout.size;
	}
	layout.size = layout.horizontal ? box.height : box.width;
	chartArea[layout.pos] += layout.size;
	if (box.getPadding) {
		const boxPadding = box.getPadding();
		maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
		maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
		maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
		maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
	}
	const newWidth = params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right');
	const newHeight = params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom');
	if (newWidth !== chartArea.w || newHeight !== chartArea.h) {
		chartArea.w = newWidth;
		chartArea.h = newHeight;
		return layout.horizontal ? newWidth !== chartArea.w : newHeight !== chartArea.h;
	}
}
function handleMaxPadding(chartArea) {
	const maxPadding = chartArea.maxPadding;
	function updatePos(pos) {
		const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
		chartArea[pos] += change;
		return change;
	}
	chartArea.y += updatePos('top');
	chartArea.x += updatePos('left');
	updatePos('right');
	updatePos('bottom');
}
function getMargins(horizontal, chartArea) {
	const maxPadding = chartArea.maxPadding;
	function marginForPositions(positions) {
		const margin = {left: 0, top: 0, right: 0, bottom: 0};
		positions.forEach((pos) => {
			margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
		});
		return margin;
	}
	return horizontal
		? marginForPositions(['left', 'right'])
		: marginForPositions(['top', 'bottom']);
}
function fitBoxes(boxes, chartArea, params) {
	const refitBoxes = [];
	let i, ilen, layout, box, refit, changed;
	for (i = 0, ilen = boxes.length; i < ilen; ++i) {
		layout = boxes[i];
		box = layout.box;
		box.update(
			layout.width || chartArea.w,
			layout.height || chartArea.h,
			getMargins(layout.horizontal, chartArea)
		);
		if (updateDims(chartArea, params, layout)) {
			changed = true;
			if (refitBoxes.length) {
				refit = true;
			}
		}
		if (!box.fullWidth) {
			refitBoxes.push(layout);
		}
	}
	return refit ? fitBoxes(refitBoxes, chartArea, params) || changed : changed;
}
function placeBoxes(boxes, chartArea, params) {
	const userPadding = params.padding;
	let x = chartArea.x;
	let y = chartArea.y;
	let i, ilen, layout, box;
	for (i = 0, ilen = boxes.length; i < ilen; ++i) {
		layout = boxes[i];
		box = layout.box;
		if (layout.horizontal) {
			box.left = box.fullWidth ? userPadding.left : chartArea.left;
			box.right = box.fullWidth ? params.outerWidth - userPadding.right : chartArea.left + chartArea.w;
			box.top = y;
			box.bottom = y + box.height;
			box.width = box.right - box.left;
			y = box.bottom;
		} else {
			box.left = x;
			box.right = x + box.width;
			box.top = box.fullWidth ? userPadding.top : chartArea.top;
			box.bottom = box.fullWidth ? params.outerHeight - userPadding.right : chartArea.top + chartArea.h;
			box.height = box.bottom - box.top;
			x = box.right;
		}
	}
	chartArea.x = x;
	chartArea.y = y;
}
defaults.set('layout', {
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
});
var layouts = {
	addBox(chart, item) {
		if (!chart.boxes) {
			chart.boxes = [];
		}
		item.fullWidth = item.fullWidth || false;
		item.position = item.position || 'top';
		item.weight = item.weight || 0;
		item._layers = item._layers || function() {
			return [{
				z: 0,
				draw(chartArea) {
					item.draw(chartArea);
				}
			}];
		};
		chart.boxes.push(item);
	},
	removeBox(chart, layoutItem) {
		const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
		if (index !== -1) {
			chart.boxes.splice(index, 1);
		}
	},
	configure(chart, item, options) {
		const props = ['fullWidth', 'position', 'weight'];
		const ilen = props.length;
		let i = 0;
		let prop;
		for (; i < ilen; ++i) {
			prop = props[i];
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				item[prop] = options[prop];
			}
		}
	},
	update(chart, width, height) {
		if (!chart) {
			return;
		}
		const layoutOptions = chart.options.layout || {};
		const context = {chart};
		const padding = toPadding(resolve([layoutOptions.padding], context));
		const availableWidth = width - padding.width;
		const availableHeight = height - padding.height;
		const boxes = buildLayoutBoxes(chart.boxes);
		const verticalBoxes = boxes.vertical;
		const horizontalBoxes = boxes.horizontal;
		const params = Object.freeze({
			outerWidth: width,
			outerHeight: height,
			padding,
			availableWidth,
			availableHeight,
			vBoxMaxWidth: availableWidth / 2 / verticalBoxes.length,
			hBoxMaxHeight: availableHeight / 2
		});
		const chartArea = Object.assign({
			maxPadding: Object.assign({}, padding),
			w: availableWidth,
			h: availableHeight,
			x: padding.left,
			y: padding.top
		}, padding);
		setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
		fitBoxes(verticalBoxes, chartArea, params);
		if (fitBoxes(horizontalBoxes, chartArea, params)) {
			fitBoxes(verticalBoxes, chartArea, params);
		}
		handleMaxPadding(chartArea);
		placeBoxes(boxes.leftAndTop, chartArea, params);
		chartArea.x += chartArea.w;
		chartArea.y += chartArea.h;
		placeBoxes(boxes.rightAndBottom, chartArea, params);
		chart.chartArea = {
			left: chartArea.left,
			top: chartArea.top,
			right: chartArea.left + chartArea.w,
			bottom: chartArea.top + chartArea.h,
			height: chartArea.h,
			width: chartArea.w,
		};
		each(boxes.chartArea, (layout) => {
			const box = layout.box;
			Object.assign(box, chart.chartArea);
			box.update(chartArea.w, chartArea.h);
		});
	}
};

class BasePlatform {
	acquireContext(canvas, options) {}
	releaseContext(context) {
		return false;
	}
	addEventListener(chart, type, listener) {}
	removeEventListener(chart, type, listener) {}
	getDevicePixelRatio() {
		return 1;
	}
	getMaximumSize(element, width, height, aspectRatio) {
		width = Math.max(0, width || element.width);
		height = height || element.height;
		return {
			width,
			height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
		};
	}
	isAttached(canvas) {
		return true;
	}
}

class BasicPlatform extends BasePlatform {
	acquireContext(item) {
		return item && item.getContext && item.getContext('2d') || null;
	}
}

const EXPANDO_KEY = '$chartjs';
const EVENT_TYPES = {
	touchstart: 'mousedown',
	touchmove: 'mousemove',
	touchend: 'mouseup',
	pointerenter: 'mouseenter',
	pointerdown: 'mousedown',
	pointermove: 'mousemove',
	pointerup: 'mouseup',
	pointerleave: 'mouseout',
	pointerout: 'mouseout'
};
const isNullOrEmpty = value => value === null || value === '';
function initCanvas(canvas, config) {
	const style = canvas.style;
	const renderHeight = canvas.getAttribute('height');
	const renderWidth = canvas.getAttribute('width');
	canvas[EXPANDO_KEY] = {
		initial: {
			height: renderHeight,
			width: renderWidth,
			style: {
				display: style.display,
				height: style.height,
				width: style.width
			}
		}
	};
	style.display = style.display || 'block';
	style.boxSizing = style.boxSizing || 'border-box';
	if (isNullOrEmpty(renderWidth)) {
		const displayWidth = readUsedSize(canvas, 'width');
		if (displayWidth !== undefined) {
			canvas.width = displayWidth;
		}
	}
	if (isNullOrEmpty(renderHeight)) {
		if (canvas.style.height === '') {
			canvas.height = canvas.width / (config.options.aspectRatio || 2);
		} else {
			const displayHeight = readUsedSize(canvas, 'height');
			if (displayHeight !== undefined) {
				canvas.height = displayHeight;
			}
		}
	}
	return canvas;
}
const eventListenerOptions = supportsEventListenerOptions ? {passive: true} : false;
function addListener(node, type, listener) {
	node.addEventListener(type, listener, eventListenerOptions);
}
function removeListener(chart, type, listener) {
	chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
function fromNativeEvent(event, chart) {
	const type = EVENT_TYPES[event.type] || event.type;
	const {x, y} = getRelativePosition(event, chart);
	return {
		type,
		chart,
		native: event,
		x: x !== undefined ? x : null,
		y: y !== undefined ? y : null,
	};
}
function createAttachObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	const element = container || canvas;
	const observer = new MutationObserver(entries => {
		const parent = _getParentNode(element);
		entries.forEach(entry => {
			for (let i = 0; i < entry.addedNodes.length; i++) {
				const added = entry.addedNodes[i];
				if (added === element || added === parent) {
					listener(entry.target);
				}
			}
		});
	});
	observer.observe(document, {childList: true, subtree: true});
	return observer;
}
function createDetachObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	if (!container) {
		return;
	}
	const observer = new MutationObserver(entries => {
		entries.forEach(entry => {
			for (let i = 0; i < entry.removedNodes.length; i++) {
				if (entry.removedNodes[i] === canvas) {
					listener();
					break;
				}
			}
		});
	});
	observer.observe(container, {childList: true});
	return observer;
}
const drpListeningCharts = new Map();
let oldDevicePixelRatio = 0;
function onWindowResize() {
	const dpr = window.devicePixelRatio;
	if (dpr === oldDevicePixelRatio) {
		return;
	}
	oldDevicePixelRatio = dpr;
	drpListeningCharts.forEach((resize, chart) => {
		if (chart.currentDevicePixelRatio !== dpr) {
			resize();
		}
	});
}
function listenDevicePixelRatioChanges(chart, resize) {
	if (!drpListeningCharts.size) {
		window.addEventListener('resize', onWindowResize);
	}
	drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
	drpListeningCharts.delete(chart);
	if (!drpListeningCharts.size) {
		window.removeEventListener('resize', onWindowResize);
	}
}
function createResizeObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	if (!container) {
		return;
	}
	const resize = throttled((width, height) => {
		const w = container.clientWidth;
		listener(width, height);
		if (w < container.clientWidth) {
			listener();
		}
	}, window);
	const observer = new ResizeObserver(entries => {
		const entry = entries[0];
		const width = entry.contentRect.width;
		const height = entry.contentRect.height;
		if (width === 0 && height === 0) {
			return;
		}
		resize(width, height);
	});
	observer.observe(container);
	listenDevicePixelRatioChanges(chart, resize);
	return observer;
}
function releaseObserver(chart, type, observer) {
	if (observer) {
		observer.disconnect();
	}
	if (type === 'resize') {
		unlistenDevicePixelRatioChanges(chart);
	}
}
function createProxyAndListen(chart, type, listener) {
	const canvas = chart.canvas;
	const proxy = throttled((event) => {
		if (chart.ctx !== null) {
			listener(fromNativeEvent(event, chart));
		}
	}, chart, (args) => {
		const event = args[0];
		return [event, event.offsetX, event.offsetY];
	});
	addListener(canvas, type, proxy);
	return proxy;
}
class DomPlatform extends BasePlatform {
	acquireContext(canvas, config) {
		const context = canvas && canvas.getContext && canvas.getContext('2d');
		if (context && context.canvas === canvas) {
			initCanvas(canvas, config);
			return context;
		}
		return null;
	}
	releaseContext(context) {
		const canvas = context.canvas;
		if (!canvas[EXPANDO_KEY]) {
			return false;
		}
		const initial = canvas[EXPANDO_KEY].initial;
		['height', 'width'].forEach((prop) => {
			const value = initial[prop];
			if (isNullOrUndef(value)) {
				canvas.removeAttribute(prop);
			} else {
				canvas.setAttribute(prop, value);
			}
		});
		const style = initial.style || {};
		Object.keys(style).forEach((key) => {
			canvas.style[key] = style[key];
		});
		canvas.width = canvas.width;
		delete canvas[EXPANDO_KEY];
		return true;
	}
	addEventListener(chart, type, listener) {
		this.removeEventListener(chart, type);
		const proxies = chart.$proxies || (chart.$proxies = {});
		const handlers = {
			attach: createAttachObserver,
			detach: createDetachObserver,
			resize: createResizeObserver
		};
		const handler = handlers[type] || createProxyAndListen;
		proxies[type] = handler(chart, type, listener);
	}
	removeEventListener(chart, type) {
		const proxies = chart.$proxies || (chart.$proxies = {});
		const proxy = proxies[type];
		if (!proxy) {
			return;
		}
		const handlers = {
			attach: releaseObserver,
			detach: releaseObserver,
			resize: releaseObserver
		};
		const handler = handlers[type] || removeListener;
		handler(chart, type, proxy);
		proxies[type] = undefined;
	}
	getDevicePixelRatio() {
		return window.devicePixelRatio;
	}
	getMaximumSize(canvas, width, height, aspectRatio) {
		return getMaximumSize(canvas, width, height, aspectRatio);
	}
	isAttached(canvas) {
		const container = _getParentNode(canvas);
		return !!(container && _getParentNode(container));
	}
}

var platforms = /*#__PURE__*/Object.freeze({
__proto__: null,
BasePlatform: BasePlatform,
BasicPlatform: BasicPlatform,
DomPlatform: DomPlatform
});

const effects = {
	linear(t) {
		return t;
	},
	easeInQuad(t) {
		return t * t;
	},
	easeOutQuad(t) {
		return -t * (t - 2);
	},
	easeInOutQuad(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t;
		}
		return -0.5 * ((--t) * (t - 2) - 1);
	},
	easeInCubic(t) {
		return t * t * t;
	},
	easeOutCubic(t) {
		return (t -= 1) * t * t + 1;
	},
	easeInOutCubic(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t;
		}
		return 0.5 * ((t -= 2) * t * t + 2);
	},
	easeInQuart(t) {
		return t * t * t * t;
	},
	easeOutQuart(t) {
		return -((t -= 1) * t * t * t - 1);
	},
	easeInOutQuart(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t * t;
		}
		return -0.5 * ((t -= 2) * t * t * t - 2);
	},
	easeInQuint(t) {
		return t * t * t * t * t;
	},
	easeOutQuint(t) {
		return (t -= 1) * t * t * t * t + 1;
	},
	easeInOutQuint(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t * t * t;
		}
		return 0.5 * ((t -= 2) * t * t * t * t + 2);
	},
	easeInSine(t) {
		return -Math.cos(t * HALF_PI) + 1;
	},
	easeOutSine(t) {
		return Math.sin(t * HALF_PI);
	},
	easeInOutSine(t) {
		return -0.5 * (Math.cos(PI * t) - 1);
	},
	easeInExpo(t) {
		return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
	},
	easeOutExpo(t) {
		return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
	},
	easeInOutExpo(t) {
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if ((t /= 0.5) < 1) {
			return 0.5 * Math.pow(2, 10 * (t - 1));
		}
		return 0.5 * (-Math.pow(2, -10 * --t) + 2);
	},
	easeInCirc(t) {
		if (t >= 1) {
			return t;
		}
		return -(Math.sqrt(1 - t * t) - 1);
	},
	easeOutCirc(t) {
		return Math.sqrt(1 - (t -= 1) * t);
	},
	easeInOutCirc(t) {
		if ((t /= 0.5) < 1) {
			return -0.5 * (Math.sqrt(1 - t * t) - 1);
		}
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	easeInElastic(t) {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		{
			s = p / TAU * Math.asin(1 / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
	},
	easeOutElastic(t) {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		{
			s = p / TAU * Math.asin(1 / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
	},
	easeInOutElastic(t) {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) {
			return 0;
		}
		if ((t /= 0.5) === 2) {
			return 1;
		}
		if (!p) {
			p = 0.45;
		}
		{
			s = p / TAU * Math.asin(1 / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
		}
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * TAU / p) * 0.5 + 1;
	},
	easeInBack(t) {
		const s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},
	easeOutBack(t) {
		const s = 1.70158;
		return (t -= 1) * t * ((s + 1) * t + s) + 1;
	},
	easeInOutBack(t) {
		let s = 1.70158;
		if ((t /= 0.5) < 1) {
			return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
		}
		return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	},
	easeInBounce(t) {
		return 1 - effects.easeOutBounce(1 - t);
	},
	easeOutBounce(t) {
		if (t < (1 / 2.75)) {
			return 7.5625 * t * t;
		}
		if (t < (2 / 2.75)) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
	},
	easeInOutBounce(t) {
		if (t < 0.5) {
			return effects.easeInBounce(t * 2) * 0.5;
		}
		return effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
	}
};

/*!
 * @kurkle/color v0.1.9
 * https://github.com/kurkle/color#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT License
 */
const map = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15};
const hex = '0123456789ABCDEF';
const h1 = (b) => hex[b & 0xF];
const h2 = (b) => hex[(b & 0xF0) >> 4] + hex[b & 0xF];
const eq = (b) => (((b & 0xF0) >> 4) === (b & 0xF));
function isShort(v) {
	return eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
}
function hexParse(str) {
	var len = str.length;
	var ret;
	if (str[0] === '#') {
		if (len === 4 || len === 5) {
			ret = {
				r: 255 & map[str[1]] * 17,
				g: 255 & map[str[2]] * 17,
				b: 255 & map[str[3]] * 17,
				a: len === 5 ? map[str[4]] * 17 : 255
			};
		} else if (len === 7 || len === 9) {
			ret = {
				r: map[str[1]] << 4 | map[str[2]],
				g: map[str[3]] << 4 | map[str[4]],
				b: map[str[5]] << 4 | map[str[6]],
				a: len === 9 ? (map[str[7]] << 4 | map[str[8]]) : 255
			};
		}
	}
	return ret;
}
function hexString(v) {
	var f = isShort(v) ? h1 : h2;
	return v
		? '#' + f(v.r) + f(v.g) + f(v.b) + (v.a < 255 ? f(v.a) : '')
		: v;
}
function round(v) {
	return v + 0.5 | 0;
}
const lim = (v, l, h) => Math.max(Math.min(v, h), l);
function p2b(v) {
	return lim(round(v * 2.55), 0, 255);
}
function n2b(v) {
	return lim(round(v * 255), 0, 255);
}
function b2n(v) {
	return lim(round(v / 2.55) / 100, 0, 1);
}
function n2p(v) {
	return lim(round(v * 100), 0, 100);
}
const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
	const m = RGB_RE.exec(str);
	let a = 255;
	let r, g, b;
	if (!m) {
		return;
	}
	if (m[7] !== r) {
		const v = +m[7];
		a = 255 & (m[8] ? p2b(v) : v * 255);
	}
	r = +m[1];
	g = +m[3];
	b = +m[5];
	r = 255 & (m[2] ? p2b(r) : r);
	g = 255 & (m[4] ? p2b(g) : g);
	b = 255 & (m[6] ? p2b(b) : b);
	return {
		r: r,
		g: g,
		b: b,
		a: a
	};
}
function rgbString(v) {
	return v && (
		v.a < 255
			? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})`
			: `rgb(${v.r}, ${v.g}, ${v.b})`
	);
}
const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
	const a = s * Math.min(l, 1 - l);
	const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	return [f(0), f(8), f(4)];
}
function hsv2rgbn(h, s, v) {
	const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
	return [f(5), f(3), f(1)];
}
function hwb2rgbn(h, w, b) {
	const rgb = hsl2rgbn(h, 1, 0.5);
	let i;
	if (w + b > 1) {
		i = 1 / (w + b);
		w *= i;
		b *= i;
	}
	for (i = 0; i < 3; i++) {
		rgb[i] *= 1 - w - b;
		rgb[i] += w;
	}
	return rgb;
}
function rgb2hsl(v) {
	const range = 255;
	const r = v.r / range;
	const g = v.g / range;
	const b = v.b / range;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	let h, s, d;
	if (max !== min) {
		d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		h = max === r
			? ((g - b) / d) + (g < b ? 6 : 0)
			: max === g
				? (b - r) / d + 2
				: (r - g) / d + 4;
		h = h * 60 + 0.5;
	}
	return [h | 0, s || 0, l];
}
function calln(f, a, b, c) {
	return (
		Array.isArray(a)
			? f(a[0], a[1], a[2])
			: f(a, b, c)
	).map(n2b);
}
function hsl2rgb(h, s, l) {
	return calln(hsl2rgbn, h, s, l);
}
function hwb2rgb(h, w, b) {
	return calln(hwb2rgbn, h, w, b);
}
function hsv2rgb(h, s, v) {
	return calln(hsv2rgbn, h, s, v);
}
function hue(h) {
	return (h % 360 + 360) % 360;
}
function hueParse(str) {
	const m = HUE_RE.exec(str);
	let a = 255;
	let v;
	if (!m) {
		return;
	}
	if (m[5] !== v) {
		a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
	}
	const h = hue(+m[2]);
	const p1 = +m[3] / 100;
	const p2 = +m[4] / 100;
	if (m[1] === 'hwb') {
		v = hwb2rgb(h, p1, p2);
	} else if (m[1] === 'hsv') {
		v = hsv2rgb(h, p1, p2);
	} else {
		v = hsl2rgb(h, p1, p2);
	}
	return {
		r: v[0],
		g: v[1],
		b: v[2],
		a: a
	};
}
function rotate(v, deg) {
	var h = rgb2hsl(v);
	h[0] = hue(h[0] + deg);
	h = hsl2rgb(h);
	v.r = h[0];
	v.g = h[1];
	v.b = h[2];
}
function hslString(v) {
	if (!v) {
		return;
	}
	const a = rgb2hsl(v);
	const h = a[0];
	const s = n2p(a[1]);
	const l = n2p(a[2]);
	return v.a < 255
		? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})`
		: `hsl(${h}, ${s}%, ${l}%)`;
}
const map$1 = {
	x: 'dark',
	Z: 'light',
	Y: 're',
	X: 'blu',
	W: 'gr',
	V: 'medium',
	U: 'slate',
	A: 'ee',
	T: 'ol',
	S: 'or',
	B: 'ra',
	C: 'lateg',
	D: 'ights',
	R: 'in',
	Q: 'turquois',
	E: 'hi',
	P: 'ro',
	O: 'al',
	N: 'le',
	M: 'de',
	L: 'yello',
	F: 'en',
	K: 'ch',
	G: 'arks',
	H: 'ea',
	I: 'ightg',
	J: 'wh'
};
const names = {
	OiceXe: 'f0f8ff',
	antiquewEte: 'faebd7',
	aqua: 'ffff',
	aquamarRe: '7fffd4',
	azuY: 'f0ffff',
	beige: 'f5f5dc',
	bisque: 'ffe4c4',
	black: '0',
	blanKedOmond: 'ffebcd',
	Xe: 'ff',
	XeviTet: '8a2be2',
	bPwn: 'a52a2a',
	burlywood: 'deb887',
	caMtXe: '5f9ea0',
	KartYuse: '7fff00',
	KocTate: 'd2691e',
	cSO: 'ff7f50',
	cSnflowerXe: '6495ed',
	cSnsilk: 'fff8dc',
	crimson: 'dc143c',
	cyan: 'ffff',
	xXe: '8b',
	xcyan: '8b8b',
	xgTMnPd: 'b8860b',
	xWay: 'a9a9a9',
	xgYF: '6400',
	xgYy: 'a9a9a9',
	xkhaki: 'bdb76b',
	xmagFta: '8b008b',
	xTivegYF: '556b2f',
	xSange: 'ff8c00',
	xScEd: '9932cc',
	xYd: '8b0000',
	xsOmon: 'e9967a',
	xsHgYF: '8fbc8f',
	xUXe: '483d8b',
	xUWay: '2f4f4f',
	xUgYy: '2f4f4f',
	xQe: 'ced1',
	xviTet: '9400d3',
	dAppRk: 'ff1493',
	dApskyXe: 'bfff',
	dimWay: '696969',
	dimgYy: '696969',
	dodgerXe: '1e90ff',
	fiYbrick: 'b22222',
	flSOwEte: 'fffaf0',
	foYstWAn: '228b22',
	fuKsia: 'ff00ff',
	gaRsbSo: 'dcdcdc',
	ghostwEte: 'f8f8ff',
	gTd: 'ffd700',
	gTMnPd: 'daa520',
	Way: '808080',
	gYF: '8000',
	gYFLw: 'adff2f',
	gYy: '808080',
	honeyMw: 'f0fff0',
	hotpRk: 'ff69b4',
	RdianYd: 'cd5c5c',
	Rdigo: '4b0082',
	ivSy: 'fffff0',
	khaki: 'f0e68c',
	lavFMr: 'e6e6fa',
	lavFMrXsh: 'fff0f5',
	lawngYF: '7cfc00',
	NmoncEffon: 'fffacd',
	ZXe: 'add8e6',
	ZcSO: 'f08080',
	Zcyan: 'e0ffff',
	ZgTMnPdLw: 'fafad2',
	ZWay: 'd3d3d3',
	ZgYF: '90ee90',
	ZgYy: 'd3d3d3',
	ZpRk: 'ffb6c1',
	ZsOmon: 'ffa07a',
	ZsHgYF: '20b2aa',
	ZskyXe: '87cefa',
	ZUWay: '778899',
	ZUgYy: '778899',
	ZstAlXe: 'b0c4de',
	ZLw: 'ffffe0',
	lime: 'ff00',
	limegYF: '32cd32',
	lRF: 'faf0e6',
	magFta: 'ff00ff',
	maPon: '800000',
	VaquamarRe: '66cdaa',
	VXe: 'cd',
	VScEd: 'ba55d3',
	VpurpN: '9370db',
	VsHgYF: '3cb371',
	VUXe: '7b68ee',
	VsprRggYF: 'fa9a',
	VQe: '48d1cc',
	VviTetYd: 'c71585',
	midnightXe: '191970',
	mRtcYam: 'f5fffa',
	mistyPse: 'ffe4e1',
	moccasR: 'ffe4b5',
	navajowEte: 'ffdead',
	navy: '80',
	Tdlace: 'fdf5e6',
	Tive: '808000',
	TivedBb: '6b8e23',
	Sange: 'ffa500',
	SangeYd: 'ff4500',
	ScEd: 'da70d6',
	pOegTMnPd: 'eee8aa',
	pOegYF: '98fb98',
	pOeQe: 'afeeee',
	pOeviTetYd: 'db7093',
	papayawEp: 'ffefd5',
	pHKpuff: 'ffdab9',
	peru: 'cd853f',
	pRk: 'ffc0cb',
	plum: 'dda0dd',
	powMrXe: 'b0e0e6',
	purpN: '800080',
	YbeccapurpN: '663399',
	Yd: 'ff0000',
	Psybrown: 'bc8f8f',
	PyOXe: '4169e1',
	saddNbPwn: '8b4513',
	sOmon: 'fa8072',
	sandybPwn: 'f4a460',
	sHgYF: '2e8b57',
	sHshell: 'fff5ee',
	siFna: 'a0522d',
	silver: 'c0c0c0',
	skyXe: '87ceeb',
	UXe: '6a5acd',
	UWay: '708090',
	UgYy: '708090',
	snow: 'fffafa',
	sprRggYF: 'ff7f',
	stAlXe: '4682b4',
	tan: 'd2b48c',
	teO: '8080',
	tEstN: 'd8bfd8',
	tomato: 'ff6347',
	Qe: '40e0d0',
	viTet: 'ee82ee',
	JHt: 'f5deb3',
	wEte: 'ffffff',
	wEtesmoke: 'f5f5f5',
	Lw: 'ffff00',
	LwgYF: '9acd32'
};
function unpack() {
	const unpacked = {};
	const keys = Object.keys(names);
	const tkeys = Object.keys(map$1);
	let i, j, k, ok, nk;
	for (i = 0; i < keys.length; i++) {
		ok = nk = keys[i];
		for (j = 0; j < tkeys.length; j++) {
			k = tkeys[j];
			nk = nk.replace(k, map$1[k]);
		}
		k = parseInt(names[ok], 16);
		unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
	}
	return unpacked;
}
let names$1;
function nameParse(str) {
	if (!names$1) {
		names$1 = unpack();
		names$1.transparent = [0, 0, 0, 0];
	}
	const a = names$1[str.toLowerCase()];
	return a && {
		r: a[0],
		g: a[1],
		b: a[2],
		a: a.length === 4 ? a[3] : 255
	};
}
function modHSL(v, i, ratio) {
	if (v) {
		let tmp = rgb2hsl(v);
		tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
		tmp = hsl2rgb(tmp);
		v.r = tmp[0];
		v.g = tmp[1];
		v.b = tmp[2];
	}
}
function clone$1(v, proto) {
	return v ? Object.assign(proto || {}, v) : v;
}
function fromObject(input) {
	var v = {r: 0, g: 0, b: 0, a: 255};
	if (Array.isArray(input)) {
		if (input.length >= 3) {
			v = {r: input[0], g: input[1], b: input[2], a: 255};
			if (input.length > 3) {
				v.a = n2b(input[3]);
			}
		}
	} else {
		v = clone$1(input, {r: 0, g: 0, b: 0, a: 1});
		v.a = n2b(v.a);
	}
	return v;
}
function functionParse(str) {
	if (str.charAt(0) === 'r') {
		return rgbParse(str);
	}
	return hueParse(str);
}
class Color {
	constructor(input) {
		if (input instanceof Color) {
			return input;
		}
		const type = typeof input;
		let v;
		if (type === 'object') {
			v = fromObject(input);
		} else if (type === 'string') {
			v = hexParse(input) || nameParse(input) || functionParse(input);
		}
		this._rgb = v;
		this._valid = !!v;
	}
	get valid() {
		return this._valid;
	}
	get rgb() {
		var v = clone$1(this._rgb);
		if (v) {
			v.a = b2n(v.a);
		}
		return v;
	}
	set rgb(obj) {
		this._rgb = fromObject(obj);
	}
	rgbString() {
		return this._valid ? rgbString(this._rgb) : this._rgb;
	}
	hexString() {
		return this._valid ? hexString(this._rgb) : this._rgb;
	}
	hslString() {
		return this._valid ? hslString(this._rgb) : this._rgb;
	}
	mix(color, weight) {
		const me = this;
		if (color) {
			const c1 = me.rgb;
			const c2 = color.rgb;
			let w2;
			const p = weight === w2 ? 0.5 : weight;
			const w = 2 * p - 1;
			const a = c1.a - c2.a;
			const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
			w2 = 1 - w1;
			c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5;
			c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5;
			c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5;
			c1.a = p * c1.a + (1 - p) * c2.a;
			me.rgb = c1;
		}
		return me;
	}
	clone() {
		return new Color(this.rgb);
	}
	alpha(a) {
		this._rgb.a = n2b(a);
		return this;
	}
	clearer(ratio) {
		const rgb = this._rgb;
		rgb.a *= 1 - ratio;
		return this;
	}
	greyscale() {
		const rgb = this._rgb;
		const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
		rgb.r = rgb.g = rgb.b = val;
		return this;
	}
	opaquer(ratio) {
		const rgb = this._rgb;
		rgb.a *= 1 + ratio;
		return this;
	}
	negate() {
		const v = this._rgb;
		v.r = 255 - v.r;
		v.g = 255 - v.g;
		v.b = 255 - v.b;
		return this;
	}
	lighten(ratio) {
		modHSL(this._rgb, 2, ratio);
		return this;
	}
	darken(ratio) {
		modHSL(this._rgb, 2, -ratio);
		return this;
	}
	saturate(ratio) {
		modHSL(this._rgb, 1, ratio);
		return this;
	}
	desaturate(ratio) {
		modHSL(this._rgb, 1, -ratio);
		return this;
	}
	rotate(deg) {
		rotate(this._rgb, deg);
		return this;
	}
}
function index_esm(input) {
	return new Color(input);
}

const isPatternOrGradient = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;
function color(value) {
	return isPatternOrGradient(value) ? value : index_esm(value);
}
function getHoverColor(value) {
	return isPatternOrGradient(value)
		? value
		: index_esm(value).saturate(0.5).darken(0.1).hexString();
}

const transparent = 'transparent';
const interpolators = {
	boolean(from, to, factor) {
		return factor > 0.5 ? to : from;
	},
	color(from, to, factor) {
		const c0 = color(from || transparent);
		const c1 = c0.valid && color(to || transparent);
		return c1 && c1.valid
			? c1.mix(c0, factor).hexString()
			: to;
	},
	number(from, to, factor) {
		return from + (to - from) * factor;
	}
};
class Animation {
	constructor(cfg, target, prop, to) {
		const currentValue = target[prop];
		to = resolve([cfg.to, to, currentValue, cfg.from]);
		const from = resolve([cfg.from, currentValue, to]);
		this._active = true;
		this._fn = cfg.fn || interpolators[cfg.type || typeof from];
		this._easing = effects[cfg.easing || 'linear'];
		this._start = Math.floor(Date.now() + (cfg.delay || 0));
		this._duration = Math.floor(cfg.duration);
		this._loop = !!cfg.loop;
		this._target = target;
		this._prop = prop;
		this._from = from;
		this._to = to;
		this._promises = undefined;
	}
	active() {
		return this._active;
	}
	update(cfg, to, date) {
		const me = this;
		if (me._active) {
			const currentValue = me._target[me._prop];
			const elapsed = date - me._start;
			const remain = me._duration - elapsed;
			me._start = date;
			me._duration = Math.floor(Math.max(remain, cfg.duration));
			me._loop = !!cfg.loop;
			me._to = resolve([cfg.to, to, currentValue, cfg.from]);
			me._from = resolve([cfg.from, currentValue, to]);
		}
	}
	cancel() {
		const me = this;
		if (me._active) {
			me.tick(Date.now());
			me._active = false;
			me._notify(false);
		}
	}
	tick(date) {
		const me = this;
		const elapsed = date - me._start;
		const duration = me._duration;
		const prop = me._prop;
		const from = me._from;
		const loop = me._loop;
		const to = me._to;
		let factor;
		me._active = from !== to && (loop || (elapsed < duration));
		if (!me._active) {
			me._target[prop] = to;
			me._notify(true);
			return;
		}
		if (elapsed < 0) {
			me._target[prop] = from;
			return;
		}
		factor = (elapsed / duration) % 2;
		factor = loop && factor > 1 ? 2 - factor : factor;
		factor = me._easing(Math.min(1, Math.max(0, factor)));
		me._target[prop] = me._fn(from, to, factor);
	}
	wait() {
		const promises = this._promises || (this._promises = []);
		return new Promise((res, rej) => {
			promises.push({res, rej});
		});
	}
	_notify(resolved) {
		const method = resolved ? 'res' : 'rej';
		const promises = this._promises || [];
		for (let i = 0; i < promises.length; i++) {
			promises[i][method]();
		}
	}
}

const numbers = ['x', 'y', 'borderWidth', 'radius', 'tension'];
const colors = ['borderColor', 'backgroundColor'];
defaults.set('animation', {
	duration: 1000,
	easing: 'easeOutQuart',
	onProgress: noop,
	onComplete: noop,
	colors: {
		type: 'color',
		properties: colors
	},
	numbers: {
		type: 'number',
		properties: numbers
	},
	active: {
		duration: 400
	},
	resize: {
		duration: 0
	},
	show: {
		colors: {
			type: 'color',
			properties: colors,
			from: 'transparent'
		},
		visible: {
			type: 'boolean',
			duration: 0
		},
	},
	hide: {
		colors: {
			type: 'color',
			properties: colors,
			to: 'transparent'
		},
		visible: {
			type: 'boolean',
			easing: 'easeInExpo'
		},
	}
});
function copyOptions(target, values) {
	const oldOpts = target.options;
	const newOpts = values.options;
	if (!oldOpts || !newOpts) {
		return;
	}
	if (oldOpts.$shared && !newOpts.$shared) {
		target.options = Object.assign({}, oldOpts, newOpts, {$shared: false});
	} else {
		Object.assign(oldOpts, newOpts);
	}
	delete values.options;
}
function extensibleConfig(animations) {
	const result = {};
	Object.keys(animations).forEach(key => {
		const value = animations[key];
		if (!isObject(value)) {
			result[key] = value;
		}
	});
	return result;
}
class Animations {
	constructor(chart, animations) {
		this._chart = chart;
		this._properties = new Map();
		this.configure(animations);
	}
	configure(animations) {
		if (!isObject(animations)) {
			return;
		}
		const animatedProps = this._properties;
		const animDefaults = extensibleConfig(animations);
		Object.keys(animations).forEach(key => {
			const cfg = animations[key];
			if (!isObject(cfg)) {
				return;
			}
			(cfg.properties || [key]).forEach((prop) => {
				if (!animatedProps.has(prop)) {
					animatedProps.set(prop, Object.assign({}, animDefaults, cfg));
				} else if (prop === key) {
					const {properties, ...inherited} = animatedProps.get(prop);
					animatedProps.set(prop, Object.assign({}, inherited, cfg));
				}
			});
		});
	}
	_animateOptions(target, values) {
		const newOptions = values.options;
		const options = resolveTargetOptions(target, newOptions);
		if (!options) {
			return [];
		}
		const animations = this._createAnimations(options, newOptions);
		if (newOptions.$shared && !options.$shared) {
			awaitAll(target.options.$animations, newOptions).then(() => {
				target.options = newOptions;
			});
		}
		return animations;
	}
	_createAnimations(target, values) {
		const animatedProps = this._properties;
		const animations = [];
		const running = target.$animations || (target.$animations = {});
		const props = Object.keys(values);
		const date = Date.now();
		let i;
		for (i = props.length - 1; i >= 0; --i) {
			const prop = props[i];
			if (prop.charAt(0) === '$') {
				continue;
			}
			if (prop === 'options') {
				animations.push(...this._animateOptions(target, values));
				continue;
			}
			const value = values[prop];
			let animation = running[prop];
			const cfg = animatedProps.get(prop);
			if (animation) {
				if (cfg && animation.active()) {
					animation.update(cfg, value, date);
					continue;
				} else {
					animation.cancel();
				}
			}
			if (!cfg || !cfg.duration) {
				target[prop] = value;
				continue;
			}
			running[prop] = animation = new Animation(cfg, target, prop, value);
			animations.push(animation);
		}
		return animations;
	}
	update(target, values) {
		if (this._properties.size === 0) {
			copyOptions(target, values);
			Object.assign(target, values);
			return;
		}
		const animations = this._createAnimations(target, values);
		if (animations.length) {
			animator.add(this._chart, animations);
			return true;
		}
	}
}
function awaitAll(animations, properties) {
	const running = [];
	const keys = Object.keys(properties);
	for (let i = 0; i < keys.length; i++) {
		const anim = animations[keys[i]];
		if (anim && anim.active()) {
			running.push(anim.wait());
		}
	}
	return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
	if (!newOptions) {
		return;
	}
	let options = target.options;
	if (!options) {
		target.options = newOptions;
		return;
	}
	if (options.$shared && !newOptions.$shared) {
		target.options = options = Object.assign({}, options, {$shared: false, $animations: {}});
	}
	return options;
}

function scaleClip(scale, allowedOverflow) {
	const opts = scale && scale.options || {};
	const reverse = opts.reverse;
	const min = opts.min === undefined ? allowedOverflow : 0;
	const max = opts.max === undefined ? allowedOverflow : 0;
	return {
		start: reverse ? max : min,
		end: reverse ? min : max
	};
}
function defaultClip(xScale, yScale, allowedOverflow) {
	if (allowedOverflow === false) {
		return false;
	}
	const x = scaleClip(xScale, allowedOverflow);
	const y = scaleClip(yScale, allowedOverflow);
	return {
		top: y.end,
		right: x.end,
		bottom: y.start,
		left: x.start
	};
}
function toClip(value) {
	let t, r, b, l;
	if (isObject(value)) {
		t = value.top;
		r = value.right;
		b = value.bottom;
		l = value.left;
	} else {
		t = r = b = l = value;
	}
	return {
		top: t,
		right: r,
		bottom: b,
		left: l
	};
}
function getSortedDatasetIndices(chart, filterVisible) {
	const keys = [];
	const metasets = chart._getSortedDatasetMetas(filterVisible);
	let i, ilen;
	for (i = 0, ilen = metasets.length; i < ilen; ++i) {
		keys.push(metasets[i].index);
	}
	return keys;
}
function applyStack(stack, value, dsIndex, allOther) {
	const keys = stack.keys;
	let i, ilen, datasetIndex, otherValue;
	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		datasetIndex = +keys[i];
		if (datasetIndex === dsIndex) {
			if (allOther) {
				continue;
			}
			break;
		}
		otherValue = stack.values[datasetIndex];
		if (!isNaN(otherValue) && (value === 0 || sign(value) === sign(otherValue))) {
			value += otherValue;
		}
	}
	return value;
}
function convertObjectDataToArray(data) {
	const keys = Object.keys(data);
	const adata = new Array(keys.length);
	let i, ilen, key;
	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		key = keys[i];
		adata[i] = {
			x: key,
			y: data[key]
		};
	}
	return adata;
}
function isStacked(scale, meta) {
	const stacked = scale && scale.options.stacked;
	return stacked || (stacked === undefined && meta.stack !== undefined);
}
function getStackKey(indexScale, valueScale, meta) {
	return indexScale.id + '.' + valueScale.id + '.' + meta.stack + '.' + meta.type;
}
function getUserBounds(scale) {
	const {min, max, minDefined, maxDefined} = scale.getUserBounds();
	return {
		min: minDefined ? min : Number.NEGATIVE_INFINITY,
		max: maxDefined ? max : Number.POSITIVE_INFINITY
	};
}
function getOrCreateStack(stacks, stackKey, indexValue) {
	const subStack = stacks[stackKey] || (stacks[stackKey] = {});
	return subStack[indexValue] || (subStack[indexValue] = {});
}
function updateStacks(controller, parsed) {
	const {chart, _cachedMeta: meta} = controller;
	const stacks = chart._stacks || (chart._stacks = {});
	const {iScale, vScale, index: datasetIndex} = meta;
	const iAxis = iScale.axis;
	const vAxis = vScale.axis;
	const key = getStackKey(iScale, vScale, meta);
	const ilen = parsed.length;
	let stack;
	for (let i = 0; i < ilen; ++i) {
		const item = parsed[i];
		const {[iAxis]: index, [vAxis]: value} = item;
		const itemStacks = item._stacks || (item._stacks = {});
		stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
		stack[datasetIndex] = value;
	}
}
function getFirstScaleId(chart, axis) {
	const scales = chart.scales;
	return Object.keys(scales).filter(key => scales[key].axis === axis).shift();
}
function createDatasetContext(parent, index, dataset) {
	return Object.create(parent, {
		active: {
			writable: true,
			value: false
		},
		dataset: {
			value: dataset
		},
		datasetIndex: {
			value: index
		},
		index: {
			get() {
				return this.datasetIndex;
			}
		},
		type: {
			value: 'dataset'
		}
	});
}
function createDataContext(parent, index, point, element) {
	return Object.create(parent, {
		active: {
			writable: true,
			value: false
		},
		dataIndex: {
			value: index
		},
		dataPoint: {
			value: point
		},
		element: {
			value: element
		},
		index: {
			get() {
				return this.dataIndex;
			}
		},
		type: {
			value: 'data',
		}
	});
}
function clearStacks(meta, items) {
	items = items || meta._parsed;
	items.forEach((parsed) => {
		delete parsed._stacks[meta.vScale.id][meta.index];
	});
}
const optionKeys = (optionNames) => isArray(optionNames) ? optionNames : Object.keys(optionNames);
const optionKey = (key, active) => active ? 'hover' + _capitalize(key) : key;
const isDirectUpdateMode = (mode) => mode === 'reset' || mode === 'none';
const cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
const freezeIfShared = (values, shared) => shared ? Object.freeze(values) : values;
class DatasetController {
	constructor(chart, datasetIndex) {
		this.chart = chart;
		this._ctx = chart.ctx;
		this.index = datasetIndex;
		this._cachedAnimations = {};
		this._cachedDataOpts = {};
		this._cachedMeta = this.getMeta();
		this._type = this._cachedMeta.type;
		this._config = undefined;
		this._parsing = false;
		this._data = undefined;
		this._objectData = undefined;
		this._sharedOptions = undefined;
		this._drawStart = undefined;
		this._drawCount = undefined;
		this.enableOptionSharing = false;
		this.$context = undefined;
		this.initialize();
	}
	initialize() {
		const me = this;
		const meta = me._cachedMeta;
		me.configure();
		me.linkScales();
		meta._stacked = isStacked(meta.vScale, meta);
		me.addElements();
	}
	updateIndex(datasetIndex) {
		this.index = datasetIndex;
	}
	linkScales() {
		const me = this;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const dataset = me.getDataset();
		const chooseId = (axis, x, y, r) => axis === 'x' ? x : axis === 'r' ? r : y;
		const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, 'x'));
		const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, 'y'));
		const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, 'r'));
		const indexAxis = meta.indexAxis;
		const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
		const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
		meta.xScale = me.getScaleForId(xid);
		meta.yScale = me.getScaleForId(yid);
		meta.rScale = me.getScaleForId(rid);
		meta.iScale = me.getScaleForId(iid);
		meta.vScale = me.getScaleForId(vid);
	}
	getDataset() {
		return this.chart.data.datasets[this.index];
	}
	getMeta() {
		return this.chart.getDatasetMeta(this.index);
	}
	getScaleForId(scaleID) {
		return this.chart.scales[scaleID];
	}
	_getOtherScale(scale) {
		const meta = this._cachedMeta;
		return scale === meta.iScale
			? meta.vScale
			: meta.iScale;
	}
	reset() {
		this._update('reset');
	}
	_destroy() {
		const meta = this._cachedMeta;
		if (this._data) {
			unlistenArrayEvents(this._data, this);
		}
		if (meta._stacked) {
			clearStacks(meta);
		}
	}
	_dataCheck() {
		const me = this;
		const dataset = me.getDataset();
		const data = dataset.data || (dataset.data = []);
		if (isObject(data)) {
			me._data = convertObjectDataToArray(data);
		} else if (me._data !== data) {
			if (me._data) {
				unlistenArrayEvents(me._data, me);
			}
			if (data && Object.isExtensible(data)) {
				listenArrayEvents(data, me);
			}
			me._data = data;
		}
	}
	addElements() {
		const me = this;
		const meta = me._cachedMeta;
		me._dataCheck();
		const data = me._data;
		const metaData = meta.data = new Array(data.length);
		for (let i = 0, ilen = data.length; i < ilen; ++i) {
			metaData[i] = new me.dataElementType();
		}
		if (me.datasetElementType) {
			meta.dataset = new me.datasetElementType();
		}
	}
	buildOrUpdateElements() {
		const me = this;
		const meta = me._cachedMeta;
		const dataset = me.getDataset();
		let stackChanged = false;
		me._dataCheck();
		meta._stacked = isStacked(meta.vScale, meta);
		if (meta.stack !== dataset.stack) {
			stackChanged = true;
			clearStacks(meta);
			meta.stack = dataset.stack;
		}
		me._resyncElements();
		if (stackChanged) {
			updateStacks(me, meta._parsed);
		}
	}
	configure() {
		const me = this;
		me._config = merge(Object.create(null), [
			defaults.controllers[me._type].datasets,
			(me.chart.options.datasets || {})[me._type],
			me.getDataset(),
		], {
			merger(key, target, source) {
				if (key !== 'data') {
					_merger(key, target, source);
				}
			}
		});
		me._parsing = resolve([me._config.parsing, me.chart.options.parsing, true]);
	}
	parse(start, count) {
		const me = this;
		const {_cachedMeta: meta, _data: data} = me;
		const {iScale, vScale, _stacked} = meta;
		const iAxis = iScale.axis;
		let sorted = true;
		let i, parsed, cur, prev;
		if (start > 0) {
			sorted = meta._sorted;
			prev = meta._parsed[start - 1];
		}
		if (me._parsing === false) {
			meta._parsed = data;
			meta._sorted = true;
		} else {
			if (isArray(data[start])) {
				parsed = me.parseArrayData(meta, data, start, count);
			} else if (isObject(data[start])) {
				parsed = me.parseObjectData(meta, data, start, count);
			} else {
				parsed = me.parsePrimitiveData(meta, data, start, count);
			}
			const isNotInOrderComparedToPrev = () => isNaN(cur[iAxis]) || (prev && cur[iAxis] < prev[iAxis]);
			for (i = 0; i < count; ++i) {
				meta._parsed[i + start] = cur = parsed[i];
				if (sorted) {
					if (isNotInOrderComparedToPrev()) {
						sorted = false;
					}
					prev = cur;
				}
			}
			meta._sorted = sorted;
		}
		if (_stacked) {
			updateStacks(me, parsed);
		}
		iScale.invalidateCaches();
		vScale.invalidateCaches();
	}
	parsePrimitiveData(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const iAxis = iScale.axis;
		const vAxis = vScale.axis;
		const labels = iScale.getLabels();
		const singleScale = iScale === vScale;
		const parsed = new Array(count);
		let i, ilen, index;
		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			parsed[i] = {
				[iAxis]: singleScale || iScale.parse(labels[index], index),
				[vAxis]: vScale.parse(data[index], index)
			};
		}
		return parsed;
	}
	parseArrayData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const parsed = new Array(count);
		let i, ilen, index, item;
		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				x: xScale.parse(item[0], index),
				y: yScale.parse(item[1], index)
			};
		}
		return parsed;
	}
	parseObjectData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
		const parsed = new Array(count);
		let i, ilen, index, item;
		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
				y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
			};
		}
		return parsed;
	}
	getParsed(index) {
		return this._cachedMeta._parsed[index];
	}
	getDataElement(index) {
		return this._cachedMeta.data[index];
	}
	applyStack(scale, parsed) {
		const chart = this.chart;
		const meta = this._cachedMeta;
		const value = parsed[scale.axis];
		const stack = {
			keys: getSortedDatasetIndices(chart, true),
			values: parsed._stacks[scale.axis]
		};
		return applyStack(stack, value, meta.index);
	}
	updateRangeFromParsed(range, scale, parsed, stack) {
		let value = parsed[scale.axis];
		const values = stack && parsed._stacks[scale.axis];
		if (stack && values) {
			stack.values = values;
			range.min = Math.min(range.min, value);
			range.max = Math.max(range.max, value);
			value = applyStack(stack, value, this._cachedMeta.index, true);
		}
		range.min = Math.min(range.min, value);
		range.max = Math.max(range.max, value);
	}
	getMinMax(scale, canStack) {
		const me = this;
		const meta = me._cachedMeta;
		const _parsed = meta._parsed;
		const sorted = meta._sorted && scale === meta.iScale;
		const ilen = _parsed.length;
		const otherScale = me._getOtherScale(scale);
		const stack = canStack && meta._stacked && {keys: getSortedDatasetIndices(me.chart, true), values: null};
		const range = {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY};
		const {min: otherMin, max: otherMax} = getUserBounds(otherScale);
		let i, value, parsed, otherValue;
		function _skip() {
			parsed = _parsed[i];
			value = parsed[scale.axis];
			otherValue = parsed[otherScale.axis];
			return (isNaN(value) || isNaN(otherValue) || otherMin > otherValue || otherMax < otherValue);
		}
		for (i = 0; i < ilen; ++i) {
			if (_skip()) {
				continue;
			}
			me.updateRangeFromParsed(range, scale, parsed, stack);
			if (sorted) {
				break;
			}
		}
		if (sorted) {
			for (i = ilen - 1; i >= 0; --i) {
				if (_skip()) {
					continue;
				}
				me.updateRangeFromParsed(range, scale, parsed, stack);
				break;
			}
		}
		return range;
	}
	getAllParsedValues(scale) {
		const parsed = this._cachedMeta._parsed;
		const values = [];
		let i, ilen, value;
		for (i = 0, ilen = parsed.length; i < ilen; ++i) {
			value = parsed[i][scale.axis];
			if (!isNaN(value)) {
				values.push(value);
			}
		}
		return values;
	}
	getMaxOverflow() {
		return false;
	}
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const parsed = me.getParsed(index);
		return {
			label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
			value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
		};
	}
	_update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		me.configure();
		me._cachedAnimations = {};
		me._cachedDataOpts = {};
		me.update(mode || 'default');
		meta._clip = toClip(valueOrDefault(me._config.clip, defaultClip(meta.xScale, meta.yScale, me.getMaxOverflow())));
	}
	update(mode) {}
	draw() {
		const me = this;
		const ctx = me._ctx;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const elements = meta.data || [];
		const area = chart.chartArea;
		const active = [];
		const start = me._drawStart || 0;
		const count = me._drawCount || (elements.length - start);
		let i;
		if (meta.dataset) {
			meta.dataset.draw(ctx, area, start, count);
		}
		for (i = start; i < start + count; ++i) {
			const element = elements[i];
			if (element.active) {
				active.push(element);
			} else {
				element.draw(ctx, area);
			}
		}
		for (i = 0; i < active.length; ++i) {
			active[i].draw(ctx, area);
		}
	}
	_addAutomaticHoverColors(index, options) {
		const me = this;
		const normalOptions = me.getStyle(index);
		const missingColors = Object.keys(normalOptions).filter(key => key.indexOf('Color') !== -1 && !(key in options));
		let i = missingColors.length - 1;
		let color;
		for (; i >= 0; i--) {
			color = missingColors[i];
			options[color] = getHoverColor(normalOptions[color]);
		}
	}
	getStyle(index, active) {
		const me = this;
		const meta = me._cachedMeta;
		const dataset = meta.dataset;
		if (!me._config) {
			me.configure();
		}
		const options = dataset && index === undefined
			? me.resolveDatasetElementOptions(active)
			: me.resolveDataElementOptions(index || 0, active && 'active');
		if (active) {
			me._addAutomaticHoverColors(index, options);
		}
		return options;
	}
	getContext(index, active) {
		const me = this;
		let context;
		if (index >= 0 && index < me._cachedMeta.data.length) {
			const element = me._cachedMeta.data[index];
			context = element.$context ||
				(element.$context = createDataContext(me.getContext(), index, me.getParsed(index), element));
		} else {
			context = me.$context || (me.$context = createDatasetContext(me.chart.getContext(), me.index, me.getDataset()));
		}
		context.active = !!active;
		return context;
	}
	resolveDatasetElementOptions(active) {
		return this._resolveOptions(this.datasetElementOptions, {
			active,
			type: this.datasetElementType.id
		});
	}
	resolveDataElementOptions(index, mode) {
		mode = mode || 'default';
		const me = this;
		const active = mode === 'active';
		const cache = me._cachedDataOpts;
		const cached = cache[mode];
		const sharing = me.enableOptionSharing;
		if (cached) {
			return cloneIfNotShared(cached, sharing);
		}
		const info = {cacheable: !active};
		const values = me._resolveOptions(me.dataElementOptions, {
			index,
			active,
			info,
			type: me.dataElementType.id
		});
		if (info.cacheable) {
			values.$shared = sharing;
			cache[mode] = freezeIfShared(values, sharing);
		}
		return values;
	}
	_resolveOptions(optionNames, args) {
		const me = this;
		const {index, active, type, info} = args;
		const datasetOpts = me._config;
		const options = me.chart.options.elements[type] || {};
		const values = {};
		const context = me.getContext(index, active);
		const keys = optionKeys(optionNames);
		for (let i = 0, ilen = keys.length; i < ilen; ++i) {
			const key = keys[i];
			const readKey = optionKey(key, active);
			const value = resolve([
				datasetOpts[optionNames[readKey]],
				datasetOpts[readKey],
				options[readKey]
			], context, index, info);
			if (value !== undefined) {
				values[key] = value;
			}
		}
		return values;
	}
	_resolveAnimations(index, mode, active) {
		const me = this;
		const chart = me.chart;
		const cached = me._cachedAnimations;
		mode = mode || 'default';
		if (cached[mode]) {
			return cached[mode];
		}
		const info = {cacheable: true};
		const context = me.getContext(index, active);
		const chartAnim = resolve([chart.options.animation], context, index, info);
		const datasetAnim = resolve([me._config.animation], context, index, info);
		let config = chartAnim && mergeIf({}, [datasetAnim, chartAnim]);
		if (config[mode]) {
			config = Object.assign({}, config, config[mode]);
		}
		const animations = new Animations(chart, config);
		if (info.cacheable) {
			cached[mode] = animations && Object.freeze(animations);
		}
		return animations;
	}
	getSharedOptions(options) {
		if (!options.$shared) {
			return;
		}
		return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
	}
	includeOptions(mode, sharedOptions) {
		return !sharedOptions || isDirectUpdateMode(mode);
	}
	updateElement(element, index, properties, mode) {
		if (isDirectUpdateMode(mode)) {
			Object.assign(element, properties);
		} else {
			this._resolveAnimations(index, mode).update(element, properties);
		}
	}
	updateSharedOptions(sharedOptions, mode, newOptions) {
		if (sharedOptions) {
			this._resolveAnimations(undefined, mode).update({options: sharedOptions}, {options: newOptions});
		}
	}
	_setStyle(element, index, mode, active) {
		element.active = active;
		const options = this.getStyle(index, active);
		this._resolveAnimations(index, mode, active).update(element, {options: this.getSharedOptions(options) || options});
	}
	removeHoverStyle(element, datasetIndex, index) {
		this._setStyle(element, index, 'active', false);
	}
	setHoverStyle(element, datasetIndex, index) {
		this._setStyle(element, index, 'active', true);
	}
	_removeDatasetHoverStyle() {
		const element = this._cachedMeta.dataset;
		if (element) {
			this._setStyle(element, undefined, 'active', false);
		}
	}
	_setDatasetHoverStyle() {
		const element = this._cachedMeta.dataset;
		if (element) {
			this._setStyle(element, undefined, 'active', true);
		}
	}
	_resyncElements() {
		const me = this;
		const numMeta = me._cachedMeta.data.length;
		const numData = me._data.length;
		if (numData > numMeta) {
			me._insertElements(numMeta, numData - numMeta);
		} else if (numData < numMeta) {
			me._removeElements(numData, numMeta - numData);
		}
		me.parse(0, Math.min(numData, numMeta));
	}
	_insertElements(start, count) {
		const me = this;
		const elements = new Array(count);
		const meta = me._cachedMeta;
		const data = meta.data;
		let i;
		for (i = 0; i < count; ++i) {
			elements[i] = new me.dataElementType();
		}
		data.splice(start, 0, ...elements);
		if (me._parsing) {
			meta._parsed.splice(start, 0, ...new Array(count));
		}
		me.parse(start, count);
		me.updateElements(data, start, count, 'reset');
	}
	updateElements(element, start, count, mode) {}
	_removeElements(start, count) {
		const me = this;
		const meta = me._cachedMeta;
		if (me._parsing) {
			const removed = meta._parsed.splice(start, count);
			if (meta._stacked) {
				clearStacks(meta, removed);
			}
		}
		meta.data.splice(start, count);
	}
	_onDataPush() {
		const count = arguments.length;
		this._insertElements(this.getDataset().data.length - count, count);
	}
	_onDataPop() {
		this._removeElements(this._cachedMeta.data.length - 1, 1);
	}
	_onDataShift() {
		this._removeElements(0, 1);
	}
	_onDataSplice(start, count) {
		this._removeElements(start, count);
		this._insertElements(start, arguments.length - 2);
	}
	_onDataUnshift() {
		this._insertElements(0, arguments.length);
	}
}
DatasetController.defaults = {};
DatasetController.prototype.datasetElementType = null;
DatasetController.prototype.dataElementType = null;
DatasetController.prototype.datasetElementOptions = [
	'backgroundColor',
	'borderCapStyle',
	'borderColor',
	'borderDash',
	'borderDashOffset',
	'borderJoinStyle',
	'borderWidth'
];
DatasetController.prototype.dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'pointStyle'
];

class Element {
	constructor() {
		this.x = undefined;
		this.y = undefined;
		this.active = false;
		this.options = undefined;
		this.$animations = undefined;
	}
	tooltipPosition(useFinalPosition) {
		const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
		return {x, y};
	}
	hasValue() {
		return isNumber(this.x) && isNumber(this.y);
	}
	getProps(props, final) {
		const me = this;
		const anims = this.$animations;
		if (!final || !anims) {
			return me;
		}
		const ret = {};
		props.forEach(prop => {
			ret[prop] = anims[prop] && anims[prop].active ? anims[prop]._to : me[prop];
		});
		return ret;
	}
}
Element.defaults = {};
Element.defaultRoutes = undefined;

const intlCache = new Map();
const formatters = {
	values(value) {
		return isArray(value) ? value : '' + value;
	},
	numeric(tickValue, index, ticks) {
		if (tickValue === 0) {
			return '0';
		}
		const locale = this.chart.options.locale;
		const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
		let notation;
		if (maxTick < 1e-4 || maxTick > 1e+15) {
			notation = 'scientific';
		}
		let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
		if (Math.abs(delta) > 1 && tickValue !== Math.floor(tickValue)) {
			delta = tickValue - Math.floor(tickValue);
		}
		const logDelta = log10(Math.abs(delta));
		const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
		const options = {notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal};
		Object.assign(options, this.options.ticks.format);
		const cacheKey = locale + JSON.stringify(options);
		let formatter = intlCache.get(cacheKey);
		if (!formatter) {
			formatter = new Intl.NumberFormat(locale, options);
			intlCache.set(cacheKey, formatter);
		}
		return formatter.format(tickValue);
	}
};
formatters.logarithmic = function(tickValue, index, ticks) {
	if (tickValue === 0) {
		return '0';
	}
	const remain = tickValue / (Math.pow(10, Math.floor(log10(tickValue))));
	if (remain === 1 || remain === 2 || remain === 5) {
		return formatters.numeric.call(this, tickValue, index, ticks);
	}
	return '';
};
var Ticks = {formatters};

defaults.set('scale', {
	display: true,
	offset: false,
	reverse: false,
	beginAtZero: false,
	bounds: 'ticks',
	gridLines: {
		display: true,
		lineWidth: 1,
		drawBorder: true,
		drawOnChartArea: true,
		drawTicks: true,
		tickMarkLength: 10,
		offsetGridLines: false,
		borderDash: [],
		borderDashOffset: 0.0
	},
	scaleLabel: {
		display: false,
		labelString: '',
		padding: {
			top: 4,
			bottom: 4
		}
	},
	ticks: {
		minRotation: 0,
		maxRotation: 50,
		mirror: false,
		lineWidth: 0,
		strokeStyle: '',
		padding: 0,
		display: true,
		autoSkip: true,
		autoSkipPadding: 0,
		labelOffset: 0,
		callback: Ticks.formatters.values,
		minor: {},
		major: {},
		align: 'center',
		crossAlign: 'near',
	}
});
defaults.route('scale.ticks', 'color', '', 'color');
defaults.route('scale.gridLines', 'color', '', 'borderColor');
defaults.route('scale.scaleLabel', 'color', '', 'color');
function sample(arr, numItems) {
	const result = [];
	const increment = arr.length / numItems;
	const len = arr.length;
	let i = 0;
	for (; i < len; i += increment) {
		result.push(arr[Math.floor(i)]);
	}
	return result;
}
function getPixelForGridLine(scale, index, offsetGridLines) {
	const length = scale.ticks.length;
	const validIndex = Math.min(index, length - 1);
	const start = scale._startPixel;
	const end = scale._endPixel;
	const epsilon = 1e-6;
	let lineValue = scale.getPixelForTick(validIndex);
	let offset;
	if (offsetGridLines) {
		if (length === 1) {
			offset = Math.max(lineValue - start, end - lineValue);
		} else if (index === 0) {
			offset = (scale.getPixelForTick(1) - lineValue) / 2;
		} else {
			offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
		}
		lineValue += validIndex < index ? offset : -offset;
		if (lineValue < start - epsilon || lineValue > end + epsilon) {
			return;
		}
	}
	return lineValue;
}
function garbageCollect(caches, length) {
	each(caches, (cache) => {
		const gc = cache.gc;
		const gcLen = gc.length / 2;
		let i;
		if (gcLen > length) {
			for (i = 0; i < gcLen; ++i) {
				delete cache.data[gc[i]];
			}
			gc.splice(0, gcLen);
		}
	});
}
function getTickMarkLength(options) {
	return options.drawTicks ? options.tickMarkLength : 0;
}
function getScaleLabelHeight(options, fallback) {
	if (!options.display) {
		return 0;
	}
	const font = toFont(options.font, fallback);
	const padding = toPadding(options.padding);
	return font.lineHeight + padding.height;
}
function getEvenSpacing(arr) {
	const len = arr.length;
	let i, diff;
	if (len < 2) {
		return false;
	}
	for (diff = arr[0], i = 1; i < len; ++i) {
		if (arr[i] - arr[i - 1] !== diff) {
			return false;
		}
	}
	return diff;
}
function calculateSpacing(majorIndices, ticks, ticksLimit) {
	const evenMajorSpacing = getEvenSpacing(majorIndices);
	const spacing = ticks.length / ticksLimit;
	if (!evenMajorSpacing) {
		return Math.max(spacing, 1);
	}
	const factors = _factorize(evenMajorSpacing);
	for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
		const factor = factors[i];
		if (factor > spacing) {
			return factor;
		}
	}
	return Math.max(spacing, 1);
}
function getMajorIndices(ticks) {
	const result = [];
	let i, ilen;
	for (i = 0, ilen = ticks.length; i < ilen; i++) {
		if (ticks[i].major) {
			result.push(i);
		}
	}
	return result;
}
function skipMajors(ticks, newTicks, majorIndices, spacing) {
	let count = 0;
	let next = majorIndices[0];
	let i;
	spacing = Math.ceil(spacing);
	for (i = 0; i < ticks.length; i++) {
		if (i === next) {
			newTicks.push(ticks[i]);
			count++;
			next = majorIndices[count * spacing];
		}
	}
}
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
	const start = valueOrDefault(majorStart, 0);
	const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
	let count = 0;
	let length, i, next;
	spacing = Math.ceil(spacing);
	if (majorEnd) {
		length = majorEnd - majorStart;
		spacing = length / Math.floor(length / spacing);
	}
	next = start;
	while (next < 0) {
		count++;
		next = Math.round(start + count * spacing);
	}
	for (i = Math.max(start, 0); i < end; i++) {
		if (i === next) {
			newTicks.push(ticks[i]);
			count++;
			next = Math.round(start + count * spacing);
		}
	}
}
function createScaleContext(parent, scale) {
	return Object.create(parent, {
		scale: {
			value: scale
		},
		type: {
			value: 'scale'
		}
	});
}
function createTickContext(parent, index, tick) {
	return Object.create(parent, {
		tick: {
			value: tick
		},
		index: {
			value: index
		},
		type: {
			value: 'tick'
		}
	});
}
class Scale extends Element {
	constructor(cfg) {
		super();
		this.id = cfg.id;
		this.type = cfg.type;
		this.options = undefined;
		this.ctx = cfg.ctx;
		this.chart = cfg.chart;
		this.top = undefined;
		this.bottom = undefined;
		this.left = undefined;
		this.right = undefined;
		this.width = undefined;
		this.height = undefined;
		this._margins = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		};
		this.maxWidth = undefined;
		this.maxHeight = undefined;
		this.paddingTop = undefined;
		this.paddingBottom = undefined;
		this.paddingLeft = undefined;
		this.paddingRight = undefined;
		this.axis = undefined;
		this.labelRotation = undefined;
		this.min = undefined;
		this.max = undefined;
		this.ticks = [];
		this._gridLineItems = null;
		this._labelItems = null;
		this._labelSizes = null;
		this._length = 0;
		this._longestTextCache = {};
		this._startPixel = undefined;
		this._endPixel = undefined;
		this._reversePixels = false;
		this._userMax = undefined;
		this._userMin = undefined;
		this._suggestedMax = undefined;
		this._suggestedMin = undefined;
		this._ticksLength = 0;
		this._borderValue = 0;
		this._cache = {};
		this.$context = undefined;
	}
	init(options) {
		const me = this;
		me.options = options;
		me.axis = me.isHorizontal() ? 'x' : 'y';
		me._userMin = me.parse(options.min);
		me._userMax = me.parse(options.max);
		me._suggestedMin = me.parse(options.suggestedMin);
		me._suggestedMax = me.parse(options.suggestedMax);
	}
	parse(raw, index) {
		return raw;
	}
	getUserBounds() {
		let {_userMin, _userMax, _suggestedMin, _suggestedMax} = this;
		_userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
		_userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
		_suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
		_suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
		return {
			min: finiteOrDefault(_userMin, _suggestedMin),
			max: finiteOrDefault(_userMax, _suggestedMax),
			minDefined: isNumberFinite(_userMin),
			maxDefined: isNumberFinite(_userMax)
		};
	}
	getMinMax(canStack) {
		const me = this;
		let {min, max, minDefined, maxDefined} = me.getUserBounds();
		let range;
		if (minDefined && maxDefined) {
			return {min, max};
		}
		const metas = me.getMatchingVisibleMetas();
		for (let i = 0, ilen = metas.length; i < ilen; ++i) {
			range = metas[i].controller.getMinMax(me, canStack);
			if (!minDefined) {
				min = Math.min(min, range.min);
			}
			if (!maxDefined) {
				max = Math.max(max, range.max);
			}
		}
		return {
			min: finiteOrDefault(min, finiteOrDefault(max, min)),
			max: finiteOrDefault(max, finiteOrDefault(min, max))
		};
	}
	invalidateCaches() {
		this._cache = {};
	}
	getPadding() {
		const me = this;
		return {
			left: me.paddingLeft || 0,
			top: me.paddingTop || 0,
			right: me.paddingRight || 0,
			bottom: me.paddingBottom || 0
		};
	}
	getTicks() {
		return this.ticks;
	}
	getLabels() {
		const data = this.chart.data;
		return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
	}
	beforeUpdate() {
		callback(this.options.beforeUpdate, [this]);
	}
	update(maxWidth, maxHeight, margins) {
		const me = this;
		const tickOpts = me.options.ticks;
		const sampleSize = tickOpts.sampleSize;
		me.beforeUpdate();
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me._margins = Object.assign({
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		}, margins);
		me.ticks = null;
		me._labelSizes = null;
		me._gridLineItems = null;
		me._labelItems = null;
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();
		me.beforeDataLimits();
		me.determineDataLimits();
		me.afterDataLimits();
		me.beforeBuildTicks();
		me.ticks = me.buildTicks() || [];
		me.afterBuildTicks();
		const samplingEnabled = sampleSize < me.ticks.length;
		me._convertTicksToLabels(samplingEnabled ? sample(me.ticks, sampleSize) : me.ticks);
		me.configure();
		me.beforeCalculateLabelRotation();
		me.calculateLabelRotation();
		me.afterCalculateLabelRotation();
		me.beforeFit();
		me.fit();
		me.afterFit();
		me.ticks = tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto') ? me._autoSkip(me.ticks) : me.ticks;
		if (samplingEnabled) {
			me._convertTicksToLabels(me.ticks);
		}
		me.afterUpdate();
	}
	configure() {
		const me = this;
		let reversePixels = me.options.reverse;
		let startPixel, endPixel;
		if (me.isHorizontal()) {
			startPixel = me.left;
			endPixel = me.right;
		} else {
			startPixel = me.top;
			endPixel = me.bottom;
			reversePixels = !reversePixels;
		}
		me._startPixel = startPixel;
		me._endPixel = endPixel;
		me._reversePixels = reversePixels;
		me._length = endPixel - startPixel;
	}
	afterUpdate() {
		callback(this.options.afterUpdate, [this]);
	}
	beforeSetDimensions() {
		callback(this.options.beforeSetDimensions, [this]);
	}
	setDimensions() {
		const me = this;
		if (me.isHorizontal()) {
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;
			me.top = 0;
			me.bottom = me.height;
		}
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;
	}
	afterSetDimensions() {
		callback(this.options.afterSetDimensions, [this]);
	}
	_callHooks(name) {
		const me = this;
		me.chart.notifyPlugins(name, me.getContext());
		callback(me.options[name], [me]);
	}
	beforeDataLimits() {
		this._callHooks('beforeDataLimits');
	}
	determineDataLimits() {}
	afterDataLimits() {
		this._callHooks('afterDataLimits');
	}
	beforeBuildTicks() {
		this._callHooks('beforeBuildTicks');
	}
	buildTicks() {
		return [];
	}
	afterBuildTicks() {
		this._callHooks('afterBuildTicks');
	}
	beforeTickToLabelConversion() {
		callback(this.options.beforeTickToLabelConversion, [this]);
	}
	generateTickLabels(ticks) {
		const me = this;
		const tickOpts = me.options.ticks;
		let i, ilen, tick;
		for (i = 0, ilen = ticks.length; i < ilen; i++) {
			tick = ticks[i];
			tick.label = callback(tickOpts.callback, [tick.value, i, ticks], me);
		}
	}
	afterTickToLabelConversion() {
		callback(this.options.afterTickToLabelConversion, [this]);
	}
	beforeCalculateLabelRotation() {
		callback(this.options.beforeCalculateLabelRotation, [this]);
	}
	calculateLabelRotation() {
		const me = this;
		const options = me.options;
		const tickOpts = options.ticks;
		const numTicks = me.ticks.length;
		const minRotation = tickOpts.minRotation || 0;
		const maxRotation = tickOpts.maxRotation;
		let labelRotation = minRotation;
		let tickWidth, maxHeight, maxLabelDiagonal;
		if (!me._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !me.isHorizontal()) {
			me.labelRotation = minRotation;
			return;
		}
		const labelSizes = me._getLabelSizes();
		const maxLabelWidth = labelSizes.widest.width;
		const maxLabelHeight = labelSizes.highest.height - labelSizes.highest.offset;
		const maxWidth = Math.min(me.maxWidth, me.chart.width - maxLabelWidth);
		tickWidth = options.offset ? me.maxWidth / numTicks : maxWidth / (numTicks - 1);
		if (maxLabelWidth + 6 > tickWidth) {
			tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
			maxHeight = me.maxHeight - getTickMarkLength(options.gridLines)
				- tickOpts.padding - getScaleLabelHeight(options.scaleLabel, me.chart.options.font);
			maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
			labelRotation = toDegrees(Math.min(
				Math.asin(Math.min((labelSizes.highest.height + 6) / tickWidth, 1)),
				Math.asin(Math.min(maxHeight / maxLabelDiagonal, 1)) - Math.asin(maxLabelHeight / maxLabelDiagonal)
			));
			labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
		}
		me.labelRotation = labelRotation;
	}
	afterCalculateLabelRotation() {
		callback(this.options.afterCalculateLabelRotation, [this]);
	}
	beforeFit() {
		callback(this.options.beforeFit, [this]);
	}
	fit() {
		const me = this;
		const minSize = {
			width: 0,
			height: 0
		};
		const chart = me.chart;
		const opts = me.options;
		const tickOpts = opts.ticks;
		const scaleLabelOpts = opts.scaleLabel;
		const gridLineOpts = opts.gridLines;
		const display = me._isVisible();
		const labelsBelowTicks = opts.position !== 'top' && me.axis === 'x';
		const isHorizontal = me.isHorizontal();
		const scaleLabelHeight = display && getScaleLabelHeight(scaleLabelOpts, chart.options.font);
		if (isHorizontal) {
			minSize.width = me.maxWidth;
		} else if (display) {
			minSize.width = getTickMarkLength(gridLineOpts) + scaleLabelHeight;
		}
		if (!isHorizontal) {
			minSize.height = me.maxHeight;
		} else if (display) {
			minSize.height = getTickMarkLength(gridLineOpts) + scaleLabelHeight;
		}
		if (tickOpts.display && display && me.ticks.length) {
			const labelSizes = me._getLabelSizes();
			const firstLabelSize = labelSizes.first;
			const lastLabelSize = labelSizes.last;
			const widestLabelSize = labelSizes.widest;
			const highestLabelSize = labelSizes.highest;
			const lineSpace = highestLabelSize.offset * 0.8;
			const tickPadding = tickOpts.padding;
			if (isHorizontal) {
				const isRotated = me.labelRotation !== 0;
				const angleRadians = toRadians(me.labelRotation);
				const cosRotation = Math.cos(angleRadians);
				const sinRotation = Math.sin(angleRadians);
				const labelHeight = sinRotation * widestLabelSize.width
					+ cosRotation * (highestLabelSize.height - (isRotated ? highestLabelSize.offset : 0))
					+ (isRotated ? 0 : lineSpace);
				minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);
				const offsetLeft = me.getPixelForTick(0) - me.left;
				const offsetRight = me.right - me.getPixelForTick(me.ticks.length - 1);
				let paddingLeft, paddingRight;
				if (isRotated) {
					paddingLeft = labelsBelowTicks ?
						cosRotation * firstLabelSize.width + sinRotation * firstLabelSize.offset :
						sinRotation * (firstLabelSize.height - firstLabelSize.offset);
					paddingRight = labelsBelowTicks ?
						sinRotation * (lastLabelSize.height - lastLabelSize.offset) :
						cosRotation * lastLabelSize.width + sinRotation * lastLabelSize.offset;
				} else if (tickOpts.align === 'start') {
					paddingLeft = 0;
					paddingRight = lastLabelSize.width;
				} else if (tickOpts.align === 'end') {
					paddingLeft = firstLabelSize.width;
					paddingRight = 0;
				} else {
					paddingLeft = firstLabelSize.width / 2;
					paddingRight = lastLabelSize.width / 2;
				}
				me.paddingLeft = Math.max((paddingLeft - offsetLeft) * me.width / (me.width - offsetLeft), 0) + 3;
				me.paddingRight = Math.max((paddingRight - offsetRight) * me.width / (me.width - offsetRight), 0) + 3;
			} else {
				const labelWidth = tickOpts.mirror ? 0 :
					widestLabelSize.width + tickPadding + lineSpace;
				minSize.width = Math.min(me.maxWidth, minSize.width + labelWidth);
				let paddingTop = lastLabelSize.height / 2;
				let paddingBottom = firstLabelSize.height / 2;
				if (tickOpts.align === 'start') {
					paddingTop = 0;
					paddingBottom = firstLabelSize.height;
				} else if (tickOpts.align === 'end') {
					paddingTop = lastLabelSize.height;
					paddingBottom = 0;
				}
				me.paddingTop = paddingTop;
				me.paddingBottom = paddingBottom;
			}
		}
		me._handleMargins();
		if (isHorizontal) {
			me.width = me._length = chart.width - me._margins.left - me._margins.right;
			me.height = minSize.height;
		} else {
			me.width = minSize.width;
			me.height = me._length = chart.height - me._margins.top - me._margins.bottom;
		}
	}
	_handleMargins() {
		const me = this;
		if (me._margins) {
			me._margins.left = Math.max(me.paddingLeft, me._margins.left);
			me._margins.top = Math.max(me.paddingTop, me._margins.top);
			me._margins.right = Math.max(me.paddingRight, me._margins.right);
			me._margins.bottom = Math.max(me.paddingBottom, me._margins.bottom);
		}
	}
	afterFit() {
		callback(this.options.afterFit, [this]);
	}
	isHorizontal() {
		const {axis, position} = this.options;
		return position === 'top' || position === 'bottom' || axis === 'x';
	}
	isFullWidth() {
		return this.options.fullWidth;
	}
	_convertTicksToLabels(ticks) {
		const me = this;
		me.beforeTickToLabelConversion();
		me.generateTickLabels(ticks);
		me.afterTickToLabelConversion();
	}
	_getLabelSizes() {
		const me = this;
		let labelSizes = me._labelSizes;
		if (!labelSizes) {
			me._labelSizes = labelSizes = me._computeLabelSizes();
		}
		return labelSizes;
	}
	_computeLabelSizes() {
		const me = this;
		const ctx = me.ctx;
		const caches = me._longestTextCache;
		const sampleSize = me.options.ticks.sampleSize;
		const widths = [];
		const heights = [];
		const offsets = [];
		let widestLabelSize = 0;
		let highestLabelSize = 0;
		let ticks = me.ticks;
		if (sampleSize < ticks.length) {
			ticks = sample(ticks, sampleSize);
		}
		const length = ticks.length;
		let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
		for (i = 0; i < length; ++i) {
			label = ticks[i].label;
			tickFont = me._resolveTickFontOptions(i);
			ctx.font = fontString = tickFont.string;
			cache = caches[fontString] = caches[fontString] || {data: {}, gc: []};
			lineHeight = tickFont.lineHeight;
			width = height = 0;
			if (!isNullOrUndef(label) && !isArray(label)) {
				width = _measureText(ctx, cache.data, cache.gc, width, label);
				height = lineHeight;
			} else if (isArray(label)) {
				for (j = 0, jlen = label.length; j < jlen; ++j) {
					nestedLabel = label[j];
					if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
						width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
						height += lineHeight;
					}
				}
			}
			widths.push(width);
			heights.push(height);
			offsets.push(lineHeight / 2);
			widestLabelSize = Math.max(width, widestLabelSize);
			highestLabelSize = Math.max(height, highestLabelSize);
		}
		garbageCollect(caches, length);
		const widest = widths.indexOf(widestLabelSize);
		const highest = heights.indexOf(highestLabelSize);
		function valueAt(idx) {
			return {
				width: widths[idx] || 0,
				height: heights[idx] || 0,
				offset: offsets[idx] || 0
			};
		}
		return {
			first: valueAt(0),
			last: valueAt(length - 1),
			widest: valueAt(widest),
			highest: valueAt(highest)
		};
	}
	getLabelForValue(value) {
		return value;
	}
	getPixelForValue(value, index) {
		return NaN;
	}
	getValueForPixel(pixel) {}
	getPixelForTick(index) {
		const ticks = this.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index].value);
	}
	getPixelForDecimal(decimal) {
		const me = this;
		if (me._reversePixels) {
			decimal = 1 - decimal;
		}
		return _int16Range(me._startPixel + decimal * me._length);
	}
	getDecimalForPixel(pixel) {
		const decimal = (pixel - this._startPixel) / this._length;
		return this._reversePixels ? 1 - decimal : decimal;
	}
	getBasePixel() {
		return this.getPixelForValue(this.getBaseValue());
	}
	getBaseValue() {
		const {min, max} = this;
		return min < 0 && max < 0 ? max :
			min > 0 && max > 0 ? min :
			0;
	}
	getContext(index) {
		const me = this;
		const ticks = me.ticks || [];
		if (index >= 0 && index < ticks.length) {
			const tick = ticks[index];
			return tick.$context ||
				(tick.$context = createTickContext(me.getContext(), index, tick));
		}
		return me.$context ||
			(me.$context = createScaleContext(me.chart.getContext(), me));
	}
	_autoSkip(ticks) {
		const me = this;
		const tickOpts = me.options.ticks;
		const ticksLimit = tickOpts.maxTicksLimit || me._length / me._tickSize();
		const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
		const numMajorIndices = majorIndices.length;
		const first = majorIndices[0];
		const last = majorIndices[numMajorIndices - 1];
		const newTicks = [];
		if (numMajorIndices > ticksLimit) {
			skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
			return newTicks;
		}
		const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
		if (numMajorIndices > 0) {
			let i, ilen;
			const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
			skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
			for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
				skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
			}
			skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
			return newTicks;
		}
		skip(ticks, newTicks, spacing);
		return newTicks;
	}
	_tickSize() {
		const me = this;
		const optionTicks = me.options.ticks;
		const rot = toRadians(me.labelRotation);
		const cos = Math.abs(Math.cos(rot));
		const sin = Math.abs(Math.sin(rot));
		const labelSizes = me._getLabelSizes();
		const padding = optionTicks.autoSkipPadding || 0;
		const w = labelSizes ? labelSizes.widest.width + padding : 0;
		const h = labelSizes ? labelSizes.highest.height + padding : 0;
		return me.isHorizontal()
			? h * cos > w * sin ? w / cos : h / sin
			: h * sin < w * cos ? h / cos : w / sin;
	}
	_isVisible() {
		const display = this.options.display;
		if (display !== 'auto') {
			return !!display;
		}
		return this.getMatchingVisibleMetas().length > 0;
	}
	_computeGridLineItems(chartArea) {
		const me = this;
		const axis = me.axis;
		const chart = me.chart;
		const options = me.options;
		const {gridLines, position} = options;
		const offsetGridLines = gridLines.offsetGridLines;
		const isHorizontal = me.isHorizontal();
		const ticks = me.ticks;
		const ticksLength = ticks.length + (offsetGridLines ? 1 : 0);
		const tl = getTickMarkLength(gridLines);
		const items = [];
		let context = this.getContext(0);
		const axisWidth = gridLines.drawBorder ? resolve([gridLines.borderWidth, gridLines.lineWidth, 0], context, 0) : 0;
		const axisHalfWidth = axisWidth / 2;
		const alignBorderValue = function(pixel) {
			return _alignPixel(chart, pixel, axisWidth);
		};
		let borderValue, i, lineValue, alignedLineValue;
		let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
		if (position === 'top') {
			borderValue = alignBorderValue(me.bottom);
			ty1 = me.bottom - tl;
			ty2 = borderValue - axisHalfWidth;
			y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
			y2 = chartArea.bottom;
		} else if (position === 'bottom') {
			borderValue = alignBorderValue(me.top);
			y1 = chartArea.top;
			y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
			ty1 = borderValue + axisHalfWidth;
			ty2 = me.top + tl;
		} else if (position === 'left') {
			borderValue = alignBorderValue(me.right);
			tx1 = me.right - tl;
			tx2 = borderValue - axisHalfWidth;
			x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
			x2 = chartArea.right;
		} else if (position === 'right') {
			borderValue = alignBorderValue(me.left);
			x1 = chartArea.left;
			x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
			tx1 = borderValue + axisHalfWidth;
			tx2 = me.left + tl;
		} else if (axis === 'x') {
			if (position === 'center') {
				borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2);
			} else if (isObject(position)) {
				const positionAxisID = Object.keys(position)[0];
				const value = position[positionAxisID];
				borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
			}
			y1 = chartArea.top;
			y2 = chartArea.bottom;
			ty1 = borderValue + axisHalfWidth;
			ty2 = ty1 + tl;
		} else if (axis === 'y') {
			if (position === 'center') {
				borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
			} else if (isObject(position)) {
				const positionAxisID = Object.keys(position)[0];
				const value = position[positionAxisID];
				borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
			}
			tx1 = borderValue - axisHalfWidth;
			tx2 = tx1 - tl;
			x1 = chartArea.left;
			x2 = chartArea.right;
		}
		for (i = 0; i < ticksLength; ++i) {
			context = this.getContext(i);
			const lineWidth = resolve([gridLines.lineWidth], context, i);
			const lineColor = resolve([gridLines.color], context, i);
			const borderDash = gridLines.borderDash || [];
			const borderDashOffset = resolve([gridLines.borderDashOffset], context, i);
			lineValue = getPixelForGridLine(me, i, offsetGridLines);
			if (lineValue === undefined) {
				continue;
			}
			alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
			if (isHorizontal) {
				tx1 = tx2 = x1 = x2 = alignedLineValue;
			} else {
				ty1 = ty2 = y1 = y2 = alignedLineValue;
			}
			items.push({
				tx1,
				ty1,
				tx2,
				ty2,
				x1,
				y1,
				x2,
				y2,
				width: lineWidth,
				color: lineColor,
				borderDash,
				borderDashOffset,
			});
		}
		me._ticksLength = ticksLength;
		me._borderValue = borderValue;
		return items;
	}
	_computeLabelItems(chartArea) {
		const me = this;
		const axis = me.axis;
		const options = me.options;
		const {position, ticks: optionTicks} = options;
		const isHorizontal = me.isHorizontal();
		const ticks = me.ticks;
		const {align, crossAlign, padding} = optionTicks;
		const tl = getTickMarkLength(options.gridLines);
		const tickAndPadding = tl + padding;
		const rotation = -toRadians(me.labelRotation);
		const items = [];
		let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
		let textBaseline = 'middle';
		if (position === 'top') {
			y = me.bottom - tickAndPadding;
			textAlign = me._getXAxisLabelAlignment();
		} else if (position === 'bottom') {
			y = me.top + tickAndPadding;
			textAlign = me._getXAxisLabelAlignment();
		} else if (position === 'left') {
			const ret = this._getYAxisLabelAlignment(tl);
			textAlign = ret.textAlign;
			x = ret.x;
		} else if (position === 'right') {
			const ret = this._getYAxisLabelAlignment(tl);
			textAlign = ret.textAlign;
			x = ret.x;
		} else if (axis === 'x') {
			if (position === 'center') {
				y = ((chartArea.top + chartArea.bottom) / 2) + tickAndPadding;
			} else if (isObject(position)) {
				const positionAxisID = Object.keys(position)[0];
				const value = position[positionAxisID];
				y = me.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
			}
			textAlign = me._getXAxisLabelAlignment();
		} else if (axis === 'y') {
			if (position === 'center') {
				x = ((chartArea.left + chartArea.right) / 2) - tickAndPadding;
			} else if (isObject(position)) {
				const positionAxisID = Object.keys(position)[0];
				const value = position[positionAxisID];
				x = me.chart.scales[positionAxisID].getPixelForValue(value);
			}
			textAlign = this._getYAxisLabelAlignment(tl).textAlign;
		}
		if (axis === 'y') {
			if (align === 'start') {
				textBaseline = 'top';
			} else if (align === 'end') {
				textBaseline = 'bottom';
			}
		}
		const labelSizes = me._getLabelSizes();
		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			tick = ticks[i];
			label = tick.label;
			pixel = me.getPixelForTick(i) + optionTicks.labelOffset;
			font = me._resolveTickFontOptions(i);
			lineHeight = font.lineHeight;
			lineCount = isArray(label) ? label.length : 1;
			const halfCount = lineCount / 2;
			if (isHorizontal) {
				x = pixel;
				if (position === 'top') {
					if (crossAlign === 'near' || rotation !== 0) {
						textOffset = (Math.sin(rotation) * halfCount + 0.5) * lineHeight;
						textOffset -= (rotation === 0 ? (lineCount - 0.5) : Math.cos(rotation) * halfCount) * lineHeight;
					} else if (crossAlign === 'center') {
						textOffset = -1 * (labelSizes.highest.height / 2);
						textOffset -= halfCount * lineHeight;
					} else {
						textOffset = (-1 * labelSizes.highest.height) + (0.5 * lineHeight);
					}
				} else if (position === 'bottom') {
					if (crossAlign === 'near' || rotation !== 0) {
						textOffset = Math.sin(rotation) * halfCount * lineHeight;
						textOffset += (rotation === 0 ? 0.5 : Math.cos(rotation) * halfCount) * lineHeight;
					} else if (crossAlign === 'center') {
						textOffset = labelSizes.highest.height / 2;
						textOffset -= halfCount * lineHeight;
					} else {
						textOffset = labelSizes.highest.height - ((lineCount - 0.5) * lineHeight);
					}
				}
			} else {
				y = pixel;
				textOffset = (1 - lineCount) * lineHeight / 2;
			}
			items.push({
				x,
				y,
				rotation,
				label,
				font,
				color: optionTicks.color,
				textOffset,
				textAlign,
				textBaseline,
			});
		}
		return items;
	}
	_getXAxisLabelAlignment() {
		const me = this;
		const {position, ticks} = me.options;
		const rotation = -toRadians(me.labelRotation);
		if (rotation) {
			return position === 'top' ? 'left' : 'right';
		}
		let align = 'center';
		if (ticks.align === 'start') {
			align = 'left';
		} else if (ticks.align === 'end') {
			align = 'right';
		}
		return align;
	}
	_getYAxisLabelAlignment(tl) {
		const me = this;
		const {position, ticks} = me.options;
		const {crossAlign, mirror, padding} = ticks;
		const labelSizes = me._getLabelSizes();
		const tickAndPadding = tl + padding;
		const widest = labelSizes.widest.width;
		let textAlign;
		let x;
		if (position === 'left') {
			if (mirror) {
				textAlign = 'left';
				x = me.right - padding;
			} else {
				x = me.right - tickAndPadding;
				if (crossAlign === 'near') {
					textAlign = 'right';
				} else if (crossAlign === 'center') {
					textAlign = 'center';
					x -= (widest / 2);
				} else {
					textAlign = 'left';
					x -= widest;
				}
			}
		} else if (position === 'right') {
			if (mirror) {
				textAlign = 'right';
				x = me.left + padding;
			} else {
				x = me.left + tickAndPadding;
				if (crossAlign === 'near') {
					textAlign = 'left';
				} else if (crossAlign === 'center') {
					textAlign = 'center';
					x += widest / 2;
				} else {
					textAlign = 'right';
					x += widest;
				}
			}
		} else {
			textAlign = 'right';
		}
		return {textAlign, x};
	}
	drawGrid(chartArea) {
		const me = this;
		const gridLines = me.options.gridLines;
		const ctx = me.ctx;
		const chart = me.chart;
		let context = me.getContext(0);
		const axisWidth = gridLines.drawBorder ? resolve([gridLines.borderWidth, gridLines.lineWidth, 0], context, 0) : 0;
		const items = me._gridLineItems || (me._gridLineItems = me._computeGridLineItems(chartArea));
		let i, ilen;
		if (gridLines.display) {
			for (i = 0, ilen = items.length; i < ilen; ++i) {
				const item = items[i];
				const width = item.width;
				const color = item.color;
				if (width && color) {
					ctx.save();
					ctx.lineWidth = width;
					ctx.strokeStyle = color;
					if (ctx.setLineDash) {
						ctx.setLineDash(item.borderDash);
						ctx.lineDashOffset = item.borderDashOffset;
					}
					ctx.beginPath();
					if (gridLines.drawTicks) {
						ctx.moveTo(item.tx1, item.ty1);
						ctx.lineTo(item.tx2, item.ty2);
					}
					if (gridLines.drawOnChartArea) {
						ctx.moveTo(item.x1, item.y1);
						ctx.lineTo(item.x2, item.y2);
					}
					ctx.stroke();
					ctx.restore();
				}
			}
		}
		if (axisWidth) {
			const firstLineWidth = axisWidth;
			context = me.getContext(me._ticksLength - 1);
			const lastLineWidth = resolve([gridLines.lineWidth, 1], context, me._ticksLength - 1);
			const borderValue = me._borderValue;
			let x1, x2, y1, y2;
			if (me.isHorizontal()) {
				x1 = _alignPixel(chart, me.left, firstLineWidth) - firstLineWidth / 2;
				x2 = _alignPixel(chart, me.right, lastLineWidth) + lastLineWidth / 2;
				y1 = y2 = borderValue;
			} else {
				y1 = _alignPixel(chart, me.top, firstLineWidth) - firstLineWidth / 2;
				y2 = _alignPixel(chart, me.bottom, lastLineWidth) + lastLineWidth / 2;
				x1 = x2 = borderValue;
			}
			ctx.lineWidth = axisWidth;
			ctx.strokeStyle = resolve([gridLines.borderColor, gridLines.color], context, 0);
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}
	}
	drawLabels(chartArea) {
		const me = this;
		const optionTicks = me.options.ticks;
		if (!optionTicks.display) {
			return;
		}
		const ctx = me.ctx;
		const items = me._labelItems || (me._labelItems = me._computeLabelItems(chartArea));
		let i, j, ilen, jlen;
		for (i = 0, ilen = items.length; i < ilen; ++i) {
			const item = items[i];
			const tickFont = item.font;
			const useStroke = optionTicks.textStrokeWidth > 0 && optionTicks.textStrokeColor !== '';
			ctx.save();
			ctx.translate(item.x, item.y);
			ctx.rotate(item.rotation);
			ctx.font = tickFont.string;
			ctx.fillStyle = item.color;
			ctx.textAlign = item.textAlign;
			ctx.textBaseline = item.textBaseline;
			if (useStroke) {
				ctx.strokeStyle = optionTicks.textStrokeColor;
				ctx.lineWidth = optionTicks.textStrokeWidth;
			}
			const label = item.label;
			let y = item.textOffset;
			if (isArray(label)) {
				for (j = 0, jlen = label.length; j < jlen; ++j) {
					if (useStroke) {
						ctx.strokeText('' + label[j], 0, y);
					}
					ctx.fillText('' + label[j], 0, y);
					y += tickFont.lineHeight;
				}
			} else {
				if (useStroke) {
					ctx.strokeText(label, 0, y);
				}
				ctx.fillText(label, 0, y);
			}
			ctx.restore();
		}
	}
	drawTitle(chartArea) {
		const me = this;
		const ctx = me.ctx;
		const options = me.options;
		const scaleLabel = options.scaleLabel;
		if (!scaleLabel.display) {
			return;
		}
		const scaleLabelFont = toFont(scaleLabel.font, me.chart.options.font);
		const scaleLabelPadding = toPadding(scaleLabel.padding);
		const halfLineHeight = scaleLabelFont.lineHeight / 2;
		const scaleLabelAlign = scaleLabel.align;
		const position = options.position;
		const isReverse = me.options.reverse;
		let rotation = 0;
		let textAlign;
		let scaleLabelX, scaleLabelY;
		if (me.isHorizontal()) {
			switch (scaleLabelAlign) {
			case 'start':
				scaleLabelX = me.left + (isReverse ? me.width : 0);
				textAlign = isReverse ? 'right' : 'left';
				break;
			case 'end':
				scaleLabelX = me.left + (isReverse ? 0 : me.width);
				textAlign = isReverse ? 'left' : 'right';
				break;
			default:
				scaleLabelX = me.left + me.width / 2;
				textAlign = 'center';
			}
			scaleLabelY = position === 'top'
				? me.top + halfLineHeight + scaleLabelPadding.top
				: me.bottom - halfLineHeight - scaleLabelPadding.bottom;
		} else {
			const isLeft = position === 'left';
			scaleLabelX = isLeft
				? me.left + halfLineHeight + scaleLabelPadding.top
				: me.right - halfLineHeight - scaleLabelPadding.top;
			switch (scaleLabelAlign) {
			case 'start':
				scaleLabelY = me.top + (isReverse ? 0 : me.height);
				textAlign = isReverse === isLeft ? 'right' : 'left';
				break;
			case 'end':
				scaleLabelY = me.top + (isReverse ? me.height : 0);
				textAlign = isReverse === isLeft ? 'left' : 'right';
				break;
			default:
				scaleLabelY = me.top + me.height / 2;
				textAlign = 'center';
			}
			rotation = isLeft ? -HALF_PI : HALF_PI;
		}
		ctx.save();
		ctx.translate(scaleLabelX, scaleLabelY);
		ctx.rotate(rotation);
		ctx.textAlign = textAlign;
		ctx.textBaseline = 'middle';
		ctx.fillStyle = scaleLabel.color;
		ctx.font = scaleLabelFont.string;
		ctx.fillText(scaleLabel.labelString, 0, 0);
		ctx.restore();
	}
	draw(chartArea) {
		const me = this;
		if (!me._isVisible()) {
			return;
		}
		me.drawGrid(chartArea);
		me.drawTitle();
		me.drawLabels(chartArea);
	}
	_layers() {
		const me = this;
		const opts = me.options;
		const tz = opts.ticks && opts.ticks.z || 0;
		const gz = opts.gridLines && opts.gridLines.z || 0;
		if (!me._isVisible() || tz === gz || me.draw !== me._draw) {
			return [{
				z: tz,
				draw(chartArea) {
					me.draw(chartArea);
				}
			}];
		}
		return [{
			z: gz,
			draw(chartArea) {
				me.drawGrid(chartArea);
				me.drawTitle();
			}
		}, {
			z: tz,
			draw(chartArea) {
				me.drawLabels(chartArea);
			}
		}];
	}
	getMatchingVisibleMetas(type) {
		const me = this;
		const metas = me.chart.getSortedVisibleDatasetMetas();
		const axisID = me.axis + 'AxisID';
		const result = [];
		let i, ilen;
		for (i = 0, ilen = metas.length; i < ilen; ++i) {
			const meta = metas[i];
			if (meta[axisID] === me.id && (!type || meta.type === type)) {
				result.push(meta);
			}
		}
		return result;
	}
	_resolveTickFontOptions(index) {
		const me = this;
		const chart = me.chart;
		const options = me.options.ticks;
		const context = me.getContext(index);
		return toFont(resolve([options.font], context), chart.options.font);
	}
}
Scale.prototype._draw = Scale.prototype.draw;

class TypedRegistry {
	constructor(type, scope) {
		this.type = type;
		this.scope = scope;
		this.items = Object.create(null);
	}
	isForType(type) {
		return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
	}
	register(item) {
		const proto = Object.getPrototypeOf(item);
		let parentScope;
		if (isIChartComponent(proto)) {
			parentScope = this.register(proto);
		}
		const items = this.items;
		const id = item.id;
		const baseScope = this.scope;
		const scope = baseScope ? baseScope + '.' + id : id;
		if (!id) {
			throw new Error('class does not have id: ' + item);
		}
		if (id in items) {
			return scope;
		}
		items[id] = item;
		registerDefaults(item, scope, parentScope);
		return scope;
	}
	get(id) {
		return this.items[id];
	}
	unregister(item) {
		const items = this.items;
		const id = item.id;
		const scope = this.scope;
		if (id in items) {
			delete items[id];
		}
		if (scope && id in defaults[scope]) {
			delete defaults[scope][id];
		}
	}
}
function registerDefaults(item, scope, parentScope) {
	const itemDefaults = Object.assign(
		Object.create(null),
		parentScope && defaults.get(parentScope),
		item.defaults,
		defaults.get(scope)
	);
	defaults.set(scope, itemDefaults);
	if (item.defaultRoutes) {
		routeDefaults(scope, item.defaultRoutes);
	}
}
function routeDefaults(scope, routes) {
	Object.keys(routes).forEach(property => {
		const propertyParts = property.split('.');
		const sourceName = propertyParts.pop();
		const sourceScope = [scope].concat(propertyParts).join('.');
		const parts = routes[property].split('.');
		const targetName = parts.pop();
		const targetScope = parts.join('.');
		defaults.route(sourceScope, sourceName, targetScope, targetName);
	});
}
function isIChartComponent(proto) {
	return 'id' in proto && 'defaults' in proto;
}

class Registry {
	constructor() {
		this.controllers = new TypedRegistry(DatasetController, 'controllers');
		this.elements = new TypedRegistry(Element, 'elements');
		this.plugins = new TypedRegistry(Object, 'plugins');
		this.scales = new TypedRegistry(Scale, 'scales');
		this._typedRegistries = [this.controllers, this.scales, this.elements];
	}
	add(...args) {
		this._each('register', args);
	}
	remove(...args) {
		this._each('unregister', args);
	}
	addControllers(...args) {
		this._each('register', args, this.controllers);
	}
	addElements(...args) {
		this._each('register', args, this.elements);
	}
	addPlugins(...args) {
		this._each('register', args, this.plugins);
	}
	addScales(...args) {
		this._each('register', args, this.scales);
	}
	getController(id) {
		return this._get(id, this.controllers, 'controller');
	}
	getElement(id) {
		return this._get(id, this.elements, 'element');
	}
	getPlugin(id) {
		return this._get(id, this.plugins, 'plugin');
	}
	getScale(id) {
		return this._get(id, this.scales, 'scale');
	}
	removeControllers(...args) {
		this._each('unregister', args, this.controllers);
	}
	removeElements(...args) {
		this._each('unregister', args, this.elements);
	}
	removePlugins(...args) {
		this._each('unregister', args, this.plugins);
	}
	removeScales(...args) {
		this._each('unregister', args, this.scales);
	}
	_each(method, args, typedRegistry) {
		const me = this;
		[...args].forEach(arg => {
			const reg = typedRegistry || me._getRegistryForType(arg);
			if (typedRegistry || reg.isForType(arg) || (reg === me.plugins && arg.id)) {
				me._exec(method, reg, arg);
			} else {
				each(arg, item => {
					const itemReg = typedRegistry || me._getRegistryForType(item);
					me._exec(method, itemReg, item);
				});
			}
		});
	}
	_exec(method, registry, component) {
		const camelMethod = _capitalize(method);
		callback(component['before' + camelMethod], [], component);
		registry[method](component);
		callback(component['after' + camelMethod], [], component);
	}
	_getRegistryForType(type) {
		for (let i = 0; i < this._typedRegistries.length; i++) {
			const reg = this._typedRegistries[i];
			if (reg.isForType(type)) {
				return reg;
			}
		}
		return this.plugins;
	}
	_get(id, typedRegistry, type) {
		const item = typedRegistry.get(id);
		if (item === undefined) {
			throw new Error('"' + id + '" is not a registered ' + type + '.');
		}
		return item;
	}
}
var registry = new Registry();

class PluginService {
	constructor() {
		this._init = [];
	}
	notify(chart, hook, args) {
		const me = this;
		if (hook === 'beforeInit') {
			me._init = me._createDescriptors(chart, true);
			me._notify(me._init, chart, 'install');
		}
		const descriptors = me._descriptors(chart);
		const result = me._notify(descriptors, chart, hook, args);
		if (hook === 'destroy') {
			me._notify(descriptors, chart, 'stop');
			me._notify(me._init, chart, 'uninstall');
		}
		return result;
	}
	_notify(descriptors, chart, hook, args) {
		args = args || {};
		for (const descriptor of descriptors) {
			const plugin = descriptor.plugin;
			const method = plugin[hook];
			const params = [chart, args, descriptor.options];
			if (callback(method, params, plugin) === false && args.cancelable) {
				return false;
			}
		}
		return true;
	}
	invalidate() {
		this._oldCache = this._cache;
		this._cache = undefined;
	}
	_descriptors(chart) {
		if (this._cache) {
			return this._cache;
		}
		const descriptors = this._cache = this._createDescriptors(chart);
		this._notifyStateChanges(chart);
		return descriptors;
	}
	_createDescriptors(chart, all) {
		const config = chart && chart.config;
		const options = valueOrDefault(config.options && config.options.plugins, {});
		const plugins = allPlugins(config);
		return options === false && !all ? [] : createDescriptors(plugins, options, all);
	}
	_notifyStateChanges(chart) {
		const previousDescriptors = this._oldCache || [];
		const descriptors = this._cache;
		const diff = (a, b) => a.filter(x => !b.some(y => x.plugin.id === y.plugin.id));
		this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
		this._notify(diff(descriptors, previousDescriptors), chart, 'start');
	}
}
function allPlugins(config) {
	const plugins = [];
	const keys = Object.keys(registry.plugins.items);
	for (let i = 0; i < keys.length; i++) {
		plugins.push(registry.getPlugin(keys[i]));
	}
	const local = config.plugins || [];
	for (let i = 0; i < local.length; i++) {
		const plugin = local[i];
		if (plugins.indexOf(plugin) === -1) {
			plugins.push(plugin);
		}
	}
	return plugins;
}
function getOpts(options, all) {
	if (!all && options === false) {
		return null;
	}
	if (options === true) {
		return {};
	}
	return options;
}
function createDescriptors(plugins, options, all) {
	const result = [];
	for (let i = 0; i < plugins.length; i++) {
		const plugin = plugins[i];
		const id = plugin.id;
		const opts = getOpts(options[id], all);
		if (opts === null) {
			continue;
		}
		result.push({
			plugin,
			options: mergeIf({}, [opts, defaults.plugins[id]])
		});
	}
	return result;
}

function getIndexAxis(type, options) {
	const typeDefaults = defaults.controllers[type] || {};
	const datasetDefaults = typeDefaults.datasets || {};
	const datasetOptions = options.datasets || {};
	const typeOptions = datasetOptions[type] || {};
	return typeOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
}
function getAxisFromDefaultScaleID(id, indexAxis) {
	let axis = id;
	if (id === '_index_') {
		axis = indexAxis;
	} else if (id === '_value_') {
		axis = indexAxis === 'x' ? 'y' : 'x';
	}
	return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
	return axis === indexAxis ? '_index_' : '_value_';
}
function axisFromPosition(position) {
	if (position === 'top' || position === 'bottom') {
		return 'x';
	}
	if (position === 'left' || position === 'right') {
		return 'y';
	}
}
function determineAxis(id, scaleOptions) {
	if (id === 'x' || id === 'y' || id === 'r') {
		return id;
	}
	return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
}
function mergeScaleConfig(config, options) {
	const chartDefaults = defaults.controllers[config.type] || {scales: {}};
	const configScales = options.scales || {};
	const chartIndexAxis = getIndexAxis(config.type, options);
	const firstIDs = Object.create(null);
	const scales = Object.create(null);
	Object.keys(configScales).forEach(id => {
		const scaleConf = configScales[id];
		const axis = determineAxis(id, scaleConf);
		const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
		firstIDs[axis] = firstIDs[axis] || id;
		scales[id] = mergeIf(Object.create(null), [{axis}, scaleConf, chartDefaults.scales[axis], chartDefaults.scales[defaultId]]);
	});
	if (options.scale) {
		scales[options.scale.id || 'r'] = mergeIf(Object.create(null), [{axis: 'r'}, options.scale, chartDefaults.scales.r]);
		firstIDs.r = firstIDs.r || options.scale.id || 'r';
	}
	config.data.datasets.forEach(dataset => {
		const type = dataset.type || config.type;
		const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
		const datasetDefaults = defaults.controllers[type] || {};
		const defaultScaleOptions = datasetDefaults.scales || {};
		Object.keys(defaultScaleOptions).forEach(defaultID => {
			const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
			const id = dataset[axis + 'AxisID'] || firstIDs[axis] || axis;
			scales[id] = scales[id] || Object.create(null);
			mergeIf(scales[id], [{axis}, configScales[id], defaultScaleOptions[defaultID]]);
		});
	});
	Object.keys(scales).forEach(key => {
		const scale = scales[key];
		mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
	});
	return scales;
}
function mergeConfig(...args) {
	return merge(Object.create(null), args, {
		merger(key, target, source, options) {
			if (key !== 'scales' && key !== 'scale' && key !== 'controllers') {
				_merger(key, target, source, options);
			}
		}
	});
}
function includePluginDefaults(options) {
	options.plugins = options.plugins || {};
	options.plugins.title = (options.plugins.title !== false) && merge(Object.create(null), [
		defaults.plugins.title,
		options.plugins.title
	]);
	options.plugins.tooltip = (options.plugins.tooltip !== false) && merge(Object.create(null), [
		defaults.interaction,
		defaults.plugins.tooltip,
		options.interaction,
		options.plugins.tooltip
	]);
}
function includeDefaults(config, options) {
	options = options || {};
	const scaleConfig = mergeScaleConfig(config, options);
	const hoverEanbled = options.interaction !== false && options.hover !== false;
	options = mergeConfig(
		defaults,
		defaults.controllers[config.type],
		options);
	options.hover = hoverEanbled && merge(Object.create(null), [
		defaults.interaction,
		defaults.hover,
		options.interaction,
		options.hover
	]);
	options.scales = scaleConfig;
	if (options.plugins !== false) {
		includePluginDefaults(options);
	}
	return options;
}
function initConfig(config) {
	config = config || {};
	const data = config.data = config.data || {datasets: [], labels: []};
	data.datasets = data.datasets || [];
	data.labels = data.labels || [];
	config.options = includeDefaults(config, config.options);
	return config;
}
class Config {
	constructor(config) {
		this._config = initConfig(config);
	}
	get type() {
		return this._config.type;
	}
	get data() {
		return this._config.data;
	}
	set data(data) {
		this._config.data = data;
	}
	get options() {
		return this._config.options;
	}
	get plugins() {
		return this._config.plugins;
	}
	update(options) {
		const config = this._config;
		config.options = includeDefaults(config, options);
	}
}

var version = "3.0.0-beta.7";

const KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea'];
function positionIsHorizontal(position, axis) {
	return position === 'top' || position === 'bottom' || (KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x');
}
function compare2Level(l1, l2) {
	return function(a, b) {
		return a[l1] === b[l1]
			? a[l2] - b[l2]
			: a[l1] - b[l1];
	};
}
function onAnimationsComplete(context) {
	const chart = context.chart;
	const animationOptions = chart.options.animation;
	chart.notifyPlugins('afterRender');
	callback(animationOptions && animationOptions.onComplete, [context], chart);
}
function onAnimationProgress(context) {
	const chart = context.chart;
	const animationOptions = chart.options.animation;
	callback(animationOptions && animationOptions.onProgress, [context], chart);
}
function isDomSupported() {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}
function getCanvas(item) {
	if (isDomSupported() && typeof item === 'string') {
		item = document.getElementById(item);
	} else if (item && item.length) {
		item = item[0];
	}
	if (item && item.canvas) {
		item = item.canvas;
	}
	return item;
}
class Chart {
	constructor(item, config) {
		const me = this;
		this.config = config = new Config(config);
		const initialCanvas = getCanvas(item);
		const existingChart = Chart.getChart(initialCanvas);
		if (existingChart) {
			throw new Error(
				'Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' +
				' must be destroyed before the canvas can be reused.'
			);
		}
		this.platform = me._initializePlatform(initialCanvas, config);
		const context = me.platform.acquireContext(initialCanvas, config);
		const canvas = context && context.canvas;
		const height = canvas && canvas.height;
		const width = canvas && canvas.width;
		this.id = uid();
		this.ctx = context;
		this.canvas = canvas;
		this.width = width;
		this.height = height;
		this.aspectRatio = height ? width / height : null;
		this.options = config.options;
		this._layers = [];
		this._metasets = [];
		this.boxes = [];
		this.currentDevicePixelRatio = undefined;
		this.chartArea = undefined;
		this._active = [];
		this._lastEvent = undefined;
		this._listeners = {};
		this._sortedMetasets = [];
		this.scales = {};
		this.scale = undefined;
		this._plugins = new PluginService();
		this.$proxies = {};
		this._hiddenIndices = {};
		this.attached = false;
		this._animationsDisabled = undefined;
		this.$context = undefined;
		Chart.instances[me.id] = me;
		if (!context || !canvas) {
			console.error("Failed to create chart: can't acquire context from the given item");
			return;
		}
		animator.listen(me, 'complete', onAnimationsComplete);
		animator.listen(me, 'progress', onAnimationProgress);
		me._initialize();
		if (me.attached) {
			me.update();
		}
	}
	get data() {
		return this.config.data;
	}
	set data(data) {
		this.config.data = data;
	}
	_initialize() {
		const me = this;
		me.notifyPlugins('beforeInit');
		if (me.options.responsive) {
			me.resize();
		} else {
			retinaScale(me, me.options.devicePixelRatio);
		}
		me.bindEvents();
		me.notifyPlugins('afterInit');
		return me;
	}
	_initializePlatform(canvas, config) {
		if (config.platform) {
			return new config.platform();
		} else if (!isDomSupported() || (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas)) {
			return new BasicPlatform();
		}
		return new DomPlatform();
	}
	clear() {
		clear(this);
		return this;
	}
	stop() {
		animator.stop(this);
		return this;
	}
	resize(width, height) {
		if (!animator.running(this)) {
			this._resize(width, height);
		} else {
			this._resizeBeforeDraw = {width, height};
		}
	}
	_resize(width, height) {
		const me = this;
		const options = me.options;
		const canvas = me.canvas;
		const aspectRatio = options.maintainAspectRatio && me.aspectRatio;
		const newSize = me.platform.getMaximumSize(canvas, width, height, aspectRatio);
		const oldRatio = me.currentDevicePixelRatio;
		const newRatio = options.devicePixelRatio || me.platform.getDevicePixelRatio();
		if (me.width === newSize.width && me.height === newSize.height && oldRatio === newRatio) {
			return;
		}
		canvas.width = me.width = newSize.width;
		canvas.height = me.height = newSize.height;
		if (canvas.style) {
			canvas.style.width = newSize.width + 'px';
			canvas.style.height = newSize.height + 'px';
		}
		retinaScale(me, newRatio);
		me.notifyPlugins('resize', {size: newSize});
		callback(options.onResize, [newSize], me);
		if (me.attached) {
			me.update('resize');
		}
	}
	ensureScalesHaveIDs() {
		const options = this.options;
		const scalesOptions = options.scales || {};
		const scaleOptions = options.scale;
		each(scalesOptions, (axisOptions, axisID) => {
			axisOptions.id = axisID;
		});
		if (scaleOptions) {
			scaleOptions.id = scaleOptions.id || 'scale';
		}
	}
	buildOrUpdateScales() {
		const me = this;
		const options = me.options;
		const scaleOpts = options.scales;
		const scales = me.scales || {};
		const updated = Object.keys(scales).reduce((obj, id) => {
			obj[id] = false;
			return obj;
		}, {});
		let items = [];
		if (scaleOpts) {
			items = items.concat(
				Object.keys(scaleOpts).map((id) => {
					const scaleOptions = scaleOpts[id];
					const axis = determineAxis(id, scaleOptions);
					const isRadial = axis === 'r';
					const isHorizontal = axis === 'x';
					return {
						options: scaleOptions,
						dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
						dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
					};
				})
			);
		}
		each(items, (item) => {
			const scaleOptions = item.options;
			const id = scaleOptions.id;
			const axis = determineAxis(id, scaleOptions);
			const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
			if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
				scaleOptions.position = item.dposition;
			}
			updated[id] = true;
			let scale = null;
			if (id in scales && scales[id].type === scaleType) {
				scale = scales[id];
			} else {
				const scaleClass = registry.getScale(scaleType);
				scale = new scaleClass({
					id,
					type: scaleType,
					ctx: me.ctx,
					chart: me
				});
				scales[scale.id] = scale;
			}
			scale.init(scaleOptions, options);
			if (item.isDefault) {
				me.scale = scale;
			}
		});
		each(updated, (hasUpdated, id) => {
			if (!hasUpdated) {
				delete scales[id];
			}
		});
		me.scales = scales;
		each(scales, (scale) => {
			scale.fullWidth = scale.options.fullWidth;
			scale.position = scale.options.position;
			scale.weight = scale.options.weight;
			layouts.addBox(me, scale);
		});
	}
	_updateMetasetIndex(meta, index) {
		const metasets = this._metasets;
		const oldIndex = meta.index;
		if (oldIndex !== index) {
			metasets[oldIndex] = metasets[index];
			metasets[index] = meta;
			meta.index = index;
		}
	}
	_updateMetasets() {
		const me = this;
		const metasets = me._metasets;
		const numData = me.data.datasets.length;
		const numMeta = metasets.length;
		if (numMeta > numData) {
			for (let i = numData; i < numMeta; ++i) {
				me._destroyDatasetMeta(i);
			}
			metasets.splice(numData, numMeta - numData);
		}
		me._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
	}
	_removeUnreferencedMetasets() {
		const me = this;
		const datasets = me.data.datasets;
		me._metasets.forEach((meta, index) => {
			if (datasets.filter(x => x === meta._dataset).length === 0) {
				me._destroyDatasetMeta(index);
			}
		});
	}
	buildOrUpdateControllers() {
		const me = this;
		const newControllers = [];
		const datasets = me.data.datasets;
		let i, ilen;
		me._removeUnreferencedMetasets();
		for (i = 0, ilen = datasets.length; i < ilen; i++) {
			const dataset = datasets[i];
			let meta = me.getDatasetMeta(i);
			const type = dataset.type || me.config.type;
			if (meta.type && meta.type !== type) {
				me._destroyDatasetMeta(i);
				meta = me.getDatasetMeta(i);
			}
			meta.type = type;
			meta.indexAxis = dataset.indexAxis || getIndexAxis(type, me.options);
			meta.order = dataset.order || 0;
			me._updateMetasetIndex(meta, i);
			meta.label = '' + dataset.label;
			meta.visible = me.isDatasetVisible(i);
			if (meta.controller) {
				meta.controller.updateIndex(i);
				meta.controller.linkScales();
			} else {
				const controllerDefaults = defaults.controllers[type];
				const ControllerClass = registry.getController(type);
				Object.assign(ControllerClass.prototype, {
					dataElementType: registry.getElement(controllerDefaults.dataElementType),
					datasetElementType: controllerDefaults.datasetElementType && registry.getElement(controllerDefaults.datasetElementType),
					dataElementOptions: controllerDefaults.dataElementOptions,
					datasetElementOptions: controllerDefaults.datasetElementOptions
				});
				meta.controller = new ControllerClass(me, i);
				newControllers.push(meta.controller);
			}
		}
		me._updateMetasets();
		return newControllers;
	}
	_resetElements() {
		const me = this;
		each(me.data.datasets, (dataset, datasetIndex) => {
			me.getDatasetMeta(datasetIndex).controller.reset();
		}, me);
	}
	reset() {
		this._resetElements();
		this.notifyPlugins('reset');
	}
	update(mode) {
		const me = this;
		let i, ilen;
		each(me.scales, (scale) => {
			layouts.removeBox(me, scale);
		});
		me.config.update(me.options);
		me.options = me.config.options;
		me._animationsDisabled = !me.options.animation;
		me.ensureScalesHaveIDs();
		me.buildOrUpdateScales();
		me._plugins.invalidate();
		if (me.notifyPlugins('beforeUpdate', {mode, cancelable: true}) === false) {
			return;
		}
		const newControllers = me.buildOrUpdateControllers();
		for (i = 0, ilen = me.data.datasets.length; i < ilen; i++) {
			me.getDatasetMeta(i).controller.buildOrUpdateElements();
		}
		me._updateLayout();
		each(newControllers, (controller) => {
			controller.reset();
		});
		me._updateDatasets(mode);
		me.notifyPlugins('afterUpdate', {mode});
		me._layers.sort(compare2Level('z', '_idx'));
		if (me._lastEvent) {
			me._eventHandler(me._lastEvent, true);
		}
		me.render();
	}
	_updateLayout() {
		const me = this;
		if (me.notifyPlugins('beforeLayout', {cancelable: true}) === false) {
			return;
		}
		layouts.update(me, me.width, me.height);
		me._layers = [];
		each(me.boxes, (box) => {
			if (box.configure) {
				box.configure();
			}
			me._layers.push(...box._layers());
		}, me);
		me._layers.forEach((item, index) => {
			item._idx = index;
		});
		me.notifyPlugins('afterLayout');
	}
	_updateDatasets(mode) {
		const me = this;
		const isFunction = typeof mode === 'function';
		if (me.notifyPlugins('beforeDatasetsUpdate', {mode, cancelable: true}) === false) {
			return;
		}
		for (let i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me._updateDataset(i, isFunction ? mode({datasetIndex: i}) : mode);
		}
		me.notifyPlugins('afterDatasetsUpdate', {mode});
	}
	_updateDataset(index, mode) {
		const me = this;
		const meta = me.getDatasetMeta(index);
		const args = {meta, index, mode, cancelable: true};
		if (me.notifyPlugins('beforeDatasetUpdate', args) === false) {
			return;
		}
		meta.controller._update(mode);
		args.cancelable = false;
		me.notifyPlugins('afterDatasetUpdate', args);
	}
	render() {
		const me = this;
		if (me.notifyPlugins('beforeRender', {cancelable: true}) === false) {
			return;
		}
		if (animator.has(me)) {
			if (me.attached && !animator.running(me)) {
				animator.start(me);
			}
		} else {
			me.draw();
			onAnimationsComplete({chart: me});
		}
	}
	draw() {
		const me = this;
		let i;
		if (me._resizeBeforeDraw) {
			const {width, height} = me._resizeBeforeDraw;
			me._resize(width, height);
			me._resizeBeforeDraw = null;
		}
		me.clear();
		if (me.width <= 0 || me.height <= 0) {
			return;
		}
		if (me.notifyPlugins('beforeDraw', {cancelable: true}) === false) {
			return;
		}
		const layers = me._layers;
		for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
			layers[i].draw(me.chartArea);
		}
		me._drawDatasets();
		for (; i < layers.length; ++i) {
			layers[i].draw(me.chartArea);
		}
		me.notifyPlugins('afterDraw');
	}
	_getSortedDatasetMetas(filterVisible) {
		const me = this;
		const metasets = me._sortedMetasets;
		const result = [];
		let i, ilen;
		for (i = 0, ilen = metasets.length; i < ilen; ++i) {
			const meta = metasets[i];
			if (!filterVisible || meta.visible) {
				result.push(meta);
			}
		}
		return result;
	}
	getSortedVisibleDatasetMetas() {
		return this._getSortedDatasetMetas(true);
	}
	_drawDatasets() {
		const me = this;
		if (me.notifyPlugins('beforeDatasetsDraw', {cancelable: true}) === false) {
			return;
		}
		const metasets = me.getSortedVisibleDatasetMetas();
		for (let i = metasets.length - 1; i >= 0; --i) {
			me._drawDataset(metasets[i]);
		}
		me.notifyPlugins('afterDatasetsDraw');
	}
	_drawDataset(meta) {
		const me = this;
		const ctx = me.ctx;
		const clip = meta._clip;
		const area = me.chartArea;
		const args = {
			meta,
			index: meta.index,
			cancelable: true
		};
		if (me.notifyPlugins('beforeDatasetDraw', args) === false) {
			return;
		}
		clipArea(ctx, {
			left: clip.left === false ? 0 : area.left - clip.left,
			right: clip.right === false ? me.width : area.right + clip.right,
			top: clip.top === false ? 0 : area.top - clip.top,
			bottom: clip.bottom === false ? me.height : area.bottom + clip.bottom
		});
		meta.controller.draw();
		unclipArea(ctx);
		args.cancelable = false;
		me.notifyPlugins('afterDatasetDraw', args);
	}
	getElementsAtEventForMode(e, mode, options, useFinalPosition) {
		const method = Interaction.modes[mode];
		if (typeof method === 'function') {
			return method(this, e, options, useFinalPosition);
		}
		return [];
	}
	getDatasetMeta(datasetIndex) {
		const me = this;
		const dataset = me.data.datasets[datasetIndex];
		const metasets = me._metasets;
		let meta = metasets.filter(x => x && x._dataset === dataset).pop();
		if (!meta) {
			meta = metasets[datasetIndex] = {
				type: null,
				data: [],
				dataset: null,
				controller: null,
				hidden: null,
				xAxisID: null,
				yAxisID: null,
				order: dataset.order || 0,
				index: datasetIndex,
				_dataset: dataset,
				_parsed: [],
				_sorted: false
			};
		}
		return meta;
	}
	getContext() {
		return this.$context || (this.$context = Object.create(null, {
			chart: {
				value: this
			},
			type: {
				value: 'chart'
			}
		}));
	}
	getVisibleDatasetCount() {
		return this.getSortedVisibleDatasetMetas().length;
	}
	isDatasetVisible(datasetIndex) {
		const dataset = this.data.datasets[datasetIndex];
		if (!dataset) {
			return false;
		}
		const meta = this.getDatasetMeta(datasetIndex);
		return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
	}
	setDatasetVisibility(datasetIndex, visible) {
		const meta = this.getDatasetMeta(datasetIndex);
		meta.hidden = !visible;
	}
	toggleDataVisibility(index) {
		this._hiddenIndices[index] = !this._hiddenIndices[index];
	}
	getDataVisibility(index) {
		return !this._hiddenIndices[index];
	}
	_updateDatasetVisibility(datasetIndex, visible) {
		const me = this;
		const mode = visible ? 'show' : 'hide';
		const meta = me.getDatasetMeta(datasetIndex);
		const anims = meta.controller._resolveAnimations(undefined, mode);
		me.setDatasetVisibility(datasetIndex, visible);
		anims.update(meta, {visible});
		me.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : undefined);
	}
	hide(datasetIndex) {
		this._updateDatasetVisibility(datasetIndex, false);
	}
	show(datasetIndex) {
		this._updateDatasetVisibility(datasetIndex, true);
	}
	_destroyDatasetMeta(datasetIndex) {
		const me = this;
		const meta = me._metasets && me._metasets[datasetIndex];
		if (meta) {
			meta.controller._destroy();
			delete me._metasets[datasetIndex];
		}
	}
	destroy() {
		const me = this;
		const canvas = me.canvas;
		let i, ilen;
		me.stop();
		animator.remove(me);
		for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me._destroyDatasetMeta(i);
		}
		if (canvas) {
			me.unbindEvents();
			clear(me);
			me.platform.releaseContext(me.ctx);
			me.canvas = null;
			me.ctx = null;
		}
		me.notifyPlugins('destroy');
		delete Chart.instances[me.id];
	}
	toBase64Image(...args) {
		return this.canvas.toDataURL(...args);
	}
	bindEvents() {
		const me = this;
		const listeners = me._listeners;
		const platform = me.platform;
		const _add = (type, listener) => {
			platform.addEventListener(me, type, listener);
			listeners[type] = listener;
		};
		const _remove = (type, listener) => {
			if (listeners[type]) {
				platform.removeEventListener(me, type, listener);
				delete listeners[type];
			}
		};
		let listener = function(e, x, y) {
			e.offsetX = x;
			e.offsetY = y;
			me._eventHandler(e);
		};
		each(me.options.events, (type) => _add(type, listener));
		if (me.options.responsive) {
			listener = (width, height) => {
				if (me.canvas) {
					me.resize(width, height);
				}
			};
			let detached;
			const attached = () => {
				_remove('attach', attached);
				me.attached = true;
				me.resize();
				_add('resize', listener);
				_add('detach', detached);
			};
			detached = () => {
				me.attached = false;
				_remove('resize', listener);
				_add('attach', attached);
			};
			if (platform.isAttached(me.canvas)) {
				attached();
			} else {
				detached();
			}
		} else {
			me.attached = true;
		}
	}
	unbindEvents() {
		const me = this;
		const listeners = me._listeners;
		if (!listeners) {
			return;
		}
		delete me._listeners;
		each(listeners, (listener, type) => {
			me.platform.removeEventListener(me, type, listener);
		});
	}
	updateHoverStyle(items, mode, enabled) {
		const prefix = enabled ? 'set' : 'remove';
		let meta, item, i, ilen;
		if (mode === 'dataset') {
			meta = this.getDatasetMeta(items[0].datasetIndex);
			meta.controller['_' + prefix + 'DatasetHoverStyle']();
		}
		for (i = 0, ilen = items.length; i < ilen; ++i) {
			item = items[i];
			if (item) {
				this.getDatasetMeta(item.datasetIndex).controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
			}
		}
	}
	getActiveElements() {
		return this._active || [];
	}
	setActiveElements(activeElements) {
		const me = this;
		const lastActive = me._active || [];
		const active = activeElements.map(({datasetIndex, index}) => {
			const meta = me.getDatasetMeta(datasetIndex);
			if (!meta) {
				throw new Error('No dataset found at index ' + datasetIndex);
			}
			return {
				datasetIndex,
				element: meta.data[index],
				index,
			};
		});
		const changed = !_elementsEqual(active, lastActive);
		if (changed) {
			me._active = active;
			me._updateHoverStyles(active, lastActive);
		}
	}
	notifyPlugins(hook, args) {
		return this._plugins.notify(this, hook, args);
	}
	_updateHoverStyles(active, lastActive) {
		const me = this;
		const options = me.options || {};
		const hoverOptions = options.hover;
		if (lastActive.length) {
			me.updateHoverStyle(lastActive, hoverOptions.mode, false);
		}
		if (active.length && hoverOptions.mode) {
			me.updateHoverStyle(active, hoverOptions.mode, true);
		}
	}
	_eventHandler(e, replay) {
		const me = this;
		const args = {event: e, replay, cancelable: true};
		if (me.notifyPlugins('beforeEvent', args) === false) {
			return;
		}
		const changed = me._handleEvent(e, replay);
		args.cancelable = false;
		me.notifyPlugins('afterEvent', args);
		if (changed) {
			me.render();
		}
		return me;
	}
	_handleEvent(e, replay) {
		const me = this;
		const lastActive = me._active || [];
		const options = me.options;
		const hoverOptions = options.hover;
		const useFinalPosition = replay;
		let active = [];
		let changed = false;
		if (e.type === 'mouseout') {
			me._lastEvent = null;
		} else {
			active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
			me._lastEvent = e.type === 'click' ? me._lastEvent : e;
		}
		callback(options.onHover || options.hover.onHover, [e, active, me], me);
		if (e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu') {
			if (_isPointInArea(e, me.chartArea)) {
				callback(options.onClick, [e, active, me], me);
			}
		}
		changed = !_elementsEqual(active, lastActive);
		if (changed || replay) {
			me._active = active;
			me._updateHoverStyles(active, lastActive);
		}
		return changed;
	}
}
Chart.defaults = defaults;
Chart.instances = {};
Chart.registry = registry;
Chart.version = version;
Chart.getChart = (key) => {
	const canvas = getCanvas(key);
	return Object.values(Chart.instances).filter((c) => c.canvas === canvas).pop();
};
const invalidatePlugins = () => each(Chart.instances, (chart) => chart._plugins.invalidate());
Chart.register = (...items) => {
	registry.add(...items);
	invalidatePlugins();
};
Chart.unregister = (...items) => {
	registry.remove(...items);
	invalidatePlugins();
};

const EPSILON = Number.EPSILON || 1e-14;
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
	const previous = firstPoint.skip ? middlePoint : firstPoint;
	const current = middlePoint;
	const next = afterPoint.skip ? middlePoint : afterPoint;
	const d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
	const d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
	let s01 = d01 / (d01 + d12);
	let s12 = d12 / (d01 + d12);
	s01 = isNaN(s01) ? 0 : s01;
	s12 = isNaN(s12) ? 0 : s12;
	const fa = t * s01;
	const fb = t * s12;
	return {
		previous: {
			x: current.x - fa * (next.x - previous.x),
			y: current.y - fa * (next.y - previous.y)
		},
		next: {
			x: current.x + fb * (next.x - previous.x),
			y: current.y + fb * (next.y - previous.y)
		}
	};
}
function splineCurveMonotone(points) {
	const pointsWithTangents = (points || []).map((point) => ({
		model: point,
		deltaK: 0,
		mK: 0
	}));
	const pointsLen = pointsWithTangents.length;
	let i, pointBefore, pointCurrent, pointAfter;
	for (i = 0; i < pointsLen; ++i) {
		pointCurrent = pointsWithTangents[i];
		if (pointCurrent.model.skip) {
			continue;
		}
		pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
		pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
		if (pointAfter && !pointAfter.model.skip) {
			const slopeDeltaX = (pointAfter.model.x - pointCurrent.model.x);
			pointCurrent.deltaK = slopeDeltaX !== 0 ? (pointAfter.model.y - pointCurrent.model.y) / slopeDeltaX : 0;
		}
		if (!pointBefore || pointBefore.model.skip) {
			pointCurrent.mK = pointCurrent.deltaK;
		} else if (!pointAfter || pointAfter.model.skip) {
			pointCurrent.mK = pointBefore.deltaK;
		} else if (sign(pointBefore.deltaK) !== sign(pointCurrent.deltaK)) {
			pointCurrent.mK = 0;
		} else {
			pointCurrent.mK = (pointBefore.deltaK + pointCurrent.deltaK) / 2;
		}
	}
	let alphaK, betaK, tauK, squaredMagnitude;
	for (i = 0; i < pointsLen - 1; ++i) {
		pointCurrent = pointsWithTangents[i];
		pointAfter = pointsWithTangents[i + 1];
		if (pointCurrent.model.skip || pointAfter.model.skip) {
			continue;
		}
		if (almostEquals(pointCurrent.deltaK, 0, EPSILON)) {
			pointCurrent.mK = pointAfter.mK = 0;
			continue;
		}
		alphaK = pointCurrent.mK / pointCurrent.deltaK;
		betaK = pointAfter.mK / pointCurrent.deltaK;
		squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
		if (squaredMagnitude <= 9) {
			continue;
		}
		tauK = 3 / Math.sqrt(squaredMagnitude);
		pointCurrent.mK = alphaK * tauK * pointCurrent.deltaK;
		pointAfter.mK = betaK * tauK * pointCurrent.deltaK;
	}
	let deltaX;
	for (i = 0; i < pointsLen; ++i) {
		pointCurrent = pointsWithTangents[i];
		if (pointCurrent.model.skip) {
			continue;
		}
		pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
		pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
		if (pointBefore && !pointBefore.model.skip) {
			deltaX = (pointCurrent.model.x - pointBefore.model.x) / 3;
			pointCurrent.model.controlPointPreviousX = pointCurrent.model.x - deltaX;
			pointCurrent.model.controlPointPreviousY = pointCurrent.model.y - deltaX * pointCurrent.mK;
		}
		if (pointAfter && !pointAfter.model.skip) {
			deltaX = (pointAfter.model.x - pointCurrent.model.x) / 3;
			pointCurrent.model.controlPointNextX = pointCurrent.model.x + deltaX;
			pointCurrent.model.controlPointNextY = pointCurrent.model.y + deltaX * pointCurrent.mK;
		}
	}
}
function capControlPoint(pt, min, max) {
	return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
	let i, ilen, point;
	for (i = 0, ilen = points.length; i < ilen; ++i) {
		point = points[i];
		if (!_isPointInArea(point, area)) {
			continue;
		}
		if (i > 0 && _isPointInArea(points[i - 1], area)) {
			point.controlPointPreviousX = capControlPoint(point.controlPointPreviousX, area.left, area.right);
			point.controlPointPreviousY = capControlPoint(point.controlPointPreviousY, area.top, area.bottom);
		}
		if (i < points.length - 1 && _isPointInArea(points[i + 1], area)) {
			point.controlPointNextX = capControlPoint(point.controlPointNextX, area.left, area.right);
			point.controlPointNextY = capControlPoint(point.controlPointNextY, area.top, area.bottom);
		}
	}
}
function _updateBezierControlPoints(points, options, area, loop) {
	let i, ilen, point, controlPoints;
	if (options.spanGaps) {
		points = points.filter((pt) => !pt.skip);
	}
	if (options.cubicInterpolationMode === 'monotone') {
		splineCurveMonotone(points);
	} else {
		let prev = loop ? points[points.length - 1] : points[0];
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			point = points[i];
			controlPoints = splineCurve(
				prev,
				point,
				points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen],
				options.tension
			);
			point.controlPointPreviousX = controlPoints.previous.x;
			point.controlPointPreviousY = controlPoints.previous.y;
			point.controlPointNextX = controlPoints.next.x;
			point.controlPointNextY = controlPoints.next.y;
			prev = point;
		}
	}
	if (options.capBezierPoints) {
		capBezierPoints(points, area);
	}
}

function _pointInLine(p1, p2, t, mode) {
	return {
		x: p1.x + t * (p2.x - p1.x),
		y: p1.y + t * (p2.y - p1.y)
	};
}
function _steppedInterpolation(p1, p2, t, mode) {
	return {
		x: p1.x + t * (p2.x - p1.x),
		y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y
		: mode === 'after' ? t < 1 ? p1.y : p2.y
		: t > 0 ? p2.y : p1.y
	};
}
function _bezierInterpolation(p1, p2, t, mode) {
	const cp1 = {x: p1.controlPointNextX, y: p1.controlPointNextY};
	const cp2 = {x: p2.controlPointPreviousX, y: p2.controlPointPreviousY};
	const a = _pointInLine(p1, cp1, t);
	const b = _pointInLine(cp1, cp2, t);
	const c = _pointInLine(cp2, p2, t);
	const d = _pointInLine(a, b, t);
	const e = _pointInLine(b, c, t);
	return _pointInLine(d, e, t);
}

const getRightToLeftAdapter = function(rectX, width) {
	return {
		x(x) {
			return rectX + rectX + width - x;
		},
		setWidth(w) {
			width = w;
		},
		textAlign(align) {
			if (align === 'center') {
				return align;
			}
			return align === 'right' ? 'left' : 'right';
		},
		xPlus(x, value) {
			return x - value;
		},
		leftForLtr(x, itemWidth) {
			return x - itemWidth;
		},
	};
};
const getLeftToRightAdapter = function() {
	return {
		x(x) {
			return x;
		},
		setWidth(w) {
		},
		textAlign(align) {
			return align;
		},
		xPlus(x, value) {
			return x + value;
		},
		leftForLtr(x, _itemWidth) {
			return x;
		},
	};
};
function getRtlAdapter(rtl, rectX, width) {
	return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
function overrideTextDirection(ctx, direction) {
	let style, original;
	if (direction === 'ltr' || direction === 'rtl') {
		style = ctx.canvas.style;
		original = [
			style.getPropertyValue('direction'),
			style.getPropertyPriority('direction'),
		];
		style.setProperty('direction', direction, 'important');
		ctx.prevTextDirection = original;
	}
}
function restoreTextDirection(ctx, original) {
	if (original !== undefined) {
		delete ctx.prevTextDirection;
		ctx.canvas.style.setProperty('direction', original[0], original[1]);
	}
}

function propertyFn(property) {
	if (property === 'angle') {
		return {
			between: _angleBetween,
			compare: _angleDiff,
			normalize: _normalizeAngle,
		};
	}
	return {
		between: (n, s, e) => n >= s && n <= e,
		compare: (a, b) => a - b,
		normalize: x => x
	};
}
function makeSubSegment(start, end, loop, count) {
	return {
		start: start % count,
		end: end % count,
		loop: loop && (end - start + 1) % count === 0
	};
}
function getSegment(segment, points, bounds) {
	const {property, start: startBound, end: endBound} = bounds;
	const {between, normalize} = propertyFn(property);
	const count = points.length;
	let {start, end, loop} = segment;
	let i, ilen;
	if (loop) {
		start += count;
		end += count;
		for (i = 0, ilen = count; i < ilen; ++i) {
			if (!between(normalize(points[start % count][property]), startBound, endBound)) {
				break;
			}
			start--;
			end--;
		}
		start %= count;
		end %= count;
	}
	if (end < start) {
		end += count;
	}
	return {start, end, loop};
}
function _boundSegment(segment, points, bounds) {
	if (!bounds) {
		return [segment];
	}
	const {property, start: startBound, end: endBound} = bounds;
	const count = points.length;
	const {compare, between, normalize} = propertyFn(property);
	const {start, end, loop} = getSegment(segment, points, bounds);
	const result = [];
	let inside = false;
	let subStart = null;
	let value, point, prevValue;
	const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
	const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
	const shouldStart = () => inside || startIsBefore();
	const shouldStop = () => !inside || endIsBefore();
	for (let i = start, prev = start; i <= end; ++i) {
		point = points[i % count];
		if (point.skip) {
			continue;
		}
		value = normalize(point[property]);
		inside = between(value, startBound, endBound);
		if (subStart === null && shouldStart()) {
			subStart = compare(value, startBound) === 0 ? i : prev;
		}
		if (subStart !== null && shouldStop()) {
			result.push(makeSubSegment(subStart, i, loop, count));
			subStart = null;
		}
		prev = i;
		prevValue = value;
	}
	if (subStart !== null) {
		result.push(makeSubSegment(subStart, end, loop, count));
	}
	return result;
}
function _boundSegments(line, bounds) {
	const result = [];
	const segments = line.segments;
	for (let i = 0; i < segments.length; i++) {
		const sub = _boundSegment(segments[i], line.points, bounds);
		if (sub.length) {
			result.push(...sub);
		}
	}
	return result;
}
function findStartAndEnd(points, count, loop, spanGaps) {
	let start = 0;
	let end = count - 1;
	if (loop && !spanGaps) {
		while (start < count && !points[start].skip) {
			start++;
		}
	}
	while (start < count && points[start].skip) {
		start++;
	}
	start %= count;
	if (loop) {
		end += start;
	}
	while (end > start && points[end % count].skip) {
		end--;
	}
	end %= count;
	return {start, end};
}
function solidSegments(points, start, max, loop) {
	const count = points.length;
	const result = [];
	let last = start;
	let prev = points[start];
	let end;
	for (end = start + 1; end <= max; ++end) {
		const cur = points[end % count];
		if (cur.skip || cur.stop) {
			if (!prev.skip) {
				loop = false;
				result.push({start: start % count, end: (end - 1) % count, loop});
				start = last = cur.stop ? end : null;
			}
		} else {
			last = end;
			if (prev.skip) {
				start = end;
			}
		}
		prev = cur;
	}
	if (last !== null) {
		result.push({start: start % count, end: last % count, loop});
	}
	return result;
}
function _computeSegments(line) {
	const points = line.points;
	const spanGaps = line.options.spanGaps;
	const count = points.length;
	if (!count) {
		return [];
	}
	const loop = !!line._loop;
	const {start, end} = findStartAndEnd(points, count, loop, spanGaps);
	if (spanGaps === true) {
		return [{start, end, loop}];
	}
	const max = end < start ? end + count : end;
	const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
	return solidSegments(points, start, max, completeLoop);
}

var helpers = /*#__PURE__*/Object.freeze({
__proto__: null,
easingEffects: effects,
color: color,
getHoverColor: getHoverColor,
requestAnimFrame: requestAnimFrame,
fontString: fontString,
noop: noop,
uid: uid,
isNullOrUndef: isNullOrUndef,
isArray: isArray,
isObject: isObject,
isFinite: isNumberFinite,
finiteOrDefault: finiteOrDefault,
valueOrDefault: valueOrDefault,
callback: callback,
each: each,
_elementsEqual: _elementsEqual,
clone: clone,
_merger: _merger,
merge: merge,
mergeIf: mergeIf,
_mergerIf: _mergerIf,
_deprecated: _deprecated,
resolveObjectKey: resolveObjectKey,
_capitalize: _capitalize,
toFontString: toFontString,
_measureText: _measureText,
_longestText: _longestText,
_alignPixel: _alignPixel,
clear: clear,
drawPoint: drawPoint,
_isPointInArea: _isPointInArea,
clipArea: clipArea,
unclipArea: unclipArea,
_steppedLineTo: _steppedLineTo,
_bezierCurveTo: _bezierCurveTo,
_lookup: _lookup,
_lookupByKey: _lookupByKey,
_rlookupByKey: _rlookupByKey,
_filterBetween: _filterBetween,
listenArrayEvents: listenArrayEvents,
unlistenArrayEvents: unlistenArrayEvents,
_arrayUnique: _arrayUnique,
splineCurve: splineCurve,
splineCurveMonotone: splineCurveMonotone,
_updateBezierControlPoints: _updateBezierControlPoints,
_getParentNode: _getParentNode,
getStyle: getStyle,
getRelativePosition: getRelativePosition,
getMaximumSize: getMaximumSize,
retinaScale: retinaScale,
supportsEventListenerOptions: supportsEventListenerOptions,
readUsedSize: readUsedSize,
_pointInLine: _pointInLine,
_steppedInterpolation: _steppedInterpolation,
_bezierInterpolation: _bezierInterpolation,
toLineHeight: toLineHeight,
toTRBL: toTRBL,
toTRBLCorners: toTRBLCorners,
toPadding: toPadding,
toFont: toFont,
resolve: resolve,
PI: PI,
TAU: TAU,
PITAU: PITAU,
INFINITY: INFINITY,
RAD_PER_DEG: RAD_PER_DEG,
HALF_PI: HALF_PI,
QUARTER_PI: QUARTER_PI,
TWO_THIRDS_PI: TWO_THIRDS_PI,
_factorize: _factorize,
log10: log10,
isNumber: isNumber,
almostEquals: almostEquals,
almostWhole: almostWhole,
_setMinAndMaxByKey: _setMinAndMaxByKey,
sign: sign,
toRadians: toRadians,
toDegrees: toDegrees,
_decimalPlaces: _decimalPlaces,
getAngleFromPoint: getAngleFromPoint,
distanceBetweenPoints: distanceBetweenPoints,
_angleDiff: _angleDiff,
_normalizeAngle: _normalizeAngle,
_angleBetween: _angleBetween,
_limitValue: _limitValue,
_int16Range: _int16Range,
getRtlAdapter: getRtlAdapter,
overrideTextDirection: overrideTextDirection,
restoreTextDirection: restoreTextDirection,
_boundSegment: _boundSegment,
_boundSegments: _boundSegments,
_computeSegments: _computeSegments
});

function abstract() {
	throw new Error('This method is not implemented: either no adapter can be found or an incomplete integration was provided.');
}
class DateAdapter {
	constructor(options) {
		this.options = options || {};
	}
	formats() {
		return abstract();
	}
	parse(value, format) {
		return abstract();
	}
	format(timestamp, format) {
		return abstract();
	}
	add(timestamp, amount, unit) {
		return abstract();
	}
	diff(a, b, unit) {
		return abstract();
	}
	startOf(timestamp, unit, weekday) {
		return abstract();
	}
	endOf(timestamp, unit) {
		return abstract();
	}
}
DateAdapter.override = function(members) {
	Object.assign(DateAdapter.prototype, members);
};
var _adapters = {
	_date: DateAdapter
};

function getAllScaleValues(scale) {
	if (!scale._cache.$bar) {
		const metas = scale.getMatchingVisibleMetas('bar');
		let values = [];
		for (let i = 0, ilen = metas.length; i < ilen; i++) {
			values = values.concat(metas[i].controller.getAllParsedValues(scale));
		}
		scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
	}
	return scale._cache.$bar;
}
function computeMinSampleSize(scale) {
	const values = getAllScaleValues(scale);
	let min = scale._length;
	let i, ilen, curr, prev;
	const updateMinAndPrev = () => {
		min = Math.min(min, i && Math.abs(curr - prev) || min);
		prev = curr;
	};
	for (i = 0, ilen = values.length; i < ilen; ++i) {
		curr = scale.getPixelForValue(values[i]);
		updateMinAndPrev();
	}
	for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
		curr = scale.getPixelForTick(i);
		updateMinAndPrev();
	}
	return min;
}
function computeFitCategoryTraits(index, ruler, options, stackCount) {
	const thickness = options.barThickness;
	let size, ratio;
	if (isNullOrUndef(thickness)) {
		size = ruler.min * options.categoryPercentage;
		ratio = options.barPercentage;
	} else {
		size = thickness * stackCount;
		ratio = 1;
	}
	return {
		chunk: size / stackCount,
		ratio,
		start: ruler.pixels[index] - (size / 2)
	};
}
function computeFlexCategoryTraits(index, ruler, options, stackCount) {
	const pixels = ruler.pixels;
	const curr = pixels[index];
	let prev = index > 0 ? pixels[index - 1] : null;
	let next = index < pixels.length - 1 ? pixels[index + 1] : null;
	const percent = options.categoryPercentage;
	if (prev === null) {
		prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
	}
	if (next === null) {
		next = curr + curr - prev;
	}
	const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
	const size = Math.abs(next - prev) / 2 * percent;
	return {
		chunk: size / stackCount,
		ratio: options.barPercentage,
		start
	};
}
function parseFloatBar(entry, item, vScale, i) {
	const startValue = vScale.parse(entry[0], i);
	const endValue = vScale.parse(entry[1], i);
	const min = Math.min(startValue, endValue);
	const max = Math.max(startValue, endValue);
	let barStart = min;
	let barEnd = max;
	if (Math.abs(min) > Math.abs(max)) {
		barStart = max;
		barEnd = min;
	}
	item[vScale.axis] = barEnd;
	item._custom = {
		barStart,
		barEnd,
		start: startValue,
		end: endValue,
		min,
		max
	};
}
function parseValue(entry, item, vScale, i) {
	if (isArray(entry)) {
		parseFloatBar(entry, item, vScale, i);
	} else {
		item[vScale.axis] = vScale.parse(entry, i);
	}
	return item;
}
function parseArrayOrPrimitive(meta, data, start, count) {
	const iScale = meta.iScale;
	const vScale = meta.vScale;
	const labels = iScale.getLabels();
	const singleScale = iScale === vScale;
	const parsed = [];
	let i, ilen, item, entry;
	for (i = start, ilen = start + count; i < ilen; ++i) {
		entry = data[i];
		item = {};
		item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
		parsed.push(parseValue(entry, item, vScale, i));
	}
	return parsed;
}
function isFloatBar(custom) {
	return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
}
class BarController extends DatasetController {
	parsePrimitiveData(meta, data, start, count) {
		return parseArrayOrPrimitive(meta, data, start, count);
	}
	parseArrayData(meta, data, start, count) {
		return parseArrayOrPrimitive(meta, data, start, count);
	}
	parseObjectData(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
		const iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey;
		const vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey;
		const parsed = [];
		let i, ilen, item, obj;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			obj = data[i];
			item = {};
			item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
			parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
		}
		return parsed;
	}
	updateRangeFromParsed(range, scale, parsed, stack) {
		super.updateRangeFromParsed(range, scale, parsed, stack);
		const custom = parsed._custom;
		if (custom && scale === this._cachedMeta.vScale) {
			range.min = Math.min(range.min, custom.min);
			range.max = Math.max(range.max, custom.max);
		}
	}
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {iScale, vScale} = meta;
		const parsed = me.getParsed(index);
		const custom = parsed._custom;
		const value = isFloatBar(custom)
			? '[' + custom.start + ', ' + custom.end + ']'
			: '' + vScale.getLabelForValue(parsed[vScale.axis]);
		return {
			label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
			value
		};
	}
	initialize() {
		const me = this;
		me.enableOptionSharing = true;
		super.initialize();
		const meta = me._cachedMeta;
		meta.stack = me.getDataset().stack;
	}
	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		me.updateElements(meta.data, 0, meta.data.length, mode);
	}
	updateElements(bars, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const vscale = me._cachedMeta.vScale;
		const base = vscale.getBasePixel();
		const horizontal = vscale.isHorizontal();
		const ruler = me._getRuler();
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		me.updateSharedOptions(sharedOptions, mode, firstOpts);
		for (let i = start; i < start + count; i++) {
			const options = sharedOptions || me.resolveDataElementOptions(i, mode);
			const vpixels = me._calculateBarValuePixels(i, options);
			const ipixels = me._calculateBarIndexPixels(i, ruler, options);
			const properties = {
				horizontal,
				base: reset ? base : vpixels.base,
				x: horizontal ? reset ? base : vpixels.head : ipixels.center,
				y: horizontal ? ipixels.center : reset ? base : vpixels.head,
				height: horizontal ? ipixels.size : undefined,
				width: horizontal ? undefined : ipixels.size
			};
			if (includeOptions) {
				properties.options = options;
			}
			me.updateElement(bars[i], i, properties, mode);
		}
	}
	_getStacks(last, dataIndex) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const metasets = iScale.getMatchingVisibleMetas(me._type);
		const stacked = iScale.options.stacked;
		const ilen = metasets.length;
		const stacks = [];
		let i, item;
		for (i = 0; i < ilen; ++i) {
			item = metasets[i];
			if (typeof dataIndex !== 'undefined') {
				const val = item.controller.getParsed(dataIndex)[
					item.controller._cachedMeta.vScale.axis
				];
				if (isNullOrUndef(val) || isNaN(val)) {
					continue;
				}
			}
			if (stacked === false || stacks.indexOf(item.stack) === -1 ||
				(stacked === undefined && item.stack === undefined)) {
				stacks.push(item.stack);
			}
			if (item.index === last) {
				break;
			}
		}
		if (!stacks.length) {
			stacks.push(undefined);
		}
		return stacks;
	}
	_getStackCount(index) {
		return this._getStacks(undefined, index).length;
	}
	_getStackIndex(datasetIndex, name) {
		const stacks = this._getStacks(datasetIndex);
		const index = (name !== undefined)
			? stacks.indexOf(name)
			: -1;
		return (index === -1)
			? stacks.length - 1
			: index;
	}
	_getRuler() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const pixels = [];
		let i, ilen;
		for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
			pixels.push(iScale.getPixelForValue(me.getParsed(i)[iScale.axis], i));
		}
		const min = computeMinSampleSize(iScale);
		return {
			min,
			pixels,
			start: iScale._startPixel,
			end: iScale._endPixel,
			stackCount: me._getStackCount(),
			scale: iScale
		};
	}
	_calculateBarValuePixels(index, options) {
		const me = this;
		const meta = me._cachedMeta;
		const vScale = meta.vScale;
		const {base: baseValue, minBarLength} = options;
		const parsed = me.getParsed(index);
		const custom = parsed._custom;
		const floating = isFloatBar(custom);
		let value = parsed[vScale.axis];
		let start = 0;
		let length = meta._stacked ? me.applyStack(vScale, parsed) : value;
		let head, size;
		if (length !== value) {
			start = length - value;
			length = value;
		}
		if (floating) {
			value = custom.barStart;
			length = custom.barEnd - custom.barStart;
			if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
				start = 0;
			}
			start += value;
		}
		const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
		let base = vScale.getPixelForValue(startValue);
		if (this.chart.getDataVisibility(index)) {
			head = vScale.getPixelForValue(start + length);
		} else {
			head = base;
		}
		size = head - base;
		if (minBarLength !== undefined && Math.abs(size) < minBarLength) {
			size = size < 0 ? -minBarLength : minBarLength;
			if (value === 0) {
				base -= size / 2;
			}
			head = base + size;
		}
		return {
			size,
			base,
			head,
			center: head + size / 2
		};
	}
	_calculateBarIndexPixels(index, ruler, options) {
		const me = this;
		const stackCount = me.chart.options.skipNull ? me._getStackCount(index) : ruler.stackCount;
		const range = options.barThickness === 'flex'
			? computeFlexCategoryTraits(index, ruler, options, stackCount)
			: computeFitCategoryTraits(index, ruler, options, stackCount);
		const stackIndex = me._getStackIndex(me.index, me._cachedMeta.stack);
		const center = range.start + (range.chunk * stackIndex) + (range.chunk / 2);
		const size = Math.min(
			valueOrDefault(options.maxBarThickness, Infinity),
			range.chunk * range.ratio);
		return {
			base: center - size / 2,
			head: center + size / 2,
			center,
			size
		};
	}
	draw() {
		const me = this;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const vScale = meta.vScale;
		const rects = meta.data;
		const ilen = rects.length;
		let i = 0;
		clipArea(chart.ctx, chart.chartArea);
		for (; i < ilen; ++i) {
			if (!isNaN(me.getParsed(i)[vScale.axis])) {
				rects[i].draw(me._ctx);
			}
		}
		unclipArea(chart.ctx);
	}
}
BarController.id = 'bar';
BarController.defaults = {
	datasetElementType: false,
	dataElementType: 'bar',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderSkipped',
		'borderWidth',
		'borderRadius',
		'barPercentage',
		'barThickness',
		'base',
		'categoryPercentage',
		'maxBarThickness',
		'minBarLength',
	],
	interaction: {
		mode: 'index'
	},
	hover: {},
	datasets: {
		categoryPercentage: 0.8,
		barPercentage: 0.9,
		animation: {
			numbers: {
				type: 'number',
				properties: ['x', 'y', 'base', 'width', 'height']
			}
		}
	},
	scales: {
		_index_: {
			type: 'category',
			offset: true,
			gridLines: {
				offsetGridLines: true
			}
		},
		_value_: {
			type: 'linear',
			beginAtZero: true,
		}
	}
};

class BubbleController extends DatasetController {
	initialize() {
		this.enableOptionSharing = true;
		super.initialize();
	}
	parseObjectData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
		const parsed = [];
		let i, ilen, item;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			item = data[i];
			parsed.push({
				x: xScale.parse(resolveObjectKey(item, xAxisKey), i),
				y: yScale.parse(resolveObjectKey(item, yAxisKey), i),
				_custom: item && item.r && +item.r
			});
		}
		return parsed;
	}
	getMaxOverflow() {
		const me = this;
		const meta = me._cachedMeta;
		const data = meta.data;
		let max = 0;
		for (let i = data.length - 1; i >= 0; --i) {
			max = Math.max(max, data[i].size());
		}
		return max > 0 && max;
	}
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {xScale, yScale} = meta;
		const parsed = me.getParsed(index);
		const x = xScale.getLabelForValue(parsed.x);
		const y = yScale.getLabelForValue(parsed.y);
		const r = parsed._custom;
		return {
			label: meta.label,
			value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
		};
	}
	update(mode) {
		const me = this;
		const points = me._cachedMeta.data;
		me.updateElements(points, 0, points.length, mode);
	}
	updateElements(points, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale} = me._cachedMeta;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		for (let i = start; i < start + count; i++) {
			const point = points[i];
			const parsed = !reset && me.getParsed(i);
			const x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(parsed.x);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(parsed.y);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y)
			};
			if (includeOptions) {
				properties.options = me.resolveDataElementOptions(i, mode);
				if (reset) {
					properties.options.radius = 0;
				}
			}
			me.updateElement(point, i, properties, mode);
		}
		me.updateSharedOptions(sharedOptions, mode, firstOpts);
	}
	resolveDataElementOptions(index, mode) {
		const me = this;
		const chart = me.chart;
		const parsed = me.getParsed(index);
		let values = super.resolveDataElementOptions(index, mode);
		const context = me.getContext(index, mode === 'active');
		if (values.$shared) {
			values = Object.assign({}, values, {$shared: false});
		}
		if (mode !== 'active') {
			values.radius = 0;
		}
		values.radius += resolve([
			parsed && parsed._custom,
			me._config.radius,
			chart.options.elements.point.radius
		], context, index);
		return values;
	}
}
BubbleController.id = 'bubble';
BubbleController.defaults = {
	datasetElementType: false,
	dataElementType: 'point',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'hitRadius',
		'radius',
		'pointStyle',
		'rotation'
	],
	animation: {
		numbers: {
			properties: ['x', 'y', 'borderWidth', 'radius']
		}
	},
	scales: {
		x: {
			type: 'linear'
		},
		y: {
			type: 'linear'
		}
	},
	plugins: {
		tooltip: {
			callbacks: {
				title() {
					return '';
				}
			}
		}
	}
};

function getRatioAndOffset(rotation, circumference, cutout) {
	let ratioX = 1;
	let ratioY = 1;
	let offsetX = 0;
	let offsetY = 0;
	if (circumference < TAU) {
		let startAngle = rotation % TAU;
		startAngle += startAngle >= PI ? -TAU : startAngle < -PI ? TAU : 0;
		const endAngle = startAngle + circumference;
		const startX = Math.cos(startAngle);
		const startY = Math.sin(startAngle);
		const endX = Math.cos(endAngle);
		const endY = Math.sin(endAngle);
		const contains0 = (startAngle <= 0 && endAngle >= 0) || endAngle >= TAU;
		const contains90 = (startAngle <= HALF_PI && endAngle >= HALF_PI) || endAngle >= TAU + HALF_PI;
		const contains180 = startAngle === -PI || endAngle >= PI;
		const contains270 = (startAngle <= -HALF_PI && endAngle >= -HALF_PI) || endAngle >= PI + HALF_PI;
		const minX = contains180 ? -1 : Math.min(startX, startX * cutout, endX, endX * cutout);
		const minY = contains270 ? -1 : Math.min(startY, startY * cutout, endY, endY * cutout);
		const maxX = contains0 ? 1 : Math.max(startX, startX * cutout, endX, endX * cutout);
		const maxY = contains90 ? 1 : Math.max(startY, startY * cutout, endY, endY * cutout);
		ratioX = (maxX - minX) / 2;
		ratioY = (maxY - minY) / 2;
		offsetX = -(maxX + minX) / 2;
		offsetY = -(maxY + minY) / 2;
	}
	return {ratioX, ratioY, offsetX, offsetY};
}
class DoughnutController extends DatasetController {
	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
		this.enableOptionSharing = true;
		this.innerRadius = undefined;
		this.outerRadius = undefined;
		this.offsetX = undefined;
		this.offsetY = undefined;
	}
	linkScales() {}
	parse(start, count) {
		const data = this.getDataset().data;
		const meta = this._cachedMeta;
		let i, ilen;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			meta._parsed[i] = +data[i];
		}
	}
	getRingIndex(datasetIndex) {
		let ringIndex = 0;
		for (let j = 0; j < datasetIndex; ++j) {
			if (this.chart.isDatasetVisible(j)) {
				++ringIndex;
			}
		}
		return ringIndex;
	}
	_getRotation() {
		return toRadians(valueOrDefault(this._config.rotation, this.chart.options.rotation) - 90);
	}
	_getCircumference() {
		return toRadians(valueOrDefault(this._config.circumference, this.chart.options.circumference));
	}
	_getRotationExtents() {
		let min = TAU;
		let max = -TAU;
		const me = this;
		for (let i = 0; i < me.chart.data.datasets.length; ++i) {
			if (me.chart.isDatasetVisible(i)) {
				const controller = me.chart.getDatasetMeta(i).controller;
				const rotation = controller._getRotation();
				const circumference = controller._getCircumference();
				min = Math.min(min, rotation);
				max = Math.max(max, rotation + circumference);
			}
		}
		return {
			rotation: min,
			circumference: max - min,
		};
	}
	update(mode) {
		const me = this;
		const chart = me.chart;
		const {chartArea, options} = chart;
		const meta = me._cachedMeta;
		const arcs = meta.data;
		const cutout = options.cutoutPercentage / 100 || 0;
		const chartWeight = me._getRingWeight(me.index);
		const {circumference, rotation} = me._getRotationExtents();
		const {ratioX, ratioY, offsetX, offsetY} = getRatioAndOffset(rotation, circumference, cutout);
		const spacing = me.getMaxBorderWidth() + me.getMaxOffset(arcs);
		const maxWidth = (chartArea.right - chartArea.left - spacing) / ratioX;
		const maxHeight = (chartArea.bottom - chartArea.top - spacing) / ratioY;
		const outerRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
		const innerRadius = Math.max(outerRadius * cutout, 0);
		const radiusLength = (outerRadius - innerRadius) / me._getVisibleDatasetWeightTotal();
		me.offsetX = offsetX * outerRadius;
		me.offsetY = offsetY * outerRadius;
		meta.total = me.calculateTotal();
		me.outerRadius = outerRadius - radiusLength * me._getRingWeightOffset(me.index);
		me.innerRadius = Math.max(me.outerRadius - radiusLength * chartWeight, 0);
		me.updateElements(arcs, 0, arcs.length, mode);
	}
	_circumference(i, reset) {
		const me = this;
		const opts = me.chart.options;
		const meta = me._cachedMeta;
		const circumference = me._getCircumference();
		return reset && opts.animation.animateRotate ? 0 : this.chart.getDataVisibility(i) ? me.calculateCircumference(meta._parsed[i] * circumference / TAU) : 0;
	}
	updateElements(arcs, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		const animationOpts = opts.animation;
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = (chartArea.top + chartArea.bottom) / 2;
		const animateScale = reset && animationOpts.animateScale;
		const innerRadius = animateScale ? 0 : me.innerRadius;
		const outerRadius = animateScale ? 0 : me.outerRadius;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		let startAngle = me._getRotation();
		let i;
		for (i = 0; i < start; ++i) {
			startAngle += me._circumference(i, reset);
		}
		for (i = start; i < start + count; ++i) {
			const circumference = me._circumference(i, reset);
			const arc = arcs[i];
			const properties = {
				x: centerX + me.offsetX,
				y: centerY + me.offsetY,
				startAngle,
				endAngle: startAngle + circumference,
				circumference,
				outerRadius,
				innerRadius
			};
			if (includeOptions) {
				properties.options = sharedOptions || me.resolveDataElementOptions(i, mode);
			}
			startAngle += circumference;
			me.updateElement(arc, i, properties, mode);
		}
		me.updateSharedOptions(sharedOptions, mode, firstOpts);
	}
	calculateTotal() {
		const meta = this._cachedMeta;
		const metaData = meta.data;
		let total = 0;
		let i;
		for (i = 0; i < metaData.length; i++) {
			const value = meta._parsed[i];
			if (!isNaN(value) && this.chart.getDataVisibility(i)) {
				total += Math.abs(value);
			}
		}
		return total;
	}
	calculateCircumference(value) {
		const total = this._cachedMeta.total;
		if (total > 0 && !isNaN(value)) {
			return TAU * (Math.abs(value) / total);
		}
		return 0;
	}
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const chart = me.chart;
		const labels = chart.data.labels || [];
		return {
			label: labels[index] || '',
			value: meta._parsed[index],
		};
	}
	getMaxBorderWidth(arcs) {
		const me = this;
		let max = 0;
		const chart = me.chart;
		let i, ilen, meta, controller, options;
		if (!arcs) {
			for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
				if (chart.isDatasetVisible(i)) {
					meta = chart.getDatasetMeta(i);
					arcs = meta.data;
					controller = meta.controller;
					if (controller !== me) {
						controller.configure();
					}
					break;
				}
			}
		}
		if (!arcs) {
			return 0;
		}
		for (i = 0, ilen = arcs.length; i < ilen; ++i) {
			options = controller.resolveDataElementOptions(i);
			if (options.borderAlign !== 'inner') {
				max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
			}
		}
		return max;
	}
	getMaxOffset(arcs) {
		let max = 0;
		for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
			const options = this.resolveDataElementOptions(i);
			max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
		}
		return max;
	}
	_getRingWeightOffset(datasetIndex) {
		let ringWeightOffset = 0;
		for (let i = 0; i < datasetIndex; ++i) {
			if (this.chart.isDatasetVisible(i)) {
				ringWeightOffset += this._getRingWeight(i);
			}
		}
		return ringWeightOffset;
	}
	_getRingWeight(datasetIndex) {
		return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
	}
	_getVisibleDatasetWeightTotal() {
		return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
	}
}
DoughnutController.id = 'doughnut';
DoughnutController.defaults = {
	datasetElementType: false,
	dataElementType: 'arc',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'borderAlign',
		'offset'
	],
	animation: {
		numbers: {
			type: 'number',
			properties: ['circumference', 'endAngle', 'innerRadius', 'outerRadius', 'startAngle', 'x', 'y', 'offset', 'borderWidth']
		},
		animateRotate: true,
		animateScale: false
	},
	aspectRatio: 1,
	cutoutPercentage: 50,
	rotation: 0,
	circumference: 360,
	plugins: {
		legend: {
			labels: {
				generateLabels(chart) {
					const data = chart.data;
					if (data.labels.length && data.datasets.length) {
						return data.labels.map((label, i) => {
							const meta = chart.getDatasetMeta(0);
							const style = meta.controller.getStyle(i);
							return {
								text: label,
								fillStyle: style.backgroundColor,
								strokeStyle: style.borderColor,
								lineWidth: style.borderWidth,
								hidden: !chart.getDataVisibility(i),
								index: i
							};
						});
					}
					return [];
				}
			},
			onClick(e, legendItem, legend) {
				legend.chart.toggleDataVisibility(legendItem.index);
				legend.chart.update();
			}
		},
		tooltip: {
			callbacks: {
				title() {
					return '';
				},
				label(tooltipItem) {
					let dataLabel = tooltipItem.label;
					const value = ': ' + tooltipItem.formattedValue;
					if (isArray(dataLabel)) {
						dataLabel = dataLabel.slice();
						dataLabel[0] += value;
					} else {
						dataLabel += value;
					}
					return dataLabel;
				}
			}
		}
	}
};

class LineController extends DatasetController {
	initialize() {
		this.enableOptionSharing = true;
		super.initialize();
	}
	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const {dataset: line, data: points = []} = meta;
		const animationsDisabled = me.chart._animationsDisabled;
		let {start, count} = getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
		me._drawStart = start;
		me._drawCount = count;
		if (scaleRangesChanged(meta) && !animationsDisabled) {
			start = 0;
			count = points.length;
		}
		if (mode !== 'resize') {
			const properties = {
				points,
				options: me.resolveDatasetElementOptions()
			};
			me.updateElement(line, undefined, properties, mode);
		}
		me.updateElements(points, start, count, mode);
	}
	updateElements(points, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const {xScale, yScale, _stacked} = me._cachedMeta;
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);
		const spanGaps = valueOrDefault(me._config.spanGaps, me.chart.options.spanGaps);
		const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
		let prevParsed = start > 0 && me.getParsed(start - 1);
		for (let i = start; i < start + count; ++i) {
			const point = points[i];
			const parsed = me.getParsed(i);
			const x = xScale.getPixelForValue(parsed.x, i);
			const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(_stacked ? me.applyStack(yScale, parsed) : parsed.y, i);
			const properties = {
				x,
				y,
				skip: isNaN(x) || isNaN(y),
				stop: i > 0 && (parsed.x - prevParsed.x) > maxGapLength
			};
			if (includeOptions) {
				properties.options = sharedOptions || me.resolveDataElementOptions(i, mode);
			}
			me.updateElement(point, i, properties, mode);
			prevParsed = parsed;
		}
		me.updateSharedOptions(sharedOptions, mode, firstOpts);
	}
	resolveDatasetElementOptions(active) {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const lineOptions = options.elements.line;
		const values = super.resolveDatasetElementOptions(active);
		const showLine = valueOrDefault(config.showLine, options.showLine);
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.tension, lineOptions.tension);
		values.stepped = resolve([config.stepped, lineOptions.stepped]);
		if (!showLine) {
			values.borderWidth = 0;
		}
		return values;
	}
	getMaxOverflow() {
		const me = this;
		const meta = me._cachedMeta;
		const border = meta.dataset.options.borderWidth || 0;
		const data = meta.data || [];
		if (!data.length) {
			return border;
		}
		const firstPoint = data[0].size();
		const lastPoint = data[data.length - 1].size();
		return Math.max(border, firstPoint, lastPoint) / 2;
	}
	draw() {
		this._cachedMeta.dataset.updateControlPoints(this.chart.chartArea);
		super.draw();
	}
}
LineController.id = 'line';
LineController.defaults = {
	datasetElementType: 'line',
	datasetElementOptions: [
		'backgroundColor',
		'borderCapStyle',
		'borderColor',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth',
		'capBezierPoints',
		'cubicInterpolationMode',
		'fill'
	],
	dataElementType: 'point',
	dataElementOptions: {
		backgroundColor: 'pointBackgroundColor',
		borderColor: 'pointBorderColor',
		borderWidth: 'pointBorderWidth',
		hitRadius: 'pointHitRadius',
		hoverHitRadius: 'pointHitRadius',
		hoverBackgroundColor: 'pointHoverBackgroundColor',
		hoverBorderColor: 'pointHoverBorderColor',
		hoverBorderWidth: 'pointHoverBorderWidth',
		hoverRadius: 'pointHoverRadius',
		pointStyle: 'pointStyle',
		radius: 'pointRadius',
		rotation: 'pointRotation'
	},
	showLine: true,
	spanGaps: false,
	interaction: {
		mode: 'index'
	},
	hover: {},
	scales: {
		_index_: {
			type: 'category',
		},
		_value_: {
			type: 'linear',
		},
	}
};
function getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
	const pointCount = points.length;
	let start = 0;
	let count = pointCount;
	if (meta._sorted) {
		const {iScale, _parsed} = meta;
		const axis = iScale.axis;
		const {min, max, minDefined, maxDefined} = iScale.getUserBounds();
		if (minDefined) {
			start = _limitValue(Math.min(
				_lookupByKey(_parsed, iScale.axis, min).lo,
				animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo),
			0, pointCount - 1);
		}
		if (maxDefined) {
			count = _limitValue(Math.max(
				_lookupByKey(_parsed, iScale.axis, max).hi + 1,
				animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max)).hi + 1),
			start, pointCount) - start;
		} else {
			count = pointCount - start;
		}
	}
	return {start, count};
}
function scaleRangesChanged(meta) {
	const {xScale, yScale, _scaleRanges} = meta;
	const newRanges = {
		xmin: xScale.min,
		xmax: xScale.max,
		ymin: yScale.min,
		ymax: yScale.max
	};
	if (!_scaleRanges) {
		meta._scaleRanges = newRanges;
		return true;
	}
	const changed = _scaleRanges.xmin !== xScale.min
		|| _scaleRanges.xmax !== xScale.max
		|| _scaleRanges.ymin !== yScale.min
		|| _scaleRanges.ymax !== yScale.max;
	Object.assign(_scaleRanges, newRanges);
	return changed;
}

function getStartAngleRadians(deg) {
	return toRadians(deg) - 0.5 * PI;
}
class PolarAreaController extends DatasetController {
	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
		this.innerRadius = undefined;
		this.outerRadius = undefined;
	}
	update(mode) {
		const arcs = this._cachedMeta.data;
		this._updateRadius();
		this.updateElements(arcs, 0, arcs.length, mode);
	}
	_updateRadius() {
		const me = this;
		const chart = me.chart;
		const chartArea = chart.chartArea;
		const opts = chart.options;
		const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
		const outerRadius = Math.max(minSize / 2, 0);
		const innerRadius = Math.max(opts.cutoutPercentage ? (outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
		const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
		me.outerRadius = outerRadius - (radiusLength * me.index);
		me.innerRadius = me.outerRadius - radiusLength;
	}
	updateElements(arcs, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const chart = me.chart;
		const dataset = me.getDataset();
		const opts = chart.options;
		const animationOpts = opts.animation;
		const scale = me._cachedMeta.rScale;
		const centerX = scale.xCenter;
		const centerY = scale.yCenter;
		const datasetStartAngle = getStartAngleRadians(opts.startAngle);
		let angle = datasetStartAngle;
		let i;
		me._cachedMeta.count = me.countVisibleElements();
		for (i = 0; i < start; ++i) {
			angle += me._computeAngle(i, mode);
		}
		for (i = start; i < start + count; i++) {
			const arc = arcs[i];
			let startAngle = angle;
			let endAngle = angle + me._computeAngle(i, mode);
			let outerRadius = this.chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(dataset.data[i]) : 0;
			angle = endAngle;
			if (reset) {
				if (animationOpts.animateScale) {
					outerRadius = 0;
				}
				if (animationOpts.animateRotate) {
					startAngle = datasetStartAngle;
					endAngle = datasetStartAngle;
				}
			}
			const properties = {
				x: centerX,
				y: centerY,
				innerRadius: 0,
				outerRadius,
				startAngle,
				endAngle,
				options: me.resolveDataElementOptions(i, mode)
			};
			me.updateElement(arc, i, properties, mode);
		}
	}
	countVisibleElements() {
		const dataset = this.getDataset();
		const meta = this._cachedMeta;
		let count = 0;
		meta.data.forEach((element, index) => {
			if (!isNaN(dataset.data[index]) && this.chart.getDataVisibility(index)) {
				count++;
			}
		});
		return count;
	}
	_computeAngle(index, mode) {
		const me = this;
		const meta = me._cachedMeta;
		const count = meta.count;
		const dataset = me.getDataset();
		if (isNaN(dataset.data[index]) || !this.chart.getDataVisibility(index)) {
			return 0;
		}
		const context = me.getContext(index, mode === 'active');
		return toRadians(resolve([
			me.chart.options.elements.arc.angle,
			360 / count
		], context, index));
	}
}
PolarAreaController.id = 'polarArea';
PolarAreaController.defaults = {
	dataElementType: 'arc',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'borderAlign',
		'offset'
	],
	animation: {
		numbers: {
			type: 'number',
			properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
		},
		animateRotate: true,
		animateScale: true
	},
	aspectRatio: 1,
	datasets: {
		indexAxis: 'r'
	},
	scales: {
		r: {
			type: 'radialLinear',
			angleLines: {
				display: false
			},
			beginAtZero: true,
			gridLines: {
				circular: true
			},
			pointLabels: {
				display: false
			}
		}
	},
	startAngle: 0,
	plugins: {
		legend: {
			labels: {
				generateLabels(chart) {
					const data = chart.data;
					if (data.labels.length && data.datasets.length) {
						return data.labels.map((label, i) => {
							const meta = chart.getDatasetMeta(0);
							const style = meta.controller.getStyle(i);
							return {
								text: label,
								fillStyle: style.backgroundColor,
								strokeStyle: style.borderColor,
								lineWidth: style.borderWidth,
								hidden: !chart.getDataVisibility(i),
								index: i
							};
						});
					}
					return [];
				}
			},
			onClick(e, legendItem, legend) {
				legend.chart.toggleDataVisibility(legendItem.index);
				legend.chart.update();
			}
		},
		tooltip: {
			callbacks: {
				title() {
					return '';
				},
				label(context) {
					return context.chart.data.labels[context.dataIndex] + ': ' + context.formattedValue;
				}
			}
		}
	}
};

class PieController extends DoughnutController {
}
PieController.id = 'pie';
PieController.defaults = {
	cutoutPercentage: 0
};

class RadarController extends DatasetController {
	getLabelAndValue(index) {
		const me = this;
		const vScale = me._cachedMeta.vScale;
		const parsed = me.getParsed(index);
		return {
			label: vScale.getLabels()[index],
			value: '' + vScale.getLabelForValue(parsed[vScale.axis])
		};
	}
	update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];
		const labels = meta.iScale.getLabels();
		if (mode !== 'resize') {
			const properties = {
				points,
				_loop: true,
				_fullLoop: labels.length === points.length,
				options: me.resolveDatasetElementOptions()
			};
			me.updateElement(line, undefined, properties, mode);
		}
		me.updateElements(points, 0, points.length, mode);
	}
	updateElements(points, start, count, mode) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me._cachedMeta.rScale;
		const reset = mode === 'reset';
		for (let i = start; i < start + count; i++) {
			const point = points[i];
			const options = me.resolveDataElementOptions(i, mode);
			const pointPosition = scale.getPointPositionForValue(i, dataset.data[i]);
			const x = reset ? scale.xCenter : pointPosition.x;
			const y = reset ? scale.yCenter : pointPosition.y;
			const properties = {
				x,
				y,
				angle: pointPosition.angle,
				skip: isNaN(x) || isNaN(y),
				options
			};
			me.updateElement(point, i, properties, mode);
		}
	}
	resolveDatasetElementOptions(active) {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const values = super.resolveDatasetElementOptions(active);
		const showLine = valueOrDefault(config.showLine, options.showLine);
		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.tension, options.elements.line.tension);
		if (!showLine) {
			values.borderWidth = 0;
		}
		return values;
	}
}
RadarController.id = 'radar';
RadarController.defaults = {
	datasetElementType: 'line',
	datasetElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderCapStyle',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth',
		'fill'
	],
	dataElementType: 'point',
	dataElementOptions: {
		backgroundColor: 'pointBackgroundColor',
		borderColor: 'pointBorderColor',
		borderWidth: 'pointBorderWidth',
		hitRadius: 'pointHitRadius',
		hoverBackgroundColor: 'pointHoverBackgroundColor',
		hoverBorderColor: 'pointHoverBorderColor',
		hoverBorderWidth: 'pointHoverBorderWidth',
		hoverRadius: 'pointHoverRadius',
		pointStyle: 'pointStyle',
		radius: 'pointRadius',
		rotation: 'pointRotation'
	},
	aspectRatio: 1,
	spanGaps: false,
	scales: {
		r: {
			type: 'radialLinear',
		}
	},
	datasets: {
		indexAxis: 'r'
	},
	elements: {
		line: {
			fill: 'start',
			tension: 0
		}
	}
};

class ScatterController extends LineController {
}
ScatterController.id = 'scatter';
ScatterController.defaults = {
	scales: {
		x: {
			type: 'linear'
		},
		y: {
			type: 'linear'
		}
	},
	datasets: {
		showLine: false,
		fill: false
	},
	plugins: {
		tooltip: {
			callbacks: {
				title() {
					return '';
				},
				label(item) {
					return '(' + item.label + ', ' + item.formattedValue + ')';
				}
			}
		}
	}
};

var controllers = /*#__PURE__*/Object.freeze({
__proto__: null,
BarController: BarController,
BubbleController: BubbleController,
DoughnutController: DoughnutController,
LineController: LineController,
PolarAreaController: PolarAreaController,
PieController: PieController,
RadarController: RadarController,
ScatterController: ScatterController
});

function clipArc(ctx, element) {
	const {startAngle, endAngle, pixelMargin, x, y, outerRadius, innerRadius} = element;
	let angleMargin = pixelMargin / outerRadius;
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	if (innerRadius > pixelMargin) {
		angleMargin = pixelMargin / innerRadius;
		ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
	} else {
		ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
	}
	ctx.closePath();
	ctx.clip();
}
function pathArc(ctx, element) {
	const {x, y, startAngle, endAngle, pixelMargin} = element;
	const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
	const innerRadius = element.innerRadius + pixelMargin;
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, endAngle);
	ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
	ctx.closePath();
}
function drawArc(ctx, element) {
	if (element.fullCircles) {
		element.endAngle = element.startAngle + TAU;
		pathArc(ctx, element);
		for (let i = 0; i < element.fullCircles; ++i) {
			ctx.fill();
		}
		element.endAngle = element.startAngle + element.circumference % TAU;
	}
	pathArc(ctx, element);
	ctx.fill();
}
function drawFullCircleBorders(ctx, element, inner) {
	const {x, y, startAngle, endAngle, pixelMargin} = element;
	const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
	const innerRadius = element.innerRadius + pixelMargin;
	let i;
	if (inner) {
		element.endAngle = element.startAngle + TAU;
		clipArc(ctx, element);
		element.endAngle = endAngle;
		if (element.endAngle === element.startAngle) {
			element.endAngle += TAU;
			element.fullCircles--;
		}
	}
	ctx.beginPath();
	ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true);
	for (i = 0; i < element.fullCircles; ++i) {
		ctx.stroke();
	}
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU);
	for (i = 0; i < element.fullCircles; ++i) {
		ctx.stroke();
	}
}
function drawBorder(ctx, element) {
	const {x, y, startAngle, endAngle, pixelMargin, options} = element;
	const outerRadius = element.outerRadius;
	const innerRadius = element.innerRadius + pixelMargin;
	const inner = options.borderAlign === 'inner';
	if (!options.borderWidth) {
		return;
	}
	if (inner) {
		ctx.lineWidth = options.borderWidth * 2;
		ctx.lineJoin = 'round';
	} else {
		ctx.lineWidth = options.borderWidth;
		ctx.lineJoin = 'bevel';
	}
	if (element.fullCircles) {
		drawFullCircleBorders(ctx, element, inner);
	}
	if (inner) {
		clipArc(ctx, element);
	}
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, endAngle);
	ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
	ctx.closePath();
	ctx.stroke();
}
class ArcElement extends Element {
	constructor(cfg) {
		super();
		this.options = undefined;
		this.circumference = undefined;
		this.startAngle = undefined;
		this.endAngle = undefined;
		this.innerRadius = undefined;
		this.outerRadius = undefined;
		this.pixelMargin = 0;
		this.fullCircles = 0;
		if (cfg) {
			Object.assign(this, cfg);
		}
	}
	inRange(chartX, chartY, useFinalPosition) {
		const point = this.getProps(['x', 'y'], useFinalPosition);
		const {angle, distance} = getAngleFromPoint(point, {x: chartX, y: chartY});
		const {startAngle, endAngle, innerRadius, outerRadius, circumference} = this.getProps([
			'startAngle',
			'endAngle',
			'innerRadius',
			'outerRadius',
			'circumference'
		], useFinalPosition);
		const betweenAngles = circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
		const withinRadius = (distance >= innerRadius && distance <= outerRadius);
		return (betweenAngles && withinRadius);
	}
	getCenterPoint(useFinalPosition) {
		const {x, y, startAngle, endAngle, innerRadius, outerRadius} = this.getProps([
			'x',
			'y',
			'startAngle',
			'endAngle',
			'innerRadius',
			'outerRadius'
		], useFinalPosition);
		const halfAngle = (startAngle + endAngle) / 2;
		const halfRadius = (innerRadius + outerRadius) / 2;
		return {
			x: x + Math.cos(halfAngle) * halfRadius,
			y: y + Math.sin(halfAngle) * halfRadius
		};
	}
	tooltipPosition(useFinalPosition) {
		return this.getCenterPoint(useFinalPosition);
	}
	draw(ctx) {
		const me = this;
		const options = me.options;
		const offset = options.offset || 0;
		me.pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
		me.fullCircles = Math.floor(me.circumference / TAU);
		if (me.circumference === 0) {
			return;
		}
		ctx.save();
		if (offset && me.circumference < TAU) {
			const halfAngle = (me.startAngle + me.endAngle) / 2;
			ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
		}
		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;
		drawArc(ctx, me);
		drawBorder(ctx, me);
		ctx.restore();
	}
}
ArcElement.id = 'arc';
ArcElement.defaults = {
	borderAlign: 'center',
	borderColor: '#fff',
	borderWidth: 2,
	offset: 0
};
ArcElement.defaultRoutes = {
	backgroundColor: 'backgroundColor'
};

function setStyle(ctx, vm) {
	ctx.lineCap = vm.borderCapStyle;
	ctx.setLineDash(vm.borderDash);
	ctx.lineDashOffset = vm.borderDashOffset;
	ctx.lineJoin = vm.borderJoinStyle;
	ctx.lineWidth = vm.borderWidth;
	ctx.strokeStyle = vm.borderColor;
}
function lineTo(ctx, previous, target) {
	ctx.lineTo(target.x, target.y);
}
function getLineMethod(options) {
	if (options.stepped) {
		return _steppedLineTo;
	}
	if (options.tension) {
		return _bezierCurveTo;
	}
	return lineTo;
}
function pathVars(points, segment, params) {
	params = params || {};
	const count = points.length;
	const start = Math.max(params.start || 0, segment.start);
	const end = Math.min(params.end || count - 1, segment.end);
	return {
		count,
		start,
		loop: segment.loop,
		ilen: end < start ? count + end - start : end - start
	};
}
function pathSegment(ctx, line, segment, params) {
	const {points, options} = line;
	const {count, start, loop, ilen} = pathVars(points, segment, params);
	const lineMethod = getLineMethod(options);
	let {move = true, reverse} = params || {};
	let i, point, prev;
	for (i = 0; i <= ilen; ++i) {
		point = points[(start + (reverse ? ilen - i : i)) % count];
		if (point.skip) {
			continue;
		} else if (move) {
			ctx.moveTo(point.x, point.y);
			move = false;
		} else {
			lineMethod(ctx, prev, point, reverse, options.stepped);
		}
		prev = point;
	}
	if (loop) {
		point = points[(start + (reverse ? ilen : 0)) % count];
		lineMethod(ctx, prev, point, reverse, options.stepped);
	}
	return !!loop;
}
function fastPathSegment(ctx, line, segment, params) {
	const points = line.points;
	const {count, start, ilen} = pathVars(points, segment, params);
	const {move = true, reverse} = params || {};
	let avgX = 0;
	let countX = 0;
	let i, point, prevX, minY, maxY, lastY;
	const pointIndex = (index) => (start + (reverse ? ilen - index : index)) % count;
	const drawX = () => {
		if (minY !== maxY) {
			ctx.lineTo(avgX, maxY);
			ctx.lineTo(avgX, minY);
			ctx.lineTo(avgX, lastY);
		}
	};
	if (move) {
		point = points[pointIndex(0)];
		ctx.moveTo(point.x, point.y);
	}
	for (i = 0; i <= ilen; ++i) {
		point = points[pointIndex(i)];
		if (point.skip) {
			continue;
		}
		const x = point.x;
		const y = point.y;
		const truncX = x | 0;
		if (truncX === prevX) {
			if (y < minY) {
				minY = y;
			} else if (y > maxY) {
				maxY = y;
			}
			avgX = (countX * avgX + x) / ++countX;
		} else {
			drawX();
			ctx.lineTo(x, y);
			prevX = truncX;
			countX = 0;
			minY = maxY = y;
		}
		lastY = y;
	}
	drawX();
}
function _getSegmentMethod(line) {
	const opts = line.options;
	const borderDash = opts.borderDash && opts.borderDash.length;
	const useFastPath = !line._loop && !opts.tension && !opts.stepped && !borderDash;
	return useFastPath ? fastPathSegment : pathSegment;
}
function _getInterpolationMethod(options) {
	if (options.stepped) {
		return _steppedInterpolation;
	}
	if (options.tension) {
		return _bezierInterpolation;
	}
	return _pointInLine;
}
class LineElement extends Element {
	constructor(cfg) {
		super();
		this.options = undefined;
		this._loop = undefined;
		this._fullLoop = undefined;
		this._points = undefined;
		this._segments = undefined;
		this._pointsUpdated = false;
		if (cfg) {
			Object.assign(this, cfg);
		}
	}
	updateControlPoints(chartArea) {
		const me = this;
		const options = me.options;
		if (options.tension && !options.stepped && !me._pointsUpdated) {
			const loop = options.spanGaps ? me._loop : me._fullLoop;
			_updateBezierControlPoints(me._points, options, chartArea, loop);
			me._pointsUpdated = true;
		}
	}
	set points(points) {
		this._points = points;
		delete this._segments;
	}
	get points() {
		return this._points;
	}
	get segments() {
		return this._segments || (this._segments = _computeSegments(this));
	}
	first() {
		const segments = this.segments;
		const points = this.points;
		return segments.length && points[segments[0].start];
	}
	last() {
		const segments = this.segments;
		const points = this.points;
		const count = segments.length;
		return count && points[segments[count - 1].end];
	}
	interpolate(point, property) {
		const me = this;
		const options = me.options;
		const value = point[property];
		const points = me.points;
		const segments = _boundSegments(me, {property, start: value, end: value});
		if (!segments.length) {
			return;
		}
		const result = [];
		const _interpolate = _getInterpolationMethod(options);
		let i, ilen;
		for (i = 0, ilen = segments.length; i < ilen; ++i) {
			const {start, end} = segments[i];
			const p1 = points[start];
			const p2 = points[end];
			if (p1 === p2) {
				result.push(p1);
				continue;
			}
			const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
			const interpolated = _interpolate(p1, p2, t, options.stepped);
			interpolated[property] = point[property];
			result.push(interpolated);
		}
		return result.length === 1 ? result[0] : result;
	}
	pathSegment(ctx, segment, params) {
		const segmentMethod = _getSegmentMethod(this);
		return segmentMethod(ctx, this, segment, params);
	}
	path(ctx, start, count) {
		const me = this;
		const segments = me.segments;
		const ilen = segments.length;
		const segmentMethod = _getSegmentMethod(me);
		let loop = me._loop;
		start = start || 0;
		count = count || (me.points.length - start);
		for (let i = 0; i < ilen; ++i) {
			loop &= segmentMethod(ctx, me, segments[i], {start, end: start + count - 1});
		}
		return !!loop;
	}
	draw(ctx, chartArea, start, count) {
		const options = this.options || {};
		const points = this.points || [];
		if (!points.length || !options.borderWidth) {
			return;
		}
		ctx.save();
		setStyle(ctx, options);
		ctx.beginPath();
		if (this.path(ctx, start, count)) {
			ctx.closePath();
		}
		ctx.stroke();
		ctx.restore();
		this._pointsUpdated = false;
	}
}
LineElement.id = 'line';
LineElement.defaults = {
	borderCapStyle: 'butt',
	borderDash: [],
	borderDashOffset: 0,
	borderJoinStyle: 'miter',
	borderWidth: 3,
	capBezierPoints: true,
	fill: false,
	tension: 0
};
LineElement.defaultRoutes = {
	backgroundColor: 'backgroundColor',
	borderColor: 'borderColor'
};

class PointElement extends Element {
	constructor(cfg) {
		super();
		this.options = undefined;
		this.skip = undefined;
		this.stop = undefined;
		if (cfg) {
			Object.assign(this, cfg);
		}
	}
	inRange(mouseX, mouseY, useFinalPosition) {
		const options = this.options;
		const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
		return ((Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)) < Math.pow(options.hitRadius + options.radius, 2));
	}
	inXRange(mouseX, useFinalPosition) {
		const options = this.options;
		const {x} = this.getProps(['x'], useFinalPosition);
		return (Math.abs(mouseX - x) < options.radius + options.hitRadius);
	}
	inYRange(mouseY, useFinalPosition) {
		const options = this.options;
		const {y} = this.getProps(['x'], useFinalPosition);
		return (Math.abs(mouseY - y) < options.radius + options.hitRadius);
	}
	getCenterPoint(useFinalPosition) {
		const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
		return {x, y};
	}
	size() {
		const options = this.options || {};
		const radius = Math.max(options.radius, options.hoverRadius) || 0;
		const borderWidth = radius && options.borderWidth || 0;
		return (radius + borderWidth) * 2;
	}
	draw(ctx) {
		const me = this;
		const options = me.options;
		if (me.skip || options.radius <= 0) {
			return;
		}
		ctx.strokeStyle = options.borderColor;
		ctx.lineWidth = options.borderWidth;
		ctx.fillStyle = options.backgroundColor;
		drawPoint(ctx, options, me.x, me.y);
	}
	getRange() {
		const options = this.options || {};
		return options.radius + options.hitRadius;
	}
}
PointElement.id = 'point';
PointElement.defaults = {
	borderWidth: 1,
	hitRadius: 1,
	hoverBorderWidth: 1,
	hoverRadius: 4,
	pointStyle: 'circle',
	radius: 3
};
PointElement.defaultRoutes = {
	backgroundColor: 'backgroundColor',
	borderColor: 'borderColor'
};

function getBarBounds(bar, useFinalPosition) {
	const {x, y, base, width, height} = bar.getProps(['x', 'y', 'base', 'width', 'height'], useFinalPosition);
	let left, right, top, bottom, half;
	if (bar.horizontal) {
		half = height / 2;
		left = Math.min(x, base);
		right = Math.max(x, base);
		top = y - half;
		bottom = y + half;
	} else {
		half = width / 2;
		left = x - half;
		right = x + half;
		top = Math.min(y, base);
		bottom = Math.max(y, base);
	}
	return {left, top, right, bottom};
}
function parseBorderSkipped(bar) {
	let edge = bar.options.borderSkipped;
	const res = {};
	if (!edge) {
		return res;
	}
	edge = bar.horizontal
		? parseEdge(edge, 'left', 'right', bar.base > bar.x)
		: parseEdge(edge, 'bottom', 'top', bar.base < bar.y);
	res[edge] = true;
	return res;
}
function parseEdge(edge, a, b, reverse) {
	if (reverse) {
		edge = swap(edge, a, b);
		edge = startEnd(edge, b, a);
	} else {
		edge = startEnd(edge, a, b);
	}
	return edge;
}
function swap(orig, v1, v2) {
	return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
function startEnd(v, start, end) {
	return v === 'start' ? start : v === 'end' ? end : v;
}
function skipOrLimit(skip, value, min, max) {
	return skip ? 0 : Math.max(Math.min(value, max), min);
}
function parseBorderWidth(bar, maxW, maxH) {
	const value = bar.options.borderWidth;
	const skip = parseBorderSkipped(bar);
	const o = toTRBL(value);
	return {
		t: skipOrLimit(skip.top, o.top, 0, maxH),
		r: skipOrLimit(skip.right, o.right, 0, maxW),
		b: skipOrLimit(skip.bottom, o.bottom, 0, maxH),
		l: skipOrLimit(skip.left, o.left, 0, maxW)
	};
}
function parseBorderRadius(bar, maxW, maxH) {
	const value = bar.options.borderRadius;
	const o = toTRBLCorners(value);
	const maxR = Math.min(maxW, maxH);
	const skip = parseBorderSkipped(bar);
	return {
		topLeft: skipOrLimit(skip.top || skip.left, o.topLeft, 0, maxR),
		topRight: skipOrLimit(skip.top || skip.right, o.topRight, 0, maxR),
		bottomLeft: skipOrLimit(skip.bottom || skip.left, o.bottomLeft, 0, maxR),
		bottomRight: skipOrLimit(skip.bottom || skip.right, o.bottomRight, 0, maxR)
	};
}
function boundingRects(bar) {
	const bounds = getBarBounds(bar);
	const width = bounds.right - bounds.left;
	const height = bounds.bottom - bounds.top;
	const border = parseBorderWidth(bar, width / 2, height / 2);
	const radius = parseBorderRadius(bar, width / 2, height / 2);
	return {
		outer: {
			x: bounds.left,
			y: bounds.top,
			w: width,
			h: height,
			radius
		},
		inner: {
			x: bounds.left + border.l,
			y: bounds.top + border.t,
			w: width - border.l - border.r,
			h: height - border.t - border.b,
			radius: {
				topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
				topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
				bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
				bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)),
			}
		}
	};
}
function inRange(bar, x, y, useFinalPosition) {
	const skipX = x === null;
	const skipY = y === null;
	const skipBoth = skipX && skipY;
	const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
	return bounds
		&& (skipX || x >= bounds.left && x <= bounds.right)
		&& (skipY || y >= bounds.top && y <= bounds.bottom);
}
function hasRadius(radius) {
	return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
function addRoundedRectPath(ctx, rect) {
	const {x, y, w, h, radius} = rect;
	ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, -HALF_PI, PI, true);
	ctx.lineTo(x, y + h - radius.bottomLeft);
	ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
	ctx.lineTo(x + w - radius.bottomRight, y + h);
	ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
	ctx.lineTo(x + w, y + radius.topRight);
	ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
	ctx.lineTo(x + radius.topLeft, y);
}
function addNormalRectPath(ctx, rect) {
	ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
class BarElement extends Element {
	constructor(cfg) {
		super();
		this.options = undefined;
		this.horizontal = undefined;
		this.base = undefined;
		this.width = undefined;
		this.height = undefined;
		if (cfg) {
			Object.assign(this, cfg);
		}
	}
	draw(ctx) {
		const options = this.options;
		const {inner, outer} = boundingRects(this);
		const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
		ctx.save();
		if (outer.w !== inner.w || outer.h !== inner.h) {
			ctx.beginPath();
			addRectPath(ctx, outer);
			ctx.clip();
			addRectPath(ctx, inner);
			ctx.fillStyle = options.borderColor;
			ctx.fill('evenodd');
		}
		ctx.beginPath();
		addRectPath(ctx, inner);
		ctx.fillStyle = options.backgroundColor;
		ctx.fill();
		ctx.restore();
	}
	inRange(mouseX, mouseY, useFinalPosition) {
		return inRange(this, mouseX, mouseY, useFinalPosition);
	}
	inXRange(mouseX, useFinalPosition) {
		return inRange(this, mouseX, null, useFinalPosition);
	}
	inYRange(mouseY, useFinalPosition) {
		return inRange(this, null, mouseY, useFinalPosition);
	}
	getCenterPoint(useFinalPosition) {
		const {x, y, base, horizontal} = this.getProps(['x', 'y', 'base', 'horizontal'], useFinalPosition);
		return {
			x: horizontal ? (x + base) / 2 : x,
			y: horizontal ? y : (y + base) / 2
		};
	}
	getRange(axis) {
		return axis === 'x' ? this.width / 2 : this.height / 2;
	}
}
BarElement.id = 'bar';
BarElement.defaults = {
	borderSkipped: 'start',
	borderWidth: 0,
	borderRadius: 0
};
BarElement.defaultRoutes = {
	backgroundColor: 'backgroundColor',
	borderColor: 'borderColor'
};

var elements = /*#__PURE__*/Object.freeze({
__proto__: null,
ArcElement: ArcElement,
LineElement: LineElement,
PointElement: PointElement,
BarElement: BarElement
});

function getLineByIndex(chart, index) {
	const meta = chart.getDatasetMeta(index);
	const visible = meta && chart.isDatasetVisible(index);
	return visible ? meta.dataset : null;
}
function parseFillOption(line) {
	const options = line.options;
	const fillOption = options.fill;
	let fill = valueOrDefault(fillOption && fillOption.target, fillOption);
	if (fill === undefined) {
		fill = !!options.backgroundColor;
	}
	if (fill === false || fill === null) {
		return false;
	}
	if (fill === true) {
		return 'origin';
	}
	return fill;
}
function decodeFill(line, index, count) {
	const fill = parseFillOption(line);
	if (isObject(fill)) {
		return isNaN(fill.value) ? false : fill;
	}
	let target = parseFloat(fill);
	if (isNumberFinite(target) && Math.floor(target) === target) {
		if (fill[0] === '-' || fill[0] === '+') {
			target = index + target;
		}
		if (target === index || target < 0 || target >= count) {
			return false;
		}
		return target;
	}
	return ['origin', 'start', 'end', 'stack'].indexOf(fill) >= 0 && fill;
}
function computeLinearBoundary(source) {
	const {scale = {}, fill} = source;
	let target = null;
	let horizontal;
	if (fill === 'start') {
		target = scale.bottom;
	} else if (fill === 'end') {
		target = scale.top;
	} else if (isObject(fill)) {
		target = scale.getPixelForValue(fill.value);
	} else if (scale.getBasePixel) {
		target = scale.getBasePixel();
	}
	if (isNumberFinite(target)) {
		horizontal = scale.isHorizontal();
		return {
			x: horizontal ? target : null,
			y: horizontal ? null : target
		};
	}
	return null;
}
class simpleArc {
	constructor(opts) {
		this.x = opts.x;
		this.y = opts.y;
		this.radius = opts.radius;
	}
	pathSegment(ctx, bounds, opts) {
		const {x, y, radius} = this;
		bounds = bounds || {start: 0, end: TAU};
		if (opts.reverse) {
			ctx.arc(x, y, radius, bounds.end, bounds.start, true);
		} else {
			ctx.arc(x, y, radius, bounds.start, bounds.end);
		}
		return !opts.bounds;
	}
	interpolate(point, property) {
		const {x, y, radius} = this;
		const angle = point.angle;
		if (property === 'angle') {
			return {
				x: x + Math.cos(angle) * radius,
				y: y + Math.sin(angle) * radius,
				angle
			};
		}
	}
}
function computeCircularBoundary(source) {
	const {scale, fill} = source;
	const options = scale.options;
	const length = scale.getLabels().length;
	const target = [];
	const start = options.reverse ? scale.max : scale.min;
	const end = options.reverse ? scale.min : scale.max;
	let i, center, value;
	if (fill === 'start') {
		value = start;
	} else if (fill === 'end') {
		value = end;
	} else if (isObject(fill)) {
		value = fill.value;
	} else {
		value = scale.getBaseValue();
	}
	if (options.gridLines.circular) {
		center = scale.getPointPositionForValue(0, start);
		return new simpleArc({
			x: center.x,
			y: center.y,
			radius: scale.getDistanceFromCenterForValue(value)
		});
	}
	for (i = 0; i < length; ++i) {
		target.push(scale.getPointPositionForValue(i, value));
	}
	return target;
}
function computeBoundary(source) {
	const scale = source.scale || {};
	if (scale.getPointPositionForValue) {
		return computeCircularBoundary(source);
	}
	return computeLinearBoundary(source);
}
function pointsFromSegments(boundary, line) {
	const {x = null, y = null} = boundary || {};
	const linePoints = line.points;
	const points = [];
	line.segments.forEach((segment) => {
		const first = linePoints[segment.start];
		const last = linePoints[segment.end];
		if (y !== null) {
			points.push({x: first.x, y});
			points.push({x: last.x, y});
		} else if (x !== null) {
			points.push({x, y: first.y});
			points.push({x, y: last.y});
		}
	});
	return points;
}
function buildStackLine(source) {
	const {chart, scale, index, line} = source;
	const points = [];
	const segments = line.segments;
	const sourcePoints = line.points;
	const linesBelow = getLinesBelow(chart, index);
	linesBelow.push(createBoundaryLine({x: null, y: scale.bottom}, line));
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		for (let j = segment.start; j <= segment.end; j++) {
			addPointsBelow(points, sourcePoints[j], linesBelow);
		}
	}
	return new LineElement({points, options: {}});
}
const isLineAndNotInHideAnimation = (meta) => meta.type === 'line' && !meta.hidden;
function getLinesBelow(chart, index) {
	const below = [];
	const metas = chart.getSortedVisibleDatasetMetas();
	for (let i = 0; i < metas.length; i++) {
		const meta = metas[i];
		if (meta.index === index) {
			break;
		}
		if (isLineAndNotInHideAnimation(meta)) {
			below.unshift(meta.dataset);
		}
	}
	return below;
}
function addPointsBelow(points, sourcePoint, linesBelow) {
	const postponed = [];
	for (let j = 0; j < linesBelow.length; j++) {
		const line = linesBelow[j];
		const {first, last, point} = findPoint(line, sourcePoint, 'x');
		if (!point || (first && last)) {
			continue;
		}
		if (first) {
			postponed.unshift(point);
		} else {
			points.push(point);
			if (!last) {
				break;
			}
		}
	}
	points.push(...postponed);
}
function findPoint(line, sourcePoint, property) {
	const point = line.interpolate(sourcePoint, property);
	if (!point) {
		return {};
	}
	const pointValue = point[property];
	const segments = line.segments;
	const linePoints = line.points;
	let first = false;
	let last = false;
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const firstValue = linePoints[segment.start][property];
		const lastValue = linePoints[segment.end][property];
		if (pointValue >= firstValue && pointValue <= lastValue) {
			first = pointValue === firstValue;
			last = pointValue === lastValue;
			break;
		}
	}
	return {first, last, point};
}
function getTarget(source) {
	const {chart, fill, line} = source;
	if (isNumberFinite(fill)) {
		return getLineByIndex(chart, fill);
	}
	if (fill === 'stack') {
		return buildStackLine(source);
	}
	const boundary = computeBoundary(source);
	if (boundary instanceof simpleArc) {
		return boundary;
	}
	return createBoundaryLine(boundary, line);
}
function createBoundaryLine(boundary, line) {
	let points = [];
	let _loop = false;
	if (isArray(boundary)) {
		_loop = true;
		points = boundary;
	} else {
		points = pointsFromSegments(boundary, line);
	}
	return points.length ? new LineElement({
		points,
		options: {tension: 0},
		_loop,
		_fullLoop: _loop
	}) : null;
}
function resolveTarget(sources, index, propagate) {
	const source = sources[index];
	let fill = source.fill;
	const visited = [index];
	let target;
	if (!propagate) {
		return fill;
	}
	while (fill !== false && visited.indexOf(fill) === -1) {
		if (!isNumberFinite(fill)) {
			return fill;
		}
		target = sources[fill];
		if (!target) {
			return false;
		}
		if (target.visible) {
			return fill;
		}
		visited.push(fill);
		fill = target.fill;
	}
	return false;
}
function _clip(ctx, target, clipY) {
	ctx.beginPath();
	target.path(ctx);
	ctx.lineTo(target.last().x, clipY);
	ctx.lineTo(target.first().x, clipY);
	ctx.closePath();
	ctx.clip();
}
function getBounds(property, first, last, loop) {
	if (loop) {
		return;
	}
	let start = first[property];
	let end = last[property];
	if (property === 'angle') {
		start = _normalizeAngle(start);
		end = _normalizeAngle(end);
	}
	return {property, start, end};
}
function _getEdge(a, b, prop, fn) {
	if (a && b) {
		return fn(a[prop], b[prop]);
	}
	return a ? a[prop] : b ? b[prop] : 0;
}
function _segments(line, target, property) {
	const segments = line.segments;
	const points = line.points;
	const tpoints = target.points;
	const parts = [];
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const bounds = getBounds(property, points[segment.start], points[segment.end], segment.loop);
		if (!target.segments) {
			parts.push({
				source: segment,
				target: bounds,
				start: points[segment.start],
				end: points[segment.end]
			});
			continue;
		}
		const subs = _boundSegments(target, bounds);
		for (let j = 0; j < subs.length; ++j) {
			const sub = subs[j];
			const subBounds = getBounds(property, tpoints[sub.start], tpoints[sub.end], sub.loop);
			const fillSources = _boundSegment(segment, points, subBounds);
			for (let k = 0; k < fillSources.length; k++) {
				parts.push({
					source: fillSources[k],
					target: sub,
					start: {
						[property]: _getEdge(bounds, subBounds, 'start', Math.max)
					},
					end: {
						[property]: _getEdge(bounds, subBounds, 'end', Math.min)
					}
				});
			}
		}
	}
	return parts;
}
function clipBounds(ctx, scale, bounds) {
	const {top, bottom} = scale.chart.chartArea;
	const {property, start, end} = bounds || {};
	if (property === 'x') {
		ctx.beginPath();
		ctx.rect(start, top, end - start, bottom - top);
		ctx.clip();
	}
}
function interpolatedLineTo(ctx, target, point, property) {
	const interpolatedPoint = target.interpolate(point, property);
	if (interpolatedPoint) {
		ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
	}
}
function _fill(ctx, cfg) {
	const {line, target, property, color, scale} = cfg;
	const segments = _segments(line, target, property);
	ctx.fillStyle = color;
	for (let i = 0, ilen = segments.length; i < ilen; ++i) {
		const {source: src, target: tgt, start, end} = segments[i];
		ctx.save();
		clipBounds(ctx, scale, getBounds(property, start, end));
		ctx.beginPath();
		const lineLoop = !!line.pathSegment(ctx, src);
		if (lineLoop) {
			ctx.closePath();
		} else {
			interpolatedLineTo(ctx, target, end, property);
		}
		const targetLoop = !!target.pathSegment(ctx, tgt, {move: lineLoop, reverse: true});
		const loop = lineLoop && targetLoop;
		if (!loop) {
			interpolatedLineTo(ctx, target, start, property);
		}
		ctx.closePath();
		ctx.fill(loop ? 'evenodd' : 'nonzero');
		ctx.restore();
	}
}
function doFill(ctx, cfg) {
	const {line, target, above, below, area, scale} = cfg;
	const property = line._loop ? 'angle' : 'x';
	ctx.save();
	if (property === 'x' && below !== above) {
		_clip(ctx, target, area.top);
		_fill(ctx, {line, target, color: above, scale, property});
		ctx.restore();
		ctx.save();
		_clip(ctx, target, area.bottom);
	}
	_fill(ctx, {line, target, color: below, scale, property});
	ctx.restore();
}
var plugin_filler = {
	id: 'filler',
	afterDatasetsUpdate(chart, _args, options) {
		const count = (chart.data.datasets || []).length;
		const propagate = options.propagate;
		const sources = [];
		let meta, i, line, source;
		for (i = 0; i < count; ++i) {
			meta = chart.getDatasetMeta(i);
			line = meta.dataset;
			source = null;
			if (line && line.options && line instanceof LineElement) {
				source = {
					visible: chart.isDatasetVisible(i),
					index: i,
					fill: decodeFill(line, i, count),
					chart,
					scale: meta.vScale,
					line
				};
			}
			meta.$filler = source;
			sources.push(source);
		}
		for (i = 0; i < count; ++i) {
			source = sources[i];
			if (!source || source.fill === false) {
				continue;
			}
			source.fill = resolveTarget(sources, i, propagate);
		}
	},
	beforeDatasetsDraw(chart) {
		const metasets = chart.getSortedVisibleDatasetMetas();
		const area = chart.chartArea;
		let i, meta;
		for (i = metasets.length - 1; i >= 0; --i) {
			meta = metasets[i].$filler;
			if (meta) {
				meta.line.updateControlPoints(area);
			}
		}
	},
	beforeDatasetDraw(chart, args) {
		const area = chart.chartArea;
		const ctx = chart.ctx;
		const source = args.meta.$filler;
		if (!source || source.fill === false) {
			return;
		}
		const target = getTarget(source);
		const {line, scale} = source;
		const lineOpts = line.options;
		const fillOption = lineOpts.fill;
		const color = lineOpts.backgroundColor;
		const {above = color, below = color} = fillOption || {};
		if (target && line.points.length) {
			clipArea(ctx, area);
			doFill(ctx, {line, target, above, below, area, scale});
			unclipArea(ctx);
		}
	},
	defaults: {
		propagate: true
	}
};

function getBoxWidth(labelOpts, fontSize) {
	const {boxWidth} = labelOpts;
	return (labelOpts.usePointStyle && boxWidth > fontSize) || isNullOrUndef(boxWidth) ?
		fontSize :
		boxWidth;
}
function getBoxHeight(labelOpts, fontSize) {
	const {boxHeight} = labelOpts;
	return (labelOpts.usePointStyle && boxHeight > fontSize) || isNullOrUndef(boxHeight) ?
		fontSize :
		boxHeight;
}
class Legend extends Element {
	constructor(config) {
		super();
		Object.assign(this, config);
		this.legendHitBoxes = [];
		this._hoveredItem = null;
		this.doughnutMode = false;
		this.chart = config.chart;
		this.options = config.options;
		this.ctx = config.ctx;
		this.legendItems = undefined;
		this.columnWidths = undefined;
		this.columnHeights = undefined;
		this.lineWidths = undefined;
		this._minSize = undefined;
		this.maxHeight = undefined;
		this.maxWidth = undefined;
		this.top = undefined;
		this.bottom = undefined;
		this.left = undefined;
		this.right = undefined;
		this.height = undefined;
		this.width = undefined;
		this._margins = undefined;
		this.paddingTop = undefined;
		this.paddingBottom = undefined;
		this.paddingLeft = undefined;
		this.paddingRight = undefined;
		this.position = undefined;
		this.weight = undefined;
		this.fullWidth = undefined;
	}
	beforeUpdate() {}
	update(maxWidth, maxHeight, margins) {
		const me = this;
		me.beforeUpdate();
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me._margins = margins;
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();
		me.beforeBuildLabels();
		me.buildLabels();
		me.afterBuildLabels();
		me.beforeFit();
		me.fit();
		me.afterFit();
		me.afterUpdate();
	}
	afterUpdate() {}
	beforeSetDimensions() {}
	setDimensions() {
		const me = this;
		if (me.isHorizontal()) {
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;
			me.top = 0;
			me.bottom = me.height;
		}
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;
		me._minSize = {
			width: 0,
			height: 0
		};
	}
	afterSetDimensions() {}
	beforeBuildLabels() {}
	buildLabels() {
		const me = this;
		const labelOpts = me.options.labels || {};
		let legendItems = callback(labelOpts.generateLabels, [me.chart], me) || [];
		if (labelOpts.filter) {
			legendItems = legendItems.filter((item) => labelOpts.filter(item, me.chart.data));
		}
		if (labelOpts.sort) {
			legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, me.chart.data));
		}
		if (me.options.reverse) {
			legendItems.reverse();
		}
		me.legendItems = legendItems;
	}
	afterBuildLabels() {}
	beforeFit() {}
	fit() {
		const me = this;
		const opts = me.options;
		const labelOpts = opts.labels;
		const display = opts.display;
		const ctx = me.ctx;
		const labelFont = toFont(labelOpts.font, me.chart.options.font);
		const fontSize = labelFont.size;
		const boxWidth = getBoxWidth(labelOpts, fontSize);
		const boxHeight = getBoxHeight(labelOpts, fontSize);
		const itemHeight = Math.max(boxHeight, fontSize);
		const hitboxes = me.legendHitBoxes = [];
		const minSize = me._minSize;
		const isHorizontal = me.isHorizontal();
		const titleHeight = me._computeTitleHeight();
		if (isHorizontal) {
			minSize.width = me.maxWidth;
			minSize.height = display ? 10 : 0;
		} else {
			minSize.width = display ? 10 : 0;
			minSize.height = me.maxHeight;
		}
		if (!display) {
			me.width = minSize.width = me.height = minSize.height = 0;
			return;
		}
		ctx.font = labelFont.string;
		if (isHorizontal) {
			const lineWidths = me.lineWidths = [0];
			let totalHeight = titleHeight;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			me.legendItems.forEach((legendItem, i) => {
				const width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;
				if (i === 0 || lineWidths[lineWidths.length - 1] + width + 2 * labelOpts.padding > minSize.width) {
					totalHeight += itemHeight + labelOpts.padding;
					lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
				}
				hitboxes[i] = {
					left: 0,
					top: 0,
					width,
					height: itemHeight
				};
				lineWidths[lineWidths.length - 1] += width + labelOpts.padding;
			});
			minSize.height += totalHeight;
		} else {
			const vPadding = labelOpts.padding;
			const columnWidths = me.columnWidths = [];
			const columnHeights = me.columnHeights = [];
			let totalWidth = labelOpts.padding;
			let currentColWidth = 0;
			let currentColHeight = 0;
			const heightLimit = minSize.height - titleHeight;
			me.legendItems.forEach((legendItem, i) => {
				const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;
				if (i > 0 && currentColHeight + fontSize + 2 * vPadding > heightLimit) {
					totalWidth += currentColWidth + labelOpts.padding;
					columnWidths.push(currentColWidth);
					columnHeights.push(currentColHeight);
					currentColWidth = 0;
					currentColHeight = 0;
				}
				currentColWidth = Math.max(currentColWidth, itemWidth);
				currentColHeight += fontSize + vPadding;
				hitboxes[i] = {
					left: 0,
					top: 0,
					width: itemWidth,
					height: itemHeight,
				};
			});
			totalWidth += currentColWidth;
			columnWidths.push(currentColWidth);
			columnHeights.push(currentColHeight);
			minSize.width += totalWidth;
		}
		me.width = Math.min(minSize.width, opts.maxWidth || INFINITY);
		me.height = Math.min(minSize.height, opts.maxHeight || INFINITY);
	}
	afterFit() {}
	isHorizontal() {
		return this.options.position === 'top' || this.options.position === 'bottom';
	}
	draw() {
		const me = this;
		const opts = me.options;
		const labelOpts = opts.labels;
		const defaultColor = defaults.color;
		const legendHeight = me.height;
		const columnHeights = me.columnHeights;
		const legendWidth = me.width;
		const lineWidths = me.lineWidths;
		if (!opts.display) {
			return;
		}
		me.drawTitle();
		const rtlHelper = getRtlAdapter(opts.rtl, me.left, me._minSize.width);
		const ctx = me.ctx;
		const labelFont = toFont(labelOpts.font, me.chart.options.font);
		const fontColor = labelOpts.color;
		const fontSize = labelFont.size;
		let cursor;
		ctx.textAlign = rtlHelper.textAlign('left');
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = fontColor;
		ctx.fillStyle = fontColor;
		ctx.font = labelFont.string;
		const boxWidth = getBoxWidth(labelOpts, fontSize);
		const boxHeight = getBoxHeight(labelOpts, fontSize);
		const height = Math.max(fontSize, boxHeight);
		const hitboxes = me.legendHitBoxes;
		const drawLegendBox = function(x, y, legendItem) {
			if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
				return;
			}
			ctx.save();
			const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
			ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
			ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt');
			ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
			ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter');
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
			ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
			if (labelOpts && labelOpts.usePointStyle) {
				const drawOptions = {
					radius: boxWidth * Math.SQRT2 / 2,
					pointStyle: legendItem.pointStyle,
					rotation: legendItem.rotation,
					borderWidth: lineWidth
				};
				const centerX = rtlHelper.xPlus(x, boxWidth / 2);
				const centerY = y + fontSize / 2;
				drawPoint(ctx, drawOptions, centerX, centerY);
			} else {
				const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
				ctx.fillRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
				if (lineWidth !== 0) {
					ctx.strokeRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
				}
			}
			ctx.restore();
		};
		const fillText = function(x, y, legendItem, textWidth) {
			const halfFontSize = fontSize / 2;
			const xLeft = rtlHelper.xPlus(x, boxWidth + halfFontSize);
			const yMiddle = y + (height / 2);
			ctx.fillText(legendItem.text, xLeft, yMiddle);
			if (legendItem.hidden) {
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.moveTo(xLeft, yMiddle);
				ctx.lineTo(rtlHelper.xPlus(xLeft, textWidth), yMiddle);
				ctx.stroke();
			}
		};
		const alignmentOffset = function(dimension, blockSize) {
			switch (opts.align) {
			case 'start':
				return labelOpts.padding;
			case 'end':
				return dimension - blockSize;
			default:
				return (dimension - blockSize + labelOpts.padding) / 2;
			}
		};
		const isHorizontal = me.isHorizontal();
		const titleHeight = this._computeTitleHeight();
		if (isHorizontal) {
			cursor = {
				x: me.left + alignmentOffset(legendWidth, lineWidths[0]),
				y: me.top + labelOpts.padding + titleHeight,
				line: 0
			};
		} else {
			cursor = {
				x: me.left + labelOpts.padding,
				y: me.top + alignmentOffset(legendHeight, columnHeights[0]) + titleHeight,
				line: 0
			};
		}
		overrideTextDirection(me.ctx, opts.textDirection);
		const itemHeight = height + labelOpts.padding;
		me.legendItems.forEach((legendItem, i) => {
			const textWidth = ctx.measureText(legendItem.text).width;
			const width = boxWidth + (fontSize / 2) + textWidth;
			let x = cursor.x;
			let y = cursor.y;
			rtlHelper.setWidth(me._minSize.width);
			if (isHorizontal) {
				if (i > 0 && x + width + labelOpts.padding > me.left + me._minSize.width) {
					y = cursor.y += itemHeight;
					cursor.line++;
					x = cursor.x = me.left + alignmentOffset(legendWidth, lineWidths[cursor.line]);
				}
			} else if (i > 0 && y + itemHeight > me.top + me._minSize.height) {
				x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
				cursor.line++;
				y = cursor.y = me.top + alignmentOffset(legendHeight, columnHeights[cursor.line]);
			}
			const realX = rtlHelper.x(x);
			drawLegendBox(realX, y, legendItem);
			hitboxes[i].left = rtlHelper.leftForLtr(realX, hitboxes[i].width);
			hitboxes[i].top = y;
			fillText(realX, y, legendItem, textWidth);
			if (isHorizontal) {
				cursor.x += width + labelOpts.padding;
			} else {
				cursor.y += itemHeight;
			}
		});
		restoreTextDirection(me.ctx, opts.textDirection);
	}
	drawTitle() {
		const me = this;
		const opts = me.options;
		const titleOpts = opts.title;
		const titleFont = toFont(titleOpts.font, me.chart.options.font);
		const titlePadding = toPadding(titleOpts.padding);
		if (!titleOpts.display) {
			return;
		}
		const rtlHelper = getRtlAdapter(opts.rtl, me.left, me._minSize.width);
		const ctx = me.ctx;
		const position = titleOpts.position;
		let x, textAlign;
		const halfFontSize = titleFont.size / 2;
		let y = me.top + titlePadding.top + halfFontSize;
		let left = me.left;
		let maxWidth = me.width;
		if (this.isHorizontal()) {
			maxWidth = Math.max(...me.lineWidths);
			switch (opts.align) {
			case 'start':
				break;
			case 'end':
				left = me.right - maxWidth;
				break;
			default:
				left = ((me.left + me.right) / 2) - (maxWidth / 2);
				break;
			}
		} else {
			const maxHeight = Math.max(...me.columnHeights);
			switch (opts.align) {
			case 'start':
				break;
			case 'end':
				y += me.height - maxHeight;
				break;
			default:
				y += (me.height - maxHeight) / 2;
				break;
			}
		}
		switch (position) {
		case 'start':
			x = left;
			textAlign = 'left';
			break;
		case 'end':
			x = left + maxWidth;
			textAlign = 'right';
			break;
		default:
			x = left + (maxWidth / 2);
			textAlign = 'center';
			break;
		}
		ctx.textAlign = rtlHelper.textAlign(textAlign);
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = titleOpts.color;
		ctx.fillStyle = titleOpts.color;
		ctx.font = titleFont.string;
		ctx.fillText(titleOpts.text, x, y);
	}
	_computeTitleHeight() {
		const titleOpts = this.options.title;
		const titleFont = toFont(titleOpts.font, this.chart.options.font);
		const titlePadding = toPadding(titleOpts.padding);
		return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
	}
	_getLegendItemAt(x, y) {
		const me = this;
		let i, hitBox, lh;
		if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
			lh = me.legendHitBoxes;
			for (i = 0; i < lh.length; ++i) {
				hitBox = lh[i];
				if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
					return me.legendItems[i];
				}
			}
		}
		return null;
	}
	handleEvent(e) {
		const me = this;
		const opts = me.options;
		const type = e.type === 'mouseup' ? 'click' : e.type;
		if (type === 'mousemove') {
			if (!opts.onHover && !opts.onLeave) {
				return;
			}
		} else if (type === 'click') {
			if (!opts.onClick) {
				return;
			}
		} else {
			return;
		}
		const hoveredItem = me._getLegendItemAt(e.x, e.y);
		if (type === 'click') {
			if (hoveredItem) {
				callback(opts.onClick, [e, hoveredItem, me], me);
			}
		} else {
			if (opts.onLeave && hoveredItem !== me._hoveredItem) {
				if (me._hoveredItem) {
					callback(opts.onLeave, [e, me._hoveredItem, me], me);
				}
				me._hoveredItem = hoveredItem;
			}
			if (hoveredItem) {
				callback(opts.onHover, [e, hoveredItem, me], me);
			}
		}
	}
}
function resolveOptions(options) {
	return options !== false && merge(Object.create(null), [defaults.plugins.legend, options]);
}
function createNewLegendAndAttach(chart, legendOpts) {
	const legend = new Legend({
		ctx: chart.ctx,
		options: legendOpts,
		chart
	});
	layouts.configure(chart, legend, legendOpts);
	layouts.addBox(chart, legend);
	chart.legend = legend;
}
var plugin_legend = {
	id: 'legend',
	_element: Legend,
	start(chart) {
		const legendOpts = resolveOptions(chart.options.plugins.legend);
		createNewLegendAndAttach(chart, legendOpts);
	},
	stop(chart) {
		layouts.removeBox(chart, chart.legend);
		delete chart.legend;
	},
	beforeUpdate(chart) {
		const legendOpts = resolveOptions(chart.options.plugins.legend);
		const legend = chart.legend;
		if (legendOpts) {
			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},
	afterUpdate(chart) {
		if (chart.legend) {
			chart.legend.buildLabels();
		}
	},
	afterEvent(chart, args) {
		const legend = chart.legend;
		if (legend) {
			legend.handleEvent(args.event);
		}
	},
	defaults: {
		display: true,
		position: 'top',
		align: 'center',
		fullWidth: true,
		reverse: false,
		weight: 1000,
		onClick(e, legendItem, legend) {
			const index = legendItem.datasetIndex;
			const ci = legend.chart;
			if (ci.isDatasetVisible(index)) {
				ci.hide(index);
				legendItem.hidden = true;
			} else {
				ci.show(index);
				legendItem.hidden = false;
			}
		},
		onHover: null,
		onLeave: null,
		labels: {
			boxWidth: 40,
			padding: 10,
			generateLabels(chart) {
				const datasets = chart.data.datasets;
				const {labels} = chart.legend.options;
				const usePointStyle = labels.usePointStyle;
				const overrideStyle = labels.pointStyle;
				return chart._getSortedDatasetMetas().map((meta) => {
					const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
					const borderWidth = isObject(style.borderWidth) ? (valueOrDefault(style.borderWidth.top, 0) + valueOrDefault(style.borderWidth.left, 0) + valueOrDefault(style.borderWidth.bottom, 0) + valueOrDefault(style.borderWidth.right, 0)) / 4 : style.borderWidth;
					return {
						text: datasets[meta.index].label,
						fillStyle: style.backgroundColor,
						hidden: !meta.visible,
						lineCap: style.borderCapStyle,
						lineDash: style.borderDash,
						lineDashOffset: style.borderDashOffset,
						lineJoin: style.borderJoinStyle,
						lineWidth: borderWidth,
						strokeStyle: style.borderColor,
						pointStyle: overrideStyle || style.pointStyle,
						rotation: style.rotation,
						datasetIndex: meta.index
					};
				}, this);
			}
		},
		title: {
			display: false,
			position: 'center',
			text: '',
		}
	}
};

const toLeftRightCenter = (align) => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
const alignStartEnd = (align, start, end) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
class Title extends Element {
	constructor(config) {
		super();
		Object.assign(this, config);
		this.chart = config.chart;
		this.options = config.options;
		this.ctx = config.ctx;
		this._margins = undefined;
		this._padding = undefined;
		this.top = undefined;
		this.bottom = undefined;
		this.left = undefined;
		this.right = undefined;
		this.width = undefined;
		this.height = undefined;
		this.maxWidth = undefined;
		this.maxHeight = undefined;
		this.position = undefined;
		this.weight = undefined;
		this.fullWidth = undefined;
	}
	update(maxWidth, maxHeight, margins) {
		const me = this;
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me._margins = margins;
		me.setDimensions();
		me.fit();
	}
	setDimensions() {
		const me = this;
		if (me.isHorizontal()) {
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;
			me.top = 0;
			me.bottom = me.height;
		}
	}
	fit() {
		const me = this;
		const opts = me.options;
		const minSize = {};
		const isHorizontal = me.isHorizontal();
		if (!opts.display) {
			me.width = minSize.width = me.height = minSize.height = 0;
			return;
		}
		const lineCount = isArray(opts.text) ? opts.text.length : 1;
		me._padding = toPadding(opts.padding);
		const textSize = lineCount * toFont(opts.font, me.chart.options.font).lineHeight + me._padding.height;
		me.width = minSize.width = isHorizontal ? me.maxWidth : textSize;
		me.height = minSize.height = isHorizontal ? textSize : me.maxHeight;
	}
	isHorizontal() {
		const pos = this.options.position;
		return pos === 'top' || pos === 'bottom';
	}
	_drawArgs(offset) {
		const {top, left, bottom, right, options} = this;
		const align = options.align;
		let rotation = 0;
		let maxWidth, titleX, titleY;
		if (this.isHorizontal()) {
			titleX = alignStartEnd(align, left, right);
			titleY = top + offset;
			maxWidth = right - left;
		} else {
			if (options.position === 'left') {
				titleX = left + offset;
				titleY = alignStartEnd(align, bottom, top);
				rotation = PI * -0.5;
			} else {
				titleX = right - offset;
				titleY = alignStartEnd(align, top, bottom);
				rotation = PI * 0.5;
			}
			maxWidth = bottom - top;
		}
		return {titleX, titleY, maxWidth, rotation};
	}
	draw() {
		const me = this;
		const ctx = me.ctx;
		const opts = me.options;
		if (!opts.display) {
			return;
		}
		const fontOpts = toFont(opts.font, me.chart.options.font);
		const lineHeight = fontOpts.lineHeight;
		const offset = lineHeight / 2 + me._padding.top;
		const {titleX, titleY, maxWidth, rotation} = me._drawArgs(offset);
		ctx.save();
		ctx.fillStyle = opts.color;
		ctx.font = fontOpts.string;
		ctx.translate(titleX, titleY);
		ctx.rotate(rotation);
		ctx.textAlign = toLeftRightCenter(opts.align);
		ctx.textBaseline = 'middle';
		const text = opts.text;
		if (isArray(text)) {
			let y = 0;
			for (let i = 0; i < text.length; ++i) {
				ctx.fillText(text[i], 0, y, maxWidth);
				y += lineHeight;
			}
		} else {
			ctx.fillText(text, 0, 0, maxWidth);
		}
		ctx.restore();
	}
}
function createTitle(chart, titleOpts) {
	const title = new Title({
		ctx: chart.ctx,
		options: titleOpts,
		chart
	});
	layouts.configure(chart, title, titleOpts);
	layouts.addBox(chart, title);
	chart.titleBlock = title;
}
function removeTitle(chart) {
	const title = chart.titleBlock;
	if (title) {
		layouts.removeBox(chart, title);
		delete chart.titleBlock;
	}
}
function createOrUpdateTitle(chart, options) {
	const title = chart.titleBlock;
	if (title) {
		layouts.configure(chart, title, options);
		title.options = options;
	} else {
		createTitle(chart, options);
	}
}
var plugin_title = {
	id: 'title',
	_element: Title,
	start(chart, _args, options) {
		createTitle(chart, options);
	},
	stop(chart) {
		const titleBlock = chart.titleBlock;
		layouts.removeBox(chart, titleBlock);
		delete chart.titleBlock;
	},
	beforeUpdate(chart, _args, options) {
		if (options === false) {
			removeTitle(chart);
		} else {
			createOrUpdateTitle(chart, options);
		}
	},
	defaults: {
		align: 'center',
		display: false,
		font: {
			style: 'bold',
		},
		fullWidth: true,
		padding: 10,
		position: 'top',
		text: '',
		weight: 2000
	},
	defaultRoutes: {
		color: 'color'
	}
};

const positioners = {
	average(items) {
		if (!items.length) {
			return false;
		}
		let i, len;
		let x = 0;
		let y = 0;
		let count = 0;
		for (i = 0, len = items.length; i < len; ++i) {
			const el = items[i].element;
			if (el && el.hasValue()) {
				const pos = el.tooltipPosition();
				x += pos.x;
				y += pos.y;
				++count;
			}
		}
		return {
			x: x / count,
			y: y / count
		};
	},
	nearest(items, eventPosition) {
		let x = eventPosition.x;
		let y = eventPosition.y;
		let minDistance = Number.POSITIVE_INFINITY;
		let i, len, nearestElement;
		for (i = 0, len = items.length; i < len; ++i) {
			const el = items[i].element;
			if (el && el.hasValue()) {
				const center = el.getCenterPoint();
				const d = distanceBetweenPoints(eventPosition, center);
				if (d < minDistance) {
					minDistance = d;
					nearestElement = el;
				}
			}
		}
		if (nearestElement) {
			const tp = nearestElement.tooltipPosition();
			x = tp.x;
			y = tp.y;
		}
		return {
			x,
			y
		};
	}
};
function pushOrConcat(base, toPush) {
	if (toPush) {
		if (isArray(toPush)) {
			Array.prototype.push.apply(base, toPush);
		} else {
			base.push(toPush);
		}
	}
	return base;
}
function splitNewlines(str) {
	if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
		return str.split('\n');
	}
	return str;
}
function createTooltipItem(chart, item) {
	const {element, datasetIndex, index} = item;
	const controller = chart.getDatasetMeta(datasetIndex).controller;
	const {label, value} = controller.getLabelAndValue(index);
	return {
		chart,
		label,
		dataPoint: controller.getParsed(index),
		formattedValue: value,
		dataset: controller.getDataset(),
		dataIndex: index,
		datasetIndex,
		element
	};
}
function resolveOptions$1(options, fallbackFont) {
	options = merge(Object.create(null), [defaults.plugins.tooltip, options]);
	options.bodyFont = toFont(options.bodyFont, fallbackFont);
	options.titleFont = toFont(options.titleFont, fallbackFont);
	options.footerFont = toFont(options.footerFont, fallbackFont);
	options.boxHeight = valueOrDefault(options.boxHeight, options.bodyFont.size);
	options.boxWidth = valueOrDefault(options.boxWidth, options.bodyFont.size);
	return options;
}
function getTooltipSize(tooltip) {
	const ctx = tooltip._chart.ctx;
	const {body, footer, options, title} = tooltip;
	const {bodyFont, footerFont, titleFont, boxWidth, boxHeight} = options;
	const titleLineCount = title.length;
	const footerLineCount = footer.length;
	const bodyLineItemCount = body.length;
	let height = options.yPadding * 2;
	let width = 0;
	let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
	combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
	if (titleLineCount) {
		height += titleLineCount * titleFont.size
			+ (titleLineCount - 1) * options.titleSpacing
			+ options.titleMarginBottom;
	}
	if (combinedBodyLength) {
		const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.size) : bodyFont.size;
		height += bodyLineItemCount * bodyLineHeight
			+ (combinedBodyLength - bodyLineItemCount) * bodyFont.size
			+ (combinedBodyLength - 1) * options.bodySpacing;
	}
	if (footerLineCount) {
		height += options.footerMarginTop
			+ footerLineCount * footerFont.size
			+ (footerLineCount - 1) * options.footerSpacing;
	}
	let widthPadding = 0;
	const maxLineWidth = function(line) {
		width = Math.max(width, ctx.measureText(line).width + widthPadding);
	};
	ctx.save();
	ctx.font = titleFont.string;
	each(tooltip.title, maxLineWidth);
	ctx.font = bodyFont.string;
	each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
	widthPadding = options.displayColors ? (boxWidth + 2) : 0;
	each(body, (bodyItem) => {
		each(bodyItem.before, maxLineWidth);
		each(bodyItem.lines, maxLineWidth);
		each(bodyItem.after, maxLineWidth);
	});
	widthPadding = 0;
	ctx.font = footerFont.string;
	each(tooltip.footer, maxLineWidth);
	ctx.restore();
	width += 2 * options.xPadding;
	return {width, height};
}
function determineAlignment(chart, options, size) {
	const {x, y, width, height} = size;
	const chartArea = chart.chartArea;
	let xAlign = 'center';
	let yAlign = 'center';
	if (y < height / 2) {
		yAlign = 'top';
	} else if (y > (chart.height - height / 2)) {
		yAlign = 'bottom';
	}
	let lf, rf;
	const midX = (chartArea.left + chartArea.right) / 2;
	const midY = (chartArea.top + chartArea.bottom) / 2;
	if (yAlign === 'center') {
		lf = (value) => value <= midX;
		rf = (value) => value > midX;
	} else {
		lf = (value) => value <= (width / 2);
		rf = (value) => value >= (chart.width - (width / 2));
	}
	const olf = (value) => value + width + options.caretSize + options.caretPadding > chart.width;
	const orf = (value) => value - width - options.caretSize - options.caretPadding < 0;
	const yf = (value) => value <= midY ? 'top' : 'bottom';
	if (lf(x)) {
		xAlign = 'left';
		if (olf(x)) {
			xAlign = 'center';
			yAlign = yf(y);
		}
	} else if (rf(x)) {
		xAlign = 'right';
		if (orf(x)) {
			xAlign = 'center';
			yAlign = yf(y);
		}
	}
	return {
		xAlign: options.xAlign ? options.xAlign : xAlign,
		yAlign: options.yAlign ? options.yAlign : yAlign
	};
}
function alignX(size, xAlign, chartWidth) {
	let {x, width} = size;
	if (xAlign === 'right') {
		x -= width;
	} else if (xAlign === 'center') {
		x -= (width / 2);
		if (x + width > chartWidth) {
			x = chartWidth - width;
		}
		if (x < 0) {
			x = 0;
		}
	}
	return x;
}
function alignY(size, yAlign, paddingAndSize) {
	let {y, height} = size;
	if (yAlign === 'top') {
		y += paddingAndSize;
	} else if (yAlign === 'bottom') {
		y -= height + paddingAndSize;
	} else {
		y -= (height / 2);
	}
	return y;
}
function getBackgroundPoint(options, size, alignment, chart) {
	const {caretSize, caretPadding, cornerRadius} = options;
	const {xAlign, yAlign} = alignment;
	const paddingAndSize = caretSize + caretPadding;
	const radiusAndPadding = cornerRadius + caretPadding;
	let x = alignX(size, xAlign, chart.width);
	const y = alignY(size, yAlign, paddingAndSize);
	if (yAlign === 'center') {
		if (xAlign === 'left') {
			x += paddingAndSize;
		} else if (xAlign === 'right') {
			x -= paddingAndSize;
		}
	} else if (xAlign === 'left') {
		x -= radiusAndPadding;
	} else if (xAlign === 'right') {
		x += radiusAndPadding;
	}
	return {x, y};
}
function getAlignedX(tooltip, align) {
	const options = tooltip.options;
	return align === 'center'
		? tooltip.x + tooltip.width / 2
		: align === 'right'
			? tooltip.x + tooltip.width - options.xPadding
			: tooltip.x + options.xPadding;
}
function getBeforeAfterBodyLines(callback) {
	return pushOrConcat([], splitNewlines(callback));
}
class Tooltip extends Element {
	constructor(config) {
		super();
		this.opacity = 0;
		this._active = [];
		this._chart = config._chart;
		this._eventPosition = undefined;
		this._size = undefined;
		this._cachedAnimations = undefined;
		this.$animations = undefined;
		this.options = undefined;
		this.dataPoints = undefined;
		this.title = undefined;
		this.beforeBody = undefined;
		this.body = undefined;
		this.afterBody = undefined;
		this.footer = undefined;
		this.xAlign = undefined;
		this.yAlign = undefined;
		this.x = undefined;
		this.y = undefined;
		this.height = undefined;
		this.width = undefined;
		this.caretX = undefined;
		this.caretY = undefined;
		this.labelColors = undefined;
		this.labelPointStyles = undefined;
		this.labelTextColors = undefined;
		this.initialize();
	}
	initialize() {
		const me = this;
		const chartOpts = me._chart.options;
		me.options = resolveOptions$1(chartOpts.plugins.tooltip, chartOpts.font);
		me._cachedAnimations = undefined;
	}
	_resolveAnimations() {
		const me = this;
		const cached = me._cachedAnimations;
		if (cached) {
			return cached;
		}
		const chart = me._chart;
		const options = me.options;
		const opts = options.enabled && chart.options.animation && options.animation;
		const animations = new Animations(me._chart, opts);
		me._cachedAnimations = Object.freeze(animations);
		return animations;
	}
	getTitle(context) {
		const me = this;
		const opts = me.options;
		const callbacks = opts.callbacks;
		const beforeTitle = callbacks.beforeTitle.apply(me, [context]);
		const title = callbacks.title.apply(me, [context]);
		const afterTitle = callbacks.afterTitle.apply(me, [context]);
		let lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeTitle));
		lines = pushOrConcat(lines, splitNewlines(title));
		lines = pushOrConcat(lines, splitNewlines(afterTitle));
		return lines;
	}
	getBeforeBody(tooltipItems) {
		return getBeforeAfterBodyLines(this.options.callbacks.beforeBody.apply(this, [tooltipItems]));
	}
	getBody(tooltipItems) {
		const me = this;
		const callbacks = me.options.callbacks;
		const bodyItems = [];
		each(tooltipItems, (context) => {
			const bodyItem = {
				before: [],
				lines: [],
				after: []
			};
			pushOrConcat(bodyItem.before, splitNewlines(callbacks.beforeLabel.call(me, context)));
			pushOrConcat(bodyItem.lines, callbacks.label.call(me, context));
			pushOrConcat(bodyItem.after, splitNewlines(callbacks.afterLabel.call(me, context)));
			bodyItems.push(bodyItem);
		});
		return bodyItems;
	}
	getAfterBody(tooltipItems) {
		return getBeforeAfterBodyLines(this.options.callbacks.afterBody.apply(this, [tooltipItems]));
	}
	getFooter(tooltipItems) {
		const me = this;
		const callbacks = me.options.callbacks;
		const beforeFooter = callbacks.beforeFooter.apply(me, [tooltipItems]);
		const footer = callbacks.footer.apply(me, [tooltipItems]);
		const afterFooter = callbacks.afterFooter.apply(me, [tooltipItems]);
		let lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeFooter));
		lines = pushOrConcat(lines, splitNewlines(footer));
		lines = pushOrConcat(lines, splitNewlines(afterFooter));
		return lines;
	}
	_createItems() {
		const me = this;
		const active = me._active;
		const options = me.options;
		const data = me._chart.data;
		const labelColors = [];
		const labelPointStyles = [];
		const labelTextColors = [];
		let tooltipItems = [];
		let i, len;
		for (i = 0, len = active.length; i < len; ++i) {
			tooltipItems.push(createTooltipItem(me._chart, active[i]));
		}
		if (options.filter) {
			tooltipItems = tooltipItems.filter((element, index, array) => options.filter(element, index, array, data));
		}
		if (options.itemSort) {
			tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
		}
		each(tooltipItems, (context) => {
			labelColors.push(options.callbacks.labelColor.call(me, context));
			labelPointStyles.push(options.callbacks.labelPointStyle.call(me, context));
			labelTextColors.push(options.callbacks.labelTextColor.call(me, context));
		});
		me.labelColors = labelColors;
		me.labelPointStyles = labelPointStyles;
		me.labelTextColors = labelTextColors;
		me.dataPoints = tooltipItems;
		return tooltipItems;
	}
	update(changed) {
		const me = this;
		const options = me.options;
		const active = me._active;
		let properties;
		if (!active.length) {
			if (me.opacity !== 0) {
				properties = {
					opacity: 0
				};
			}
		} else {
			const position = positioners[options.position].call(me, active, me._eventPosition);
			const tooltipItems = me._createItems();
			me.title = me.getTitle(tooltipItems);
			me.beforeBody = me.getBeforeBody(tooltipItems);
			me.body = me.getBody(tooltipItems);
			me.afterBody = me.getAfterBody(tooltipItems);
			me.footer = me.getFooter(tooltipItems);
			const size = me._size = getTooltipSize(me);
			const positionAndSize = Object.assign({}, position, size);
			const alignment = determineAlignment(me._chart, options, positionAndSize);
			const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, me._chart);
			me.xAlign = alignment.xAlign;
			me.yAlign = alignment.yAlign;
			properties = {
				opacity: 1,
				x: backgroundPoint.x,
				y: backgroundPoint.y,
				width: size.width,
				height: size.height,
				caretX: position.x,
				caretY: position.y
			};
		}
		if (properties) {
			me._resolveAnimations().update(me, properties);
		}
		if (changed && options.custom) {
			options.custom.call(me, {chart: me._chart, tooltip: me});
		}
	}
	drawCaret(tooltipPoint, ctx, size) {
		const caretPosition = this.getCaretPosition(tooltipPoint, size);
		ctx.lineTo(caretPosition.x1, caretPosition.y1);
		ctx.lineTo(caretPosition.x2, caretPosition.y2);
		ctx.lineTo(caretPosition.x3, caretPosition.y3);
	}
	getCaretPosition(tooltipPoint, size) {
		const {xAlign, yAlign, options} = this;
		const {cornerRadius, caretSize} = options;
		const {x: ptX, y: ptY} = tooltipPoint;
		const {width, height} = size;
		let x1, x2, x3, y1, y2, y3;
		if (yAlign === 'center') {
			y2 = ptY + (height / 2);
			if (xAlign === 'left') {
				x1 = ptX;
				x2 = x1 - caretSize;
				y1 = y2 + caretSize;
				y3 = y2 - caretSize;
			} else {
				x1 = ptX + width;
				x2 = x1 + caretSize;
				y1 = y2 - caretSize;
				y3 = y2 + caretSize;
			}
			x3 = x1;
		} else {
			if (xAlign === 'left') {
				x2 = ptX + cornerRadius + (caretSize);
			} else if (xAlign === 'right') {
				x2 = ptX + width - cornerRadius - caretSize;
			} else {
				x2 = this.caretX;
			}
			if (yAlign === 'top') {
				y1 = ptY;
				y2 = y1 - caretSize;
				x1 = x2 - caretSize;
				x3 = x2 + caretSize;
			} else {
				y1 = ptY + height;
				y2 = y1 + caretSize;
				x1 = x2 + caretSize;
				x3 = x2 - caretSize;
			}
			y3 = y1;
		}
		return {x1, x2, x3, y1, y2, y3};
	}
	drawTitle(pt, ctx) {
		const me = this;
		const options = me.options;
		const title = me.title;
		const length = title.length;
		let titleFont, titleSpacing, i;
		if (length) {
			const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);
			pt.x = getAlignedX(me, options.titleAlign);
			ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
			ctx.textBaseline = 'middle';
			titleFont = options.titleFont;
			titleSpacing = options.titleSpacing;
			ctx.fillStyle = options.titleColor;
			ctx.font = titleFont.string;
			for (i = 0; i < length; ++i) {
				ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.size / 2);
				pt.y += titleFont.size + titleSpacing;
				if (i + 1 === length) {
					pt.y += options.titleMarginBottom - titleSpacing;
				}
			}
		}
	}
	_drawColorBox(ctx, pt, i, rtlHelper) {
		const me = this;
		const options = me.options;
		const labelColors = me.labelColors[i];
		const labelPointStyle = me.labelPointStyles[i];
		const {boxHeight, boxWidth, bodyFont} = options;
		const colorX = getAlignedX(me, 'left');
		const rtlColorX = rtlHelper.x(colorX);
		const yOffSet = boxHeight < bodyFont.size ? (bodyFont.size - boxHeight) / 2 : 0;
		const colorY = pt.y + yOffSet;
		if (options.usePointStyle) {
			const drawOptions = {
				radius: Math.min(boxWidth, boxHeight) / 2,
				pointStyle: labelPointStyle.pointStyle,
				rotation: labelPointStyle.rotation,
				borderWidth: 1
			};
			const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
			const centerY = colorY + boxHeight / 2;
			ctx.strokeStyle = options.multiKeyBackground;
			ctx.fillStyle = options.multiKeyBackground;
			drawPoint(ctx, drawOptions, centerX, centerY);
			ctx.strokeStyle = labelColors.borderColor;
			ctx.fillStyle = labelColors.backgroundColor;
			drawPoint(ctx, drawOptions, centerX, centerY);
		} else {
			ctx.fillStyle = options.multiKeyBackground;
			ctx.fillRect(rtlHelper.leftForLtr(rtlColorX, boxWidth), colorY, boxWidth, boxHeight);
			ctx.lineWidth = 1;
			ctx.strokeStyle = labelColors.borderColor;
			ctx.strokeRect(rtlHelper.leftForLtr(rtlColorX, boxWidth), colorY, boxWidth, boxHeight);
			ctx.fillStyle = labelColors.backgroundColor;
			ctx.fillRect(rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2), colorY + 1, boxWidth - 2, boxHeight - 2);
		}
		ctx.fillStyle = me.labelTextColors[i];
	}
	drawBody(pt, ctx) {
		const me = this;
		const {body, options} = me;
		const {bodyFont, bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth} = options;
		let bodyLineHeight = bodyFont.size;
		let xLinePadding = 0;
		const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);
		const fillLineOfText = function(line) {
			ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
			pt.y += bodyLineHeight + bodySpacing;
		};
		const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
		let bodyItem, textColor, lines, i, j, ilen, jlen;
		ctx.textAlign = bodyAlign;
		ctx.textBaseline = 'middle';
		ctx.font = bodyFont.string;
		pt.x = getAlignedX(me, bodyAlignForCalculation);
		ctx.fillStyle = options.bodyColor;
		each(me.beforeBody, fillLineOfText);
		xLinePadding = displayColors && bodyAlignForCalculation !== 'right'
			? bodyAlign === 'center' ? (boxWidth / 2 + 1) : (boxWidth + 2)
			: 0;
		for (i = 0, ilen = body.length; i < ilen; ++i) {
			bodyItem = body[i];
			textColor = me.labelTextColors[i];
			ctx.fillStyle = textColor;
			each(bodyItem.before, fillLineOfText);
			lines = bodyItem.lines;
			if (displayColors && lines.length) {
				me._drawColorBox(ctx, pt, i, rtlHelper);
				bodyLineHeight = Math.max(bodyFont.size, boxHeight);
			}
			for (j = 0, jlen = lines.length; j < jlen; ++j) {
				fillLineOfText(lines[j]);
				bodyLineHeight = bodyFont.size;
			}
			each(bodyItem.after, fillLineOfText);
		}
		xLinePadding = 0;
		bodyLineHeight = bodyFont.size;
		each(me.afterBody, fillLineOfText);
		pt.y -= bodySpacing;
	}
	drawFooter(pt, ctx) {
		const me = this;
		const options = me.options;
		const footer = me.footer;
		const length = footer.length;
		let footerFont, i;
		if (length) {
			const rtlHelper = getRtlAdapter(options.rtl, me.x, me.width);
			pt.x = getAlignedX(me, options.footerAlign);
			pt.y += options.footerMarginTop;
			ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
			ctx.textBaseline = 'middle';
			footerFont = options.footerFont;
			ctx.fillStyle = options.footerColor;
			ctx.font = footerFont.string;
			for (i = 0; i < length; ++i) {
				ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.size / 2);
				pt.y += footerFont.size + options.footerSpacing;
			}
		}
	}
	drawBackground(pt, ctx, tooltipSize) {
		const {xAlign, yAlign, options} = this;
		const {x, y} = pt;
		const {width, height} = tooltipSize;
		const radius = options.cornerRadius;
		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;
		ctx.lineWidth = options.borderWidth;
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		if (yAlign === 'top') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		if (yAlign === 'center' && xAlign === 'right') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		if (yAlign === 'bottom') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		if (yAlign === 'center' && xAlign === 'left') {
			this.drawCaret(pt, ctx, tooltipSize);
		}
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();
		if (options.borderWidth > 0) {
			ctx.stroke();
		}
	}
	_updateAnimationTarget() {
		const me = this;
		const chart = me._chart;
		const options = me.options;
		const anims = me.$animations;
		const animX = anims && anims.x;
		const animY = anims && anims.y;
		if (animX || animY) {
			const position = positioners[options.position].call(me, me._active, me._eventPosition);
			if (!position) {
				return;
			}
			const size = me._size = getTooltipSize(me);
			const positionAndSize = Object.assign({}, position, me._size);
			const alignment = determineAlignment(chart, options, positionAndSize);
			const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
			if (animX._to !== point.x || animY._to !== point.y) {
				me.xAlign = alignment.xAlign;
				me.yAlign = alignment.yAlign;
				me.width = size.width;
				me.height = size.height;
				me.caretX = position.x;
				me.caretY = position.y;
				me._resolveAnimations().update(me, point);
			}
		}
	}
	draw(ctx) {
		const me = this;
		const options = me.options;
		let opacity = me.opacity;
		if (!opacity) {
			return;
		}
		me._updateAnimationTarget();
		const tooltipSize = {
			width: me.width,
			height: me.height
		};
		const pt = {
			x: me.x,
			y: me.y
		};
		opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
		const hasTooltipContent = me.title.length || me.beforeBody.length || me.body.length || me.afterBody.length || me.footer.length;
		if (options.enabled && hasTooltipContent) {
			ctx.save();
			ctx.globalAlpha = opacity;
			me.drawBackground(pt, ctx, tooltipSize);
			overrideTextDirection(ctx, options.textDirection);
			pt.y += options.yPadding;
			me.drawTitle(pt, ctx);
			me.drawBody(pt, ctx);
			me.drawFooter(pt, ctx);
			restoreTextDirection(ctx, options.textDirection);
			ctx.restore();
		}
	}
	getActiveElements() {
		return this._active || [];
	}
	setActiveElements(activeElements, eventPosition) {
		const me = this;
		const lastActive = me._active;
		const active = activeElements.map(({datasetIndex, index}) => {
			const meta = me._chart.getDatasetMeta(datasetIndex);
			if (!meta) {
				throw new Error('Cannot find a dataset at index ' + datasetIndex);
			}
			return {
				datasetIndex,
				element: meta.data[index],
				index,
			};
		});
		const changed = !_elementsEqual(lastActive, active);
		const positionChanged = me._positionChanged(active, eventPosition);
		if (changed || positionChanged) {
			me._active = active;
			me._eventPosition = eventPosition;
			me.update(true);
		}
	}
	handleEvent(e, replay) {
		const me = this;
		const options = me.options;
		const lastActive = me._active || [];
		let changed = false;
		let active = [];
		if (e.type !== 'mouseout') {
			active = me._chart.getElementsAtEventForMode(e, options.mode, options, replay);
			if (options.reverse) {
				active.reverse();
			}
		}
		const positionChanged = me._positionChanged(active, e);
		changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
		if (changed) {
			me._active = active;
			if (options.enabled || options.custom) {
				me._eventPosition = {
					x: e.x,
					y: e.y
				};
				me.update(true);
			}
		}
		return changed;
	}
	_positionChanged(active, e) {
		const me = this;
		const position = positioners[me.options.position].call(me, active, e);
		return me.caretX !== position.x || me.caretY !== position.y;
	}
}
Tooltip.positioners = positioners;
var plugin_tooltip = {
	id: 'tooltip',
	_element: Tooltip,
	positioners,
	afterInit(chart) {
		const tooltipOpts = chart.options.plugins.tooltip;
		if (tooltipOpts) {
			chart.tooltip = new Tooltip({_chart: chart});
		}
	},
	beforeUpdate(chart) {
		if (chart.tooltip) {
			chart.tooltip.initialize();
		}
	},
	reset(chart) {
		if (chart.tooltip) {
			chart.tooltip.initialize();
		}
	},
	afterDraw(chart) {
		const tooltip = chart.tooltip;
		const args = {
			tooltip
		};
		if (chart.notifyPlugins('beforeTooltipDraw', args) === false) {
			return;
		}
		if (tooltip) {
			tooltip.draw(chart.ctx);
		}
		chart.notifyPlugins('afterTooltipDraw', args);
	},
	afterEvent(chart, args) {
		if (chart.tooltip) {
			const useFinalPosition = args.replay;
			chart.tooltip.handleEvent(args.event, useFinalPosition);
		}
	},
	defaults: {
		enabled: true,
		custom: null,
		position: 'average',
		backgroundColor: 'rgba(0,0,0,0.8)',
		titleColor: '#fff',
		titleFont: {
			style: 'bold',
		},
		titleSpacing: 2,
		titleMarginBottom: 6,
		titleAlign: 'left',
		bodyColor: '#fff',
		bodySpacing: 2,
		bodyFont: {
		},
		bodyAlign: 'left',
		footerColor: '#fff',
		footerSpacing: 2,
		footerMarginTop: 6,
		footerFont: {
			style: 'bold',
		},
		footerAlign: 'left',
		yPadding: 6,
		xPadding: 6,
		caretPadding: 2,
		caretSize: 5,
		cornerRadius: 6,
		multiKeyBackground: '#fff',
		displayColors: true,
		borderColor: 'rgba(0,0,0,0)',
		borderWidth: 0,
		animation: {
			duration: 400,
			easing: 'easeOutQuart',
			numbers: {
				type: 'number',
				properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY'],
			},
			opacity: {
				easing: 'linear',
				duration: 200
			}
		},
		callbacks: {
			beforeTitle: noop,
			title(tooltipItems) {
				if (tooltipItems.length > 0) {
					const item = tooltipItems[0];
					const labels = item.chart.data.labels;
					const labelCount = labels ? labels.length : 0;
					if (this && this.options && this.options.mode === 'dataset') {
						return item.dataset.label || '';
					} else if (item.label) {
						return item.label;
					} else if (labelCount > 0 && item.dataIndex < labelCount) {
						return labels[item.dataIndex];
					}
				}
				return '';
			},
			afterTitle: noop,
			beforeBody: noop,
			beforeLabel: noop,
			label(tooltipItem) {
				if (this && this.options && this.options.mode === 'dataset') {
					return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
				}
				let label = tooltipItem.dataset.label || '';
				if (label) {
					label += ': ';
				}
				const value = tooltipItem.formattedValue;
				if (!isNullOrUndef(value)) {
					label += value;
				}
				return label;
			},
			labelColor(tooltipItem) {
				const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
				const options = meta.controller.getStyle(tooltipItem.dataIndex);
				return {
					borderColor: options.borderColor,
					backgroundColor: options.backgroundColor
				};
			},
			labelTextColor() {
				return this.options.bodyColor;
			},
			labelPointStyle(tooltipItem) {
				const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
				const options = meta.controller.getStyle(tooltipItem.dataIndex);
				return {
					pointStyle: options.pointStyle,
					rotation: options.rotation,
				};
			},
			afterLabel: noop,
			afterBody: noop,
			beforeFooter: noop,
			footer: noop,
			afterFooter: noop
		}
	},
};

var plugins = /*#__PURE__*/Object.freeze({
__proto__: null,
Filler: plugin_filler,
Legend: plugin_legend,
Title: plugin_title,
Tooltip: plugin_tooltip
});

function findOrAddLabel(labels, raw, index) {
	const first = labels.indexOf(raw);
	if (first === -1) {
		return typeof raw === 'string' ? labels.push(raw) - 1 : index;
	}
	const last = labels.lastIndexOf(raw);
	return first !== last ? index : first;
}
class CategoryScale extends Scale {
	constructor(cfg) {
		super(cfg);
		this._startValue = undefined;
		this._valueRange = 0;
	}
	parse(raw, index) {
		const labels = this.getLabels();
		return isFinite(index) && labels[index] === raw
			? index : findOrAddLabel(labels, raw, index);
	}
	determineDataLimits() {
		const me = this;
		const {minDefined, maxDefined} = me.getUserBounds();
		let {min, max} = me.getMinMax(true);
		if (me.options.bounds === 'ticks') {
			if (!minDefined) {
				min = 0;
			}
			if (!maxDefined) {
				max = me.getLabels().length - 1;
			}
		}
		me.min = min;
		me.max = max;
	}
	buildTicks() {
		const me = this;
		const min = me.min;
		const max = me.max;
		const offset = me.options.offset;
		const ticks = [];
		let labels = me.getLabels();
		labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);
		me._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
		me._startValue = me.min - (offset ? 0.5 : 0);
		for (let value = min; value <= max; value++) {
			ticks.push({value});
		}
		return ticks;
	}
	getLabelForValue(value) {
		const me = this;
		const labels = me.getLabels();
		if (value >= 0 && value < labels.length) {
			return labels[value];
		}
		return value;
	}
	configure() {
		const me = this;
		super.configure();
		if (!me.isHorizontal()) {
			me._reversePixels = !me._reversePixels;
		}
	}
	getPixelForValue(value) {
		const me = this;
		if (typeof value !== 'number') {
			value = me.parse(value);
		}
		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}
	getPixelForTick(index) {
		const me = this;
		const ticks = me.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return me.getPixelForValue(ticks[index].value);
	}
	getValueForPixel(pixel) {
		const me = this;
		return Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
	}
	getBasePixel() {
		return this.bottom;
	}
}
CategoryScale.id = 'category';
CategoryScale.defaults = {
	ticks: {
		callback: CategoryScale.prototype.getLabelForValue
	}
};

function niceNum(range) {
	const exponent = Math.floor(log10(range));
	const fraction = range / Math.pow(10, exponent);
	let niceFraction;
	if (fraction <= 1.0) {
		niceFraction = 1;
	} else if (fraction <= 2) {
		niceFraction = 2;
	} else if (fraction <= 5) {
		niceFraction = 5;
	} else {
		niceFraction = 10;
	}
	return niceFraction * Math.pow(10, exponent);
}
function generateTicks(generationOptions, dataRange) {
	const ticks = [];
	const MIN_SPACING = 1e-14;
	const {stepSize, min, max, precision} = generationOptions;
	const unit = stepSize || 1;
	const maxNumSpaces = generationOptions.maxTicks - 1;
	const {min: rmin, max: rmax} = dataRange;
	let spacing = niceNum((rmax - rmin) / maxNumSpaces / unit) * unit;
	let factor, niceMin, niceMax, numSpaces;
	if (spacing < MIN_SPACING && isNullOrUndef(min) && isNullOrUndef(max)) {
		return [{value: rmin}, {value: rmax}];
	}
	numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
	if (numSpaces > maxNumSpaces) {
		spacing = niceNum(numSpaces * spacing / maxNumSpaces / unit) * unit;
	}
	if (stepSize || isNullOrUndef(precision)) {
		factor = Math.pow(10, _decimalPlaces(spacing));
	} else {
		factor = Math.pow(10, precision);
		spacing = Math.ceil(spacing * factor) / factor;
	}
	niceMin = Math.floor(rmin / spacing) * spacing;
	niceMax = Math.ceil(rmax / spacing) * spacing;
	if (stepSize && !isNullOrUndef(min) && !isNullOrUndef(max)) {
		if (almostWhole((max - min) / stepSize, spacing / 1000)) {
			niceMin = min;
			niceMax = max;
		}
	}
	numSpaces = (niceMax - niceMin) / spacing;
	if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
		numSpaces = Math.round(numSpaces);
	} else {
		numSpaces = Math.ceil(numSpaces);
	}
	niceMin = Math.round(niceMin * factor) / factor;
	niceMax = Math.round(niceMax * factor) / factor;
	ticks.push({value: isNullOrUndef(min) ? niceMin : min});
	for (let j = 1; j < numSpaces; ++j) {
		ticks.push({value: Math.round((niceMin + j * spacing) * factor) / factor});
	}
	ticks.push({value: isNullOrUndef(max) ? niceMax : max});
	return ticks;
}
class LinearScaleBase extends Scale {
	constructor(cfg) {
		super(cfg);
		this.start = undefined;
		this.end = undefined;
		this._startValue = undefined;
		this._endValue = undefined;
		this._valueRange = 0;
	}
	parse(raw, index) {
		if (isNullOrUndef(raw)) {
			return NaN;
		}
		if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
			return NaN;
		}
		return +raw;
	}
	handleTickRangeOptions() {
		const me = this;
		const {beginAtZero, stacked} = me.options;
		const {minDefined, maxDefined} = me.getUserBounds();
		let {min, max} = me;
		const setMin = v => (min = minDefined ? min : v);
		const setMax = v => (max = maxDefined ? max : v);
		if (beginAtZero || stacked) {
			const minSign = sign(min);
			const maxSign = sign(max);
			if (minSign < 0 && maxSign < 0) {
				setMax(0);
			} else if (minSign > 0 && maxSign > 0) {
				setMin(0);
			}
		}
		if (min === max) {
			setMax(max + 1);
			if (!beginAtZero) {
				setMin(min - 1);
			}
		}
		me.min = min;
		me.max = max;
	}
	getTickLimit() {
		const me = this;
		const tickOpts = me.options.ticks;
		let {maxTicksLimit, stepSize} = tickOpts;
		let maxTicks;
		if (stepSize) {
			maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
		} else {
			maxTicks = me.computeTickLimit();
			maxTicksLimit = maxTicksLimit || 11;
		}
		if (maxTicksLimit) {
			maxTicks = Math.min(maxTicksLimit, maxTicks);
		}
		return maxTicks;
	}
	computeTickLimit() {
		return Number.POSITIVE_INFINITY;
	}
	buildTicks() {
		const me = this;
		const opts = me.options;
		const tickOpts = opts.ticks;
		let maxTicks = me.getTickLimit();
		maxTicks = Math.max(2, maxTicks);
		const numericGeneratorOptions = {
			maxTicks,
			min: opts.min,
			max: opts.max,
			precision: tickOpts.precision,
			stepSize: valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
		};
		const ticks = generateTicks(numericGeneratorOptions, me);
		if (opts.bounds === 'ticks') {
			_setMinAndMaxByKey(ticks, me, 'value');
		}
		if (opts.reverse) {
			ticks.reverse();
			me.start = me.max;
			me.end = me.min;
		} else {
			me.start = me.min;
			me.end = me.max;
		}
		return ticks;
	}
	configure() {
		const me = this;
		const ticks = me.ticks;
		let start = me.min;
		let end = me.max;
		super.configure();
		if (me.options.offset && ticks.length) {
			const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
			start -= offset;
			end += offset;
		}
		me._startValue = start;
		me._endValue = end;
		me._valueRange = end - start;
	}
	getLabelForValue(value) {
		return new Intl.NumberFormat(this.options.locale).format(value);
	}
}

class LinearScale extends LinearScaleBase {
	determineDataLimits() {
		const me = this;
		const {min, max} = me.getMinMax(true);
		me.min = isNumberFinite(min) ? min : 0;
		me.max = isNumberFinite(max) ? max : 1;
		me.handleTickRangeOptions();
	}
	computeTickLimit() {
		const me = this;
		if (me.isHorizontal()) {
			return Math.ceil(me.width / 40);
		}
		const tickFont = me._resolveTickFontOptions(0);
		return Math.ceil(me.height / tickFont.lineHeight);
	}
	getPixelForValue(value) {
		return this.getPixelForDecimal((value - this._startValue) / this._valueRange);
	}
	getValueForPixel(pixel) {
		return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	}
}
LinearScale.id = 'linear';
LinearScale.defaults = {
	ticks: {
		callback: Ticks.formatters.numeric
	}
};

function isMajor(tickVal) {
	const remain = tickVal / (Math.pow(10, Math.floor(log10(tickVal))));
	return remain === 1;
}
function generateTicks$1(generationOptions, dataRange) {
	const endExp = Math.floor(log10(dataRange.max));
	const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
	const ticks = [];
	let tickVal = finiteOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));
	let exp = Math.floor(log10(tickVal));
	let significand = Math.floor(tickVal / Math.pow(10, exp));
	let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
	do {
		ticks.push({value: tickVal, major: isMajor(tickVal)});
		++significand;
		if (significand === 10) {
			significand = 1;
			++exp;
			precision = exp >= 0 ? 1 : precision;
		}
		tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
	} while (exp < endExp || (exp === endExp && significand < endSignificand));
	const lastTick = finiteOrDefault(generationOptions.max, tickVal);
	ticks.push({value: lastTick, major: isMajor(tickVal)});
	return ticks;
}
class LogarithmicScale extends Scale {
	constructor(cfg) {
		super(cfg);
		this.start = undefined;
		this.end = undefined;
		this._startValue = undefined;
		this._valueRange = 0;
	}
	parse(raw, index) {
		const value = LinearScaleBase.prototype.parse.apply(this, [raw, index]);
		if (value === 0) {
			this._zero = true;
			return undefined;
		}
		return isNumberFinite(value) && value > 0 ? value : NaN;
	}
	determineDataLimits() {
		const me = this;
		const {min, max} = me.getMinMax(true);
		me.min = isNumberFinite(min) ? Math.max(0, min) : null;
		me.max = isNumberFinite(max) ? Math.max(0, max) : null;
		if (me.options.beginAtZero) {
			me._zero = true;
		}
		me.handleTickRangeOptions();
	}
	handleTickRangeOptions() {
		const me = this;
		const {minDefined, maxDefined} = me.getUserBounds();
		let min = me.min;
		let max = me.max;
		const setMin = v => (min = minDefined ? min : v);
		const setMax = v => (max = maxDefined ? max : v);
		const exp = (v, m) => Math.pow(10, Math.floor(log10(v)) + m);
		if (min === max) {
			if (min <= 0) {
				setMin(1);
				setMax(10);
			} else {
				setMin(exp(min, -1));
				setMax(exp(max, +1));
			}
		}
		if (min <= 0) {
			setMin(exp(max, -1));
		}
		if (max <= 0) {
			setMax(exp(min, +1));
		}
		if (me._zero && me.min !== me._suggestedMin && min === exp(me.min, 0)) {
			setMin(exp(min, -1));
		}
		me.min = min;
		me.max = max;
	}
	buildTicks() {
		const me = this;
		const opts = me.options;
		const generationOptions = {
			min: me._userMin,
			max: me._userMax
		};
		const ticks = generateTicks$1(generationOptions, me);
		if (opts.bounds === 'ticks') {
			_setMinAndMaxByKey(ticks, me, 'value');
		}
		if (opts.reverse) {
			ticks.reverse();
			me.start = me.max;
			me.end = me.min;
		} else {
			me.start = me.min;
			me.end = me.max;
		}
		return ticks;
	}
	getLabelForValue(value) {
		return value === undefined ? '0' : new Intl.NumberFormat(this.options.locale).format(value);
	}
	configure() {
		const me = this;
		const start = me.min;
		super.configure();
		me._startValue = log10(start);
		me._valueRange = log10(me.max) - log10(start);
	}
	getPixelForValue(value) {
		const me = this;
		if (value === undefined || value === 0) {
			value = me.min;
		}
		return me.getPixelForDecimal(value === me.min
			? 0
			: (log10(value) - me._startValue) / me._valueRange);
	}
	getValueForPixel(pixel) {
		const me = this;
		const decimal = me.getDecimalForPixel(pixel);
		return Math.pow(10, me._startValue + decimal * me._valueRange);
	}
}
LogarithmicScale.id = 'logarithmic';
LogarithmicScale.defaults = {
	ticks: {
		callback: Ticks.formatters.logarithmic,
		major: {
			enabled: true
		}
	}
};

function getTickBackdropHeight(opts) {
	const tickOpts = opts.ticks;
	if (tickOpts.display && opts.display) {
		return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + tickOpts.backdropPaddingY * 2;
	}
	return 0;
}
function measureLabelSize(ctx, lineHeight, label) {
	if (isArray(label)) {
		return {
			w: _longestText(ctx, ctx.font, label),
			h: label.length * lineHeight
		};
	}
	return {
		w: ctx.measureText(label).width,
		h: lineHeight
	};
}
function determineLimits(angle, pos, size, min, max) {
	if (angle === min || angle === max) {
		return {
			start: pos - (size / 2),
			end: pos + (size / 2)
		};
	} else if (angle < min || angle > max) {
		return {
			start: pos - size,
			end: pos
		};
	}
	return {
		start: pos,
		end: pos + size
	};
}
function fitWithPointLabels(scale) {
	const furthestLimits = {
		l: 0,
		r: scale.width,
		t: 0,
		b: scale.height - scale.paddingTop
	};
	const furthestAngles = {};
	let i, textSize, pointPosition;
	scale._pointLabelSizes = [];
	const valueCount = scale.chart.data.labels.length;
	for (i = 0; i < valueCount; i++) {
		pointPosition = scale.getPointPosition(i, scale.drawingArea + 5);
		const context = scale.getContext(i);
		const plFont = toFont(resolve([scale.options.pointLabels.font], context, i), scale.chart.options.font);
		scale.ctx.font = plFont.string;
		textSize = measureLabelSize(scale.ctx, plFont.lineHeight, scale.pointLabels[i]);
		scale._pointLabelSizes[i] = textSize;
		const angleRadians = scale.getIndexAngle(i);
		const angle = toDegrees(angleRadians);
		const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
		const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
		if (hLimits.start < furthestLimits.l) {
			furthestLimits.l = hLimits.start;
			furthestAngles.l = angleRadians;
		}
		if (hLimits.end > furthestLimits.r) {
			furthestLimits.r = hLimits.end;
			furthestAngles.r = angleRadians;
		}
		if (vLimits.start < furthestLimits.t) {
			furthestLimits.t = vLimits.start;
			furthestAngles.t = angleRadians;
		}
		if (vLimits.end > furthestLimits.b) {
			furthestLimits.b = vLimits.end;
			furthestAngles.b = angleRadians;
		}
	}
	scale._setReductions(scale.drawingArea, furthestLimits, furthestAngles);
}
function getTextAlignForAngle(angle) {
	if (angle === 0 || angle === 180) {
		return 'center';
	} else if (angle < 180) {
		return 'left';
	}
	return 'right';
}
function fillText(ctx, text, position, lineHeight) {
	let y = position.y + lineHeight / 2;
	let i, ilen;
	if (isArray(text)) {
		for (i = 0, ilen = text.length; i < ilen; ++i) {
			ctx.fillText(text[i], position.x, y);
			y += lineHeight;
		}
	} else {
		ctx.fillText(text, position.x, y);
	}
}
function adjustPointPositionForLabelHeight(angle, textSize, position) {
	if (angle === 90 || angle === 270) {
		position.y -= (textSize.h / 2);
	} else if (angle > 270 || angle < 90) {
		position.y -= textSize.h;
	}
}
function drawPointLabels(scale) {
	const ctx = scale.ctx;
	const opts = scale.options;
	const pointLabelOpts = opts.pointLabels;
	const tickBackdropHeight = getTickBackdropHeight(opts);
	const outerDistance = scale.getDistanceFromCenterForValue(opts.ticks.reverse ? scale.min : scale.max);
	ctx.save();
	ctx.textBaseline = 'middle';
	for (let i = scale.chart.data.labels.length - 1; i >= 0; i--) {
		const extra = (i === 0 ? tickBackdropHeight / 2 : 0);
		const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + 5);
		const context = scale.getContext(i);
		const plFont = toFont(resolve([pointLabelOpts.font], context, i), scale.chart.options.font);
		ctx.font = plFont.string;
		ctx.fillStyle = pointLabelOpts.color;
		const angle = toDegrees(scale.getIndexAngle(i));
		ctx.textAlign = getTextAlignForAngle(angle);
		adjustPointPositionForLabelHeight(angle, scale._pointLabelSizes[i], pointLabelPosition);
		fillText(ctx, scale.pointLabels[i], pointLabelPosition, plFont.lineHeight);
	}
	ctx.restore();
}
function drawRadiusLine(scale, gridLineOpts, radius, index) {
	const ctx = scale.ctx;
	const circular = gridLineOpts.circular;
	const valueCount = scale.chart.data.labels.length;
	const context = scale.getContext(index);
	const lineColor = resolve([gridLineOpts.color], context, index - 1);
	const lineWidth = resolve([gridLineOpts.lineWidth], context, index - 1);
	let pointPosition;
	if ((!circular && !valueCount) || !lineColor || !lineWidth) {
		return;
	}
	ctx.save();
	ctx.strokeStyle = lineColor;
	ctx.lineWidth = lineWidth;
	if (ctx.setLineDash) {
		ctx.setLineDash(resolve([gridLineOpts.borderDash, []], context));
		ctx.lineDashOffset = resolve([gridLineOpts.borderDashOffset], context, index - 1);
	}
	ctx.beginPath();
	if (circular) {
		ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
	} else {
		pointPosition = scale.getPointPosition(0, radius);
		ctx.moveTo(pointPosition.x, pointPosition.y);
		for (let i = 1; i < valueCount; i++) {
			pointPosition = scale.getPointPosition(i, radius);
			ctx.lineTo(pointPosition.x, pointPosition.y);
		}
	}
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
}
function numberOrZero$1(param) {
	return isNumber(param) ? param : 0;
}
class RadialLinearScale extends LinearScaleBase {
	constructor(cfg) {
		super(cfg);
		this.xCenter = undefined;
		this.yCenter = undefined;
		this.drawingArea = undefined;
		this.pointLabels = [];
	}
	init(options) {
		super.init(options);
		this.axis = 'r';
	}
	setDimensions() {
		const me = this;
		me.width = me.maxWidth;
		me.height = me.maxHeight;
		me.paddingTop = getTickBackdropHeight(me.options) / 2;
		me.xCenter = Math.floor(me.width / 2);
		me.yCenter = Math.floor((me.height - me.paddingTop) / 2);
		me.drawingArea = Math.min(me.height - me.paddingTop, me.width) / 2;
	}
	determineDataLimits() {
		const me = this;
		const {min, max} = me.getMinMax(false);
		me.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
		me.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
		me.handleTickRangeOptions();
	}
	computeTickLimit() {
		return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
	}
	generateTickLabels(ticks) {
		const me = this;
		LinearScaleBase.prototype.generateTickLabels.call(me, ticks);
		me.pointLabels = me.chart.data.labels.map((value, index) => {
			const label = callback(me.options.pointLabels.callback, [value, index], me);
			return label || label === 0 ? label : '';
		});
	}
	fit() {
		const me = this;
		const opts = me.options;
		if (opts.display && opts.pointLabels.display) {
			fitWithPointLabels(me);
		} else {
			me.setCenterPoint(0, 0, 0, 0);
		}
	}
	_setReductions(largestPossibleRadius, furthestLimits, furthestAngles) {
		const me = this;
		let radiusReductionLeft = furthestLimits.l / Math.sin(furthestAngles.l);
		let radiusReductionRight = Math.max(furthestLimits.r - me.width, 0) / Math.sin(furthestAngles.r);
		let radiusReductionTop = -furthestLimits.t / Math.cos(furthestAngles.t);
		let radiusReductionBottom = -Math.max(furthestLimits.b - (me.height - me.paddingTop), 0) / Math.cos(furthestAngles.b);
		radiusReductionLeft = numberOrZero$1(radiusReductionLeft);
		radiusReductionRight = numberOrZero$1(radiusReductionRight);
		radiusReductionTop = numberOrZero$1(radiusReductionTop);
		radiusReductionBottom = numberOrZero$1(radiusReductionBottom);
		me.drawingArea = Math.min(
			Math.floor(largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2),
			Math.floor(largestPossibleRadius - (radiusReductionTop + radiusReductionBottom) / 2));
		me.setCenterPoint(radiusReductionLeft, radiusReductionRight, radiusReductionTop, radiusReductionBottom);
	}
	setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
		const me = this;
		const maxRight = me.width - rightMovement - me.drawingArea;
		const maxLeft = leftMovement + me.drawingArea;
		const maxTop = topMovement + me.drawingArea;
		const maxBottom = (me.height - me.paddingTop) - bottomMovement - me.drawingArea;
		me.xCenter = Math.floor(((maxLeft + maxRight) / 2) + me.left);
		me.yCenter = Math.floor(((maxTop + maxBottom) / 2) + me.top + me.paddingTop);
	}
	getIndexAngle(index) {
		const chart = this.chart;
		const angleMultiplier = TAU / chart.data.labels.length;
		const options = chart.options || {};
		const startAngle = options.startAngle || 0;
		return _normalizeAngle(index * angleMultiplier + toRadians(startAngle));
	}
	getDistanceFromCenterForValue(value) {
		const me = this;
		if (isNullOrUndef(value)) {
			return NaN;
		}
		const scalingFactor = me.drawingArea / (me.max - me.min);
		if (me.options.reverse) {
			return (me.max - value) * scalingFactor;
		}
		return (value - me.min) * scalingFactor;
	}
	getValueForDistanceFromCenter(distance) {
		if (isNullOrUndef(distance)) {
			return NaN;
		}
		const me = this;
		const scaledDistance = distance / (me.drawingArea / (me.max - me.min));
		return me.options.reverse ? me.max - scaledDistance : me.min + scaledDistance;
	}
	getPointPosition(index, distanceFromCenter) {
		const me = this;
		const angle = me.getIndexAngle(index) - HALF_PI;
		return {
			x: Math.cos(angle) * distanceFromCenter + me.xCenter,
			y: Math.sin(angle) * distanceFromCenter + me.yCenter,
			angle
		};
	}
	getPointPositionForValue(index, value) {
		return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
	}
	getBasePosition(index) {
		return this.getPointPositionForValue(index || 0, this.getBaseValue());
	}
	drawGrid() {
		const me = this;
		const ctx = me.ctx;
		const opts = me.options;
		const gridLineOpts = opts.gridLines;
		const angleLineOpts = opts.angleLines;
		let i, offset, position;
		if (opts.pointLabels.display) {
			drawPointLabels(me);
		}
		if (gridLineOpts.display) {
			me.ticks.forEach((tick, index) => {
				if (index !== 0) {
					offset = me.getDistanceFromCenterForValue(me.ticks[index].value);
					drawRadiusLine(me, gridLineOpts, offset, index);
				}
			});
		}
		if (angleLineOpts.display) {
			ctx.save();
			for (i = me.chart.data.labels.length - 1; i >= 0; i--) {
				const context = me.getContext(i);
				const lineWidth = resolve([angleLineOpts.lineWidth, gridLineOpts.lineWidth], context, i);
				const color = resolve([angleLineOpts.color, gridLineOpts.color], context, i);
				if (!lineWidth || !color) {
					continue;
				}
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = color;
				if (ctx.setLineDash) {
					ctx.setLineDash(resolve([angleLineOpts.borderDash, gridLineOpts.borderDash, []], context));
					ctx.lineDashOffset = resolve([angleLineOpts.borderDashOffset, gridLineOpts.borderDashOffset, 0.0], context, i);
				}
				offset = me.getDistanceFromCenterForValue(opts.ticks.reverse ? me.min : me.max);
				position = me.getPointPosition(i, offset);
				ctx.beginPath();
				ctx.moveTo(me.xCenter, me.yCenter);
				ctx.lineTo(position.x, position.y);
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	drawLabels() {
		const me = this;
		const ctx = me.ctx;
		const opts = me.options;
		const tickOpts = opts.ticks;
		if (!tickOpts.display) {
			return;
		}
		const startAngle = me.getIndexAngle(0);
		let offset, width;
		ctx.save();
		ctx.translate(me.xCenter, me.yCenter);
		ctx.rotate(startAngle);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		me.ticks.forEach((tick, index) => {
			if (index === 0 && !opts.reverse) {
				return;
			}
			const context = me.getContext(index);
			const tickFont = me._resolveTickFontOptions(index);
			ctx.font = tickFont.string;
			offset = me.getDistanceFromCenterForValue(me.ticks[index].value);
			const showLabelBackdrop = resolve([tickOpts.showLabelBackdrop], context, index);
			if (showLabelBackdrop) {
				width = ctx.measureText(tick.label).width;
				ctx.fillStyle = resolve([tickOpts.backdropColor], context, index);
				ctx.fillRect(
					-width / 2 - tickOpts.backdropPaddingX,
					-offset - tickFont.size / 2 - tickOpts.backdropPaddingY,
					width + tickOpts.backdropPaddingX * 2,
					tickFont.size + tickOpts.backdropPaddingY * 2
				);
			}
			ctx.fillStyle = tickOpts.color;
			ctx.fillText(tick.label, 0, -offset);
		});
		ctx.restore();
	}
	drawTitle() {}
}
RadialLinearScale.id = 'radialLinear';
RadialLinearScale.defaults = {
	display: true,
	animate: true,
	position: 'chartArea',
	angleLines: {
		display: true,
		lineWidth: 1,
		borderDash: [],
		borderDashOffset: 0.0
	},
	gridLines: {
		circular: false
	},
	ticks: {
		showLabelBackdrop: true,
		backdropColor: 'rgba(255,255,255,0.75)',
		backdropPaddingY: 2,
		backdropPaddingX: 2,
		callback: Ticks.formatters.numeric
	},
	pointLabels: {
		display: true,
		font: {
			size: 10
		},
		callback(label) {
			return label;
		}
	}
};
RadialLinearScale.defaultRoutes = {
	'angleLines.color': 'borderColor',
	'pointLabels.color': 'color',
	'ticks.color': 'color'
};

const MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
const INTERVALS = {
	millisecond: {common: true, size: 1, steps: 1000},
	second: {common: true, size: 1000, steps: 60},
	minute: {common: true, size: 60000, steps: 60},
	hour: {common: true, size: 3600000, steps: 24},
	day: {common: true, size: 86400000, steps: 30},
	week: {common: false, size: 604800000, steps: 4},
	month: {common: true, size: 2.628e9, steps: 12},
	quarter: {common: false, size: 7.884e9, steps: 4},
	year: {common: true, size: 3.154e10}
};
const UNITS = (Object.keys(INTERVALS));
function sorter(a, b) {
	return a - b;
}
function parse(scale, input) {
	if (isNullOrUndef(input)) {
		return null;
	}
	const adapter = scale._adapter;
	const options = scale.options.time;
	const {parser, round, isoWeekday} = options;
	let value = input;
	if (typeof parser === 'function') {
		value = parser(value);
	}
	if (!isNumberFinite(value)) {
		value = typeof parser === 'string'
			? adapter.parse(value, parser)
			: adapter.parse(value);
	}
	if (value === null) {
		return value;
	}
	if (round) {
		value = round === 'week' && (isNumber(isoWeekday) || isoWeekday === true)
			? scale._adapter.startOf(value, 'isoWeek', isoWeekday)
			: scale._adapter.startOf(value, round);
	}
	return +value;
}
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	const ilen = UNITS.length;
	for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
		const interval = INTERVALS[UNITS[i]];
		const factor = interval.steps ? interval.steps : MAX_INTEGER;
		if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
			return UNITS[i];
		}
	}
	return UNITS[ilen - 1];
}
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
	for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
		const unit = UNITS[i];
		if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
			return unit;
		}
	}
	return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
function determineMajorUnit(unit) {
	for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
		if (INTERVALS[UNITS[i]].common) {
			return UNITS[i];
		}
	}
}
function addTick(ticks, time, timestamps) {
	if (!timestamps) {
		ticks[time] = true;
	} else if (timestamps.length) {
		const {lo, hi} = _lookup(timestamps, time);
		const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
		ticks[timestamp] = true;
	}
}
function setMajorTicks(scale, ticks, map, majorUnit) {
	const adapter = scale._adapter;
	const first = +adapter.startOf(ticks[0].value, majorUnit);
	const last = ticks[ticks.length - 1].value;
	let major, index;
	for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
		index = map[major];
		if (index >= 0) {
			ticks[index].major = true;
		}
	}
	return ticks;
}
function ticksFromTimestamps(scale, values, majorUnit) {
	const ticks = [];
	const map = {};
	const ilen = values.length;
	let i, value;
	for (i = 0; i < ilen; ++i) {
		value = values[i];
		map[value] = i;
		ticks.push({
			value,
			major: false
		});
	}
	return (ilen === 0 || !majorUnit) ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
}
class TimeScale extends Scale {
	constructor(props) {
		super(props);
		this._cache = {
			data: [],
			labels: [],
			all: []
		};
		this._unit = 'day';
		this._majorUnit = undefined;
		this._offsets = {};
		this._normalized = false;
	}
	init(scaleOpts, opts) {
		const time = scaleOpts.time || (scaleOpts.time = {});
		const adapter = this._adapter = new _adapters._date(scaleOpts.adapters.date);
		mergeIf(time.displayFormats, adapter.formats());
		super.init(scaleOpts);
		this._normalized = opts.normalized;
	}
	parse(raw, index) {
		if (raw === undefined) {
			return NaN;
		}
		return parse(this, raw);
	}
	invalidateCaches() {
		this._cache = {
			data: [],
			labels: [],
			all: []
		};
	}
	determineDataLimits() {
		const me = this;
		const options = me.options;
		const adapter = me._adapter;
		const unit = options.time.unit || 'day';
		let {min, max, minDefined, maxDefined} = me.getUserBounds();
		function _applyBounds(bounds) {
			if (!minDefined && !isNaN(bounds.min)) {
				min = Math.min(min, bounds.min);
			}
			if (!maxDefined && !isNaN(bounds.max)) {
				max = Math.max(max, bounds.max);
			}
		}
		if (!minDefined || !maxDefined) {
			_applyBounds(me._getLabelBounds());
			if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
				_applyBounds(me.getMinMax(false));
			}
		}
		min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
		max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
		me.min = Math.min(min, max);
		me.max = Math.max(min + 1, max);
	}
	_getLabelBounds() {
		const arr = this.getLabelTimestamps();
		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;
		if (arr.length) {
			min = arr[0];
			max = arr[arr.length - 1];
		}
		return {min, max};
	}
	buildTicks() {
		const me = this;
		const options = me.options;
		const timeOpts = options.time;
		const tickOpts = options.ticks;
		const timestamps = tickOpts.source === 'labels' ? me.getLabelTimestamps() : me._generate();
		if (options.bounds === 'ticks' && timestamps.length) {
			me.min = me._userMin || timestamps[0];
			me.max = me._userMax || timestamps[timestamps.length - 1];
		}
		const min = me.min;
		const max = me.max;
		const ticks = _filterBetween(timestamps, min, max);
		me._unit = timeOpts.unit || (tickOpts.autoSkip
			? determineUnitForAutoTicks(timeOpts.minUnit, me.min, me.max, me._getLabelCapacity(min))
			: determineUnitForFormatting(me, ticks.length, timeOpts.minUnit, me.min, me.max));
		me._majorUnit = !tickOpts.major.enabled || me._unit === 'year' ? undefined
			: determineMajorUnit(me._unit);
		me.initOffsets(timestamps);
		if (options.reverse) {
			ticks.reverse();
		}
		return ticksFromTimestamps(me, ticks, me._majorUnit);
	}
	initOffsets(timestamps) {
		const me = this;
		let start = 0;
		let end = 0;
		let first, last;
		if (me.options.offset && timestamps.length) {
			first = me.getDecimalForValue(timestamps[0]);
			if (timestamps.length === 1) {
				start = 1 - first;
			} else {
				start = (me.getDecimalForValue(timestamps[1]) - first) / 2;
			}
			last = me.getDecimalForValue(timestamps[timestamps.length - 1]);
			if (timestamps.length === 1) {
				end = last;
			} else {
				end = (last - me.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
			}
		}
		me._offsets = {start, end, factor: 1 / (start + 1 + end)};
	}
	_generate() {
		const me = this;
		const adapter = me._adapter;
		const min = me.min;
		const max = me.max;
		const options = me.options;
		const timeOpts = options.time;
		const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, me._getLabelCapacity(min));
		const stepSize = valueOrDefault(timeOpts.stepSize, 1);
		const weekday = minor === 'week' ? timeOpts.isoWeekday : false;
		const hasWeekday = isNumber(weekday) || weekday === true;
		const ticks = {};
		let first = min;
		let time;
		if (hasWeekday) {
			first = +adapter.startOf(first, 'isoWeek', weekday);
		}
		first = +adapter.startOf(first, hasWeekday ? 'day' : minor);
		if (adapter.diff(max, min, minor) > 100000 * stepSize) {
			throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor);
		}
		const timestamps = options.ticks.source === 'data' && me.getDataTimestamps();
		for (time = first; time < max; time = +adapter.add(time, stepSize, minor)) {
			addTick(ticks, time, timestamps);
		}
		if (time === max || options.bounds === 'ticks') {
			addTick(ticks, time, timestamps);
		}
		return Object.keys(ticks).sort((a, b) => a - b).map(x => +x);
	}
	getLabelForValue(value) {
		const me = this;
		const adapter = me._adapter;
		const timeOpts = me.options.time;
		if (timeOpts.tooltipFormat) {
			return adapter.format(value, timeOpts.tooltipFormat);
		}
		return adapter.format(value, timeOpts.displayFormats.datetime);
	}
	_tickFormatFunction(time, index, ticks, format) {
		const me = this;
		const options = me.options;
		const formats = options.time.displayFormats;
		const unit = me._unit;
		const majorUnit = me._majorUnit;
		const minorFormat = unit && formats[unit];
		const majorFormat = majorUnit && formats[majorUnit];
		const tick = ticks[index];
		const major = majorUnit && majorFormat && tick && tick.major;
		const label = me._adapter.format(time, format || (major ? majorFormat : minorFormat));
		const formatter = options.ticks.callback;
		return formatter ? formatter(label, index, ticks) : label;
	}
	generateTickLabels(ticks) {
		let i, ilen, tick;
		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			tick = ticks[i];
			tick.label = this._tickFormatFunction(tick.value, i, ticks);
		}
	}
	getDecimalForValue(value) {
		const me = this;
		return (value - me.min) / (me.max - me.min);
	}
	getPixelForValue(value) {
		const me = this;
		const offsets = me._offsets;
		const pos = me.getDecimalForValue(value);
		return me.getPixelForDecimal((offsets.start + pos) * offsets.factor);
	}
	getValueForPixel(pixel) {
		const me = this;
		const offsets = me._offsets;
		const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return me.min + pos * (me.max - me.min);
	}
	_getLabelSize(label) {
		const me = this;
		const ticksOpts = me.options.ticks;
		const tickLabelWidth = me.ctx.measureText(label).width;
		const angle = toRadians(me.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
		const cosRotation = Math.cos(angle);
		const sinRotation = Math.sin(angle);
		const tickFontSize = me._resolveTickFontOptions(0).size;
		return {
			w: (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation),
			h: (tickLabelWidth * sinRotation) + (tickFontSize * cosRotation)
		};
	}
	_getLabelCapacity(exampleTime) {
		const me = this;
		const timeOpts = me.options.time;
		const displayFormats = timeOpts.displayFormats;
		const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
		const exampleLabel = me._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(me, [exampleTime], me._majorUnit), format);
		const size = me._getLabelSize(exampleLabel);
		const capacity = Math.floor(me.isHorizontal() ? me.width / size.w : me.height / size.h) - 1;
		return capacity > 0 ? capacity : 1;
	}
	getDataTimestamps() {
		const me = this;
		let timestamps = me._cache.data || [];
		let i, ilen;
		if (timestamps.length) {
			return timestamps;
		}
		const metas = me.getMatchingVisibleMetas();
		if (me._normalized && metas.length) {
			return (me._cache.data = metas[0].controller.getAllParsedValues(me));
		}
		for (i = 0, ilen = metas.length; i < ilen; ++i) {
			timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(me));
		}
		return (me._cache.data = me.normalize(timestamps));
	}
	getLabelTimestamps() {
		const me = this;
		const timestamps = me._cache.labels || [];
		let i, ilen;
		if (timestamps.length) {
			return timestamps;
		}
		const labels = me.getLabels();
		for (i = 0, ilen = labels.length; i < ilen; ++i) {
			timestamps.push(parse(me, labels[i]));
		}
		return (me._cache.labels = me._normalized ? timestamps : me.normalize(timestamps));
	}
	normalize(values) {
		return _arrayUnique(values.sort(sorter));
	}
}
TimeScale.id = 'time';
TimeScale.defaults = {
	bounds: 'data',
	adapters: {},
	time: {
		parser: false,
		unit: false,
		round: false,
		isoWeekday: false,
		minUnit: 'millisecond',
		displayFormats: {}
	},
	ticks: {
		source: 'auto',
		major: {
			enabled: false
		}
	}
};

function interpolate(table, val, reverse) {
	let prevSource, nextSource, prevTarget, nextTarget;
	if (reverse) {
		prevSource = Math.floor(val);
		nextSource = Math.ceil(val);
		prevTarget = table[prevSource];
		nextTarget = table[nextSource];
	} else {
		const result = _lookup(table, val);
		prevTarget = result.lo;
		nextTarget = result.hi;
		prevSource = table[prevTarget];
		nextSource = table[nextTarget];
	}
	const span = nextSource - prevSource;
	return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
class TimeSeriesScale extends TimeScale {
	constructor(props) {
		super(props);
		this._table = [];
		this._maxIndex = undefined;
	}
	initOffsets() {
		const me = this;
		const timestamps = me._getTimestampsForTable();
		me._table = me.buildLookupTable(timestamps);
		me._maxIndex = me._table.length - 1;
		super.initOffsets(timestamps);
	}
	buildLookupTable(timestamps) {
		const me = this;
		const {min, max} = me;
		if (!timestamps.length) {
			return [
				{time: min, pos: 0},
				{time: max, pos: 1}
			];
		}
		const items = [min];
		let i, ilen, curr;
		for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
			curr = timestamps[i];
			if (curr > min && curr < max) {
				items.push(curr);
			}
		}
		items.push(max);
		return items;
	}
	_getTimestampsForTable() {
		const me = this;
		let timestamps = me._cache.all || [];
		if (timestamps.length) {
			return timestamps;
		}
		const data = me.getDataTimestamps();
		const label = me.getLabelTimestamps();
		if (data.length && label.length) {
			timestamps = me.normalize(data.concat(label));
		} else {
			timestamps = data.length ? data : label;
		}
		timestamps = me._cache.all = timestamps;
		return timestamps;
	}
	getPixelForValue(value, index) {
		const me = this;
		const offsets = me._offsets;
		const pos = me._normalized && me._maxIndex > 0 && !isNullOrUndef(index)
			? index / me._maxIndex : me.getDecimalForValue(value);
		return me.getPixelForDecimal((offsets.start + pos) * offsets.factor);
	}
	getDecimalForValue(value) {
		return interpolate(this._table, value) / this._maxIndex;
	}
	getValueForPixel(pixel) {
		const me = this;
		const offsets = me._offsets;
		const decimal = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return interpolate(me._table, decimal * this._maxIndex, true);
	}
}
TimeSeriesScale.id = 'timeseries';
TimeSeriesScale.defaults = TimeScale.defaults;

var scales = /*#__PURE__*/Object.freeze({
__proto__: null,
CategoryScale: CategoryScale,
LinearScale: LinearScale,
LogarithmicScale: LogarithmicScale,
RadialLinearScale: RadialLinearScale,
TimeScale: TimeScale,
TimeSeriesScale: TimeSeriesScale
});

Chart.register(controllers, scales, elements, plugins);
Chart.helpers = {...helpers};
Chart._adapters = _adapters;
Chart.Animation = Animation;
Chart.Animations = Animations;
Chart.animator = animator;
Chart.controllers = registry.controllers.items;
Chart.DatasetController = DatasetController;
Chart.Element = Element;
Chart.elements = elements;
Chart.Interaction = Interaction;
Chart.layouts = layouts;
Chart.platforms = platforms;
Chart.Scale = Scale;
Chart.Ticks = Ticks;
Object.assign(Chart, controllers, scales, elements, plugins, platforms);
Chart.Chart = Chart;
if (typeof window !== 'undefined') {
	window.Chart = Chart;
}

return Chart;

})));

},{}],3:[function(require,module,exports){
module.exports = require('..').helpers;
},{"..":2}],4:[function(require,module,exports){
/**
 * chartjs-chart-geo
 * https://github.com/sgratzl/chartjs-chart-geo
 *
 * Copyright (c) 2020 Samuel Gratzl <sam@sgratzl.com>
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var chart_js = require('chart.js');
var d3Geo = require('d3-geo');
var helpers = require('chart.js/helpers');
var d3ScaleChromatic = require('d3-scale-chromatic');
var topojsonClient = require('topojson-client');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

var topojsonClient__namespace = /*#__PURE__*/_interopNamespace(topojsonClient);

class GeoFeature extends chart_js.Element {
    constructor() {
        super(...arguments);
        this.cache = undefined;
    }
    inRange(mouseX, mouseY) {
        const bb = this.getBounds();
        const r = (Number.isNaN(mouseX) || (mouseX >= bb.x && mouseX <= bb.x2)) &&
            (Number.isNaN(mouseY) || (mouseY >= bb.y && mouseY <= bb.y2));
        const projection = this.projectionScale.geoPath.projection();
        if (r && !Number.isNaN(mouseX) && !Number.isNaN(mouseY) && typeof projection.invert === 'function') {
            const longlat = projection.invert([mouseX, mouseY]);
            return longlat != null && d3Geo.geoContains(this.feature, longlat);
        }
        return r;
    }
    inXRange(mouseX) {
        return this.inRange(mouseX, Number.NaN);
    }
    inYRange(mouseY) {
        return this.inRange(Number.NaN, mouseY);
    }
    getCenterPoint() {
        if (this.cache && this.cache.center) {
            return this.cache.center;
        }
        const centroid = this.projectionScale.geoPath.centroid(this.feature);
        const center = {
            x: centroid[0],
            y: centroid[1],
        };
        this.cache = Object.assign({}, this.cache || {}, { center });
        return center;
    }
    getBounds() {
        if (this.cache && this.cache.bounds) {
            return this.cache.bounds;
        }
        const bb = this.projectionScale.geoPath.bounds(this.feature);
        const bounds = {
            x: bb[0][0],
            x2: bb[1][0],
            y: bb[0][1],
            y2: bb[1][1],
            width: bb[1][0] - bb[0][0],
            height: bb[1][1] - bb[0][1],
        };
        this.cache = Object.assign({}, this.cache || {}, { bounds });
        return bounds;
    }
    _drawInCache(doc) {
        const bounds = this.getBounds();
        if (!Number.isFinite(bounds.x)) {
            return;
        }
        const canvas = this.cache && this.cache.canvas ? this.cache.canvas : doc.createElement('canvas');
        canvas.width = Math.max(Math.ceil(bounds.width), 1);
        canvas.height = Math.max(Math.ceil(bounds.height), 1);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-bounds.x, -bounds.y);
        this._drawImpl(ctx);
        ctx.restore();
        this.cache = Object.assign({}, this.cache || {}, {
            canvas,
            canvasKey: this._optionsToKey(),
        });
    }
    _optionsToKey() {
        const options = this.options;
        return `${options.backgroundColor};${options.borderColor};${options.borderWidth}`;
    }
    _drawImpl(ctx) {
        const feature = this.feature;
        const options = this.options;
        ctx.beginPath();
        this.projectionScale.geoPath.context(ctx)(feature);
        if (options.backgroundColor) {
            ctx.fillStyle = options.backgroundColor;
            ctx.fill();
        }
        if (options.borderColor) {
            ctx.strokeStyle = options.borderColor;
            ctx.lineWidth = options.borderWidth;
            ctx.stroke();
        }
    }
    draw(ctx) {
        const feature = this.feature;
        if (!feature) {
            return;
        }
        if (!this.cache || this.cache.canvasKey !== this._optionsToKey()) {
            this._drawInCache(ctx.canvas.ownerDocument);
        }
        const bounds = this.getBounds();
        if (this.cache && this.cache.canvas) {
            ctx.drawImage(this.cache.canvas, bounds.x, bounds.y, bounds.width, bounds.height);
        }
        else if (Number.isFinite(bounds.x)) {
            ctx.save();
            this._drawImpl(ctx);
            ctx.restore();
        }
    }
}
GeoFeature.id = 'geoFeature';
GeoFeature.defaults = Object.assign({}, chart_js.BarElement.defaults, {
    outlineBackgroundColor: null,
    outlineBorderWidth: 0,
    graticuleBorderColor: '#CCCCCC',
    graticuleBorderWidth: 0,
});
GeoFeature.defaultRoutes = Object.assign({
    outlineBorderColor: 'borderColor',
}, chart_js.BarElement.defaultRoutes || {});

const lookup = {
    geoAzimuthalEqualArea: d3Geo.geoAzimuthalEqualArea,
    geoAzimuthalEquidistant: d3Geo.geoAzimuthalEquidistant,
    geoGnomonic: d3Geo.geoGnomonic,
    geoOrthographic: d3Geo.geoOrthographic,
    geoStereographic: d3Geo.geoStereographic,
    geoEqualEarth: d3Geo.geoEqualEarth,
    geoAlbers: d3Geo.geoAlbers,
    geoAlbersUsa: d3Geo.geoAlbersUsa,
    geoConicConformal: d3Geo.geoConicConformal,
    geoConicEqualArea: d3Geo.geoConicEqualArea,
    geoConicEquidistant: d3Geo.geoConicEquidistant,
    geoEquirectangular: d3Geo.geoEquirectangular,
    geoMercator: d3Geo.geoMercator,
    geoTransverseMercator: d3Geo.geoTransverseMercator,
    geoNaturalEarth1: d3Geo.geoNaturalEarth1,
};
Object.keys(lookup).forEach((key) => {
    lookup[`${key.charAt(3).toLowerCase()}${key.slice(4)}`] = lookup[key];
});
class ProjectionScale extends chart_js.Scale {
    constructor(cfg) {
        super(cfg);
        this.outlineBounds = null;
        this.oldChartBounds = null;
        this.geoPath = d3Geo.geoPath();
    }
    init(options) {
        options.position = 'chartArea';
        super.init(options);
        if (typeof options.projection === 'function') {
            this.projection = options.projection;
        }
        else {
            this.projection = (lookup[options.projection] || lookup['albersUsa'])();
        }
        this.geoPath.projection(this.projection);
    }
    computeBounds(outline) {
        const bb = d3Geo.geoPath(this.projection.fitWidth(1000, outline)).bounds(outline);
        const bHeight = Math.ceil(bb[1][1] - bb[0][1]);
        const bWidth = Math.ceil(bb[1][0] - bb[0][0]);
        const t = this.projection.translate();
        this.outlineBounds = {
            width: bWidth,
            height: bHeight,
            aspectRatio: bWidth / bHeight,
            refScale: this.projection.scale(),
            refX: t[0],
            refY: t[1],
        };
    }
    updateBounds() {
        const area = this.chart.chartArea;
        const bb = this.outlineBounds;
        const chartWidth = area.right - area.left;
        const chartHeight = area.bottom - area.top;
        const bak = this.oldChartBounds;
        this.oldChartBounds = {
            chartWidth,
            chartHeight,
        };
        const scale = Math.min(chartWidth / bb.width, chartHeight / bb.height);
        const viewWidth = bb.width * scale;
        const viewHeight = bb.height * scale;
        const x = (chartWidth - viewWidth) * 0.5;
        const y = (chartHeight - viewHeight) * 0.5;
        this.projection.scale(bb.refScale * scale).translate([scale * bb.refX + x, scale * bb.refY + y]);
        return (!bak || bak.chartWidth !== this.oldChartBounds.chartWidth || bak.chartHeight !== this.oldChartBounds.chartHeight);
    }
}
ProjectionScale.id = 'projection';
ProjectionScale.defaults = {
    projection: 'albersUsa',
};

const baseDefaults = {
    position: 'chartArea',
    property: 'value',
    gridLines: {
        drawOnChartArea: false,
    },
    legend: {
        align: 'right',
        position: 'bottom-right',
        length: 100,
        width: 50,
        margin: 8,
        indicatorWidth: 10,
    },
};
function BaseMixin(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.legendSize = { w: 0, h: 0 };
        }
        init(options) {
            options.position = 'chartArea';
            super.init(options);
            this.axis = 'r';
        }
        parse(raw, index) {
            if (raw && typeof raw[this.options.property] === 'number') {
                return raw[this.options.property];
            }
            return super.parse(raw, index);
        }
        isHorizontal() {
            return this.options.legend.align === 'top' || this.options.legend.align === 'bottom';
        }
        _getNormalizedValue(v) {
            if (v == null || Number.isNaN(v)) {
                return null;
            }
            return (v - this._startValue) / this._valueRange;
        }
        _getLegendMargin() {
            const indicatorWidth = this.options.legend.indicatorWidth;
            const pos = this.options.legend.align;
            const margin = this.options.legend.margin;
            const left = (typeof margin === 'number' ? margin : margin.left) + (pos === 'right' ? indicatorWidth : 0);
            const top = (typeof margin === 'number' ? margin : margin.top) + (pos === 'bottom' ? indicatorWidth : 0);
            const right = (typeof margin === 'number' ? margin : margin.right) + (pos === 'left' ? indicatorWidth : 0);
            const bottom = (typeof margin === 'number' ? margin : margin.bottom) + (pos === 'top' ? indicatorWidth : 0);
            return { left, top, right, bottom };
        }
        _getLegendPosition(chartArea) {
            const indicatorWidth = this.options.legend.indicatorWidth;
            const axisPos = this.options.legend.align;
            const isHor = this.isHorizontal();
            const w = (axisPos === 'left' ? this.legendSize.w : this.width) + (isHor ? indicatorWidth : 0);
            const h = (axisPos === 'top' ? this.legendSize.h : this.height) + (!isHor ? indicatorWidth : 0);
            const margin = this._getLegendMargin();
            const pos = this.options.legend.position;
            if (typeof pos === 'string') {
                switch (pos) {
                    case 'top-left':
                        return [margin.left, margin.top];
                    case 'top':
                        return [(chartArea.right - w) / 2, margin.top];
                    case 'left':
                        return [margin.left, (chartArea.bottom - h) / 2];
                    case 'top-right':
                        return [chartArea.right - w - margin.right, margin.top];
                    case 'bottom-right':
                        return [chartArea.right - w - margin.right, chartArea.bottom - h - margin.bottom];
                    case 'bottom':
                        return [(chartArea.right - w) / 2, chartArea.bottom - h - margin.bottom];
                    case 'bottom-left':
                        return [margin.left, chartArea.bottom - h - margin.bottom];
                    default:
                        return [chartArea.right - w - margin.right, (chartArea.bottom - h) / 2];
                }
            }
            return [pos.x, pos.y];
        }
        update(maxWidth, maxHeight, margins) {
            const ch = Math.min(maxHeight, this.bottom == null ? Number.POSITIVE_INFINITY : this.bottom);
            const cw = Math.min(maxWidth, this.right == null ? Number.POSITIVE_INFINITY : this.right);
            const l = this.options.legend;
            const isHor = this.isHorizontal();
            const factor = (v, full) => (v < 1 ? full * v : v);
            const w = Math.min(cw, factor(isHor ? l.length : l.width, cw)) - (!isHor ? l.indicatorWidth : 0);
            const h = Math.min(ch, factor(!isHor ? l.length : l.width, ch)) - (isHor ? l.indicatorWidth : 0);
            this.legendSize = { w, h };
            this.bottom = this.height = h;
            this.right = this.width = w;
            const bak = this.options.position;
            this.options.position = this.options.legend.align;
            super.update(w, h, margins);
            this.options.position = bak;
            this.height = Math.min(h, this.height);
            this.width = Math.min(w, this.width);
        }
        draw(chartArea) {
            if (!this._isVisible()) {
                return;
            }
            const pos = this._getLegendPosition(chartArea);
            const ctx = this.ctx;
            ctx.save();
            ctx.translate(pos[0], pos[1]);
            const bak = this.options.position;
            this.options.position = this.options.legend.align;
            super.draw(Object.assign({}, chartArea, {
                bottom: this.height,
                right: this.width,
            }));
            this.options.position = bak;
            const indicatorWidth = this.options.legend.indicatorWidth;
            switch (this.options.legend.align) {
                case 'left':
                    ctx.translate(this.legendSize.w, 0);
                    break;
                case 'top':
                    ctx.translate(0, this.legendSize.h);
                    break;
                case 'bottom':
                    ctx.translate(0, -indicatorWidth);
                    break;
                default:
                    ctx.translate(-indicatorWidth, 0);
                    break;
            }
            this._drawIndicator();
            ctx.restore();
        }
        _drawIndicator() {
        }
    };
}

const lookup$1 = {
    interpolateBlues: d3ScaleChromatic.interpolateBlues,
    interpolateBrBG: d3ScaleChromatic.interpolateBrBG,
    interpolateBuGn: d3ScaleChromatic.interpolateBuGn,
    interpolateBuPu: d3ScaleChromatic.interpolateBuPu,
    interpolateCividis: d3ScaleChromatic.interpolateCividis,
    interpolateCool: d3ScaleChromatic.interpolateCool,
    interpolateCubehelixDefault: d3ScaleChromatic.interpolateCubehelixDefault,
    interpolateGnBu: d3ScaleChromatic.interpolateGnBu,
    interpolateGreens: d3ScaleChromatic.interpolateGreens,
    interpolateGreys: d3ScaleChromatic.interpolateGreys,
    interpolateInferno: d3ScaleChromatic.interpolateInferno,
    interpolateMagma: d3ScaleChromatic.interpolateMagma,
    interpolateOrRd: d3ScaleChromatic.interpolateOrRd,
    interpolateOranges: d3ScaleChromatic.interpolateOranges,
    interpolatePRGn: d3ScaleChromatic.interpolatePRGn,
    interpolatePiYG: d3ScaleChromatic.interpolatePiYG,
    interpolatePlasma: d3ScaleChromatic.interpolatePlasma,
    interpolatePuBu: d3ScaleChromatic.interpolatePuBu,
    interpolatePuBuGn: d3ScaleChromatic.interpolatePuBuGn,
    interpolatePuOr: d3ScaleChromatic.interpolatePuOr,
    interpolatePuRd: d3ScaleChromatic.interpolatePuRd,
    interpolatePurples: d3ScaleChromatic.interpolatePurples,
    interpolateRainbow: d3ScaleChromatic.interpolateRainbow,
    interpolateRdBu: d3ScaleChromatic.interpolateRdBu,
    interpolateRdGy: d3ScaleChromatic.interpolateRdGy,
    interpolateRdPu: d3ScaleChromatic.interpolateRdPu,
    interpolateRdYlBu: d3ScaleChromatic.interpolateRdYlBu,
    interpolateRdYlGn: d3ScaleChromatic.interpolateRdYlGn,
    interpolateReds: d3ScaleChromatic.interpolateReds,
    interpolateSinebow: d3ScaleChromatic.interpolateSinebow,
    interpolateSpectral: d3ScaleChromatic.interpolateSpectral,
    interpolateTurbo: d3ScaleChromatic.interpolateTurbo,
    interpolateViridis: d3ScaleChromatic.interpolateViridis,
    interpolateWarm: d3ScaleChromatic.interpolateWarm,
    interpolateYlGn: d3ScaleChromatic.interpolateYlGn,
    interpolateYlGnBu: d3ScaleChromatic.interpolateYlGnBu,
    interpolateYlOrBr: d3ScaleChromatic.interpolateYlOrBr,
    interpolateYlOrRd: d3ScaleChromatic.interpolateYlOrRd,
};
Object.keys(lookup$1).forEach((key) => {
    lookup$1[`${key.charAt(11).toLowerCase()}${key.slice(12)}`] = lookup$1[key];
    lookup$1[key.slice(11)] = lookup$1[key];
});
function quantize(v, steps) {
    const perStep = 1 / steps;
    if (v <= perStep) {
        return 0;
    }
    if (v >= 1 - perStep) {
        return 1;
    }
    for (let acc = 0; acc < 1; acc += perStep) {
        if (v < acc) {
            return acc - perStep / 2;
        }
    }
    return v;
}
function ColorScaleMixin(superClass) {
    return class extends BaseMixin(superClass) {
        constructor() {
            super(...arguments);
            this.interpolate = (v) => `rgb(${v},${v},${v})`;
        }
        init(options) {
            super.init(options);
            if (typeof options.interpolate === 'function') {
                this.interpolate = options.interpolate;
            }
            else {
                this.interpolate = lookup$1[options.interpolate] || lookup$1.blues;
            }
        }
        getColorForValue(value) {
            const v = this._getNormalizedValue(value);
            if (v == null || Number.isNaN(v)) {
                return this.options.missing;
            }
            return this.getColor(v);
        }
        getColor(normalized) {
            let v = normalized;
            if (this.options.quantize > 0) {
                v = quantize(v, this.options.quantize);
            }
            return this.interpolate(v);
        }
        _drawIndicator() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;
            const indicatorSize = this.options.legend.indicatorWidth;
            const reverse = this._reversePixels;
            if (this.isHorizontal()) {
                if (this.options.quantize > 0) {
                    const stepWidth = w / this.options.quantize;
                    const offset = !reverse ? (i) => i : (i) => w - stepWidth - i;
                    for (let i = 0; i < w; i += stepWidth) {
                        const v = (i + stepWidth / 2) / w;
                        ctx.fillStyle = this.getColor(v);
                        ctx.fillRect(offset(i), 0, stepWidth, indicatorSize);
                    }
                }
                else {
                    const offset = !reverse ? (i) => i : (i) => w - 1 - i;
                    for (let i = 0; i < w; ++i) {
                        ctx.fillStyle = this.getColor((i + 0.5) / w);
                        ctx.fillRect(offset(i), 0, 1, indicatorSize);
                    }
                }
            }
            else if (this.options.quantize > 0) {
                const stepWidth = h / this.options.quantize;
                const offset = !reverse ? (i) => i : (i) => h - stepWidth - i;
                for (let i = 0; i < h; i += stepWidth) {
                    const v = (i + stepWidth / 2) / h;
                    ctx.fillStyle = this.getColor(v);
                    ctx.fillRect(0, offset(i), indicatorSize, stepWidth);
                }
            }
            else {
                const offset = !reverse ? (i) => i : (i) => h - 1 - i;
                for (let i = 0; i < h; ++i) {
                    ctx.fillStyle = this.getColor((i + 0.5) / h);
                    ctx.fillRect(0, offset(i), indicatorSize, 1);
                }
            }
        }
    };
}
const colorScaleDefaults = {
    interpolate: 'blues',
    missing: 'transparent',
    quantize: 0,
};
class ColorScale extends ColorScaleMixin(chart_js.LinearScale) {
}
ColorScale.id = 'color';
ColorScale.defaults = helpers.merge({}, [chart_js.LinearScale.defaults, baseDefaults, colorScaleDefaults]);
class ColorLogarithmicScale extends ColorScaleMixin(chart_js.LogarithmicScale) {
    _getNormalizedValue(v) {
        if (v == null || Number.isNaN(v)) {
            return null;
        }
        return (Math.log10(v) - this._startValue) / this._valueRange;
    }
}
ColorLogarithmicScale.id = 'colorLogarithmic';
ColorLogarithmicScale.defaults = helpers.merge({}, [chart_js.LogarithmicScale.defaults, baseDefaults, colorScaleDefaults]);

function SizeSaleMixin(superClass) {
    return class extends BaseMixin(superClass) {
        constructor() {
            super(...arguments);
            this._model = null;
        }
        getSizeForValue(value) {
            const v = this._getNormalizedValue(value);
            if (v == null || Number.isNaN(v)) {
                return this.options.missing;
            }
            return this.getSizeImpl(v);
        }
        getSizeImpl(normalized) {
            const [r0, r1] = this.options.range;
            if (this.options.mode === 'area') {
                const a1 = r1 * r1 * Math.PI;
                const a0 = r0 * r0 * Math.PI;
                const range = a1 - a0;
                const a = normalized * range + a0;
                return Math.sqrt(a / Math.PI);
            }
            const range = r1 - r0;
            return normalized * range + r0;
        }
        _drawIndicator() {
            const ctx = this.ctx;
            const shift = this.options.legend.indicatorWidth / 2;
            const isHor = this.isHorizontal();
            const values = this.ticks;
            const positions = this._labelItems || values.map((_, i) => ({ [isHor ? 'x' : 'y']: this.getPixelForTick(i) }));
            (this._gridLineItems || []).forEach((item) => {
                ctx.save();
                ctx.strokeStyle = item.color;
                ctx.lineWidth = item.width;
                if (ctx.setLineDash) {
                    ctx.setLineDash(item.borderDash);
                    ctx.lineDashOffset = item.borderDashOffset;
                }
                ctx.beginPath();
                if (this.options.gridLines.drawTicks) {
                    switch (this.options.legend.align) {
                        case 'left':
                            ctx.moveTo(0, item.ty1);
                            ctx.lineTo(shift, item.ty2);
                            break;
                        case 'top':
                            ctx.moveTo(item.tx1, 0);
                            ctx.lineTo(item.tx2, shift);
                            break;
                        case 'bottom':
                            ctx.moveTo(item.tx1, shift);
                            ctx.lineTo(item.tx2, shift * 2);
                            break;
                        default:
                            ctx.moveTo(shift, item.ty1);
                            ctx.lineTo(shift * 2, item.ty2);
                            break;
                    }
                }
                ctx.stroke();
                ctx.restore();
            });
            if (this._model) {
                const props = this._model;
                ctx.strokeStyle = props.borderColor || chart_js.defaults.color;
                ctx.lineWidth = props.borderWidth || 0;
                ctx.fillStyle = props.backgroundColor || chart_js.defaults.color;
            }
            else {
                ctx.fillStyle = 'blue';
            }
            values.forEach((v, i) => {
                const pos = positions[i];
                const radius = this.getSizeForValue(v.value);
                const x = isHor ? pos.x : shift;
                const y = isHor ? shift : pos.y;
                const renderOptions = Object.assign({
                    pointStyle: 'circle',
                    borderWidth: 0,
                }, this._model || {}, {
                    radius,
                });
                helpers.drawPoint(ctx, renderOptions, x, y);
            });
        }
    };
}
const scaleDefaults = {
    missing: 1,
    mode: 'area',
    range: [2, 20],
    legend: {
        align: 'bottom',
        length: 90,
        width: 70,
        indicatorWidth: 42,
    },
};
class SizeScale extends SizeSaleMixin(chart_js.LinearScale) {
}
SizeScale.id = 'size';
SizeScale.defaults = helpers.merge({}, [chart_js.LinearScale.defaults, baseDefaults, scaleDefaults]);
class SizeLogarithmicScale extends SizeSaleMixin(chart_js.LogarithmicScale) {
    _getNormalizedValue(v) {
        if (v == null || Number.isNaN(v)) {
            return null;
        }
        return (Math.log10(v) - this._startValue) / this._valueRange;
    }
}
SizeLogarithmicScale.id = 'sizeLogarithmic';
SizeLogarithmicScale.defaults = helpers.merge({}, [chart_js.LogarithmicScale.defaults, baseDefaults, scaleDefaults]);

const geoDefaults = {
    datasetElementOptions: [
        'outlineBackgroundColor',
        'outlineBorderColor',
        'outlineBorderWidth',
        'graticuleBorderColor',
        'graticuleBorderWidth',
    ],
    showOutline: false,
    showGraticule: false,
    clipMap: true,
    scales: {
        xy: {
            type: ProjectionScale.id,
            position: 'chartArea',
            display: false,
        },
    },
};
function patchDatasetElementOptions(options) {
    const r = {};
    Object.keys(options).forEach((key) => {
        let targetKey = key;
        if (key.startsWith('outline')) {
            const sub = key.slice('outline'.length);
            targetKey = sub[0].toLowerCase() + sub.slice(1);
        }
        else if (key.startsWith('hoverOutline')) {
            targetKey = 'hover' + key.slice('hoverOutline'.length);
        }
        r[targetKey] = options[key];
    });
    return r;
}
class GeoController extends chart_js.DatasetController {
    getGeoDataset() {
        return super.getDataset();
    }
    getGeoOptions() {
        return this.chart.options;
    }
    getProjectionScale() {
        return this.getScaleForId('xy');
    }
    linkScales() {
        const dataset = this.getGeoDataset();
        const meta = this.getMeta();
        meta.xAxisID = dataset.xAxisID = 'xy';
        meta.yAxisID = dataset.yAxisID = 'xy';
        meta.xScale = this.getScaleForId('xy');
        meta.yScale = this.getScaleForId('xy');
        this.getProjectionScale().computeBounds(this.resolveOutline());
    }
    showOutline() {
        return helpers.valueOrDefault(this.getGeoDataset().showOutline, this.getGeoOptions().showOutline);
    }
    clipMap() {
        return helpers.valueOrDefault(this.getGeoDataset().clipMap, this.getGeoOptions().clipMap);
    }
    getGraticule() {
        return helpers.valueOrDefault(this.getGeoDataset().showGraticule, this.getGeoOptions().showGraticule);
    }
    update(mode) {
        super.update(mode);
        const active = mode === 'active';
        const meta = this.getMeta();
        const scale = this.getProjectionScale();
        const dirtyCache = scale.updateBounds();
        if (this.showOutline()) {
            const elem = meta.dataset;
            if (dirtyCache) {
                delete elem.cache;
            }
            elem.projectionScale = scale;
            if (mode !== 'resize') {
                const options = patchDatasetElementOptions(this.resolveDatasetElementOptions(active));
                const properties = {
                    feature: this.resolveOutline(),
                    options,
                };
                this.updateElement(elem, undefined, properties, mode);
                if (this.getGraticule()) {
                    meta.graticule = options;
                }
            }
        }
        else if (this.getGraticule() && mode !== 'resize') {
            meta.graticule = patchDatasetElementOptions(this.resolveDatasetElementOptions(active));
        }
        this.updateElements(meta.data, 0, meta.data.length, mode);
        if (dirtyCache) {
            meta.data.forEach((elem) => delete elem.cache);
        }
    }
    resolveOutline() {
        const ds = this.getGeoDataset();
        const outline = ds.outline || { type: 'Sphere' };
        if (Array.isArray(outline)) {
            return {
                type: 'FeatureCollection',
                features: outline,
            };
        }
        return outline;
    }
    showGraticule() {
        const g = this.getGraticule();
        const options = this.getMeta().graticule;
        if (!g || !options) {
            return;
        }
        const ctx = this.chart.ctx;
        const scale = this.getProjectionScale();
        const path = scale.geoPath.context(ctx);
        ctx.save();
        ctx.beginPath();
        if (typeof g === 'boolean') {
            if (g) {
                path(d3Geo.geoGraticule10());
            }
        }
        else {
            const geo = d3Geo.geoGraticule();
            if (g.stepMajor) {
                geo.stepMajor(g.stepMajor);
            }
            if (g.stepMinor) {
                geo.stepMinor(g.stepMinor);
            }
            path(geo());
        }
        ctx.strokeStyle = options.graticuleBorderColor;
        ctx.lineWidth = options.graticuleBorderWidth;
        ctx.stroke();
        ctx.restore();
    }
    draw() {
        const chart = this.chart;
        const clipMap = this.clipMap();
        let enabled = false;
        if (clipMap === true || clipMap === 'outline' || clipMap === 'outline+graticule') {
            enabled = true;
            helpers.clipArea(chart.ctx, chart.chartArea);
        }
        if (this.showOutline()) {
            this.getMeta().dataset.draw(chart.ctx);
        }
        if (clipMap === true || clipMap === 'graticule' || clipMap === 'outline+graticule') {
            if (!enabled) {
                helpers.clipArea(chart.ctx, chart.chartArea);
            }
        }
        else if (enabled) {
            enabled = false;
            helpers.unclipArea(chart.ctx);
        }
        this.showGraticule();
        if (clipMap === true || clipMap === 'items') {
            if (!enabled) {
                helpers.clipArea(chart.ctx, chart.chartArea);
            }
        }
        else if (enabled) {
            enabled = false;
            helpers.unclipArea(chart.ctx);
        }
        this.getMeta().data.forEach((elem) => elem.draw(chart.ctx));
        if (enabled) {
            enabled = false;
            helpers.unclipArea(chart.ctx);
        }
    }
}

function patchController(type, config, controller, elements = [], scales = []) {
    chart_js.registry.addControllers(controller);
    if (Array.isArray(elements)) {
        chart_js.registry.addElements(...elements);
    }
    else {
        chart_js.registry.addElements(elements);
    }
    if (Array.isArray(scales)) {
        chart_js.registry.addScales(...scales);
    }
    else {
        chart_js.registry.addScales(scales);
    }
    const c = config;
    c.type = type;
    return c;
}

class ChoroplethController extends GeoController {
    initialize() {
        super.initialize();
        this.enableOptionSharing = true;
    }
    linkScales() {
        super.linkScales();
        const dataset = this.getGeoDataset();
        const meta = this.getMeta();
        meta.vAxisID = meta.rAxisID = 'color';
        dataset.vAxisID = dataset.rAxisID = 'color';
        meta.rScale = this.getScaleForId('color');
        meta.vScale = meta.rScale;
        meta.iScale = meta.xScale;
        meta.iAxisID = dataset.iAxisID = meta.xAxisID;
    }
    _getOtherScale(scale) {
        return scale;
    }
    parse(start, count) {
        const rScale = this.getMeta().rScale;
        const data = this.getDataset().data;
        const meta = this._cachedMeta;
        for (let i = start; i < start + count; ++i) {
            meta._parsed[i] = {
                [rScale.axis]: rScale.parse(data[i], i),
            };
        }
    }
    updateElements(elems, start, count, mode) {
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const scale = this.getProjectionScale();
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
        for (let i = start; i < start + count; i++) {
            const elem = elems[i];
            elem.projectionScale = scale;
            elem.feature = this._data[i].feature;
            const center = elem.getCenterPoint();
            const properties = {
                x: center.x,
                y: center.y,
            };
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, mode);
            }
            this.updateElement(elem, i, properties, mode);
        }
    }
    indexToColor(index) {
        const rScale = this.getMeta().rScale;
        return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
    }
}
ChoroplethController.id = 'choropleth';
ChoroplethController.defaults = helpers.merge({}, [
    geoDefaults,
    {
        datasetElementType: GeoFeature.id,
        dataElementType: GeoFeature.id,
        dataElementOptions: ['backgroundColor', 'borderColor', 'borderWidth'],
        plugins: {
            tooltip: {
                callbacks: {
                    title() {
                        return '';
                    },
                    label(item) {
                        if (item.formattedValue == null) {
                            return item.chart.data.labels[item.dataIndex];
                        }
                        return `${item.chart.data.labels[item.dataIndex]}: ${item.formattedValue}`;
                    },
                },
            },
        },
        scales: {
            color: {
                type: ColorScale.id,
            },
        },
        elements: {
            geoFeature: {
                backgroundColor(context) {
                    if (context.dataIndex == null) {
                        return null;
                    }
                    const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
                    return controller.indexToColor(context.dataIndex);
                },
            },
        },
    },
]);
class ChoroplethChart extends chart_js.Chart {
    constructor(item, config) {
        super(item, patchController('choropleth', config, ChoroplethController, GeoFeature, [ColorScale, ProjectionScale]));
    }
}
ChoroplethChart.id = ChoroplethController.id;

class BubbleMapController extends GeoController {
    initialize() {
        super.initialize();
        this.enableOptionSharing = true;
    }
    linkScales() {
        super.linkScales();
        const dataset = this.getGeoDataset();
        const meta = this.getMeta();
        meta.vAxisID = meta.rAxisID = 'r';
        dataset.vAxisID = dataset.rAxisID = 'r';
        meta.rScale = this.getScaleForId('r');
        meta.vScale = meta.rScale;
        meta.iScale = meta.xScale;
        meta.iAxisID = dataset.iAxisID = meta.xAxisID;
    }
    _getOtherScale(scale) {
        return scale;
    }
    parse(start, count) {
        const rScale = this.getMeta().rScale;
        const data = this.getDataset().data;
        const meta = this._cachedMeta;
        for (let i = start; i < start + count; ++i) {
            const d = data[i];
            meta._parsed[i] = {
                x: d.longitude == null ? d.x : d.longitude,
                y: d.latitude == null ? d.y : d.latitude,
                [rScale.axis]: rScale.parse(d, i),
            };
        }
    }
    updateElements(elems, start, count, mode) {
        const reset = mode === 'reset';
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const scale = this.getProjectionScale();
        this.getMeta().rScale._model = firstOpts;
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
        for (let i = start; i < start + count; i++) {
            const elem = elems[i];
            const parsed = this.getParsed(i);
            const xy = scale.projection([parsed.x, parsed.y]);
            const properties = {
                x: xy ? xy[0] : 0,
                y: xy ? xy[1] : 0,
                skip: Number.isNaN(parsed.x) || Number.isNaN(parsed.y),
            };
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, mode);
                if (reset) {
                    properties.options.radius = 0;
                }
            }
            this.updateElement(elem, i, properties, mode);
        }
    }
    indexToRadius(index) {
        const rScale = this.getMeta().rScale;
        return rScale.getSizeForValue(this.getParsed(index)[rScale.axis]);
    }
}
BubbleMapController.id = 'bubbleMap';
BubbleMapController.defaults = helpers.merge({}, [
    geoDefaults,
    {
        dataElementType: chart_js.PointElement.id,
        dataElementOptions: chart_js.BubbleController.defaults.dataElementOptions,
        datasetElementType: GeoFeature.id,
        showOutline: true,
        clipMap: 'outline+graticule',
        plugins: {
            tooltip: {
                callbacks: {
                    title() {
                        return '';
                    },
                    label(item) {
                        if (item.formattedValue == null) {
                            return item.chart.data.labels[item.dataIndex];
                        }
                        return `${item.chart.data.labels[item.dataIndex]}: ${item.formattedValue}`;
                    },
                },
            },
        },
        scales: {
            r: {
                type: SizeScale.id,
            },
        },
        elements: {
            point: {
                radius(context) {
                    if (context.dataIndex == null) {
                        return null;
                    }
                    const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
                    return controller.indexToRadius(context.dataIndex);
                },
                hoverRadius: undefined,
            },
        },
    },
]);
class BubbleMapChart extends chart_js.Chart {
    constructor(item, config) {
        super(item, patchController('bubbleMap', config, BubbleMapController, GeoFeature, [SizeScale, ProjectionScale]));
    }
}
BubbleMapChart.id = BubbleMapController.id;

exports.topojson = topojsonClient__namespace;
exports.BubbleMapChart = BubbleMapChart;
exports.BubbleMapController = BubbleMapController;
exports.ChoroplethChart = ChoroplethChart;
exports.ChoroplethController = ChoroplethController;
exports.ColorLogarithmicScale = ColorLogarithmicScale;
exports.ColorScale = ColorScale;
exports.GeoController = GeoController;
exports.GeoFeature = GeoFeature;
exports.ProjectionScale = ProjectionScale;
exports.SizeLogarithmicScale = SizeLogarithmicScale;
exports.SizeScale = SizeScale;


},{"chart.js":2,"chart.js/helpers":3,"d3-geo":7,"d3-scale-chromatic":9,"topojson-client":10}],5:[function(require,module,exports){
// https://d3js.org/d3-array/ v2.9.1 Copyright 2020 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}));
}(this, (function (exports) { 'use strict';

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector(f) {
  let delta = f;
  let compare = f;

  if (f.length === 1) {
    delta = (d, x) => f(d) - x;
    compare = ascendingComparator(f);
  }

  function left(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (compare(a[mid], x) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function right(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (compare(a[mid], x) > 0) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }

  function center(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }

  return {left, center, right};
}

function ascendingComparator(f) {
  return (d, x) => ascending(f(d), x);
}

function number(x) {
  return x === null ? NaN : +x;
}

function* numbers(values, valueof) {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}

const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
const bisectLeft = ascendingBisect.left;
const bisectCenter = bisector(number).center;

function count(values, valueof) {
  let count = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count;
      }
    }
  }
  return count;
}

function length(array) {
  return array.length | 0;
}

function empty(length) {
  return !(length > 0);
}

function arrayify(values) {
  return typeof values !== "object" || "length" in values ? values : Array.from(values);
}

function reducer(reduce) {
  return values => reduce(...values);
}

function cross(...values) {
  const reduce = typeof values[values.length - 1] === "function" && reducer(values.pop());
  values = values.map(arrayify);
  const lengths = values.map(length);
  const j = values.length - 1;
  const index = new Array(j + 1).fill(0);
  const product = [];
  if (j < 0 || lengths.some(empty)) return product;
  while (true) {
    product.push(index.map((j, i) => values[i][j]));
    let i = j;
    while (++index[i] === lengths[i]) {
      if (i === 0) return reduce ? product.map(reduce) : product;
      index[i--] = 0;
    }
  }
}

function cumsum(values, valueof) {
  var sum = 0, index = 0;
  return Float64Array.from(values, valueof === undefined
    ? v => (sum += +v || 0)
    : v => (sum += +valueof(v, index++, values) || 0));
}

function descending(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function variance(values, valueof) {
  let count = 0;
  let delta;
  let mean = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  }
  if (count > 1) return sum / (count - 1);
}

function deviation(values, valueof) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}

function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}

// https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j],
        hi = x + y,
        lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }
      if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }
    return hi;
  }
}

function fsum(values, valueof) {
  const adder = new Adder();
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        adder.add(value);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        adder.add(value);
      }
    }
  }
  return +adder;
}

function identity(x) {
  return x;
}

function group(values, ...keys) {
  return nest(values, identity, identity, keys);
}

function groups(values, ...keys) {
  return nest(values, Array.from, identity, keys);
}

function rollup(values, reduce, ...keys) {
  return nest(values, identity, reduce, keys);
}

function rollups(values, reduce, ...keys) {
  return nest(values, Array.from, reduce, keys);
}

function index(values, ...keys) {
  return nest(values, identity, unique, keys);
}

function indexes(values, ...keys) {
  return nest(values, Array.from, unique, keys);
}

function unique(values) {
  if (values.length !== 1) throw new Error("duplicate key");
  return values[0];
}

function nest(values, map, reduce, keys) {
  return (function regroup(values, i) {
    if (i >= keys.length) return reduce(values);
    const groups = new Map();
    const keyof = keys[i++];
    let index = -1;
    for (const value of values) {
      const key = keyof(value, ++index, values);
      const group = groups.get(key);
      if (group) group.push(value);
      else groups.set(key, [value]);
    }
    for (const [key, values] of groups) {
      groups.set(key, regroup(values, i));
    }
    return map(groups);
  })(values, 0);
}

var array = Array.prototype;

var slice = array.slice;

function constant(x) {
  return function() {
    return x;
  };
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    step = -step;
    start = Math.ceil(start * step);
    stop = Math.floor(stop * step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

function nice(start, stop, count) {
  let prestep;
  while (true) {
    const step = tickIncrement(start, stop, count);
    if (step === prestep || step === 0 || !isFinite(step)) {
      return [start, stop];
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    }
    prestep = step;
  }
}

function sturges(values) {
  return Math.ceil(Math.log(count(values)) / Math.LN2) + 1;
}

function bin() {
  var value = identity,
      domain = extent,
      threshold = sturges;

  function histogram(data) {
    if (!Array.isArray(data)) data = Array.from(data);

    var i,
        n = data.length,
        x,
        values = new Array(n);

    for (i = 0; i < n; ++i) {
      values[i] = value(data[i], i, data);
    }

    var xz = domain(values),
        x0 = xz[0],
        x1 = xz[1],
        tz = threshold(values, x0, x1);

    // Convert number of thresholds into uniform thresholds, and nice the
    // default domain accordingly.
    if (!Array.isArray(tz)) {
      const max = x1, tn = +tz;
      if (domain === extent) [x0, x1] = nice(x0, x1, tn);
      tz = ticks(x0, x1, tn);

      // If the last threshold is coincident with the domain’s upper bound, the
      // last bin will be zero-width. If the default domain is used, and this
      // last threshold is coincident with the maximum input value, we can
      // extend the niced upper bound by one tick to ensure uniform bin widths;
      // otherwise, we simply remove the last threshold. Note that we don’t
      // coerce values or the domain to numbers, and thus must be careful to
      // compare order (>=) rather than strict equality (===)!
      if (tz[tz.length - 1] >= x1) {
        if (max >= x1 && domain === extent) {
          const step = tickIncrement(x0, x1, tn);
          if (isFinite(step)) {
            if (step > 0) {
              x1 = (Math.floor(x1 / step) + 1) * step;
            } else if (step < 0) {
              x1 = (Math.ceil(x1 * -step) + 1) / -step;
            }
          }
        } else {
          tz.pop();
        }
      }
    }

    // Remove any thresholds outside the domain.
    var m = tz.length;
    while (tz[0] <= x0) tz.shift(), --m;
    while (tz[m - 1] > x1) tz.pop(), --m;

    var bins = new Array(m + 1),
        bin;

    // Initialize bins.
    for (i = 0; i <= m; ++i) {
      bin = bins[i] = [];
      bin.x0 = i > 0 ? tz[i - 1] : x0;
      bin.x1 = i < m ? tz[i] : x1;
    }

    // Assign data to bins by value, ignoring any outside the domain.
    for (i = 0; i < n; ++i) {
      x = values[i];
      if (x0 <= x && x <= x1) {
        bins[bisectRight(tz, x, 0, m)].push(data[i]);
      }
    }

    return bins;
  }

  histogram.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
  };

  histogram.domain = function(_) {
    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
  };

  histogram.thresholds = function(_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
  };

  return histogram;
}

function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  }
  return max;
}

function min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  }
  return min;
}

// Based on https://github.com/mourner/quickselect
// ISC license, Copyright 2018 Vladimir Agafonkin.
function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselect(array, k, newLeft, newRight, compare);
    }

    const t = array[k];
    let i = left;
    let j = right;

    swap(array, left, k);
    if (compare(array[right], t) > 0) swap(array, left, right);

    while (i < j) {
      swap(array, i, j), ++i, --j;
      while (compare(array[i], t) < 0) ++i;
      while (compare(array[j], t) > 0) --j;
    }

    if (compare(array[left], t) === 0) swap(array, left, j);
    else ++j, swap(array, j, right);

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
  return array;
}

function swap(array, i, j) {
  const t = array[i];
  array[i] = array[j];
  array[j] = t;
}

function quantile(values, p, valueof) {
  values = Float64Array.from(numbers(values, valueof));
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return min(values);
  if (p >= 1) return max(values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = max(quickselect(values, i0).subarray(0, i0 + 1)),
      value1 = min(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}

function quantileSorted(values, p, valueof = number) {
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}

function freedmanDiaconis(values, min, max) {
  return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(count(values), -1 / 3)));
}

function scott(values, min, max) {
  return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(count(values), -1 / 3)));
}

function maxIndex(values, valueof) {
  let max;
  let maxIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  }
  return maxIndex;
}

function mean(values, valueof) {
  let count = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  }
  if (count) return sum / count;
}

function median(values, valueof) {
  return quantile(values, 0.5, valueof);
}

function* flatten(arrays) {
  for (const array of arrays) {
    yield* array;
  }
}

function merge(arrays) {
  return Array.from(flatten(arrays));
}

function minIndex(values, valueof) {
  let min;
  let minIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  }
  return minIndex;
}

function pairs(values, pairof = pair) {
  const pairs = [];
  let previous;
  let first = false;
  for (const value of values) {
    if (first) pairs.push(pairof(previous, value));
    previous = value;
    first = true;
  }
  return pairs;
}

function pair(a, b) {
  return [a, b];
}

function permute(source, keys) {
  return Array.from(keys, key => source[key]);
}

function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

function least(values, compare = ascending) {
  let min;
  let defined = false;
  if (compare.length === 1) {
    let minValue;
    for (const element of values) {
      const value = compare(element);
      if (defined
          ? ascending(value, minValue) < 0
          : ascending(value, value) === 0) {
        min = element;
        minValue = value;
        defined = true;
      }
    }
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, min) < 0
          : compare(value, value) === 0) {
        min = value;
        defined = true;
      }
    }
  }
  return min;
}

function leastIndex(values, compare = ascending) {
  if (compare.length === 1) return minIndex(values, compare);
  let minValue;
  let min = -1;
  let index = -1;
  for (const value of values) {
    ++index;
    if (min < 0
        ? compare(value, value) === 0
        : compare(value, minValue) < 0) {
      minValue = value;
      min = index;
    }
  }
  return min;
}

function greatest(values, compare = ascending) {
  let max;
  let defined = false;
  if (compare.length === 1) {
    let maxValue;
    for (const element of values) {
      const value = compare(element);
      if (defined
          ? ascending(value, maxValue) > 0
          : ascending(value, value) === 0) {
        max = element;
        maxValue = value;
        defined = true;
      }
    }
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, max) > 0
          : compare(value, value) === 0) {
        max = value;
        defined = true;
      }
    }
  }
  return max;
}

function greatestIndex(values, compare = ascending) {
  if (compare.length === 1) return maxIndex(values, compare);
  let maxValue;
  let max = -1;
  let index = -1;
  for (const value of values) {
    ++index;
    if (max < 0
        ? compare(value, value) === 0
        : compare(value, maxValue) > 0) {
      maxValue = value;
      max = index;
    }
  }
  return max;
}

function scan(values, compare) {
  const index = leastIndex(values, compare);
  return index < 0 ? undefined : index;
}

var shuffle = shuffler(Math.random);

function shuffler(random) {
  return function shuffle(array, i0 = 0, i1 = array.length) {
    let m = i1 - (i0 = +i0);
    while (m) {
      const i = random() * m-- | 0, t = array[m + i0];
      array[m + i0] = array[i + i0];
      array[i + i0] = t;
    }
    return array;
  };
}

function sum(values, valueof) {
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        sum += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum += value;
      }
    }
  }
  return sum;
}

function transpose(matrix) {
  if (!(n = matrix.length)) return [];
  for (var i = -1, m = min(matrix, length$1), transpose = new Array(m); ++i < m;) {
    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
      row[j] = matrix[j][i];
    }
  }
  return transpose;
}

function length$1(d) {
  return d.length;
}

function zip() {
  return transpose(arguments);
}

function every(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index = -1;
  for (const value of values) {
    if (!test(value, ++index, values)) {
      return false;
    }
  }
  return true;
}

function some(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index = -1;
  for (const value of values) {
    if (test(value, ++index, values)) {
      return true;
    }
  }
  return false;
}

function filter(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  const array = [];
  let index = -1;
  for (const value of values) {
    if (test(value, ++index, values)) {
      array.push(value);
    }
  }
  return array;
}

function map(values, mapper) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
  return Array.from(values, (value, index) => mapper(value, index, values));
}

function reduce(values, reducer, value) {
  if (typeof reducer !== "function") throw new TypeError("reducer is not a function");
  const iterator = values[Symbol.iterator]();
  let done, next, index = -1;
  if (arguments.length < 3) {
    ({done, value} = iterator.next());
    if (done) return;
    ++index;
  }
  while (({done, value: next} = iterator.next()), !done) {
    value = reducer(value, next, ++index, values);
  }
  return value;
}

function reverse(values) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  return Array.from(values).reverse();
}

function sort(values, f = ascending) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  values = Array.from(values);
  if (f.length === 1) {
    f = values.map(f);
    return permute(values, values.map((d, i) => i).sort((i, j) => ascending(f[i], f[j])));
  }
  return values.sort(f);
}

function difference(values, ...others) {
  values = new Set(values);
  for (const other of others) {
    for (const value of other) {
      values.delete(value);
    }
  }
  return values;
}

function disjoint(values, other) {
  const iterator = other[Symbol.iterator](), set = new Set();
  for (const v of values) {
    if (set.has(v)) return false;
    let value, done;
    while (({value, done} = iterator.next())) {
      if (done) break;
      if (Object.is(v, value)) return false;
      set.add(value);
    }
  }
  return true;
}

function set(values) {
  return values instanceof Set ? values : new Set(values);
}

function intersection(values, ...others) {
  values = new Set(values);
  others = others.map(set);
  out: for (const value of values) {
    for (const other of others) {
      if (!other.has(value)) {
        values.delete(value);
        continue out;
      }
    }
  }
  return values;
}

function superset(values, other) {
  const iterator = values[Symbol.iterator](), set = new Set();
  for (const o of other) {
    if (set.has(o)) continue;
    let value, done;
    while (({value, done} = iterator.next())) {
      if (done) return false;
      set.add(value);
      if (Object.is(o, value)) break;
    }
  }
  return true;
}

function subset(values, other) {
  return superset(other, values);
}

function union(...others) {
  const set = new Set();
  for (const other of others) {
    for (const o of other) {
      set.add(o);
    }
  }
  return set;
}

exports.Adder = Adder;
exports.ascending = ascending;
exports.bin = bin;
exports.bisect = bisectRight;
exports.bisectCenter = bisectCenter;
exports.bisectLeft = bisectLeft;
exports.bisectRight = bisectRight;
exports.bisector = bisector;
exports.count = count;
exports.cross = cross;
exports.cumsum = cumsum;
exports.descending = descending;
exports.deviation = deviation;
exports.difference = difference;
exports.disjoint = disjoint;
exports.every = every;
exports.extent = extent;
exports.filter = filter;
exports.fsum = fsum;
exports.greatest = greatest;
exports.greatestIndex = greatestIndex;
exports.group = group;
exports.groups = groups;
exports.histogram = bin;
exports.index = index;
exports.indexes = indexes;
exports.intersection = intersection;
exports.least = least;
exports.leastIndex = leastIndex;
exports.map = map;
exports.max = max;
exports.maxIndex = maxIndex;
exports.mean = mean;
exports.median = median;
exports.merge = merge;
exports.min = min;
exports.minIndex = minIndex;
exports.nice = nice;
exports.pairs = pairs;
exports.permute = permute;
exports.quantile = quantile;
exports.quantileSorted = quantileSorted;
exports.quickselect = quickselect;
exports.range = range;
exports.reduce = reduce;
exports.reverse = reverse;
exports.rollup = rollup;
exports.rollups = rollups;
exports.scan = scan;
exports.shuffle = shuffle;
exports.shuffler = shuffler;
exports.some = some;
exports.sort = sort;
exports.subset = subset;
exports.sum = sum;
exports.superset = superset;
exports.thresholdFreedmanDiaconis = freedmanDiaconis;
exports.thresholdScott = scott;
exports.thresholdSturges = sturges;
exports.tickIncrement = tickIncrement;
exports.tickStep = tickStep;
exports.ticks = ticks;
exports.transpose = transpose;
exports.union = union;
exports.variance = variance;
exports.zip = zip;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],6:[function(require,module,exports){
// https://d3js.org/d3-color/ v2.0.0 Copyright 2020 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}));
}(this, function (exports) { 'use strict';

function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}

function rgb_formatRgb() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

const radians = Math.PI / 180;
const degrees = 180 / Math.PI;

// https://observablehq.com/@mbostock/lab-and-rgb
const K = 18,
    Xn = 0.96422,
    Yn = 1,
    Zn = 0.82521,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) return hcl2lab(o);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = rgb2lrgb(o.r),
      g = rgb2lrgb(o.g),
      b = rgb2lrgb(o.b),
      y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
  if (r === g && g === b) x = z = y; else {
    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function gray(l, opacity) {
  return new Lab(l, 0, 0, opacity == null ? 1 : opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

define(Lab, lab, extend(Color, {
  brighter: function(k) {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function(k) {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    x = Xn * lab2xyz(x);
    y = Yn * lab2xyz(y);
    z = Zn * lab2xyz(z);
    return new Rgb(
      lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
      lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
      lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
      this.opacity
    );
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function lrgb2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2lrgb(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * degrees;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function lch(l, c, h, opacity) {
  return arguments.length === 1 ? hclConvert(l) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

function hcl2lab(o) {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * radians;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}

define(Hcl, hcl, extend(Color, {
  brighter: function(k) {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
  },
  darker: function(k) {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
  },
  rgb: function() {
    return hcl2lab(this).rgb();
  }
}));

var A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294,
    ED = E * D,
    EB = E * B,
    BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * degrees - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Cubehelix, cubehelix, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * radians,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

exports.color = color;
exports.cubehelix = cubehelix;
exports.gray = gray;
exports.hcl = hcl;
exports.hsl = hsl;
exports.lab = lab;
exports.lch = lch;
exports.rgb = rgb;

Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],7:[function(require,module,exports){
// https://d3js.org/d3-geo/ v2.0.1 Copyright 2020 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-array'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, function (exports, d3Array) { 'use strict';

var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;

var degrees = 180 / pi;
var radians = pi / 180;

var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var ceil = Math.ceil;
var exp = Math.exp;
var hypot = Math.hypot;
var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
var sqrt = Math.sqrt;
var tan = Math.tan;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}

function haversin(x) {
  return (x = sin(x / 2)) * x;
}

function noop() {}

function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}

var streamObjectType = {
  Feature: function(object, stream) {
    streamGeometry(object.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};

var streamGeometryType = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString: function(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};

function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}

function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}

function geoStream(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
}

var areaRingSum = new d3Array.Adder();

// hello?

var areaSum = new d3Array.Adder(),
    lambda00,
    phi00,
    lambda0,
    cosPhi0,
    sinPhi0;

var areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaRingSum = new d3Array.Adder();
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    var areaRing = +areaRingSum;
    areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
    this.lineStart = this.lineEnd = this.point = noop;
  },
  sphere: function() {
    areaSum.add(tau);
  }
};

function areaRingStart() {
  areaStream.point = areaPointFirst;
}

function areaRingEnd() {
  areaPoint(lambda00, phi00);
}

function areaPointFirst(lambda, phi) {
  areaStream.point = areaPoint;
  lambda00 = lambda, phi00 = phi;
  lambda *= radians, phi *= radians;
  lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
}

function areaPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  phi = phi / 2 + quarterPi; // half the angular distance from south pole

  // Spherical excess E for a spherical triangle with vertices: south pole,
  // previous point, current point.  Uses a formula derived from Cagnoli’s
  // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
  var dLambda = lambda - lambda0,
      sdLambda = dLambda >= 0 ? 1 : -1,
      adLambda = sdLambda * dLambda,
      cosPhi = cos(phi),
      sinPhi = sin(phi),
      k = sinPhi0 * sinPhi,
      u = cosPhi0 * cosPhi + k * cos(adLambda),
      v = k * sdLambda * sin(adLambda);
  areaRingSum.add(atan2(v, u));

  // Advance the previous points.
  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
}

function area(object) {
  areaSum = new d3Array.Adder();
  geoStream(object, areaStream);
  return areaSum * 2;
}

function spherical(cartesian) {
  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
}

function cartesian(spherical) {
  var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}

function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return a
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}

function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}

// TODO return d
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

var lambda0$1, phi0, lambda1, phi1, // bounds
    lambda2, // previous lambda-coordinate
    lambda00$1, phi00$1, // first point
    p0, // previous 3D point
    deltaSum,
    ranges,
    range;

var boundsStream = {
  point: boundsPoint,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function() {
    boundsStream.point = boundsRingPoint;
    boundsStream.lineStart = boundsRingStart;
    boundsStream.lineEnd = boundsRingEnd;
    deltaSum = new d3Array.Adder();
    areaStream.polygonStart();
  },
  polygonEnd: function() {
    areaStream.polygonEnd();
    boundsStream.point = boundsPoint;
    boundsStream.lineStart = boundsLineStart;
    boundsStream.lineEnd = boundsLineEnd;
    if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
    else if (deltaSum > epsilon) phi1 = 90;
    else if (deltaSum < -epsilon) phi0 = -90;
    range[0] = lambda0$1, range[1] = lambda1;
  },
  sphere: function() {
    lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
  }
};

function boundsPoint(lambda, phi) {
  ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
}

function linePoint(lambda, phi) {
  var p = cartesian([lambda * radians, phi * radians]);
  if (p0) {
    var normal = cartesianCross(p0, p),
        equatorial = [normal[1], -normal[0], 0],
        inflection = cartesianCross(equatorial, normal);
    cartesianNormalizeInPlace(inflection);
    inflection = spherical(inflection);
    var delta = lambda - lambda2,
        sign = delta > 0 ? 1 : -1,
        lambdai = inflection[0] * degrees * sign,
        phii,
        antimeridian = abs(delta) > 180;
    if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = inflection[1] * degrees;
      if (phii > phi1) phi1 = phii;
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = -inflection[1] * degrees;
      if (phii < phi0) phi0 = phii;
    } else {
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
      } else {
        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
      }
    } else {
      if (lambda1 >= lambda0$1) {
        if (lambda < lambda0$1) lambda0$1 = lambda;
        if (lambda > lambda1) lambda1 = lambda;
      } else {
        if (lambda > lambda2) {
          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
        }
      }
    }
  } else {
    ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  }
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
  p0 = p, lambda2 = lambda;
}

function boundsLineStart() {
  boundsStream.point = linePoint;
}

function boundsLineEnd() {
  range[0] = lambda0$1, range[1] = lambda1;
  boundsStream.point = boundsPoint;
  p0 = null;
}

function boundsRingPoint(lambda, phi) {
  if (p0) {
    var delta = lambda - lambda2;
    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
  } else {
    lambda00$1 = lambda, phi00$1 = phi;
  }
  areaStream.point(lambda, phi);
  linePoint(lambda, phi);
}

function boundsRingStart() {
  areaStream.lineStart();
}

function boundsRingEnd() {
  boundsRingPoint(lambda00$1, phi00$1);
  areaStream.lineEnd();
  if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
  range[0] = lambda0$1, range[1] = lambda1;
  p0 = null;
}

// Finds the left-right distance between two longitudes.
// This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
// the distance between ±180° to be 360°.
function angle(lambda0, lambda1) {
  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
}

function rangeCompare(a, b) {
  return a[0] - b[0];
}

function rangeContains(range, x) {
  return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
}

function bounds(feature) {
  var i, n, a, b, merged, deltaMax, delta;

  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
  ranges = [];
  geoStream(feature, boundsStream);

  // First, sort ranges by their minimum longitudes.
  if (n = ranges.length) {
    ranges.sort(rangeCompare);

    // Then, merge any ranges that overlap.
    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
      b = ranges[i];
      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
      } else {
        merged.push(a = b);
      }
    }

    // Finally, find the largest gap between the merged ranges.
    // The final bounding box will be the inverse of this gap.
    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
      b = merged[i];
      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
    }
  }

  ranges = range = null;

  return lambda0$1 === Infinity || phi0 === Infinity
      ? [[NaN, NaN], [NaN, NaN]]
      : [[lambda0$1, phi0], [lambda1, phi1]];
}

var W0, W1,
    X0, Y0, Z0,
    X1, Y1, Z1,
    X2, Y2, Z2,
    lambda00$2, phi00$2, // first point
    x0, y0, z0; // previous point

var centroidStream = {
  sphere: noop,
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  }
};

// Arithmetic mean of Cartesian vectors.
function centroidPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
}

function centroidPointCartesian(x, y, z) {
  ++W0;
  X0 += (x - X0) / W0;
  Y0 += (y - Y0) / W0;
  Z0 += (z - Z0) / W0;
}

function centroidLineStart() {
  centroidStream.point = centroidLinePointFirst;
}

function centroidLinePointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  x0 = cosPhi * cos(lambda);
  y0 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidStream.point = centroidLinePoint;
  centroidPointCartesian(x0, y0, z0);
}

function centroidLinePoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi),
      x = cosPhi * cos(lambda),
      y = cosPhi * sin(lambda),
      z = sin(phi),
      w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}

// See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
// J. Applied Mechanics 42, 239 (1975).
function centroidRingStart() {
  centroidStream.point = centroidRingPointFirst;
}

function centroidRingEnd() {
  centroidRingPoint(lambda00$2, phi00$2);
  centroidStream.point = centroidPoint;
}

function centroidRingPointFirst(lambda, phi) {
  lambda00$2 = lambda, phi00$2 = phi;
  lambda *= radians, phi *= radians;
  centroidStream.point = centroidRingPoint;
  var cosPhi = cos(phi);
  x0 = cosPhi * cos(lambda);
  y0 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidPointCartesian(x0, y0, z0);
}

function centroidRingPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi),
      x = cosPhi * cos(lambda),
      y = cosPhi * sin(lambda),
      z = sin(phi),
      cx = y0 * z - z0 * y,
      cy = z0 * x - x0 * z,
      cz = x0 * y - y0 * x,
      m = hypot(cx, cy, cz),
      w = asin(m), // line weight = angle
      v = m && -w / m; // area weight multiplier
  X2.add(v * cx);
  Y2.add(v * cy);
  Z2.add(v * cz);
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

function centroid(object) {
  W0 = W1 =
  X0 = Y0 = Z0 =
  X1 = Y1 = Z1 = 0;
  X2 = new d3Array.Adder();
  Y2 = new d3Array.Adder();
  Z2 = new d3Array.Adder();
  geoStream(object, centroidStream);

  var x = +X2,
      y = +Y2,
      z = +Z2,
      m = hypot(x, y, z);

  // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
  if (m < epsilon2) {
    x = X1, y = Y1, z = Z1;
    // If the feature has zero length, fall back to arithmetic mean of point vectors.
    if (W1 < epsilon) x = X0, y = Y0, z = Z0;
    m = hypot(x, y, z);
    // If the feature still has an undefined ccentroid, then return.
    if (m < epsilon2) return [NaN, NaN];
  }

  return [atan2(y, x) * degrees, asin(z / m) * degrees];
}

function constant(x) {
  return function() {
    return x;
  };
}

function compose(a, b) {

  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }

  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };

  return compose;
}

function rotationIdentity(lambda, phi) {
  return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
}

rotationIdentity.invert = rotationIdentity;

function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
    : rotationLambda(deltaLambda))
    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
    : rotationIdentity);
}

function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  };
}

function rotationLambda(deltaLambda) {
  var rotation = forwardRotationLambda(deltaLambda);
  rotation.invert = forwardRotationLambda(-deltaLambda);
  return rotation;
}

function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi),
      sinDeltaPhi = sin(deltaPhi),
      cosDeltaGamma = cos(deltaGamma),
      sinDeltaGamma = sin(deltaGamma);

  function rotation(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }

  rotation.invert = function(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };

  return rotation;
}

function rotation(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  }

  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  };

  return forward;
}

// Generates a circle centered at [0°, 0°], with a given radius and precision.
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius),
      sinRadius = sin(radius),
      step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}

// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}

function circle() {
  var center = constant([0, 0]),
      radius = constant(90),
      precision = constant(6),
      ring,
      rotate,
      stream = {point: point};

  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees, x[1] *= degrees;
  }

  function circle() {
    var c = center.apply(this, arguments),
        r = radius.apply(this, arguments) * radians,
        p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circleStream(stream, r, p, 1);
    c = {type: "Polygon", coordinates: [ring]};
    ring = rotate = null;
    return c;
  }

  circle.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle) : center;
  };

  circle.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle) : radius;
  };

  circle.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle) : precision;
  };

  return circle;
}

function clipBuffer() {
  var lines = [],
      line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}

function pointEqual(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}

function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other; // another intersection
  this.e = entry; // is an entry?
  this.v = false; // visited
  this.n = this.p = null; // next & previous
}

// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
  var subject = [],
      clip = [],
      i,
      n;

  segments.forEach(function(segment) {
    if ((n = segment.length - 1) <= 0) return;
    var n, p0 = segment[0], p1 = segment[n], x;

    if (pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      // handle degenerate cases by moving the point
      p1[0] += 2 * epsilon;
    }

    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });

  if (!subject.length) return;

  clip.sort(compareIntersection);
  link(subject);
  link(clip);

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }

  var start = subject[0],
      points,
      point;

  while (1) {
    // Find first unvisited intersection.
    var current = start,
        isSubject = true;
    while (current.v) if ((current = current.n) === start) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}

function link(array) {
  if (!(n = array.length)) return;
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}

function longitude(point) {
  if (abs(point[0]) <= pi)
    return point[0];
  else
    return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
}

function polygonContains(polygon, point) {
  var lambda = longitude(point),
      phi = point[1],
      sinPhi = sin(phi),
      normal = [sin(lambda), -cos(lambda), 0],
      angle = 0,
      winding = 0;

  var sum = new d3Array.Adder();

  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;

  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring,
        m,
        point0 = ring[m - 1],
        lambda0 = longitude(point0),
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = sin(phi0),
        cosPhi0 = cos(phi0);

    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j],
          lambda1 = longitude(point1),
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = sin(phi1),
          cosPhi1 = cos(phi1),
          delta = lambda1 - lambda0,
          sign = delta >= 0 ? 1 : -1,
          absDelta = sign * delta,
          antimeridian = absDelta > pi,
          k = sinPhi0 * sinPhi1;

      sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign * tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
}

function clip(pointVisible, clipLine, interpolate, start) {
  return function(sink) {
    var line = clipLine(sink),
        ringBuffer = clipBuffer(),
        ringSink = clipLine(ringBuffer),
        polygonStarted = false,
        polygon,
        segments,
        ring;

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = d3Array.merge(segments);
        var startInside = polygonContains(polygon, start);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };

    function point(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }

    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();

      var clean = ringSink.clean(),
          ringSegments = ringBuffer.result(),
          i, n = ringSegments.length, m,
          segment,
          point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
}

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}

var clipAntimeridian = clip(
  function() { return true; },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);

// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream) {
  var lambda0 = NaN,
      phi0 = NaN,
      sign0 = NaN,
      clean; // no intersections

  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi : -pi,
          delta = abs(lambda1 - lambda0);
      if (abs(delta - pi) < epsilon) { // line crosses a pole
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
        if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean; // if intersections, rejoin first and last segments
    }
  };
}

function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0,
      cosPhi1,
      sinLambda0Lambda1 = sin(lambda0 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon
      ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
          - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
      : (phi0 + phi1) / 2;
}

function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}

function clipCircle(radius) {
  var cr = cos(radius),
      delta = 6 * radians,
      smallRadius = cr > 0,
      notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

  function interpolate(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }

  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }

  // Takes a line and cuts into visible segments. Return values used for polygon
  // clipping: 0 - there were intersections or the line was empty; 1 - no
  // intersections 2 - there were intersections, and the first and last segments
  // should be rejoined.
  function clipLine(stream) {
    var point0, // previous point
        c0, // code for previous point
        v0, // visibility of previous point
        v00, // visibility of first point
        clean; // no intersections
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi],
            point2,
            v = visible(lambda, phi),
            c = smallRadius
              ? v ? 0 : code(lambda, phi)
              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            // outside going in
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            // inside going out
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          // If the codes for two points are different, or are both zero,
          // and there this segment intersects with the small circle.
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | ((v00 && v0) << 1);
      }
    };
  }

  // Intersects the great circle between a and b with the clip circle.
  function intersect(a, b, two) {
    var pa = cartesian(a),
        pb = cartesian(b);

    // We have two planes, n1.p = d1 and n2.p = d2.
    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
    var n1 = [1, 0, 0], // normal
        n2 = cartesianCross(pa, pb),
        n2n2 = cartesianDot(n2, n2),
        n1n2 = n2[0], // cartesianDot(n1, n2),
        determinant = n2n2 - n1n2 * n1n2;

    // Two polar points.
    if (!determinant) return !two && a;

    var c1 =  cr * n2n2 / determinant,
        c2 = -cr * n1n2 / determinant,
        n1xn2 = cartesianCross(n1, n2),
        A = cartesianScale(n1, c1),
        B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);

    // Solve |p(t)|^2 = 1.
    var u = n1xn2,
        w = cartesianDot(A, u),
        uu = cartesianDot(u, u),
        t2 = w * w - uu * (cartesianDot(A, A) - 1);

    if (t2 < 0) return;

    var t = sqrt(t2),
        q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);

    if (!two) return q;

    // Two intersection points.
    var lambda0 = a[0],
        lambda1 = b[0],
        phi0 = a[1],
        phi1 = b[1],
        z;

    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

    var delta = lambda1 - lambda0,
        polar = abs(delta - pi) < epsilon,
        meridian = polar || delta < epsilon;

    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

    // Check that the first point is between a and b.
    if (meridian
        ? polar
          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
          : phi0 <= q[1] && q[1] <= phi1
        : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }

  // Generates a 4-bit vector representing the location of a point relative to
  // the small circle's bounding box.
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius,
        code = 0;
    if (lambda < -r) code |= 1; // left
    else if (lambda > r) code |= 2; // right
    if (phi < -r) code |= 4; // below
    else if (phi > r) code |= 8; // above
    return code;
  }

  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}

function clipLine(a, b, x0, y0, x1, y1) {
  var ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}

var clipMax = 1e9, clipMin = -clipMax;

// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

function clipRectangle(x0, y0, x1, y1) {

  function visible(x, y) {
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null
        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
        || comparePoint(from, to) < 0 ^ direction > 0) {
      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function corner(p, direction) {
    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
  }

  function compareIntersection(a, b) {
    return comparePoint(a.x, b.x);
  }

  function comparePoint(a, b) {
    var ca = corner(a, 1),
        cb = corner(b, 1);
    return ca !== cb ? ca - cb
        : ca === 0 ? b[1] - a[1]
        : ca === 1 ? a[0] - b[0]
        : ca === 2 ? a[1] - b[1]
        : b[0] - a[0];
  }

  return function(stream) {
    var activeStream = stream,
        bufferStream = clipBuffer(),
        segments,
        polygon,
        ring,
        x__, y__, v__, // first point
        x_, y_, v_, // previous point
        first,
        clean;

    var clipStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: polygonStart,
      polygonEnd: polygonEnd
    };

    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }

    function polygonInside() {
      var winding = 0;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
        }
      }

      return winding;
    }

    // Buffer geometry within a polygon and then clip it en masse.
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }

    function polygonEnd() {
      var startInside = polygonInside(),
          cleanInside = clean && startInside,
          visible = (segments = d3Array.merge(segments)).length;
      if (cleanInside || visible) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible) {
          clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }

    function lineStart() {
      clipStream.point = linePoint;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }

    // TODO rather than special-case polygons, simply handle them separately.
    // Ideally, coincident intersection points should be jittered to avoid
    // clipping issues.
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }

    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x0, y0, x1, y1)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }

    return clipStream;
  };
}

function extent() {
  var x0 = 0,
      y0 = 0,
      x1 = 960,
      y1 = 500,
      cache,
      cacheStream,
      clip;

  return clip = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream);
    },
    extent: function(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
    }
  };
}

var lengthSum,
    lambda0$2,
    sinPhi0$1,
    cosPhi0$1;

var lengthStream = {
  sphere: noop,
  point: noop,
  lineStart: lengthLineStart,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop
};

function lengthLineStart() {
  lengthStream.point = lengthPointFirst;
  lengthStream.lineEnd = lengthLineEnd;
}

function lengthLineEnd() {
  lengthStream.point = lengthStream.lineEnd = noop;
}

function lengthPointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
  lengthStream.point = lengthPoint;
}

function lengthPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var sinPhi = sin(phi),
      cosPhi = cos(phi),
      delta = abs(lambda - lambda0$2),
      cosDelta = cos(delta),
      sinDelta = sin(delta),
      x = cosPhi * sinDelta,
      y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
      z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
  lengthSum.add(atan2(sqrt(x * x + y * y), z));
  lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
}

function length(object) {
  lengthSum = new d3Array.Adder();
  geoStream(object, lengthStream);
  return +lengthSum;
}

var coordinates = [null, null],
    object = {type: "LineString", coordinates: coordinates};

function distance(a, b) {
  coordinates[0] = a;
  coordinates[1] = b;
  return length(object);
}

var containsObjectType = {
  Feature: function(object, point) {
    return containsGeometry(object.geometry, point);
  },
  FeatureCollection: function(object, point) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
    return false;
  }
};

var containsGeometryType = {
  Sphere: function() {
    return true;
  },
  Point: function(object, point) {
    return containsPoint(object.coordinates, point);
  },
  MultiPoint: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsPoint(coordinates[i], point)) return true;
    return false;
  },
  LineString: function(object, point) {
    return containsLine(object.coordinates, point);
  },
  MultiLineString: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsLine(coordinates[i], point)) return true;
    return false;
  },
  Polygon: function(object, point) {
    return containsPolygon(object.coordinates, point);
  },
  MultiPolygon: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsPolygon(coordinates[i], point)) return true;
    return false;
  },
  GeometryCollection: function(object, point) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) if (containsGeometry(geometries[i], point)) return true;
    return false;
  }
};

function containsGeometry(geometry, point) {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type)
      ? containsGeometryType[geometry.type](geometry, point)
      : false;
}

function containsPoint(coordinates, point) {
  return distance(coordinates, point) === 0;
}

function containsLine(coordinates, point) {
  var ao, bo, ab;
  for (var i = 0, n = coordinates.length; i < n; i++) {
    bo = distance(coordinates[i], point);
    if (bo === 0) return true;
    if (i > 0) {
      ab = distance(coordinates[i], coordinates[i - 1]);
      if (
        ab > 0 &&
        ao <= ab &&
        bo <= ab &&
        (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab
      )
        return true;
    }
    ao = bo;
  }
  return false;
}

function containsPolygon(coordinates, point) {
  return !!polygonContains(coordinates.map(ringRadians), pointRadians(point));
}

function ringRadians(ring) {
  return ring = ring.map(pointRadians), ring.pop(), ring;
}

function pointRadians(point) {
  return [point[0] * radians, point[1] * radians];
}

function contains(object, point) {
  return (object && containsObjectType.hasOwnProperty(object.type)
      ? containsObjectType[object.type]
      : containsGeometry)(object, point);
}

function graticuleX(y0, y1, dy) {
  var y = d3Array.range(y0, y1 - epsilon, dy).concat(y1);
  return function(x) { return y.map(function(y) { return [x, y]; }); };
}

function graticuleY(x0, x1, dx) {
  var x = d3Array.range(x0, x1 - epsilon, dx).concat(x1);
  return function(y) { return x.map(function(x) { return [x, y]; }); };
}

function graticule() {
  var x1, x0, X1, X0,
      y1, y0, Y1, Y0,
      dx = 10, dy = dx, DX = 90, DY = 360,
      x, y, X, Y,
      precision = 2.5;

  function graticule() {
    return {type: "MultiLineString", coordinates: lines()};
  }

  function lines() {
    return d3Array.range(ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(d3Array.range(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(d3Array.range(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs(x % DX) > epsilon; }).map(x))
        .concat(d3Array.range(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs(y % DY) > epsilon; }).map(y));
  }

  graticule.lines = function() {
    return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
  };

  graticule.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X(X0).concat(
        Y(Y1).slice(1),
        X(X1).reverse().slice(1),
        Y(Y0).reverse().slice(1))
      ]
    };
  };

  graticule.extent = function(_) {
    if (!arguments.length) return graticule.extentMinor();
    return graticule.extentMajor(_).extentMinor(_);
  };

  graticule.extentMajor = function(_) {
    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
    X0 = +_[0][0], X1 = +_[1][0];
    Y0 = +_[0][1], Y1 = +_[1][1];
    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
    return graticule.precision(precision);
  };

  graticule.extentMinor = function(_) {
    if (!arguments.length) return [[x0, y0], [x1, y1]];
    x0 = +_[0][0], x1 = +_[1][0];
    y0 = +_[0][1], y1 = +_[1][1];
    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
    return graticule.precision(precision);
  };

  graticule.step = function(_) {
    if (!arguments.length) return graticule.stepMinor();
    return graticule.stepMajor(_).stepMinor(_);
  };

  graticule.stepMajor = function(_) {
    if (!arguments.length) return [DX, DY];
    DX = +_[0], DY = +_[1];
    return graticule;
  };

  graticule.stepMinor = function(_) {
    if (!arguments.length) return [dx, dy];
    dx = +_[0], dy = +_[1];
    return graticule;
  };

  graticule.precision = function(_) {
    if (!arguments.length) return precision;
    precision = +_;
    x = graticuleX(y0, y1, 90);
    y = graticuleY(x0, x1, precision);
    X = graticuleX(Y0, Y1, 90);
    Y = graticuleY(X0, X1, precision);
    return graticule;
  };

  return graticule
      .extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]])
      .extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}

function graticule10() {
  return graticule()();
}

function interpolate(a, b) {
  var x0 = a[0] * radians,
      y0 = a[1] * radians,
      x1 = b[0] * radians,
      y1 = b[1] * radians,
      cy0 = cos(y0),
      sy0 = sin(y0),
      cy1 = cos(y1),
      sy1 = sin(y1),
      kx0 = cy0 * cos(x0),
      ky0 = cy0 * sin(x0),
      kx1 = cy1 * cos(x1),
      ky1 = cy1 * sin(x1),
      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
      k = sin(d);

  var interpolate = d ? function(t) {
    var B = sin(t *= d) / k,
        A = sin(d - t) / k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      atan2(y, x) * degrees,
      atan2(z, sqrt(x * x + y * y)) * degrees
    ];
  } : function() {
    return [x0 * degrees, y0 * degrees];
  };

  interpolate.distance = d;

  return interpolate;
}

var identity = x => x;

var areaSum$1 = new d3Array.Adder(),
    areaRingSum$1 = new d3Array.Adder(),
    x00,
    y00,
    x0$1,
    y0$1;

var areaStream$1 = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaStream$1.lineStart = areaRingStart$1;
    areaStream$1.lineEnd = areaRingEnd$1;
  },
  polygonEnd: function() {
    areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop;
    areaSum$1.add(abs(areaRingSum$1));
    areaRingSum$1 = new d3Array.Adder();
  },
  result: function() {
    var area = areaSum$1 / 2;
    areaSum$1 = new d3Array.Adder();
    return area;
  }
};

function areaRingStart$1() {
  areaStream$1.point = areaPointFirst$1;
}

function areaPointFirst$1(x, y) {
  areaStream$1.point = areaPoint$1;
  x00 = x0$1 = x, y00 = y0$1 = y;
}

function areaPoint$1(x, y) {
  areaRingSum$1.add(y0$1 * x - x0$1 * y);
  x0$1 = x, y0$1 = y;
}

function areaRingEnd$1() {
  areaPoint$1(x00, y00);
}

var x0$2 = Infinity,
    y0$2 = x0$2,
    x1 = -x0$2,
    y1 = x1;

var boundsStream$1 = {
  point: boundsPoint$1,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};

function boundsPoint$1(x, y) {
  if (x < x0$2) x0$2 = x;
  if (x > x1) x1 = x;
  if (y < y0$2) y0$2 = y;
  if (y > y1) y1 = y;
}

// TODO Enforce positive area for exterior, negative area for interior?

var X0$1 = 0,
    Y0$1 = 0,
    Z0$1 = 0,
    X1$1 = 0,
    Y1$1 = 0,
    Z1$1 = 0,
    X2$1 = 0,
    Y2$1 = 0,
    Z2$1 = 0,
    x00$1,
    y00$1,
    x0$3,
    y0$3;

var centroidStream$1 = {
  point: centroidPoint$1,
  lineStart: centroidLineStart$1,
  lineEnd: centroidLineEnd$1,
  polygonStart: function() {
    centroidStream$1.lineStart = centroidRingStart$1;
    centroidStream$1.lineEnd = centroidRingEnd$1;
  },
  polygonEnd: function() {
    centroidStream$1.point = centroidPoint$1;
    centroidStream$1.lineStart = centroidLineStart$1;
    centroidStream$1.lineEnd = centroidLineEnd$1;
  },
  result: function() {
    var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1]
        : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1]
        : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1]
        : [NaN, NaN];
    X0$1 = Y0$1 = Z0$1 =
    X1$1 = Y1$1 = Z1$1 =
    X2$1 = Y2$1 = Z2$1 = 0;
    return centroid;
  }
};

function centroidPoint$1(x, y) {
  X0$1 += x;
  Y0$1 += y;
  ++Z0$1;
}

function centroidLineStart$1() {
  centroidStream$1.point = centroidPointFirstLine;
}

function centroidPointFirstLine(x, y) {
  centroidStream$1.point = centroidPointLine;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidPointLine(x, y) {
  var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidLineEnd$1() {
  centroidStream$1.point = centroidPoint$1;
}

function centroidRingStart$1() {
  centroidStream$1.point = centroidPointFirstRing;
}

function centroidRingEnd$1() {
  centroidPointRing(x00$1, y00$1);
}

function centroidPointFirstRing(x, y) {
  centroidStream$1.point = centroidPointRing;
  centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
}

function centroidPointRing(x, y) {
  var dx = x - x0$3,
      dy = y - y0$3,
      z = sqrt(dx * dx + dy * dy);

  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;

  z = y0$3 * x - x0$3 * y;
  X2$1 += z * (x0$3 + x);
  Y2$1 += z * (y0$3 + y);
  Z2$1 += z * 3;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function PathContext(context) {
  this._context = context;
}

PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop
};

var lengthSum$1 = new d3Array.Adder(),
    lengthRing,
    x00$2,
    y00$2,
    x0$4,
    y0$4;

var lengthStream$1 = {
  point: noop,
  lineStart: function() {
    lengthStream$1.point = lengthPointFirst$1;
  },
  lineEnd: function() {
    if (lengthRing) lengthPoint$1(x00$2, y00$2);
    lengthStream$1.point = noop;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +lengthSum$1;
    lengthSum$1 = new d3Array.Adder();
    return length;
  }
};

function lengthPointFirst$1(x, y) {
  lengthStream$1.point = lengthPoint$1;
  x00$2 = x0$4 = x, y00$2 = y0$4 = y;
}

function lengthPoint$1(x, y) {
  x0$4 -= x, y0$4 -= y;
  lengthSum$1.add(sqrt(x0$4 * x0$4 + y0$4 * y0$4));
  x0$4 = x, y0$4 = y;
}

function PathString() {
  this._string = [];
}

PathString.prototype = {
  _radius: 4.5,
  _circle: circle$1(4.5),
  pointRadius: function(_) {
    if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
    return this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._string.push("Z");
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._string.push("M", x, ",", y);
        this._point = 1;
        break;
      }
      case 1: {
        this._string.push("L", x, ",", y);
        break;
      }
      default: {
        if (this._circle == null) this._circle = circle$1(this._radius);
        this._string.push("M", x, ",", y, this._circle);
        break;
      }
    }
  },
  result: function() {
    if (this._string.length) {
      var result = this._string.join("");
      this._string = [];
      return result;
    } else {
      return null;
    }
  }
};

function circle$1(radius) {
  return "m0," + radius
      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
      + "z";
}

function index(projection, context) {
  var pointRadius = 4.5,
      projectionStream,
      contextStream;

  function path(object) {
    if (object) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object, projectionStream(contextStream));
    }
    return contextStream.result();
  }

  path.area = function(object) {
    geoStream(object, projectionStream(areaStream$1));
    return areaStream$1.result();
  };

  path.measure = function(object) {
    geoStream(object, projectionStream(lengthStream$1));
    return lengthStream$1.result();
  };

  path.bounds = function(object) {
    geoStream(object, projectionStream(boundsStream$1));
    return boundsStream$1.result();
  };

  path.centroid = function(object) {
    geoStream(object, projectionStream(centroidStream$1));
    return centroidStream$1.result();
  };

  path.projection = function(_) {
    return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
  };

  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };

  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };

  return path.projection(projection).context(context);
}

function transform(methods) {
  return {
    stream: transformer(methods)
  };
}

function transformer(methods) {
  return function(stream) {
    var s = new TransformStream;
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}

function TransformStream() {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) { this.stream.point(x, y); },
  sphere: function() { this.stream.sphere(); },
  lineStart: function() { this.stream.lineStart(); },
  lineEnd: function() { this.stream.lineEnd(); },
  polygonStart: function() { this.stream.polygonStart(); },
  polygonEnd: function() { this.stream.polygonEnd(); }
};

function fit(projection, fitBounds, object) {
  var clip = projection.clipExtent && projection.clipExtent();
  projection.scale(150).translate([0, 0]);
  if (clip != null) projection.clipExtent(null);
  geoStream(object, projection.stream(boundsStream$1));
  fitBounds(boundsStream$1.result());
  if (clip != null) projection.clipExtent(clip);
  return projection;
}

function fitExtent(projection, extent, object) {
  return fit(projection, function(b) {
    var w = extent[1][0] - extent[0][0],
        h = extent[1][1] - extent[0][1],
        k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
        x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
        y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

function fitSize(projection, size, object) {
  return fitExtent(projection, [[0, 0], size], object);
}

function fitWidth(projection, width, object) {
  return fit(projection, function(b) {
    var w = +width,
        k = w / (b[1][0] - b[0][0]),
        x = (w - k * (b[1][0] + b[0][0])) / 2,
        y = -k * b[0][1];
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

function fitHeight(projection, height, object) {
  return fit(projection, function(b) {
    var h = +height,
        k = h / (b[1][1] - b[0][1]),
        x = -k * b[0][0],
        y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

var maxDepth = 16, // maximum depth of subdivision
    cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

function resample(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
}

function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}

function resample$1(project, delta2) {

  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
    var dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = sqrt(a * a + b * b + c * c),
          phi2 = asin(c /= m),
          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
          p = project(lambda2, phi2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 // perpendicular projected distance
          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x00, y00, a00, b00, c00, // first point
        lambda0, x0, y0, a0, b0, c0; // previous point

    var resampleStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
    };

    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }

    function lineStart() {
      x0 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }

    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x0, y0);
    }

    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }

    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }

    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }

    function ringEnd() {
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }

    return resampleStream;
  };
}

var transformRadians = transformer({
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});

function transformRotate(rotate) {
  return transformer({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}

function scaleTranslate(k, dx, dy, sx, sy) {
  function transform(x, y) {
    x *= sx; y *= sy;
    return [dx + k * x, dy - k * y];
  }
  transform.invert = function(x, y) {
    return [(x - dx) / k * sx, (dy - y) / k * sy];
  };
  return transform;
}

function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
  var cosAlpha = cos(alpha),
      sinAlpha = sin(alpha),
      a = cosAlpha * k,
      b = sinAlpha * k,
      ai = cosAlpha / k,
      bi = sinAlpha / k,
      ci = (sinAlpha * dy - cosAlpha * dx) / k,
      fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform(x, y) {
    x *= sx; y *= sy;
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform;
}

function projection(project) {
  return projectionMutator(function() { return project; })();
}

function projectionMutator(projectAt) {
  var project,
      k = 150, // scale
      x = 480, y = 250, // translate
      lambda = 0, phi = 0, // center
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
      alpha = 0, // post-rotate angle
      sx = 1, // reflectX
      sy = 1, // reflectX
      theta = null, preclip = clipAntimeridian, // pre-clip angle
      x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
      delta2 = 0.5, // precision
      projectResample,
      projectTransform,
      projectRotateTransform,
      cache,
      cacheStream;

  function projection(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }

  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees, point[1] * degrees];
  }

  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };

  projection.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
  };

  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
  };

  projection.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };

  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  projection.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };

  projection.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };

  projection.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };

  projection.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };

  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
  };

  projection.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };

  projection.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };

  projection.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };

  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };

  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };

  projection.fitWidth = function(width, object) {
    return fitWidth(projection, width, object);
  };

  projection.fitHeight = function(height, object) {
    return fitHeight(projection, height, object);
  };

  function recenter() {
    var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
        transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project, transform);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset();
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return function() {
    project = projectAt.apply(this, arguments);
    projection.invert = project.invert && invert;
    return recenter();
  };
}

function conicProjection(projectAt) {
  var phi0 = 0,
      phi1 = pi / 3,
      m = projectionMutator(projectAt),
      p = m(phi0, phi1);

  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };

  return p;
}

function cylindricalEqualAreaRaw(phi0) {
  var cosPhi0 = cos(phi0);

  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin(phi) / cosPhi0];
  }

  forward.invert = function(x, y) {
    return [x / cosPhi0, asin(y * cosPhi0)];
  };

  return forward;
}

function conicEqualAreaRaw(y0, y1) {
  var sy0 = sin(y0), n = (sy0 + sin(y1)) / 2;

  // Are the parallels symmetrical around the Equator?
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y0);

  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;

  function project(x, y) {
    var r = sqrt(c - 2 * n * sin(y)) / n;
    return [r * sin(x *= n), r0 - r * cos(x)];
  }

  project.invert = function(x, y) {
    var r0y = r0 - y,
        l = atan2(x, abs(r0y)) * sign(r0y);
    if (r0y * n < 0)
      l -= pi * sign(x) * sign(r0y);
    return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };

  return project;
}

function conicEqualArea() {
  return conicProjection(conicEqualAreaRaw)
      .scale(155.424)
      .center([0, 33.6442]);
}

function albers() {
  return conicEqualArea()
      .parallels([29.5, 45.5])
      .scale(1070)
      .translate([480, 250])
      .rotate([96, 0])
      .center([-0.6, 38.7]);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
  };
}

// A composite projection for the United States, configured by default for
// 960×500. The projection also works quite well at 960×600 if you change the
// scale to 1285 and adjust the translate accordingly. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
function albersUsa() {
  var cache,
      cacheStream,
      lower48 = albers(), lower48Point,
      alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
      hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
      point, pointStream = {point: function(x, y) { point = [x, y]; }};

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    return reset();
  };

  albersUsa.fitExtent = function(extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function(size, object) {
    return fitSize(albersUsa, size, object);
  };

  albersUsa.fitWidth = function(width, object) {
    return fitWidth(albersUsa, width, object);
  };

  albersUsa.fitHeight = function(height, object) {
    return fitHeight(albersUsa, height, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}

function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos(x),
        cy = cos(y),
        k = scale(cx * cy);
        if (k === Infinity) return [2, 0];
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  }
}

function azimuthalInvert(angle) {
  return function(x, y) {
    var z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin(c),
        cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  }
}

var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});

azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});

function azimuthalEqualArea() {
  return projection(azimuthalEqualAreaRaw)
      .scale(124.75)
      .clipAngle(180 - 1e-3);
}

var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});

azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});

function azimuthalEquidistant() {
  return projection(azimuthalEquidistantRaw)
      .scale(79.4188)
      .clipAngle(180 - 1e-3);
}

function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}

mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};

function mercator() {
  return mercatorProjection(mercatorRaw)
      .scale(961 / tau);
}

function mercatorProjection(project) {
  var m = projection(project),
      center = m.center,
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent,
      x0 = null, y0, x1, y1; // clip extent

  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };

  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };

  m.center = function(_) {
    return arguments.length ? (center(_), reclip()) : center();
  };

  m.clipExtent = function(_) {
    return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  function reclip() {
    var k = pi * scale(),
        t = m(rotation(m.rotate()).invert([0, 0]));
    return clipExtent(x0 == null
        ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
        ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
        : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
  }

  return reclip();
}

function tany(y) {
  return tan((halfPi + y) / 2);
}

function conicConformalRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
      f = cy0 * pow(tany(y0), n) / n;

  if (!n) return mercatorRaw;

  function project(x, y) {
    if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon; }
    else { if (y > halfPi - epsilon) y = halfPi - epsilon; }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }

  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy),
      l = atan2(x, abs(fy)) * sign(fy);
    if (fy * n < 0)
      l -= pi * sign(x) * sign(fy);
    return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };

  return project;
}

function conicConformal() {
  return conicProjection(conicConformalRaw)
      .scale(109.5)
      .parallels([30, 30]);
}

function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

equirectangularRaw.invert = equirectangularRaw;

function equirectangular() {
  return projection(equirectangularRaw)
      .scale(152.63);
}

function conicEquidistantRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
      g = cy0 / n + y0;

  if (abs(n) < epsilon) return equirectangularRaw;

  function project(x, y) {
    var gy = g - y, nx = n * x;
    return [gy * sin(nx), g - gy * cos(nx)];
  }

  project.invert = function(x, y) {
    var gy = g - y,
        l = atan2(x, abs(gy)) * sign(gy);
    if (gy * n < 0)
      l -= pi * sign(x) * sign(gy);
    return [l / n, g - sign(n) * sqrt(x * x + gy * gy)];
  };

  return project;
}

function conicEquidistant() {
  return conicProjection(conicEquidistantRaw)
      .scale(131.154)
      .center([0, 13.9389]);
}

var A1 = 1.340264,
    A2 = -0.081106,
    A3 = 0.000893,
    A4 = 0.003796,
    M = sqrt(3) / 2,
    iterations = 12;

function equalEarthRaw(lambda, phi) {
  var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
  return [
    lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ];
}

equalEarthRaw.invert = function(x, y) {
  var l = y, l2 = l * l, l6 = l2 * l2 * l2;
  for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
    if (abs(delta) < epsilon2) break;
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
    asin(sin(l) / M)
  ];
};

function equalEarth() {
  return projection(equalEarthRaw)
      .scale(177.158);
}

function gnomonicRaw(x, y) {
  var cy = cos(y), k = cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}

gnomonicRaw.invert = azimuthalInvert(atan);

function gnomonic() {
  return projection(gnomonicRaw)
      .scale(144.049)
      .clipAngle(60);
}

function identity$1() {
  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, // scale, translate and reflect
      alpha = 0, ca, sa, // angle
      x0 = null, y0, x1, y1, // clip extent
      kx = 1, ky = 1,
      transform = transformer({
        point: function(x, y) {
          var p = projection([x, y]);
          this.stream.point(p[0], p[1]);
        }
      }),
      postclip = identity,
      cache,
      cacheStream;

  function reset() {
    kx = k * sx;
    ky = k * sy;
    cache = cacheStream = null;
    return projection;
  }

  function projection (p) {
    var x = p[0] * kx, y = p[1] * ky;
    if (alpha) {
      var t = y * ca - x * sa;
      x = x * ca + y * sa;
      y = t;
    }    
    return [x + tx, y + ty];
  }
  projection.invert = function(p) {
    var x = p[0] - tx, y = p[1] - ty;
    if (alpha) {
      var t = y * ca + x * sa;
      x = x * ca - y * sa;
      y = t;
    }
    return [x / kx, y / ky];
  };
  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream));
  };
  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
  };
  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };
  projection.scale = function(_) {
    return arguments.length ? (k = +_, reset()) : k;
  };
  projection.translate = function(_) {
    return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
  };
  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees;
  };
  projection.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
  };
  projection.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
  };
  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };
  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };
  projection.fitWidth = function(width, object) {
    return fitWidth(projection, width, object);
  };
  projection.fitHeight = function(height, object) {
    return fitHeight(projection, height, object);
  };

  return projection;
}

function naturalEarth1Raw(lambda, phi) {
  var phi2 = phi * phi, phi4 = phi2 * phi2;
  return [
    lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)))
  ];
}

naturalEarth1Raw.invert = function(x, y) {
  var phi = y, i = 25, delta;
  do {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))) - y) /
        (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 0.005916 * 11 * phi4)));
  } while (abs(delta) > epsilon && --i > 0);
  return [
    x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (0.003971 - 0.001529 * phi2)))),
    phi
  ];
};

function naturalEarth1() {
  return projection(naturalEarth1Raw)
      .scale(175.295);
}

function orthographicRaw(x, y) {
  return [cos(y) * sin(x), sin(y)];
}

orthographicRaw.invert = azimuthalInvert(asin);

function orthographic() {
  return projection(orthographicRaw)
      .scale(249.5)
      .clipAngle(90 + epsilon);
}

function stereographicRaw(x, y) {
  var cy = cos(y), k = 1 + cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}

stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * atan(z);
});

function stereographic() {
  return projection(stereographicRaw)
      .scale(250)
      .clipAngle(142);
}

function transverseMercatorRaw(lambda, phi) {
  return [log(tan((halfPi + phi) / 2)), -lambda];
}

transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * atan(exp(x)) - halfPi];
};

function transverseMercator() {
  var m = mercatorProjection(transverseMercatorRaw),
      center = m.center,
      rotate = m.rotate;

  m.center = function(_) {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
  };

  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };

  return rotate([0, 0, 90])
      .scale(159.155);
}

exports.geoAlbers = albers;
exports.geoAlbersUsa = albersUsa;
exports.geoArea = area;
exports.geoAzimuthalEqualArea = azimuthalEqualArea;
exports.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
exports.geoAzimuthalEquidistant = azimuthalEquidistant;
exports.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
exports.geoBounds = bounds;
exports.geoCentroid = centroid;
exports.geoCircle = circle;
exports.geoClipAntimeridian = clipAntimeridian;
exports.geoClipCircle = clipCircle;
exports.geoClipExtent = extent;
exports.geoClipRectangle = clipRectangle;
exports.geoConicConformal = conicConformal;
exports.geoConicConformalRaw = conicConformalRaw;
exports.geoConicEqualArea = conicEqualArea;
exports.geoConicEqualAreaRaw = conicEqualAreaRaw;
exports.geoConicEquidistant = conicEquidistant;
exports.geoConicEquidistantRaw = conicEquidistantRaw;
exports.geoContains = contains;
exports.geoDistance = distance;
exports.geoEqualEarth = equalEarth;
exports.geoEqualEarthRaw = equalEarthRaw;
exports.geoEquirectangular = equirectangular;
exports.geoEquirectangularRaw = equirectangularRaw;
exports.geoGnomonic = gnomonic;
exports.geoGnomonicRaw = gnomonicRaw;
exports.geoGraticule = graticule;
exports.geoGraticule10 = graticule10;
exports.geoIdentity = identity$1;
exports.geoInterpolate = interpolate;
exports.geoLength = length;
exports.geoMercator = mercator;
exports.geoMercatorRaw = mercatorRaw;
exports.geoNaturalEarth1 = naturalEarth1;
exports.geoNaturalEarth1Raw = naturalEarth1Raw;
exports.geoOrthographic = orthographic;
exports.geoOrthographicRaw = orthographicRaw;
exports.geoPath = index;
exports.geoProjection = projection;
exports.geoProjectionMutator = projectionMutator;
exports.geoRotation = rotation;
exports.geoStereographic = stereographic;
exports.geoStereographicRaw = stereographicRaw;
exports.geoStream = geoStream;
exports.geoTransform = transform;
exports.geoTransverseMercator = transverseMercator;
exports.geoTransverseMercatorRaw = transverseMercatorRaw;

Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"d3-array":5}],8:[function(require,module,exports){
// https://d3js.org/d3-interpolate/ v2.0.1 Copyright 2020 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-color')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, function (exports, d3Color) { 'use strict';

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

function basis$1(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
        v1 = values[i],
        v2 = values[i + 1],
        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

function basisClosed(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
        v0 = values[(i + n - 1) % n],
        v1 = values[i % n],
        v2 = values[(i + 1) % n],
        v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

var constant = x => () => x;

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

var rgb = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb(start, end) {
    var r = color((start = d3Color.rgb(start)).r, (end = d3Color.rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
})(1);

function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length,
        r = new Array(n),
        g = new Array(n),
        b = new Array(n),
        i, color;
    for (i = 0; i < n; ++i) {
      color = d3Color.rgb(colors[i]);
      r[i] = color.r || 0;
      g[i] = color.g || 0;
      b[i] = color.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color.opacity = 1;
    return function(t) {
      color.r = r(t);
      color.g = g(t);
      color.b = b(t);
      return color + "";
    };
  };
}

var rgbBasis = rgbSpline(basis$1);
var rgbBasisClosed = rgbSpline(basisClosed);

function numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function array(a, b) {
  return (isNumberArray(b) ? numberArray : genericArray)(a, b);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function number(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function string(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: number(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function value(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant(b)
      : (t === "number" ? number
      : t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb) : string)
      : b instanceof d3Color.color ? rgb
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : number)(a, b);
}

function discrete(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

function hue$1(a, b) {
  var i = hue(+a, +b);
  return function(t) {
    var x = i(t);
    return x - 360 * Math.floor(x / 360);
  };
}

function round(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

var degrees = 180 / Math.PI;

var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var svgNode;

/* eslint-disable no-undef */
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}

function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

var zoom = (function zoomRho(rho, rho2, rho4) {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }

    i.duration = S * 1000 * rho / Math.SQRT2;

    return i;
  }

  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };

  return zoom;
})(Math.SQRT2, 2, 4);

function hsl(hue) {
  return function(start, end) {
    var h = hue((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
        s = nogamma(start.s, end.s),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

var hsl$1 = hsl(hue);
var hslLong = hsl(nogamma);

function lab(start, end) {
  var l = nogamma((start = d3Color.lab(start)).l, (end = d3Color.lab(end)).l),
      a = nogamma(start.a, end.a),
      b = nogamma(start.b, end.b),
      opacity = nogamma(start.opacity, end.opacity);
  return function(t) {
    start.l = l(t);
    start.a = a(t);
    start.b = b(t);
    start.opacity = opacity(t);
    return start + "";
  };
}

function hcl(hue) {
  return function(start, end) {
    var h = hue((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
        c = nogamma(start.c, end.c),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

var hcl$1 = hcl(hue);
var hclLong = hcl(nogamma);

function cubehelix(hue) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix(start, end) {
      var h = hue((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix.gamma = cubehelixGamma;

    return cubehelix;
  })(1);
}

var cubehelix$1 = cubehelix(hue);
var cubehelixLong = cubehelix(nogamma);

function piecewise(interpolate, values) {
  if (values === undefined) values = interpolate, interpolate = value;
  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
  while (i < n) I[i] = interpolate(v, v = values[++i]);
  return function(t) {
    var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i](t - i);
  };
}

function quantize(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
}

exports.interpolate = value;
exports.interpolateArray = array;
exports.interpolateBasis = basis$1;
exports.interpolateBasisClosed = basisClosed;
exports.interpolateCubehelix = cubehelix$1;
exports.interpolateCubehelixLong = cubehelixLong;
exports.interpolateDate = date;
exports.interpolateDiscrete = discrete;
exports.interpolateHcl = hcl$1;
exports.interpolateHclLong = hclLong;
exports.interpolateHsl = hsl$1;
exports.interpolateHslLong = hslLong;
exports.interpolateHue = hue$1;
exports.interpolateLab = lab;
exports.interpolateNumber = number;
exports.interpolateNumberArray = numberArray;
exports.interpolateObject = object;
exports.interpolateRgb = rgb;
exports.interpolateRgbBasis = rgbBasis;
exports.interpolateRgbBasisClosed = rgbBasisClosed;
exports.interpolateRound = round;
exports.interpolateString = string;
exports.interpolateTransformCss = interpolateTransformCss;
exports.interpolateTransformSvg = interpolateTransformSvg;
exports.interpolateZoom = zoom;
exports.piecewise = piecewise;
exports.quantize = quantize;

Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"d3-color":6}],9:[function(require,module,exports){
// https://d3js.org/d3-scale-chromatic/ v2.0.0 Copyright 2020 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-interpolate'), require('d3-color')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-interpolate', 'd3-color'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3));
}(this, function (exports, d3Interpolate, d3Color) { 'use strict';

function colors(specifier) {
  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

var Accent = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

var Dark2 = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

var Paired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

var Pastel1 = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

var Pastel2 = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

var Set1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

var Set2 = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

var Set3 = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

var Tableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");

var ramp = scheme => d3Interpolate.interpolateRgbBasis(scheme[scheme.length - 1]);

var scheme = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);

var BrBG = ramp(scheme);

var scheme$1 = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);

var PRGn = ramp(scheme$1);

var scheme$2 = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);

var PiYG = ramp(scheme$2);

var scheme$3 = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);

var PuOr = ramp(scheme$3);

var scheme$4 = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);

var RdBu = ramp(scheme$4);

var scheme$5 = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);

var RdGy = ramp(scheme$5);

var scheme$6 = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);

var RdYlBu = ramp(scheme$6);

var scheme$7 = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);

var RdYlGn = ramp(scheme$7);

var scheme$8 = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);

var Spectral = ramp(scheme$8);

var scheme$9 = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);

var BuGn = ramp(scheme$9);

var scheme$a = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);

var BuPu = ramp(scheme$a);

var scheme$b = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);

var GnBu = ramp(scheme$b);

var scheme$c = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);

var OrRd = ramp(scheme$c);

var scheme$d = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);

var PuBuGn = ramp(scheme$d);

var scheme$e = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);

var PuBu = ramp(scheme$e);

var scheme$f = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);

var PuRd = ramp(scheme$f);

var scheme$g = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);

var RdPu = ramp(scheme$g);

var scheme$h = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);

var YlGnBu = ramp(scheme$h);

var scheme$i = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);

var YlGn = ramp(scheme$i);

var scheme$j = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);

var YlOrBr = ramp(scheme$j);

var scheme$k = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);

var YlOrRd = ramp(scheme$k);

var scheme$l = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);

var Blues = ramp(scheme$l);

var scheme$m = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);

var Greens = ramp(scheme$m);

var scheme$n = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);

var Greys = ramp(scheme$n);

var scheme$o = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);

var Purples = ramp(scheme$o);

var scheme$p = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);

var Reds = ramp(scheme$p);

var scheme$q = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);

var Oranges = ramp(scheme$q);

function cividis(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb("
      + Math.max(0, Math.min(255, Math.round(-4.54 - t * (35.34 - t * (2381.73 - t * (6402.7 - t * (7024.72 - t * 2710.57))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(32.49 + t * (170.73 + t * (52.82 - t * (131.46 - t * (176.58 - t * 67.37))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(81.24 + t * (442.36 - t * (2482.43 - t * (6167.24 - t * (6614.94 - t * 2475.67)))))))
      + ")";
}

var cubehelix = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(300, 0.5, 0.0), d3Color.cubehelix(-240, 0.5, 1.0));

var warm = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(-100, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

var cool = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(260, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

var c = d3Color.cubehelix();

function rainbow(t) {
  if (t < 0 || t > 1) t -= Math.floor(t);
  var ts = Math.abs(t - 0.5);
  c.h = 360 * t - 100;
  c.s = 1.5 - 1.5 * ts;
  c.l = 0.8 - 0.9 * ts;
  return c + "";
}

var c$1 = d3Color.rgb(),
    pi_1_3 = Math.PI / 3,
    pi_2_3 = Math.PI * 2 / 3;

function sinebow(t) {
  var x;
  t = (0.5 - t) * Math.PI;
  c$1.r = 255 * (x = Math.sin(t)) * x;
  c$1.g = 255 * (x = Math.sin(t + pi_1_3)) * x;
  c$1.b = 255 * (x = Math.sin(t + pi_2_3)) * x;
  return c$1 + "";
}

function turbo(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb("
      + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66)))))))
      + ")";
}

function ramp$1(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

var viridis = ramp$1(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

var magma = ramp$1(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = ramp$1(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = ramp$1(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

exports.interpolateBlues = Blues;
exports.interpolateBrBG = BrBG;
exports.interpolateBuGn = BuGn;
exports.interpolateBuPu = BuPu;
exports.interpolateCividis = cividis;
exports.interpolateCool = cool;
exports.interpolateCubehelixDefault = cubehelix;
exports.interpolateGnBu = GnBu;
exports.interpolateGreens = Greens;
exports.interpolateGreys = Greys;
exports.interpolateInferno = inferno;
exports.interpolateMagma = magma;
exports.interpolateOrRd = OrRd;
exports.interpolateOranges = Oranges;
exports.interpolatePRGn = PRGn;
exports.interpolatePiYG = PiYG;
exports.interpolatePlasma = plasma;
exports.interpolatePuBu = PuBu;
exports.interpolatePuBuGn = PuBuGn;
exports.interpolatePuOr = PuOr;
exports.interpolatePuRd = PuRd;
exports.interpolatePurples = Purples;
exports.interpolateRainbow = rainbow;
exports.interpolateRdBu = RdBu;
exports.interpolateRdGy = RdGy;
exports.interpolateRdPu = RdPu;
exports.interpolateRdYlBu = RdYlBu;
exports.interpolateRdYlGn = RdYlGn;
exports.interpolateReds = Reds;
exports.interpolateSinebow = sinebow;
exports.interpolateSpectral = Spectral;
exports.interpolateTurbo = turbo;
exports.interpolateViridis = viridis;
exports.interpolateWarm = warm;
exports.interpolateYlGn = YlGn;
exports.interpolateYlGnBu = YlGnBu;
exports.interpolateYlOrBr = YlOrBr;
exports.interpolateYlOrRd = YlOrRd;
exports.schemeAccent = Accent;
exports.schemeBlues = scheme$l;
exports.schemeBrBG = scheme;
exports.schemeBuGn = scheme$9;
exports.schemeBuPu = scheme$a;
exports.schemeCategory10 = category10;
exports.schemeDark2 = Dark2;
exports.schemeGnBu = scheme$b;
exports.schemeGreens = scheme$m;
exports.schemeGreys = scheme$n;
exports.schemeOrRd = scheme$c;
exports.schemeOranges = scheme$q;
exports.schemePRGn = scheme$1;
exports.schemePaired = Paired;
exports.schemePastel1 = Pastel1;
exports.schemePastel2 = Pastel2;
exports.schemePiYG = scheme$2;
exports.schemePuBu = scheme$e;
exports.schemePuBuGn = scheme$d;
exports.schemePuOr = scheme$3;
exports.schemePuRd = scheme$f;
exports.schemePurples = scheme$o;
exports.schemeRdBu = scheme$4;
exports.schemeRdGy = scheme$5;
exports.schemeRdPu = scheme$g;
exports.schemeRdYlBu = scheme$6;
exports.schemeRdYlGn = scheme$7;
exports.schemeReds = scheme$p;
exports.schemeSet1 = Set1;
exports.schemeSet2 = Set2;
exports.schemeSet3 = Set3;
exports.schemeSpectral = scheme$8;
exports.schemeTableau10 = Tableau10;
exports.schemeYlGn = scheme$i;
exports.schemeYlGnBu = scheme$h;
exports.schemeYlOrBr = scheme$j;
exports.schemeYlOrRd = scheme$k;

Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"d3-color":6,"d3-interpolate":8}],10:[function(require,module,exports){
// https://github.com/topojson/topojson-client v3.1.0 Copyright 2019 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = global || self, factory(global.topojson = global.topojson || {}));
}(this, function (exports) { 'use strict';

function identity(x) {
  return x;
}

function transform(transform) {
  if (transform == null) return identity;
  var x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x0 += input[0]) * kx + dx;
    output[1] = (y0 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}

function bbox(topology) {
  var t = transform(topology.transform), key,
      x0 = Infinity, y0 = x0, x1 = -x0, y1 = -x0;

  function bboxPoint(p) {
    p = t(p);
    if (p[0] < x0) x0 = p[0];
    if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }

  function bboxGeometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(bboxGeometry); break;
      case "Point": bboxPoint(o.coordinates); break;
      case "MultiPoint": o.coordinates.forEach(bboxPoint); break;
    }
  }

  topology.arcs.forEach(function(arc) {
    var i = -1, n = arc.length, p;
    while (++i < n) {
      p = t(arc[i], i);
      if (p[0] < x0) x0 = p[0];
      if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1];
      if (p[1] > y1) y1 = p[1];
    }
  });

  for (key in topology.objects) {
    bboxGeometry(topology.objects[key]);
  }

  return [x0, y0, x1, y1];
}

function reverse(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}

function feature(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection"
      ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
      : feature$1(topology, o);
}

function feature$1(topology, o) {
  var id = o.id,
      bbox = o.bbox,
      properties = o.properties == null ? {} : o.properties,
      geometry = object(topology, o);
  return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
      : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
      : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
}

function object(topology, o) {
  var transformPoint = transform(topology.transform),
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse(points, n);
  }

  function point(p) {
    return transformPoint(p);
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
    if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
    return points;
  }

  function polygon(arcs) {
    return arcs.map(ring);
  }

  function geometry(o) {
    var type = o.type, coordinates;
    switch (type) {
      case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
      case "Point": coordinates = point(o.coordinates); break;
      case "MultiPoint": coordinates = o.coordinates.map(point); break;
      case "LineString": coordinates = line(o.arcs); break;
      case "MultiLineString": coordinates = o.arcs.map(line); break;
      case "Polygon": coordinates = polygon(o.arcs); break;
      case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
      default: return null;
    }
    return {type: type, coordinates: coordinates};
  }

  return geometry(o);
}

function stitch(topology, arcs) {
  var stitchedArcs = {},
      fragmentByStart = {},
      fragmentByEnd = {},
      fragments = [],
      emptyIndex = -1;

  // Stitch empty arcs first, since they may be subsumed by other arcs.
  arcs.forEach(function(i, j) {
    var arc = topology.arcs[i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });

  arcs.forEach(function(i) {
    var e = ends(i),
        start = e[0],
        end = e[1],
        f, g;

    if (f = fragmentByEnd[start]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start;
      if (g = fragmentByEnd[start]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
    }
  });

  function ends(i) {
    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p0] : [p0, p1];
  }

  function flush(fragmentByEnd, fragmentByStart) {
    for (var k in fragmentByEnd) {
      var f = fragmentByEnd[k];
      delete fragmentByStart[f.start];
      delete f.start;
      delete f.end;
      f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
      fragments.push(f);
    }
  }

  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

  return fragments;
}

function mesh(topology) {
  return object(topology, meshArcs.apply(this, arguments));
}

function meshArcs(topology, object, filter) {
  var arcs, i, n;
  if (arguments.length > 1) arcs = extractArcs(topology, object, filter);
  else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
  return {type: "MultiLineString", arcs: stitch(topology, arcs)};
}

function extractArcs(topology, object, filter) {
  var arcs = [],
      geomsByArc = [],
      geom;

  function extract0(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
  }

  function extract1(arcs) {
    arcs.forEach(extract0);
  }

  function extract2(arcs) {
    arcs.forEach(extract1);
  }

  function extract3(arcs) {
    arcs.forEach(extract2);
  }

  function geometry(o) {
    switch (geom = o, o.type) {
      case "GeometryCollection": o.geometries.forEach(geometry); break;
      case "LineString": extract1(o.arcs); break;
      case "MultiLineString": case "Polygon": extract2(o.arcs); break;
      case "MultiPolygon": extract3(o.arcs); break;
    }
  }

  geometry(object);

  geomsByArc.forEach(filter == null
      ? function(geoms) { arcs.push(geoms[0].i); }
      : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });

  return arcs;
}

function planarRingArea(ring) {
  var i = -1, n = ring.length, a, b = ring[n - 1], area = 0;
  while (++i < n) a = b, b = ring[i], area += a[0] * b[1] - a[1] * b[0];
  return Math.abs(area); // Note: doubled area!
}

function merge(topology) {
  return object(topology, mergeArcs.apply(this, arguments));
}

function mergeArcs(topology, objects) {
  var polygonsByArc = {},
      polygons = [],
      groups = [];

  objects.forEach(geometry);

  function geometry(o) {
    switch (o.type) {
      case "GeometryCollection": o.geometries.forEach(geometry); break;
      case "Polygon": extract(o.arcs); break;
      case "MultiPolygon": o.arcs.forEach(extract); break;
    }
  }

  function extract(polygon) {
    polygon.forEach(function(ring) {
      ring.forEach(function(arc) {
        (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
      });
    });
    polygons.push(polygon);
  }

  function area(ring) {
    return planarRingArea(object(topology, {type: "Polygon", arcs: [ring]}).coordinates[0]);
  }

  polygons.forEach(function(polygon) {
    if (!polygon._) {
      var group = [],
          neighbors = [polygon];
      polygon._ = 1;
      groups.push(group);
      while (polygon = neighbors.pop()) {
        group.push(polygon);
        polygon.forEach(function(ring) {
          ring.forEach(function(arc) {
            polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
              if (!polygon._) {
                polygon._ = 1;
                neighbors.push(polygon);
              }
            });
          });
        });
      }
    }
  });

  polygons.forEach(function(polygon) {
    delete polygon._;
  });

  return {
    type: "MultiPolygon",
    arcs: groups.map(function(polygons) {
      var arcs = [], n;

      // Extract the exterior (unique) arcs.
      polygons.forEach(function(polygon) {
        polygon.forEach(function(ring) {
          ring.forEach(function(arc) {
            if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
              arcs.push(arc);
            }
          });
        });
      });

      // Stitch the arcs into one or more rings.
      arcs = stitch(topology, arcs);

      // If more than one ring is returned,
      // at most one of these rings can be the exterior;
      // choose the one with the greatest absolute area.
      if ((n = arcs.length) > 1) {
        for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
          if ((ki = area(arcs[i])) > k) {
            t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
          }
        }
      }

      return arcs;
    }).filter(function(arcs) {
      return arcs.length > 0;
    })
  };
}

function bisect(a, x) {
  var lo = 0, hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function neighbors(objects) {
  var indexesByArc = {}, // arc index -> array of object indexes
      neighbors = objects.map(function() { return []; });

  function line(arcs, i) {
    arcs.forEach(function(a) {
      if (a < 0) a = ~a;
      var o = indexesByArc[a];
      if (o) o.push(i);
      else indexesByArc[a] = [i];
    });
  }

  function polygon(arcs, i) {
    arcs.forEach(function(arc) { line(arc, i); });
  }

  function geometry(o, i) {
    if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
    else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
  }

  var geometryType = {
    LineString: line,
    MultiLineString: polygon,
    Polygon: polygon,
    MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
  };

  objects.forEach(geometry);

  for (var i in indexesByArc) {
    for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
      for (var k = j + 1; k < m; ++k) {
        var ij = indexes[j], ik = indexes[k], n;
        if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
        if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
      }
    }
  }

  return neighbors;
}

function untransform(transform) {
  if (transform == null) return identity;
  var x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2,
        n = input.length,
        output = new Array(n),
        x1 = Math.round((input[0] - dx) / kx),
        y1 = Math.round((input[1] - dy) / ky);
    output[0] = x1 - x0, x0 = x1;
    output[1] = y1 - y0, y0 = y1;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}

function quantize(topology, transform) {
  if (topology.transform) throw new Error("already quantized");

  if (!transform || !transform.scale) {
    if (!((n = Math.floor(transform)) >= 2)) throw new Error("n must be ≥2");
    box = topology.bbox || bbox(topology);
    var x0 = box[0], y0 = box[1], x1 = box[2], y1 = box[3], n;
    transform = {scale: [x1 - x0 ? (x1 - x0) / (n - 1) : 1, y1 - y0 ? (y1 - y0) / (n - 1) : 1], translate: [x0, y0]};
  } else {
    box = topology.bbox;
  }

  var t = untransform(transform), box, key, inputs = topology.objects, outputs = {};

  function quantizePoint(point) {
    return t(point);
  }

  function quantizeGeometry(input) {
    var output;
    switch (input.type) {
      case "GeometryCollection": output = {type: "GeometryCollection", geometries: input.geometries.map(quantizeGeometry)}; break;
      case "Point": output = {type: "Point", coordinates: quantizePoint(input.coordinates)}; break;
      case "MultiPoint": output = {type: "MultiPoint", coordinates: input.coordinates.map(quantizePoint)}; break;
      default: return input;
    }
    if (input.id != null) output.id = input.id;
    if (input.bbox != null) output.bbox = input.bbox;
    if (input.properties != null) output.properties = input.properties;
    return output;
  }

  function quantizeArc(input) {
    var i = 0, j = 1, n = input.length, p, output = new Array(n); // pessimistic
    output[0] = t(input[0], 0);
    while (++i < n) if ((p = t(input[i], i))[0] || p[1]) output[j++] = p; // non-coincident points
    if (j === 1) output[j++] = [0, 0]; // an arc must have at least two points
    output.length = j;
    return output;
  }

  for (key in inputs) outputs[key] = quantizeGeometry(inputs[key]);

  return {
    type: "Topology",
    bbox: box,
    transform: transform,
    objects: outputs,
    arcs: topology.arcs.map(quantizeArc)
  };
}

exports.bbox = bbox;
exports.feature = feature;
exports.merge = merge;
exports.mergeArcs = mergeArcs;
exports.mesh = mesh;
exports.meshArcs = meshArcs;
exports.neighbors = neighbors;
exports.quantize = quantize;
exports.transform = transform;
exports.untransform = untransform;

Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}]},{},[1]);
