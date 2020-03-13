window.addEventListener("load", function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
// 	ctx.width = window.innerWidth;
// 	ctx.height = window.innerHeight;
	
	main(ctx);
});

function trim(x) { return x.replace(/^\s+|\s+$/g, ''); }

var box_metrics = {
	h: 30,
	w: 100,
};
box_metrics.hh = box_metrics.h /2
box_metrics.hw = box_metrics.w /2

function drawBox(ctx, n) {
	ctx.save();
	
	var h = box_metrics.h;
	var hh = box_metrics.hh;
	var w = box_metrics.w;
	var hw = box_metrics.hw;
	
	var t = n.loc.y - hh;
	var b = n.loc.y + hh;
	var l = n.loc.x - hw;
	var r = n.loc.x + hw;
	
	ctx.beginPath();
	ctx.moveTo(l, t);
	ctx.lineTo(r, t);
	ctx.lineTo(r, b);
	ctx.lineTo(l, b);
	ctx.closePath();
	
	ctx.fillStyle = "tan";
	ctx.fill();
	
	ctx.lineWidth = 4;
	ctx.lineJoin = 'round';
	ctx.strokeStyle = n.selected ? 'red' : 'blue';
	
	ctx.stroke();
	
	ctx.fillStyle = "black";
	ctx.textStyle = 'black';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(n.name, n.loc.x, n.loc.y);
	
	ctx.restore();
}

function trip(a, b, amt) {
	if(a > b) return amt;
	if(a < b) return -amt;
	return 0;
}

function drawEdge(ctx, e) {
	var lower = e.lower;
	var upper = e.upper;
	
	ctx.save();
// 	ctx.translate(0.5, 0.5);
	
	var ldiff = upper.lvl - lower.lvl;
	
	
// 	var inoff = trip(upper.rank, lower.rank, -10);
// 	var outoff = trip(upper.rank, lower.rank, 10);
	var inoff = (e.in_order * 4) - upper.ins * 2;
	var outoff = (e.out_order * 4) - lower.outs * 2;
// 	console.log(inoff, outoff, upper.name, lower.name);
	var ll = e.line_level;
	var midy = (ll * 3) + ((lower.loc.y + upper.loc.y) / 2);
	
	
	ctx.beginPath();
	
	ctx.moveTo(lower.loc.x+outoff, lower.loc.y);
	
	if(ldiff > 1) { 
		if(upper.rank == lower.rank) { // need to go around
			
		}
		else { // go over and up
			var dir = upper.rank > lower.rank ? 1 : -1;
// 			ctx.lineTo()
			
		}
	}
	else {
		ctx.lineTo(lower.loc.x+outoff, midy);
		ctx.lineTo(upper.loc.x+inoff, midy);
		ctx.lineTo(upper.loc.x+inoff, upper.loc.y);
	}
	
	ctx.strokeStyle = upper.selected ? 'lime' : (lower.selected ? 'orange' : 'gray');
	ctx.lineWidth = 2;
	ctx.stroke();
	
	ctx.restore();
	
// 	upper.cur_in++;
// 	lower.cur_out++;
}

function boxHitTest(n, pt) {
	if(pt.x > n.loc.x + box_metrics.hw) return false;
	if(pt.x < n.loc.x - box_metrics.hw) return false;
	if(pt.y > n.loc.y + box_metrics.hh) return false;
	if(pt.y < n.loc.y - box_metrics.hh) return false;
	return true;
}

var _tree_nodes = {
	jquery: {name: 'JQuery', deps: ['css', 'js']},
	adv_css: {name: 'Advanced CSS', rank: 1, deps: ['css']},
	html: {name: 'HTML', rank: 2},
	css: {name: 'CSS', deps: ['html']},
	js: {name: 'Javascript', deps: ['html']},
	sql: {name: 'SQL', rank: 4,},
	nodejs: {name: 'NodeJS', deps: ['js']},
	crud: {name: 'CRUD App', rank: 4, deps: ['nodejs', 'sql']},
};

	var tree_nodes = _tree_nodes;

