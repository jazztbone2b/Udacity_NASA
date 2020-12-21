let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRoverManifest: '',
    currentRoverPhotos: '',
    displayRoverData: false,
    loading: false
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}


// create content
const App = (state) => {
    let { rovers, apod } = state;

    if (!state.displayRoverData && !state.loading) {
        return `
            <header></header>
            <main id="main">
                ${Greeting(store.user.name)}
                <div>
                    <h3>Put things on the page!</h3>
                    <p>Here is an example section.</p>
                    <p>
                        One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                        the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                        This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                        applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                        explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                        but generally help with discoverability of relevant imagery.
                    </p>
                    ${ImageOfTheDay(apod)}

                    <h4>Click a button below to view a Mars Rover</h4>
                    ${generateRoverButtons(rovers)}
                </div>
            </main>
            <footer></footer>
        `
    } else if (state.loading) {
        return `
        <div>Loading...</div>
        `
    } else {
        return `
        <!-- Section to display Selected Rover and its data -->
            <div>
                ${generateRoverData()}
            </div>
        `
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

//------------- HELPERS -------------
const back = () => {
    updateStore(store, { displayRoverData: false, currentRoverPhotos: null });
}

const showLoading = () => {
    updateStore(store, { loading: true });
}

//------------- COMPONENTS -------------
const Greeting = (name) => {
    if (name) {
        return (`
            <h1>Welcome, ${name}!</h1>
        `);
    }

    return (`
        <h1>Hello!</h1>
    `);
}
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date);

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store);
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

const filterRoverPhotos = () => {
    if(store.currentRoverPhotos) {
        const photos = store.currentRoverPhotos.data.photos;

        return photos.map((item) => {
            return (`
            <img class="photo" src="${item.img_src}" alt="${item.earth_date}">
            <figcaption>${item.earth_date}</figcaption>
        `);
        }).join('');
    } else {
        return (`
            <div>Loading photos...</div>
        `);
    }
}

const generateRoverData = () => {
    const rover = store.currentRoverManifest.data.photo_manifest;

    return (`
        <h2>${rover.name}</h2>
        <ul class="rover">
            <li>Status: ${rover.status}</li>
            <li>Launch Date: ${rover.launch_date}</li>
            <li>Landing Date: ${rover.landing_date}</li>
        </ul>

        <div>
            ${filterRoverPhotos(rover.name)}
        </div>

        <button onClick="back()">Back</button>
    `);
}

//------------- API CALLS -------------
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));
}

const getRoverImages = (name) => {
    // get the photos based on the max_sol
    const sol = store.currentRoverManifest.data.photo_manifest.max_sol;

    let { currentRoverPhotos } = store;

    fetch(`http://localhost:3000/roverImages/${name}/${sol}`)
        .then(res => res.json())
        .then((currentRoverPhotos) => {
            updateStore(store, { currentRoverPhotos });
        });
}

const getRoverManifest = (name) => {
    let { currentRoverManifest, displayRoverData, loading } = store;

    fetch(`http://localhost:3000/roverManifest/${name}`)
        .then(res => res.json())
        .then((currentRoverManifest) => {
            updateStore(store, { currentRoverManifest, displayRoverData: true, loading: false });
            getRoverImages(name);
        });
}
