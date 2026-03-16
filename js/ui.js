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
  };

  // DOM要素のキャッシュ
  let elements = {};

  // 複数選択中の要素リスト
  let selectedElements = []; // [{ id, type, name, data }]

  // Before/After比較状態
  let beforeImageData = null; // 比較用の元画像
  let hasBeforeImage = false; // Before画像が設定済みか

  // エラー/成功トーストのタイマー（競合防止）
  let errorTimer = null;

  // cancelBtnのイベントハンドラ（cloneNodeを使わず付け替えで管理）
  let cancelHandler = null;

  // 初期化
  function init() {
    cacheElements();
    setupEventListeners();
    restoreApiKey();
  }

  function cacheElements() {
    elements = {
      // ヘッダー
      apiKeyInput: document.getElementById('apiKeyInput'),
      apiKeyToggle: document.getElementById('apiKeyToggle'),
      apiKeySave: document.getElementById('apiKeySave'),

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

      // カスタム要素モーダル
      customElementModal: document.getElementById('customElementModal'),
      customElementInput: document.getElementById('customElementInput'),
      customElementConfirm: document.getElementById('customElementConfirm'),
      customElementCancel: document.getElementById('customElementCancel'),

      // カスタム要素登録（設定モーダル内）
      customElementRegisterInput: document.getElementById('customElementRegisterInput'),
      customElementRegisterBtn: document.getElementById('customElementRegisterBtn'),
      customElementRegisteredList: document.getElementById('customElementRegisteredList'),

      // 設定・ヘルプモーダル
      settingsBtn: document.getElementById('settingsBtn'),
      settingsModal: document.getElementById('settingsModal'),
      settingsClose: document.getElementById('settingsClose'),
      helpBtn: document.getElementById('helpBtn'),
      helpModal: document.getElementById('helpModal'),
      helpClose: document.getElementById('helpClose'),

      // プレビューカラム
      cleanColumn: document.getElementById('cleanColumn'),
      cleanColumnLabel: document.getElementById('cleanColumnLabel'),
      markerColumn: document.getElementById('markerColumn'),

      // エラー
      errorToast: document.getElementById('errorToast'),
      errorMessage: document.getElementById('errorMessage'),
      errorClose: document.getElementById('errorClose'),
    };
  }

  function setupEventListeners() {
    // 設定・ヘルプモーダル
    elements.settingsBtn.addEventListener('click', () => elements.settingsModal.classList.remove('hidden'));
    elements.settingsClose.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
    elements.settingsModal.addEventListener('click', (e) => { if (e.target === elements.settingsModal) elements.settingsModal.classList.add('hidden'); });
    elements.helpBtn.addEventListener('click', () => elements.helpModal.classList.remove('hidden'));
    elements.helpClose.addEventListener('click', () => elements.helpModal.classList.add('hidden'));
    elements.helpModal.addEventListener('click', (e) => { if (e.target === elements.helpModal) elements.helpModal.classList.add('hidden'); });

    // APIキー
    elements.apiKeyToggle.addEventListener('click', toggleApiKeyVisibility);
    elements.apiKeySave.addEventListener('click', saveApiKey);
    elements.apiKeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveApiKey();
    });

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

    // カスタム要素モーダル
    elements.customElementConfirm.addEventListener('click', confirmCustomElement);
    elements.customElementCancel.addEventListener('click', closeCustomElementModal);
    elements.customElementInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmCustomElement();
      if (e.key === 'Escape') closeCustomElementModal();
    });
    // モーダル背景クリックで閉じる
    elements.customElementModal.addEventListener('click', (e) => {
      if (e.target === elements.customElementModal) closeCustomElementModal();
    });

    // プリセットテンプレート
    elements.presetList.addEventListener('click', handlePresetClick);

    // カスタム要素登録（設定モーダル内）
    elements.customElementRegisterBtn.addEventListener('click', registerCustomElement);
    elements.customElementRegisterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') registerCustomElement();
    });
    renderRegisteredCustomElements();
  }

  // --- APIキー ---
  function restoreApiKey() {
    const key = GeminiAPI.getApiKey();
    if (key) {
      elements.apiKeyInput.value = key;
      elements.apiKeyInput.type = 'password';
    } else {
      // APIキー未設定時は分析ボタンを無効化し、トーストで通知
      elements.analyzeBtn.disabled = true;
      showError('APIキーが未設定です。ヘッダーの「設定」からAPIキーを保存してください。');
    }
  }

  function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
      showError('APIキーを入力してください');
      elements.apiKeyInput.focus();
      return;
    }
    GeminiAPI.setApiKey(key);
    // 保存成功後に分析ボタンを有効化
    elements.analyzeBtn.disabled = false;
    showSuccess('APIキーを保存しました');
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
      elements.uploadArea.querySelector('.upload-prompt').classList.add('hidden');
      // マーカーカラムは非表示、ラベルも非表示（1枚だけなので不要）
      if (elements.markerColumn) elements.markerColumn.classList.add('hidden');
      if (elements.cleanColumnLabel) elements.cleanColumnLabel.classList.add('hidden');

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
    elements.uploadArea.querySelector('.upload-prompt').classList.remove('hidden');
    elements.analysisSection.classList.add('hidden');
    elements.elementsSection.classList.add('hidden');
    elements.editSection.classList.add('hidden');
    elements.resultSection.classList.add('hidden');
    elements.fileInput.value = '';
    // マーカーカラムを再度非表示にする
    if (elements.markerColumn) elements.markerColumn.classList.add('hidden');
    if (elements.cleanColumnLabel) elements.cleanColumnLabel.classList.add('hidden');

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
        t.classList.add('bg-gray-200', 'text-gray-700');
      });
      tag.classList.remove('bg-gray-200', 'text-gray-700');
      tag.classList.add('bg-blue-500', 'text-white');
    } else {
      // 「全体」を解除
      const allTag = elements.focusTags.querySelector('[data-focus="all"]');
      allTag.classList.remove('bg-blue-500', 'text-white');
      allTag.classList.add('bg-gray-200', 'text-gray-700');

      // トグル
      tag.classList.toggle('bg-blue-500');
      tag.classList.toggle('text-white');
      tag.classList.toggle('bg-gray-200');
      tag.classList.toggle('text-gray-700');

      // 何も選択されていなければ「全体」に戻す
      const selected = elements.focusTags.querySelectorAll('.bg-blue-500');
      if (selected.length === 0) {
        allTag.classList.remove('bg-gray-200', 'text-gray-700');
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
    globalBtn.className = 'element-card border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer min-h-[100px]';
    globalBtn.innerHTML = `
      <span class="text-gray-400">${ICONS.globe}</span>
      <span class="text-sm text-gray-500">画像全体への指示</span>
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
    if (elements.cleanColumnLabel) elements.cleanColumnLabel.classList.remove('hidden');

    // 登録済みカスタム要素をカードとして表示
    const customElements = getRegisteredCustomElements();
    if (customElements.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader(ICONS.plus, 'カスタム要素'));
      customElements.forEach(name => {
        const card = createElementCard({
          id: 'custom_reg_' + name,
          type: 'object',
          name: name,
          subtitle: 'カスタム',
          data: { name, custom: true },
        });
        elements.elementsList.appendChild(card);
      });
    }
  }

  function createElementCard({ id, type, name, subtitle, data, markerIndex }) {
    const card = document.createElement('button');
    card.className = 'element-card relative bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col items-start gap-1 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left min-h-[100px]';
    card.dataset.elementId = id;

    // position_coords がある場合のみバッジを表示
    let badgeHtml = '';
    if (markerIndex && data.position_coords) {
      badgeHtml = `<span class="element-badge">${markerIndex}</span>`;
    }

    card.innerHTML = `
      ${badgeHtml}
      <span class="font-medium text-gray-800 text-sm leading-tight">${escapeHtml(name)}</span>
      <span class="text-xs text-gray-500 leading-tight">${escapeHtml(subtitle)}</span>
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

    card.addEventListener('click', () => selectElement({ id, type, name, data }));
    return card;
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
      selectedElements.splice(existingIndex, 1);
      const card = elements.elementsList.querySelector(`[data-element-id="${id}"]`);
      if (card) {
        card.classList.remove('border-blue-500', 'ring-2', 'ring-blue-200');
        card.classList.add('border-gray-200');
      }
    } else {
      // 新たに選択
      selectedElements.push({ id, type, name, data });
      const card = elements.elementsList.querySelector(`[data-element-id="${id}"]`);
      if (card) {
        card.classList.remove('border-gray-200');
        card.classList.add('border-blue-500', 'ring-2', 'ring-blue-200');
      }
    }

    // 選択数カウンター更新
    updateSelectionCounter();

    // 編集パネルの表示更新
    if (selectedElements.length > 0) {
      elements.editSection.classList.remove('hidden');
      // 「画像全体」が選択されている場合のみプリセットを表示
      const hasGlobal = selectedElements.some(el => el.type === 'global');
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
      row.className = 'edit-instruction-row border border-gray-200 rounded-lg p-3 space-y-2';
      row.dataset.instructionFor = el.id;

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">${i + 1}</span>
          <span class="font-medium text-sm text-blue-600">${escapeHtml(el.name)}</span>
        </div>
        <button class="remove-instruction text-gray-400 hover:text-red-500 text-lg leading-none" data-remove-id="${el.id}">&times;</button>
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
        textarea.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none';
        textarea.placeholder = getPlaceholder(el.type);
        textarea.dataset.elementId = el.id;
        if (savedValues[el.id]) textarea.value = savedValues[el.id];
        row.appendChild(textarea);
        container.appendChild(row);

        // 最後に追加された要素にフォーカス
        if (i === selectedElements.length - 1 && !savedValues[el.id]) {
          setTimeout(() => textarea.focus(), 50);
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
    };
    return placeholders[type] || '変更内容を入力してください';
  }

  function showCustomElementDialog() {
    elements.customElementInput.value = '';
    elements.customElementModal.classList.remove('hidden');
    setTimeout(() => elements.customElementInput.focus(), 50);

    // フォーカストラップ：モーダル内でTabキーが循環する
    const modal = elements.customElementModal;
    const focusableEls = modal.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    modal._trapFocus = trapFocus;
    modal.addEventListener('keydown', trapFocus);
  }

  function confirmCustomElement() {
    const name = elements.customElementInput.value.trim();
    if (name) {
      selectElement({
        id: 'custom_' + Date.now(),
        type: 'object',
        name: name,
        data: { name, custom: true },
      });
    }
    closeCustomElementModal();
  }

  function closeCustomElementModal() {
    // フォーカストラップ解除
    if (elements.customElementModal._trapFocus) {
      elements.customElementModal.removeEventListener('keydown', elements.customElementModal._trapFocus);
    }
    elements.customElementModal.classList.add('hidden');
  }

  // --- カスタム要素の永続管理（設定モーダル内） ---
  function getRegisteredCustomElements() {
    try {
      return JSON.parse(localStorage.getItem('custom_elements') || '[]');
    } catch { return []; }
  }

  function saveRegisteredCustomElements(list) {
    localStorage.setItem('custom_elements', JSON.stringify(list));
  }

  function registerCustomElement() {
    const name = elements.customElementRegisterInput.value.trim();
    if (!name) return;
    const list = getRegisteredCustomElements();
    if (list.includes(name)) {
      showError('この要素は既に登録されています');
      return;
    }
    list.push(name);
    saveRegisteredCustomElements(list);
    elements.customElementRegisterInput.value = '';
    renderRegisteredCustomElements();
    showSuccess(`「${name}」を登録しました`);
  }

  function unregisterCustomElement(name) {
    const list = getRegisteredCustomElements().filter(n => n !== name);
    saveRegisteredCustomElements(list);
    renderRegisteredCustomElements();
  }

  function renderRegisteredCustomElements() {
    const container = elements.customElementRegisteredList;
    if (!container) return;
    const list = getRegisteredCustomElements();
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<p class="text-xs text-gray-400">登録済み要素はありません</p>';
      return;
    }
    list.forEach(name => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5';
      row.innerHTML = `
        <span class="text-sm text-gray-700">${escapeHtml(name)}</span>
        <button class="text-gray-400 hover:text-red-500 text-lg leading-none cursor-pointer" title="削除">&times;</button>
      `;
      row.querySelector('button').addEventListener('click', () => unregisterCustomElement(name));
      container.appendChild(row);
    });
  }

  // --- 結果表示 ---
  function showResult(imageData, originalImageData = null) {
    elements.resultSection.classList.remove('hidden');
    elements.resultGrid.classList.add('hidden');
    elements.compareContainer.classList.remove('hidden');
    elements.resultImage.src = `data:${imageData.mimeType};base64,${imageData.base64}`;

    // Before/After比較用データ設定
    if (originalImageData) {
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

    // Before/After比較用データ設定
    if (beforeImage) {
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
    elements.compareBefore.style.width = pct + '%';
    elements.compareSlider.style.left = pct + '%';
  }

  function activateCompare() {
    if (!hasBeforeImage) return;
    elements.compareContainer.classList.add('compare-active');
    syncCompareImages();
    updateSliderPosition(0.5);
  }

  function deactivateCompare() {
    elements.compareContainer.classList.remove('compare-active');
    // スライダーをアニメーションで閉じる
    updateSliderPosition(0);
  }

  function setupCompareSlider() {
    let isDragging = false;

    function getSliderRatio(e) {
      const rect = elements.compareContainer.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return (clientX - rect.left) / rect.width;
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

    // マウスホバーでスライダー表示
    elements.compareContainer.addEventListener('mouseenter', () => {
      if (!hasBeforeImage) return;
      activateCompare();
    });
    elements.compareContainer.addEventListener('mouseleave', () => {
      if (isDragging) return; // ドラッグ中は閉じない
      deactivateCompare();
    });

    // マウスドラッグ（documentリスナーはonStartで登録）
    elements.compareSlider.addEventListener('mousedown', onStart);
    elements.compareContainer.addEventListener('mousedown', onStart);

    // タッチ操作（documentリスナーはonStartで登録）
    elements.compareSlider.addEventListener('touchstart', onStart, { passive: false });
    elements.compareContainer.addEventListener('touchstart', onStart, { passive: false });
  }

  // --- 履歴タイムライン（縦型サイドバー） ---
  function renderHistory(entries, currentIndex) {
    elements.historySidebar.classList.remove('hidden');
    elements.historyTimeline.innerHTML = '';

    entries.forEach((entry, i) => {
      const item = document.createElement('div');
      const isCurrent = i === currentIndex;
      item.className = `group flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${isCurrent ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`;

      const thumbUrl = EditHistory.getThumbnailUrl(entry);
      item.innerHTML = `
        <div class="relative w-full aspect-[3/2] rounded-md overflow-hidden bg-gray-200 history-thumb">
          ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-full object-cover" alt="v${i}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>'}
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button class="history-dl-btn text-white hover:text-blue-300 transition-colors p-1" title="ダウンロード">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
            ${i > 0 ? `<button class="history-del-btn text-white hover:text-red-300 transition-colors p-1" title="削除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>` : ''}
          </div>
        </div>
        <span class="text-[10px] font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-600'} text-center leading-tight line-clamp-2 w-full history-thumb">${escapeHtml(entry.label)}</span>
      `;

      // サムネイル・ラベルクリックで履歴切り替え
      item.querySelectorAll('.history-thumb').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof App !== 'undefined') App.goToHistory(i);
        });
      });

      // ダウンロードボタン
      item.querySelector('.history-dl-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        EditHistory.downloadImage(entry);
      });

      // 削除ボタン（オリジナル以外）
      const delBtn = item.querySelector('.history-del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
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
    elements.errorToast.classList.remove('hidden', 'bg-green-100', 'border-green-400');
    elements.errorToast.classList.add('bg-red-100', 'border-red-400');
    elements.errorMessage.classList.remove('text-green-800');
    elements.errorMessage.classList.add('text-red-800');
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
    elements.errorToast.classList.remove('hidden', 'bg-red-100', 'border-red-400');
    elements.errorToast.classList.add('bg-green-100', 'border-green-400');
    elements.errorMessage.classList.remove('text-red-800');
    elements.errorMessage.classList.add('text-green-800');
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

    // 「画像全体」のtextareaに指示をセット
    const globalRow = elements.editInstructionsList.querySelector('[data-instruction-for="global"]');
    if (globalRow) {
      const textarea = globalRow.querySelector('textarea');
      if (textarea) {
        textarea.value = instruction;
        textarea.focus();
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
      card.className = 'relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer group';

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
        instructions.push({
          elementName: el.name,
          instruction: textarea.value.trim(),
        });
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
  };
})();
