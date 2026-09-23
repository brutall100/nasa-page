/* NASA Page: talks to three NASA APIs.
   If NASA does not answer (offline, rate limit, API retired),
   the page switches to demo mode and shows the saved images instead. */

/* DEMO_KEY works without sign-up (about 30 requests per hour).
   Get your own free key at https://api.nasa.gov/ and paste it here. */
const NASA_API_KEY = 'DEMO_KEY';

const API = {
    apod: 'https://api.nasa.gov/planetary/apod',
    marsRover: (rover) => `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
    library: 'https://images-api.nasa.gov/search',
};

const APOD_FIRST_DAY = '1995-06-16';
const SOL_SECONDS = 88775.244;
const LANDINGS = {
    curiosity: Date.UTC(2012, 7, 6, 5, 17),
    perseverance: Date.UTC(2021, 1, 18, 20, 55),
};
/* Last sol with photos for rovers that finished their missions */
const FINAL_SOL = { opportunity: 5111, spirit: 2208 };

const DEMO = {
    apod: {
        title: 'Deep space field (demo)',
        date: '',
        explanation: 'NASA did not answer right now, so this is a saved picture. ' +
            'Every day NASA publishes a new astronomy picture with a short explanation ' +
            'written by a professional astronomer. Try again in a moment, or pick another date.',
        url: 'images/deep-space.webp',
        media_type: 'image',
    },
    mars: {
        src: 'images/mars-rover.webp',
        alt: 'A rover-eye view of the rocky red surface of Mars',
    },
    library: {
        src: 'images/deep-space.webp',
        alt: 'A deep space field full of stars and distant galaxies',
    },
};

/* ---------- Helpers ---------- */

const $ = (selector) => document.querySelector(selector);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const toHttps = (url) => (url || '').replace(/^http:\/\//, 'https://');

function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

function solsSince(landing) {
    return Math.floor((Date.now() - landing) / 1000 / SOL_SECONDS);
}

async function fetchJson(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(query ? `${url}?${query}` : url, { signal: controller.signal });
        if (!response.ok) throw new Error(`NASA answered with status ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

function setStatus(state) {
    const status = $('.status');
    const text = status.querySelector('.status__text');
    /* Once anything loads live, keep saying "live" */
    if (status.dataset.state === 'live' && state === 'demo') return;
    status.dataset.state = state;
    text.textContent = state === 'live'
        ? 'Live data from NASA'
        : 'Demo mode: NASA is not answering, showing saved photos';
}

function setBusy(form, busy) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = busy;
    button.classList.toggle('is-loading', busy);
}

/* Swap an image smoothly, fall back to a local one if it fails to load */
function showImage(img, src, alt, fallbackSrc) {
    const frame = img.closest('.viewfinder');
    frame.classList.add('is-loading');
    img.onload = () => frame.classList.remove('is-loading');
    img.onerror = () => {
        img.onerror = null;
        img.src = fallbackSrc;
        frame.classList.remove('is-loading');
    };
    img.alt = alt;
    img.src = src;
}

function setCaption(element, text, link) {
    element.textContent = text;
    if (link) {
        element.append(' · ');
        const anchor = document.createElement('a');
        anchor.className = 'link';
        anchor.href = link.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.textContent = link.label;
        element.append(anchor);
    }
}

/* ---------- 1. Astronomy Picture of the Day ---------- */

const apodForm = $('#apod-form');
const apodDate = $('#apod-date');

function renderApod(data, isDemo) {
    const media = $('.apod__media');
    let img = $('#apod-image');

    media.querySelector('iframe')?.remove();
    if (!img) {
        img = document.createElement('img');
        img.id = 'apod-image';
        img.width = 1200;
        img.height = 695;
        media.prepend(img);
    }

    if (data.media_type === 'video' && /youtube|vimeo/.test(data.url)) {
        const video = document.createElement('iframe');
        video.src = data.url;
        video.title = data.title;
        video.allowFullscreen = true;
        video.loading = 'lazy';
        img.replaceWith(video);
        media.dataset.hud = 'APOD · VIDEO';
    } else {
        const src = data.media_type === 'image' ? data.url : data.thumbnail_url || DEMO.apod.url;
        showImage(img, toHttps(src), data.title, DEMO.apod.url);
        media.dataset.hud = 'APOD';
    }

    $('#apod-heading').textContent = data.title;
    const credit = data.copyright ? ` · © ${data.copyright.trim()}` : '';
    $('#apod-meta').textContent = (data.date || 'Saved picture') + credit;
    $('#apod-explanation').textContent = data.explanation;

    const link = $('#apod-link');
    if (isDemo) {
        link.href = 'https://apod.nasa.gov/apod/';
        link.textContent = 'Open on apod.nasa.gov';
    } else {
        const compact = data.date.replace(/-/g, '').slice(2);
        link.href = `https://apod.nasa.gov/apod/ap${compact}.html`;
        link.textContent = 'Open this day on apod.nasa.gov';
    }
}

async function loadApod(date) {
    setBusy(apodForm, true);
    try {
        const params = { api_key: NASA_API_KEY, thumbs: 'true' };
        if (date) params.date = date;
        const data = await fetchJson(API.apod, params);
        renderApod(data, false);
        apodDate.value = data.date;
        setStatus('live');
    } catch (error) {
        console.warn('APOD unavailable, showing demo picture.', error.message);
        renderApod(DEMO.apod, true);
        setStatus('demo');
    } finally {
        setBusy(apodForm, false);
    }
}

function randomApodDate() {
    const first = new Date(APOD_FIRST_DAY).getTime();
    const last = new Date(todayIso()).getTime();
    return new Date(randomInt(first, last)).toISOString().slice(0, 10);
}

