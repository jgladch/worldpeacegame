let width = 960;
let height = 500;

let projection = d3.geo.dymaxion()
  .translate([width/3, height/6]);

let path = d3.geo.path()
  .projection(projection);

let graticule = d3.geo.graticule();

let svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

// svg.append('path')
//   .datum(graticule.outline)
//   .attr('class', 'background')
//   .attr('d', path);

// svg.selectAll('.graticule')
//   .data(graticule.lines)
//   .enter().append('path')
//   .attr('class', 'graticule')
//   .attr('d', path);

// svg.append('path')
//   .datum(graticule.outline)
//   .attr('class', 'foreground')
//   .attr('d', path);

d3.json('/json/d3_dymax/boundaries.json', (error, collection) => {
  svg.insert('path', '.graticule')
    .datum(collection)
    .attr('class', 'boundary')
    .attr('d', path);
});

d3.json('/json/d3_dymax/land.json', (error, collection) => {
  svg.insert('path', '.graticule,.boundary')
    .datum(collection)
    .attr('class', 'land')
    .attr('d', path);
});