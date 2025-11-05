// Menu móvel
// Funções de navegação e UI
function initializeNavigation() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Inicializa a navegação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

// Player de Música do Boi
document.addEventListener('DOMContentLoaded', function() {
    // Lista de músicas
    const playlist = [
        { title: 'PRA TE ENCANTAR', artist: 'ORGULHO DA CIDADE', file: 'MASTER 01.mp3' },
        { title: 'LÁGRIMAS DE SAUDADE', artist: 'ORGULHO DA CIDADE', file: 'MASTER 02.mp3' },
        { title: 'PROMESSA', artist: 'ORGULHO DA CIDADE', file: 'MASTER 03.mp3' },
        { title: 'GUERREIRO', artist: 'ORGULHO DA CIDADE', file: 'MASTER 04.mp3' },
        { title: 'MORENA', artist: 'ORGULHO DA CIDADE', file: 'MASTER 05.mp3' }
    ];
    
    // Estado do player
    let currentTrackIndex = 0;
    
    // Elementos do DOM
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.querySelector('.play-pause');
    const prevBtn = document.querySelector('.previous');
    const nextBtn = document.querySelector('.next');
    const progressBar = document.querySelector('.progress-current');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeBtn = document.querySelector('.volume');
    const currentTimeSpan = document.querySelector('.current-time');
    const totalTimeSpan = document.querySelector('.total-time');
    const songTitleSpan = document.querySelector('.current-song-title');
    const songArtistSpan = document.querySelector('.current-song-artist');

    // Adiciona event listeners se os elementos existirem
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', playPrevious);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (volumeSlider) volumeSlider.addEventListener('input', handleVolumeChange);
    if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);
    
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', () => {
            if (totalTimeSpan) totalTimeSpan.textContent = formatTime(audioPlayer.duration);
        });
        audioPlayer.addEventListener('ended', playNext);
    }

    // Adicionar clique na barra de progresso
    document.querySelector('.progress-bar')?.addEventListener('click', (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX / progressBar.offsetWidth;
        audioPlayer.currentTime = clickPosition * audioPlayer.duration;
    });

    // Funções do Player
    // Helper function removed (unused)
    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            currentTrackIndex = index;
            const track = playlist[currentTrackIndex];
            audioPlayer.src = track.file;
            songTitleSpan.textContent = track.title;
            songArtistSpan.textContent = track.artist;

            // Update cover art area. If a track.cover exists it will be used; otherwise
            // we generate a pleasant SVG placeholder so there are no broken images.
            try {
                const coverEl = document.querySelector('.player-cover');
                if (coverEl) {
                    coverEl.innerHTML = '';
                    // Sempre usa o logo como capa
                    const img = document.createElement('img');
                    img.src = 'logo.png';
                    img.alt = 'Logo - ' + track.title;
                    img.style.objectFit = 'contain';
                    img.style.padding = '8px';
                    img.style.background = '#fff';
                    coverEl.appendChild(img);
                }
            } catch (e) {
                console.warn('Erro ao atualizar capa:', e);
                // non-critical: if cover update fails, ignore and continue
                console.warn('Erro ao atualizar capa:', e);
            }

            if (audioPlayer.paused) {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    }

    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function playPrevious() {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) {
            newIndex = playlist.length - 1;
        }
        loadTrack(newIndex);
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    function playNext() {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= playlist.length) {
            newIndex = 0;
        }
        loadTrack(newIndex);
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    function updateProgress() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = progress + '%';
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    }

    function handleVolumeChange() {
        audioPlayer.volume = volumeSlider.value / 100;
        updateVolumeIcon();
    }

    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        updateVolumeIcon();
    }

    function updateVolumeIcon() {
        const volumeIcon = volumeBtn.querySelector('i');
        if (audioPlayer.muted || audioPlayer.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (audioPlayer.volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    loadTrack(0);
});

// Sistema de notificações
const notify = {
    show(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => messageDiv.remove(), 5000);
    },
    success(message) {
        this.show(message, 'success');
    },
    error(message) {
        this.show(message, 'error');
    }
};

// Formulário de inscrição
function handleInscricao(event) {
    event.preventDefault();
    // Collect form values and send JSON to backend
    try {
        const form = event.target;
        const payload = {
            nome: form.nome.value.trim(),
            idade: form.idade.value.trim(),
            tipo_participacao: form.tipo_participacao.value,
            telefone: form.telefone.value.trim(),
            bairro: form.bairro.value.trim(),
            email: form.email.value.trim(),
            observacoes: form.observacoes.value.trim()
        };

        fetch('/api/inscricao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data && data.ok) {
                notify.success('Inscrição enviada com sucesso!');
                form.reset();
            } else {
                notify.error('Erro ao enviar inscrição. Tente novamente.');
                console.error('Inscricao error', data);
            }
        })
        .catch(err => {
            showMessage('Erro ao enviar inscrição. Tente novamente.', true);
            console.error('Inscricao fetch error', err);
        });
    } catch (e) {
        showMessage('Erro ao processar formulário.', true);
        console.error(e);
    }

    return false;
}

// Função genérica para lidar com envio de formulários
async function handleFormSubmit(endpoint, form, successMessage) {
    try {
        const formData = new FormData(form);
        const payload = Object.fromEntries(
            Array.from(formData.entries()).map(([key, value]) => [key, value.trim()])
        );

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data && data.ok) {
            notify.success(successMessage);
            form.reset();
        } else {
            throw new Error(data.error || 'Erro ao processar requisição');
        }
    } catch (e) {
        notify.error('Erro ao processar formulário. Tente novamente.');
        console.error(`Erro no formulário ${endpoint}:`, e);
    }
    return false;
}

// Formulário de contato
function handleContato(event) {
    event.preventDefault();
    return handleFormSubmit('/api/contato', event.target, 'Mensagem enviada com sucesso!');
}

// Formulário de contratação
function handleContratacao(event) {
    event.preventDefault();
    return handleFormSubmit('/api/contratacao', event.target, 'Solicitação de orçamento enviada com sucesso!');
    return false;
}

// Validação de formulários
document.addEventListener('DOMContentLoaded', function() {
    // Mascara para telefone
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }
            if (value.length > 9) {
                value = `${value.slice(0, 9)}-${value.slice(9)}`;
            }
            
            e.target.value = value;
        });
    });

    // Validação de upload de arquivos
    const midiaInput = document.getElementById('midia');
    if (midiaInput) {
        midiaInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showMessage('O arquivo deve ter no máximo 10MB', true);
                    e.target.value = '';
                }
            }
        });
    }
});

// Player de músicas
function setupMusicPlayer() {
    const audioPlayers = document.querySelectorAll('audio');
    audioPlayers.forEach(player => {
        player.addEventListener('play', function() {
            // Parar outros players quando um começar a tocar
            audioPlayers.forEach(otherPlayer => {
                if (otherPlayer !== player && !otherPlayer.paused) {
                    otherPlayer.pause();
                }
            });
        });
    });
}

