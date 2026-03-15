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
  };

  // 初期化
  function init() {
    UI.init();
    EditHistory.onChange(onHistoryChange);
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

    try {
      UI.showLoading('画像を分析中...');
      const json = await GeminiAPI.analyzeImage(state.currentImage, focusTags, customInstruction);
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
      UI.showError(err.message);
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

    try {
      // Step 1: JSONを一括更新
      UI.showLoading(`変更内容をJSONに反映中...（${editInstructions.length}件の指示）`);
      const updatedJson = await GeminiAPI.updateJson(state.currentJson, editInstructions);

      // Step 2: 画像を生成
      UI.showLoading('画像を生成中...（20〜60秒かかります）');
      const result = await GeminiAPI.generateImage(
        state.currentImage,
        state.currentJson,
        updatedJson,
        state.referenceImage
      );

      // 状態更新
      const newImageData = { base64: result.base64, mimeType: result.mimeType };
      state.currentImage = newImageData;
      state.currentJson = updatedJson;
      state.originalJson = JSON.parse(JSON.stringify(updatedJson));

      // 結果表示
      UI.showResult(newImageData);
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
      UI.showError(err.message);
    }
  }

  // 履歴の特定の時点に戻る
  function goToHistory(index) {
    const entry = EditHistory.goTo(index);
    if (!entry) return;

    // 状態を復元
    state.currentImage = entry.image;
    state.currentJson = entry.json;
    state.originalJson = JSON.parse(JSON.stringify(entry.json));

    // UI更新
    UI.updateMainPreview(entry.image);
    UI.renderElements(entry.json);
    UI.updateJsonDisplay(entry.json);
    UI.showResult(entry.image);
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
