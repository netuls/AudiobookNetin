*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #0f001a 100%);
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed;
  top: -50%;
  right: -50%;
  width: 1000px;
  height: 1000px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

/* ── Animações ── */
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes flash-success {
  0% {
    background: rgba(34, 197, 94, 0);
  }
  50% {
    background: rgba(34, 197, 94, 0.15);
  }
  100% {
    background: rgba(34, 197, 94, 0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* ── Container ── */
.root {
  width: 100%;
  max-width: 1400px;
  background: rgba(15, 10, 30, 0.7);
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ── Top bar ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(90deg, rgba(88, 28, 135, 0.2) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(139, 92, 246, 0.05) 100%);
  border-bottom: 2px solid rgba(168, 85, 247, 0.2);
  flex-shrink: 0;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 2px solid rgba(168, 85, 247, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-size: 26px;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(168, 85, 247, 0.6);
}

.logo img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.brand-name {
  font-family: 'Orbitron', monospace;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #ede9fe 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
}

/* ── Export button ── */
.export-btn {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1.5px solid rgba(34, 197, 94, 0.4);
  border-radius: 10px;
  color: #6ee7b7;
  cursor: pointer;
  padding: 10px 18px;
  transition: all 0.25s ease;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.15);
  white-space: nowrap;
}

.export-btn:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(16, 185, 129, 0.2) 100%);
  border-color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.3);
  transform: translateY(-2px);
}

.export-btn:active {
  transform: translateY(0);
}

/* ── Stats bar ── */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(180deg, rgba(88, 28, 135, 0.1) 0%, transparent 100%);
  border-bottom: 2px solid rgba(168, 85, 247, 0.15);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.stat {
  padding: 20px 32px;
  text-align: center;
  border-radius: 12px;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.2);
  transition: all 0.3s ease;
  cursor: default;
  min-width: 200px;
}

.stat:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
}

.stat-n {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-l {
  font-size: 13px;
  color: rgba(233, 213, 255, 0.7);
  margin-top: 6px;
  font-weight: 500;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  gap: 16px;
  padding: 20px 32px;
  background: linear-gradient(180deg, rgba(88, 28, 135, 0.08) 0%, transparent 100%);
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.search-input,
.sort-select {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.08);
  color: #e9d5ff;
  font-size: 14px;
  transition: all 0.25s ease;
  font-family: 'Inter', sans-serif;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.search-input::placeholder {
  color: rgba(233, 213, 255, 0.5);
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.7);
  background: rgba(168, 85, 247, 0.12);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.sort-select {
  cursor: pointer;
  min-width: 180px;
}

.sort-select:hover {
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.12);
}

.sort-select option {
  background: #1a0033;
  color: #e9d5ff;
}

/* ── Body / Content ── */
#body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

#body::-webkit-scrollbar {
  width: 8px;
}

#body::-webkit-scrollbar-track {
  background: rgba(168, 85, 247, 0.05);
}

#body::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 4px;
}

#body::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}

/* ── Member Row ── */
.member-row {
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease;
}

.member-row:hover {
  border-color: rgba(168, 85, 247, 0.3);
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
  transform: translateY(-2px);
}

.member-label {
  padding: 20px 24px;
  background: linear-gradient(90deg, rgba(88, 28, 135, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-name {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, #ede9fe 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.member-count {
  font-size: 12px;
  color: rgba(168, 85, 247, 0.7);
  background: rgba(168, 85, 247, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.member-content {
  padding: 24px;
}

/* ── Items List ── */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: transparent;
}

.items-list::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.2);
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.4);
}

.empty-msg {
  text-align: center;
  color: rgba(168, 85, 247, 0.5);
  font-size: 14px;
  padding: 24px;
  font-style: italic;
}

/* ── Item Card ── */
.citem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
  animation: slideInUp 0.3s ease;
}

.citem:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.2);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
}

.flash-success {
  animation: flash-success 0.8s ease;
}

.citem-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.citem-name {
  font-size: 14px;
  font-weight: 500;
  color: #e9d5ff;
  word-break: break-word;
  line-height: 1.4;
}

.citem-date {
  font-size: 12px;
  color: rgba(168, 85, 247, 0.6);
}

.citem-edit,
.citem-del {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
}

/* ── Icon Buttons ── */
.icon-btn {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  color: #c4b5fd;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.icon-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.icon-btn:active {
  transform: scale(0.95);
}

.citem-del:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

/* ── Edit Input ── */
.edit-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.08);
  color: #6ee7b7;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.edit-input:focus {
  outline: none;
  border-color: rgba(34, 197, 94, 0.7);
  background: rgba(34, 197, 94, 0.12);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
}

.edit-save-btn,
.edit-cancel-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.2);
  background: rgba(168, 85, 247, 0.1);
  color: #c4b5fd;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-save-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #6ee7b7;
}

.edit-cancel-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

/* ── Add Row ── */
.add-row {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(168, 85, 247, 0.1);
}

.add-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.08);
  color: #e9d5ff;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  resize: none;
  transition: all 0.25s ease;
  line-height: 1.5;
  max-height: 120px;
}

.add-input::placeholder {
  color: rgba(233, 213, 255, 0.5);
}

.add-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.7);
  background: rgba(168, 85, 247, 0.12);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.add-btn {
  width: 44px;
  height: auto;
  min-height: 44px;
  border-radius: 10px;
  border: 1.5px solid rgba(168, 85, 247, 0.4);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
  color: #c4b5fd;
  cursor: pointer;
  font-weight: 700;
  font-size: 18px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
}