// Galeria de fotos
function setupGallery() {
    const photos = document.querySelectorAll('.photo-item img');
    photos.forEach(photo => {
        photo.addEventListener('click', function() {
            // Aqui você pode adicionar um lightbox ou modal para mostrar a foto em tamanho maior
            // Por exemplo, usando uma biblioteca como Lightbox2 ou Fancybox
        });
    });
}

/* ---------- Gerenciador de Apresentações (datas/horários + indicador Ao Vivo) ---------- */
(function(){
    const STORAGE_KEY = 'boi_apresentacoes_v1';
    let apresentacoes = [];

    let _publicFileLoaded = false; // true if events.json was successfully fetched at least once

    // Helper: parse date + time strings into a Date (local time)
    function parseDateTime(dateStr, timeStr){
        // dateStr: YYYY-MM-DD, timeStr: HH:MM
        if(!dateStr || !timeStr) return null;
        const s = `${dateStr}T${timeStr}:00`;
        // Create a Date using numeric components to avoid cross-browser parsing quirks
        const parts = dateStr.split('-');
        if(parts.length !== 3) return null;
        const y = parseInt(parts[0],10);
        const m = parseInt(parts[1],10) - 1;
        const d = parseInt(parts[2],10);
        const timeParts = timeStr.split(':');
        const hh = parseInt(timeParts[0],10) || 0;
        const mm = parseInt(timeParts[1],10) || 0;
        const dateObj = new Date(y, m, d, hh, mm, 0, 0);
        return isNaN(dateObj.getTime()) ? null : dateObj;
    }

    // Helper: normalize any stored start/end value to epoch milliseconds representing local time
    function toLocalTimestamp(value){
        if (value === undefined || value === null) return null;
        // if it's already a number, assume it's epoch ms
        if (typeof value === 'number') return value;
        // if it's numeric string (ms), parse and return
        if (/^\d+$/.test(String(value))) return parseInt(value,10);
        // if it's an ISO-like string 'YYYY-MM-DDTHH:MM' or with seconds
        const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (m){
            const y = parseInt(m[1],10);
            const mo = parseInt(m[2],10) - 1;
            const d = parseInt(m[3],10);
            const hh = parseInt(m[4],10);
            const mm = parseInt(m[5],10);
            return new Date(y, mo, d, hh, mm, 0, 0).getTime();
        }
        // Fallback: try Date.parse (may treat as UTC in some browsers)
        const parsed = Date.parse(String(value));
        if (!isNaN(parsed)) return parsed;
        return null;
    }

    function loadFromStorage(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            apresentacoes = raw ? JSON.parse(raw) : [];
            // normalize any stored start/end values to epoch ms (local time)
            apresentacoes = apresentacoes.map(ev => {
                try{
                    const copy = Object.assign({}, ev);
                    const s = toLocalTimestamp(copy.start);
                    const e = toLocalTimestamp(copy.end);
                    copy.start = s;
                    copy.end = e;
                    return copy;
                }catch(err){ return ev; }
            });
        }catch(e){
            console.error('Erro ao carregar apresentações:', e);
            apresentacoes = [];
        }
    }

    // Busca o arquivo público events.json e atualiza as apresentações
    // Isso garante que todos os visitantes vejam a mesma programação
    async function fetchPublicEventsIfEmpty(){
        // Não busca se já temos apresentações ou se é admin
        if (apresentacoes.length > 0 || isAdmin) {
            return;
        }

        try {
            const resp = await fetch('events.json', { 
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if(!resp.ok) {
                console.warn('Erro ao buscar events.json:', resp.status);
                return;
            }
            _publicFileLoaded = true;
            const data = await resp.json();
            if(Array.isArray(data) && data.length > 0){
                // Convert all timestamps to milliseconds if they're not already
                apresentacoes = data.map(ev => {
                    const copy = Object.assign({}, ev);
                    // Handle both string dates and numbers
                    if (typeof copy.start === 'string') {
                        copy.start = new Date(copy.start).getTime();
                    }
                    if (typeof copy.end === 'string') {
                        copy.end = new Date(copy.end).getTime();
                    }
                    return copy;
                });
                // Salva (substitui) no localStorage para consistência e performance.
                try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(apresentacoes)); }catch(e){}
            }
        }catch(e){
            // silencioso - fallback continuará sendo localStorage/seeds
            console.warn('Não foi possível carregar events.json (pode não existir):', e);
        }
    }

    async function saveToStorage(){
        try{
            // Salva no localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(apresentacoes));
            
            // Se for admin, também salva no servidor
            if (isAdmin) {
                try {
                    const response = await fetch('/api/events', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(apresentacoes)
                    });
                    
                    if (!response.ok) {
                        throw new Error('Falha ao salvar no servidor');
                    }
                    
                    console.log('Apresentações salvas com sucesso no servidor');
                } catch (err) {
                    console.error('Erro ao salvar apresentações no servidor:', err);
                    alert('Erro ao salvar apresentações. Por favor, tente novamente.');
                    return false;
                }
            }
            return true;
        } catch(e) { 
            console.error('Erro ao salvar apresentações:', e);
            return false;
        }
    }

    // Remove eventos que já terminaram antes do início do dia atual (meia-noite local)
    function purgePastEvents() {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const before = apresentacoes.length;
            apresentacoes = apresentacoes.filter(ev => {
                // Como end já está em milissegundos, comparamos diretamente
                return ev.end >= startOfToday;
            });
            if (apresentacoes.length !== before) {
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apresentacoes)); } catch (e) {}
            }

            // Log para debug
            console.log('Eventos após purga:', apresentacoes.map(ev => ({
                title: ev.title,
                start: new Date(ev.start).toLocaleString(),
                end: new Date(ev.end).toLocaleString()
            })));
        } catch (e) {
            console.error('Erro ao purgar apresentações antigas:', e);
        }
    }

    function formatDateReadable(d){
        return d.toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric' });
    }

    function formatTimeRange(start, end){
        const s = start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        const e = end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        return `${s} — ${e}`;
    }

    // Função para carregar vídeo no player
