const axios = require('axios');
const fs = require('fs');

async function fetchAlmatyRoads() {
    const query = `
    [out:json][timeout:60];
    area[name="Алматы"]->.searchArea;
    (
      way[highway="primary"](area.searchArea);
      way[highway="secondary"](area.searchArea);
      way[highway="tertiary"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    `;
    
    try {
        console.log("Fetching Almaty roads from Overpass API...");
        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        fs.writeFileSync('almaty_roads.json', JSON.stringify(response.data, null, 2));
        console.log("Success! Saved to almaty_roads.json");
    } catch (error) {
        console.error("Error fetching roads:", error.message);
    }
}

fetchAlmatyRoads();
