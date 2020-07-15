﻿function distance(p1, p2) {
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
    try {
        for (i = 0; i < dungeonOBJ.room.length; i++) {
            if (dungeonOBJ.room[i] !== null && dungeonOBJ.room[i] !== undefined) {
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
    } catch (e) {
        console.error(e);
        throw e;
    }

    //for (i = 0; i < dungeonOBJ.stair.length; i++) {
    //    if (dungeonOBJ.stair[i] !== null && dungeonOBJ.stair[i] !== undefined) {
    //    }
    //}
    return data;
}


/**
 * nondestrutively set a rectangular region of a two-d array to a single value.
 * @param {Array} old_grid two dimensional array
 * @param {Tuple} start beginning coordinates in array
 * @param {Tuple} end final coordinates in array
 * @param {any} value static value to set array region to
 * @returns {Array} modified grid
 */
function set_grid_section(old_grid, start, end, value) {
    var grid = $j.extend(true, [], old_grid);
    for (var i = start.X; i <= end.X; i++) {
        for (var j = start.Y; j <= end.Y; j++)
            try {
                grid[i][j] = value;
            } catch (e) {
                //noop
            }
    }
    return grid;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ dungeon object to pull room definitions from
 * @param {boolean} do_extra_points whether to "salt" the list of room centers with some additional points to create hallway corners and dead ends
 * @returns {object} structure containing the graph, the room list, the minimum spanning tree, and the final points connections list from the mst
 */
function build_tree(dungeonOBJ, do_extra_points = false) {
    var rooms = build_rooms_for_tree(dungeonOBJ);

    var points = rooms.map(r => [r.center.x, r.center.y, r.id]);

    try {

        if (do_extra_points) {
            const room_spacing = get_dungeon_configuration("room_density", dungeonOBJ).size;
            console.warn('delaunator points from rooms: ' + JSON.stringify(points, null, '   '));
            const empty_points = empty_points_from_space(dungeonOBJ, room_spacing, rooms);
            const empty_points_map = empty_points.map(t => [t.X, t.Y]);
            const junction_points = shuffle(empty_points_map);
            const points_to_keep = Math.max(Math.round(junction_points.length / 5), 1);
            //console.warn('delaunator points from empty spaces: ' + JSON.stringify(junction_points, null, '   '));

            const selected_junctions = junction_points.slice(0, points_to_keep);
            dungeonOBJ.junction_points = selected_junctions;
            console.info('delaunator points subset of empty spaces chosen for union with rooms list: ' + JSON.stringify(selected_junctions, null, '   '));
            points = points.concat(selected_junctions);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }

    try {

        var d = Delaunator.from(points);

        var coordinates = [];
        for (let i = 0; i < d.triangles.length; i += 3) {
            coordinates.push({
                'nodes': [d.triangles[i], d.triangles[i + 1], d.triangles[i + 2]], // these are the nodes that make up the edges of this triangle
                'coordinates': [ // these are the vertexes of this triangle
                    points[d.triangles[i]],
                    points[d.triangles[i + 1]],
                    points[d.triangles[i + 2]]
                ]
            });
        }

        var g = new jsgraphs.WeightedGraph(points.length);

        for (let i = 0; i < coordinates.length; i++) {
            g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[0], coordinates[i].nodes[1], distance(coordinates[i].coordinates[0], coordinates[i].coordinates[1])));
            g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[1], coordinates[i].nodes[2], distance(coordinates[i].coordinates[1], coordinates[i].coordinates[2])));
            g.addEdge(new jsgraphs.Edge(coordinates[i].nodes[2], coordinates[i].nodes[0], distance(coordinates[i].coordinates[2], coordinates[i].coordinates[0])));
        }
        var kruskal = new jsgraphs.KruskalMST(g);
        var mst = kruskal.mst;

        console.log('number of vertexes in g: ' + g.V); // display the number of vertices in g
        console.log('Adjacent to 16: ' + g.adj(16)); // display which vertexes (by idx) which are adjacent to vertex 16
        return {
            'g': g,
            'rooms': rooms,
            'mst': mst
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
}

function get_mst_points(mst) {
    var mst_points = [];
    for (var i = 0; i < mst.length; ++i) {
        var e = mst[i];
        var v = e.either();
        var w = e.other(v);
        mst_points.push({ 'start:': v, 'end': w, 'weight': e.weight });
    }
    return mst_points;
}

function mst_nodes_from_grid(g, rooms) {
    var g_nodes = [];
    //console.debug('mst_nodes_from_grid(' + JSON.stringify(g,undefined,'  ') + ')');
    for (var v = 0; v < g.V; ++v) {
        g.node(v).label = v < rooms.length ? 'Room ' + (v + 1) : 'jctn ' + (v + 1 - rooms.length);
        g_nodes.push({
            id: v,
            label: g.node(v).label,
            shape: 'box',
            //size: Math.round((rooms[v].south-rooms[v].north * rooms[v].east - rooms[v].west)/10)
            widthConstraint: v < rooms.length ? (rooms[v].dimensions.w * get_pixels()): (2 * get_pixels())  ,
            heightConstraint: v < rooms.length ? (rooms[v].dimensions.h * get_pixels()): (2 * get_pixels()),
            x: v < rooms.length ? (rooms[v].center.x * get_pixels()) : g.coords[v*2],
            y: v < rooms.length ? (rooms[v].center.y * get_pixels()) : g.coords[v*2+1]
        });
    }
    return g_nodes;
}

/**
 * 
 * @param {WeightedGraph} grid grid to extract edges from
 * @returns {object} grid edges
 */
function mst_edges(grid) {
    console.debug('mst_edges()');
    var g_edges = [];
    for (var i = 0; i < grid.length; ++i) {
        var e = grid[i];
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

function get_sauce_edges(g) {
    console.debug('get_sauce_edges()');
    var g_edges = [];
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
    return g_edges;
}


function visualize(structure, container) {
    console.debug('visualize()');
    var g, rooms, mst;
    g = structure.g;
    rooms = structure.rooms;
    mst = structure.mst;
    var mst_points = get_mst_points(mst);

    console.log(JSON.stringify(mst_points, undefined, '   '));
    
    var g_nodes = mst_nodes_from_grid(g, rooms);

    // the winning MST edges.
    var g_edges = mst_edges(mst);

    // leftover edges
    var sauce_edges = get_sauce_edges(g).filter( edge => ! g_edges.find( element => element.to === edge.to && element.from === edge.from )  );

    g_edges = g_edges.concat(sauce_edges);

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
            randomSeed: 2
        },
        //edges: {
        //    width:2
        //},
        autoResize: true,
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