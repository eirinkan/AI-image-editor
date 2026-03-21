// UI描画・イベント処理モジュール

const UI = (() => {
  // SVGアイコン定数（Heroicons outline 24x24）
  const ICONS = {
    cube: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path></svg>',
    text: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>',
    user: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path></svg>',
    sun: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"></path></svg>',
    camera: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"></path></svg>',
    home: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path></svg>',
    globe: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"></path></svg>',
    bolt: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>',
    plus: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path></svg>',
    // グループ（Heroicons: squares-2x2）
    group: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"></path></svg>',
    // リージョン（Heroicons: map）
    region: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"></path></svg>',
  };

  // DOM要素のキャッシュ
  let elements = {};

  // 複数選択中の要素リスト
  let selectedElements = []; // [{ id, type, name, data }]

  // Before/After比較状態
  let beforeImageData = null; // 比較用の元画像
  let hasBeforeImage = false; // Before画像が設定済みか
  let customBeforeEntryId = null; // ユーザーが明示的に選択したBeforeエントリID

  // エラー/成功トーストのタイマー（競合防止）
  let errorTimer = null;

  // cancelBtnのイベントハンドラ（cloneNodeを使わず付け替えで管理）
  let cancelHandler = null;

  // 粒度レベル: 常に全表示（6）
  let currentDetailLevel = 6;
  // 現在表示中のJSON（再描画用に保持）
  let currentRenderJson = null;

  // 初期化
  function init() {
    cacheElements();
    setupEventListeners();
    restoreApiKey();
    initModelSelectors();
  }

  function cacheElements() {
    elements = {
      // ヘッダー
      apiKeyInput: document.getElementById('apiKeyInput'),
      apiKeyToggle: document.getElementById('apiKeyToggle'),
      apiKeyStatus: document.getElementById('apiKeyStatus'),

      // 画像アップロード
      uploadArea: document.getElementById('uploadArea'),
      fileInput: document.getElementById('fileInput'),
      imagePreview: document.getElementById('imagePreview'),
      previewImage: document.getElementById('previewImage'),
      previewImageClean: document.getElementById('previewImageClean'),
      removeImage: document.getElementById('removeImage'),

      // フォーカス選択
      analysisSection: document.getElementById('analysisSection'),
      // focusTags削除済み
      customInstruction: document.getElementById('customInstruction'),
      analyzeBtn: document.getElementById('analyzeBtn'),

      // 要素一覧
      elementsSection: document.getElementById('elementsSection'),
      elementsList: document.getElementById('elementsList'),

      // 編集パネル
      editSection: document.getElementById('editSection'),
      editInstructionsList: document.getElementById('editInstructionsList'),
      referenceUploadArea: document.getElementById('referenceUploadArea'),
      referenceFileInput: document.getElementById('referenceFileInput'),
      referencePreview: document.getElementById('referencePreview'),
      removeReference: document.getElementById('removeReference'),
      generateBtn: document.getElementById('generateBtn'),

      // 結果表示
      resultSection: document.getElementById('resultSection'),
      resultImage: document.getElementById('resultImage'),
      resultGrid: document.getElementById('resultGrid'),

      // 生成枚数
      generateCount: document.getElementById('generateCount'),
      generateCountCustom: document.getElementById('generateCountCustom'),

      // 履歴（サイドバー）
      historySidebar: document.getElementById('historySidebar'),
      historyTimeline: document.getElementById('historyTimeline'),
      // 履歴（スマホ横スクロール）
      historyMobile: document.getElementById('historyMobile'),
      historyTimelineMobile: document.getElementById('historyTimelineMobile'),

      // 採用画像ダウンロードボタン
      adoptDownloadBtn: document.getElementById('adoptDownloadBtn'),

      // ローディング
      loadingOverlay: document.getElementById('loadingOverlay'),
      loadingText: document.getElementById('loadingText'),
      loadingSteps: document.getElementById('loadingSteps'),
      cancelBtn: document.getElementById('cancelBtn'),

      // Before/After比較
      compareContainer: document.getElementById('compareContainer'),
      compareBefore: document.getElementById('compareBefore'),
      compareBeforeImg: document.getElementById('compareBeforeImg'),
      compareSlider: document.getElementById('compareSlider'),

      // プリセット
      // プリセットはインラインポップアップに移行（固定セクションは廃止）

      // モデル選択
      textModelSelect: document.getElementById('textModelSelect'),
      textModelNote: document.getElementById('textModelNote'),
      imageModelSelect: document.getElementById('imageModelSelect'),
      imageModelNote: document.getElementById('imageModelNote'),
      t2iModelSelect: document.getElementById('t2iModelSelect'),
      t2iRegenModelSelect: document.getElementById('t2iRegenModelSelect'),
      editModelSelect: document.getElementById('editModelSelect'),
      costTableContainer: document.getElementById('costTableContainer'),

      // 設定・ヘルプモーダル
      settingsBtn: document.getElementById('settingsBtn'),
      settingsModal: document.getElementById('settingsModal'),
      settingsClose: document.getElementById('settingsClose'),
      helpBtn: document.getElementById('helpBtn'),
      helpModal: document.getElementById('helpModal'),
      helpClose: document.getElementById('helpClose'),

      // プレビューカラム
      cleanColumn: document.getElementById('cleanColumn'),
      markerColumn: document.getElementById('markerColumn'),

      // プロジェクト保存・一覧
      saveProjectBtn: document.getElementById('saveProjectBtn'),
      saveProjectModal: document.getElementById('saveProjectModal'),
      saveProjectClose: document.getElementById('saveProjectClose'),
      saveProjectName: document.getElementById('saveProjectName'),
      saveProjectInfo: document.getElementById('saveProjectInfo'),
      saveProjectCancel: document.getElementById('saveProjectCancel'),
      saveProjectOverwrite: document.getElementById('saveProjectOverwrite'),
      saveProjectConfirm: document.getElementById('saveProjectConfirm'),
      projectListBtn: document.getElementById('projectListBtn'),
      projectModal: document.getElementById('projectModal'),
      projectModalClose: document.getElementById('projectModalClose'),
      projectList: document.getElementById('projectList'),
      importProjectInput: document.getElementById('importProjectInput'),

      // エラー
      errorToast: document.getElementById('errorToast'),
      errorMessage: document.getElementById('errorMessage'),
      errorClose: document.getElementById('errorClose'),
    };
  }

  function setupEventListeners() {
    // 新規作成ボタン
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
      newProjectBtn.addEventListener('click', () => {
        if (typeof App !== 'undefined') App.clearProject();
      });
    }

    // 画像拡大モーダル
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('imageZoomImg');
    if (zoomModal) {
      // 背景クリックで閉じる（マーカークリック時は閉じない）
      zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal || e.target.id === 'imageZoomImg') {
          zoomModal.classList.add('hidden');
        }
      });
      // Escで閉じる
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !zoomModal.classList.contains('hidden')) {
          zoomModal.classList.add('hidden');
        }
      });
      // 対象画像にクリックイベント
      ['previewImageClean', 'previewImage', 'resultImage', 'generateResultImage'].forEach(id => {
        const img = document.getElementById(id);
        if (img) {
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomImg.src = img.src;
            // マーカー付き画像の場合、マーカーを複製して表示
            const zoomOverlay = document.getElementById('zoomMarkerOverlay');
            if (zoomOverlay) {
              zoomOverlay.innerHTML = '';
              if (id === 'previewImage') {
                const srcOverlay = document.getElementById('markerOverlay');
                if (srcOverlay) {
                  Array.from(srcOverlay.children).forEach(marker => {
                    const clone = marker.cloneNode(true);
                    clone.style.pointerEvents = 'auto';
                    clone.style.cursor = 'pointer';
                    // クリックで要素を選択
                    clone.addEventListener('click', (ev) => {
                      ev.stopPropagation();
                      const elId = clone.dataset.elementId;
                      const card = document.querySelector(`.element-card[data-element-id="${elId}"]`);
                      if (card) card.click();
                      // 選択状態をズームマーカーにも反映
                      clone.classList.toggle('selected');
                    });
                    zoomOverlay.appendChild(clone);
                  });
                }
              }
            }
            // マーカートグルボタンの表示制御
            const toggleBtn = document.getElementById('zoomMarkerToggle');
            if (toggleBtn) {
              if (id === 'previewImage' && zoomOverlay && zoomOverlay.children.length > 0) {
                toggleBtn.classList.remove('hidden');
                toggleBtn.textContent = 'マーカー非表示';
                zoomOverlay.classList.remove('hidden');
              } else {
                toggleBtn.classList.add('hidden');
              }
            }
            // グループ・リージョン一覧を画像下に表示
            const zoomGroupList = document.getElementById('zoomGroupList');
            if (zoomGroupList) {
              zoomGroupList.innerHTML = '';
              if (id === 'previewImage') {
                // STEP2のグループカードをクローン
                const groupHeader = document.querySelector('#elementsList .category-header');
                if (groupHeader) {
                  const cards = [];
                  let el = groupHeader.nextElementSibling;
                  // 次のcategory-headerまでのカードを収集
                  while (el && !el.classList.contains('category-header')) {
                    if (el.classList.contains('element-card')) {
                      cards.push(el);
                    }
                    el = el.nextElementSibling;
                  }
                  cards.forEach(card => {
                    // カメラ・構図と全体は拡大表示では不要
                    const elId = card.dataset.elementId;
                    if (elId === 'camera' || elId === 'global') return;
                    const clone = card.cloneNode(true);
                    // 元のelement-cardスタイルを維持しつつコンパクトに
                    clone.style.pointerEvents = 'auto';
                    // グループ・リージョンカードはCSS上background:transparentなので明示的に白背景
                    clone.style.background = '#fff';
                    // サイズをコンパクトに調整
                    clone.classList.remove('min-h-0', 'px-3', 'py-2.5');
                    clone.classList.add('px-2.5', 'py-1.5', 'text-xs');
                    // 元カードが選択済みならクローンにも反映
                    if (card.classList.contains('border-blue-500')) {
                      clone.classList.add('border-blue-500');
                      clone.classList.remove('border-gray-200', 'dark:border-gray-700');
                    }
                    clone.addEventListener('click', (ev) => {
                      ev.stopPropagation();
                      // 通常画面と同じ選択UIをトグル
                      clone.classList.toggle('border-blue-500');
                      clone.classList.toggle('border-gray-200');
                      card.click();
                    });
                    zoomGroupList.appendChild(clone);
                  });
                }
                zoomGroupList.classList.remove('hidden');
              } else {
                zoomGroupList.classList.add('hidden');
              }
            }
            zoomModal.classList.remove('hidden');
            // モーダル表示後に画像の横幅に合わせる（hidden中はoffsetWidthが0のため）
            if (zoomGroupList && !zoomGroupList.classList.contains('hidden')) {
              requestAnimationFrame(() => {
                const wrapperEl = document.getElementById('imageZoomWrapper');
                if (wrapperEl) {
                  zoomGroupList.style.width = wrapperEl.offsetWidth + 'px';
                }
              });
            }
          });
        }
      });

      // マーカー表示トグルボタン
      const toggleBtn = document.getElementById('zoomMarkerToggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const zoomOverlay = document.getElementById('zoomMarkerOverlay');
          if (zoomOverlay) {
            const isHidden = zoomOverlay.classList.toggle('hidden');
            toggleBtn.textContent = isHidden ? 'マーカー表示' : 'マーカー非表示';
          }
        });
      }
    }

    // プロジェクト保存・一覧モーダル
    elements.saveProjectBtn.addEventListener('click', () => showSaveDialog());
    elements.saveProjectClose.addEventListener('click', () => hideSaveDialog());
    elements.saveProjectCancel.addEventListener('click', () => hideSaveDialog());
    elements.saveProjectModal.addEventListener('click', (e) => { if (e.target === elements.saveProjectModal) hideSaveDialog(); });
    // 新規保存
    elements.saveProjectConfirm.addEventListener('click', () => {
      const name = elements.saveProjectName.value.trim();
      hideSaveDialog();
      App.saveProject(name || null, false);
    });
    // 上書き保存
    elements.saveProjectOverwrite.addEventListener('click', () => {
      const name = elements.saveProjectName.value.trim();
      hideSaveDialog();
      App.saveProject(name || null, true);
    });
    elements.saveProjectName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); elements.saveProjectConfirm.click(); }
    });

    elements.projectListBtn.addEventListener('click', () => showProjectModal());
    elements.projectModalClose.addEventListener('click', () => hideProjectModal());
    elements.projectModal.addEventListener('click', (e) => { if (e.target === elements.projectModal) hideProjectModal(); });
    elements.importProjectInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await App.importProject(file);
        await renderProjectList();
      } catch (err) {
        showError(err.message);
      }
      e.target.value = '';
    });

    // 設定・ヘルプモーダル
    elements.settingsBtn.addEventListener('click', () => elements.settingsModal.classList.remove('hidden'));
    elements.settingsClose.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
    elements.settingsModal.addEventListener('click', (e) => { if (e.target === elements.settingsModal) elements.settingsModal.classList.add('hidden'); });
    elements.helpBtn.addEventListener('click', () => elements.helpModal.classList.remove('hidden'));
    elements.helpClose.addEventListener('click', () => elements.helpModal.classList.add('hidden'));
    elements.helpModal.addEventListener('click', (e) => { if (e.target === elements.helpModal) elements.helpModal.classList.add('hidden'); });

    // APIキー（自動保存）
    elements.apiKeyToggle.addEventListener('click', toggleApiKeyVisibility);
    elements.apiKeyInput.addEventListener('input', autoSaveApiKey);

    // 画像アップロード（ドラッグ&ドロップ）
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.uploadArea.addEventListener('click', () => {
      // 画像プレビュー表示中はファイル選択ダイアログを開かない
      if (!elements.imagePreview.classList.contains('hidden')) return;
      elements.fileInput.click();
    });
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeImage.addEventListener('click', removeUploadedImage);

    // フォーカスタグ
    // focusTags削除済み
    elements.analyzeBtn.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.analyze();
    });

    // 参照画像
    elements.referenceUploadArea.addEventListener('click', () => elements.referenceFileInput.click());
    elements.referenceUploadArea.addEventListener('dragover', handleDragOver);
    elements.referenceUploadArea.addEventListener('dragleave', handleDragLeave);
    elements.referenceUploadArea.addEventListener('drop', handleReferenceDrop);
    elements.referenceFileInput.addEventListener('change', handleReferenceFileSelect);
    if (elements.removeReference) {
      elements.removeReference.addEventListener('click', removeReferenceImage);
    }

    // 生成ボタン
    elements.generateBtn.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.generate();
    });

    // 生成枚数セレクター
    elements.generateCount.addEventListener('change', () => {
      if (elements.generateCount.value === 'custom') {
        elements.generateCountCustom.classList.remove('hidden');
        elements.generateCountCustom.focus();
      } else {
        elements.generateCountCustom.classList.add('hidden');
      }
    });

    // エラー閉じる
    elements.errorClose.addEventListener('click', hideError);

    // Before/After比較スライダー（ホバー＋ドラッグ）
    setupCompareSlider();

    // プリセットポップアップ: 外側クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.preset-popup') && !e.target.closest('.preset-toggle-btn')) {
        document.querySelectorAll('.preset-popup').forEach(p => {
          const btn = p.closest('.edit-instruction-row')?.querySelector('.preset-toggle-btn');
          if (btn) {
            btn.querySelector('svg').style.transform = '';
            btn.classList.remove('bg-blue-50', 'text-blue-500', 'border-blue-300');
          }
          p.remove();
        });
      }
    });
  }

  // --- APIキー（自動保存） ---
  let apiKeySaveTimer = null;

  function restoreApiKey() {
    const key = GeminiAPI.getApiKey();
    if (key) {
      elements.apiKeyInput.value = key;
      elements.apiKeyInput.type = 'password';
      elements.apiKeyStatus.textContent = '保存済み';
      elements.apiKeyStatus.className = 'text-xs text-green-500';
    } else {
      elements.analyzeBtn.disabled = true;
      elements.apiKeyStatus.textContent = 'APIキーを入力してください';
      elements.apiKeyStatus.className = 'text-xs text-gray-400';
      showError('APIキーが未設定です。ヘッダーの「設定」からAPIキーを入力してください。');
    }
  }

  function autoSaveApiKey() {
    clearTimeout(apiKeySaveTimer);
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
      elements.analyzeBtn.disabled = true;
      elements.apiKeyStatus.textContent = 'APIキーを入力してください';
      elements.apiKeyStatus.className = 'text-xs text-gray-400';
      return;
    }
    // 入力中のちらつき防止: 500ms後に保存
    elements.apiKeyStatus.textContent = '入力中...';
    elements.apiKeyStatus.className = 'text-xs text-gray-400';
    apiKeySaveTimer = setTimeout(() => {
      GeminiAPI.setApiKey(key);
      elements.analyzeBtn.disabled = false;
      elements.apiKeyStatus.textContent = '自動保存しました';
      elements.apiKeyStatus.className = 'text-xs text-green-500';
    }, 500);
  }

  // --- モデル選択 ---
  // コスト定義
  // テキスト処理: 中央値（概算 ¥/回）
  const TEXT_COST_MAP = {
    'gemini-2.5-pro':         { analysis: '¥5',   edit: '¥3',   prompt: '¥2' },
    'gemini-3.1-pro-preview': { analysis: '¥6',   edit: '¥4',   prompt: '¥2' },
  };
  // 画像生成: サイズ別（概算 ¥/回）
  const IMAGE_COST_MAP = {
    'gemini-3.1-flash-image-preview': { '1K': '¥7',  '2K': '¥12', '4K': '¥23' },
    'gemini-3-pro-image-preview':     { '1K': '¥20', '2K': '¥28', '4K': '¥36' },
  };

  function initModelSelectors() {
    // テキストモデルセレクトボックスを構築
    const currentText = GeminiAPI.getTextModel();
    GeminiAPI.TEXT_MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name}（${m.cost}）`;
      if (m.id === currentText) opt.selected = true;
      elements.textModelSelect.appendChild(opt);
    });

    // 画像モデルセレクトボックスを構築
    const currentImage = GeminiAPI.getImageModel();
    GeminiAPI.IMAGE_MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name}（${m.cost}）`;
      if (m.id === currentImage) opt.selected = true;
      elements.imageModelSelect.appendChild(opt);
    });

    // インラインセレクトの初期値を同期
    const inlineImageSelects = [elements.t2iModelSelect, elements.t2iRegenModelSelect, elements.editModelSelect];
    inlineImageSelects.forEach(sel => { if (sel) sel.value = currentImage; });

    // 全画像モデルセレクトを同期するヘルパー
    function syncAllImageSelects(sourceValue) {
      GeminiAPI.setImageModel(sourceValue);
      GeminiAPI.reloadModels();
      elements.imageModelSelect.value = sourceValue;
      inlineImageSelects.forEach(sel => { if (sel) sel.value = sourceValue; });
      updateModelNotes();
    }

    // イベントリスナー
    elements.textModelSelect.addEventListener('change', () => {
      GeminiAPI.setTextModel(elements.textModelSelect.value);
      GeminiAPI.reloadModels();
      updateModelNotes();
    });
    elements.imageModelSelect.addEventListener('change', () => {
      syncAllImageSelects(elements.imageModelSelect.value);
    });
    inlineImageSelects.forEach(sel => {
      if (sel) sel.addEventListener('change', () => syncAllImageSelects(sel.value));
    });

    // 初期表示
    updateModelNotes();
    updateCostTable();
  }

  function updateModelNotes() {
    const textModel = GeminiAPI.TEXT_MODELS.find(m => m.id === elements.textModelSelect.value);
    const imageModel = GeminiAPI.IMAGE_MODELS.find(m => m.id === elements.imageModelSelect.value);
    elements.textModelNote.textContent = textModel ? textModel.note : '';
    elements.imageModelNote.textContent = imageModel ? imageModel.note : '';
  }

  function updateCostTable() {
    const textModels = GeminiAPI.TEXT_MODELS;
    const imageModels = GeminiAPI.IMAGE_MODELS;
    const processes = [
      { label: '画像分析', key: 'analysis' },
      { label: '編集指示', key: 'edit' },
      { label: 'プロンプト', key: 'prompt' },
    ];
    const imageSizes = ['1K', '2K', '4K'];
    const thCls = 'py-1.5 px-2 text-gray-500 dark:text-gray-400 font-normal whitespace-nowrap border border-gray-200 dark:border-gray-700';
    const tdCls = 'py-1.5 px-2 border border-gray-200 dark:border-gray-700';

    // テキスト処理コスト表（モデル × 処理）
    let textHtml = `<p class="text-gray-500 dark:text-gray-400 font-medium mb-1">テキスト処理（中央値/回）</p>`;
    textHtml += `<table class="w-full border-collapse"><thead><tr><th class="${thCls} text-left"></th>`;
    textModels.forEach(m => { textHtml += `<th class="${thCls} text-right">${m.name}</th>`; });
    textHtml += `</tr></thead><tbody>`;
    processes.forEach(p => {
      textHtml += `<tr><td class="${tdCls} text-gray-600 dark:text-gray-300">${p.label}</td>`;
      textModels.forEach(m => {
        const cost = TEXT_COST_MAP[m.id] ? TEXT_COST_MAP[m.id][p.key] : '-';
        textHtml += `<td class="${tdCls} text-right text-gray-800 dark:text-gray-100">${cost}</td>`;
      });
      textHtml += `</tr>`;
    });
    textHtml += `</tbody></table>`;

    // 画像生成コスト表（モデル × サイズ）
    let imageHtml = `<p class="text-gray-500 dark:text-gray-400 font-medium mb-1 mt-3">画像生成（概算/回）</p>`;
    imageHtml += `<table class="w-full border-collapse"><thead><tr><th class="${thCls} text-left">サイズ</th>`;
    imageModels.forEach(m => { imageHtml += `<th class="${thCls} text-right">${m.name}</th>`; });
    imageHtml += `</tr></thead><tbody>`;
    imageSizes.forEach(size => {
      imageHtml += `<tr><td class="${tdCls} text-gray-600 dark:text-gray-300">${size}</td>`;
      imageModels.forEach(m => {
        const cost = IMAGE_COST_MAP[m.id] ? IMAGE_COST_MAP[m.id][size] : '-';
        imageHtml += `<td class="${tdCls} text-right text-gray-800 dark:text-gray-100">${cost}</td>`;
      });
      imageHtml += `</tr>`;
    });
    imageHtml += `</tbody></table>`;

    elements.costTableContainer.innerHTML = textHtml + imageHtml;
  }

  function toggleApiKeyVisibility() {
    const input = elements.apiKeyInput;
    const icon = elements.apiKeyToggle.querySelector('svg use, svg path');
    if (input.type === 'password') {
      input.type = 'text';
      elements.apiKeyToggle.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`;
    } else {
      input.type = 'password';
      elements.apiKeyToggle.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
    }
  }

  // --- 画像アップロード ---
  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  }

  // 許可するMIMEタイプ
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  function validateImageFile(file) {
    if (!file) return 'ファイルが選択されていません。';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'JPG、PNG、WEBP形式の画像のみ対応しています。';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズは20MB以下にしてください。';
    }
    return null;
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
    const file = e.dataTransfer.files[0];
    const error = validateImageFile(file);
    if (error) {
      if (file) showError(error);
      return;
    }
    processUploadedFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      showError(error);
      e.target.value = '';
      return;
    }
    processUploadedFile(file);
  }

  async function processUploadedFile(file) {
    try {
      showLoading('画像を読み込み中...');
      const imageData = await GeminiAPI.resizeImage(file);

      // プレビュー表示（元画像のみ、マーカーは分析後に表示）
      const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
      elements.previewImage.src = dataUrl;
      if (elements.previewImageClean) elements.previewImageClean.src = dataUrl;
      elements.imagePreview.classList.remove('hidden');
      elements.removeImage.classList.remove('hidden');
      elements.uploadArea.querySelector('.upload-prompt').classList.add('hidden');
      elements.uploadArea.classList.remove('p-12');
      elements.uploadArea.classList.add('p-4');
      // マーカーカラムは非表示、ラベルも非表示（1枚だけなので不要）
      if (elements.markerColumn) elements.markerColumn.classList.add('hidden');

      // 分析セクション表示
      elements.analysisSection.classList.remove('hidden');

      hideLoading();

      // Appに通知
      if (typeof App !== 'undefined') App.onImageUploaded(imageData);
    } catch (err) {
      hideLoading();
      showError('画像の読み込みに失敗しました: ' + err.message);
    }
  }

  function removeUploadedImage(e) {
    e.stopPropagation();
    elements.previewImage.src = '';
    if (elements.previewImageClean) elements.previewImageClean.src = '';
    elements.imagePreview.classList.add('hidden');
    elements.removeImage.classList.add('hidden');
    elements.uploadArea.querySelector('.upload-prompt').classList.remove('hidden');
    elements.uploadArea.classList.remove('p-4');
    elements.uploadArea.classList.add('p-12');
    elements.analysisSection.classList.add('hidden');
    elements.elementsSection.classList.add('hidden');
    elements.editSection.classList.add('hidden');
    elements.resultSection.classList.add('hidden');
    elements.fileInput.value = '';
    // マーカーカラムを再度非表示にする
    if (elements.markerColumn) elements.markerColumn.classList.add('hidden');

    if (typeof App !== 'undefined') App.onImageRemoved();
  }

  // --- 参照画像 ---
  function handleReferenceDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
    const file = e.dataTransfer.files[0];
    const error = validateImageFile(file);
    if (error) {
      if (file) showError(error);
      return;
    }
    processReferenceFile(file);
  }

  function handleReferenceFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      showError(error);
      e.target.value = '';
      return;
    }
    processReferenceFile(file);
  }

  async function processReferenceFile(file) {
    try {
      const imageData = await GeminiAPI.resizeImage(file);
      elements.referencePreview.src = `data:${imageData.mimeType};base64,${imageData.base64}`;
      elements.referencePreview.classList.remove('hidden');
      elements.referenceUploadArea.querySelector('.ref-prompt').classList.add('hidden');
      if (elements.removeReference) elements.removeReference.classList.remove('hidden');

      if (typeof App !== 'undefined') App.onReferenceUploaded(imageData);
    } catch (err) {
      showError('参照画像の読み込みに失敗しました: ' + err.message);
    }
  }

  function removeReferenceImage(e) {
    e.stopPropagation();
    elements.referencePreview.src = '';
    elements.referencePreview.classList.add('hidden');
    elements.referenceUploadArea.querySelector('.ref-prompt').classList.remove('hidden');
    if (elements.removeReference) elements.removeReference.classList.add('hidden');
    elements.referenceFileInput.value = '';

    if (typeof App !== 'undefined') App.onReferenceRemoved();
  }

  function getCustomInstruction() {
    return elements.customInstruction.value.trim();
  }

  // カテゴリヘッダーを生成
  function createCategoryHeader(icon, label) {
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = icon ? `<span class="text-gray-500">${icon}</span> ${escapeHtml(label)}` : escapeHtml(label);
    return header;
  }

  // 同名オブジェクト＋親子関係を自動グループ化
  function computeAutoGroups(objects) {
    // --- Step 1: 同名グループ化（既存ロジック） ---
    const nameMap = {};
    objects.forEach(obj => {
      let key = (obj.name_en || obj.name || '').toLowerCase();
      key = key
        .replace(/\s*\(.*?\)\s*/g, '')      // (left), (右) など括弧内を除去
        .replace(/\s*（.*?）\s*/g, '')       // 全角括弧も除去
        .replace(/\s*[\d]+$/, '')            // 末尾の数字
        .trim();
      if (!key) return;
      if (!nameMap[key]) {
        const cleanName = (obj.name || '').replace(/\s*\(.*?\)\s*/g, '').replace(/\s*（.*?）\s*/g, '').replace(/\s*[\d]+$/, '').trim();
        nameMap[key] = { name: cleanName || obj.name, name_en: key, members: [] };
      }
      nameMap[key].members.push(obj);
    });
    const sameNameGroups = Object.values(nameMap).filter(g => g.members.length >= 2);

    // --- Step 2: 親子関係グループ化（ボトムアップ: 「Xの Y」パターンから親を推定） ---
    const parentChildGroups = [];
    const usedInParentChild = new Set();

    // ボトムアップ: 「Xの Y」パターンの子要素から親キーを抽出してグループ化
    const childPrefixMap = {}; // { prefixKey: [child objects] }
    // 位置・方向を表す短い接頭辞は除外（「左の塔」→「左」は親名ではない）
    const positionalPrefixes = new Set(['左', '右', '上', '下', '中央', '前', '後', '奥', '手前', '大', '小']);
    objects.forEach(obj => {
      const name = (obj.name || '').trim();
      // 日本語: 「Xの Y」パターンからXを抽出（2文字以上かつ位置語でないもの）
      const jaMatch = name.match(/^(.+?)の/);
      if (jaMatch) {
        const prefix = jaMatch[1];
        if (prefix.length >= 2 && !positionalPrefixes.has(prefix)) {
          if (!childPrefixMap[prefix]) childPrefixMap[prefix] = [];
          childPrefixMap[prefix].push(obj);
        }
      }
    });

    // 各接頭辞グループに対して、最適な親（priority 1-2）を探す
    const parentCandidates = objects.filter(obj => obj.priority && obj.priority <= 2);

    Object.entries(childPrefixMap).forEach(([prefix, children]) => {
      if (children.length < 1) return;

      // 親を探す: (1) 名前が接頭辞と完全一致 (2) 名前が接頭辞を含む/含まれる (3) name_enの先頭単語が一致
      let parent = parentCandidates.find(p => {
        const pName = (p.name || '').trim();
        return !usedInParentChild.has(p.id || p.name) && pName === prefix;
      });
      if (!parent) {
        parent = parentCandidates.find(p => {
          const pName = (p.name || '').trim();
          return !usedInParentChild.has(p.id || p.name) && (pName.includes(prefix) || prefix.includes(pName));
        });
      }
      if (!parent) {
        // name_enフォールバック: 子のname_enの先頭単語と親のname_enが一致するか
        const sampleChild = children[0];
        const childEnFirstWord = ((sampleChild.name_en || '').toLowerCase().split(' ')[0] || '').trim();
        if (childEnFirstWord && childEnFirstWord.length >= 3) {
          parent = parentCandidates.find(p => {
            const pNameEn = (p.name_en || '').toLowerCase();
            return !usedInParentChild.has(p.id || p.name) && (pNameEn.includes(childEnFirstWord) || childEnFirstWord.includes(pNameEn));
          });
        }
      }

      if (parent) {
        const parentId = parent.id || parent.name;
        const filteredChildren = children.filter(c => c !== parent);
        if (filteredChildren.length < 1) return;

        const allMembers = [parent, ...filteredChildren];
        parentChildGroups.push({
          name: (parent.name || '').trim(),
          name_en: (parent.name_en || '').toLowerCase().trim(),
          members: allMembers,
          isParentChild: true
        });
        allMembers.forEach(m => usedInParentChild.add(m.id || m.name));
      } else if (children.length >= 2) {
        // 親が見つからないが子が2つ以上ある場合、子だけでグループ化
        const allUsed = children.some(c => usedInParentChild.has(c.id || c.name));
        if (!allUsed) {
          parentChildGroups.push({
            name: prefix,
            name_en: prefix,
            members: children,
            isParentChild: true
          });
          children.forEach(m => usedInParentChild.add(m.id || m.name));
        }
      }
    });

    // --- Step 3: 統合（重複排除） ---
    // 親子グループに含まれるメンバーが同名グループにもいる場合、親子グループを優先
    const result = [...parentChildGroups];
    sameNameGroups.forEach(sg => {
      // 同名グループのメンバーが全て親子グループに含まれていたらスキップ
      const allCovered = sg.members.every(m => usedInParentChild.has(m.id || m.name));
      if (!allCovered) {
        // 親子グループに含まれていないメンバーだけ残す
        const remaining = sg.members.filter(m => !usedInParentChild.has(m.id || m.name));
        if (remaining.length >= 2) {
          result.push({ ...sg, members: remaining });
        }
      }
    });

    return result;
  }

  // priority値に基づいてフィルタリング（priorityがない要素はレベル2として扱う）
  function filterByPriority(arr) {
    if (!arr) return [];
    return arr.filter(item => (item.priority || 2) <= currentDetailLevel);
  }

  // --- 要素カード表示 ---
  function renderElements(json) {
    // 元のJSONを保持（粒度変更時に再描画するため）
    currentRenderJson = json;

    elements.elementsSection.classList.remove('hidden');
    elements.elementsList.innerHTML = '';

    // 粒度フィルタリング
    const filteredObjects = filterByPriority(json.objects);
    const filteredPeople = filterByPriority(json.people);
    const filteredTextElements = filterByPriority(json.text_elements);
    const filteredRegions = filterByPriority(json.regions);

    // マーカーインデックスカウンター（objects→text_elements→peopleの順）
    let markerIndex = 1;

    // 個別要素のカードを先に生成（markerIndex割り当て）し、後でDOMに追加
    const individualCards = document.createDocumentFragment();
    filteredObjects.forEach((obj) => {
      const origIndex = json.objects.indexOf(obj);
      const card = createElementCard({
        id: obj.id || `obj_${origIndex}`,
        type: 'object',
        name: obj.name || obj.name_en,
        data: obj,
        markerIndex: markerIndex,
      });
      individualCards.appendChild(card);
      markerIndex++;
    });
    filteredTextElements.forEach((te) => {
      const origIndex = json.text_elements.indexOf(te);
      const card = createElementCard({
        id: te.id || `text_${origIndex}`,
        type: 'text',
        name: te.content || 'テキスト',
        data: te,
        markerIndex: markerIndex,
      });
      individualCards.appendChild(card);
      markerIndex++;
    });
    filteredPeople.forEach((p, i) => {
      const origIndex = json.people.indexOf(p);
      const card = createElementCard({
        id: p.id || `person_${origIndex}`,
        type: 'person',
        name: p.description || `人物 ${i + 1}`,
        data: p,
        markerIndex: markerIndex,
      });
      individualCards.appendChild(card);
      markerIndex++;
    });

    // グループ（同種オブジェクト・リージョン・環境設定を統合）— 先に表示
    {
      const groupItems = [];

      // 同種要素の自動グループ化（オブジェクト＋人物を統合して処理）
      {
        // 人物にnameプロパティを付与して統一（computeAutoGroupsはname/name_enを使う）
        const peopleWithName = filteredPeople.map(p => ({ ...p, _srcType: 'person', name: p.name || p.description, name_en: p.name_en || '' }));
        const objectsWithSrc = filteredObjects.map(o => ({ ...o, _srcType: 'object' }));
        const combined = [...objectsWithSrc, ...peopleWithName];

        if (combined.length > 0) {
          const groups = computeAutoGroups(combined);
          groups.forEach((group, i) => {
            const memberIds = group.members.map(member => {
              if (member._srcType === 'person') {
                const orig = filteredPeople.find(p => p.id === member.id || p.description === member.description);
                return member.id || `person_${json.people.indexOf(orig)}`;
              }
              const orig = filteredObjects.find(o => o.id === member.id || (o.name === member.name && o.name_en === member.name_en));
              return member.id || `obj_${json.objects.indexOf(orig)}`;
            });
            groupItems.push({ id: `group_${i}`, type: 'group', name: `${group.name}（${group.members.length}個）`, data: { ...group, members: group.members, memberIds }, cardClass: 'group-card' });
          });
        }
      }

      // リージョン（フィルタ済み・マーカー番号付き）
      if (filteredRegions.length > 0) {
        filteredRegions.forEach((region, i) => {
          const origIndex = json.regions.indexOf(region);
          groupItems.push({ id: region.id || `region_${origIndex}`, type: 'region', name: region.name || region.name_en, data: region, cardClass: 'region-card', markerIndex: markerIndex });
          markerIndex++;
        });
      }

      // カメラ・構図
      if (json.camera) {
        groupItems.push({ id: 'camera', type: 'camera', name: 'カメラ β', data: json.camera });
      }

      // 全体・雰囲気（統合）
      groupItems.push({ id: 'global', type: 'global', name: '全体', data: json });

      if (groupItems.length > 0) {
        elements.elementsList.appendChild(createCategoryHeader('', `グループ (${groupItems.length})`));
        groupItems.forEach(item => {
          if (item.type === 'group') {
            const card = document.createElement('button');
            card.className = 'element-card group-card relative dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 flex flex-col items-start gap-0.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-0';
            card.dataset.elementId = item.id;
            card.innerHTML = `<span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(item.name)}</span>`;
            card.addEventListener('click', () => selectElement(item));
            card.addEventListener('mouseenter', () => {
              item.data.members.forEach(member => {
                const memberId = member.id || `obj_${json.objects.indexOf(member)}`;
                const marker = document.querySelector(`.image-marker[data-element-id="${memberId}"]`);
                if (marker) marker.classList.add('active');
              });
            });
            card.addEventListener('mouseleave', () => {
              item.data.members.forEach(member => {
                const memberId = member.id || `obj_${json.objects.indexOf(member)}`;
                const marker = document.querySelector(`.image-marker[data-element-id="${memberId}"]`);
                if (marker) marker.classList.remove('active');
              });
            });
            elements.elementsList.appendChild(card);
          } else if (item.type === 'global') {
            const globalBtn = document.createElement('button');
            globalBtn.className = 'element-card border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 flex flex-col items-start gap-0.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-0';
            globalBtn.dataset.elementId = 'global';
            globalBtn.innerHTML = `<span class="text-sm text-gray-600 dark:text-gray-300 font-medium">全体</span>`;
            globalBtn.addEventListener('click', () => selectElement(item));
            elements.elementsList.appendChild(globalBtn);
          } else if (item.cardClass === 'region-card') {
            const card = document.createElement('button');
            card.className = 'element-card region-card relative dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 flex flex-col items-start gap-0.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-0';
            card.dataset.elementId = item.id;
            const markerBadge = item.markerIndex ? `<span class="element-badge-inline region-badge">${item.markerIndex}</span>` : '';
            card.innerHTML = `<span class="inline-flex items-center gap-1.5">${markerBadge}<span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(item.name)}</span></span>`;
            card.addEventListener('click', () => selectElement(item));
            card.addEventListener('mouseenter', () => {
              const marker = document.querySelector(`.image-marker[data-element-id="${item.id}"]`);
              if (marker) marker.classList.add('active');
            });
            card.addEventListener('mouseleave', () => {
              const marker = document.querySelector(`.image-marker[data-element-id="${item.id}"]`);
              if (marker) marker.classList.remove('active');
            });
            elements.elementsList.appendChild(card);
          } else {
            const card = createElementCard({ id: item.id, type: item.type, name: item.name, data: item.data });
            elements.elementsList.appendChild(card);
          }
        });
      }
    }

    // 個別要素を後に表示（グループの下）
    const individualCount = filteredObjects.length + filteredTextElements.length + filteredPeople.length;
    if (individualCount > 0) {
      elements.elementsList.appendChild(createCategoryHeader('', `個別 (${individualCount})`));
      elements.elementsList.appendChild(individualCards);
    }

    // 画像上にマーカーを描画 & マーカーカラム表示
    renderMarkers(json);
    if (elements.markerColumn) elements.markerColumn.classList.remove('hidden');

    // スクロールヒント表示制御
    updateScrollHint();
    elements.elementsList.removeEventListener('scroll', updateScrollHint);
    elements.elementsList.addEventListener('scroll', updateScrollHint);
  }

  function updateScrollHint() {
    const list = elements.elementsList;
    const hint = document.getElementById('scrollHint');
    if (!list || !hint) return;
    const hasOverflow = list.scrollHeight > list.clientHeight;
    const isNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 20;
    hint.classList.toggle('opacity-0', !hasOverflow || isNearBottom);
    hint.classList.toggle('opacity-100', hasOverflow && !isNearBottom);
  }

  function createElementCard({ id, type, name, subtitle, data, markerIndex }) {
    const card = document.createElement('button');
    card.className = 'element-card relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 flex flex-col items-start gap-0.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-0';
    card.dataset.elementId = id;
    card.dataset.elementName = name;

    // position_coords がある場合のみバッジを表示
    const hasBadge = markerIndex && data.position_coords;

    // 編集可能な要素タイプか判定（atmosphere, camera, global以外）
    const isEditable = ['object', 'text', 'person'].includes(type);

    const subtitleHtml = subtitle ? `<span class="text-xs text-gray-500 dark:text-gray-400 leading-tight">${escapeHtml(subtitle)}</span>` : '';
    if (hasBadge) {
      card.innerHTML = `
        <span class="inline-flex items-center gap-1.5">
          <span class="element-badge-inline">${markerIndex}</span>
          <span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(name)}</span>
        </span>
        ${subtitleHtml}
      `;
    } else {
      card.innerHTML = `
        <span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(name)}</span>
        ${subtitleHtml}
      `;
    }

    // ホバー時に画像上のマーカーと連動
    card.addEventListener('mouseenter', () => {
      const marker = document.querySelector(`.image-marker[data-element-id="${id}"]`);
      if (marker) marker.classList.add('active');
    });
    card.addEventListener('mouseleave', () => {
      const marker = document.querySelector(`.image-marker[data-element-id="${id}"]`);
      if (marker) marker.classList.remove('active');
    });

    // シングルクリック（選択）とダブルクリック（名前編集）を区別
    if (isEditable) {
      let clickTimer = null;
      card.addEventListener('click', (e) => {
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return; }
        clickTimer = setTimeout(() => {
          clickTimer = null;
          selectElement({ id, type, name: card.dataset.elementName, data });
        }, 250);
      });
      card.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        startNameEdit(card, id, type, card.dataset.elementName, data);
      });
    } else {
      card.addEventListener('click', () => selectElement({ id, type, name: card.dataset.elementName, data }));
    }

    return card;
  }

  // 要素名のインライン編集
  function startNameEdit(card, id, type, currentName, data) {
    const nameSpan = card.querySelector('.element-name');
    if (!nameSpan || nameSpan.querySelector('input')) return; // 既に編集中

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'w-full px-1 py-0.5 text-sm border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100';
    input.style.minWidth = '60px';

    const originalText = nameSpan.textContent;
    nameSpan.textContent = '';
    nameSpan.appendChild(input);
    input.focus();
    input.select();

    const finishEdit = () => {
      const newName = input.value.trim() || originalText;
      nameSpan.textContent = newName;
      card.dataset.elementName = newName;

      // currentJsonの対応する要素名を更新
      if (typeof App !== 'undefined' && App.getState) {
        const state = App.getState();
        if (state.currentJson) {
          updateElementName(state.currentJson, id, type, newName);
        }
      }

      // selectedElementsの名前も更新
      const sel = selectedElements.find(el => el.id === id);
      if (sel) {
        sel.name = newName;
      }
      // STEP3が表示されている場合は常に再描画
      if (selectedElements.length > 0) {
        renderEditInstructions();
      }
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = originalText; input.blur(); }
    });
    // クリックイベントの伝播を防止
    input.addEventListener('click', (e) => e.stopPropagation());
  }

  // JSON内の要素名を更新
  function updateElementName(json, id, type, newName) {
    if (type === 'object' && json.objects) {
      const match = json.objects.find((obj, i) => (obj.id || `obj_${i}`) === id);
      if (match) { match.name = newName; if (match.name_en) match.name_en = newName; }
    } else if (type === 'text' && json.text_elements) {
      const match = json.text_elements.find((te, i) => (te.id || `text_${i}`) === id);
      if (match) match.content = newName;
    } else if (type === 'person' && json.people) {
      const match = json.people.find((p, i) => (p.id || `person_${i}`) === id);
      if (match) match.description = newName;
    } else if (type === 'region' && json.regions) {
      const match = json.regions.find((r, i) => (r.id || `region_${i}`) === id);
      if (match) { match.name = newName; if (match.name_en) match.name_en = newName; }
    }
  }

  // JSON内のオブジェクト・テキスト・人物を統一リストに展開（粒度フィルタ適用）
  function flattenElements(json) {
    const list = [];
    let markerIndex = 1;
    if (json.objects) {
      json.objects.forEach((obj, i) => {
        if ((obj.priority || 2) <= currentDetailLevel) {
          list.push({ item: obj, type: 'object', id: obj.id || `obj_${i}`, markerIndex: markerIndex++ });
        }
      });
    }
    if (json.text_elements) {
      json.text_elements.forEach((te, i) => {
        if ((te.priority || 2) <= currentDetailLevel) {
          list.push({ item: te, type: 'text', id: te.id || `text_${i}`, markerIndex: markerIndex++ });
        }
      });
    }
    if (json.people) {
      json.people.forEach((p, i) => {
        if ((p.priority || 2) <= currentDetailLevel) {
          list.push({ item: p, type: 'person', id: p.id || `person_${i}`, markerIndex: markerIndex++ });
        }
      });
    }
    if (json.regions) {
      json.regions.forEach((r, i) => {
        if ((r.priority || 5) <= currentDetailLevel) {
          list.push({ item: r, type: 'region', id: r.id || `region_${i}`, markerIndex: markerIndex++ });
        }
      });
    }
    return list;
  }

  // 画像上にマーカーを描画する
  function renderMarkers(json) {
    const overlay = document.getElementById('markerOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    const allElements = flattenElements(json)
      .filter(({ item }) => item.position_coords)
      .map(({ item, id, markerIndex, type }) => {
        // 要素名を取得
        let name = '';
        if (type === 'object') name = item.name || item.name_en || '';
        else if (type === 'text') name = item.content || '';
        else if (type === 'person') name = item.description || '';
        else if (type === 'region') name = item.name || item.name_en || '';
        return { index: markerIndex, coords: item.position_coords, id, type, name };
      });

    // マーカーDOM生成
    allElements.forEach(({ index, coords, id, type, name }) => {
      const marker = document.createElement('div');
      marker.className = type === 'region' ? 'image-marker region-marker' : 'image-marker';
      marker.dataset.markerIndex = index;
      marker.dataset.elementId = id;
      marker.style.left = `${coords.x * 100}%`;
      marker.style.top = `${coords.y * 100}%`;
      marker.textContent = index;
      if (name) marker.title = name;

      // ホバーでカード連動
      marker.addEventListener('mouseenter', () => highlightCard(id));
      marker.addEventListener('mouseleave', () => unhighlightCard(id));
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        // 対応するカードのクリックをシミュレート
        const card = document.querySelector(`.element-card[data-element-id="${id}"]`);
        if (card) card.click();
      });

      overlay.appendChild(marker);
    });
  }

  function highlightCard(elementId) {
    const card = document.querySelector(`.element-card[data-element-id="${elementId}"]`);
    if (card) card.classList.add('highlighted');
    const marker = document.querySelector(`.image-marker[data-element-id="${elementId}"]`);
    if (marker) marker.classList.add('active');
  }

  function unhighlightCard(elementId) {
    const card = document.querySelector(`.element-card[data-element-id="${elementId}"]`);
    if (card) card.classList.remove('highlighted');
    const marker = document.querySelector(`.image-marker[data-element-id="${elementId}"]`);
    if (marker) marker.classList.remove('active');
  }

  function selectElement({ id, type, name, data }) {
    const existingIndex = selectedElements.findIndex(el => el.id === id);

    if (existingIndex >= 0) {
      // 既に選択されている場合 → 選択解除
      const removedEl = selectedElements[existingIndex];
      selectedElements.splice(existingIndex, 1);
      const card = elements.elementsList.querySelector(`[data-element-id="${id}"]`);
      if (card) {
        card.classList.remove('border-blue-500', 'ring-2', 'ring-blue-200');
        card.classList.add('border-gray-200', 'dark:border-gray-700');
      }
      const marker = document.querySelector(`.image-marker[data-element-id="${id}"]`);
      if (marker) marker.classList.remove('selected');
      // グループの場合、メンバーも選択解除
      if (type === 'group' && data && data.memberIds) {
        data.memberIds.forEach((memberId, idx) => {
          const mi = selectedElements.findIndex(el => el.id === memberId);
          if (mi >= 0) selectedElements.splice(mi, 1);
          const memberCard = elements.elementsList.querySelector(`[data-element-id="${memberId}"]`);
          if (memberCard) {
            memberCard.classList.remove('border-blue-500', 'ring-2', 'ring-blue-200');
            memberCard.classList.add('border-gray-200', 'dark:border-gray-700');
          }
          const m = document.querySelector(`.image-marker[data-element-id="${memberId}"]`);
          if (m) m.classList.remove('selected');
        });
      }
    } else {
      // 新たに選択
      selectedElements.push({ id, type, name, data });
      const card = elements.elementsList.querySelector(`[data-element-id="${id}"]`);
      if (card) {
        card.classList.remove('border-gray-200', 'dark:border-gray-700', 'border-gray-300');
        card.classList.add('border-blue-500', 'ring-2', 'ring-blue-200');
      }
      const marker = document.querySelector(`.image-marker[data-element-id="${id}"]`);
      if (marker) marker.classList.add('selected');
      // グループの場合、メンバーも個別に選択
      if (type === 'group' && data && data.members && data.memberIds) {
        data.members.forEach((member, idx) => {
          const memberId = data.memberIds[idx];
          if (selectedElements.some(el => el.id === memberId)) return;
          selectedElements.push({ id: memberId, type: 'object', name: member.name || member.name_en, data: member });
          const memberCard = elements.elementsList.querySelector(`[data-element-id="${memberId}"]`);
          if (memberCard) {
            memberCard.classList.remove('border-gray-200', 'dark:border-gray-700', 'border-gray-300');
            memberCard.classList.add('border-blue-500', 'ring-2', 'ring-blue-200');
          }
          const m = document.querySelector(`.image-marker[data-element-id="${memberId}"]`);
          if (m) m.classList.add('selected');
        });
      }
    }

    // 選択数カウンター更新
    updateSelectionCounter();

    // 編集パネルの表示更新
    if (selectedElements.length > 0) {
      elements.editSection.classList.remove('hidden');
      renderEditInstructions();
    } else {
      elements.editSection.classList.add('hidden');
    }

    // Appに通知
    if (typeof App !== 'undefined') App.onElementsSelected([...selectedElements]);
  }

  // 選択中の各要素の指示入力欄を描画
  function renderEditInstructions() {
    const container = elements.editInstructionsList;
    // 既存の入力値を保存
    const savedValues = {};
    container.querySelectorAll('[data-instruction-for]').forEach(row => {
      const textarea = row.querySelector('textarea');
      if (textarea) savedValues[row.dataset.instructionFor] = textarea.value;
    });

    container.innerHTML = '';

    // グループメンバーはスキップ（グループの指示欄のみ表示）
    const visibleElements = selectedElements.filter(el =>
      !selectedElements.some(g => g.type === 'group' && g.data && g.data.memberIds && g.data.memberIds.includes(el.id))
    );

    visibleElements.forEach((el, i) => {
      const row = document.createElement('div');
      row.className = 'edit-instruction-row py-3 space-y-2';
      row.dataset.instructionFor = el.id;

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      const typeLabels = {
        group: { text: 'グループ', bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
        region: { text: 'リージョン', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
      };
      const labelInfo = typeLabels[el.type];
      const groupTag = labelInfo ? `<span class="px-1.5 py-0.5 text-[10px] font-bold ${labelInfo.bg} ${labelInfo.color} rounded">${labelInfo.text}</span>` : '';
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm text-blue-600">${escapeHtml(el.name)}</span>
          ${groupTag}
        </div>
        <button class="remove-instruction text-gray-400 dark:text-gray-400 hover:text-red-500 text-lg leading-none" data-remove-id="${el.id}">&times;</button>
      `;

      row.appendChild(header);

      if (el.type === 'camera' && typeof CameraEditor !== 'undefined') {
        // カメラ要素: ビジュアルエディタを描画
        const editorContainer = document.createElement('div');
        editorContainer.className = 'camera-editor-container space-y-3';
        editorContainer.dataset.elementId = el.id;
        row.appendChild(editorContainer);
        container.appendChild(row);

        // カメラエディタを描画（DOMに追加後に実行）
        setTimeout(() => CameraEditor.render(editorContainer, el.data), 0);
      } else {
        // プリセット対象タイプならプリセットボタンを追加
        const presetTypes = ['global'];
        if (presetTypes.includes(el.type)) {
          const presetBtn = document.createElement('button');
          presetBtn.type = 'button';
          presetBtn.className = 'preset-toggle-btn px-2.5 py-1 text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-300 transition-all flex items-center gap-1 cursor-pointer';
          presetBtn.innerHTML = '<svg class="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>プリセット';
          presetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = row.querySelector('.preset-popup');
            if (isOpen) {
              isOpen.remove();
              presetBtn.querySelector('svg').style.transform = '';
              presetBtn.classList.remove('bg-blue-50', 'text-blue-500', 'border-blue-300', 'dark:bg-blue-900/20', 'dark:text-blue-400', 'dark:border-blue-600');
            } else {
              document.querySelectorAll('.preset-popup').forEach(p => {
                p.remove();
                const otherBtn = p.closest('.edit-instruction-row')?.querySelector('.preset-toggle-btn');
                if (otherBtn) {
                  otherBtn.querySelector('svg').style.transform = '';
                  otherBtn.classList.remove('bg-blue-50', 'text-blue-500', 'border-blue-300', 'dark:bg-blue-900/20', 'dark:text-blue-400', 'dark:border-blue-600');
                }
              });
              togglePresetPopup(row, el.id);
              presetBtn.querySelector('svg').style.transform = 'rotate(180deg)';
              presetBtn.classList.add('bg-blue-50', 'text-blue-500', 'border-blue-300', 'dark:bg-blue-900/20', 'dark:text-blue-400', 'dark:border-blue-600');
            }
          });
          header.querySelector('.flex.items-center.gap-2').appendChild(presetBtn);
        }

        // 通常: テキストエリア
        const textarea = document.createElement('textarea');
        textarea.rows = 1;
        textarea.className = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none overflow-hidden';
        textarea.placeholder = getPlaceholder(el.type);
        textarea.dataset.elementId = el.id;
        if (savedValues[el.id]) textarea.value = savedValues[el.id];
        // 自動拡張
        const autoResize = () => { textarea.style.height = 'auto'; textarea.style.height = textarea.scrollHeight + 'px'; };
        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('focus', autoResize);
        if (savedValues[el.id]) setTimeout(autoResize, 0);
        row.appendChild(textarea);
        container.appendChild(row);

        // 最後に追加された要素にフォーカス
        if (i === visibleElements.length - 1 && !savedValues[el.id]) {
          setTimeout(() => textarea.focus({ preventScroll: true }), 50);
        }
      }

      // 削除ボタン
      header.querySelector('.remove-instruction').addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement({ id: el.id, type: el.type, name: el.name, data: el.data });
      });
    });
  }

  // 選択数カウンターを更新
  function updateSelectionCounter() {
    const header = elements.elementsSection.querySelector('h2');
    if (!header) return;
    // 既存のバッジを削除
    const existing = header.querySelector('.selection-badge');
    if (existing) existing.remove();
    if (selectedElements.length > 0) {
      const badge = document.createElement('span');
      badge.className = 'selection-badge ml-2 px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full';
      badge.textContent = `${selectedElements.length}件選択中`;
      header.appendChild(badge);
    }
  }

  // 全選択をクリア（画像削除時等）
  function clearSelectedElements() {
    selectedElements = [];
    document.querySelectorAll('.image-marker.selected').forEach(m => m.classList.remove('selected'));
    updateSelectionCounter();
  }

  function getPlaceholder(type) {
    const placeholders = {
      object: '例: 青いベルベット素材に変更 / モダンなデザインに入替 / 削除する',
      text: '例: テキストを「Hello World」に変更 / フォントをゴシック体に',
      person: '例: 赤いジャケットに変更 / ポーズを変える',
      camera: '例: 魚眼レンズで撮影したように / もっと引きの構図に',
      scene: '例: ミニマリストスタイルに / 北欧風のインテリアに',
      global: '例: アニメ風にする / 季節を冬に変更 / ゴールデンアワーの照明に',
      group: '例: 全ての雲を消す / すべて白い雲に変更',
      region: '例: 青空をオレンジの夕焼けに / 地面を雪景色に',
    };
    return placeholders[type] || '変更内容を入力してください';
  }

  // --- 結果表示 ---
  function showResult(imageData, originalImageData = null) {
    elements.resultSection.classList.remove('hidden');
    elements.resultGrid.classList.add('hidden');
    elements.compareContainer.classList.remove('hidden');
    elements.resultImage.src = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Before/After比較用データ設定（カスタムBefore設定時はそちらを優先）
    if (customBeforeEntryId != null && beforeImageData) {
      hasBeforeImage = true;
    } else if (originalImageData) {
      beforeImageData = originalImageData;
      hasBeforeImage = true;
      elements.compareBeforeImg.src = `data:${originalImageData.mimeType};base64,${originalImageData.base64}`;
    } else {
      hasBeforeImage = false;
    }

    // スライダーを初期状態にリセット（Before非表示）
    elements.compareContainer.classList.remove('compare-active');
    updateSliderPosition(0);

    // hidden解除後にスクロール（requestAnimationFrameで確実に描画後）
    requestAnimationFrame(() => {
      elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Before画像がある場合、スライダーの存在をアニメーションで示唆
    if (hasBeforeImage) {
      setTimeout(() => {
        activateCompare();
        setTimeout(() => deactivateCompare(), 1000);
      }, 500);
    }

    // ダウンロードボタンを表示
    showDownloadButton(imageData);
  }

  // 履歴復元用の結果表示（グリッド・選択状態に触れない）
  function showResultFromHistory(imageData, beforeImage) {
    elements.resultSection.classList.remove('hidden');
    // 候補グリッドを非表示にする（候補付きエントリはshowMultiResultで表示）
    elements.resultGrid.classList.add('hidden');
    elements.compareContainer.classList.remove('hidden');

    // compareContainerのAfter画像を更新
    elements.resultImage.src = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Before/After比較用データ設定（カスタムBefore設定時はそちらを優先）
    if (customBeforeEntryId != null && beforeImageData) {
      // カスタムBefore維持（beforeImageDataは既にセット済み）
      hasBeforeImage = true;
      elements.compareContainer.classList.remove('hidden');
    } else if (beforeImage) {
      beforeImageData = beforeImage;
      hasBeforeImage = true;
      elements.compareBeforeImg.src = `data:${beforeImage.mimeType};base64,${beforeImage.base64}`;
      elements.compareContainer.classList.remove('hidden');
    } else {
      hasBeforeImage = false;
    }

    // スライダーを初期状態にリセット
    elements.compareContainer.classList.remove('compare-active');
    updateSliderPosition(0);

    // Before画像がある場合、スライダーの存在をアニメーションで示唆
    if (hasBeforeImage) {
      setTimeout(() => {
        activateCompare();
        setTimeout(() => deactivateCompare(), 1000);
      }, 500);
    }

    // ダウンロードボタンを表示
    showDownloadButton(imageData);
  }

  // ダウンロードボタン表示ヘルパー
  function showDownloadButton(imageData) {
    if (!elements.adoptDownloadBtn) return;
    elements.adoptDownloadBtn.classList.remove('hidden');
    const newDlBtn = elements.adoptDownloadBtn.cloneNode(true);
    elements.adoptDownloadBtn.replaceWith(newDlBtn);
    elements.adoptDownloadBtn = newDlBtn;
    newDlBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = `data:${imageData.mimeType};base64,${imageData.base64}`;
      link.download = `generated_image.${imageData.mimeType === 'image/png' ? 'png' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // --- Before/After比較（ホバー式スライダー） ---
  function syncCompareImages() {
    // Before/After両方ともobject-fit: containで親要素に合わせるため、
    // Before画像は親(.compare-before)のサイズに自動追従する
    // 追加のサイズ指定は不要
  }

  function updateSliderPosition(ratio) {
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    elements.compareBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    elements.compareSlider.style.left = pct + '%';
  }

  function activateCompare() {
    if (!hasBeforeImage) return;
    elements.compareContainer.classList.add('compare-active');
    syncCompareImages();
    updateSliderPosition(0.5);
  }

  function deactivateCompare() {
    // compare-activeを外す前にtransitionを無効化してclip-pathを即座にリセット
    elements.compareBefore.style.transition = 'none';
    updateSliderPosition(0);
    elements.compareContainer.classList.remove('compare-active');
    // 次フレームでインラインtransitionを除去しCSS定義に戻す
    requestAnimationFrame(() => {
      elements.compareBefore.style.transition = '';
    });
  }

  // Before画像を任意の履歴エントリに切り替え（同じエントリを再クリックで解除）
  function setBeforeFromEntry(entry) {
    if (!entry || !entry.image) return;

    // 同じエントリをクリック → カスタムBeforeを解除してデフォルトに戻す
    if (customBeforeEntryId === entry.id) {
      customBeforeEntryId = null;
      // デフォルトのBefore（親エントリ）に戻す
      const currentEntry = EditHistory.getAll()[EditHistory.getCurrentIndex()];
      if (currentEntry && currentEntry.parentId != null) {
        const parentEntry = EditHistory.getAll().find(e => e.id === currentEntry.parentId);
        if (parentEntry && parentEntry.image) {
          beforeImageData = parentEntry.image;
          hasBeforeImage = true;
          elements.compareBeforeImg.src = `data:${parentEntry.image.mimeType};base64,${parentEntry.image.base64}`;
        }
      }
      const allEntries = EditHistory.getAll();
      const idx = EditHistory.getCurrentIndex();
      renderHistory(allEntries, idx);
      return;
    }

    customBeforeEntryId = entry.id;
    beforeImageData = entry.image;
    hasBeforeImage = true;
    elements.compareBeforeImg.src = `data:${entry.image.mimeType};base64,${entry.image.base64}`;
    // スライダーの存在をアニメーションで示唆
    activateCompare();
    setTimeout(() => deactivateCompare(), 1000);
    // 履歴再描画でバッジを更新
    const allEntries = EditHistory.getAll();
    const idx = EditHistory.getCurrentIndex();
    renderHistory(allEntries, idx);
  }

  function setupCompareSlider() {
    let isDragging = false;

    // 画像の実際の描画領域を取得（object-fit: containの余白を除く）
    function getImageRect() {
      const img = elements.resultImage;
      const containerRect = img.getBoundingClientRect();
      const naturalW = img.naturalWidth || 1;
      const naturalH = img.naturalHeight || 1;
      const scale = Math.min(containerRect.width / naturalW, containerRect.height / naturalH);
      const renderedW = naturalW * scale;
      const renderedH = naturalH * scale;
      const offsetX = (containerRect.width - renderedW) / 2;
      const offsetY = (containerRect.height - renderedH) / 2;
      return {
        left: containerRect.left + offsetX,
        top: containerRect.top + offsetY,
        width: renderedW,
        height: renderedH,
      };
    }

    function isInsideImage(e) {
      const rect = getImageRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      return clientX >= rect.left && clientX <= rect.left + rect.width
          && clientY >= rect.top && clientY <= rect.top + rect.height;
    }

    function getSliderRatio(e) {
      const rect = getImageRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    }

    function onStart(e) {
      if (!hasBeforeImage) return;
      isDragging = true;
      activateCompare();
      e.preventDefault();
      updateSliderPosition(getSliderRatio(e));
      // ドラッグ開始時のみdocumentにリスナー登録（パフォーマンス最適化）
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      updateSliderPosition(getSliderRatio(e));
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      deactivateCompare();
      // ドラッグ終了時にdocumentのリスナーを解除
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }

    // マウスホバーでスライダー表示（画像の実描画領域のみ反応）
    elements.compareContainer.addEventListener('mouseenter', (e) => {
      if (!hasBeforeImage) return;
      if (isInsideImage(e)) activateCompare();
    });
    elements.compareContainer.addEventListener('mousemove', (e) => {
      if (!hasBeforeImage || isDragging) return;
      const inside = isInsideImage(e);
      if (inside && !elements.compareContainer.classList.contains('compare-active')) {
        activateCompare();
      } else if (!inside && elements.compareContainer.classList.contains('compare-active')) {
        deactivateCompare();
      }
    });
    elements.compareContainer.addEventListener('mouseleave', () => {
      if (isDragging) return; // ドラッグ中は閉じない
      deactivateCompare();
    });

    // マウスドラッグ（documentリスナーはonStartで登録）
    elements.compareSlider.addEventListener('mousedown', onStart);
    elements.compareContainer.addEventListener('mousedown', (e) => {
      if (!isInsideImage(e)) return;
      onStart(e);
    });

    // タッチ操作（documentリスナーはonStartで登録）
    elements.compareSlider.addEventListener('touchstart', onStart, { passive: false });
    elements.compareContainer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = getImageRect();
      const inside = touch.clientX >= rect.left && touch.clientX <= rect.left + rect.width
                  && touch.clientY >= rect.top && touch.clientY <= rect.top + rect.height;
      if (!inside) return;
      onStart(e);
    }, { passive: false });
  }

  // --- 履歴タイムライン（縦型サイドバー） ---
  function renderHistory(entries, currentIndex) {
    elements.historySidebar.classList.remove('hidden');
    elements.historyTimeline.innerHTML = '';

    // スマホ横スクロール履歴バーも同期表示
    if (elements.historyMobile && elements.historyTimelineMobile) {
      elements.historyMobile.classList.remove('hidden');
      elements.historyTimelineMobile.innerHTML = '';
      entries.forEach((entry, i) => {
        const isCurrent = i === currentIndex;
        const isBefore = entry.id === customBeforeEntryId;
        const thumbUrl = EditHistory.getThumbnailUrl(entry);
        const item = document.createElement('div');
        item.className = `history-mobile-item flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer transition-all ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`;
        item.innerHTML = `
          <div class="relative w-full aspect-[3/2] rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 ${isBefore ? 'ring-2 ring-yellow-500' : ''}">
            ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-full object-cover" alt="v${i}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-[9px]">No img</div>'}
            ${isCurrent ? '<span class="absolute top-0.5 left-0.5 px-0.5 py-0 text-[7px] font-bold bg-blue-500 text-white rounded leading-tight">編集中</span>' : ''}
            ${isBefore ? '<span class="absolute bottom-0.5 left-0.5 px-0.5 py-0 text-[7px] font-bold bg-yellow-500 text-white rounded leading-tight">Before</span>' : ''}
          </div>
          <span class="text-[9px] font-medium text-gray-600 dark:text-gray-300 text-center leading-tight line-clamp-1 w-full">${escapeHtml(entry.label)}</span>
        `;

        // タップ→履歴切り替え、長押し→アクションメニュー
        let pressTimer = null;
        let didLongPress = false;
        item.addEventListener('touchstart', (e) => {
          didLongPress = false;
          pressTimer = setTimeout(() => {
            didLongPress = true;
            showMobileHistoryMenu(entry, i, item);
          }, 500);
        }, { passive: true });
        item.addEventListener('touchend', () => {
          clearTimeout(pressTimer);
          if (!didLongPress) {
            if (typeof App !== 'undefined') App.goToHistory(i);
          }
        });
        item.addEventListener('touchmove', () => { clearTimeout(pressTimer); }, { passive: true });
        // PC用クリック（モバイル横スクロールバーがPC幅でも表示される場合）
        item.addEventListener('click', (e) => {
          if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
          if (typeof App !== 'undefined') App.goToHistory(i);
        });

        elements.historyTimelineMobile.appendChild(item);
      });

      // ヒントテキスト（初回のみ表示）
      if (entries.length > 1 && !elements.historyTimelineMobile.querySelector('.mobile-history-hint')) {
        const hint = document.createElement('p');
        hint.className = 'mobile-history-hint text-[9px] text-gray-400 dark:text-gray-500 mt-1';
        hint.textContent = '長押しでメニュー表示';
        elements.historyMobile.appendChild(hint);
      }
    }

    entries.forEach((entry, i) => {
      const item = document.createElement('div');
      const isCurrent = i === currentIndex;
      item.className = `group flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

      const thumbUrl = EditHistory.getThumbnailUrl(entry);
      const isBefore = entry.id === customBeforeEntryId;
      item.innerHTML = `
        <div class="relative w-full aspect-[3/2]">
          <button class="history-del-btn absolute z-20 rounded-full bg-gray-400/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!bg-red-500 transition-all" style="width:18px;height:18px;top:-9px;right:-9px" title="削除">
            <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div class="relative w-full h-full rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 history-thumb ${isCurrent ? 'ring-2 ring-blue-500' : ''} ${isBefore ? 'ring-2 ring-yellow-500' : ''}">
            ${isCurrent ? '<span class="absolute top-0.5 left-0.5 z-10 px-1 py-0.5 text-[8px] font-bold bg-blue-500 text-white rounded">編集中</span>' : ''}
            ${isBefore ? '<span class="absolute bottom-0.5 left-0.5 z-10 px-1 py-0.5 text-[8px] font-bold bg-yellow-500 text-white rounded">Before</span>' : ''}
            ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-full object-cover" alt="v${i}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-400 text-xs">No img</div>'}
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button class="history-dl-btn text-white/90 hover:text-blue-300 transition-colors p-1" title="ダウンロード">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            </div>
            <button class="history-set-before-btn absolute bottom-0.5 left-0.5 z-10 px-1 py-0.5 text-[8px] font-bold bg-gray-500/70 text-white rounded hover:bg-yellow-500 transition-colors opacity-0 group-hover:opacity-100" title="Beforeに設定">Before</button>
          </div>
        </div>
        <span class="text-[10px] font-medium text-gray-600 dark:text-gray-300 text-center leading-tight line-clamp-2 w-full history-thumb">${escapeHtml(entry.label)}</span>
      `;

      // サムネイル・ラベルクリックで履歴切り替え
      item.querySelectorAll('.history-thumb').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof App !== 'undefined') App.goToHistory(i);
        });
      });

      // Beforeに設定ボタン
      const setBeforeBtn = item.querySelector('.history-set-before-btn');
      if (setBeforeBtn) {
        setBeforeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setBeforeFromEntry(entry);
        });
      }

      // ダウンロードボタン
      item.querySelector('.history-dl-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        EditHistory.downloadImage(entry);
      });

      // 削除ボタン
      const delBtn = item.querySelector('.history-del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const msg = i === 0 ? 'オリジナル画像を削除すると全履歴がクリアされます。よろしいですか？' : 'この画像を削除しますか？';
          if (!confirm(msg)) return;
          EditHistory.removeEntry(i);
        });
      }

      elements.historyTimeline.appendChild(item);

      // 縦矢印（最後以外）
      if (i < entries.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'flex items-center justify-center text-gray-300 text-sm py-0.5';
        arrow.textContent = '↓';
        elements.historyTimeline.appendChild(arrow);
      }
    });
  }

  // --- モバイル履歴アクションメニュー ---
  function showMobileHistoryMenu(entry, index, anchorEl) {
    document.querySelectorAll('.mobile-history-menu').forEach(m => m.remove());

    const isBefore = entry.id === customBeforeEntryId;
    const menu = document.createElement('div');
    menu.className = 'mobile-history-menu fixed inset-0 z-50 flex items-end justify-center';
    menu.innerHTML = `
      <div class="mobile-history-menu-backdrop absolute inset-0 bg-black/40"></div>
      <div class="relative w-full max-w-sm mx-4 mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center">${escapeHtml(entry.label)}</p>
        </div>
        <div class="py-1">
          <button class="menu-before w-full px-4 py-3 text-left text-sm flex items-center gap-3 active:bg-gray-100 dark:active:bg-gray-700 transition-colors ${isBefore ? 'text-yellow-600' : 'text-gray-700 dark:text-gray-200'}">
            <span class="w-7 h-7 rounded-full ${isBefore ? 'bg-yellow-500' : 'bg-yellow-100 dark:bg-yellow-900/30'} flex items-center justify-center text-xs font-bold ${isBefore ? 'text-white' : 'text-yellow-600'}">B</span>
            ${isBefore ? 'Before解除' : 'Beforeに設定'}
          </button>
          <button class="menu-download w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3 active:bg-gray-100 dark:active:bg-gray-700 transition-colors">
            <span class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </span>
            ダウンロード
          </button>
          <button class="menu-delete w-full px-4 py-3 text-left text-sm text-red-600 flex items-center gap-3 active:bg-red-50 dark:active:bg-red-900/20 transition-colors">
            <span class="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </span>
            削除
          </button>
        </div>
        <button class="menu-cancel w-full px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700 transition-colors">
          キャンセル
        </button>
      </div>
    `;

    const close = () => menu.remove();
    menu.querySelector('.mobile-history-menu-backdrop').addEventListener('click', close);
    menu.querySelector('.menu-cancel').addEventListener('click', close);

    menu.querySelector('.menu-before').addEventListener('click', () => {
      if (isBefore) {
        customBeforeEntryId = null;
        beforeImageData = null;
        hasBeforeImage = false;
      } else {
        setBeforeFromEntry(entry);
      }
      close();
      renderHistory(EditHistory.getEntries(), EditHistory.getCurrentIndex());
    });

    menu.querySelector('.menu-download').addEventListener('click', () => {
      EditHistory.downloadImage(entry);
      close();
    });

    menu.querySelector('.menu-delete').addEventListener('click', () => {
      close();
      const msg = index === 0 ? 'オリジナル画像を削除すると全履歴がクリアされます。よろしいですか？' : 'この画像を削除しますか？';
      if (!confirm(msg)) return;
      EditHistory.removeEntry(index);
    });

    document.body.appendChild(menu);
  }

  // --- ローディング ---
  function showLoading(text = '処理中...', options = {}) {
    elements.loadingOverlay.classList.remove('hidden');
    elements.loadingText.textContent = text;

    // キャンセルボタン表示
    if (options.showCancel) {
      elements.cancelBtn.classList.remove('hidden');
    } else {
      elements.cancelBtn.classList.add('hidden');
    }

    // ステップ表示をリセット
    if (!options.showSteps) {
      elements.loadingSteps.classList.add('hidden');
    }
  }

  // ステップ付きローディング表示を開始
  function showLoadingWithSteps(cancelCallback) {
    elements.loadingOverlay.classList.remove('hidden');
    elements.loadingSteps.classList.remove('hidden');
    elements.cancelBtn.classList.remove('hidden');
    elements.loadingText.textContent = '';

    // ステップをリセット
    elements.loadingSteps.querySelectorAll('.loading-step').forEach(step => {
      step.classList.remove('active', 'done');
    });

    // キャンセルボタンのイベント管理（cloneNodeではなくremoveEventListenerで付け替え）
    if (cancelHandler) {
      elements.cancelBtn.removeEventListener('click', cancelHandler);
    }
    cancelHandler = () => { if (cancelCallback) cancelCallback(); };
    elements.cancelBtn.addEventListener('click', cancelHandler);
  }

  // ステップを更新
  function updateLoadingStep(stepNumber) {
    elements.loadingSteps.querySelectorAll('.loading-step').forEach(step => {
      const num = parseInt(step.dataset.step);
      if (num < stepNumber) {
        step.classList.remove('active');
        step.classList.add('done');
      } else if (num === stepNumber) {
        step.classList.remove('done');
        step.classList.add('active');
      } else {
        step.classList.remove('active', 'done');
      }
    });
  }

  function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
    elements.loadingSteps.classList.add('hidden');
    elements.cancelBtn.classList.add('hidden');
  }

  // --- エラー / 成功メッセージ ---
  function showError(message) {
    clearTimeout(errorTimer);
    elements.errorToast.classList.remove('hidden', 'bg-green-100', 'dark:bg-green-900/30', 'border-green-400', 'dark:border-green-700');
    elements.errorToast.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-400', 'dark:border-red-700');
    elements.errorMessage.classList.remove('text-green-800', 'dark:text-green-300');
    elements.errorMessage.classList.add('text-red-800', 'dark:text-red-300');
    elements.errorClose.classList.remove('text-green-500');
    elements.errorClose.classList.add('text-red-500');

    // APIキー関連エラー時はリカバリアクションを追加
    if (message.includes('APIキー')) {
      elements.errorMessage.innerHTML = escapeHtml(message) +
        ' <a href="#" class="underline font-medium" id="errorRecoveryLink">APIキーを設定する</a>';
      const link = document.getElementById('errorRecoveryLink');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          hideError();
          elements.settingsModal.classList.remove('hidden');
          setTimeout(() => elements.apiKeyInput.focus(), 100);
        });
      }
    } else {
      elements.errorMessage.textContent = message;
    }
    errorTimer = setTimeout(hideError, 8000);
  }

  function showSuccess(message) {
    clearTimeout(errorTimer);
    elements.errorMessage.textContent = message;
    elements.errorToast.classList.remove('hidden', 'bg-red-100', 'dark:bg-red-900/30', 'border-red-400', 'dark:border-red-700');
    elements.errorToast.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-400', 'dark:border-green-700');
    elements.errorMessage.classList.remove('text-red-800', 'dark:text-red-300');
    elements.errorMessage.classList.add('text-green-800', 'dark:text-green-300');
    elements.errorClose.classList.remove('text-red-500');
    elements.errorClose.classList.add('text-green-500');
    errorTimer = setTimeout(hideError, 3000);
  }

  function hideError() {
    elements.errorToast.classList.add('hidden');
  }

  // --- プリセットテンプレート ---
  const PRESETS = {
    golden_hour: '全体的にゴールデンアワーの暖かい照明に変更。夕日の柔らかいオレンジ色の光が差し込む雰囲気にする',
    winter: '季節を冬に変更。雪が積もり、冷たい空気感のある冬景色にする',
    anime: '全体をアニメ・イラスト風のスタイルに変換する。鮮やかな色彩とフラットな質感で描く',
    night: '時間帯を夜に変更。街灯やイルミネーションの光が美しい夜景にする',
    spring: '季節を春に変更。桜や花が咲き、明るく柔らかい春の雰囲気にする',
    vintage: 'レトロ・ヴィンテージ風の色調に変更。セピアトーンとフィルム粒子感を加える',
    minimalist: 'ミニマリストデザインに変更。余計な要素を減らし、シンプルで洗練された印象にする',
    dramatic: 'ドラマチックな照明に変更。強いコントラストと印象的な影を加える',
    summer: '季節を真夏に変更。強い日差し、青い空、鮮やかな緑の夏らしい雰囲気にする',
    autumn: '季節を秋に変更。紅葉の赤やオレンジ、落ち葉のある秋の風景にする',
    morning: '早朝の柔らかい光に変更。朝もやと淡い日差しの清々しい雰囲気にする',
    sunset: '夕暮れ時の空に変更。紫とオレンジのグラデーションが美しい夕焼けにする',
    watercolor: '水彩画風のスタイルに変換する。にじみと透明感のある柔らかいタッチで描く',
    oil_painting: '油絵風のスタイルに変換する。厚塗りの筆跡と豊かな色彩で描く',
    pencil_sketch: '鉛筆スケッチ風に変換する。モノクロの繊細な線画とハッチングで描く',
    cyberpunk: 'サイバーパンク風に変更。ネオンライトと未来的な都市の雰囲気にする',
    steampunk: 'スチームパンク風に変更。歯車や蒸気機関のレトロフューチャーな雰囲気にする',
    pop_art: 'ポップアート風に変換する。鮮やかな原色とハーフトーンドットのスタイルにする',
    horror: 'ホラー風の不気味な雰囲気に変更。暗い影と冷たい色調で恐怖感を演出する',
    fantasy: 'ファンタジー風の幻想的な雰囲気に変更。魔法のような光と神秘的な色彩にする',
    scifi: 'SF風の近未来的な雰囲気に変更。メタリックな質感とホログラフィックな光にする',
    romantic: 'ロマンチックな雰囲気に変更。柔らかいピンクのトーンと夢のような光で演出する',
    rain: '雨の日の雰囲気に変更。雨粒と濡れた路面の反射が美しいシーンにする',
    fog: '霧の中の幻想的な雰囲気に変更。霧がかかり遠景がぼやけた神秘的なシーンにする',
  };

  const PRESET_LABELS = {
    golden_hour: 'ゴールデンアワー', winter: '冬景色', anime: 'アニメ風', night: '夜景',
    spring: '春の雰囲気', vintage: 'ヴィンテージ', minimalist: 'ミニマリスト', dramatic: 'ドラマチック',
    summer: '夏', autumn: '秋', morning: '朝', sunset: '夕暮れ',
    watercolor: '水彩画', oil_painting: '油絵', pencil_sketch: '鉛筆スケッチ', cyberpunk: 'サイバーパンク',
    steampunk: 'スチームパンク', pop_art: 'ポップアート', horror: 'ホラー', fantasy: 'ファンタジー',
    scifi: 'SF', romantic: 'ロマンチック', rain: '雨', fog: '霧',
  };

  function togglePresetPopup(row, elementId) {
    // 既存のポップアップを閉じる
    document.querySelectorAll('.preset-popup').forEach(p => p.remove());

    const popup = document.createElement('div');
    popup.className = 'preset-popup flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600';

    Object.entries(PRESETS).forEach(([key, instruction]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-2.5 py-1 text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer';
      btn.textContent = PRESET_LABELS[key] || key;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const textarea = row.querySelector('textarea');
        if (textarea) {
          textarea.value = instruction;
          textarea.focus({ preventScroll: true });
        }
        const toggleBtn = row.querySelector('.preset-toggle-btn');
        if (toggleBtn) {
          toggleBtn.querySelector('svg').style.transform = '';
          toggleBtn.classList.remove('bg-blue-50', 'text-blue-500', 'border-blue-300');
        }
        popup.remove();
      });
      popup.appendChild(btn);
    });

    // textareaの前に挿入
    const textarea = row.querySelector('textarea');
    if (textarea) {
      row.insertBefore(popup, textarea);
    } else {
      row.appendChild(popup);
    }
  }

  // --- 生成枚数取得 ---
  function getGenerateCount() {
    const sel = elements.generateCount;
    if (sel.value === 'custom') {
      const v = parseInt(elements.generateCountCustom.value);
      return Math.max(1, Math.min(8, v || 1));
    }
    return parseInt(sel.value) || 1;
  }

  // --- 複数枚結果表示 ---
  // 候補カードを生成してコンテナに追加するヘルパー
  function renderCandidateCards(container, results, origImageData, label) {
    results.forEach((imgData, i) => {
      const card = document.createElement('div');
      card.className = 'relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors cursor-pointer group candidate-card';

      const img = document.createElement('img');
      img.src = `data:${imgData.mimeType};base64,${imgData.base64}`;
      img.className = 'w-full block';
      img.alt = `生成結果 ${i + 1}`;
      card.appendChild(img);

      // チェックマークオーバーレイ（採用時に表示）
      const checkMark = document.createElement('div');
      checkMark.className = 'absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hidden';
      checkMark.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
      card.appendChild(checkMark);

      // 「この画像を採用」ボタン（画像中央に大きく表示）
      const adoptBtn = document.createElement('div');
      adoptBtn.className = 'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer';
      adoptBtn.innerHTML = '<span class="px-6 py-3 text-sm font-medium bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors">この画像を採用</span>';
      adoptBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // 全グリッド内の全カードのチェック・ボーダーをリセット（現在+前回）
        elements.resultGrid.querySelectorAll('.candidate-card').forEach(c => {
          c.classList.remove('border-blue-500');
          c.classList.add('border-gray-200', 'dark:border-gray-700');
          const cm = c.querySelector('.absolute.top-2');
          if (cm) cm.classList.add('hidden');
        });

        // この画像にチェックマーク+青ボーダー
        card.classList.remove('border-gray-200', 'dark:border-gray-700');
        card.classList.add('border-blue-500');
        checkMark.classList.remove('hidden');

        // Before/Afterコンテナも表示（グリッドは残す）
        beforeImageData = origImageData;
        hasBeforeImage = true;
        elements.compareBeforeImg.src = `data:${origImageData.mimeType};base64,${origImageData.base64}`;
        elements.resultImage.src = `data:${imgData.mimeType};base64,${imgData.base64}`;
        elements.compareContainer.classList.remove('hidden');
        elements.compareContainer.classList.remove('compare-active');
        updateSliderPosition(0);

        // Before/Afterのスライダー存在アニメーション
        setTimeout(() => {
          activateCompare();
          setTimeout(() => deactivateCompare(), 1000);
        }, 300);

        // 採用画像直下にDLボタン表示
        showDownloadButton(imgData);

        // Appに通知
        if (typeof App !== 'undefined' && App.onImageAdopted) {
          App.onImageAdopted(imgData, label);
        }
      });
      card.appendChild(adoptBtn);

      container.appendChild(card);
    });
  }

  function showMultiResult(results, originalImageData, historyLabel) {
    elements.resultSection.classList.remove('hidden');
    elements.compareContainer.classList.add('hidden');
    elements.resultGrid.classList.remove('hidden');
    elements.resultGrid.innerHTML = '';

    // グリッドレイアウト
    const cols = results.length <= 2 ? results.length : 2;
    elements.resultGrid.className = `grid gap-4 mb-6`;
    elements.resultGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // 採用DLボタンを非表示にリセット
    if (elements.adoptDownloadBtn) elements.adoptDownloadBtn.classList.add('hidden');

    renderCandidateCards(elements.resultGrid, results, originalImageData, historyLabel);

    requestAnimationFrame(() => {
      elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // 採用済み画像にチェックマークを付ける（履歴から復元時に使用）
  function highlightAdoptedCandidate(adoptedImageData) {
    if (!adoptedImageData) return;
    const adoptedSrc = `data:${adoptedImageData.mimeType};base64,${adoptedImageData.base64}`;
    elements.resultGrid.querySelectorAll('.candidate-card').forEach(card => {
      const img = card.querySelector('img');
      if (img && img.src === adoptedSrc) {
        card.classList.remove('border-gray-200', 'dark:border-gray-700');
        card.classList.add('border-blue-500');
        const cm = card.querySelector('.absolute.top-2');
        if (cm) cm.classList.remove('hidden');
      }
    });
  }

  // --- ユーティリティ ---
  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  }

  // 複数要素の指示を取得: [{ elementName, instruction }]
  function getEditInstructions() {
    const instructions = [];
    const container = elements.editInstructionsList;
    if (!container) return instructions;

    container.querySelectorAll('[data-instruction-for]').forEach(row => {
      const elementId = row.dataset.instructionFor;
      const el = selectedElements.find(e => e.id === elementId);
      if (!el) return;

      // カメラ要素: ビジュアルエディタから取得
      if (el.type === 'camera' && typeof CameraEditor !== 'undefined') {
        const promptText = CameraEditor.getPromptText();
        if (promptText) {
          instructions.push({
            elementName: el.name,
            instruction: promptText,
          });
        }
        return;
      }

      // 通常: textareaから取得
      const textarea = row.querySelector('textarea');
      if (textarea && textarea.value.trim()) {
        const entry = {
          elementName: el.name,
          instruction: textarea.value.trim(),
        };
        // グループの場合: メンバー情報を付与
        if (el.type === 'group' && el.data?.members) {
          entry.isGroup = true;
          entry.memberCount = el.data.members.length;
          entry.memberNames = el.data.members.map(m => m.name || m.name_en || m.description).filter(Boolean);
        }
        instructions.push(entry);
      }
    });
    return instructions;
  }

  // 画像プレビューを更新（履歴から復元時）
  function updateMainPreview(imageData) {
    const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
    elements.previewImage.src = dataUrl;
    if (elements.previewImageClean) elements.previewImageClean.src = dataUrl;
    elements.imagePreview.classList.remove('hidden');
    elements.removeImage.classList.remove('hidden');
  }

  // --- プロジェクト保存・一覧 ---

  function showSaveDialog() {
    elements.saveProjectName.value = '';
    const hasExisting = !!App.getCurrentProjectId();
    // 上書きボタンの表示制御
    if (hasExisting) {
      elements.saveProjectOverwrite.classList.remove('hidden');
      elements.saveProjectInfo.textContent = '既存プロジェクトに上書き、または新しいプロジェクトとして保存できます。';
      elements.saveProjectInfo.classList.remove('hidden');
    } else {
      elements.saveProjectOverwrite.classList.add('hidden');
      elements.saveProjectInfo.classList.add('hidden');
    }
    elements.saveProjectModal.classList.remove('hidden');
    setTimeout(() => elements.saveProjectName.focus(), 100);
  }

  function hideSaveDialog() {
    elements.saveProjectModal.classList.add('hidden');
  }

  async function showProjectModal() {
    elements.projectModal.classList.remove('hidden');
    await renderProjectList();
  }

  function hideProjectModal() {
    elements.projectModal.classList.add('hidden');
  }

  // 日時フォーマット
  function formatDate(isoStr) {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function renderProjectList() {
    try {
      await ProjectStorage.init();
      const projects = await ProjectStorage.listProjects();
      const container = elements.projectList;

      if (projects.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-8">保存されたプロジェクトはありません</p>';
        return;
      }

      container.innerHTML = projects.map(p => `
        <div class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" data-project-id="${p.id}" onclick="App.loadProject('${p.id}')">
          <div class="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            ${p.thumbnail
              ? `<img src="${p.thumbnail}" alt="" class="w-full h-full object-cover">`
              : '<svg class="w-8 h-8 text-gray-300 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">${p.name}</p>
            <p class="text-xs text-gray-400 dark:text-gray-400">${formatDate(p.updatedAt)} ・ 画像${p.entryCount}枚</p>
          </div>
          <div class="flex gap-1 flex-shrink-0">
            <button onclick="event.stopPropagation(); App.exportProject('${p.id}')" class="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" title="エクスポート">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
            <button onclick="event.stopPropagation(); App.deleteProject('${p.id}')" class="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded cursor-pointer" title="削除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      elements.projectList.innerHTML = `<p class="text-sm text-red-500 text-center py-4">${err.message}</p>`;
    }
  }

  return {
    init,
    renderElements,
    renderMarkers,
    renderHistory,
    showResult,
    showResultFromHistory,
    showMultiResult,
    highlightAdoptedCandidate,
    showLoading,
    showLoadingWithSteps,
    updateLoadingStep,
    hideLoading,
    showError,
    showSuccess,
    getCustomInstruction,
    getEditInstructions,
    getGenerateCount,
    clearSelectedElements,
    updateMainPreview,
    showSaveDialog,
    hideSaveDialog,
    showProjectModal,
    hideProjectModal,
    renderProjectList,
  };
})();