.add-btn:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.25) 100%);
  border-color: rgba(168, 85, 247, 0.7);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.25);
  transform: translateY(-2px);
}

.add-btn:active {
  transform: translateY(0);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: slideInUp 0.3s ease;
}

.modal-box {
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideInUp 0.3s ease;
}

.modal-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #ede9fe;
  text-align: center;
  margin-bottom: 8px;
}

.modal-sub {
  font-size: 14px;
  color: rgba(233, 213, 255, 0.7);
  text-align: center;
  margin-bottom: 24px;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.08);
  color: #e9d5ff;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: all 0.25s ease;
  margin-bottom: 8px;
}

.modal-input::placeholder {
  color: rgba(233, 213, 255, 0.5);
}

.modal-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.7);
  background: rgba(168, 85, 247, 0.12);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.modal-input.error {
  animation: shake 0.4s ease;
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
}

.modal-error {
  font-size: 12px;
  color: #fca5a5;
  min-height: 18px;
  margin-bottom: 16px;
  font-weight: 500;
}

.modal-btns {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-btn-cancel,
.modal-btn-confirm {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  border: 1.5px solid rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.1);
  color: #c4b5fd;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s ease;
  font-family: 'Inter', sans-serif;
}

.modal-btn-cancel:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.5);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border-color: rgba(34, 197, 94, 0.4);
  color: #6ee7b7;
}

.modal-btn-confirm:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(16, 185, 129, 0.2) 100%);
  border-color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.modal-btn-cancel:active,
.modal-btn-confirm:active {
  transform: scale(0.98);
}

/* ── Undo Toast ── */
.undo-toast {
  position: fixed;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1.5px solid rgba(34, 197, 94, 0.4);
  border-radius: 12px;
  padding: 16px 20px;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  z-index: 999;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.undo-toast.show {
  bottom: 24px;
}

#undo-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#undo-btn,
#undo-close {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #6ee7b7;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
}

#undo-btn:hover,
#undo-close:hover {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.5);
}

#undo-close {
  padding: 6px 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Error Toast ── */
#error-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  padding: 14px 18px;
  color: #fca5a5;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  animation: slideIn 0.3s ease;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
}

#error-toast button {
  background: none;
  border: none;
  color: #fca5a5;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

#error-toast button:hover {
  transform: scale(1.1);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .topbar {
    padding: 16px 20px;
    flex-wrap: wrap;
  }

  .brand-name {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .export-btn {
    font-size: 10px;
    padding: 8px 14px;
  }

  .logo {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .logo img {
    width: 40px;
    height: 40px;
  }

  .stats-bar {
    padding: 16px;
  }

  .stat {
    padding: 16px 20px;
    min-width: 160px;
  }

  .stat-n {
    font-size: 24px;
  }

  .stat-l {
    font-size: 12px;
  }

  .toolbar {
    padding: 16px 20px;
    gap: 12px;
  }

  .search-input {
    min-width: 100%;
  }

  .sort-select {
    min-width: 100%;
  }

  #body {
    padding: 16px;
    gap: 16px;
  }

  .member-label {
    padding: 16px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .member-content {
    padding: 16px;
  }

  .add-row {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
  }

  .citem {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .citem-body {
    width: 100%;
  }

  .modal-box {
    padding: 24px;
    max-width: 90%;
  }

  .modal-icon {
    font-size: 40px;
  }

  .modal-title {
    font-size: 18px;
  }

  .undo-toast {
    max-width: calc(100% - 32px);
    left: 16px;
    right: 16px;
    transform: none;
  }

  #error-toast {
    left: 16px;
    right: 16px;
    max-width: calc(100% - 32px);
  }

  .items-list {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .root {
    border-radius: 0;
  }

  .topbar {
    padding: 12px 16px;
  }

  .brand {
    gap: 12px;
  }

  .brand-name {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .logo {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .logo img {
    width: 36px;
    height: 36px;
  }

  .export-btn {
    font-size: 9px;
    padding: 6px 10px;
  }

  .stats-bar {
    padding: 12px;
  }

  .stat {
    padding: 12px 16px;
    min-width: 140px;
  }

  .stat-n {
    font-size: 20px;
  }

  .stat-l {
    font-size: 11px;
  }

  .toolbar {
    padding: 12px 16px;
    gap: 8px;
  }

  #body {
    padding: 12px;
    gap: 12px;
  }

  .member-label {
    padding: 12px;
  }

  .member-name {
    font-size: 14px;
  }

  .member-count {
    font-size: 11px;
    padding: 3px 8px;
  }

  .member-content {
    padding: 12px;
  }

  .citem {
    padding: 12px;
  }

  .citem-name {
    font-size: 13px;
  }

  .citem-date {
    font-size: 11px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .add-input {
    font-size: 13px;
    padding: 10px 12px;
  }

  .add-btn {
    width: 40px;
    min-height: 40px;
    font-size: 16px;
  }

  .modal-box {
    padding: 20px;
  }

  .modal-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .modal-title {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .modal-sub {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .modal-input {
    font-size: 13px;
    padding: 10px 12px;
  }

  .modal-btn-cancel,
  .modal-btn-confirm {
    font-size: 13px;
    padding: 10px 16px;
  }

  .undo-toast {
    font-size: 13px;
    padding: 12px 16px;
  }

  #undo-btn,
  #undo-close {
    font-size: 11px;
    padding: 4px 8px;
  }

  #error-toast {
    font-size: 13px;
    padding: 12px 14px;
    gap: 8px;
  }
}
