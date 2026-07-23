(() => {
  const cosAssetOrigin = 'https://lys-blog-1312655971.cos.ap-guangzhou.myqcloud.com';
  const messages = [
    '今天也要为好奇心留一点时间。',
    '慢一点没关系，花园在生长。',
    '记录下来的想法，会在未来发光。',
    '去完成一件小事吧。',
    '欢迎回来，Lys。'
  ];

  const icon = `
    <svg viewBox="0 0 88 88" aria-hidden="true">
      <defs><linearGradient id="lys-pet-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7787ff"/><stop offset="1" stop-color="#a77eea"/></linearGradient></defs>
      <path d="M44 8c10 0 21 7 25 17 8 2 13 8 13 17 0 7-4 13-10 16 1 14-12 25-28 25S15 72 16 58C10 55 6 48 6 41c0-9 5-15 13-17C23 14 34 8 44 8Z" fill="url(#lys-pet-gradient)"/>
      <path d="M26 34c4-7 10-10 18-10s14 3 18 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
      <circle cx="31" cy="45" r="4" fill="#fff"/><circle cx="57" cy="45" r="4" fill="#fff"/>
      <path d="M36 57c5 4 11 4 16 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="22" cy="56" r="8" fill="#a8eee1" opacity=".8"/>
    </svg>`;

  document.addEventListener('DOMContentLoaded', async () => {
    const clickWords = ['种下一点好奇', '今天也会发光', '灵感 +1', '慢慢生长', '记录此刻', '继续探索'];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('click', (event) => {
      if (reducedMotion) return;
      const interactive = event.target.closest('a, button, input, textarea, select, summary, #lys-companion, #lys-music-player');
      if (interactive) return;

      const word = document.createElement('span');
      word.className = 'lys-click-word';
      word.textContent = clickWords[Math.floor(Math.random() * clickWords.length)];
      word.style.left = `${event.clientX}px`;
      word.style.top = `${event.clientY}px`;
      document.body.append(word);
      window.setTimeout(() => word.remove(), 1200);
    });

    const shell = document.createElement('section');
    shell.id = 'lys-companion';
    shell.innerHTML = `
      <div class="lys-pet-dialog" aria-live="polite">
        <strong>花园小搭档</strong>
        <p>${messages[0]}</p>
        <button type="button" class="lys-pet-hide" aria-label="收起桌宠">收起</button>
      </div>
      <button type="button" class="lys-pet" aria-label="打开花园小搭档" title="点击和花园小搭档聊聊">${icon}</button>
    `;
    document.body.append(shell);

    const pet = shell.querySelector('.lys-pet');
    const dialog = shell.querySelector('.lys-pet-dialog');
    const dialogText = dialog.querySelector('p');
    const hide = dialog.querySelector('.lys-pet-hide');
    let dragging = false;
    let moved = false;
    let offsetX = 0;
    let offsetY = 0;

    const sayHello = () => {
      dialogText.textContent = messages[Math.floor(Math.random() * messages.length)];
      dialog.classList.add('is-visible');
      pet.classList.add('is-waving');
      window.setTimeout(() => pet.classList.remove('is-waving'), 520);
    };

    pet.addEventListener('click', () => {
      if (!moved) sayHello();
      moved = false;
    });

    hide.addEventListener('click', () => dialog.classList.remove('is-visible'));

    pet.addEventListener('pointerdown', (event) => {
      dragging = true;
      moved = false;
      pet.setPointerCapture(event.pointerId);
      const rect = shell.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
    });

    pet.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      moved = true;
      const maxX = window.innerWidth - shell.offsetWidth - 12;
      const maxY = window.innerHeight - shell.offsetHeight - 12;
      shell.style.left = `${Math.max(12, Math.min(maxX, event.clientX - offsetX))}px`;
      shell.style.top = `${Math.max(12, Math.min(maxY, event.clientY - offsetY))}px`;
      shell.style.right = 'auto';
      shell.style.bottom = 'auto';
    });

    pet.addEventListener('pointerup', (event) => {
      dragging = false;
      pet.releasePointerCapture(event.pointerId);
    });

    const player = document.createElement('section');
    player.id = 'lys-music-player';
    player.innerHTML = `
      <button class="lys-music-toggle" type="button" aria-expanded="false" aria-controls="lys-music-panel">♫</button>
      <div class="lys-music-panel" id="lys-music-panel">
        <div class="lys-music-kicker">Lys's soundtrack</div>
        <strong class="lys-track-title">音乐库准备中</strong>
        <span class="lys-track-artist">把自己的音乐加入花园</span>
        <input class="lys-track-progress" type="range" min="0" max="100" value="0" aria-label="播放进度">
        <div class="lys-music-controls">
          <button type="button" data-action="previous" aria-label="上一首">‹</button>
          <button type="button" data-action="play" aria-label="播放">▶</button>
          <button type="button" data-action="next" aria-label="下一首">›</button>
        </div>
      </div>
    `;
    document.body.append(player);

    const toggle = player.querySelector('.lys-music-toggle');
    const panel = player.querySelector('.lys-music-panel');
    const title = player.querySelector('.lys-track-title');
    const artist = player.querySelector('.lys-track-artist');
    const progress = player.querySelector('.lys-track-progress');
    const play = player.querySelector('[data-action="play"]');
    const audio = new Audio();
    let tracks = [];
    let index = 0;

    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    const renderTrack = () => {
      const track = tracks[index];
      if (!track) return;
      title.textContent = track.title;
      artist.textContent = track.artist || 'Lys 的音乐收藏';
      audio.src = /^https?:\/\//i.test(track.src)
        ? track.src
        : `${cosAssetOrigin}/${track.src.replace(/^\/+/, '')}`;
      progress.value = '0';
    };

    const changeTrack = (delta) => {
      if (!tracks.length) return;
      index = (index + delta + tracks.length) % tracks.length;
      renderTrack();
      audio.play();
    };

    play.addEventListener('click', async () => {
      if (!tracks.length) {
        title.textContent = '还没有音乐';
        artist.textContent = '把 MP3 放进 source/music 后编辑 playlist.json';
        return;
      }
      if (audio.paused) await audio.play(); else audio.pause();
    });
    player.querySelector('[data-action="previous"]').addEventListener('click', () => changeTrack(-1));
    player.querySelector('[data-action="next"]').addEventListener('click', () => changeTrack(1));
    audio.addEventListener('play', () => { play.textContent = '❚❚'; play.setAttribute('aria-label', '暂停'); });
    audio.addEventListener('pause', () => { play.textContent = '▶'; play.setAttribute('aria-label', '播放'); });
    audio.addEventListener('timeupdate', () => { if (audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100); });
    audio.addEventListener('ended', () => changeTrack(1));
    progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * (Number(progress.value) / 100); });

    try {
      const response = await fetch('/music/playlist.json');
      const data = await response.json();
      tracks = Array.isArray(data.tracks) ? data.tracks.filter(track => track.title && track.src) : [];
      if (tracks.length) renderTrack();
    } catch (_) {
      // 没有播放列表时保留友好的空状态。
    }
  });
})();
