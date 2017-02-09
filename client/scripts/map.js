let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;
let scale = (width - 200) / 5;

// Something like this might come in handy later
// $(window).resize(function() {
//   currentWidth = $('#map').width();
//   svg.attr('width', currentWidth);
//   svg.attr('height', currentWidth * height / width);
// });

let projection = d3.geo.dymaxion()
  .scale(scale)
  .translate([width/3, height/6]);

let path = d3.geo.path()
  .projection(projection);

let graticule = d3.geo.graticule();

let svg = d3.select('body').append('svg')
  .attr('id', 'map-canvas')
  .attr('width', '100%')
  .attr('height', '100%')
  .call(d3.behavior.zoom().on('zoom', () => { // Shift over all layers of SVG
    svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    foreground.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    background.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
  }));

let background = svg.append('g').attr('id','background');
let foreground = svg.append('g').attr('id','foreground'); // Painted last, so shown on top

// background.append('path')
//   .datum(graticule.outline)
//   .attr('class', 'background')
//   .attr('d', path);

// background.selectAll('.graticule')
//   .data(graticule.lines)
//   .enter().append('path')
//   .attr('class', 'graticule')
//   .attr('d', path);

// background.append('path')
//   .datum(graticule.outline)
//   .attr('class', 'foreground')
//   .attr('d', path);

d3.json('/json/d3_dymax/boundaries.json', (error, collection) => {
  background.insert('path', '.graticule')
    .datum(collection)
    .attr('class', 'boundary')
    .attr('d', path);
});

d3.json('/json/d3_dymax/land.json', (error, collection) => {
  background.insert('path', '.graticule,.boundary')
    .datum(collection)
    .attr('class', 'land')
    .attr('d', path);
});

const OD_PAIRS = [
  ['NRT', 'JFK'],
  ['SFO', 'NRT'],
  ['LAX', 'HNL'],
  ['HNL', 'NRT'],
  ['CDG', 'JFK'],
  ['NRT', 'SYD'],
  ['FCO', 'PEK'],
  ['LHR', 'PVG'],
  ['NRT', 'ARN'],
  ['LAX', 'JFK'],
  ['NRT', 'DEL'],
  ['DFW', 'GRU'],
  ['MAD', 'ATL'],
  ['ORD', 'CAI'],
  ['HKG', 'CDG'],
  ['LAS', 'CDG'],
  ['NRT', 'SVO'],
  ['DEN', 'HNL'],
  ['ORD', 'LAX'],
  ['SIN', 'SEA'],
  ['SYD', 'PEK'],
  ['CAI', 'CPT'],
  ['CUN', 'JFK'],
  ['ORD', 'JFK'],
  ['LHR', 'BOM'],
  ['LAX', 'MEX'],
  ['LHR', 'CPT'],
  ['PVG', 'CGK'],
  ['SYD', 'BOM'],
  ['JFK', 'CPT'],
  ['MAD', 'GRU'],
  ['EZE', 'FCO'],
  ['DEL', 'DXB'],
  ['DXB', 'NRT'],
  ['GRU', 'MIA'],
  ['SVO', 'PEK'],
  ['YYZ', 'ARN'],
  ['LHR', 'YYC'],
  ['HNL', 'SEA'],
  ['JFK', 'EZE'],
  ['EZE', 'LAX'],
  ['CAI', 'HKG'],
  ['SVO', 'SIN'],
  ['IST', 'MCO'],
  ['MCO', 'LAX'],
  ['FRA', 'LAS'],
  ['ORD', 'FRA'],
  ['MAD', 'JFK']
];
const OD_POINTS = ['CDG', 'SFO','HNL','LAX'];
let airportMap = {};

d3.json('/json/features/airports.topo.json', (error, collection) => {
  foreground.selectAll('path')
    .data(topojson.feature(collection, collection.objects.airports).features)
    .enter()
    .append('path')
    .attr('class', 'airports')
    .attr('id', (d) => {return d.id;})
    .attr('d', path);

  let geos = topojson.feature(collection, collection.objects.airports).features;

  _.each(geos, (geo) => {
    if (!!geo) {
      airportMap[geo.properties.abbrev] = geo.geometry.coordinates;
    }
  });

  draw_route(OD_POINTS);

  let i = 0;
  setInterval(() => {
    if (i > OD_PAIRS.length - 1) {
      i = 0;
    }

    let od = OD_PAIRS[i];
    fly(od[0], od[1]);
    i++;
  }, 150); 
});

foreground.selectAll('circle')
  .data([[-83.8, 42.2],[-83.7, 42.2]]).enter()
  .append('circle')
  .attr('cx', (d) => { return projection(d)[0]; })
  .attr('cy', (d) => { return projection(d)[1]; })
  .attr('r', '8px')
  .attr('fill', 'red');

let transition = (plane, route) => {
  let l = route.node().getTotalLength();
  plane.transition()
    .duration(l * 50)
    .attrTween('transform', delta(plane, route.node()))
    .each('end', function() { route.remove(); })
    .remove();
};

let delta = (plane, path) =>{
  var l = path.getTotalLength();
  var plane = plane;
  return (i) => {
    return (t) => {
      let p = path.getPointAtLength(t * l);

      let t2 = Math.min(t + 0.05, 1);
      let p2 = path.getPointAtLength(t2 * l);

      let x = p2.x - p.x;
      let y = p2.y - p.y;
      let r = 90 - Math.atan2(-y, x) * 180 / Math.PI;

      let s = Math.min(Math.sin(Math.PI * t) * 0.7, 0.3);

      return 'translate(' + p.x + ',' + p.y + ') scale(' + s + ') rotate(' + r + ')';
    }
  }
}

let draw_route = (points) => {
  let coords = [];
  let reverse = [];

  _.each(points, (point) => {
    let coordinates = airportMap[point];
    coords.push(coordinates);
    reverse.push(coordinates);
  });

  reverse.reverse();

  _.each(reverse, (point) => {
    coords.push(point);
  });

  let route = foreground.append('path')
    .datum({type: 'LineString', coordinates: coords})
    .attr('class', 'traceroute')
    .attr('d', path);
}

let fly = (origin, destination) => {
  var route = foreground.append('path')
    .datum({type: 'LineString', coordinates: [airportMap[origin], airportMap[destination]]})
    .attr('class', 'route')
    .attr('d', path);

  var plane = foreground.append('path')
    .attr('class', 'plane')
    .attr('transform', 'translate(-100, -100)')
    .attr('d', 'm25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z');

  transition(plane, route);
}
