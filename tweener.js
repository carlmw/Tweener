var Tweener;
(function() {
	Tweener = function(el, w, h) {
		this.el = el;
		this.width = w;
		this.height = h;
		this.ctx = this.el.getContext('2d');
	};

	Tweener.prototype = {
		rate: 50,
		frames: {},
		paths: {},
		current: null,
		interval: null,
		frame: function(name, shapes) {
			this.frames[name] = shapes;
		},
		path: function(name, path){
			this.paths[name] = path;
		},
		draw: function(name) {
			var frame, shape;
			if (typeof(name) == 'object') {
				frame = name;
			} else {
				frame = this.frames[name];
				this.current = name;
			}

			this.ctx.clearRect(0, 0, this.width, this.height);
			for (shape in frame) {
				shape = frame[shape];
				
				if(shape['globalCompositeOperation']) this.ctx.globalCompositeOperation = shape['globalCompositeOperation'];
				
				if(typeof shape['path'] != 'undefined'){
					this.drawPath(this.paths[shape['path']]);
				}else if(typeof shape['createLinearGradient'] != 'undefined'){
					this.drawLinearGradient(shape['createLinearGradient']);
				}else if(typeof shape['image'] != 'undefined'){
					this.drawImage(shape);
				}else{
					this.ctx[shape[0]].apply(this.ctx, shape[1]);
				}
				
				if(shape['lineWidth']) this.ctx.lineWidth = shape['lineWidth'];
				if(shape['clip']) this.ctx.clip();
				if(shape['fill']) this.ctx.fill();
				if(shape['stroke']) this.ctx.stroke();
			}
		},
		drawLinearGradient: function(gradient){
			console.log(gradient);
			var g = this.ctx.createLinearGradient.apply(this.ctx, gradient[0]),
				l = gradient[1].length;
			for(var i=0; i < l; i++){
				g.addColorStop.apply(g, gradient[1][i]);
			}
		},
		drawImage: function(shape){
			this.ctx.drawImage(shape['image'], shape.x, shape.y, shape.width, shape.height);
		},
		drawPath: function(coords){
			this.ctx.beginPath.apply(this.ctx, coords.shift());
			var l = coords.length,
				style
			for(var i=0; i < l; i++){
				this.ctx.bezierCurveTo.apply(this.ctx, coords[i]);
			}
			this.ctx.closePath();
		},
		tween: function(name, ms, callback, easing) {
			var frame = this.frames[name],
				current = jQuery.extend(true, {}, this.frames[this.current]),
				diff = {},
				time = new Date,
				self = this,
				easing = (typeof(easing) != 'string') ? 'linear' : easing,
				start,
				end,
				change,
				l;

			for (var shape in frame) {
				start = current[shape][1];
				end = frame[shape][1];
				change = diff[shape] = [];
				l = end.length;
				for (var i = 0; i < l; i++) {
					change[i] = start[i] - end[i];
				}
			}

			this.interval = setInterval(function() {
				var passed = new Date - time;
				if (passed >= ms) {
					self.draw(name);
					clearInterval(self.interval);
					if (typeof(callback) == 'function') {
						callback();
					}
					return;
				}

				var tick = jQuery.extend(true, {},
				current),
					ease = self.easingFunctions[easing](passed/ms),
					change, prop, l;
				for (var shape in tick) {
					prop = tick[shape][1];
					change = diff[shape];
					l = prop.length
					for (var i = 0; i < l; i++) {
						prop[i] -= (change[i] * ease);
					}
				}
				self.draw(tick);
			},
			this.rate);
		},
		easingFunctions: {
			linear: function(n) {
				return n;
			},
			"<": function(n) {
				return Math.pow(n, 3);
			},
			">": function(n) {
				return Math.pow(n - 1, 3) + 1;
			},
			"<>": function(n) {
				n = n * 2;
				if (n < 1) {
					return Math.pow(n, 3) / 2;
				}
				n -= 2;
				return (Math.pow(n, 3) + 2) / 2;
			},
			backIn: function(n) {
				var s = 1.70158;
				return n * n * ((s + 1) * n - s);
			},
			backOut: function(n) {
				n = n - 1;
				var s = 1.70158;
				return n * n * ((s + 1) * n + s) + 1;
			},
			elastic: function(n) {
				if (n == 0 || n == 1) {
					return n;
				}
				var p = .3,
					s = p / 4;
				return Math.pow(2, -10 * n) * Math.sin((n - s) * (2 * Math.PI) / p) + 1;
			},
			bounce: function(n) {
				var s = 7.5625,
					p = 2.75,
					l;
				if (n < (1 / p)) {
					l = s * n * n;
				} else {
					if (n < (2 / p)) {
						n -= (1.5 / p);
						l = s * n * n + .75;
					} else {
						if (n < (2.5 / p)) {
							n -= (2.25 / p);
							l = s * n * n + .9375;
						} else {
							n -= (2.625 / p);
							l = s * n * n + .984375;
						}
					}
				}
				return l;
			}
		}
	};
})();