function main(ctx) {
	
	var nlist = [];
	var start = [];
	
	if(data_nodes !== undefined) {
		tree_nodes = data_nodes;
	}
	
	for(var x in tree_nodes) { 
		var y = tree_nodes[x];
		y.id = x;
		y.ins = 0;
		y.outs = 0;
		y.cur_in = 0;
		y.cur_out = 0;
		y.inlist = [];
		y.outlist = [];
		nlist.push(y);
		
		if(typeof y.deps == 'string') {
			y.deps = y.deps.split(',').map(function(x) { return trim(x);});
		}
		y.deps = y.deps || [];
		if(y.deps.length == 0) {
			start.push(y);
		}
	}
	
	// topological sort
	
	var sorted = [];
	var tmp = {};
	var perm = {};
	
	while(1) {
		var found = false;
		
		for(var x in nlist) {
			if(perm[x]) continue;
			found = true;
			
			var n = nlist[x];
			visit(n);
		}
		
		if(found) break;
	}
	
	function visit(n) {
		if(perm[n.id]) return;
		if(tmp[n.id]) {
			console.log("cyclic graph");
			return;
		}
		
		tmp[n.id] = true;
		for(var mid of n.deps) {
			visit(tree_nodes[mid]);
		}
		
		delete tmp[n.id];
		perm[n.id] = true;
		sorted.push(n);
	}
	
	// put into levels
	
	var levels = {};
	var rank_cache = {};
	var line_levels = {};
	
	for(var n of sorted) {
		if(n.lvl == undefined) n.lvl = 1;
		for(var d of n.deps) {
			var m = tree_nodes[d];
			if(m.lvl >= n.lvl) n.lvl = m.lvl + 1;
		}
		
		if(!levels[n.lvl]) levels[n.lvl] = [];
		levels[n.lvl].push(n);
		
		
		line_levels[n.lvl] = line_levels[n.lvl] || [];
		rank_cache[n.lvl] = rank_cache[n.lvl] || {};
		if(n.rank) {
			if(rank_cache[n.lvl][n.rank]) {
				console.log('rank collision')
			}
			
			rank_cache[n.lvl][n.rank] = n;
		}
	}
	
// 	console.log(levels);
	
	
	// position setup
	
	function edgekey(a, b) { return [a.id, b.id].sort().join(":"); }
	var edges = {};
	
	var y = 600;
	
	for(var ll in levels) {
		var lvl = levels[ll];
		var rank = 0;
		for(var n of lvl) {
			if(!n.rank) {
				for(var i = 1; ; i++) {
					if(rank_cache[n.lvl][i]) continue;
					n.rank = i;
					rank_cache[n.lvl][i] = n;
					break;
				}
			}
// 			drawBox(ctx, n);
			n.loc = {x: (n.rank-1) * 120 + 70, y: y};
			
		}
		
		y -= 60;
	}
	
	// edge setup
	for(var id in tree_nodes) {
		var n = tree_nodes[id];
		
		for(var e of n.deps) {
			var a = n;
			var b = tree_nodes[e];
			var edge = {
				upper: a.lvl > b.lvl ? a : b,
				lower: a.lvl > b.lvl ? b : a,
			};
			edge.dir = trip(edge.upper, edge.lower, 1);
			
			if(edges.dir != 0) {
				edge.line_level = line_levels[edge.lower.lvl].length;
				line_levels[edge.lower.lvl].push(edges);
			}
			
			edge.lower.outs++;
			edge.upper.ins++;
			
			edge.upper.inlist.push(edge);
			edge.lower.outlist.push(edge);
			
			edges[edgekey(a, b)] = edge;
		}
	}
	
	// edge in/out assignment
	for(var id in tree_nodes) {
		var n = tree_nodes[id];
		function os(a, b) { return a.upper.rank - b.upper.rank; }
		function is(a, b) { return a.lower.rank - b.lower.rank; }
		n.inlist = n.inlist.sort(is);
		n.outlist = n.outlist.sort(os);
		
		var i = 0;
		for(var e of n.inlist) {
			e.in_order = i++;
		}
		i = 0;
		for(var e of n.outlist) {
			e.out_order = i++;
		}
	}
	
	
	draw();
	
	window.addEventListener('click', function(e) {
		e.preventDefault();
		
		var pt = {
			x: e.clientX,
			y: e.clientY,
		};
		
		for(var id in tree_nodes) {
			var n = tree_nodes[id];
			if(boxHitTest(n, pt)) {
				
				n.selected = true;
			}
			else {
				n.selected = false;
			}
		}
		
		draw();
	})
	
	// edge drawing
// 	for(var id in tree_nodes) {
// 		var n = tree_nodes[id];
// 		for(var e of n.outlist) {
// 			drawEdge(ctx, e);
// 		}
// 	}
// 	for(var id in edges) {
// 		var e = edges[id];
		
// 		e.in_off = 
// 		e.out_off = 
// 		
// 	}
	
	// edge drawing
// 	for(var id in edges) {
// 		var e = edges[id];
// 		drawEdge(ctx, e);
// 	}
	
	// box drawing
// 	for(var id in tree_nodes) {
// 		drawBox(ctx, tree_nodes[id]);
// 	}
	
	
	function draw() {
		ctx.clearRect(0, 0, ctx.width, ctx.height);
		
		for(var id in tree_nodes) {
			var n = tree_nodes[id];
			for(var e of n.outlist) {
				drawEdge(ctx, e);
			}
		}
		for(var id in tree_nodes) {
			drawBox(ctx, tree_nodes[id]);
		}
	}
	
}






