let width = 960;
let height = 500;
let rotate = 60;
let scale0 = (width - 1) / 2 / Math.PI;
let centered;

let projection = d3.geo.dymaxion()
  .scale(200)
  .translate([width/3, height/6]);

let path = d3.geo.path()
  .projection(projection);

let handleDblClick = (d) => {
  console.log('dblclick!');
  console.log(d3.event.translate, d3.event.scale);
  svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
};

let zoomed = () => {
  console.log('zoomed!');
  // projection
  //   .translate(zoom.translate())
  //   .scale(zoom.scale());

  // g.selectAll('path')
  //   .attr('d', path);
}


let graticule = d3.geo.graticule();

let svg = d3.select('body').append('svg')
  .attr('width', '100%')
  .attr('height', '100%')
  .call(d3.behavior.zoom().on('zoom', () => {
    console.log(d3.event.translate, d3.event.scale);
    svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
  }))
  .on('dblclick', handleDblClick)
  .append('g');

var zoom = d3.behavior.zoom()
  .translate([width / 2, height / 2])
  .scale(150)
  .on('zoom', zoomed);

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

svg.selectAll('circle')
  .data([[-83.8, 42.2],[-83.7, 42.2]]).enter()
  .append('circle')
  .attr('cx', function (d) { console.log(projection(d)); return projection(d)[0]; })
  .attr('cy', function (d) { return projection(d)[1]; })
  .attr('r', '8px')
  .attr('fill', 'red');

});
