let pokemonArray = [];
let counter = 0;
let apiData;

const init = async function () {
    await getPokemonList();
    addTableRows();
}

init();


/* get first 20 pokemon*/
async function getPokemonList() {
    let res = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=20&offset=0')
    res = await res.json();
    for (let i = 0; i < res.results.length; i++) {
        pokemonArray.push(res.results[i].name);
    }
}

/* adds row to table, for each item in Pokemon array */
function addTableRows() {
    const targetTable = document.querySelector("tbody");
    for (let i = 0; i < pokemonArray.length; i++) {
        const row = document.createElement("tr");
        targetTable.appendChild(row);
        const cellId = document.createElement("td");
        const cellName = document.createElement("td");
        const cellAvatar = document.createElement("img");
        const avatarURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1 + counter}.png`;
        row.appendChild(cellId);
        row.appendChild(cellName);
        row.appendChild(cellAvatar);
        const upperPokemon = pokemonArray[i].charAt(0).toUpperCase() + pokemonArray[i].substring(1);
        cellName.innerText = upperPokemon;
        cellId.innerText = i + 1 + counter;
        cellAvatar.src = avatarURL;
    }
}

/* reset table for each page navigation */
function removeTableRows() {
    const targetTable = document.querySelector("tbody");
    targetTable.innerHTML = '';
}

const pageButtons = document.querySelector(".page-buttons");
/* logic to navigate to next or previous pages */
pageButtons.addEventListener("click", async function (event) {
    if (event.target.innerText === "Next") {
        if (counter === 0) {
            enablePreviousButton();
        } else if (counter === 900) {
            return;
        }
        await getNextPokemon();
        removeTableRows();
        addTableRows();
        resumeActiveRow();
        if (counter === 900) {
            disableNextButton();
        }
    } else if (event.target.innerText === "Previous") {
        await getPreviousPokemon();
        removeTableRows();
        addTableRows();
        resumeActiveRow();
        if (counter === 0) {
            disablePreviousButton();
        } else if (counter === 880) {
            enableNextButton();
        }
    }
})

/* gets the following or previous 20 pokemon */
async function getNextPokemon() {
    counter += 20;
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${counter}`);
    res = await res.json();
    pokemonArray = [];
    for (let i = 0; i < res.results.length; i++) {
        if (counter + i < 905) {
            pokemonArray.push(res.results[i].name);
        } else {
            return;
        }
    }
}

