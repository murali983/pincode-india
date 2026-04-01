let allData = [];
let filteredData = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function loadCSV() {
    const res = await fetch("data.csv");
    const text = await res.text();

    Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            allData = results.data;
            filteredData = allData;
            renderGrid(allData.slice(0, 50));
        }
    });
}

window.onload = loadCSV;

function handleSearch() {
    const q = document.getElementById("searchInput").value.toLowerCase();

    filteredData = allData.filter(item =>
        (item.officename || "").toLowerCase().includes(q) ||
        (item.pincode || "").includes(q) ||
        (item.district || "").toLowerCase().includes(q)
    );

    renderGrid(filteredData.slice(0, 100));
}

function showSuggestions() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const box = document.getElementById("suggestions");
    box.innerHTML = "";

    if (!q) return;

    const matches = allData.filter(x =>
        (x.officename || "").toLowerCase().includes(q)
    ).slice(0, 5);

    matches.forEach(m => {
        const div = document.createElement("div");
        div.innerText = m.officename;
        div.onclick = () => {
            document.getElementById("searchInput").value = m.officename;
            handleSearch();
            box.innerHTML = "";
        };
        box.appendChild(div);
    });
}

function openMap(place) {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(place)}`);
}

function openNearby(type, place) {
    window.open(`https://www.google.com/maps/search/${type} near ${place}`);
}

function toggleFav(pin) {
    if (favorites.includes(pin)) {
        favorites = favorites.filter(x => x !== pin);
    } else {
        favorites.push(pin);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderGrid(filteredData.slice(0, 100));
}

function filterDistrict() {
    const d = document.getElementById("districtFilter").value;

    if (!d) {
        filteredData = allData;
    } else {
        filteredData = allData.filter(x => x.district === d);
    }

    renderGrid(filteredData.slice(0, 100));
}

function renderGrid(data) {
    const grid = document.getElementById("resultsGrid");
    grid.innerHTML = "";

    data.forEach(item => {
        const place = `${item.officename}, ${item.district}, ${item.statename}`;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${item.officename}</h3>
            <p>${item.pincode}</p>
            <p>${item.district}</p>

            <button onclick="openMap('${place}')">Map</button>
            <button onclick="openNearby('bus stand','${place}')">Bus</button>
            <button onclick="openNearby('railway station','${place}')">Railway</button>

            <button onclick="toggleFav('${item.pincode}')">
                ${favorites.includes(item.pincode) ? "Saved" : "Save"}
            </button>
        `;

        grid.appendChild(card);
    });
}