function loadVideo(url, title) {
    console.log('Carregando vídeo:', { url, title });
    const videoPlayer = document.getElementById('video-player');
    if (!videoPlayer) {
        console.error('Player de vídeo não encontrado');
        return;
    }

    try {
        // Processa a URL do YouTube e suporta /live/ também
        let embedUrl = url;
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1].split('&')[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('/live/')) {
                // Formato: https://www.youtube.com/live/<id>?...
                const videoId = url.split('/live/')[1].split(/[?&#/]/)[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('/embed/')) {
                embedUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
            }

        console.log('URL processada:', embedUrl);

        // Limpa o player
        videoPlayer.innerHTML = '';

        // Extrai ID para link direto (inclui /live/)
        let videoId = null;
        try {
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('/live/')) {
                videoId = url.split('/live/')[1].split(/[?&#/]/)[0];
            } else if (url.includes('/embed/')) {
                videoId = url.split('/embed/')[1].split(/[?&#/]/)[0];
            }
        } catch (e) { /* ignore */ }

        // Cria o container e o iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.title = title || 'Transmissão ao vivo';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        videoPlayer.appendChild(iframe);
        console.log('Iframe adicionado, aguardando carregamento...');

        // Link direto para o watch page (fallback)
        const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;

        // Remove qualquer fallback ou overlay existente
        const existingFallback = videoPlayer.querySelector('.video-fallback');
        if (existingFallback) existingFallback.remove();
        const existingOverlay = videoPlayer.querySelector('.video-blocked-overlay');
        if (existingOverlay) existingOverlay.remove();

        // Cria um overlay amigável que cobre o iframe por padrão para esconder mensagens de erro
        const overlay = document.createElement('div');
        overlay.className = 'video-blocked-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '0.6rem';
        overlay.style.background = 'linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.35))';
        overlay.style.color = '#fff';
        overlay.style.zIndex = '6';
        overlay.style.padding = '1rem';

        const ovTitle = document.createElement('div');
        ovTitle.textContent = 'ORGULHO TV';
        ovTitle.style.fontWeight = '700';
        ovTitle.style.letterSpacing = '0.6px';
        ovTitle.style.textAlign = 'center';
        ovTitle.style.fontSize = '1rem';

        const ovText = document.createElement('div');
        ovText.textContent = 'Se o vídeo não carregar aqui, abra diretamente no YouTube.';
        ovText.style.opacity = '0.95';
        ovText.style.textAlign = 'center';

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '0.6rem';

        const tryBtn = document.createElement('button');
        tryBtn.textContent = 'Reproduzir aqui';
        tryBtn.type = 'button';
        tryBtn.style.background = 'transparent';
        tryBtn.style.color = '#fff';
        tryBtn.style.border = '1px solid rgba(255,255,255,0.35)';
        tryBtn.style.padding = '0.5rem 0.8rem';
        tryBtn.style.borderRadius = '6px';
        tryBtn.style.cursor = 'pointer';

        const openBtn = document.createElement('a');
        openBtn.textContent = 'Abrir no YouTube';
        openBtn.href = watchUrl;
        openBtn.target = '_blank';
        openBtn.rel = 'noopener noreferrer';
        openBtn.style.background = 'var(--cor-destaque)';
        openBtn.style.color = '#fff';
        openBtn.style.padding = '0.5rem 0.9rem';
        openBtn.style.borderRadius = '6px';
        openBtn.style.textDecoration = 'none';

        btnRow.appendChild(tryBtn);
        btnRow.appendChild(openBtn);

        overlay.appendChild(ovTitle);
        overlay.appendChild(ovText);
        overlay.appendChild(btnRow);
        videoPlayer.appendChild(overlay);

        // Quando clicar em 'Reproduzir aqui', escondemos o overlay para permitir ver o iframe
        tryBtn.addEventListener('click', () => {
            try { overlay.style.display = 'none'; } catch (e) {}
        });

        // Mantemos um fallback extra (pequeno) que aparece se nada acontecer após timeout
        const fallback = document.createElement('div');
        fallback.className = 'video-fallback';
        fallback.style.position = 'absolute';
        fallback.style.bottom = '12px';
        fallback.style.left = '12px';
        fallback.style.right = '12px';
        fallback.style.background = 'rgba(0,0,0,0.6)';
        fallback.style.color = '#fff';
        fallback.style.padding = '0.75rem 1rem';
        fallback.style.borderRadius = '8px';
        fallback.style.display = 'none';
        fallback.style.zIndex = '7';

        const fbText = document.createElement('div');
        fbText.textContent = 'Se o vídeo não carregar, abra diretamente no YouTube:';
        fbText.style.marginBottom = '0.4rem';
        const fbLink = document.createElement('a');
        fbLink.href = watchUrl;
        fbLink.target = '_blank';
        fbLink.rel = 'noopener noreferrer';
        fbLink.textContent = 'Abrir no YouTube';
        fbLink.style.background = 'var(--cor-destaque)';
        fbLink.style.color = '#fff';
        fbLink.style.padding = '0.4rem 0.8rem';
        fbLink.style.borderRadius = '6px';
        fbLink.style.textDecoration = 'none';

        fallback.appendChild(fbText);
        fallback.appendChild(fbLink);
        videoPlayer.appendChild(fallback);

        // Se após 2s nada aconteceu (usuário não removeu overlay e iframe não iniciou), mostra fallback
        let loadTimeout = setTimeout(() => {
            try {
                // se overlay ainda estiver visível, mostramos o fallback pequeno
                if (overlay && overlay.style.display !== 'none') fallback.style.display = 'block';
            } catch (e) { /* ignore */ }
        }, 2000);

        iframe.addEventListener('load', () => {
            clearTimeout(loadTimeout);
            // Ao receber load, preferimos manter o overlay escondido somente se o usuário já o removeu;
            // caso contrário, mantemos o overlay para que ele escolha abrir no YouTube ou reproduzir.
            console.log('Iframe carregado (evento load).');
        });

        // Rola a página até a seção do vídeo
        const orgulhoTvSection = document.querySelector('.orgulho-tv');
        if (orgulhoTvSection) {
            orgulhoTvSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
        videoPlayer.innerHTML = `
            <div class="video-placeholder">
                <p style="color: #ff4444;">Erro ao carregar o vídeo</p>
                <small>Tente novamente em alguns instantes</small>
            </div>
        `;
    }
}
    async function render(){
        const container = document.getElementById('lista-apresentacoes');
        if(!container) return;
        container.innerHTML = '';

        // Remover duplicatas antes de renderizar
        const uniqueEvents = apresentacoes.reduce((acc, current) => {
            const exists = acc.find(item => 
                item.title === current.title && 
                item.start === current.start &&
                item.end === current.end
            );
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []);

        apresentacoes = uniqueEvents;

        // ordenar por data de início
        apresentacoes.sort((a,b)=> a.start - b.start);

        apresentacoes.forEach((ev, idx)=>{
            const start = new Date(ev.start);
            const end = new Date(ev.end);

            const card = document.createElement('article');
            card.className = 'card-apresentacao';

            // badge placeholder
            const badgeWrap = document.createElement('div');
            badgeWrap.className = 'badge-wrap';

            const title = document.createElement('div');
            title.className = 'data';
            title.textContent = ev.title || 'Apresentação';

            // Sempre adiciona o atributo liveUrl (mesmo vazio)
            card.dataset.liveUrl = ev.liveUrl || '';

            const local = document.createElement('div');
            local.className = 'local';
            local.textContent = ev.local || '';

            const horario = document.createElement('div');
            horario.className = 'horario';
            // show date range if event spans multiple days
            const sameDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
            horario.textContent = sameDay ? `${formatDateReadable(start)} • ${formatTimeRange(start,end)}` : `${formatDateReadable(start)} - ${formatDateReadable(end)} • ${formatTimeRange(start,end)}`;

            // add controls (remove)
            const controls = document.createElement('div');
            controls.className = 'controls';
            controls.style.marginTop = '0.6rem';
            controls.style.display = 'flex';
            controls.style.gap = '0.5rem';

            // Botão Editar
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-small btn-edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> <span>Editar</span>';
            editBtn.style.marginLeft = '0';
            editBtn.addEventListener('click', ()=>{
                if(!isAdmin){ alert('Somente o proprietário pode editar apresentações.'); return; }
                
                // Preenche o formulário com os dados atuais
                document.getElementById('titulo').value = ev.title || '';
                document.getElementById('local').value = ev.local || '';
                document.getElementById('liveUrl').value = ev.liveUrl || '';
                
                // Data e hora (begin/end days)
                const startDate = new Date(toLocalTimestamp(ev.start));
                const endDate = new Date(toLocalTimestamp(ev.end));

                document.getElementById('data_inicio').value = startDate.toISOString().split('T')[0];
                document.getElementById('inicio').value = startDate.toTimeString().slice(0,5);
                document.getElementById('data_fim').value = endDate.toISOString().split('T')[0];
                document.getElementById('fim').value = endDate.toTimeString().slice(0,5);
                
                // Muda o botão de submit para modo de edição
                const submitBtn = document.querySelector('#form-apresentacao button[type="submit"]');
                submitBtn.textContent = 'Atualizar';
                submitBtn.dataset.editIndex = idx;
                
                // Mostra o formulário
                document.getElementById('form-apresentacao').style.display = '';
                document.getElementById('form-apresentacao').scrollIntoView({ behavior: 'smooth' });
            });

            // Botão Remover
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-small btn-remove';
            removeBtn.innerHTML = '<i class="fas fa-trash"></i> <span>Remover</span>';
            removeBtn.addEventListener('click', ()=>{
                if(!isAdmin){ alert('Somente o proprietário pode remover apresentações.'); return; }
                if(confirm('Remover essa apresentação?')){
                    apresentacoes.splice(idx,1);
                    saveToStorage(); render();
                    // notify server about the deletion so visitors get the update
                    try { postEventsToServer(); } catch(e) { /* ignore if no server */ }
                }
            });

            controls.appendChild(editBtn);
            controls.appendChild(removeBtn);
            
            // Esconde botões de controle para visitantes
            controls.style.display = isAdmin ? 'flex' : 'none';

            // Criar container para conteúdo principal
            const content = document.createElement('div');
            content.className = 'content';
            content.appendChild(title);
            content.appendChild(local);
            content.appendChild(horario);
            
            // Marca o cartão como admin ou público (usado para estilos diferentes)
            card.classList.add(isAdmin ? 'admin' : 'public');

            // Adiciona os elementos ao card na ordem: conteúdo, controles e badges
            // Isso garante que, quando os controles estiverem visíveis (admin), eles fiquem
            // alinhados à direita graças à grid-template-columns e ao justify-content.
            card.appendChild(content);
            card.appendChild(controls);
            card.appendChild(badgeWrap);

            // store data attrs as epoch milliseconds (string) to avoid timezone parsing issues
            card.dataset.start = String(start.getTime());
            card.dataset.end = String(end.getTime());
            // store title and local for later use by click handlers
            card.dataset.title = ev.title || '';
            card.dataset.local = ev.local || '';

            container.appendChild(card);
        });

        // update live badges after render
        updateLiveBadges();
    }

    function updateLiveBadges(){
        // Purga apresentações antigas sempre que atualizamos badges (garante remoção ao mudar de dia)
        purgePastEvents();
        const now = new Date();
        const cards = document.querySelectorAll('.card-apresentacao');
        cards.forEach(card=>{
            // remove existing badges and buttons
            card.querySelectorAll('.badge-ao-vivo, .badge-concluido, .watch-live-btn').forEach(b => b.remove());

            const start = new Date(parseInt(card.dataset.start, 10));
            const end = new Date(parseInt(card.dataset.end, 10));
            
            if(start <= now && now <= end){
                // Apresentando agora
                const badgeWrap = document.createElement('div');
                badgeWrap.style.display = 'flex';
                badgeWrap.style.flexDirection = 'column';
                badgeWrap.style.alignItems = 'flex-end';
                badgeWrap.style.gap = '1rem';
                badgeWrap.style.position = 'absolute';
                badgeWrap.style.top = '0';
                badgeWrap.style.right = '1rem';
                badgeWrap.style.paddingTop = '3rem';

                const badge = document.createElement('div');
                badge.className = 'badge-ao-vivo';
                badge.textContent = 'Apresentando Agora!';
                badge.style.position = 'absolute';
                badge.style.top = '0';
                badge.style.right = '0';
                badgeWrap.appendChild(badge);

                // Sempre mostra o botão se liveUrl for uma string não vazia
                const liveUrl = card.dataset.liveUrl;
                if (typeof liveUrl === 'string' && liveUrl.trim().length > 0) {
                    const watchBtn = document.createElement('button');
                    watchBtn.type = 'button';
                    watchBtn.className = 'watch-live-btn';
                    watchBtn.innerHTML = '<i class="fas fa-video"></i> Assistir ao vivo';

                    watchBtn.addEventListener('mouseout', () => {
                        watchBtn.style.transform = 'scale(1)';
                        watchBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    });

                    watchBtn.addEventListener('click', () => {
                        const eventTitle = card.dataset.title || card.querySelector('.data')?.textContent || 'Transmissão ao vivo';
                        // Abrir no modal para transmissões ao vivo (melhor UX e fallback lá também)
                        try {
                            showLiveModal(liveUrl, eventTitle);
                        } catch (e) {
                            console.error('Erro ao abrir modal, tentando carregar inline:', e);
                            loadVideo(liveUrl, eventTitle);
                        }
                        updateLivesList();
                    });

                    badgeWrap.appendChild(watchBtn);
                }

                card.appendChild(badgeWrap);
            } else if(end < now) {
                // Já apresentou
                const badge = document.createElement('div');
                badge.className = 'badge-concluido';
                badge.textContent = 'Já apresentou!';
                badge.style.background = '#666';
                badge.style.color = 'white';
                badge.style.position = 'absolute';
                badge.style.top = '0';
                badge.style.right = '1rem';
                badge.style.padding = '0.4rem 1rem';
                badge.style.borderRadius = '0 0 8px 8px';
                badge.style.fontFamily = 'var(--fonte-titulos)';
                badge.style.fontWeight = '600';
                badge.style.fontSize = '0.9rem';
                card.appendChild(badge);
            }
        });
    }

    /* ---------- Admin (proprietário) - controla acesso ao formulário de adicionar eventos ---------- */
    const ADMIN_KEY = 'boi_admin_hash_v1';
    let isAdmin = false;

    async function sha256Hex(str){
        const enc = new TextEncoder();
        const data = enc.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const bytes = new Uint8Array(hash);
        return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
    }

    function showAdminForm(show){
        const form = document.getElementById('form-apresentacao');
        if(!form) return;
        form.style.display = show ? '' : 'none';
        const adminBtn = document.getElementById('adminButton');
        if(adminBtn) adminBtn.textContent = show ? 'Bloquear' : 'Área do Proprietário';
    }

    async function handleAdminButtonClick(){
        const adminBtn = document.getElementById('adminButton');
        const stored = localStorage.getItem(ADMIN_KEY);
        if(isAdmin){
            // lock
            isAdmin = false;
            showAdminForm(false);
            render();
            return;
        }

        if(!stored){
            // no password set - offer to create
            const create = confirm('Não existe senha de administrador. Deseja criar uma agora?');
            if(!create) return;
            let p1 = prompt('Digite a nova senha do administrador (mínimo 4 caracteres):');
            if(!p1 || p1.length < 4){ alert('Senha inválida.'); return; }
            let p2 = prompt('Confirme a nova senha:');
            if(p1 !== p2){ alert('Senhas não conferem.'); return; }
            const h = await sha256Hex(p1);
            localStorage.setItem(ADMIN_KEY, h);
            alert('Senha criada. Agora faça login.');
        }

        const pwd = prompt('Senha do proprietário:');
        if(!pwd) return;
        const h2 = await sha256Hex(pwd);
        const stored2 = localStorage.getItem(ADMIN_KEY);
        if(h2 === stored2){
            isAdmin = true;
            showAdminForm(true);
            alert('Acesso de proprietário liberado.');
            render();
        }else{
            alert('Senha incorreta.');
        }
    }
    window.handleAdminButtonClick = handleAdminButtonClick;
    /* ---------- fim Admin ---------- */

    async function addEventFromForm(e){
        e.preventDefault();
        if(!isAdmin){ alert('Somente o proprietário pode adicionar apresentações. Clique em "Área do Proprietário" e faça login.'); return; }
        const title = document.getElementById('titulo').value.trim();
        const dataInicio = document.getElementById('data_inicio').value; // YYYY-MM-DD
        const inicio = document.getElementById('inicio').value; // HH:MM
        const dataFim = document.getElementById('data_fim').value; // YYYY-MM-DD (optional)
        const fim = document.getElementById('fim').value; // HH:MM (optional)
        const local = document.getElementById('local').value.trim();
        const liveUrl = document.getElementById('liveUrl').value.trim();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const editIndex = submitBtn.dataset.editIndex;

        // Derive start and end Date objects. If end date/time omitted, default to start + 1 hour
        const start = parseDateTime(dataInicio, inicio);
        let end = null;
        if(dataFim && fim) {
            end = parseDateTime(dataFim, fim);
        } else if (dataFim && !fim) {
            // end of day of dataFim
            end = parseDateTime(dataFim, '23:59');
        } else if (!dataFim && fim) {
            // same day end with provided time
            end = parseDateTime(dataInicio, fim);
        } else {
            // no end info provided -> default to 1 hour after start
            end = new Date(start.getTime() + 60*60*1000);
        }

        if(!start || !end || end <= start){
            alert('Verifique a data/hora. O horário de término deve ser depois do início.');
            return;
        }

        // Store start/end as epoch ms to avoid timezone conversion when parsing back
        const ev = { 
            title: title || 'Apresentação', 
            local, 
            start: start.getTime(), 
            end: end.getTime(),
            liveUrl: liveUrl || ''
        };

        if(editIndex !== undefined) {
            // Modo edição
            apresentacoes[editIndex] = ev;
            submitBtn.textContent = 'Adicionar';
            submitBtn.dataset.editIndex = '';
        } else {
            // Modo adição
            apresentacoes.push(ev);
        }

        // Tenta salvar tanto no localStorage quanto no servidor
        const saved = await saveToStorage();
        if (saved) {
            render();
            alert('Apresentação salva com sucesso!');
        } else {
            alert('Erro ao salvar apresentação. Por favor, tente novamente.');
        }

        // limpar form
        e.target.reset();
        e.target.style.display = 'none';
        // Try to push the updated events to the server API (if available).
        // If there's no server running, this will fail silently.
        try { postEventsToServer(); } catch(e) { /* ignore */ }
    }

    // Attempt to POST the current `apresentacoes` array to the server API
    // so changes made by the admin are saved centrally (events.json).
    async function postEventsToServer(){
        // Only attempt when running over http(s) so local file:// doesn't error loudly.
        if (location.protocol === 'file:') return;
        try{
            const resp = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apresentacoes || [])
            });
            if (!resp.ok) console.warn('server responded', resp.status);
            else console.log('Posted events to server');
        }catch(err){
            // network/server not available — ignore (site still works client-side)
            console.warn('Could not post events to server (ok if you run static):', err);
        }
    }

    // Polling: fetch events.json periodically and update if changed.
    let _lastEventsText = null;
    async function fetchEventsJsonAndUpdate(){
        // Skip if admin to avoid conflicts with direct edits
        if (isAdmin) return;
        
        try {
            const resp = await fetch('events.json', { 
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if(!resp.ok) {
                console.warn('Erro ao buscar events.json:', resp.status);
                return;
            }
            const text = await resp.text();
            if(text === _lastEventsText) {
                return; // No changes
            }
            _lastEventsText = text;
            let data = [];
            try { 
                data = JSON.parse(text);
            } catch(e) { 
                console.warn('Erro ao processar events.json', e); 
                return; 
            }
            if(Array.isArray(data)) {
                // Only update if we actually have new data
                const currentData = JSON.stringify(apresentacoes);
                const newData = JSON.stringify(data);
                if (currentData !== newData) {
                    apresentacoes = data;
                    try { 
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(apresentacoes));
                        console.log('Apresentações salvas no localStorage');
                    } catch(e) {
                        console.error('Erro ao salvar no localStorage:', e);
                    }
                    render();
                }
            }
        } catch(e) { 
            console.error('Erro ao atualizar apresentações:', e);
        }
    }

    // Initialização principal
    async function init() {
        await loadFromStorage();
        await fetchPublicEventsIfEmpty();
        render();

        if (!isAdmin) {
            // Start polling only for non-admin users
            await fetchEventsJsonAndUpdate();
            setInterval(fetchEventsJsonAndUpdate, 60000);
        }
        
        // Update live badges for everyone
        setInterval(updateLiveBadges, 30000);
    }

    // Start when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Criação do modal
    // Criar o modal de transmissão ao vivo
    function createLiveModal() {
        console.log('Criando modal...');
        
        // Remover modal existente se houver
        const existingModal = document.getElementById('liveModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'liveModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
        modal.style.zIndex = '99999';
        modal.style.display = 'flex'; // Mudado para flex por padrão
        modal.style.alignItems = 'center';
        modal.style.padding = '20px';
        modal.style.boxSizing = 'border-box';
        modal.style.overflow = 'hidden'; // Prevenir scroll
        modal.style.margin = '0';      // Resetar margin
        modal.style.opacity = '1';
        
        // Garantir que o modal esteja visível
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';

    const modalContent = document.createElement('div');
    // Use CSS classes for responsive layout (defined in Frontend/style.css)
    modalContent.className = 'live-modal-content';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '-40px';
        closeBtn.style.top = '-40px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '36px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.padding = '10px';
        closeBtn.style.zIndex = '1';
        closeBtn.addEventListener('click', () => hideLiveModal());

        const title = document.createElement('h2');
    // Title used as modal header — styled via CSS
    title.className = 'live-modal-title';
    title.style.color = 'white';
    title.style.marginBottom = '1rem';
    title.style.textAlign = 'center';
    title.style.fontFamily = 'var(--fonte-titulos)';

    const videoContainer = document.createElement('div');
    // Class-driven layout/styling
    videoContainer.className = 'live-video';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
    // allow toggling pointer-events to avoid the iframe intercepting clicks when inputs are focused
    iframe.style.pointerEvents = 'auto';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        videoContainer.appendChild(iframe);
        // Create chat container
    const chatContainer = document.createElement('div');
    // keep existing class for compatibility and add live-chat for styling
    chatContainer.className = 'modal-chat-container live-chat';

    // Chat header (styled by CSS)
    const chatHeader = document.createElement('div');
    chatHeader.className = 'live-chat-header';
    chatHeader.innerHTML = '<div style="font-weight:600">Chat da Transmissão</div>';

        // Username section
        const usernameContainer = document.createElement('div');
        usernameContainer.id = 'modal-username-container';
        usernameContainer.style.display = 'flex';
        usernameContainer.style.gap = '8px';
        usernameContainer.style.alignItems = 'center';
        usernameContainer.style.marginBottom = '0.5rem';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Seu nome...';
        usernameInput.style.padding = '8px';
        usernameInput.style.borderRadius = '4px';
        usernameInput.style.border = '1px solid #ddd';
        usernameInput.style.width = '150px';

        const saveUsernameBtn = document.createElement('button');
        saveUsernameBtn.textContent = 'Salvar Nome';
        saveUsernameBtn.style.padding = '8px 12px';
        saveUsernameBtn.style.borderRadius = '4px';
        saveUsernameBtn.style.border = 'none';
        saveUsernameBtn.style.backgroundColor = '#007bff';
        saveUsernameBtn.style.color = '#fff';
        saveUsernameBtn.style.cursor = 'pointer';

        // Username display (shown after setting name)
        const usernameDisplay = document.createElement('div');
        usernameDisplay.id = 'modal-username-display';
        usernameDisplay.style.display = 'none';
        usernameDisplay.style.padding = '4px 8px';
        usernameDisplay.style.background = '#f8f9fa';
        usernameDisplay.style.borderRadius = '4px';
        usernameDisplay.style.marginBottom = '0.5rem';

        const currentUsername = document.createElement('span');
        currentUsername.id = 'modal-current-username';
        
        const changeUsernameBtn = document.createElement('button');
        changeUsernameBtn.textContent = 'Alterar Nome';
        changeUsernameBtn.style.marginLeft = '8px';
        changeUsernameBtn.style.padding = '4px 8px';
        changeUsernameBtn.style.borderRadius = '4px';
        changeUsernameBtn.style.border = '1px solid #ddd';
        changeUsernameBtn.style.background = '#fff';
        changeUsernameBtn.style.cursor = 'pointer';

        usernameDisplay.appendChild(document.createTextNode('Conversando como: '));
        usernameDisplay.appendChild(currentUsername);
        usernameDisplay.appendChild(changeUsernameBtn);

    // Chat messages area (class added for CSS scroll handling)
    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages live-chat-messages';

    // Chat input area (fixed at bottom of chat via CSS)
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'live-chat-input';
    chatInputContainer.style.display = 'flex';
    chatInputContainer.style.gap = '0.5rem';

        const chatInput = document.createElement('input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Digite sua mensagem...';
        chatInput.disabled = true; // Desabilitado até definir nome
        chatInput.style.flex = '1';
        chatInput.style.padding = '0.5rem';
        chatInput.style.borderRadius = '4px';
        chatInput.style.border = '1px solid #ced4da';

        const sendButton = document.createElement('button');
        sendButton.textContent = 'Enviar';
        sendButton.disabled = true; // Desabilitado até definir nome
        sendButton.style.padding = '0.5rem 1rem';
        sendButton.style.backgroundColor = '#007bff';
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '4px';
        sendButton.style.cursor = 'pointer';

        // Event listeners para envio de mensagens
        function sendChatMessage() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            const username = currentUsername.textContent;
            if (!username) {
                alert('Por favor, defina seu nome primeiro');
                updateUsernameUI('');
                return;
            }

            // Verifica estado da conexão
            if (!ws) {
                console.log('WebSocket não inicializado, tentando reconectar...');
                setupWebSocket();
                setTimeout(() => {
                    alert('Reconectando ao chat... Tente enviar sua mensagem novamente em alguns segundos.');
                }, 500);
                return;
            }

            if (ws.readyState !== WebSocket.OPEN) {
                console.log('WebSocket não está pronto. Estado:', ws.readyState);
                alert('Conexão não estabelecida. Aguarde um momento e tente novamente.');
                return;
            }

            try {
                console.log('Enviando mensagem:', { username, message });
                ws.send(JSON.stringify({
                    type: 'chat',
                    user: username,
                    text: message
                }));
                chatInput.value = '';
                chatInput.focus();
            } catch(e) {
                console.error('Erro ao enviar mensagem:', e);
                alert('Erro ao enviar mensagem. Por favor, tente novamente.');
            }
        }

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });

        sendButton.addEventListener('click', sendChatMessage);

        // Prevent the iframe from intercepting pointer events while the user is interacting with
        // the chat inputs. We use focusin/focusout on the modal (bubbles) so any focus inside
        // the modal will disable iframe pointer events; when focus leaves, we restore them.
        try {
            modal.addEventListener('focusin', () => {
                try { iframe.style.pointerEvents = 'none'; } catch (e) {}
            });
            modal.addEventListener('focusout', () => {
                // small timeout to allow focus to move between inputs without flicker
                setTimeout(() => { try { iframe.style.pointerEvents = 'auto'; } catch (e) {} }, 0);
            });

            // Extra explicit listeners on the chat input as a fallback for older browsers
            chatInput.addEventListener('focus', () => { try { iframe.style.pointerEvents = 'none'; } catch (e) {} });
            chatInput.addEventListener('blur', () => { try { iframe.style.pointerEvents = 'auto'; } catch (e) {} });
            usernameInput.addEventListener('focus', () => { try { iframe.style.pointerEvents = 'none'; } catch (e) {} });
            usernameInput.addEventListener('blur', () => { try { iframe.style.pointerEvents = 'auto'; } catch (e) {} });
        } catch (e) {
            // non-fatal if listeners cannot be attached
        }

        // Adiciona elementos na ordem correta
        usernameContainer.appendChild(usernameInput);
        usernameContainer.appendChild(saveUsernameBtn);

        chatInputContainer.appendChild(chatInput);
        chatInputContainer.appendChild(sendButton);

        chatContainer.appendChild(chatHeader);
        chatContainer.appendChild(usernameContainer);
        chatContainer.appendChild(usernameDisplay);
        chatContainer.appendChild(chatMessages);
        chatContainer.appendChild(chatInputContainer);

        // Função para atualizar interface do usuário
        function updateUsernameUI(username) {
            if (username) {
                usernameContainer.style.display = 'none';
                usernameDisplay.style.display = 'block';
                currentUsername.textContent = username;
                chatInput.disabled = false;
                sendButton.disabled = false;
                chatInput.focus();
                try {
                    localStorage.setItem('chat_username', username);
                } catch(e) { /* ignore */ }
            } else {
                usernameContainer.style.display = 'flex';
                usernameDisplay.style.display = 'none';
                chatInput.disabled = true;
                sendButton.disabled = true;
                usernameInput.focus();
            }
        }

        // Tenta carregar nome salvo
        try {
            const savedName = localStorage.getItem('chat_username');
            if (savedName) {
                usernameInput.value = savedName;
                updateUsernameUI(savedName);
            }
        } catch(e) { /* ignore */ }

        // Event listeners para nome
        saveUsernameBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                updateUsernameUI(username);
            } else {
                alert('Por favor, digite seu nome');
                usernameInput.focus();
            }
        });

        changeUsernameBtn.addEventListener('click', () => {
            updateUsernameUI('');
        });

        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveUsernameBtn.click();
            }
        });

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    // append video then chat so grid (70/30) places video on the left
    modalContent.appendChild(videoContainer);
    modalContent.appendChild(chatContainer);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        // WebSocket setup for chat
        let ws;
        function setupWebSocket() {
            try {
                const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${location.host}`;
                console.log('Conectando WebSocket:', wsUrl);
                
                ws = new WebSocket(wsUrl);
                
                ws.addEventListener('open', () => {
                    console.log('WebSocket conectado');
                    if (currentUsername.textContent) {
                        chatInput.disabled = false;
                        sendButton.disabled = false;
                    }
                });

                ws.addEventListener('message', (ev) => {
                    try {
                        const data = JSON.parse(ev.data);
                        if (data.type === 'chat') {
                            addChatMessage(data.user, data.text);
                        }
                    } catch(e) {
                        console.error('Erro ao processar mensagem:', e);
                    }
                });

                ws.addEventListener('close', () => {
                    console.log('WebSocket desconectado');
                    chatInput.disabled = true;
                    sendButton.disabled = true;
                    // Tenta reconectar após 3 segundos
                    setTimeout(setupWebSocket, 3000);
                });

                ws.addEventListener('error', (e) => {
                    console.error('Erro WebSocket:', e);
                    chatInput.disabled = true;
                    sendButton.disabled = true;
                });

            } catch(e) {
                console.error('Erro ao configurar WebSocket:', e);
            }
        }

        // Inicia a conexão WebSocket
        setupWebSocket();

        // Simple HTML escape to avoid XSS when inserting user-supplied text
        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Function to add a chat message (now uses CSS classes and adds a timestamp)
        function addChatMessage(user, text) {
            const messageDiv = document.createElement('div');
            const isOwn = user === currentUsername.textContent;
            // use semantic classes so styles live in CSS
            messageDiv.className = 'live-msg ' + (isOwn ? 'live-msg-user' : 'live-msg-other');

            // build safe inner content
            const nameHtml = `<strong class="live-msg-username">${escapeHtml(user)}:</strong>`;
            const textHtml = `<span class="live-msg-text">${escapeHtml(text)}</span>`;
            messageDiv.innerHTML = `${nameHtml} ${textHtml}`;

            // timestamp (client-side)
            try {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const ts = document.createElement('span');
                ts.className = 'msg-timestamp';
                ts.textContent = timeStr;
                messageDiv.appendChild(ts);
            } catch (e) {
                // ignore timestamp errors
            }

            // append and scroll
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        return { modal, iframe, title, chatMessages };
    }

    // Variáveis para o modal
    let modalElements;

    // Função para mostrar o modal com a transmissão
    function showLiveModal(url, eventTitle) {
        console.log('Iniciando abertura do modal...');
        console.log('URL recebida:', url);
        console.log('Título do evento:', eventTitle);
        
        if (!url) {
            console.error('URL não fornecida!');
            alert('URL da transmissão não encontrada!');
            return;
        }

        try {
            document.body.style.overflow = 'hidden'; // Previne scroll da página
            
            // Força recriar o modal cada vez
            modalElements = createLiveModal();
            
            // Processa a URL do YouTube se necessário (inclui /live/ e /embed/)
            let embedUrl = url;
            let videoId = null;
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('/live/')) {
                videoId = url.split('/live/')[1].split(/[?&#/]/)[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
            } else if (url.includes('/embed/')) {
                embedUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
                try { videoId = embedUrl.split('/embed/')[1].split(/[?&#/]/)[0]; } catch(e){}
            }

            const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;

            console.log('URL processada:', embedUrl);
            if (eventTitle) {
                modalElements.title.textContent = eventTitle;
            }

            // Limpa src e exibe modal antes de atribuir src (ajuda em alguns navegadores)
            modalElements.iframe.src = '';
            modalElements.modal.style.display = 'flex';
            setTimeout(() => { modalElements.iframe.src = embedUrl; }, 20);

            // Adicionar event listeners
            document.addEventListener('keydown', handleEsc);
            modalElements.modal.addEventListener('click', handleClickOutside);

            // Fallback dentro do modal: se o iframe não carregar em 2.5s, mostramos mensagem com link para o YouTube
            const existingModalFallback = modalElements.modal.querySelector('.modal-video-fallback');
            if (existingModalFallback) existingModalFallback.remove();

            const modalFallback = document.createElement('div');
            modalFallback.className = 'modal-video-fallback';
            modalFallback.style.position = 'absolute';
            modalFallback.style.top = '50%';
            modalFallback.style.left = '50%';
            modalFallback.style.transform = 'translate(-50%, -50%)';
            modalFallback.style.zIndex = '100000';
            modalFallback.style.background = 'rgba(0,0,0,0.7)';
            modalFallback.style.color = '#fff';
            modalFallback.style.padding = '1rem 1.2rem';
            modalFallback.style.borderRadius = '8px';
            modalFallback.style.display = 'none';
            modalFallback.style.textAlign = 'center';

            const mfText = document.createElement('div');
            mfText.textContent = 'Se o player não carregar aqui, abra diretamente no YouTube.';
            mfText.style.marginBottom = '0.6rem';
            const mfLink = document.createElement('a');
            mfLink.href = watchUrl;
            mfLink.target = '_blank';
            mfLink.rel = 'noopener noreferrer';
            mfLink.textContent = 'Abrir no YouTube';
            mfLink.style.background = 'var(--cor-destaque)';
            mfLink.style.color = '#fff';
            mfLink.style.padding = '0.45rem 0.8rem';
            mfLink.style.borderRadius = '6px';
            mfLink.style.textDecoration = 'none';

            modalFallback.appendChild(mfText);
            modalFallback.appendChild(mfLink);
            modalElements.modal.appendChild(modalFallback);

            let modalLoadTimeout = setTimeout(() => {
                try { modalFallback.style.display = 'block'; } catch (e) {}
            }, 2500);

            modalElements.iframe.addEventListener('load', () => {
                clearTimeout(modalLoadTimeout);
                try { modalFallback.style.display = 'none'; } catch (e) {}
                console.log('Iframe do modal carregado.');
            });

            console.log('Modal aberto com sucesso');
        } catch (error) {
            console.error('Erro ao abrir modal:', error);
        }
        document.addEventListener('keydown', handleEsc);

        // Fechar modal ao clicar fora
        const handleClickOutside = (e) => {
            if (e.target === modalElements.modal) hideLiveModal();
        };
        modalElements.modal.addEventListener('click', handleClickOutside);
        
        console.log('Modal aberto e exibindo');
    }

    // Função para esconder o modal
    function hideLiveModal() {
        console.log('Fechando modal...');
        try {
            if (modalElements && modalElements.modal) {
                // Clear chat messages
                if (modalElements.chatMessages) {
                    modalElements.chatMessages.innerHTML = '';
                }
                
                // Parar o vídeo limpando o src do iframe
                if (modalElements.iframe) {
                    modalElements.iframe.src = '';
                }
                
                // Remover o modal completamente
                modalElements.modal.remove();
                modalElements = null;
                
                // Restaurar scroll da página
                document.body.style.overflow = '';
                
                // Remover event listeners
                document.removeEventListener('keydown', handleEsc);
                
                console.log('Modal fechado com sucesso');
            }
        } catch (error) {
            console.error('Erro ao fechar modal:', error);
        }
    }

    // Event handlers para fechar o modal
    const handleEsc = (e) => {
        if (e.key === 'Escape') hideLiveModal();
    };

    const handleClickOutside = (e) => {
        if (e.target.id === 'liveModal') hideLiveModal();
    };

    // Função para atualizar a lista de próximas lives
    function updateLivesList() {
        console.log('Atualizando lista de transmissões...');
        const listaLives = document.getElementById('lista-lives');
        if (!listaLives) {
            console.error('Elemento lista-lives não encontrado');
            return;
        }

        // Limpa a lista atual
        listaLives.innerHTML = '';

        // Filtra eventos com URL de transmissão
        const now = new Date();
        console.log('Data atual:', now);
        
        const proximasLives = apresentacoes
            .filter(ev => {
                if (!ev.liveUrl) {
                    console.log(`Evento ${ev.title} não tem URL de transmissão`);
                    return false;
                }
                const start = new Date(toLocalTimestamp(ev.start));
                const end = new Date(toLocalTimestamp(ev.end));
                console.log(`Evento ${ev.title}: início=${start}, fim=${end}`);

                // Se o evento já terminou, não mostra
                if (end <= now) {
                    console.log(`Evento ${ev.title} já terminou`);
                    return false;
                }
                
                // Se ainda não terminou, vai aparecer na lista, mas o vídeo só poderá 
                // ser acessado durante o horário da apresentação
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(toLocalTimestamp(a.start));
                const dateB = new Date(toLocalTimestamp(b.start));
                return dateA - dateB;
            });

        console.log('Eventos filtrados:', proximasLives);

        // Adiciona cada evento à lista
        proximasLives.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'live-item';
            
            const date = new Date(toLocalTimestamp(ev.start));
            const formattedDate = date.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long'
            });
            const formattedTime = date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit'
            });

            item.innerHTML = `
                <h4>${ev.title}</h4>
                <div class="live-info">
                    ${formattedDate} às ${formattedTime}
                    ${ev.local ? `<br>${ev.local}` : ''}
                </div>
            `;

            item.addEventListener('click', () => {
                const start = new Date(toLocalTimestamp(ev.start));
                const end = new Date(toLocalTimestamp(ev.end));
                const now = new Date();

                // Verifica se está dentro do horário da apresentação
                if (now < start) {
                    // Ainda não começou
                    const timeUntilStart = start.getTime() - now.getTime();
                    const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));
                    const hoursUntilStart = Math.floor(minutesUntilStart / 60);
                    
                    let message = 'Esta apresentação ainda não começou.\n\n';
                    message += `Início previsto: ${start.toLocaleDateString()} às ${start.toLocaleTimeString()}\n`;
                    
                    if (hoursUntilStart > 0) {
                        message += `\nFaltam aproximadamente ${hoursUntilStart} hora(s) para começar.`;
                    } else if (minutesUntilStart > 0) {
                        message += `\nFaltam aproximadamente ${minutesUntilStart} minuto(s) para começar.`;
                    } else {
                        message += '\nA transmissão começará em breve!';
                    }
                    
                    alert(message);
                    return;
                }

                if (now > end) {
                    // Já terminou
                    alert('Esta apresentação já foi encerrada.');
                    return;
                }
            });

            listaLives.appendChild(item);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadFromStorage();
        fetchPublicEventsIfEmpty().then(() => {
            try { 
                purgePastEvents(); 
            } catch(e) { }
            
            render();

            const form = document.getElementById('form-apresentacao');
            if(form) form.addEventListener('submit', addEventFromForm);

            const adminBtn = document.getElementById('adminButton');
            if(adminBtn) adminBtn.addEventListener('click', handleAdminButtonClick);
        });
    });
})();

// Função para lidar com o clique no botão de admin
function handleAdminButtonClick() {
    // Redireciona para a página de login do admin
    window.location.href = 'admin-login.html';
}

// Exibe ou remove o botão de admin com Ctrl+Shift+A
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        const nav = document.querySelector('.nav-container');
        const existingBtn = document.getElementById('adminButton');
        
        if (existingBtn) {
            existingBtn.remove();
            const form = document.getElementById('form-apresentacao');
            if (form) form.style.display = 'none';
        } else if (nav) {
            const newBtn = document.createElement('button');
            newBtn.id = 'adminButton';
            newBtn.textContent = 'Área do Proprietário';
            newBtn.style.marginLeft = '8px';
            newBtn.style.padding = '0.4rem 0.6rem';
            newBtn.style.borderRadius = '8px';
            newBtn.style.background = 'transparent';
            newBtn.style.border = '1px solid rgba(255,255,255,0.12)';
            newBtn.style.color = '#fff';
            newBtn.style.cursor = 'pointer';
            newBtn.addEventListener('click', handleAdminButtonClick);
            nav.insertBefore(newBtn, nav.querySelector('.mobile-menu'));
        }
    }
});
