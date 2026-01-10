
/* ================= LOAD ADS ================= */
async function loadAds() {
    const container = document.querySelector('.ads-container');
    if (!container) return;

    container.innerHTML = '';

    try {
        const res = await fetch('/api/ads');
        const ads = await res.json();

        ads.forEach(ad => {
            container.innerHTML += `
                <div class="ad-item">
                    <h3>${ad.title}</h3>
                    <img src="${ad.image}" alt="${ad.title}">
                    <p>
                        <a href="${ad.link}" target="_blank" rel="noopener">
                            ${ad.link}
                        </a>
                    </p>
                </div>
            `;
        });
    } catch (err) {
        console.error('Failed to load ads:', err);
    }
}

/* ================= COOKIE NOTICE ================= */
function initCookieNotice() {
    const cookieNotice = document.getElementById('cookie-notice');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!cookieNotice || !acceptBtn) return;

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieNotice.style.display = 'block';
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieNotice.style.display = 'none';
    });
}

/* ================= ON PAGE LOAD ================= */
window.addEventListener('DOMContentLoaded', () => {
    loadAds();
    initCookieNotice();
});
