// 4. 地図の初期化
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [139.767, 35.681],
    zoom: 1.5,
});

// データの定義（MapLibreは [経度(lng), 緯度(lat)] の順番）
const locations = [
    {
        id: "hanamaki",
        lng: 141.1166,
        lat: 39.4084,
        name: "花巻東高校",
        description: "大谷翔平さんの出身高校"
    },
    {
        id: "angels",
        lng: -117.8827,
        lat: 33.8003,
        name: "エンゼルス本拠地",
        description: "Angel Stadium of Anaheim"
    }
];

const hanamaki = locations.find(loc => loc.id === "hanamaki");
const angels = locations.find(loc => loc.id === "angels");

// 検索用データ
const searchTargets = {
    "大谷翔平": hanamaki,
    "おおたにしょうへい": hanamaki,
    "オオタニショウヘイ": hanamaki,
    "花巻東高校": hanamaki,
    "花巻東": hanamaki,
    "はなまきひがしこうこう": hanamaki,
    "ハナマキヒガシコウコウ": hanamaki,

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

// 指定した場所へ移動する関数
function moveToLocation(loc) {
    map.flyTo({
        center: [loc.lng, loc.lat],
        zoom: 15,
        speed: 0.8,
        curve: 1.2
    });
}

// 検索する関数
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
        alert("見つかりませんでした。「大谷翔平」「花巻東高校」「エンゼルス」などを入力してください。");
    }
}

// 花巻東高校からエンゼルス本拠地までの軌跡を表示する関数
function showTrajectory() {
    const trajectoryData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    name: '花巻東高校からエンゼルス本拠地への軌跡'
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [hanamaki.lng, hanamaki.lat],
                        [angels.lng, angels.lat]
                    ]
                }
            }
        ]
    };

    const source = map.getSource('trajectory-source');

    if (source) {
        source.setData(trajectoryData);
    }

    if (map.getLayer('trajectory-line')) {
        map.setLayoutProperty('trajectory-line', 'visibility', 'visible');
    }

    if (map.getLayer('trajectory-arrow')) {
        map.setLayoutProperty('trajectory-arrow', 'visibility', 'visible');
    }

    map.flyTo({
        center: [-170, 37],
        zoom: 2.1,
        speed: 0.8,
        curve: 1.2
    });
}

// 検索ボタンをクリックしたら検索
document.getElementById('searchButton').addEventListener('click', searchLocation);

//xボタンをクリックしたら検索欄を空にする
document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('searchInput').value = "";
    document.getElementById('searchInput').focus();
});

// Enterキーでも検索できるようにする
document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchLocation();
    }
});

// 地図のスタイルが読み込まれたら実行
map.on('style.load', () => {
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

    locations.forEach(loc => {
        let popupHTML = `<strong>${loc.name}</strong>`;

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
        } else {
            popupHTML += `<br>${loc.description}`;
        }

        const popup = new maplibregl.Popup({ offset: 25 })
            .setHTML(popupHTML);

        new maplibregl.Marker()
            .setLngLat([loc.lng, loc.lat])
            .setPopup(popup)
            .addTo(map);
    });
});

document.getElementById("memberButton").addEventListener("click", () => {

    const panel = document.getElementById("memberPanel");

    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }

});

// Aboutボタン

document
.getElementById("aboutButton")
.addEventListener("click",()=>{

    document
    .getElementById("aboutPanel")
    .style.display="block";

});

// 閉じるボタン

document
.getElementById("closeAbout")
.addEventListener("click",()=>{

    document
    .getElementById("aboutPanel")
    .style.display="none";

});