apodDate.max = todayIso();
apodDate.value = todayIso();

apodForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadApod(apodDate.value);
});

$('#apod-random').addEventListener('click', () => {
    const date = randomApodDate();
    apodDate.value = date;
    loadApod(date);
});

/* ---------- 2. Mars rover photos ---------- */

const marsForm = $('#mars-form');
const roverSelect = $('#mars-rover');
const solInput = $('#mars-sol');
const marsImage = $('#mars-image');
const marsCaption = $('#mars-caption');

function maxSol(rover) {
    return FINAL_SOL[rover] || solsSince(LANDINGS[rover]);
}

function roverName(rover) {
    return rover.charAt(0).toUpperCase() + rover.slice(1);
}

roverSelect.addEventListener('change', () => {
    solInput.max = maxSol(roverSelect.value);
});
solInput.max = maxSol(roverSelect.value);

/* Plan B: the Mars Rover Photos API can be offline,
   so search the NASA image library for that rover instead */
async function loadRoverFromLibrary(rover) {
    const data = await fetchJson(API.library, { q: `${rover} rover mars`, media_type: 'image' });
    const items = data.collection.items.filter((item) => item.links?.length);
    if (!items.length) throw new Error('No library images for this rover');
    const item = pickRandom(items);
    const info = item.data[0];
    showImage(marsImage, toHttps(item.links[0].href), info.title, DEMO.mars.src);
    $('#mars .viewfinder').dataset.hud = 'ARCHIVE';
    setCaption(marsCaption, `${info.title} · ${info.date_created.slice(0, 10)}`, {
        href: `https://images.nasa.gov/details/${encodeURIComponent(info.nasa_id)}`,
        label: 'Source',
    });
}

async function loadMarsPhoto() {
    const rover = roverSelect.value;
    const top = maxSol(rover);
    const typed = parseInt(solInput.value, 10);
    const sol = Number.isNaN(typed) ? randomInt(1, top) : Math.min(Math.max(typed, 0), top);

    setBusy(marsForm, true);
    try {
        let photos;
        try {
            const data = await fetchJson(API.marsRover(rover), { sol, api_key: NASA_API_KEY });
            photos = data.photos;
        } catch (error) {
            console.warn('Mars Rover Photos API unavailable, using the image library.', error.message);
            await loadRoverFromLibrary(rover);
            setStatus('live');
            return;
        }

        if (!photos.length) {
            marsCaption.textContent = `${roverName(rover)} took no photos on sol ${sol}. Try another sol or leave it empty.`;
            setStatus('live');
            return;
        }

        const photo = pickRandom(photos);
        showImage(
            marsImage,
            toHttps(photo.img_src),
            `Photo from ${photo.rover.name}'s ${photo.camera.full_name} on sol ${photo.sol}`,
            DEMO.mars.src,
        );
        $('#mars .viewfinder').dataset.hud = photo.camera.name;
        marsCaption.textContent = `${photo.rover.name} · ${photo.camera.full_name} · Sol ${photo.sol} · ${photo.earth_date}`;
        setStatus('live');
    } catch (error) {
        console.warn('Mars photos unavailable, showing demo photo.', error.message);
        showImage(marsImage, DEMO.mars.src, DEMO.mars.alt, DEMO.mars.src);
        $('#mars .viewfinder').dataset.hud = 'DEMO';
        marsCaption.textContent = 'Demo mode: NASA is not answering, so this is a saved Mars photo.';
        setStatus('demo');
    } finally {
        setBusy(marsForm, false);
    }
}

marsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadMarsPhoto();
});

/* ---------- 3. NASA image library ---------- */

const libraryForm = $('#library-form');
const libraryImage = $('#library-image');
const libraryCaption = $('#library-caption');

async function loadLibraryImage(query) {
    setBusy(libraryForm, true);
    try {
        const data = await fetchJson(API.library, { q: query, media_type: 'image' });
        const items = data.collection.items.filter((item) => item.links?.length);
        if (!items.length) {
            libraryCaption.textContent = `Nothing found for "${query}". Try another word, like Saturn or Apollo.`;
            setStatus('live');
            return;
        }
        const item = pickRandom(items);
        const info = item.data[0];
        showImage(libraryImage, toHttps(item.links[0].href), info.title, DEMO.library.src);
        setCaption(libraryCaption, `${info.title} · ${info.date_created.slice(0, 10)}`, {
            href: `https://images.nasa.gov/details/${encodeURIComponent(info.nasa_id)}`,
            label: 'Source',
        });
        setStatus('live');
    } catch (error) {
        console.warn('NASA image library unavailable, showing demo image.', error.message);
        showImage(libraryImage, DEMO.library.src, DEMO.library.alt, DEMO.library.src);
        libraryCaption.textContent = 'Demo mode: NASA is not answering, so this is a saved image.';
        setStatus('demo');
    } finally {
        setBusy(libraryForm, false);
    }
}

libraryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadLibraryImage($('#library-query').value.trim());
});

/* ---------- Mission numbers ---------- */

function startCounters() {
    const days = Math.floor((Date.now() - new Date(APOD_FIRST_DAY).getTime()) / 86400000);
    const values = {
        'apod-days': days,
        'curiosity-sols': solsSince(LANDINGS.curiosity),
        'perseverance-sols': solsSince(LANDINGS.perseverance),
    };
    document.querySelectorAll('[data-count]').forEach((element) => {
        window.UI.countWhenVisible(element, values[element.dataset.count]);
    });
}

startCounters();
loadApod();
