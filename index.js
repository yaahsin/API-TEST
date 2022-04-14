const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const layout = document.querySelector(".layout")
let layoutMethod = "card"
let page = 1

function renderMovieList(data) {
  //   不同的view模式函式
  const card = function card(item) {
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>`;
  };
  const list = function list(item) {
    // title, image, id
    rawHTML += `
        <li class="list list-group-item d-flex justify-content-between align-items-center">
          ${item.title}
          <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}"> More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}"> +
          </button>
          </div>
        </li>`;
  };
  let rawHTML = "";
  //   依layoutMethod結果調用函式
  data.forEach((item) => {
    if (layoutMethod === "card") {
      card(item);
    } else if (layoutMethod === "list") {
      rawHTML += `<ul class="list-group pb-2">`;
      list(item);
      rawHTML += `</ul>`;
    }
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  console.log(movie)
  // 避免重複
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  console.log(list)
  // 轉換成local storage可用的jSON格式
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()


  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

// listen to layout
layout.addEventListener("click", function onPanelClicked(event) {
  //   條件判斷選用的view模式
  if (event.target.matches(".layout-list")) {
    layoutMethod = "list";
  } else if (event.target.matches(".layout-card")) {
    layoutMethod = "card";
  }
  //   在轉換view模式時，維持在當前頁面
  let page = Number(document.querySelectorAll(".active")[0].innerText);
  if (isNaN(page)) {
    page = 1;
  }

  renderMovieList(getMoviesByPage(page));
});

// listen to paginator
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const activePage = document.querySelectorAll(".active");
  const clickPage = event.target.parentElement;
  //  若所按的物件是頁面鈕(表示換頁)，移除當前頁面active標示
  if (clickPage.classList.contains("page-item")) {
    activePage.forEach((element) => element.classList.remove("active"));
  }
  // 標示當前active的頁面
  clickPage.classList.add("active");
  if (event.target.tagName !== "A") return;
  // <a> </a>
  let page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))