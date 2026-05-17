let savedKeyEL = '';
let savedKeyGemini = '';
let currentObjectURL = null;
let stopRequested = false;

const CHUNK_SIZE_EL = 4800;
const CHUNK_SIZE_GEMINI = 8000;

window.addEventListener('DOMContentLoaded', () => {
  const savedEL = localStorage.getItem('el_api_key');
  if (savedEL) {
    savedKeyEL = savedEL;
    document.getElementById('apikey').value = savedEL;
    setKeyStatus('el-key-status', '✓ API Key carregada automaticamente.', true);
  }
  const savedG = localStorage.getItem('gemini_api_key');
  if (savedG) {
    savedKeyGemini = savedG;
    document.getElementById('gemini-apikey').value = savedG;
    setKeyStatus('gemini-key-status', '✓ API Key carregada automaticamente.', true);
  }
  switchProvider(localStorage.getItem('provider') || 'elevenlabs');
});

function switchProvider(provider) {
  localStorage.setItem('provider', provider);
  const isEL = provider === 'elevenlabs';
  document.getElementById('panel-elevenlabs').style.display = isEL ? '' : 'none';
  document.getElementById('panel-gemini').style.display     = isEL ? 'none' : '';
  document.getElementById('el-controls').style.display      = isEL ? '' : 'none';
  document.getElementById('gemini-controls').style.display  = isEL ? 'none' : '';
  document.getElementById('tab-el').classList.toggle('tab-active', isEL);
  document.getElementById('tab-gemini').classList.toggle('tab-active', !isEL);
  const hasKey = isEL
    ? !!(savedKeyEL || localStorage.getItem('el_api_key'))
    : !!(savedKeyGemini || localStorage.getItem('gemini_api_key'));
  setStatus(hasKey ? 'Pronto! Digite o texto e clique em Gerar voz.' : 'Cole sua API Key e escreva o texto para começar.');
}

document.getElementById('txt').addEventListener('input', function () {
  document.getElementById('char-count').textContent = this.value.length + ' caracteres';
});

document.getElementById('stability').addEventListener('input', function () {
  document.getElementById('stab-v').textContent = this.value;
});
document.getElementById('styleAmount').addEventListener('input', function () {
  document.getElementById('style-v').textContent = this.value;
});

function salvarKeyEL() {
  const k = document.getElementById('apikey').value.trim();
  if (!k) { setKeyStatus('el-key-status', 'Cole a key primeiro.', false); return; }
  savedKeyEL = k;
  localStorage.setItem('el_api_key', k);
  setKeyStatus('el-key-status', '✓ API Key salva com sucesso!', true);
  setStatus('Pronto! Digite o texto e clique em Gerar voz.');
}

function salvarKeyGemini() {
  const k = document.getElementById('gemini-apikey').value.trim();
  if (!k) { setKeyStatus('gemini-key-status', 'Cole a key primeiro.', false); return; }
  savedKeyGemini = k;
  localStorage.setItem('gemini_api_key', k);
  setKeyStatus('gemini-key-status', '✓ API Key salva com sucesso!', true);
  setStatus('Pronto! Digite o texto e clique em Gerar voz.');
}

function setKeyStatus(id, msg, ok) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.color = ok ? '#3B6D11' : '#A32D2D';
}

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

async function concatenarAudios(blobs) {
  const buffers = await Promise.all(blobs.map(b => b.arrayBuffer()));
  const total = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) { merged.set(new Uint8Array(buf), offset); offset += buf.byteLength; }
  return new Blob([merged], { type: blobs[0].type });
}

async function gerarBlocoEL(key, texto, voiceId, model, stability, styleAmount) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: texto, model_id: model,
      voice_settings: { stability, similarity_boost: 0.80, style: styleAmount, use_speaker_boost: true }
    })
  });
  if (!res.ok) {
    let err = {}; try { err = await res.json(); } catch (e) {}
    throw new Error(err?.detail?.message || `Erro HTTP ${res.status}`);
  }
  return await res.blob();
}

async function gerarBlocoGemini(key, texto, voiceName, stylePrompt) {
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
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    })
  });

  if (!res.ok) {
    let err = {}; try { err = await res.json(); } catch (e) {}
    throw new Error(err?.error?.message || `Erro HTTP ${res.status}`);
  }

  const data = await res.json();
  const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error('Sem dados de áudio na resposta do Gemini.');

  const pcm = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return pcmToWavBlob(pcm, 24000);
}

