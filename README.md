# 🎙️ Leitor de Voz Humana — ElevenLabs

Site para converter texto em voz humana natural usando a API da ElevenLabs, com suporte a português brasileiro.

## ✨ Funcionalidades

- Voz humana natural em português
- Várias vozes disponíveis (femininas e masculinas)
- Controle de estabilidade e expressividade
- Player de áudio integrado
- Download do áudio em MP3
- API Key salva no navegador (não sai do seu computador)

## 🚀 Como publicar no GitHub Pages

### 1. Crie um repositório no GitHub
- Acesse [github.com](https://github.com) e faça login
- Clique em **New repository**
- Dê um nome (ex: `leitor-de-voz`)
- Deixe **Public** marcado
- Clique em **Create repository**

### 2. Suba os arquivos
```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/leitor-de-voz.git
git push -u origin main
```

### 3. Ative o GitHub Pages
- No repositório, vá em **Settings → Pages**
- Em **Source**, selecione **Deploy from a branch**
- Selecione a branch **main** e pasta **/ (root)**
- Clique em **Save**

### 4. Acesse o site
Após alguns minutos, seu site estará disponível em:
```
https://SEU_USUARIO.github.io/leitor-de-voz/
```

## 🔑 Como obter a API Key da ElevenLabs

1. Crie uma conta gratuita em [elevenlabs.io](https://elevenlabs.io)
2. Vá em **Profile → API Key**
3. Copie a chave e cole no site

**Plano gratuito:** 10.000 caracteres por mês.

## 📁 Estrutura dos arquivos

```
leitor-de-voz/
├── index.html   — página principal
├── style.css    — estilos
├── app.js       — lógica e chamada à API
└── README.md    — este arquivo
```
