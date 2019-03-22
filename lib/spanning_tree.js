function distance(p1, p2) {
    let x = Math.abs(p1[0] - p2[0]);
    let y = Math.abs(p1[1] - p2[1]);
    return Math.sqrt(x * x + y * y);
}

/**
 * 
 * @param {Dungeon} dungeonOBJ dungeon object to pull room definitions from
 * @returns {Array} a list of objects with {index, id, center{h,v}, dimensions{w,h}}
 */
function build_rooms_for_tree(dungeonOBJ) {
    var data = [], i = 0;
    for (i = 0; i < dungeonOBJ.room.length; i++) {
        if (dungeonOBJ.room[i] != null && dungeonOBJ.room[i] !== undefined) {
            var room = {
                'index': i,
                'id': dungeonOBJ.room[i].id,
                'dimensions': {
                    w: dungeonOBJ.room[i].east - dungeonOBJ.room[i].west,
                    h: dungeonOBJ.room[i].south - dungeonOBJ.room[i].north
                },
                'center': {
                    x: (dungeonOBJ.room[i].east + dungeonOBJ.room[i].west) / 2,
                    y: (dungeonOBJ.room[i].north + dungeonOBJ.room[i].south) / 2
                }
            };
            data.push(room);
        }
    }
    return data;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ dungeon object to pull room definitions from
 * @param {HTMLDivElement} container HTML container to write display to
 */
function build_tree(dungeonOBJ, container) {

    var rooms = build_rooms_for_tree(dungeonOBJ);

    var points = rooms.map(r => [r.center.x, r.center.y]);

    var d = Delaunator.from(points);
    div = document.getElementById('delaunay');

    var coordinates = [];
    for (let i = 0; i < d.triangles.length; i += 3) {
        coordinates.push({
            'nodes': [d.triangles[i], d.triangles[i + 1], d.triangles[i + 2]], // these are the nodes that make up the edges of this triangle
            'coordinates': [ // these are the coordinates of each point on this triangle
                points[d.triangles[i]],
                points[d.triangles[i + 1]],
                points[d.triangles[i + 2]]
            ]
        });
    }

    var g = new jsgraphs.WeightedGraph(points.length); // 6 is the number vertices in the graph

    for (let i = 0; i < coordinates.length; i++) {
        g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[0], coordinates[i].nodes[1], distance(coordinates[i].coordinates[0], coordinates[i].coordinates[1])));
        g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[1], coordinates[i].nodes[2], distance(coordinates[i].coordinates[1], coordinates[i].coordinates[2])));
        g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[2], coordinates[i].nodes[0], distance(coordinates[i].coordinates[2], coordinates[i].coordinates[0])));
    }
    var kruskal = new jsgraphs.KruskalMST(g);
    var mst = kruskal.mst;

    var mst_points = [];

    for (var i = 0; i < mst.length; ++i) {
        var e = mst[i];
        var v = e.either();
        var w = e.other(v);
        mst_points.push({ 'start:': v, 'end': w, 'weight': e.weight });
    }

    console.log(g.V); // display the number of vertices in g
    console.log(g.adj(0)); // display which vertexes (by idx) which are adjacent adjacent list to vertex 0

    visualize(g, rooms, mst, mst_points, container);
}

function mst_nodes_from_g(g, rooms) {
    var g_nodes = [];
    for (var v = 0; v < g.V; ++v) {
        g.node(v).label = 'Room ' + (v + 1); // assigned 'Node {v}' as label for node v
        g_nodes.push({
            id: v,
            label: g.node(v).label,
            shape: 'box',
            //size: Math.round((rooms[v].south-rooms[v].north * rooms[v].east - rooms[v].west)/10)
            widthConstraint: rooms[v].dimensions.w * get_pixels(),
            heightConstraint: rooms[v].dimensions.h * get_pixels(),
            x: rooms[v].center.x * get_pixels(),
            y: rooms[v].center.y * get_pixels()
        });
    }
    return g_nodes;
}

function g_edges_for_mst(g, mst, style) {
    var g_edges = [];
    for (var i = 0; i < mst.length; ++i) {
        var e = mst[i];
        var v = e.either();
        var w = e.other(v);
        e.highlighted = true;
        console.log('(' + v + ', ' + w + '): ' + e.weight);
        g_edges.push({
            from: v,
            to: w,
            length: Math.round(e.weight),
            label: '' + (Math.round(e.weight * 100) / 100),
            color: { color: '#ff0000', opacity: 0.9 },
            value: 2
        });
    }
    return g_edges;
}

function visualize(g, rooms, mst, mst_points, container) {
    console.log(JSON.stringify(mst_points, undefined, '   '));

    //var pre = document.createElement('pre');
    //pre.innerText = JSON.stringify(coordinates, undefined, '   ');
    //div.appendChild(pre);
    var g_nodes = mst_nodes_from_g(g, rooms);

    // the winning MST edges.
    var g_edges = g_edges_for_mst(g, mst);

    //// sauce edges.
    for (var v = 0; v < g.V; ++v) {

        var adj_v = g.adj(v);
        for (var i = 0; i < adj_v.length; ++i) {
            var e = adj_v[i];
            var w = e.other(v);
            if (w <= v) continue; // make sure only one edge between w and v since the graph is undirected
            if (e.highlighted) continue;

            g_edges.push({
                from: v,
                to: w,
                //length: e.weight,
                label: '' + (Math.round(e.weight * 100) / 100),
                color: { color: '#0000ff', opacity: 0.5 },
                dashes: true
            });
        };
    }

    var layoutMethod = "directed";
    // create an array with nodes
    var nodes = new vis.DataSet(g_nodes);

    // create an array with edges
    var edges = new vis.DataSet(g_edges);

    // create a network
    // var container = document.getElementById('mynetwork');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        layout: {
            randomSeed: 2,
            autoResize: true,
            height: '100%',
            width: '100%',
        },
        physics: false
    };
    //var options = {
    //    layout: {
    //        hierarchical: {
    //            sortMethod: layoutMethod
    //        }
    //    },
    //    edges: {
    //        smooth: true,
    //        //arrows: { to: true }
    //    }
    //};
    var network = new vis.Network(container, data, options);
    // add event listeners
    network.on('select', function (params) {
        document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes;
    });
}