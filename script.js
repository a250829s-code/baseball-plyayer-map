const csvURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDbk4hRCAheBniBKNlZhqp-eaty-Ln8YvfJeTBmY15vCNQ2ZgitfutAsf2yyzE0VH7K0q88DTKZ85/pub?gid=0&single=true&output=csv";
const googleFormURL = "https://forms.gle/3rFN5SMVfwiaJ8xU6";

// ===== 地図の初期化 =====

const map = new maplibregl.Map({
    container: 'map',

    style: {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: [
                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
            }
        },
        layers: [
            {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm'
            }
        ]
    },

    center: [139.767, 35.681],
    zoom: 1.5,

    projection: {
        type: 'globe'
    }
});

let locations = [];
let hanamaki;
let angels;
let searchTargets = {};

// ===== CSVを配列に変換 =====

function csvToArray(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(header => header.trim());

    return lines.slice(1).map(line => {
        const values = line.split(",").map(value => value.trim());
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        return row;
    });
}

// ===== 国ごとのマーカー色 =====

function markerColor(category) {
    switch (category) {
        case "Japan":
            return "#e53935";

        case "USA":
            return "#1565c0";

        case "Korea":
            return "#43a047";

        case "Taiwan":
            return "#fb8c00";

        default:
            return "#757575";
    }
}

// ===== 指定した場所へ移動 =====

function moveToLocation(loc) {
    map.flyTo({
        center: [loc.lng, loc.lat],
        zoom: 15,
        speed: 0.8,
        curve: 1.2
    });
}

// ===== 検索 =====

function searchLocation() {
    const keyword = document.getElementById('searchInput').value.trim();

    if (keyword === "") {
        alert("検索欄に「大谷翔平」「花巻東高校」「エンゼルス」などを入力してください。");
        return;
    }

    const loc = searchTargets[keyword];

    if (loc) {
        moveToLocation(loc);
    } else {
        alert("見つかりませんでした。");
    }
}

// ===== 軌跡表示：最短距離 =====

function showTrajectory() {
    if (!hanamaki || !angels) {
        alert("軌跡データがまだ読み込まれていません。");
        return;
    }

    const start = [hanamaki.lng, hanamaki.lat];
    const end = [angels.lng, angels.lat];

    const greatCircleLine = turf.greatCircle(
        start,
        end,
        {
            npoints: 100
        }
    );

    const trajectoryData = {
        type: "FeatureCollection",
        features: [
            greatCircleLine
        ]
    };

    const source = map.getSource("trajectory-source");

    if (source) {
        source.setData(trajectoryData);
    }

    if (map.getLayer("trajectory-line")) {
        map.setLayoutProperty("trajectory-line", "visibility", "visible");
    }

    if (map.getLayer("trajectory-arrow")) {
        map.setLayoutProperty("trajectory-arrow", "visibility", "visible");
    }

    map.flyTo({
        center: [-170, 45],
        zoom: 2,
        speed: 0.8,
        curve: 1.2
    });
}

// ==== 同じidの人の軌跡表示

function showPersonTrajectory(personId) {

    const personLocations = locations.filter(loc => loc.id === personId);

    if (personLocations.length < 2) {
        alert("軌跡を表示するには同じidの地点が2つ以上必要です。");
        return;
    }

    const features = [];

    for (let i = 0; i < personLocations.length - 1; i++) {

        const start = [
            personLocations[i].lng,
            personLocations[i].lat
        ];

        const end = [
            personLocations[i + 1].lng,
            personLocations[i + 1].lat
        ];

        const line = turf.greatCircle(start, end, {
            npoints: 100
        });

        features.push(line);
    }

    const trajectoryData = {
        type: "FeatureCollection",
        features: features
    };

    const source = map.getSource("trajectory-source");

    if (source) {
        source.setData(trajectoryData);
    }

    map.setLayoutProperty("trajectory-line", "visibility", "visible");
    map.setLayoutProperty("trajectory-arrow", "visibility", "visible");

    map.flyTo({
        center: [
            personLocations[0].lng,
            personLocations[0].lat
        ],
        zoom: 3,
        speed: 0.8,
        curve: 1.2
    });
}

