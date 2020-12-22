let store = Immutable.Map({
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRoverManifest: '',
    currentRoverPhotos: '',
    displayRoverData: false,
    loading: false
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.merge(newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}


// create content
const App = (state) => {
    if (state.get('displayRoverData') === false && !state.get('loading')) {
        return (`
            <header></header>
            <main id="main">
                <h1>NASA Rover Dashboard</h1>
                <div>
                    ${ImageOfTheDay(state.get('apod'))}

                    <h4>Click a button below to view a Mars Rover</h4>
                    ${generateRoverButtons(state.get('rovers'))}
                </div>
            </main>
        `);
    } else if (state.get('loading')) {
        return (`
            <div>Loading...</div>
        `);
    } else if (state.get('displayRoverData') === true) {
        return (`
            <!-- Section to display Selected Rover and its data -->
            <h1>NASA Rover Dashboard</h1>
            <h4>Click a button below to view a Mars Rover</h4>
                    ${generateRoverButtons(state.get('rovers'))}
            <div>
                ${generateRoverData(state)}
            </div>
        `);
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

//------------- HELPERS -------------
const back = () => {
    const newStore = store.set('displayRoverData', false).set('currentRoverPhotos', null)
    updateStore(store, newStore);
}

const showLoading = () => {
    const newStore = store.set('loading', true);
    updateStore(store, newStore);
}

//------------- COMPONENTS -------------
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date);

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay();
    }

    // only after getting the apod image of the day
    if(apod.image) {
        // check if the photo of the day is actually type video!
        if (apod.image.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.image.url}">here</a></p>
                <p>${apod.image.title}</p>
                <p>${apod.image.explanation}</p>
            `);
        } else {
            return (`
                <img src="${apod.image.url}" height="350px" width="100%" />
                <p>${apod.image.explanation}</p>
            `);
        }
    }
}

const generateRoverButtons = (rovers) => {
    return rovers.map(rover => {
        return (`
            <button onClick="showLoading(); getRoverManifest('${rover}')">
                ${rover}
            </button>
        `);
    }).join('');
}

const filterRoverPhotos = (state) => {
    if(state.get('currentRoverPhotos')) {
        let photos = state.get('currentRoverPhotos');
        photos = photos.data.photos;

        const date = `
            <div>
                <em>Latest photos taken from the ${photos[0].rover.name} on ${photos[0].earth_date}.</em>
            </div>
        `;

        const photoArr = photos.map((item) => {
            return (`
                <img class="photo" src="${item.img_src}" alt="${item.earth_date}">
            `);
        }).join('');

        return (`${date} ${photoArr}`);
    } else {
        return (`
            <div>Loading photos...</div>
        `);
    }
}

const generateRoverData = (state) => {
    const rover = state.get('currentRoverManifest');

    return (`
        <h2>${rover.data.photo_manifest.name} Rover</h2>
        <ul class="rover">
            <li>Status: ${rover.data.photo_manifest.status}</li>
            <li>Launch Date: ${rover.data.photo_manifest.launch_date}</li>
            <li>Landing Date: ${rover.data.photo_manifest.landing_date}</li>
        </ul>

        <div>
            ${filterRoverPhotos(state)}
        </div>

        <button onClick="back()">Back</button>
    `);
}

//------------- API CALLS -------------
const getImageOfTheDay = () => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then((apod) => {
            const newState = store.set('apod', apod);
            updateStore(store, newState);
        });
}

const getRoverImages = (name, manifest) => {
    // get the photos based on the max_sol
    const sol = manifest.data.photo_manifest.max_sol;

    fetch(`http://localhost:3000/roverImages/${name}/${sol}`)
        .then(res => res.json())
        .then((currentRoverPhotos) => {
            const newState = store.set('currentRoverManifest', manifest)
                .set('currentRoverPhotos', currentRoverPhotos)
                .set('displayRoverData', true)
                .set('loading', false);
            updateStore(store, newState);
        });
}

const getRoverManifest = (name) => {
    fetch(`http://localhost:3000/roverManifest/${name}`)
        .then(res => res.json())
        .then((currentRoverManifest) => {
            getRoverImages(name, currentRoverManifest);
        });
}
