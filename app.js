
document.addEventListener('DOMContentLoaded', () => {
    // YouTube Fetcher
    const fetchers = document.querySelectorAll('.youtube-fetcher');
    fetchers.forEach(async (el) => {
        const channelId = el.getAttribute('data-channel-id');
        const mode = el.getAttribute('data-mode');
        const sizeClass = el.getAttribute('data-size') || '';
        if(!channelId) return;

        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);
            const res = await fetch(proxyUrl);
            if(!res.ok) return;
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const entries = Array.from(xml.querySelectorAll('entry'));
            const author = xml.querySelector('author > name')?.textContent;

            const titleEl = el.querySelector('[data-role="channel-title"]');
            if(titleEl && author) titleEl.textContent = author;

            // Adaptive video count based on size
            const container = el.querySelector('[data-role="video-container"]');
            const maxVideos = container?.getAttribute('data-max-videos') || 4;
            const isSmall = sizeClass === 'size-small';
            const isTall = sizeClass === 'size-tall';
            
            const videos = entries.slice(0, parseInt(maxVideos)).map(e => ({
                id: e.getElementsByTagName('yt:videoId')[0]?.textContent,
                title: e.getElementsByTagName('title')[0]?.textContent,
                thumb: 'https://img.youtube.com/vi/' + e.getElementsByTagName('yt:videoId')[0]?.textContent + '/mqdefault.jpg'
            }));

            if(videos.length === 0) return;

            if(mode === 'grid' || mode === 'list') {
                if(container) {
                    container.innerHTML = videos.map(v => {
                        if(isTall) {
                            // Tall block - horizontal list items
                            return `<a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="yt-thumb-card">
                                <div class="thumb-wrapper">
                                    <img src="${v.thumb}" loading="lazy"/>
                                    <div class="yt-overlay">
                                        <div class="yt-play-btn">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div class="meta"><div class="title">${v.title}</div></div>
                            </a>`;
                        } else {
                            // Grid mode (default)
                            const playSize = isSmall ? 12 : 16;
                            return `<a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="yt-thumb-card">
                                <img src="${v.thumb}" loading="lazy"/>
                                <div class="yt-overlay">
                                    <div class="yt-play-btn">
                                        <svg width="${playSize}" height="${playSize}" viewBox="0 0 24 24" fill="white"><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                    </div>
                                </div>
                                <div class="yt-caption">${v.title}</div>
                            </a>`;
                        }
                    }).join('');
                }
            } else {
                const first = videos[0];
                const bg = el.querySelector('[data-role="bg-image"]');
                const title = el.querySelector('[data-role="video-title"]');
                const link = el.querySelector('[data-role="play-link"]');
                
                if(bg) bg.style.backgroundImage = 'url(https://img.youtube.com/vi/'+first.id+'/maxresdefault.jpg)';
                if(title) title.textContent = first.title;
                if(link) link.href = 'https://www.youtube.com/watch?v=' + first.id;
            }

        } catch(err) {
            console.error('Failed to fetch YouTube data', err);
        }
    });
});
