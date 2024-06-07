const recipeListEl = document.getElementById("recipe-list");

window.addEventListener("popstate", function (event) {
  // Check if the current URL path is '/recipes'
  if (window.location.pathname === "/recipes") {
    // Refresh the page
    window.location.reload();
  }
});

recipeListEl.addEventListener("click", async (event) => {
  // it will not do its default behaviour, which is to try to go to the server to fetch the page (GET)
  event.preventDefault();

  // if the click has originated from a link
  if (event.target.tagName === "A") {
    const href = event.target.getAttribute("href");
    // we have to dynamically to go `/recipes/<id>`
    window.history.pushState(null, null, href);

    // we have to show the loader for this particular a tag
    const spinner = event.target.nextElementSibling;
    spinner.classList.remove("hide");

    // fetch for an api that returns a particular recipe
    // `/recipes/<id>`
    const urlToFetchJSONFrom = `/api${href}`;

    // response object

    const response = await fetch(urlToFetchJSONFrom);
    // extract json out of response object
    const data = await response.json();

    // ul hide
    spinner.classList.add("hide");
    recipeListEl.classList.add("hide");

    // Loop over the keys of the data
    // for each key, we will find the paragraph element with the same id
    // and set the text content of that paragraph to the value of the key

    const fullRecipePlaceholderEl = document.getElementById(
      "full-recipe-placeholder",
    );
    fullRecipePlaceholderEl.classList.remove("hide");

    Object.entries(data)
      .filter(([key, value]) => {
        return key !== "id";
      })
      .forEach(([key, value]) => {
        const paragraph = document.getElementById(key);
        paragraph.textContent = value;
      });
  }
});
