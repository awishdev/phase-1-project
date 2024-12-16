
let searchToggle = true;

let resultsHolder = [];

let resultsObj = {};

let selectionID = 0;

function init(){
    let form = document.getElementById("search-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 
        handleSubmit(e.target);
        form.reset();
        
    })

}


document.addEventListener("DOMContentLoaded", init);

function handleSubmit(formInput){

    resultsHolder = [];

    fetch(`https://api.jikan.moe/v4/anime?q=${formInput.search.value}&sfw`,{
    headers:
    {'Content-Type':'application/json'},})
  .then(response => response.json())
  .then(resData => resData.data.forEach(seriesResult => {
    renderResults(seriesResult)}));

  }

  function renderResults(series){
    resultsObj = {};
    console.log(series);
    resultsObj.id = series.mal_id;
    resultsObj.url = series.url;
    resultsObj.img = series.images.jpg.image_url;
    resultsObj.description = series.synopsis;
    resultsObj.episodes = series.episodes;
    resultsObj.score = series.score;

    let card = document.createElement("div");
    card.className = "resultsCard";
    card.innerHTML = `
      <div>
        <img id="${series.mal_id}" src="${series.images.jpg.image_url}" class="seriesImg" /> 
      </div>
      <h4>${series.titles[0].title}</h4>
      <div>
        <a href="${series.url}">
            <button type="button" id="info${series.mal_id}">More Info</button>
        </a>
        <button type="button" id="select${series.mal_id}">Select</button>
        </div>
    `;
    document.getElementById("search-results-container").appendChild(card);
    document.getElementById(`select${series.mal_id}`).addEventListener("click", () =>  handleSelect(series));
  }

  function handleSelect(series){

    console.log(series);
    //clear search results
    let container = document.getElementById("search-results-container");
    container.innerHTML = " ";
    //display selection
    let card = document.createElement("div");
    card.innerHTML = `
      <div>
        <img id="${series.mal_id}" src="${series.images.jpg.image_url}" class="seriesImg" /> 
      </div>
      <div>
        <h3>${series.titles[0].title}</h3>
      </div>
    `;
    selectionID = series.mal_id;
    
    card.classList.add("resultsCard");
    
    document.getElementById("selection-container").appendChild(card);
    

    //build form
    let formCard = document.createElement("div");
    formCard.innerHTML = `
      <form id="new-review">
      <h4>Add New Review</h4>
      <label for="new-rating">Rating: </label>
      <input type="number" name="rating" id="new-rating" />
      <p></p>
      <label for="new-comment">Comment: </label>
      <textarea name="comment" name="comment" id="new-comment"></textarea>
      <p></p>
      <label for="new-author">Author: </label>
      <textarea name="author" name="author" id="new-author"></textarea>
      <p></p>
      <input type="submit" id='submit-button' value="Post!" />
      </form>`;
    formCard.classList.add("formCardClass");  
    document.getElementById("review-form-div").appendChild(formCard);

    let reviewForm = document.getElementById("new-review");
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        reviewSubmit(e.target, series);
        reviewForm.reset();
        
    })

    //display reviews from json
    getReviews(series.mal_id);


  }
function getReviews(series){

  fetch(`http://localhost:3000/reviews`)
  .then(response => response.json())
  .then(data => data.forEach(review => {
    renderReview(review)}))

}

function renderReview(review){
  console.log(review);
  if(review.series === selectionID){
  let reviewCard = document.createElement("div");
  reviewCard.innerHTML = `
    <p>Rating: ${review.rating}</p>
    <p>${review.comment}</p>
    <p>Author: ${review.author}</p>
  `;
  reviewCard.classList.add("reviewCardClass");
  document.getElementById("review-container-div").appendChild(reviewCard);
  }

}
  //handle review form submit
function reviewSubmit(reviewData, series){
  console.log(reviewData);
  console.log(series);
  newReviewObj = {};
  newReviewObj.rating = reviewData.rating.value;
  newReviewObj.comment = reviewData.comment.value;
  newReviewObj.author = reviewData.author.value;
  newReviewObj.series = series.mal_id;
  //add to dom
  //renderReview(newReviewObj);
  postReview(newReviewObj)
}

function postReview(review){
  console.log(review);
  fetch(`http://localhost:3000/reviews`,{
    method: "POST",
    headers:
    {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body:JSON.stringify(review)
  })
  .then(response => response.json())
  .then(reviewData => renderReview(reviewData));
}
  //post review to json