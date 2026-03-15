// UI描画・イベント処理モジュール

const UI = (() => {
  // DOM要素のキャッシュ
  let elements = {};

  // 複数選択中の要素リスト
  let selectedElements = []; // [{ id, type, name, data }]

  // Before/After比較状態
  let beforeImageData = null; // 比較用の元画像
  let hasBeforeImage = false; // Before画像が設定済みか

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
      downloadBtn: document.getElementById('downloadBtn'),

      // 履歴
      historySection: document.getElementById('historySection'),
      historyTimeline: document.getElementById('historyTimeline'),

      // JSON表示トグル
      jsonToggle: document.getElementById('jsonToggle'),
      jsonPanel: document.getElementById('jsonPanel'),
      jsonContent: document.getElementById('jsonContent'),

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

      // エラー
      errorToast: document.getElementById('errorToast'),
      errorMessage: document.getElementById('errorMessage'),
      errorClose: document.getElementById('errorClose'),
    };
  }

  function setupEventListeners() {
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

    // ダウンロード
    elements.downloadBtn.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.downloadCurrent();
    });

    // JSONトグル
    elements.jsonToggle.addEventListener('click', toggleJsonPanel);

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
  }

  // --- APIキー ---
  function restoreApiKey() {
    const key = GeminiAPI.getApiKey();
    if (key) {
      elements.apiKeyInput.value = key;
      elements.apiKeyInput.type = 'password';
    }
  }

  function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (key) {
      GeminiAPI.setApiKey(key);
      showSuccess('APIキーを保存しました');
    }
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

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processUploadedFile(file);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processUploadedFile(file);
  }

  async function processUploadedFile(file) {
    try {
      showLoading('画像を読み込み中...');
      const imageData = await GeminiAPI.resizeImage(file);

      // プレビュー表示（元画像 + マーカー付き両方）
      const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
      elements.previewImage.src = dataUrl;
      if (elements.previewImageClean) elements.previewImageClean.src = dataUrl;
      elements.imagePreview.classList.remove('hidden');
      elements.uploadArea.querySelector('.upload-prompt').classList.add('hidden');

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

    if (typeof App !== 'undefined') App.onImageRemoved();
  }

  // --- 参照画像 ---
  function handleReferenceDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processReferenceFile(file);
    }
  }

  function handleReferenceFileSelect(e) {
    const file = e.target.files[0];
    if (file) processReferenceFile(file);
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
    header.innerHTML = `<span>${icon}</span> ${escapeHtml(label)}`;
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
      elements.elementsList.appendChild(createCategoryHeader('🪑', `オブジェクト (${json.objects.length})`));
      json.objects.forEach((obj, i) => {
        const card = createElementCard({
          id: obj.id || `obj_${i}`,
          type: 'object',
          name: obj.name || obj.name_en,
          subtitle: [obj.color, obj.material].filter(Boolean).join('・'),
          icon: '🪑',
          data: obj,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // テキスト要素
    if (json.text_elements && json.text_elements.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader('📝', `テキスト (${json.text_elements.length})`));
      json.text_elements.forEach((te, i) => {
        const card = createElementCard({
          id: te.id || `text_${i}`,
          type: 'text',
          name: te.content,
          subtitle: te.style || '',
          icon: '📝',
          data: te,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // 人物
    if (json.people && json.people.length > 0) {
      elements.elementsList.appendChild(createCategoryHeader('👤', `人物 (${json.people.length})`));
      json.people.forEach((p, i) => {
        const card = createElementCard({
          id: p.id || `person_${i}`,
          type: 'person',
          name: p.description || `人物 ${i + 1}`,
          subtitle: p.clothing || '',
          icon: '👤',
          data: p,
          markerIndex: markerIndex,
        });
        elements.elementsList.appendChild(card);
        markerIndex++;
      });
    }

    // 環境カテゴリ（雰囲気・カメラ・シーン）
    const hasEnv = json.atmosphere || json.camera || json.scene;
    if (hasEnv) {
      elements.elementsList.appendChild(createCategoryHeader('🌐', '環境・設定'));
    }

    // 雰囲気・照明（常に表示・マーカーなし）
    if (json.atmosphere) {
      const atm = json.atmosphere;
      const card = createElementCard({
        id: 'atmosphere',
        type: 'atmosphere',
        name: '雰囲気・照明',
        subtitle: [atm.time_of_day, atm.weather, atm.mood].filter(Boolean).join('・'),
        icon: '🌤️',
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
        icon: '📷',
        data: cam,
      });
      elements.elementsList.appendChild(card);
    }

    // シーン全体（マーカーなし）
    if (json.scene) {
      const card = createElementCard({
        id: 'scene',
        type: 'scene',
        name: 'シーン全体',
        subtitle: [json.scene.style, json.scene.type].filter(Boolean).join('・'),
        icon: '🏠',
        data: json.scene,
      });
      elements.elementsList.appendChild(card);
    }

    // 画像上にマーカーを描画
    renderMarkers(json);

    // アクションボタンカテゴリ
    elements.elementsList.appendChild(createCategoryHeader('⚡', 'アクション'));

    // カスタム要素追加ボタン
    const addBtn = document.createElement('button');
    addBtn.className = 'element-card border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer min-h-[100px]';
    addBtn.innerHTML = `
      <span class="text-2xl text-gray-400">＋</span>
      <span class="text-sm text-gray-500">カスタム要素</span>
    `;
    addBtn.addEventListener('click', showCustomElementDialog);
    elements.elementsList.appendChild(addBtn);

    // 画像全体への指示ボタン
    const globalBtn = document.createElement('button');
    globalBtn.className = 'element-card border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer min-h-[100px]';
    globalBtn.innerHTML = `
      <span class="text-2xl text-gray-400">🌐</span>
      <span class="text-sm text-gray-500">画像全体への指示</span>
    `;
    globalBtn.addEventListener('click', () => selectElement({
      id: 'global',
      type: 'global',
      name: '画像全体',
      data: json,
    }));
    elements.elementsList.appendChild(globalBtn);
  }

  function createElementCard({ id, type, name, subtitle, icon, data, markerIndex }) {
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
      <span class="text-2xl">${icon}</span>
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

  // 画像上にマーカーを描画する
  function renderMarkers(json) {
    const overlay = document.getElementById('markerOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    let markerIndex = 1;
    const allElements = [];

    // objects
    if (json.objects) {
      json.objects.forEach((obj, i) => {
        if (obj.position_coords) {
          allElements.push({
            index: markerIndex,
            coords: obj.position_coords,
            id: obj.id || `obj_${i}`,
          });
        }
        markerIndex++;
      });
    }

    // text_elements
    if (json.text_elements) {
      json.text_elements.forEach((te, i) => {
        if (te.position_coords) {
          allElements.push({
            index: markerIndex,
            coords: te.position_coords,
            id: te.id || `text_${i}`,
          });
        }
        markerIndex++;
      });
    }

    // people
    if (json.people) {
      json.people.forEach((p, i) => {
        if (p.position_coords) {
          allElements.push({
            index: markerIndex,
            coords: p.position_coords,
            id: p.id || `person_${i}`,
          });
        }
        markerIndex++;
      });
    }

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

  // 全選択をクリア（画像削除時等）
  function clearSelectedElements() {
    selectedElements = [];
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
    elements.customElementModal.classList.add('hidden');
  }

  // --- 結果表示 ---
  function showResult(imageData, originalImageData = null) {
    elements.resultSection.classList.remove('hidden');
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
  }

  // --- Before/After比較（ホバー式スライダー） ---
  function syncCompareImages() {
    // After画像（resultImage）のサイズにBefore画像を合わせる
    const afterImg = elements.resultImage;
    const setSize = () => {
      elements.compareBeforeImg.style.width = afterImg.offsetWidth + 'px';
      elements.compareBeforeImg.style.height = afterImg.offsetHeight + 'px';
    };
    if (afterImg.complete) {
      setSize();
    } else {
      afterImg.onload = setSize;
    }
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

    // マウスドラッグ
    elements.compareSlider.addEventListener('mousedown', onStart);
    elements.compareContainer.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // タッチ操作
    elements.compareSlider.addEventListener('touchstart', onStart, { passive: false });
    elements.compareContainer.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  // --- 履歴タイムライン ---
  function renderHistory(entries, currentIndex) {
    elements.historySection.classList.remove('hidden');
    elements.historyTimeline.innerHTML = '';

    entries.forEach((entry, i) => {
      const item = document.createElement('button');
      const isCurrent = i === currentIndex;
      item.className = `history-item flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${isCurrent ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100 hover:bg-gray-200'}`;
      item.style.width = '100px';

      const thumbUrl = EditHistory.getThumbnailUrl(entry);
      item.innerHTML = `
        <div class="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
          ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-full object-cover" alt="v${i}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>'}
        </div>
        <span class="text-xs font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-600'} text-center leading-tight line-clamp-2">${escapeHtml(entry.label)}</span>
        <span class="text-[10px] text-gray-400">v${i}</span>
      `;

      item.addEventListener('click', () => {
        if (typeof App !== 'undefined') App.goToHistory(i);
      });

      elements.historyTimeline.appendChild(item);

      // 矢印（最後以外）
      if (i < entries.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'flex-shrink-0 flex items-center text-gray-300 text-lg self-center';
        arrow.textContent = '→';
        elements.historyTimeline.appendChild(arrow);
      }
    });

    // 最新にスクロール
    elements.historyTimeline.scrollLeft = elements.historyTimeline.scrollWidth;
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

    // キャンセルボタンのイベント（一度だけ）
    const newCancelBtn = elements.cancelBtn.cloneNode(true);
    elements.cancelBtn.parentNode.replaceChild(newCancelBtn, elements.cancelBtn);
    elements.cancelBtn = newCancelBtn;
    elements.cancelBtn.addEventListener('click', () => {
      if (cancelCallback) cancelCallback();
    });
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
    elements.errorMessage.textContent = message;
    elements.errorToast.classList.remove('hidden', 'bg-green-100', 'border-green-400');
    elements.errorToast.classList.add('bg-red-100', 'border-red-400');
    elements.errorMessage.classList.remove('text-green-800');
    elements.errorMessage.classList.add('text-red-800');
    elements.errorClose.classList.remove('text-green-500');
    elements.errorClose.classList.add('text-red-500');
    setTimeout(hideError, 8000);
  }

  function showSuccess(message) {
    elements.errorMessage.textContent = message;
    elements.errorToast.classList.remove('hidden', 'bg-red-100', 'border-red-400');
    elements.errorToast.classList.add('bg-green-100', 'border-green-400');
    elements.errorMessage.classList.remove('text-red-800');
    elements.errorMessage.classList.add('text-green-800');
    elements.errorClose.classList.remove('text-red-500');
    elements.errorClose.classList.add('text-green-500');
    setTimeout(hideError, 3000);
  }

  function hideError() {
    elements.errorToast.classList.add('hidden');
  }

  // --- JSONパネル ---
  function toggleJsonPanel() {
    elements.jsonPanel.classList.toggle('hidden');
    const isOpen = !elements.jsonPanel.classList.contains('hidden');
    elements.jsonToggle.textContent = isOpen ? 'JSONを隠す ▲' : 'JSONを表示 ▼';
  }

  function updateJsonDisplay(json) {
    elements.jsonContent.textContent = JSON.stringify(json, null, 2);
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

  // --- ユーティリティ ---
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    showLoading,
    showLoadingWithSteps,
    updateLoadingStep,
    hideLoading,
    showError,
    showSuccess,
    updateJsonDisplay,
    getSelectedFocusTags,
    getCustomInstruction,
    getEditInstructions,
    clearSelectedElements,
    updateMainPreview,
  };
})();
