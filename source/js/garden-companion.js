(() => {
  const cosAssetOrigin = 'https://lys-blog-1312655971.cos.ap-guangzhou.myqcloud.com';

  document.addEventListener('DOMContentLoaded', async () => {
    const clickWords = ['种下一点好奇', '今天也会发光', '灵感 +1', '慢慢生长', '记录此刻', '继续探索'];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('click', (event) => {
      if (reducedMotion || event.target.closest('a, button, input, textarea, select, summary, #lys-music-player')) return;
      const word = document.createElement('span');
      word.className = 'lys-click-word';
      word.textContent = clickWords[Math.floor(Math.random() * clickWords.length)];
      word.style.left = `${event.clientX}px`;
      word.style.top = `${event.clientY}px`;
      document.body.append(word);
      window.setTimeout(() => word.remove(), 1200);
    });

    const player = document.createElement('section');
    player.id = 'lys-music-player';
    player.innerHTML = `
      <div class="lys-music-dock">
        <button class="lys-music-toggle" type="button" aria-expanded="false" aria-controls="lys-music-panel" aria-label="打开音乐播放器"><span class="lys-vinyl"><span></span></span></button>
        <button class="lys-music-summary" type="button" aria-label="打开音乐播放器"><span class="lys-music-kicker">LYS FM</span><strong>我的播放列表</strong></button>
      </div>
      <div class="lys-music-panel" id="lys-music-panel">
        <div class="lys-panel-head"><span class="lys-music-kicker">LYS FM · PRIVATE RADIO</span><button class="lys-panel-close" type="button" aria-label="收起播放器">×</button></div>
        <strong class="lys-track-title">音乐库准备中</strong>
        <span class="lys-track-artist">把自己的音乐放进数字花园</span>
        <input class="lys-track-progress" type="range" min="0" max="100" value="0" aria-label="播放进度">
        <div class="lys-music-controls"><button type="button" data-action="previous" aria-label="上一首">&#9664;&#9664;</button><button type="button" data-action="play" aria-label="播放">&#9654;</button><button type="button" data-action="next" aria-label="下一首">&#9654;&#9654;</button></div>
      </div>`;
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

    const togglePlayer = () => {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', togglePlayer);
    player.querySelector('.lys-music-summary').addEventListener('click', togglePlayer);
    player.querySelector('.lys-panel-close').addEventListener('click', togglePlayer);

    const renderTrack = () => {
      const track = tracks[index];
      if (!track) return;
      title.textContent = track.title;
      artist.textContent = track.artist || 'Lys 的音乐收藏';
      audio.src = /^https?:\/\//i.test(track.src) ? track.src : `${cosAssetOrigin}/${track.src.replace(/^\/+/, '')}`;
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
        artist.textContent = '将 MP3 放进 source/music 后编辑 playlist.json';
        return;
      }
      if (audio.paused) await audio.play(); else audio.pause();
    });
    player.querySelector('[data-action="previous"]').addEventListener('click', () => changeTrack(-1));
    player.querySelector('[data-action="next"]').addEventListener('click', () => changeTrack(1));
    audio.addEventListener('play', () => { play.innerHTML = '&#10074;&#10074;'; play.setAttribute('aria-label', '暂停'); player.classList.add('is-playing'); });
    audio.addEventListener('pause', () => { play.innerHTML = '&#9654;'; play.setAttribute('aria-label', '播放'); player.classList.remove('is-playing'); });
    audio.addEventListener('timeupdate', () => { if (audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100); });
    audio.addEventListener('ended', () => changeTrack(1));
    progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = audio.duration * (Number(progress.value) / 100); });
    try {
      const response = await fetch('/music/playlist.json');
      const data = await response.json();
      tracks = Array.isArray(data.tracks) ? data.tracks.filter((track) => track.title && track.src) : [];
      if (tracks.length) renderTrack();
    } catch (_) { /* The empty player remains intentional. */ }
  });
})();
