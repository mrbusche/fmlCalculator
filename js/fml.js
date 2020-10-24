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
      return this.sumBy(this.theater, (x) => x.estimate);
    }
    totalCost() {
      return this.sumBy(this.theater, (x) => x.cost);
    }

    movieList() {
      return this.theater.map((x) => x.movie).join(', ');
    }
  }

  const fml = {};
  fml.combosWithRep = function (l, arr) {
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

  fml.financial = function (x) {
    return '$' + x.toLocaleString('en-US');
  };

  fml.addPerformance = function (movieData, tableBodyRef) {
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

  fml.clearChildren = function (containerNode) {
    while (containerNode.firstChild) {
      containerNode.removeChild(containerNode.lastChild);
    }
  }

  fml.addTableData = function (tableBodyRef, order, movies, cost, boxOffice) {
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

  fml.addMoviesToForm = function (listOfMovies, listOfCosts, listOfRevenues) {
    document.getElementById('movies').textContent = listOfMovies.slice(0, 15).join('\n');
    document.getElementById('movieCost').textContent = listOfCosts.slice(0, 15).join('\n');
    document.getElementById('movieRevenue').textContent = listOfRevenues.slice(0, 15).join('\n');
  };

  fml.generateMovies = function () {
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

  fml.createList = function (id) {
    return document.getElementById(id).value.split('\n').join();
  };

  fml.updateUrl = function () {
    const movies = fml.createList('movies');
    const costs = fml.createList('movieCost');
    const revenues = fml.createList('movieRevenue');
    const params = new URLSearchParams(location.search);
    params.set('movies', movies);
    params.set('costs', costs);
    params.set('revenues', revenues);

    const queryParams = {
      movies,
      costs,
      revenues
    };

    window.history.replaceState(queryParams, 'FML Calculator', `${location.pathname}?${params.toString()}`);
    window.history.pushState(queryParams, 'FML Calculator')
    fml.renderMovies();
  };

  fml.getURLParam = function (param) {
    const url = new URL(location.href);
    const searchParams = new URLSearchParams(url.search);
    return searchParams.get(param);
  };

  fml.renderMovies = function () {
    window.scrollTo(0, 0);
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
      sortMovies.sort((c, d) => c.cost / c.estimate - d.cost / d.estimate);
      const performanceTable = document.getElementById('performance');
      fml.clearChildren(performanceTable);
      sortMovies.forEach((movieData) => {
        fml.addPerformance(movieData, performanceTable);
      });

      document.getElementById('perfHeader').removeAttribute('style');
      document.getElementById('tableHeader').removeAttribute('style');
      document.getElementById('results1').removeAttribute('style');
      document.getElementById('results2').removeAttribute('style');
      const all = fml.combosWithRep(8, theMovies);
      const movieTheaters = all.map((it) => new MovieTheater(it)).filter((it2) => it2.totalCost() < 1001);
      movieTheaters.sort((e, f) => f.totalRevenue() - e.totalRevenue());
      let count = 0;
      const movieTable = document.getElementById('addMovies');
      fml.clearChildren(movieTable);
      movieTheaters.forEach((a) => {
        if (count < 20) {
          fml.addTableData(movieTable, count + 1, a.movieList(), a.totalCost(), fml.financial(a.totalRevenue()));
        } else {
          return false;
        }
        count++;
      });
    }
  }

  fml.renderMovies();

  const b = document.getElementById('sub');
  b.onclick = fml.updateUrl;
})();
