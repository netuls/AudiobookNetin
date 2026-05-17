const DEFAULT_KEY = 'AIzaSyDQxoKbTiMMfwNQE3btfi1XKCNA0gSaCyE';

let savedKey = DEFAULT_KEY;
let currentObjectURL = null;
let stopRequested = false;

const CHUNK_SIZE = 8000;

// ── Inicialização ──────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('gemini_api_key') || DEFAULT_KEY;
  savedKey = stored;
  document.getElementById('apikey').value = stored;
  setKeyStatus('✓ API Key carregada automaticamente.', true);
  setStatus('Pronto! Digite o texto e clique em Gerar voz.');
});

// ── Contagem de caracteres ────────────────────────────────────────────────────

document.getElementById('txt').addEventListener('input', function () {
  document.getElementById('char-count').textContent = this.value.length + ' caracteres';
});

// ── Salvar chave ──────────────────────────────────────────────────────────────

function salvarKey() {
  const k = document.getElementById('apikey').value.trim();
  if (!k) { setKeyStatus('Cole a key primeiro.', false); return; }
  savedKey = k;
  localStorage.setItem('gemini_api_key', k);
  setKeyStatus('✓ API Key salva com sucesso!', true);
  setStatus('Pronto! Digite o texto e clique em Gerar voz.');
}

function setKeyStatus(msg, ok) {
  const el = document.getElementById('key-status');
  el.textContent = msg;
  el.style.color = ok ? '#3B6D11' : '#A32D2D';
}

// ── Divisão de texto ──────────────────────────────────────────────────────────

function dividirTexto(texto, tamanhoMax) {
  const blocos = [];
  let restante = texto;
  while (restante.length > 0) {
    if (restante.length <= tamanhoMax) { blocos.push(restante.trim()); break; }
    let corte = tamanhoMax;
    const parag  = restante.lastIndexOf('\n', corte);
    const ponto  = restante.lastIndexOf('. ', corte);
    const espaco = restante.lastIndexOf(' ', corte);
    if (parag  > tamanhoMax * 0.5) corte = parag;
    else if (ponto  > tamanhoMax * 0.5) corte = ponto + 1;
    else if (espaco > tamanhoMax * 0.5) corte = espaco;
    blocos.push(restante.slice(0, corte).trim());
    restante = restante.slice(corte).trim();
  }
  return blocos.filter(b => b.length > 0);
}

// ── Concatenar Blobs de áudio ─────────────────────────────────────────────────

async function concatenarAudios(blobs) {
  const buffers = await Promise.all(blobs.map(b => b.arrayBuffer()));
  const total = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return new Blob([merged], { type: blobs[0].type });
}

// ── Converte PCM L16 bruto para WAV ──────────────────────────────────────────

function pcmToWavBlob(pcmData, sampleRate = 24000) {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate   = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize   = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view   = new DataView(buffer);
  const str = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); str(8, 'WAVE');
  str(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true); str(36, 'data'); view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
}

function parseSampleRate(mimeType, defaultRate = 24000) {
  if (!mimeType) return defaultRate;
  const match = mimeType.match(/rate=(\d+)/);
  return match ? parseInt(match[1]) : defaultRate;
}

// ── Gemini TTS ────────────────────────────────────────────────────────────────

async function gerarBloco(key, texto, voiceName, stylePrompt) {
  const model = 'gemini-2.5-flash-preview-tts';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const promptText = stylePrompt ? `${stylePrompt}: ${texto}` : texto;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    })
  });

  if (!res.ok) {
    let err = {};
    try { err = await res.json(); } catch (e) {}
    throw new Error(err?.error?.message || `Erro HTTP ${res.status} — verifique sua API Key.`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;

  if (!part?.data) {
    console.error('Resposta Gemini inesperada:', JSON.stringify(data));
    throw new Error('Sem dados de áudio na resposta. Abra o console (F12) para detalhes.');
  }

  const bytes = Uint8Array.from(atob(part.data), c => c.charCodeAt(0));
  const mime  = part.mimeType || '';

  if (mime.startsWith('audio/mp3') || mime.startsWith('audio/mpeg')) {
    return new Blob([bytes], { type: 'audio/mpeg' });
  } else {
    const rate = parseSampleRate(mime);
    return pcmToWavBlob(bytes, rate);
  }
}

// ── Geração principal ─────────────────────────────────────────────────────────

async function gerarVoz() {
  const key = savedKey || DEFAULT_KEY;
  const txt = document.getElementById('txt').value.trim();

  if (!txt) { setStatus('❌ Digite algum texto primeiro!'); return; }

  const voiceName   = document.getElementById('voice').value;
  const stylePrompt = document.getElementById('style').value.trim();

  stopRequested = false;
  document.getElementById('btnPlay').disabled = true;
  document.getElementById('btnDownload').disabled = true;
  document.getElementById('player-wrap').style.display = 'none';

  const blocos = dividirTexto(txt, CHUNK_SIZE);
  const total  = blocos.length;

  setStatus(total > 1 ? `Texto dividido em ${total} partes. Gerando...` : 'Conectando ao Gemini...');
  setProgress(5);

  try {
    const audioBlobs = [];

    for (let i = 0; i < blocos.length; i++) {
      if (stopRequested) {
        setStatus('Cancelado.');
        setProgress(0);
        document.getElementById('btnPlay').disabled = false;
        return;
      }
      setStatus(`Gerando parte ${i + 1} de ${total}...`);
      setProgress(5 + Math.round((i / total) * 85));
      audioBlobs.push(await gerarBloco(key, blocos[i], voiceName, stylePrompt));
      setProgress(5 + Math.round(((i + 1) / total) * 85));
    }

    setStatus(total > 1 ? 'Unindo partes de áudio...' : 'Finalizando...');
    setProgress(92);

    const audioFinal = total > 1 ? await concatenarAudios(audioBlobs) : audioBlobs[0];

    if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = URL.createObjectURL(audioFinal);

    const player = document.getElementById('player');
    player.src = currentObjectURL;
    document.getElementById('player-wrap').style.display = 'block';
    player.play();
    player.onplay  = () => { setStatus('▶ Reproduzindo...'); setProgress(100); };
    player.onended = () => setStatus('✓ Concluído!');

    document.getElementById('btnDownload').disabled = false;
    setStatus('✓ Voz gerada com sucesso!');

  } catch (e) {
    console.error('Erro ao gerar voz:', e);
    setStatus('❌ Erro: ' + e.message);
    setProgress(0);
  }

  document.getElementById('btnPlay').disabled = false;
}

// ── Controles ─────────────────────────────────────────────────────────────────

function pararAudio() {
  stopRequested = true;
  const p = document.getElementById('player');
  p.pause(); p.currentTime = 0;
  setStatus('Parado.'); setProgress(0);
}

function baixarAudio() {
  if (!currentObjectURL) return;
  const a = document.createElement('a');
  a.href = currentObjectURL;
  a.download = 'voz-gemini.wav';
  a.click();
}

function setStatus(t)   { document.getElementById('status').textContent = t; }
function setProgress(p) { document.getElementById('prog').style.width = p + '%'; }