async function getPreviousPokemon() {
    if (counter === 0) {
        return;
    } else {
        counter -= 20;
        let res = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${counter}`);
        res = await res.json();
        pokemonArray = [];
        for (let i = 0; i < res.results.length; i++) {
            pokemonArray.push(res.results[i].name);
        }
    }
}

/* edit page button styles for first and last pages */
function enablePreviousButton() {
    const button = document.querySelector(".page-buttons").firstElementChild;
    button.style.backgroundColor = "var(--dkblue)";
    button.style.border = "1px solid var(--dkblue)";
    button.classList.add("hover-pointer");
}

function disablePreviousButton() {
    const button = document.querySelector(".page-buttons").firstElementChild;
    button.style.backgroundColor = "var(--grey)";
    button.style.border = "1px solid var(--grey)";
    button.classList.remove("hover-pointer");
}

function enableNextButton() {
    const button = document.querySelector(".page-buttons").lastElementChild;
    button.style.backgroundColor = "var(--dkblue)";
    button.style.border = "1px solid var(--dkblue)";
    button.classList.add("hover-pointer");
}

function disableNextButton() {
    const button = document.querySelector(".page-buttons").lastElementChild;
    button.style.backgroundColor = "var(--grey)";
    button.style.border = "1px solid var(--grey)";
    button.classList.remove("hover-pointer");
}

/* logic when user clicks a list item */
const optionsList = document.querySelector("tbody");
optionsList.addEventListener("click", function (event) {
    if (event.target.matches("th") || event.target.matches("tr")) {
        return;
    }
    removeActiveRow();
    addActiveRow(event);
    const id = parseInt(event.target.parentNode.innerText.slice(0, 3));
    setPokemonImage(id);
    if (counter > 0) {
        const pokemon = event.target.parentNode.innerText.slice(3).trim().toLowerCase();
        addInfoTable(pokemon);
    } else {
        const pokemon = event.target.parentNode.innerText.slice(2).trim().toLowerCase();;
        addInfoTable(pokemon);
    }
})

/* style the row of the currently selected pokemon */
function resumeActiveRow() {
    const rows = document.querySelectorAll("td");
    const pokemonName = document.querySelector("#pokemon-name").innerText;
    for (let row of rows) {
        if (row.innerText === pokemonName) {
            row.parentNode.classList.add("active-row");
        }
    }
}

function addActiveRow(event) {
    event.target.parentNode.classList.add("active-row");
}

function removeActiveRow() {
    const rows = document.querySelectorAll("tr");
    for (let row of rows) {
        row.classList.remove("active-row");
    }
}

/* sets pokemon image */
function setPokemonImage(id) {
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    const art = document.querySelector("#pokemon-art");
    art.removeAttribute("hidden");
    art.src = url;
    art.style.padding = "40px"
}

/* add table with selected pokemon's info */
async function addInfoTable(pokemon) {
    const head = document.querySelector(".pokemon-info")
    if (head.innerHTML === "") {
        addInfoHeaders(head);
    }
    const body = document.querySelector("#pokemon-info-body");
    await getPokemonData(pokemon);
    removeInfoRows(body);
    addInfoRows(body);
    addPokemonName(pokemon);
}

/* build the table for selected pokemon */
function addInfoHeaders(head) {
    const height = document.createElement("th");
    const weight = document.createElement("th");
    const type = document.createElement("th");
    head.appendChild(height);
    head.appendChild(weight);
    head.appendChild(type);
    height.innerText = "Height";
    weight.innerText = "Weight";
    type.innerText = "Type";
}

function addInfoRows(body) {
    const height = document.createElement("th");
    const weight = document.createElement("th");
    const type = document.createElement("th");
    body.appendChild(height);
    body.appendChild(weight);
    body.appendChild(type);
    weight.innerText = (parseInt(apiData.weight) / 10) + " KG";
    height.innerText = (parseInt(apiData.height) * 10) + " cm";
    type.innerText = (apiData.types[0].type.name).charAt(0).toUpperCase() + (apiData.types[0].type.name).substring(1);
    type.classList.add("poke-type");
    setTypeColor(type.innerText);
}

/* fetches pokemon data for selected pokemon */
async function getPokemonData(pokemon) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    apiData = await res.json();
}

/* reset the pokemon information */
function removeInfoRows(body) {
    body.innerHTML = '';
}

/* adds the selected pokemon header name  */
function addPokemonName(pokemon) {
    const header = document.querySelector("#pokemon-name");
    pokemon = pokemon.charAt(0).toUpperCase() + pokemon.substring(1);
    header.innerText = pokemon;
}

/* change "type" text color according to pokemon type */
function setTypeColor(type) {
    const span = document.querySelector(".poke-type");
    if (type === "Fire" || type === "Fighting") {
        span.style.color = "var(--red)";
    } else if (type === "Water" || type === "Ice" || type === "Dark") {
        span.style.color = "var(--dkblue)";
    } else if (type === "Grass" || type === "Bug") {
        span.style.color = "var(--green)";
    } else if (type === "Electric") {
        span.style.color = "var(--yellow)";
    } else if (type === "Ground" || type === "Rock") {
        span.style.color = "var(--brown)";
    } else if (type === "Poison" || type === "Dragon" || type === "Ghost" || type === "Psychic") {
        span.style.color = "var(--purple)";
    } else if (type === "Fairy" || type === "Flying") {
        span.style.color = "var(--pink)";
    } else if (type === "Steel" || type === "Normal") {
        span.style.color = "var(--grey)";
    }
}

