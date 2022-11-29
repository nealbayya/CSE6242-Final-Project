//Visualization Team: Neal Bayya and Nishant Thangada

var margin = {top: 100, bottom: 100, left: 150, right: 150};
var width = 400;
var height = 400;
var circle_radius = 4;

var bar_chart_width = 500;
var bar_chart_height = 300;

var svg = d3.select("body").append("svg")
    .attr("width", 1500)
    .attr("height", height + margin.top + margin.bottom);
    
var plot = svg.append("g")
    .attr("id", "plot")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var display = svg.append("g")
    .attr("id", "movie_display")
    .attr("width", width)
    .attr("justify-contents", "center")
    .attr("height", height/2)
    .attr("transform", "translate(" + (margin.left + width + margin.right) + "," + margin.top + ")");
var bar_chart = svg.append("g")
    .attr("id", "bar_chart")
    .attr("width", bar_chart_width)
    .attr("height", bar_chart_height)
    .attr("transform", "translate(" + (margin.left + width + margin.right) + "," + (margin.top + 100) + ")");
var points = plot.append("g")
    .attr("id", "points");    
    
    
var colors = ['#ffd700', '#00ced1', '#b4eeb4', '#f5f5f5'];

function embeddings_callback(d) {
  return {
    idx: +d.idx,
    x: +d.x,
    y: +d.y
  };
}
function clusters_callback(d) {
  return {
    idx: +d.idx,
    cluster: +d.cluster,
  };
}

function on_select(genre2data, genre2umap, genre2clusters, movie_idx2recs, genre) {
  points.selectAll("*").remove();
  points.attr("pointer-events", "all");
  var genre_data = genre2data[genre];
  var genre_umap = genre2umap[genre];
  var genre_clusters = genre2clusters[genre];

  var genre_indices = Object.keys(genre_umap).map(d => +d);
  var x_scale = d3.scaleLinear()
    .domain([d3.min(genre_indices, function(d) { return genre_umap[d].x; }), d3.max(genre_indices, function(d) { return genre_umap[d].x; })])
    .range([0, width]);

  var y_scale = d3.scaleLinear()
    .domain([d3.min(genre_indices, function(d) { return genre_umap[d].y; }), d3.max(genre_indices, function(d) { return genre_umap[d].y; })])
    .range([0, height]);

  points.selectAll("dot")
  .data(genre_indices)
  .enter()
  .append("circle") 
  .attr("cx", function(d) { return x_scale(genre_umap[d].x) })
  .attr("cy", function(d) { return y_scale(genre_umap[d].y) })
  .attr("r", circle_radius)
  .style("fill", function(d) { 
    var cluster_value = genre_clusters[d];
    return colors[cluster_value];
  })
  .on("mouseover", function(d) {
    bar_chart.selectAll("*").remove();
    d3.select(this).attr("r", 2*circle_radius);
    var color = colors[genre_clusters[d]];
    var movie_display_data = genre_data[d];
    var title = movie_display_data.title;
    var rating = movie_display_data.rating;
    var year = movie_display_data.movie_date.substring(0, 4);
    display.selectAll("*").remove();
    display.append("text")
      .attr("x", 50)
      .attr("y", 0)
      .attr("id", "movie-title")
      .text(title + " (" + year + ")")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("text-align", "center")
      .attr("fill", color);
    display.append("text")
      .attr("x", 50)
      .attr("y", 30)
      .attr("id", "rating")
      .text("TMDB Rating: " + rating.toString() + ' / 10')
      .style("text-align", "center")
      .attr("fill", color);

    build_bar_graph(movie_idx2recs[d],  color);
  })
  .on("mouseout", function(d) {
    d3.select(this).attr("r", circle_radius);
  });
}

function build_bar_graph(recs_data, color) {
  var rec_names_data = recs_data.recs;
  var rec_names_display = rec_names_data.map(d => d.substring(0, 10));

  var x_scale_bar = d3.scaleBand().range([0, bar_chart_width]).padding(0.4)
  var y_scale_bar = d3.scaleLinear().range([bar_chart_height, 0]);
  x_scale_bar.domain(rec_names_display)
  y_scale_bar.domain([0, Math.max(...recs_data.dists)])
  bar_chart.append("g")
    .attr("transform", "translate(0," + bar_chart_height + ")")
    .call(d3.axisBottom(x_scale_bar))
    .attr("stroke", color)
    .attr("stroke-width", "1px");

  bar_chart.append("g")
    .call(d3.axisLeft(y_scale_bar).tickFormat(function(d){
        return "" + d;
    })
    .ticks(10))
    .attr("stroke", color)

  bar_chart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -bar_chart_height/2)
    .attr("y", -50)
    .attr("fill", color)
    .text("Distances");

  var bars = bar_chart.append("g")
    .attr("id", "bars");
  
  var dist_data = recs_data.dists;
  bars.selectAll(".bar")
    .data(dist_data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr('fill', color)
    .attr("x", function(d, i) {
      return x_scale_bar(rec_names_display[i]);
    })
    .attr("y", function(d, i) {
      return y_scale_bar(dist_data[i]); 
  })
    .attr("width", x_scale_bar.bandwidth())
    .attr("height", function(d, i) {
      return bar_chart_height - y_scale_bar(dist_data[i]); 
  });
}


