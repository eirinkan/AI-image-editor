// テキストから画像生成モジュール（プロンプトエンジニアフロー）

const TextToImage = (() => {
  // 状態
  const state = {
    aspectRatio: '1:1',
    imageSize: '2K',
    craftedResult: null, // { prompt, recommended_settings, explanation }
    lastGeneratedImage: null, // { base64, mimeType }
  };

  // AbortController管理
  let currentAbortController = null;

  function cancelCurrentOperation() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  function init() {
    // サブタブ切替（アップロード / AI生成）
    const subTabUpload = document.getElementById('subTabUpload');
    const subTabGenerate = document.getElementById('subTabGenerate');
    if (subTabUpload) subTabUpload.addEventListener('click', () => switchSubTab('upload'));
    if (subTabGenerate) subTabGenerate.addEventListener('click', () => switchSubTab('generate'));

    // アスペクト比ボタン
    const aspectList = document.getElementById('aspectRatioList');
    if (aspectList) {
      aspectList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-ratio]');
        if (!btn) return;
        selectAspectRatio(btn.dataset.ratio);
      });
    }

    // 解像度ボタン
    const sizeList = document.getElementById('imageSizeList');
    if (sizeList) {
      sizeList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-size]');
        if (!btn) return;
        selectImageSize(btn.dataset.size);
      });
    }

    // 「プロンプトを作成」ボタン
    const craftBtn = document.getElementById('craftPromptBtn');
    if (craftBtn) craftBtn.addEventListener('click', craftAndReview);

    // 「戻って修正」ボタン
    const backBtn = document.getElementById('promptBackBtn');
    if (backBtn) backBtn.addEventListener('click', hidePromptReview);

    // 「承認して生成」ボタン
    const approveBtn = document.getElementById('promptApproveBtn');
    if (approveBtn) approveBtn.addEventListener('click', approveAndGenerate);

    // 「再生成」ボタン
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (regenerateBtn) regenerateBtn.addEventListener('click', approveAndGenerate);

    // 「ダウンロード」ボタン（生成結果プレビュー用）
    const downloadGeneratedBtn = document.getElementById('downloadGeneratedBtn');
    if (downloadGeneratedBtn) {
      downloadGeneratedBtn.addEventListener('click', () => {
        if (!state.lastGeneratedImage) return;
        const ext = getExtFromMime(state.lastGeneratedImage.mimeType);
        const link = document.createElement('a');
        link.href = `data:${state.lastGeneratedImage.mimeType};base64,${state.lastGeneratedImage.base64}`;
        link.download = `ai_generated${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  // MIMEタイプから拡張子を取得
  function getExtFromMime(mime) {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    return '.jpg';
  }

  // ========== サブタブ切替（アップロード / AI生成） ==========
  function switchSubTab(tab) {
    const uploadPanel = document.getElementById('uploadPanel');
    const generatePanel = document.getElementById('generatePanel');
    const subTabUpload = document.getElementById('subTabUpload');
    const subTabGenerate = document.getElementById('subTabGenerate');

    if (tab === 'upload') {
      uploadPanel.classList.remove('hidden');
      generatePanel.classList.add('hidden');
      subTabUpload.classList.add('active');
      subTabGenerate.classList.remove('active');
      subTabGenerate.classList.add('text-gray-500', 'dark:text-gray-400');
      subTabUpload.classList.remove('text-gray-500', 'dark:text-gray-400');

      // アップロードタブに切り替えた際、生成フローの状態をリセット
      const ideaInputSection = document.getElementById('ideaInputSection');
      const promptReviewSection = document.getElementById('promptReviewSection');
      const generateResultPreview = document.getElementById('generateResultPreview');
      if (ideaInputSection) ideaInputSection.classList.remove('hidden');
      if (promptReviewSection) promptReviewSection.classList.add('hidden');
      if (generateResultPreview) generateResultPreview.classList.add('hidden');
    } else {
      uploadPanel.classList.add('hidden');
      generatePanel.classList.remove('hidden');
      subTabGenerate.classList.add('active');
      subTabUpload.classList.remove('active');
      subTabUpload.classList.add('text-gray-500', 'dark:text-gray-400');
      subTabGenerate.classList.remove('text-gray-500', 'dark:text-gray-400');

      // 生成タブに切り替えた際、フローの状態をリセット
      const ideaInputSection = document.getElementById('ideaInputSection');
      const promptReviewSection = document.getElementById('promptReviewSection');
      const generateResultPreview = document.getElementById('generateResultPreview');
      if (ideaInputSection) ideaInputSection.classList.remove('hidden');
      if (promptReviewSection) promptReviewSection.classList.add('hidden');
      if (generateResultPreview) generateResultPreview.classList.add('hidden');
    }
  }

  // ========== アスペクト比・解像度 ==========

  function selectAspectRatio(ratio) {
    state.aspectRatio = ratio;
    const aspectList = document.getElementById('aspectRatioList');
    if (!aspectList) return;
    aspectList.querySelectorAll('.aspect-btn').forEach(b => {
      b.classList.remove('selected');
      b.classList.add('border-gray-200', 'text-gray-600', 'dark:text-gray-300');
    });
    const target = aspectList.querySelector(`[data-ratio="${ratio}"]`);
    if (target) {
      target.classList.add('selected');
      target.classList.remove('border-gray-200', 'text-gray-600', 'dark:text-gray-300');
    }
  }

  function selectImageSize(size) {
    state.imageSize = size;
    const sizeList = document.getElementById('imageSizeList');
    if (!sizeList) return;
    sizeList.querySelectorAll('.size-btn').forEach(b => {
      b.classList.remove('selected');
      b.classList.add('border-gray-200', 'text-gray-600', 'dark:text-gray-300');
    });
    const target = sizeList.querySelector(`[data-size="${size}"]`);
    if (target) {
      target.classList.add('selected');
      target.classList.remove('border-gray-200', 'text-gray-600', 'dark:text-gray-300');
    }
  }

  // ========== プロンプト作成フロー ==========

  // 日本語入力からプロンプトを作成してレビュー画面を表示
  async function craftAndReview() {
    const userInput = document.getElementById('userIdeaInput').value.trim();
    if (!userInput) {
      UI.showError('作りたい画像のイメージを入力してください。');
      return;
    }
    if (!GeminiAPI.getApiKey()) {
      UI.showError('APIキーを入力してください。');
      return;
    }

    cancelCurrentOperation();
    currentAbortController = new AbortController();

    try {
      UI.showLoading('プロンプトを作成中...', { showCancel: true });
      const cancelBtn = document.getElementById('cancelBtn');
      if (cancelBtn) cancelBtn.addEventListener('click', () => cancelCurrentOperation(), { once: true });

      const result = await GeminiAPI.craftPrompt(userInput, currentAbortController.signal);
      state.craftedResult = result;

      // 生成されたプロンプトをテキストエリアに表示
      const promptEditArea = document.getElementById('promptEditArea');
      if (promptEditArea) promptEditArea.value = result.prompt || '';

      // 推奨アスペクト比のみ自動反映（解像度はコスト面からユーザー選択）
      if (result.recommended_settings) {
        if (result.recommended_settings.aspect_ratio) {
          selectAspectRatio(result.recommended_settings.aspect_ratio);
        }
      }

      // 解説を表示（簡易マークダウン変換）
      const explanationEl = document.getElementById('promptExplanation');
      if (explanationEl && result.explanation) {
        explanationEl.innerHTML = simpleMarkdown(result.explanation);
      }

      // 入力フォームを隠してレビュー画面を表示
      document.getElementById('ideaInputSection').classList.add('hidden');
      document.getElementById('promptReviewSection').classList.remove('hidden');
      document.getElementById('generateResultPreview').classList.add('hidden');

      UI.hideLoading();

      // レビューセクションにスクロール
      requestAnimationFrame(() => {
        document.getElementById('promptReviewSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('プロンプト作成をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
    }
  }

  // レビュー画面を隠して入力画面に戻る
  function hidePromptReview() {
    document.getElementById('promptReviewSection').classList.add('hidden');
    document.getElementById('ideaInputSection').classList.remove('hidden');
  }

  // プロンプトを承認して画像生成
  async function approveAndGenerate() {
    const promptEditArea = document.getElementById('promptEditArea');
    const prompt = promptEditArea ? promptEditArea.value.trim() : '';
    if (!prompt) {
      UI.showError('プロンプトが空です。');
      return;
    }

    if (!GeminiAPI.getApiKey()) {
      UI.showError('APIキーを入力してください。');
      return;
    }

    cancelCurrentOperation();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // ボタン無効化
    const approveBtn = document.getElementById('promptApproveBtn');
    const regenBtn = document.getElementById('regenerateBtn');
    if (approveBtn) approveBtn.disabled = true;
    if (regenBtn) regenBtn.disabled = true;

    try {
      UI.showLoading('画像を生成中...（20〜60秒かかります）', { showCancel: true });
      const cancelBtn = document.getElementById('cancelBtn');
      if (cancelBtn) cancelBtn.addEventListener('click', () => cancelCurrentOperation(), { once: true });

      const result = await GeminiAPI.generateFromText(prompt, {
        aspectRatio: state.aspectRatio,
        imageSize: state.imageSize,
      }, signal);

      const imageData = { base64: result.base64, mimeType: result.mimeType };
      state.lastGeneratedImage = imageData;

      // 生成結果プレビューを表示
      const resultImg = document.getElementById('generateResultImage');
      if (resultImg) resultImg.src = `data:${imageData.mimeType};base64,${imageData.base64}`;

      document.getElementById('generateResultPreview').classList.remove('hidden');
      document.getElementById('promptReviewSection').classList.add('hidden');

      // 履歴に追加
      const userInput = document.getElementById('userIdeaInput').value || prompt;
      const label = '生成: ' + userInput.slice(0, 30) + (userInput.length > 30 ? '...' : '');
      await EditHistory.createEntry(imageData, { prompt, mode: 'text-to-image', aspectRatio: state.aspectRatio }, label);

      UI.hideLoading();
      UI.showSuccess('画像の生成が完了しました');

      // 生成結果にスクロール
      requestAnimationFrame(() => {
        document.getElementById('generateResultPreview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('生成をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    } finally {
      currentAbortController = null;
      if (approveBtn) approveBtn.disabled = false;
      if (regenBtn) regenBtn.disabled = false;
    }
  }

  // ========== 簡易マークダウン変換 ==========

  // HTMLエスケープ
  function escapeHtmlLocal(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  }

  function simpleMarkdown(text) {
    if (!text) return '';
    // 先にHTMLエスケープしてからマークダウン変換（XSS防止）
    let escaped = escapeHtmlLocal(text);
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h4 class="font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2 text-base">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm text-gray-600 dark:text-gray-300">$1</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  return {
    init,
    switchSubTab,
    hidePromptReview,
    approveAndGenerate,
  };
})();
