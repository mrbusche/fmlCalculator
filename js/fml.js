(() => {
  'use strict';

  class Movie {
    constructor(movie, cost, estimate) {
      this.movie = movie;
      this.cost = parseInt(cost);
      this.estimate = parseInt(estimate);
    }
  }

  class MovieTheater {
    constructor(theater) {
      this.theater = theater;
    }
    baseSum(array, iteratee) {
      let result;

      for (const value of array) {
        const current = iteratee(value);
        if (current !== undefined) {
          result = result === undefined ? current : result + current;
        }
      }
      return result;
    }
    sumBy(array, iteratee) {
      return array != null && array.length ? this.baseSum(array, iteratee) : 0;
    }

    totalRevenue() {
      return this.sumBy(this.theater, x => x.estimate);
    }
    totalCost() {
      return this.sumBy(this.theater, x => x.cost);
    }

    movieList() {
      return this.theater.map(x => x.movie).join(', ');
    }
  }

  var fml = {};
  fml.combosWithRep = function(l, arr) {
    if (l === void 0) {
      l = arr.length;
    }
    const data = Array(l),
      results = [];
    (function f(pos, start) {
      if (pos === l) {
        results.push(data.slice());
        return;
      }
      for (let i = start; i < arr.length; ++i) {
        data[pos] = arr[i];
        f(pos + 1, i);
      }
    })(0, 0);
    return results;
  };

  fml.financial = function(x) {
    return '$' + x.toLocaleString('en-US');
  };

  fml.addPerformance = function(movieData) {
    const tableBodyRef = document.getElementById('performance');
    const newRow = tableBodyRef.insertRow(tableBodyRef.rows.length);
    let newCell = newRow.insertCell(0);
    newCell.appendChild(document.createTextNode(movieData.movie));
    newCell = newRow.insertCell(1);
    newCell.appendChild(document.createTextNode(fml.financial(movieData.cost)));
    newCell = newRow.insertCell(2);
    newCell.appendChild(document.createTextNode(fml.financial(movieData.estimate)));
    newCell = newRow.insertCell(3);
    newCell.appendChild(document.createTextNode(fml.financial(movieData.estimate / movieData.cost)));
  };

  fml.addTableData = function(order, movies, cost, boxOffice) {
    const tableBodyRef = document.getElementById('addMovies');
    const newRow = tableBodyRef.insertRow(tableBodyRef.rows.length);
    let newCell = newRow.insertCell(0);
    newCell.appendChild(document.createTextNode(order));
    newCell = newRow.insertCell(1);
    const movieResultList = movies.split(',');
    for (let mv = 0; mv < movieResultList.length; mv++) {
      newCell.appendChild(document.createTextNode(movieResultList[mv]));
      newCell = newRow.insertCell(mv + 2);
    }
    newCell.appendChild(document.createTextNode(cost));
    newCell = newRow.insertCell(10);
    newCell.appendChild(document.createTextNode(boxOffice));
  };

  fml.addMoviesToForm = function(movieList, costList, revenueList) {
    document.getElementById('movies').textContent = movieList.slice(0, 15).join('\n');
    document.getElementById('movieCost').textContent = costList.slice(0, 15).join('\n');
    document.getElementById('movieRevenue').textContent = revenueList.slice(0, 15).join('\n');
  };

  fml.generateMovies = function() {
    const movies = document.getElementById('movies').textContent.split('\n');
    const movieCost = document.getElementById('movieCost').textContent.split('\n');
    const movieRevenue = document.getElementById('movieRevenue').textContent.split('\n');
    const movieObj = [];
    for (let step = 0; step < 15; step++) {
      movieObj.push(new Movie(movies[step], movieCost[step], movieRevenue[step]));
    }
    movieObj.push(new Movie('blank', 0, -2000000));
    return movieObj;
  };

  fml.createList = function(id) {
    return document
      .getElementById(id)
      .value.split('\n')
      .join();
  };

  fml.updateUrl = function() {
    let newUrl = '?movies=' + fml.createList('movies');
    newUrl += '&costs=' + fml.createList('movieCost');
    newUrl += '&revenues=' + fml.createList('movieRevenue');
    window.location = encodeURI(newUrl);
  };

  var b = document.getElementById('sub');
  b.onclick = fml.updateUrl;

  fml.getURLParam = function(param) {
    const url = new URL(location.href);
    const searchParams = new URLSearchParams(url.search);
    return searchParams.get(param);
  };

  const moviesInUrl = fml.getURLParam('movies');
  const movieList = moviesInUrl !== null ? moviesInUrl.split(',') : document.getElementById('movies').textContent.split('\n');
  const costsInUrl = fml.getURLParam('costs');
  const costList = costsInUrl !== null ? costsInUrl.split(',') : document.getElementById('movieCost').textContent.split('\n');
  const revenuesInUrl = fml.getURLParam('revenues');
  const revenueList = revenuesInUrl !== null ? revenuesInUrl.split(',') : [];

  if (revenueList.length && (movieList.length !== costList.length || costList.length !== revenueList.length)) {
    document.getElementById('error').removeAttribute('style');
  }
  if (movieList.length && costList.length && revenueList.length) {
    fml.addMoviesToForm(movieList, costList, revenueList);
    const theMovies = fml.generateMovies();
    const sortMovies = theMovies.slice(0, 15);
    sortMovies.sort((a, b) => a.cost / a.estimate - b.cost / b.estimate);
    sortMovies.forEach(a => {
      fml.addPerformance(a);
    });

    document.getElementById('perfHeader').removeAttribute('style');
    document.getElementById('tableHeader').removeAttribute('style');
    document.getElementById('results1').removeAttribute('style');
    document.getElementById('results2').removeAttribute('style');
    const all = fml.combosWithRep(8, theMovies);
    const movieTheaters = all.map(it => new MovieTheater(it)).filter(it2 => it2.totalCost() < 1001);
    movieTheaters.sort((a, b) => b.totalRevenue() - a.totalRevenue());
    let count = 0;
    movieTheaters.forEach(a => {
      if (count < 20) {
        fml.addTableData(count + 1, a.movieList(), a.totalCost(), fml.financial(a.totalRevenue()));
      } else {
        return false;
      }
      count++;
    });
  }
})();
