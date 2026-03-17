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
      focusTags: document.getElementById('focusTags'),
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
      presetTemplates: document.getElementById('presetTemplates'),
      presetList: document.getElementById('presetList'),

      // モデル選択
      textModelSelect: document.getElementById('textModelSelect'),
      textModelNote: document.getElementById('textModelNote'),
      imageModelSelect: document.getElementById('imageModelSelect'),
      imageModelNote: document.getElementById('imageModelNote'),
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
    elements.focusTags.addEventListener('click', handleFocusTagClick);
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

    // プリセットテンプレート
    elements.presetList.addEventListener('click', handlePresetClick);
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
    'gemini-2.5-pro':         { analysis: '¥3',   edit: '¥2',   prompt: '¥2' },
    'gemini-3.1-pro-preview': { analysis: '¥5',   edit: '¥3',   prompt: '¥3' },
  };
  // 画像生成: サイズ別（概算 ¥/回）
  const IMAGE_COST_MAP = {
    'gemini-3.1-flash-image-preview': { '1K': '¥3',  '2K': '¥5',  '4K': '¥10' },
    'gemini-3-pro-image-preview':     { '1K': '¥5',  '2K': '¥10', '4K': '¥20' },
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

    // イベントリスナー
    elements.textModelSelect.addEventListener('change', () => {
      GeminiAPI.setTextModel(elements.textModelSelect.value);
      GeminiAPI.reloadModels();
      updateModelNotes();
    });
    elements.imageModelSelect.addEventListener('change', () => {
      GeminiAPI.setImageModel(elements.imageModelSelect.value);
      GeminiAPI.reloadModels();
      updateModelNotes();
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
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
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
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
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
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
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

  // --- フォーカスタグ ---
  function handleFocusTagClick(e) {
    const tag = e.target.closest('[data-focus]');
    if (!tag) return;

    const focus = tag.dataset.focus;

    if (focus === 'all') {
      // 「全体」選択時は他を全解除
      elements.focusTags.querySelectorAll('[data-focus]').forEach(t => {
        t.classList.remove('bg-blue-500', 'text-white');
        t.classList.add('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
      });
      tag.classList.remove('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
      tag.classList.add('bg-blue-500', 'text-white');
    } else {
      // 「全体」を解除
      const allTag = elements.focusTags.querySelector('[data-focus="all"]');
      allTag.classList.remove('bg-blue-500', 'text-white');
      allTag.classList.add('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');

      // トグル（選択状態の判定）
      if (tag.classList.contains('bg-blue-500')) {
        // 選択解除
        tag.classList.remove('bg-blue-500', 'text-white');
        tag.classList.add('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
      } else {
        // 選択
        tag.classList.remove('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
        tag.classList.add('bg-blue-500', 'text-white');
      }

      // 何も選択されていなければ「全体」に戻す
      const selected = elements.focusTags.querySelectorAll('.bg-blue-500');
      if (selected.length === 0) {
        allTag.classList.remove('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
        allTag.classList.add('bg-blue-500', 'text-white');
      }
    }
  }

  function getSelectedFocusTags() {
    const tags = [];
    elements.focusTags.querySelectorAll('.bg-blue-500').forEach(tag => {
      tags.push(tag.dataset.focus);
    });
    return tags.length > 0 ? tags : ['all'];
  }

  function getCustomInstruction() {
    return elements.customInstruction.value.trim();
  }

  // カテゴリヘッダーを生成
  function createCategoryHeader(icon, label) {
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `<span class="text-gray-500">${icon}</span> ${escapeHtml(label)}`;
    return header;
  }

  // 同名オブジェクトを自動グループ化（name_en一致で2個以上）
  function computeAutoGroups(objects) {
    const nameMap = {};
    objects.forEach(obj => {
      const key = (obj.name_en || obj.name || '').toLowerCase().replace(/\s*[\d]+$/, '').trim();
      if (!key) return;
      if (!nameMap[key]) nameMap[key] = { name: obj.name, name_en: key, members: [] };
      nameMap[key].members.push(obj);
    });
    return Object.values(nameMap).filter(g => g.members.length >= 2);
  }

  // --- 要素カード表示 ---
  function renderElements(json) {
    elements.elementsSection.classList.remove('hidden');
    elements.elementsList.innerHTML = '';

    // マーカーインデックスカウンター（objects→text_elements→peopleの順）
    let markerIndex = 1;

    // オブジェクト
    if (json.objects && json.objects.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader(ICONS.cube, `オブジェクト (${json.objects.length})`));
      json.objects.forEach((obj, i) => {
        const card = createElementCard({
          id: obj.id || `obj_${i}`,
          type: 'object',
          name: obj.name || obj.name_en,
          subtitle: [obj.color, obj.material].filter(Boolean).join('・'),
          data: obj,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // テキスト要素
    if (json.text_elements && json.text_elements.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader(ICONS.text, `テキスト (${json.text_elements.length})`));
      json.text_elements.forEach((te, i) => {
        const card = createElementCard({
          id: te.id || `text_${i}`,
          type: 'text',
          name: te.content,
          subtitle: te.style || '',
          data: te,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // 人物
    if (json.people && json.people.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader(ICONS.user, `人物 (${json.people.length})`));
      json.people.forEach((p, i) => {
        const card = createElementCard({
          id: p.id || `person_${i}`,
          type: 'person',
          name: p.description || `人物 ${i + 1}`,
          subtitle: p.clothing || '',
          data: p,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // グループ（同種オブジェクトの自動グループ化）
    if (json.objects && json.objects.length > 0) {
      const groups = computeAutoGroups(json.objects);
      if (groups.length > 0) {
        elements.elementsList.appendChild(createCategoryHeader(ICONS.group, `グループ (${groups.length})`));
        groups.forEach((group, i) => {
          const card = document.createElement('button');
          card.className = 'element-card group-card relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-start gap-1 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-[100px]';
          card.dataset.elementId = `group_${i}`;
          card.innerHTML = `
            <span class="group-count-badge">${group.members.length}</span>
            <span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(group.name)}（${group.members.length}個）</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 leading-tight">${escapeHtml(group.name_en)}</span>
          `;
          card.addEventListener('click', () => selectElement({
            id: `group_${i}`,
            type: 'group',
            name: `${group.name}（${group.members.length}個）`,
            data: { ...group, members: group.members },
          }));
          elements.elementsList.appendChild(card);
        });
      }
    }

    // リージョン（面的・背景要素）
    if (json.regions?.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader(ICONS.region, `リージョン (${json.regions.length})`));
      json.regions.forEach((region, i) => {
        const card = document.createElement('button');
        card.className = 'element-card region-card relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-start gap-1 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-[100px]';
        card.dataset.elementId = region.id || `region_${i}`;
        card.innerHTML = `
          <span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(region.name || region.name_en)}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 leading-tight">${escapeHtml(region.type || '')} ${escapeHtml(region.description || '')}</span>
        `;
        card.addEventListener('click', () => selectElement({
          id: region.id || `region_${i}`,
          type: 'region',
          name: region.name || region.name_en,
          data: region,
        }));
        elements.elementsList.appendChild(card);
      });
    }

    // 環境・設定カテゴリ（常に表示）
    elements.elementsList.appendChild(createCategoryHeader(ICONS.globe, '環境・設定'));

    // 雰囲気・照明（常に表示・マーカーなし）
    if (json.atmosphere) {
      const atm = json.atmosphere;
      const card = createElementCard({
        id: 'atmosphere',
        type: 'atmosphere',
        name: '雰囲気・照明',
        subtitle: [atm.time_of_day, atm.weather, atm.mood].filter(Boolean).join('・'),
        data: atm,
      });
      elements.elementsList.appendChild(card);
    }

    // カメラ（マーカーなし）
    if (json.camera) {
      const cam = json.camera;
      const card = createElementCard({
        id: 'camera',
        type: 'camera',
        name: 'カメラ・構図',
        subtitle: [cam.angle, cam.perspective].filter(Boolean).join('・'),
        data: cam,
      });
      elements.elementsList.appendChild(card);
    }

    // 画像全体への指示ボタン（環境・設定カテゴリ内）
    const globalBtn = document.createElement('button');
    globalBtn.className = 'element-card border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer min-h-[100px]';
    globalBtn.dataset.elementId = 'global';
    globalBtn.innerHTML = `
      <span class="text-gray-400 dark:text-gray-400">${ICONS.globe}</span>
      <span class="text-sm text-gray-500 dark:text-gray-400">画像全体への指示</span>
    `;
    globalBtn.addEventListener('click', () => selectElement({
      id: 'global',
      type: 'global',
      name: '画像全体',
      data: json,
    }));
    elements.elementsList.appendChild(globalBtn);

    // 画像上にマーカーを描画 & マーカーカラム表示
    renderMarkers(json);
    if (elements.markerColumn) elements.markerColumn.classList.remove('hidden');

  }

  function createElementCard({ id, type, name, subtitle, data, markerIndex }) {
    const card = document.createElement('button');
    card.className = 'element-card relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-start gap-1 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-[100px]';
    card.dataset.elementId = id;

    // position_coords がある場合のみバッジを表示
    let badgeHtml = '';
    if (markerIndex && data.position_coords) {
      badgeHtml = `<span class="element-badge">${markerIndex}</span>`;
    }

    // 編集可能な要素タイプか判定（atmosphere, camera, global以外）
    const isEditable = ['object', 'text', 'person'].includes(type);

    card.innerHTML = `
      ${badgeHtml}
      <span class="element-name font-medium text-gray-800 dark:text-gray-100 text-sm leading-tight">${escapeHtml(name)}</span>
      <span class="text-xs text-gray-500 dark:text-gray-400 leading-tight">${escapeHtml(subtitle)}</span>
    `;

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
          selectElement({ id, type, name, data });
        }, 250);
      });
      card.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        startNameEdit(card, id, type, name, data);
      });
    } else {
      card.addEventListener('click', () => selectElement({ id, type, name, data }));
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
    input.className = 'w-full px-1 py-0.5 text-sm border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400';
    input.style.minWidth = '60px';

    const originalText = nameSpan.textContent;
    nameSpan.textContent = '';
    nameSpan.appendChild(input);
    input.focus();
    input.select();

    const finishEdit = () => {
      const newName = input.value.trim() || originalText;
      nameSpan.textContent = newName;

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
    }
  }

  // JSON内のオブジェクト・テキスト・人物を統一リストに展開
  function flattenElements(json) {
    const list = [];
    let markerIndex = 1;
    if (json.objects) {
      json.objects.forEach((obj, i) => {
        list.push({ item: obj, type: 'object', id: obj.id || `obj_${i}`, markerIndex: markerIndex++ });
      });
    }
    if (json.text_elements) {
      json.text_elements.forEach((te, i) => {
        list.push({ item: te, type: 'text', id: te.id || `text_${i}`, markerIndex: markerIndex++ });
      });
    }
    if (json.people) {
      json.people.forEach((p, i) => {
        list.push({ item: p, type: 'person', id: p.id || `person_${i}`, markerIndex: markerIndex++ });
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
      .map(({ item, id, markerIndex }) => ({
        index: markerIndex,
        coords: item.position_coords,
        id,
      }));

    // マーカーDOM生成
    allElements.forEach(({ index, coords, id }) => {
      const marker = document.createElement('div');
      marker.className = 'image-marker';
      marker.dataset.markerIndex = index;
      marker.dataset.elementId = id;
      marker.style.left = `${coords.x * 100}%`;
      marker.style.top = `${coords.y * 100}%`;
      marker.textContent = index;

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
    } else {
      // 新たに選択
      selectedElements.push({ id, type, name, data });
      const card = elements.elementsList.querySelector(`[data-element-id="${id}"]`);
      if (card) {
        card.classList.remove('border-gray-200', 'dark:border-gray-700', 'border-gray-300');
        card.classList.add('border-blue-500', 'ring-2', 'ring-blue-200');
      }
    }

    // 選択数カウンター更新
    updateSelectionCounter();

    // 編集パネルの表示更新
    if (selectedElements.length > 0) {
      elements.editSection.classList.remove('hidden');
      // 「画像全体」または「雰囲気・照明」が選択されている場合プリセットを表示
      const hasGlobal = selectedElements.some(el => el.type === 'global' || el.type === 'atmosphere' || el.type === 'region');
      if (hasGlobal) {
        elements.presetTemplates.classList.remove('hidden');
      } else {
        elements.presetTemplates.classList.add('hidden');
      }
      renderEditInstructions();
    } else {
      elements.editSection.classList.add('hidden');
      elements.presetTemplates.classList.add('hidden');
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

    selectedElements.forEach((el, i) => {
      const row = document.createElement('div');
      row.className = 'edit-instruction-row border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2';
      row.dataset.instructionFor = el.id;

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">${i + 1}</span>
          <span class="font-medium text-sm text-blue-600">${escapeHtml(el.name)}</span>
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
        // 通常: テキストエリア
        const textarea = document.createElement('textarea');
        textarea.rows = 2;
        textarea.className = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none';
        textarea.placeholder = getPlaceholder(el.type);
        textarea.dataset.elementId = el.id;
        if (savedValues[el.id]) textarea.value = savedValues[el.id];
        row.appendChild(textarea);
        container.appendChild(row);

        // 最後に追加された要素にフォーカス
        if (i === selectedElements.length - 1 && !savedValues[el.id]) {
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
    updateSelectionCounter();
  }

  function getPlaceholder(type) {
    const placeholders = {
      object: '例: 青いベルベット素材に変更 / モダンなデザインに入替 / 削除する',
      text: '例: テキストを「Hello World」に変更 / フォントをゴシック体に',
      person: '例: 赤いジャケットに変更 / ポーズを変える',
      atmosphere: '例: 雨の日の雰囲気に / ゴールデンアワーの照明に / 夜景に変更',
      camera: '例: 魚眼レンズで撮影したように / もっと引きの構図に',
      scene: '例: ミニマリストスタイルに / 北欧風のインテリアに',
      global: '例: 全体的にもっと暖かい色調に / 季節を冬に変更 / アニメ風にする',
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
  }

  // 履歴復元用の結果表示（グリッド・選択状態に触れない）
  function showResultFromHistory(imageData, beforeImage) {
    elements.resultSection.classList.remove('hidden');
    // グリッドには触れない（選択状態を維持）

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

    entries.forEach((entry, i) => {
      const item = document.createElement('div');
      const isCurrent = i === currentIndex;
      item.className = `group flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

      const thumbUrl = EditHistory.getThumbnailUrl(entry);
      const isBefore = entry.id === customBeforeEntryId;
      item.innerHTML = `
        <div class="relative w-full aspect-[3/2] rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 history-thumb ${isCurrent ? 'ring-2 ring-blue-500' : ''} ${isBefore ? 'ring-2 ring-yellow-500' : ''}">
          ${isCurrent ? '<span class="absolute top-0.5 left-0.5 z-10 px-1 py-0.5 text-[8px] font-bold bg-blue-500 text-white rounded">編集中</span>' : ''}
          ${isBefore ? '<span class="absolute bottom-0.5 left-0.5 z-10 px-1 py-0.5 text-[8px] font-bold bg-yellow-500 text-white rounded">Before</span>' : ''}
          ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-full object-cover" alt="v${i}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-400 text-xs">No img</div>'}
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button class="history-set-before-btn text-white hover:text-yellow-300 transition-colors p-1" title="Beforeに設定">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button class="history-dl-btn text-white hover:text-blue-300 transition-colors p-1" title="ダウンロード">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
            <button class="history-del-btn text-white hover:text-red-300 transition-colors p-1" title="削除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
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

  function handlePresetClick(e) {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    const presetKey = btn.dataset.preset;
    const instruction = PRESETS[presetKey];
    if (!instruction) return;

    // 「画像全体」または「雰囲気・照明」のtextareaに指示をセット
    const globalRow = elements.editInstructionsList.querySelector('[data-instruction-for="global"]');
    const atmosphereRow = elements.editInstructionsList.querySelector('[data-instruction-for="atmosphere"]');
    const targetRow = globalRow || atmosphereRow;
    if (targetRow) {
      const textarea = targetRow.querySelector('textarea');
      if (textarea) {
        textarea.value = instruction;
        textarea.focus({ preventScroll: true });
      }
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
  function showMultiResult(results, originalImageData, historyLabel) {
    elements.resultSection.classList.remove('hidden');
    elements.compareContainer.classList.add('hidden');
    elements.resultGrid.classList.remove('hidden');
    elements.resultGrid.innerHTML = '';

    // グリッドレイアウト: 2枚=2列, 4枚=2x2 + 下部余白
    const cols = results.length <= 2 ? results.length : 2;
    elements.resultGrid.className = `grid gap-4 mb-6`;
    elements.resultGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // 採用DLボタンを非表示にリセット
    if (elements.adoptDownloadBtn) elements.adoptDownloadBtn.classList.add('hidden');

    results.forEach((imgData, i) => {
      const card = document.createElement('div');
      card.className = 'relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors cursor-pointer group';

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

        // グリッド内の全カードのチェック・ボーダーをリセット
        elements.resultGrid.querySelectorAll('.relative').forEach(c => {
          c.classList.remove('border-blue-500');
          c.classList.add('border-gray-200');
          const cm = c.querySelector('.absolute.top-2');
          if (cm) cm.classList.add('hidden');
        });

        // この画像にチェックマーク+青ボーダー
        card.classList.remove('border-gray-200');
        card.classList.add('border-blue-500');
        checkMark.classList.remove('hidden');

        // Before/Afterコンテナも表示（グリッドは残す）
        beforeImageData = originalImageData;
        hasBeforeImage = true;
        elements.compareBeforeImg.src = `data:${originalImageData.mimeType};base64,${originalImageData.base64}`;
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
        if (elements.adoptDownloadBtn) {
          elements.adoptDownloadBtn.classList.remove('hidden');
          // DLボタンのクリックイベントを再設定
          const newDlBtn = elements.adoptDownloadBtn.cloneNode(true);
          elements.adoptDownloadBtn.replaceWith(newDlBtn);
          elements.adoptDownloadBtn = newDlBtn;
          newDlBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = `data:${imgData.mimeType};base64,${imgData.base64}`;
            link.download = `adopted_image.${imgData.mimeType === 'image/png' ? 'png' : 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }

        // Appに通知
        if (typeof App !== 'undefined' && App.onImageAdopted) {
          App.onImageAdopted(imgData, historyLabel);
        }
      });
      card.appendChild(adoptBtn);

      elements.resultGrid.appendChild(card);
    });

    requestAnimationFrame(() => {
      elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        // グループの場合: メンバー数を付与
        if (el.type === 'group' && el.data?.members) {
          entry.isGroup = true;
          entry.memberCount = el.data.members.length;
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
    showLoading,
    showLoadingWithSteps,
    updateLoadingStep,
    hideLoading,
    showError,
    showSuccess,
    getSelectedFocusTags,
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