Promise.all([d3.csv("data_prepared/clean_movie_credits_tmdb.csv", function(d) {
  return {
    idx: +d.idx,
    title: d.original_title,
    genres: JSON.parse(d.genres.replace(/'/g, '"')),
    rating: +d.vote_average,
    movie_date: d.release_date,
    overview: d.overview,
  }}), 
  d3.csv("data_prepared/clusters/action_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/adventure_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/animation_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/comedy_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/crime_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/documentary_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/drama_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/family_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/fantasy_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/foreign_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/history_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/horror_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/music_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/mystery_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/romance_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/sciencefiction_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/thriller_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/tvmovie_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/war_clusters.csv", clusters_callback),
  d3.csv("data_prepared/clusters/western_clusters.csv", clusters_callback),
  d3.csv("data_prepared/embeddings/action_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/adventure_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/animation_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/comedy_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/crime_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/documentary_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/drama_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/family_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/fantasy_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/foreign_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/history_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/horror_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/music_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/mystery_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/romance_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/sciencefiction_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/thriller_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/tvmovie_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/war_umap.csv", embeddings_callback),
  d3.csv("data_prepared/embeddings/western_umap.csv", embeddings_callback),
  d3.csv("data_prepared/recommendations.csv", function(d) {
    return {
      idx: +d.idx,
      recs: [d['Recommend Name 0'], d['Recommend Name 1'], d['Recommend Name 2'], d['Recommend Name 3'], d['Recommend Name 4'], d['Recommend Name 5'], d['Recommend Name 6'], d['Recommend Name 7'], d['Recommend Name 8'], d['Recommend Name 9']],
      dists: [+d['Recommend PCA Distances 0'], +d['Recommend PCA Distances 1'], +d['Recommend PCA Distances 2'], +d['Recommend PCA Distances 3'], +d['Recommend PCA Distances 4'], +d['Recommend PCA Distances 5'], +d['Recommend PCA Distances 6'], +d['Recommend PCA Distances 7'], +d['Recommend PCA Distances 8'], +d['Recommend PCA Distances 9']]
    }
  })]).then(function(files) {
  var data = files[0];
  var genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Foreign', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'];
  var genre2clusters = {}
  var genre2umap = {}
  for (let i = 1; i <= genres.length; i++) {
    var g = genres[i - 1];
    var per_g_cluster_data = files[i]
    var per_g_idx2cluster = {}
    for (let j = 0; j < per_g_cluster_data.length; j++) {
      var idx = +per_g_cluster_data[j].idx
      var cluster = +per_g_cluster_data[j].cluster
      per_g_idx2cluster[idx] = cluster
    }
    genre2clusters[g] = per_g_idx2cluster
  }
  for (let i = 1; i <= genres.length; i++) {
    var g = genres[i - 1];
    var per_g_umap_data = files[i + 20]
    var per_g_idx2umap = {}
    for (let j = 0; j < per_g_umap_data.length; j++) {
      var idx = +per_g_umap_data[j].idx
      var x_val = +per_g_umap_data[j].x
      var y_val = +per_g_umap_data[j].y
      per_g_idx2umap[idx] = {x: x_val, y: y_val}
    }
    genre2umap[g] = per_g_idx2umap
  }

  var genre2data = {}
  for (let i = 0; i < data.length; i++) {
    var movie_metadata = data[i];
    var movie_store_data = {
      title: movie_metadata.title,
      rating: movie_metadata.rating,
      movie_date: movie_metadata.movie_date,
      overview: movie_metadata.overview,
    }
    for (let j = 0; j < movie_metadata["genres"].length; j++) {
        var g = movie_metadata["genres"][j]
        if (g in genre2data) {
            genre2data[g][movie_metadata.idx] = movie_store_data;
        } else {
            genre2data[g] = {}
            genre2data[g][movie_metadata.idx] = movie_store_data;
        }
    }
  }

  var recs_file = files[41];
  var movie_idx2recs = {}
  for (let i = 0; i < recs_file.length; i++) {
    var recs_record = recs_file[i];
    movie_idx2recs[recs_record.idx] = {
      recs: recs_record.recs,
      dists: recs_record.dists
    }
  }

  var dropDown = d3.select("#dropdown_container")
  .append("select")
  .attr("id", "selection")
  .attr("name", "genre-list");
  var options = dropDown.selectAll("option")
  .data(Object.keys(genre2data))
  .enter()
  .append("option");
  options.text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });

  document.getElementById("selection").onchange = function() {
    on_select(genre2data, genre2umap, genre2clusters, movie_idx2recs, this.value)
  }
  on_select(genre2data, genre2umap, genre2clusters, movie_idx2recs, "Action");

}).catch(function(err) {
  // handle error here
  console.log(err)
})