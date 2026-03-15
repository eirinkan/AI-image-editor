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

  // 初期化
  function init() {
    UI.init();
    TextToImage.init();
    EditHistory.onChange(onHistoryChange);
  }

  // AI生成した画像を編集モードで使用する
  function onGeneratedImageEdit(imageData) {
    state.originalImage = imageData;
    state.currentImage = imageData;
    state.currentJson = null;
    state.originalJson = null;
    EditHistory.clear();

    // プレビュー画像を表示してanalysisSection を開く
    const previewImage = document.getElementById('previewImage');
    const imagePreview = document.getElementById('imagePreview');
    const uploadPrompt = document.querySelector('#uploadArea .upload-prompt');
    const analysisSection = document.getElementById('analysisSection');

    const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
    if (previewImage) previewImage.src = dataUrl;
    const previewImageClean = document.getElementById('previewImageClean');
    if (previewImageClean) previewImageClean.src = dataUrl;
    if (imagePreview) imagePreview.classList.remove('hidden');
    if (uploadPrompt) uploadPrompt.classList.add('hidden');
    if (analysisSection) analysisSection.classList.remove('hidden');
  }

  // 画像がアップロードされた
  function onImageUploaded(imageData) {
    state.originalImage = imageData;
    state.currentImage = imageData;
    state.currentJson = null;
    state.originalJson = null;
    EditHistory.clear();
  }

  // 画像が削除された
  function onImageRemoved() {
    state.originalImage = null;
    state.currentImage = null;
    state.referenceImage = null;
    state.currentJson = null;
    state.originalJson = null;
    state.selectedElements = [];
    UI.clearSelectedElements();
    EditHistory.clear();
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

    const focusTags = UI.getSelectedFocusTags();
    const customInstruction = UI.getCustomInstruction();

    // AbortController設定
    cancelCurrentOperation();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

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
      UI.updateJsonDisplay(json);

      // 初回分析時にオリジナルとして履歴に追加
      if (EditHistory.getAll().length === 0) {
        EditHistory.createEntry(state.currentImage, json);
      }

      UI.hideLoading();
      UI.showSuccess('画像の分析が完了しました');
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('分析をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
    }
  }

  // 画像を生成（複数指示対応）
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

    // AbortController設定
    cancelCurrentOperation();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // 生成前の画像を保持（Before/After比較用）
    const imageBeforeGeneration = { ...state.currentImage };

    try {
      // ステップ付きローディング表示
      UI.showLoadingWithSteps(() => cancelCurrentOperation());

      // Step 1: JSONを一括更新
      UI.updateLoadingStep(1);
      const updatedJson = await GeminiAPI.updateJson(state.currentJson, editInstructions, signal);
      state.pendingJson = updatedJson; // リカバリ用に保持

      // Step 2: 画像を生成
      UI.updateLoadingStep(2);
      const result = await GeminiAPI.generateImage(
        state.currentImage,
        state.currentJson,
        updatedJson,
        state.referenceImage,
        signal
      );

      // 状態更新
      const newImageData = { base64: result.base64, mimeType: result.mimeType };
      state.currentImage = newImageData;
      state.currentJson = updatedJson;
      state.originalJson = JSON.parse(JSON.stringify(updatedJson));
      state.pendingJson = null;

      // 結果表示（元画像も渡してBefore/After比較を有効化）
      UI.showResult(newImageData, imageBeforeGeneration);
      UI.updateJsonDisplay(updatedJson);
      UI.updateMainPreview(newImageData);

      // 履歴ラベルを作成（複数指示を結合）
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
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('生成をキャンセルしました');
        state.pendingJson = null;
      } else if (state.pendingJson) {
        // JSON更新は成功したが画像生成に失敗した場合
        UI.showError(`画像生成に失敗しました: ${err.message}\nJSON更新は完了しています。「画像を生成」ボタンで再試行できます。`);
        // JSONは更新済みの状態を維持
        state.currentJson = state.pendingJson;
        state.originalJson = JSON.parse(JSON.stringify(state.pendingJson));
        UI.updateJsonDisplay(state.pendingJson);
        state.pendingJson = null;
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
    }
  }

  // 履歴の特定の時点に戻る
  function goToHistory(index) {
    const entry = EditHistory.goTo(index);
    if (!entry) return;

    // 状態を復元
    state.currentImage = entry.image;
    state.currentJson = entry.json;
    state.originalJson = entry.json && !entry.json.mode ? JSON.parse(JSON.stringify(entry.json)) : null;

    // UI更新
    UI.showResult(entry.image);

    // text-to-image履歴の場合は要素一覧・JSON表示をスキップ
    if (entry.json && entry.json.mode === 'text-to-image') {
      return;
    }

    UI.updateMainPreview(entry.image);
    UI.renderElements(entry.json);
    UI.updateJsonDisplay(entry.json);
  }

  // 履歴変更時のコールバック
  function onHistoryChange(entries, currentIndex) {
    if (entries.length > 0) {
      UI.renderHistory(entries, currentIndex);
    }
  }

  // 現在の画像をダウンロード
  function downloadCurrent() {
    const current = EditHistory.getCurrent();
    if (current) {
      EditHistory.downloadImage(current, `ai_edit_v${current.id}.jpg`);
    } else if (state.currentImage) {
      // 履歴がない場合は現在の画像をダウンロード
      const link = document.createElement('a');
      link.href = `data:${state.currentImage.mimeType};base64,${state.currentImage.base64}`;
      link.download = 'ai_edit.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return {
    init,
    onImageUploaded,
    onImageRemoved,
    onReferenceUploaded,
    onReferenceRemoved,
    onElementsSelected,
    onGeneratedImageEdit,
    analyze,
    generate,
    goToHistory,
    downloadCurrent,
  };
})();

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
