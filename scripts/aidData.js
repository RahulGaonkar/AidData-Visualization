let store = {};

function loadData() {
  return Promise.all([
      d3.csv("data/AidData.csv"),
      d3.json("data/countries.geo.json")
  ]).then(datasets => {
      store.data = datasets[0];
      store.geoJSON = datasets[1];
      return store;
  })
}

function transformData() {
  let dataIndex = {};
  for (let c of store.data){
    dataIndex[c.country] = {donated:+c.donated,received:+c.received};
  }
  store.geoJSON.features = store.geoJSON.features.map(d =>{
    let country = d.properties.name;
    if(country in dataIndex){
      d.properties.donated = dataIndex[country].donated;
      d.properties.received = dataIndex[country].received;
    }
    return d;
  })
}

function getMapConfig() {
    let width = 620;
    let height = 500;
    let container1 = d3.select("#Map1");
    let container2 = d3.select("#Map2");
    container1
      .attr("width", width)
      .attr("height", height)
    container2
    .attr("width", width)
    .attr("height", height)
    return {width, height, container1, container2}
}

function getMapProjection(config) {
    let {width, height} = config;
    let projection = d3.geoMercator()
    projection.scale(97)
          .translate([width / 2, height / 2 + 20])
    store.mapProjection = projection;
    return projection;
}

function drawBaseMap(container, countries, colorScale, attribute, projection) {
    let path = d3.geoPath().projection(projection);
    container.selectAll("path").data(countries)
        .enter().append("path")
        .attr("d", d => path(d))
        .attr("stroke", "#ccc")
        .attr("fill",
          d=> d.properties[attribute] ?
            colorScale(d.properties[attribute]):"white"
          )
}

function drawMap(geoJSON) {
    let config = getMapConfig();
    let projection = getMapProjection(config);
    let maxDonated = d3.max(geoJSON.features,
      d=> d.properties.donated);
    let medianDonated = d3.median(geoJSON.features,
      d=> d.properties.donated);
    let cScale1= d3.scaleLinear()
          .domain([0,medianDonated,maxDonated])
          .range(["#e5f5e0","#a1d99b","#31a354"]);
    drawBaseMap(config.container1, geoJSON.features, cScale1, "donated", projection);
    let maxReceived = d3.max(geoJSON.features,
      d=> d.properties.received);
    let medianReceived = d3.median(geoJSON.features,
      d=> d.properties.received);
    let cScale2= d3.scaleLinear()
          .domain([0,medianReceived,maxReceived])
          .range(["#fee6ce","#fdae6b","#e6550d"]);
    drawBaseMap(config.container2, geoJSON.features, cScale2, "received", projection);
}

function showData() {
    transformData();
    drawMap(store.geoJSON);
}

loadData().then(showData);
