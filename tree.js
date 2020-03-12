window.addEventListener("load", function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	main(ctx);
});



function drawBox(ctx, n) {
	ctx.save();
	
	var h = 30;
	var hh = h / 2;
	var w = 100;
	var hw = w / 2;
	
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
	ctx.strokeStyle = 'blue';
	
	ctx.stroke();
	
	ctx.fillStyle = "black";
	ctx.textStyle = 'black';
	ctx.textAlign = 'center';
	ctx.fillText(n.name, n.loc.x, n.loc.y);
	
	ctx.restore();
}

function trip(a, b, amt) {
	if(a > b) return amt;
	if(a < b) return -amt;
	return 0;
}

function drawEdge(ctx, a, b) {
	var lower = a;
	var upper = b;
	if(lower.lvl > upper.lvl) {
		lower = b;
		upper = a;
	}
	
	ctx.save();
	
	var ldiff = upper.lvl - lower.lvl;
	
	
	var inoff = trip(upper.rank, lower.rank, -10);
	var outoff = trip(upper.rank, lower.rank, 10);
// 	console.log(inoff, outoff, upper.name, lower.name);
	var midy = (lower.loc.y + upper.loc.y) / 2;
	
	ctx.beginPath();
	
	ctx.moveTo(lower.loc.x+outoff, lower.loc.y);
	
	if(false && ldiff > 1) { 
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
	
	ctx.strokeStyle = 'gray';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	ctx.restore();
	
	
}

var tree_nodes = {
	jquery: {name: 'JQuery', deps: ['css', 'js']},
	adv_css: {name: 'Advanced CSS', rank: 1, deps: ['css']},
	html: {name: 'HTML', rank: 2},
	css: {name: 'CSS', deps: ['html']},
	js: {name: 'Javascript', deps: ['html']},
	sql: {name: 'SQL', rank: 4,},
	nodejs: {name: 'NodeJS', deps: ['js']},
	crud: {name: 'CRUD App', rank: 4, deps: ['nodejs', 'sql']},
};


function main(ctx) {
	
	var nlist = [];
	var start = [];
	
	
	for(var x in tree_nodes) { 
		var y = tree_nodes[x];
		y.id = x;
		nlist.push(y);
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
	
	for(var n of sorted) {
		n.lvl = 1;
		for(var d of n.deps) {
			var m = tree_nodes[d];
			if(m.lvl >= n.lvl) n.lvl = m.lvl + 1;
		}
		
		if(!levels[n.lvl]) levels[n.lvl] = [];
		levels[n.lvl].push(n);
		
		
		rank_cache[n.lvl] = rank_cache[n.lvl] || {};
		if(n.rank) {
			if(rank_cache[n.lvl][n.rank]) {
				printf('rank collision')
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
			
			edges[edgekey(a, b)] = edge;
		}
	}
	
	// edge drawing
	for(var id in edges) {
		var e = edges[id];
		drawEdge(ctx, e.upper, e.lower);
	}
	
	// box drawing
	for(var id in tree_nodes) {
		drawBox(ctx, tree_nodes[id]);
	}
	
	
}






