import './style.css'
import gsap from 'gsap'

// --- Selectors ---
const searchView = document.getElementById('search-view');
const dashboardView = document.getElementById('dashboard-view');
const searchBtn = document.getElementById('search-btn');
const usernameInput = document.getElementById('username-input');
const backHomeBtn = document.getElementById('back-home');
const errorToast = document.getElementById('error-toast');

// Data Elements
const avatarEl = document.getElementById('avatar');
const nameEl = document.getElementById('user-display-name');
const loginEl = document.getElementById('user-display-login');
const bioEl = document.getElementById('bio');
const reposCountEl = document.getElementById('repos-count');
const followersCountEl = document.getElementById('followers-count');
const followingCountEl = document.getElementById('following-count');
const repoGrid = document.getElementById('repo-grid');

// New Metadata selectors
const locationUi = document.getElementById('location-ui');
const locationEl = document.getElementById('location');
const websiteUi = document.getElementById('website-ui');
const websiteEl = document.getElementById('website');

// --- Initialization ---
window.addEventListener('load', () => {
    // 1. Mark body as ready to trigger CSS fade-in
    document.body.classList.add('ready');

    // 2. Hide error instantly
    gsap.set(errorToast, { display: 'none', yPercent: -200 });

    // 3. Entrance Animation
    const tl = gsap.timeline();
    tl.from("#main-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
    })
        .from(".search-underline", {
            width: 0,
            opacity: 0,
            duration: 1,
            ease: "expo.out"
        }, "-=0.8");

    usernameInput.focus();
});

// --- Event Listeners ---
searchBtn.addEventListener('click', handleSearch);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
backHomeBtn.addEventListener('click', resetView);

async function handleSearch() {
    const u = usernameInput.value.trim().toLowerCase();
    if (!u) return;

    hideError();

    // Feedback
    const originalPlaceholder = usernameInput.placeholder;
    usernameInput.placeholder = "SEARCHING...";
    usernameInput.disabled = true;
    gsap.to(searchBtn, { opacity: 0.2, duration: 0.3 });

    try {
        const userData = await fetchUser(u);
        const reposData = await fetchRepos(u);

        // Populate
        renderData(userData, reposData);

        // Transition
        const tl = gsap.timeline();

        // 1. Hide Search View (and pull it out of layout)
        tl.to(searchView, {
            opacity: 0,
            y: -50,
            scale: 0.95,
            duration: 0.7,
            ease: "power3.inOut"
        });

        // Use a tiny offset to hide it from layout before dashboard enters
        tl.set(searchView, { display: 'none' }, "-=0.2");

        tl.call(() => {
            dashboardView.classList.remove('hidden');
            window.scrollTo(0, 0);
        }, null, "-=0.1");

        tl.fromTo(dashboardView,
            { opacity: 0, y: 50, scale: 1.05 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out" }
        );

        tl.fromTo(".glass-bento",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.2)" },
            "-=0.5"
        );

    } catch (error) {
        showError(error.message === "404" ? "USER NOT IDENTIFIED" : "SYSTEM ERROR");
        usernameInput.placeholder = originalPlaceholder;
    } finally {
        usernameInput.disabled = false;
        gsap.to(searchBtn, { opacity: 1, duration: 0.3 });
        usernameInput.focus();
    }
}

function resetView() {
    const tl = gsap.timeline();
    tl.to(dashboardView, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            dashboardView.classList.add('hidden');
            searchView.classList.remove('hidden');
            usernameInput.value = "";
            usernameInput.placeholder = "ENTER USERNAME...";
        }
    });
    tl.fromTo(searchView,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    tl.call(() => usernameInput.focus());
}

// --- Utils ---
async function fetchUser(u) {
    const r = await fetch(`https://api.github.com/users/${u}`);
    if (!r.ok) throw new Error(r.status);
    return r.json();
}

async function fetchRepos(u) {
    try {
        const r = await fetch(`https://api.github.com/users/${u}/repos?sort=updated&per_page=6`);
        return r.ok ? await r.json() : [];
    } catch { return []; }
}

function renderData(user, repos) {
    avatarEl.src = user.avatar_url;
    nameEl.textContent = user.name || user.login;
    loginEl.textContent = `@${user.login}`;
    bioEl.textContent = user.bio || "NO BIO DATA FOUND.";

    animateStat(reposCountEl, user.public_repos);
    animateStat(followersCountEl, user.followers);
    animateStat(followingCountEl, user.following);

    // Metadata
    updateField(locationUi, locationEl, user.location);
    updateLinkField(websiteUi, websiteEl, user.blog);

    repoGrid.innerHTML = '';
    repos.forEach(repo => {
        const d = document.createElement('div');
        d.className = 'repo-item group cursor-pointer';
        d.onclick = () => window.open(repo.html_url, '_blank');
        d.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h4 class="text-xl font-bold uppercase truncate w-3/4 group-hover:text-zinc-400 transition-colors">${repo.name}</h4>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-700"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </div>
            <p class="text-zinc-500 text-sm line-clamp-1 mb-6">${repo.description || "N/A"}</p>
            <div class="flex items-center justify-between text-[10px] font-mono tracking-widest opacity-40">
                <span>${repo.language || 'DATA'}</span>
                <span>${repo.stargazers_count} ★</span>
            </div>
        `;
        repoGrid.appendChild(d);
    });
}

function animateStat(el, target) {
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: "expo.out", onUpdate: () => el.textContent = Math.round(o.v).toLocaleString() });
}

function updateField(container, element, value) {
    if (value) {
        container.classList.remove('hidden');
        element.textContent = value;
    }
    else { container.classList.add('hidden'); }
}

function updateLinkField(container, element, value) {
    if (value) {
        container.classList.remove('hidden');
        element.textContent = value.replace(/^https?:\/\//, '');
        element.href = value.startsWith('http') ? value : `https://${value}`;
    } else {
        container.classList.add('hidden');
    }
}

function showError(msg) {
    errorToast.textContent = msg;
    gsap.set(errorToast, { display: 'block' });
    gsap.to(errorToast, { yPercent: 200, duration: 0.8, ease: "elastic.out(1, 0.7)" });
    setTimeout(hideError, 4000);
}

function hideError() {
    gsap.to(errorToast, { yPercent: -200, duration: 0.5, ease: "power2.in", onComplete: () => errorToast.style.display = 'none' });
}
