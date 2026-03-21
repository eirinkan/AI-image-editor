// アプリケーション統合・状態管理

const App = (() => {
  // 状態
  const state = {
    originalImage: null,     // { base64, mimeType } - 最初にアップロードした画像
    currentImage: null,      // { base64, mimeType } - 現在の状態の画像
    referenceImage: null,    // { base64, mimeType } - 参照画像
    currentJson: null,       // 現在のJSON構造
    originalJson: null,      // 変更前のJSON（差分検出用）
    selectedElements: [],    // 選択中の要素 [{ id, type, name, data }]
    pendingJson: null,       // JSON更新成功→画像生成失敗時のリカバリ用
  };

  // AbortController管理
  let currentAbortController = null;

  // 複数枚グリッドからの再採用フラグ
  let _multiAdoptEntryCreated = false;
  // 現在表示中の複数枚候補データ（採用時に履歴に紐づけるため一時保持）
  let _currentCandidates = null; // { results, originalImageData, historyLabel }

  // 現在のプロジェクトID（保存済みの場合）
  let currentProjectId = null;

  // 自動保存デバウンスタイマー
  let _autoSaveTimer = null;

  // 初期化
  async function init() {
    UI.init();
    TextToImage.init();
    EditHistory.onChange(onHistoryChange);
    // IndexedDB初期化
    try { await ProjectStorage.init(); } catch (e) { console.warn('IndexedDB初期化失敗:', e); }
    // 自動保存からの復元
    await restoreSession();
  }

  // 自動保存（デバウンス500ms）
  function autoSave() {
    if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(async () => {
      try {
        // 保存すべきデータがない場合はスキップ
        if (!state.originalImage && !state.currentImage) return;

        const entries = EditHistory.toSerializable();
        const currentIndex = EditHistory.getCurrentIndex();

        // アクティブタブを判定
        const generatePanel = document.getElementById('generatePanel');
        const tabState = (generatePanel && !generatePanel.classList.contains('hidden')) ? 'generate' : 'upload';

        // 分析完了判定（タブバーが非表示なら分析済み）
        const subTabBar = document.getElementById('subTabBar');
        const analysisCompleted = subTabBar ? subTabBar.classList.contains('hidden') : false;

        await ProjectStorage.saveSession({
          originalImage: state.originalImage,
          currentImage: state.currentImage,
          currentJson: state.currentJson,
          originalJson: state.originalJson,
          entries: entries,
          currentIndex: currentIndex,
          currentProjectId: currentProjectId,
          tabState: tabState,
          analysisCompleted: analysisCompleted,
        });
      } catch (e) {
        console.warn('自動保存に失敗:', e);
      }
    }, 500);
  }

  // セッション復元
  async function restoreSession() {
    try {
      const session = await ProjectStorage.loadSession();
      if (!session || (!session.originalImage && !session.currentImage)) return;

      // 状態を復元
      state.originalImage = session.originalImage || null;
      state.currentImage = session.currentImage || null;
      state.currentJson = session.currentJson || null;
      state.originalJson = session.originalJson || null;
      currentProjectId = session.currentProjectId || null;

      // 履歴を復元
      if (session.entries && session.entries.length > 0) {
        EditHistory.fromSerializable(session.entries);
        // currentIndexを復元
        if (typeof session.currentIndex === 'number' && session.currentIndex >= 0) {
          EditHistory.goTo(session.currentIndex);
        }
      }

      // タブ状態の復元
      const uploadPanel = document.getElementById('uploadPanel');
      const generatePanel = document.getElementById('generatePanel');
      const subTabBar = document.getElementById('subTabBar');
      const uploadTab = document.getElementById('uploadTab');
      const generateTab = document.getElementById('generateTab');

      if (session.tabState === 'generate' && !session.analysisCompleted) {
        // 生成タブを表示（分析前の場合のみ）
        if (uploadPanel) uploadPanel.classList.add('hidden');
        if (generatePanel) generatePanel.classList.remove('hidden');
        if (uploadTab) { uploadTab.classList.remove('border-blue-500', 'text-blue-600'); uploadTab.classList.add('border-transparent', 'text-gray-500'); }
        if (generateTab) { generateTab.classList.add('border-blue-500', 'text-blue-600'); generateTab.classList.remove('border-transparent', 'text-gray-500'); }
      } else {
        // アップロードタブ表示
        if (uploadPanel) uploadPanel.classList.remove('hidden');
        if (generatePanel) generatePanel.classList.add('hidden');
      }

      // 分析完了時はタブバーを非表示
      if (session.analysisCompleted && subTabBar) {
        subTabBar.classList.add('hidden');
      }

      // 画像プレビューの復元
      if (state.currentImage) {
        const dataUrl = `data:${state.currentImage.mimeType};base64,${state.currentImage.base64}`;
        const previewImage = document.getElementById('previewImage');
        const previewImageClean = document.getElementById('previewImageClean');
        const imagePreview = document.getElementById('imagePreview');
        const uploadPrompt = document.querySelector('#uploadArea .upload-prompt');

        if (previewImage) previewImage.src = dataUrl;
        if (previewImageClean) previewImageClean.src = dataUrl;
        if (imagePreview) imagePreview.classList.remove('hidden');
        if (uploadPrompt) uploadPrompt.classList.add('hidden');
      }

      // 分析セクション表示
      if (state.currentImage) {
        const analysisSection = document.getElementById('analysisSection');
        if (analysisSection) analysisSection.classList.remove('hidden');
      }

      // 要素一覧の復元
      if (state.currentJson && state.currentJson.scene) {
        UI.renderElements(state.currentJson);
      }

      // 結果パネルの復元（履歴がある場合）
      const allEntries = EditHistory.getAll();
      if (allEntries.length > 1) {
        const current = EditHistory.getCurrent();
        if (current) {
          let beforeImage = null;
          if (current.parentId != null && current.parentId >= 0) {
            const parent = allEntries.find(e => e.id === current.parentId);
            if (parent) beforeImage = parent.image;
          }
          UI.showResultFromHistory(current.image, beforeImage);
          UI.updateMainPreview(current.image);
        }
      }

      console.log('セッションを復元しました');
    } catch (e) {
      console.warn('セッション復元に失敗:', e);
    }
  }

  // プロジェクト全体をクリア（新規作成）
  function clearProject() {
    if (!confirm('現在の編集内容を破棄して新規作成しますか？')) return;

    cancelCurrentOperation();

    // 状態クリア
    state.originalImage = null;
    state.currentImage = null;
    state.referenceImage = null;
    state.currentJson = null;
    state.originalJson = null;
    state.selectedElements = [];
    state.pendingJson = null;
    currentProjectId = null;

    // 履歴クリア
    EditHistory.clear();
    UI.clearSelectedElements();

    // UI初期化
    const previewImage = document.getElementById('previewImage');
    const previewImageClean = document.getElementById('previewImageClean');
    const imagePreview = document.getElementById('imagePreview');
    const uploadPrompt = document.querySelector('#uploadArea .upload-prompt');
    const analysisSection = document.getElementById('analysisSection');
    const elementsSection = document.getElementById('elementsSection');
    const editSection = document.getElementById('editSection');
    const resultSection = document.getElementById('resultSection');
    const fileInput = document.getElementById('fileInput');
    const markerColumn = document.getElementById('markerColumn');
    const subTabBar = document.getElementById('subTabBar');
    const uploadPanel = document.getElementById('uploadPanel');
    const generatePanel = document.getElementById('generatePanel');
    const uploadTab = document.getElementById('uploadTab');
    const generateTab = document.getElementById('generateTab');

    if (previewImage) previewImage.src = '';
    if (previewImageClean) previewImageClean.src = '';
    if (imagePreview) imagePreview.classList.add('hidden');
    if (uploadPrompt) uploadPrompt.classList.remove('hidden');
    if (analysisSection) analysisSection.classList.add('hidden');
    if (elementsSection) elementsSection.classList.add('hidden');
    if (editSection) editSection.classList.add('hidden');
    if (resultSection) resultSection.classList.add('hidden');
    if (fileInput) fileInput.value = '';
    if (markerColumn) markerColumn.classList.add('hidden');

    // 履歴サイドバーを非表示にしてクリア
    const historySidebar = document.getElementById('historySidebar');
    const historyTimeline = document.getElementById('historyTimeline');
    if (historySidebar) historySidebar.classList.add('hidden');
    if (historyTimeline) historyTimeline.innerHTML = '';

    // タブバー復活、アップロードタブに戻す
    if (subTabBar) subTabBar.classList.remove('hidden');
    if (uploadPanel) uploadPanel.classList.remove('hidden');
    if (generatePanel) generatePanel.classList.add('hidden');
    if (uploadTab) { uploadTab.classList.add('border-blue-500', 'text-blue-600'); uploadTab.classList.remove('border-transparent', 'text-gray-500'); }
    if (generateTab) { generateTab.classList.remove('border-blue-500', 'text-blue-600'); generateTab.classList.add('border-transparent', 'text-gray-500'); }

    // 自動保存削除
    ProjectStorage.clearSession().catch(e => console.warn('自動保存削除失敗:', e));

    UI.showSuccess('新規プロジェクトを作成しました');
  }

  // AI生成した画像が準備完了（分析前の状態にセット）
  function onGeneratedImageReady(imageData) {
    state.originalImage = imageData;
    state.currentImage = imageData;
    state.currentJson = null;
    state.originalJson = null;
    state.selectedElements = [];
    UI.clearSelectedElements();
    EditHistory.clear();

    // プレビュー画像を準備（分析後にuploadPanelで使用するため）
    const previewImage = document.getElementById('previewImage');
    const previewImageClean = document.getElementById('previewImageClean');
    const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
    if (previewImage) previewImage.src = dataUrl;
    if (previewImageClean) previewImageClean.src = dataUrl;

    // 分析セクション表示
    const analysisSection = document.getElementById('analysisSection');
    if (analysisSection) analysisSection.classList.remove('hidden');

    autoSave();
  }

  // 画像がアップロードされた
  function onImageUploaded(imageData) {
    state.originalImage = imageData;
    state.currentImage = imageData;
    state.currentJson = null;
    state.originalJson = null;
    state.selectedElements = [];
    UI.clearSelectedElements();
    EditHistory.clear();
    autoSave();
  }

  // 画像が削除された
  function onImageRemoved() {
    cancelCurrentOperation();
    state.originalImage = null;
    state.currentImage = null;
    state.referenceImage = null;
    state.currentJson = null;
    state.originalJson = null;
    state.selectedElements = [];
    UI.clearSelectedElements();
    EditHistory.clear();

    // タブバーを復活
    const subTabBar = document.getElementById('subTabBar');
    if (subTabBar) subTabBar.classList.remove('hidden');

    // 自動保存もクリア
    ProjectStorage.clearSession().catch(e => console.warn('自動保存削除失敗:', e));
  }

  // 参照画像がアップロードされた
  function onReferenceUploaded(imageData) {
    state.referenceImage = imageData;
  }

  // 参照画像が削除された
  function onReferenceRemoved() {
    state.referenceImage = null;
  }

  // 要素の選択が更新された（複数対応）
  function onElementsSelected(elements) {
    state.selectedElements = elements;
  }

  // 処理をキャンセル
  function cancelCurrentOperation() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  // 分析を実行
  async function analyze() {
    if (!state.currentImage) {
      UI.showError('先に画像をアップロードしてください。');
      return;
    }

    if (!GeminiAPI.getApiKey()) {
      UI.showError('APIキーを入力してください。');
      return;
    }

    const focusTags = ['all'];
    const customInstruction = UI.getCustomInstruction();

    // AbortController設定
    cancelCurrentOperation();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // ボタン無効化（連続クリック防止）
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) analyzeBtn.disabled = true;

    try {
      UI.showLoading('画像を分析中...', { showCancel: true });
      // キャンセルボタンのイベント設定
      const cancelBtn = document.getElementById('cancelBtn');
      const onCancel = () => cancelCurrentOperation();
      cancelBtn.addEventListener('click', onCancel, { once: true });

      const json = await GeminiAPI.analyzeImage(state.currentImage, focusTags, customInstruction, signal);
      state.currentJson = json;
      state.originalJson = JSON.parse(JSON.stringify(json)); // ディープコピー

      UI.renderElements(json);

      // 初回分析時にオリジナルとして履歴に追加
      if (EditHistory.getAll().length === 0) {
        EditHistory.createEntry(state.currentImage, json);
      }

      // 分析後: タブバーを非表示にし、編集モードに固定
      const subTabBar = document.getElementById('subTabBar');
      if (subTabBar) subTabBar.classList.add('hidden');

      const uploadPanel = document.getElementById('uploadPanel');
      const generatePanel = document.getElementById('generatePanel');
      const imagePreview = document.getElementById('imagePreview');
      const uploadPrompt = document.querySelector('#uploadArea .upload-prompt');

      if (uploadPanel) uploadPanel.classList.remove('hidden');
      if (generatePanel) generatePanel.classList.add('hidden');
      if (imagePreview) imagePreview.classList.remove('hidden');
      if (uploadPrompt) uploadPrompt.classList.add('hidden');

      UI.hideLoading();
      UI.showSuccess('画像の分析が完了しました');
      autoSave();
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('分析をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
      if (analyzeBtn) analyzeBtn.disabled = false;
    }
  }

  // 画像を生成（複数指示対応 + 複数枚対応）
  async function generate() {
    if (!state.currentImage) {
      UI.showError('先に画像をアップロードしてください。');
      return;
    }

    if (!state.currentJson) {
      UI.showError('先に画像を分析してください。');
      return;
    }

    const editInstructions = UI.getEditInstructions();
    if (editInstructions.length === 0) {
      UI.showError('変更内容を入力してください。要素を選択して指示を書いてください。');
      return;
    }

    const generateCount = UI.getGenerateCount();

    // AbortController設定
    cancelCurrentOperation();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // ボタン無効化（連続クリック防止）
    const generateBtnEl = document.getElementById('generateBtn');
    if (generateBtnEl) generateBtnEl.disabled = true;

    // 生成前の画像を保持（Before/After比較用）
    const imageBeforeGeneration = { ...state.currentImage };

    try {
      // ステップ付きローディング表示
      UI.showLoadingWithSteps(() => cancelCurrentOperation());

      // Step 1: JSONを一括更新
      UI.updateLoadingStep(1);
      let updatedJson;

      // カメラ要素のみの場合: LLM不要で確定的にJSON更新
      const cameraOnly = editInstructions.length === 1 && editInstructions[0].instruction.startsWith('Change camera to:');
      if (cameraOnly) {
        const safeCopy = JSON.parse(JSON.stringify(state.currentJson));
        // CameraEditorの値から直接camera JSONを構築（LLM呼び出し不要）
        safeCopy.camera = CameraEditor.buildCameraJson(safeCopy.camera);
        updatedJson = safeCopy;
      } else {
        updatedJson = await GeminiAPI.updateJson(state.currentJson, editInstructions, signal);
      }
      state.pendingJson = updatedJson; // リカバリ用に保持

      // 少し間を空けてから画像生成に入る
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: 画像を生成（枚数分ループ）
      UI.updateLoadingStep(2);

      // カメラのみの場合: プロンプトを直接渡す（JSON差分を経由しない）
      const cameraPromptText = cameraOnly ? CameraEditor.getImagePrompt() : null;

      if (generateCount === 1) {
        // 1枚の場合: 従来通り
        const result = await GeminiAPI.generateImage(
          state.currentImage,
          state.currentJson,
          updatedJson,
          state.referenceImage,
          signal,
          cameraPromptText
        );

        const newImageData = { base64: result.base64, mimeType: result.mimeType };
        state.currentImage = newImageData;
        state.currentJson = updatedJson;
        state.originalJson = JSON.parse(JSON.stringify(updatedJson));
        state.pendingJson = null;

        UI.renderElements(updatedJson);
        UI.showResult(newImageData, imageBeforeGeneration);
        UI.updateMainPreview(newImageData);

        const historyLabel = editInstructions
          .map(item => `${item.elementName}: ${item.instruction}`)
          .join(' / ');
        const currentEntry = EditHistory.getCurrent();
        EditHistory.createEntry(
          newImageData,
          updatedJson,
          historyLabel,
          currentEntry ? currentEntry.id : 0
        );

        UI.hideLoading();
        UI.showSuccess('画像の生成が完了しました');
        state.selectedElements = [];
        UI.clearSelectedElements();
        autoSave();
      } else {
        // 複数枚の場合: ループ生成
        const results = [];
        for (let i = 0; i < generateCount; i++) {
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          const loadingText = document.getElementById('loadingText');
          if (loadingText) loadingText.textContent = `画像を生成中... (${i + 1}/${generateCount}枚)`;

          const result = await GeminiAPI.generateImage(
            state.currentImage,
            state.currentJson,
            updatedJson,
            state.referenceImage,
            signal,
            cameraPromptText
          );
          results.push({ base64: result.base64, mimeType: result.mimeType });
        }

        state.currentJson = updatedJson;
        state.originalJson = JSON.parse(JSON.stringify(updatedJson));
        state.pendingJson = null;

        UI.renderElements(updatedJson);

        // 複数枚グリッド表示（履歴ラベル用に指示内容を渡す）
        const historyLabel = editInstructions
          .map(item => `${item.elementName}: ${item.instruction}`)
          .join(' / ');
        _currentCandidates = { results, originalImageData: imageBeforeGeneration, historyLabel };
        _multiAdoptEntryCreated = false; // 新しいグリッド表示時にリセット
        UI.showMultiResult(results, imageBeforeGeneration, historyLabel);

        UI.hideLoading();
        UI.showSuccess(`${generateCount}枚の画像を生成しました。画像をクリックして採用してください。`);
        state.selectedElements = [];
        UI.clearSelectedElements();
        autoSave();
      }
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('生成をキャンセルしました');
        state.pendingJson = null;
      } else if (state.pendingJson) {
        UI.showError(`画像生成に失敗しました: ${err.message}\n編集内容の準備は完了しています。「画像を生成」ボタンで再試行できます。`);
        state.currentJson = state.pendingJson;
        state.originalJson = JSON.parse(JSON.stringify(state.pendingJson));
        state.pendingJson = null;
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
      if (generateBtnEl) generateBtnEl.disabled = false;
    }
  }

  // 複数枚生成から画像を採用
  function onImageAdopted(imageData, historyLabel) {
    state.currentImage = imageData;
    UI.updateMainPreview(imageData);

    if (_multiAdoptEntryCreated) {
      // 同じグリッドから再採用 → 現在のエントリを更新
      EditHistory.updateCurrentEntry(imageData);
      // 候補データも更新
      if (_currentCandidates) {
        EditHistory.setCandidates(EditHistory.getCurrentIndex(), _currentCandidates);
      }
    } else {
      // 初回採用 → 新規エントリ作成
      const label = historyLabel || '画像を採用';
      const currentEntry = EditHistory.getCurrent();
      EditHistory.createEntry(
        imageData,
        state.currentJson,
        label,
        currentEntry ? currentEntry.id : 0
      ).then(() => {
        // 候補データを履歴エントリに紐づけ
        if (_currentCandidates) {
          EditHistory.setCandidates(EditHistory.getCurrentIndex(), _currentCandidates);
        }
      });
      _multiAdoptEntryCreated = true;
    }
    autoSave();
  }

  // 履歴の特定の時点に戻る
  function goToHistory(index) {
    const entry = EditHistory.goTo(index);
    if (!entry) return;

    // 選択要素をクリア
    state.selectedElements = [];
    UI.clearSelectedElements();

    // 状態を復元
    state.currentImage = entry.image;
    state.currentJson = entry.json;
    state.originalJson = entry.json && !entry.json.mode ? JSON.parse(JSON.stringify(entry.json)) : null;

    // Before画像を親エントリから復元してUI更新（グリッドには触れない）
    let beforeImage = null;
    if (entry.parentId != null && entry.parentId >= 0) {
      const allEntries = EditHistory.getAll();
      const parentEntry = allEntries.find(e => e.id === entry.parentId);
      if (parentEntry && parentEntry.image) {
        beforeImage = parentEntry.image;
      }
    }
    // 候補データがあればグリッド表示、なければBefore/After表示
    if (entry.candidates && entry.candidates.results && entry.candidates.results.length > 0) {
      _currentCandidates = entry.candidates;
      _multiAdoptEntryCreated = true; // 再採用時はupdateCurrentEntryを使う
      UI.showMultiResult(entry.candidates.results, entry.candidates.originalImageData, entry.candidates.historyLabel);
      // 採用済みの画像にチェックマークを付ける
      UI.highlightAdoptedCandidate(entry.image);
    } else {
      _currentCandidates = null;
      UI.showResultFromHistory(entry.image, beforeImage);
    }

    // text-to-image履歴の場合は要素一覧をスキップ
    if (entry.json && entry.json.mode === 'text-to-image') {
      const editSection = document.getElementById('editSection');
      const elementsSection = document.getElementById('elementsSection');
      if (editSection) editSection.classList.add('hidden');
      if (elementsSection) elementsSection.classList.add('hidden');
      return;
    }

    UI.updateMainPreview(entry.image);
    UI.renderElements(entry.json);
  }

  // 履歴変更時のコールバック
  function onHistoryChange(entries, currentIndex) {
    if (entries.length > 0) {
      UI.renderHistory(entries, currentIndex);
    }
    autoSave();
  }

  // MIMEタイプから拡張子を取得
  function getExtFromMime(mime) {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    return '.jpg';
  }

  // 現在の画像をダウンロード
  function downloadCurrent() {
    const current = EditHistory.getCurrent();
    if (current) {
      const ext = getExtFromMime(current.image && current.image.mimeType);
      EditHistory.downloadImage(current, `ai_edit_v${current.id}${ext}`);
    } else if (state.currentImage) {
      // 履歴がない場合は現在の画像をダウンロード
      const ext = getExtFromMime(state.currentImage.mimeType);
      const link = document.createElement('a');
      link.href = `data:${state.currentImage.mimeType};base64,${state.currentImage.base64}`;
      link.download = `ai_edit${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // --- プロジェクト保存・読み込み ---

  // 現在のセッションをIndexedDBに保存
  // overwrite: true=上書き保存, false=新規保存
  async function saveProject(name, overwrite = true) {
    const entries = EditHistory.toSerializable();

    // 最終エントリのサムネイルをプロジェクトサムネイルに使用
    const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
    const thumbnail = lastEntry ? (lastEntry.thumbnailUrl || '') : '';

    // 新規保存の場合はIDをクリア
    const projectId = overwrite ? currentProjectId : null;

    try {
      const projectData = {
        id: projectId || undefined,
        name: name || `プロジェクト ${new Date().toLocaleString('ja-JP')}`,
        createdAt: projectId ? undefined : undefined,
        thumbnail: thumbnail,
        originalImage: state.originalImage,
        entries: entries,
      };

      const saved = await ProjectStorage.saveProject(projectData);
      currentProjectId = saved.id;
      UI.showSuccess(projectId ? '上書き保存しました' : '新規保存しました');
    } catch (err) {
      UI.showError('保存に失敗しました: ' + err.message);
    }
  }

  // 現在のプロジェクトIDを取得
  function getCurrentProjectId() {
    return currentProjectId;
  }

  // プロジェクトを読み込んで復元
  async function loadProject(id) {
    try {
      const project = await ProjectStorage.loadProject(id);
      if (!project.entries || project.entries.length === 0) {
        UI.showError('プロジェクトに履歴データがありません');
        return;
      }

      // 状態をリセット
      cancelCurrentOperation();
      state.selectedElements = [];
      UI.clearSelectedElements();
      EditHistory.clear();

      // 元画像を復元
      state.originalImage = project.originalImage || project.entries[0].image;
      state.currentImage = project.entries[project.entries.length - 1].image;
      state.currentJson = project.entries[project.entries.length - 1].json;
      state.originalJson = state.currentJson ? JSON.parse(JSON.stringify(state.currentJson)) : null;

      // 履歴を復元
      EditHistory.fromSerializable(project.entries);
      currentProjectId = project.id;

      // UIを復元
      const lastEntry = project.entries[project.entries.length - 1];
      if (lastEntry.image) {
        UI.updateMainPreview(lastEntry.image);
        // プレビューエリアを表示
        const imagePreview = document.getElementById('imagePreview');
        const uploadPrompt = document.querySelector('#uploadArea .upload-prompt');
        const analysisSection = document.getElementById('analysisSection');
        if (imagePreview) imagePreview.classList.remove('hidden');
        if (uploadPrompt) uploadPrompt.classList.add('hidden');
        if (analysisSection) analysisSection.classList.remove('hidden');
      }

      // JSONがあれば要素一覧を表示
      if (state.currentJson && state.currentJson.scene) {
        UI.renderElements(state.currentJson);
      }

      // Before画像を復元して結果表示
      if (project.entries.length > 1) {
        let beforeImage = null;
        if (lastEntry.parentId != null && lastEntry.parentId >= 0) {
          const parent = project.entries.find(e => e.id === lastEntry.parentId);
          if (parent) beforeImage = parent.image;
        }
        UI.showResultFromHistory(lastEntry.image, beforeImage);
      }

      // プロジェクト読み込み時もタブバーを非表示
      const subTabBar = document.getElementById('subTabBar');
      if (subTabBar) subTabBar.classList.add('hidden');

      UI.hideProjectModal();
      UI.showSuccess(`「${project.name}」を読み込みました`);
    } catch (err) {
      UI.showError('読み込みに失敗しました: ' + err.message);
    }
  }

  // エクスポート
  async function exportProject(id) {
    try {
      await ProjectStorage.exportProject(id);
      UI.showSuccess('プロジェクトをエクスポートしました');
    } catch (err) {
      UI.showError('エクスポートに失敗しました: ' + err.message);
    }
  }

  // インポート
  async function importProject(file) {
    const saved = await ProjectStorage.importProject(file);
    UI.showSuccess(`「${saved.name}」をインポートしました`);
    return saved;
  }

  // プロジェクト削除
  async function deleteProject(id) {
    if (!confirm('このプロジェクトを削除しますか？')) return;
    try {
      await ProjectStorage.deleteProject(id);
      if (currentProjectId === id) currentProjectId = null;
      await UI.renderProjectList();
      UI.showSuccess('プロジェクトを削除しました');
    } catch (err) {
      UI.showError('削除に失敗しました: ' + err.message);
    }
  }

  return {
    init,
    onImageUploaded,
    onImageRemoved,
    onReferenceUploaded,
    onReferenceRemoved,
    onElementsSelected,
    onGeneratedImageReady,
    onImageAdopted,
    analyze,
    generate,
    goToHistory,
    downloadCurrent,
    getState: () => state,
    clearProject,
    saveProject,
    getCurrentProjectId,
    loadProject,
    exportProject,
    importProject,
    deleteProject,
  };
})();

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