function pcmToWavBlob(pcmData, sampleRate = 24000) {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeStr(8, 'WAVE');
  writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true); writeStr(36, 'data'); view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
}

async function processarBlocos(txt, chunkSize, geradorFn) {
  const blocos = dividirTexto(txt, chunkSize);
  const total  = blocos.length;
  if (total > 1) setStatus(`Texto dividido em ${total} partes. Gerando...`);
  else setStatus('Conectando...');
  setProgress(5);
  const audioBlobs = [];
  for (let i = 0; i < blocos.length; i++) {
    if (stopRequested) { setStatus('Cancelado.'); setProgress(0); return null; }
    setStatus(`Gerando parte ${i + 1} de ${total}...`);
    setProgress(5 + Math.round((i / total) * 85));
    audioBlobs.push(await geradorFn(blocos[i]));
    setProgress(5 + Math.round(((i + 1) / total) * 85));
  }
  setStatus(total > 1 ? 'Unindo partes...' : 'Finalizando...'); setProgress(92);
  return total > 1 ? await concatenarAudios(audioBlobs) : audioBlobs[0];
}

async function gerarVoz() {
  const provider = localStorage.getItem('provider') || 'elevenlabs';
  const txt = document.getElementById('txt').value.trim();
  if (!txt) { setStatus('Digite algum texto primeiro!'); return; }

  stopRequested = false;
  document.getElementById('btnPlay').disabled = true;
  document.getElementById('btnDownload').disabled = true;
  document.getElementById('player-wrap').style.display = 'none';

  try {
    let audioFinal;

    if (provider === 'elevenlabs') {
      const key = savedKeyEL || localStorage.getItem('el_api_key') || document.getElementById('apikey').value.trim();
      if (!key) { setStatus('Cole sua API Key da ElevenLabs primeiro!'); document.getElementById('btnPlay').disabled = false; return; }
      const voiceId = document.getElementById('voice').value;
      const model   = document.getElementById('model').value;
      const stability   = parseInt(document.getElementById('stability').value) / 100;
      const styleAmount = parseInt(document.getElementById('styleAmount').value) / 100;
      audioFinal = await processarBlocos(txt, CHUNK_SIZE_EL,
        bloco => gerarBlocoEL(key, bloco, voiceId, model, stability, styleAmount));
    } else {
      const key = savedKeyGemini || localStorage.getItem('gemini_api_key') || document.getElementById('gemini-apikey').value.trim();
      if (!key) { setStatus('Cole sua API Key do Google AI Studio primeiro!'); document.getElementById('btnPlay').disabled = false; return; }
      const voiceName   = document.getElementById('gemini-voice').value;
      const stylePrompt = document.getElementById('gemini-style').value.trim();
      audioFinal = await processarBlocos(txt, CHUNK_SIZE_GEMINI,
        bloco => gerarBlocoGemini(key, bloco, voiceName, stylePrompt));
    }

    if (!audioFinal) return;

    if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = URL.createObjectURL(audioFinal);

    const player = document.getElementById('player');
    player.src = currentObjectURL;
    document.getElementById('player-wrap').style.display = 'block';
    player.play();
    player.onplay  = () => { setStatus('Reproduzindo...'); setProgress(100); };
    player.onended = () => setStatus('Concluído!');
    document.getElementById('btnDownload').disabled = false;
    setStatus('Voz gerada com sucesso!');
  } catch (e) {
    setStatus('Erro: ' + e.message);
    setProgress(0);
  }
  document.getElementById('btnPlay').disabled = false;
}

function pararAudio() {
  stopRequested = true;
  const p = document.getElementById('player');
  p.pause(); p.currentTime = 0;
  setStatus('Parado.'); setProgress(0);
}

function baixarAudio() {
  if (!currentObjectURL) return;
  const ext = (localStorage.getItem('provider') === 'gemini') ? 'wav' : 'mp3';
  const a = document.createElement('a');
  a.href = currentObjectURL;
  a.download = `voz-gerada.${ext}`;
  a.click();
}

function setStatus(t)   { document.getElementById('status').textContent = t; }
function setProgress(p) { document.getElementById('prog').style.width = p + '%'; }
