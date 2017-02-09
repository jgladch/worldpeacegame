let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;
let scale = (width - 200) / 5;

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

foreground.selectAll('circle')
  .data([[-83.8, 42.2],[-83.7, 42.2]]).enter()
  .append('circle')
  .attr('cx', (d) => { return projection(d)[0]; })
  .attr('cy', (d) => { return projection(d)[1]; })
  .attr('r', '8px')
  .attr('fill', 'red');
