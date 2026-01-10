
const adForm = document.getElementById('adForm');
const adList = document.querySelector('.ad-list');

adForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(adForm);

    try {
        const res = await fetch('/upload-ad', {
            method: 'POST',
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            alert('Advert uploaded successfully!');

            const adItem = document.createElement('div');
            adItem.classList.add('ad-item');

            adItem.innerHTML = `
                <h3>${result.ad.title}</h3>
                <img src="${result.ad.image}" alt="${result.ad.title}" width="120">
                <p>
                    <a href="${result.ad.link}" target="_blank">
                        ${result.ad.link}
                    </a>
                </p>
            `;

            adList.appendChild(adItem);
            adForm.reset();
        }
    } catch (err) {
        console.error('Upload failed', err);
        alert('Failed to upload advert.');
    }
});