// ===== 検索ボタン =====

document.getElementById('searchButton').addEventListener('click', searchLocation);

document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('searchInput').value = "";
    document.getElementById('searchInput').focus();
});

document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchLocation();
    }
});

// ==== Googleフォームを開く ====

document.getElementById("addTrajectoryButton").addEventListener("click", () => {
    window.open(googleFormURL, "_blank");
});

// ===== 地図読み込み後 =====

map.on('load', () => {
    map.setProjection({
        type: 'globe'
    });

    map.addControl(new maplibregl.NavigationControl());

    map.addSource('trajectory-source', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectory-source',
        layout: {
            visibility: 'none',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#e53935',
            'line-width': 4
        }
    });

    map.addLayer({
        id: 'trajectory-arrow',
        type: 'symbol',
        source: 'trajectory-source',
        layout: {
            visibility: 'none',
            'symbol-placement': 'line',
            'symbol-spacing': 120,
            'text-field': '▶',
            'text-size': 24,
            'text-keep-upright': false
        },
        paint: {
            'text-color': '#e53935',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        }
    });

    loadSpreadsheetData();
});

// ===== Google Sheetsから読み込み =====

function loadSpreadsheetData() {
    fetch(csvURL)
        .then(response => response.text())
        .then(csv => {
            locations = csvToArray(csv).map(row => ({
                id: row.id,
                name: row.name,
                lat: Number(row.lat),
                lng: Number(row.lng),
                category: row.category,
                description: row.description
            }));

            hanamaki = locations.find(loc => loc.id === "hanamaki");
            angels = locations.find(loc => loc.id === "angels");

            searchTargets = {
                "大谷翔平": hanamaki,
                "おおたにしょうへい": hanamaki,
                "オオタニショウヘイ": hanamaki,
                "花巻東高校": hanamaki,
                "花巻東": hanamaki,

                "エンゼルス": angels,
                "エンゼルス本拠地": angels,
                "エンゼルスの本拠地": angels,
                "エンゼルスタジアム": angels,
                "エンジェルスタジアム": angels,
                "Angel Stadium": angels,
                "angel stadium": angels,
                "Angels": angels,
                "angels": angels,
                "Los Angeles Angels": angels,
                "los angeles angels": angels
            };

           locations.forEach((loc, index) => {

                if (!loc.lat || !loc.lng) {
                    return;
                }

                let popupHTML = `<strong>${loc.name}</strong><br>${loc.description}`;

                // 大谷翔平専用
                if (loc.id === "hanamaki") {
                    popupHTML += `
                        <br>
                        <button
                            class="popup-button"
                            onclick="showTrajectory()"
                        >
                            大谷翔平選手の軌跡を見る
                        </button>
                    `;
                }

                // 同じidが2件以上あるか確認
                const samePersonLocations = locations.filter(item => item.id === loc.id);
                const firstLocation = samePersonLocations[0];

                if (
                    samePersonLocations.length >= 2 &&
                    loc === firstLocation &&
                    loc.id !== "hanamaki"
                ) {
                    popupHTML += `
                        <br>
                        <button
                            class="popup-button"
                            onclick="showPersonTrajectory('${loc.id}')"
                        >
                            軌跡を見る
                        </button>
                    `;
                }

                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(popupHTML);

                new maplibregl.Marker({
                    color: markerColor(loc.category)
                })
                    .setLngLat([loc.lng, loc.lat])
                    .setPopup(popup)
                    .addTo(map);
            });
        })
        .catch(error => {
            console.error(error);
            alert("Google Sheetsのデータを読み込めませんでした。CSV URLを確認してください。");
        });
}

// ===== メンバー紹介 =====

document.getElementById("memberButton").addEventListener("click", () => {
    const panel = document.getElementById("memberPanel");

    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
});

// ===== About =====

document.getElementById("aboutButton").addEventListener("click", () => {
    document.getElementById("aboutPanel").style.display = "block";
});

document.getElementById("closeAbout").addEventListener("click", () => {
    document.getElementById("aboutPanel").style.display = "none";
});
