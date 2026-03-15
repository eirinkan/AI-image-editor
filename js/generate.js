// テキストから画像生成モジュール

const TextToImage = (() => {
  // テンプレート定義
  const TEMPLATES = {
    photo: {
      label: 'フォトリアル',
      icon: '📸',
      description: '実写風の高品質な写真',
      params: [
        { key: 'shot_type', label: 'ショットタイプ', placeholder: 'close-up / wide angle / aerial' },
        { key: 'subject', label: '被写体', placeholder: 'a young woman / a vintage car' },
        { key: 'action', label: '動作・表情', placeholder: 'smiling gently / running fast' },
        { key: 'environment', label: '環境', placeholder: 'a sunlit forest / a busy city street' },
        { key: 'lighting', label: '照明', placeholder: 'golden hour sunlight / soft studio lighting' },
        { key: 'mood', label: '雰囲気', placeholder: 'warm and peaceful / dramatic' },
        { key: 'camera', label: 'カメラ・レンズ', placeholder: 'Canon EOS R5, 85mm f/1.4' },
      ],
      template: 'A photorealistic [shot_type] of [subject], [action], set in [environment]. The scene is illuminated by [lighting], creating a [mood] atmosphere. Captured with a [camera], emphasizing fine textures and details.',
    },
    portrait: {
      label: 'ポートレート',
      icon: '🧑',
      description: '人物写真・肖像画',
      params: [
        { key: 'subject', label: '人物', placeholder: 'an elderly Japanese potter / a young musician' },
        { key: 'expression', label: '表情・ポーズ', placeholder: 'looking contemplative / laughing warmly' },
        { key: 'clothing', label: '服装', placeholder: 'traditional kimono / casual streetwear' },
        { key: 'background', label: '背景', placeholder: 'blurred bokeh / studio backdrop' },
        { key: 'lighting', label: '照明', placeholder: 'Rembrandt lighting / natural window light' },
        { key: 'camera', label: 'カメラ設定', placeholder: '85mm f/1.4, shallow depth of field' },
      ],
      template: 'A photorealistic portrait of [subject], [expression], wearing [clothing]. The background is [background]. Lit with [lighting]. Shot with [camera]. Highly detailed skin texture and natural colors.',
    },
    sticker: {
      label: 'ステッカー',
      icon: '🎨',
      description: 'イラスト・アイコン',
      params: [
        { key: 'style', label: 'スタイル', placeholder: 'cute kawaii / flat vector / watercolor' },
        { key: 'subject', label: '題材', placeholder: 'a fluffy cat / a smiling sun' },
        { key: 'characteristics', label: '特徴', placeholder: 'big sparkly eyes, tiny paws' },
        { key: 'color_palette', label: '配色', placeholder: 'pastel pink and mint green' },
        { key: 'line_style', label: '線のスタイル', placeholder: 'bold black outline / no outline' },
        { key: 'shading', label: '影のスタイル', placeholder: 'flat shading / soft gradient' },
      ],
      template: 'A [style] sticker of a [subject], featuring [characteristics] and a [color_palette] color palette. The design should have [line_style] and [shading]. The background must be transparent.',
    },
    text_logo: {
      label: 'ロゴ・テキスト',
      icon: '🔤',
      description: 'ロゴ・バナーデザイン',
      params: [
        { key: 'image_type', label: '種類', placeholder: 'logo / banner / badge' },
        { key: 'brand', label: 'ブランド名', placeholder: 'My Coffee Shop' },
        { key: 'text', label: '表示テキスト', placeholder: 'Good Morning' },
        { key: 'font_style', label: 'フォント', placeholder: 'bold sans-serif / elegant serif' },
        { key: 'style_desc', label: 'スタイル', placeholder: 'modern and minimal / retro vintage' },
        { key: 'color_scheme', label: '配色', placeholder: 'black and gold / bright neon' },
      ],
      template: 'Create a [image_type] for [brand] with the text "[text]" in a [font_style] font. The design should be [style_desc], with a [color_scheme] color scheme.',
    },
    product: {
      label: '商品写真',
      icon: '📦',
      description: 'スタジオ品質の商品撮影',
      params: [
        { key: 'product', label: '商品', placeholder: 'ceramic coffee mug / leather wallet' },
        { key: 'background', label: '背景', placeholder: 'white marble surface / dark wood table' },
        { key: 'lighting', label: '照明', placeholder: 'three-point softbox / soft diffused light' },
        { key: 'angle', label: 'アングル', placeholder: 'front-facing / 45-degree angle' },
        { key: 'feature', label: '注目ポイント', placeholder: 'the engraved logo / the textured surface' },
      ],
      template: 'A high-resolution, studio-lit product photograph of a [product] on a [background]. The lighting is a [lighting]. The camera angle is a [angle] to showcase [feature]. Ultra-realistic, with sharp focus.',
    },
    negative: {
      label: 'ネガティブスペース',
      icon: '⬜',
      description: 'ミニマリストな余白',
      params: [
        { key: 'subject', label: '被写体', placeholder: 'single red apple / lone lighthouse' },
        { key: 'position', label: '配置', placeholder: 'bottom-right / center-left' },
        { key: 'bg_color', label: '背景色', placeholder: 'pure white / soft beige / deep navy' },
      ],
      template: 'A minimalist composition featuring a single [subject] positioned in the [position] of the frame. The background is a vast, empty [bg_color] canvas, creating significant negative space. Soft, subtle lighting.',
    },
    comic: {
      label: 'コミック',
      icon: '💥',
      description: 'マンガ・コミックパネル',
      params: [
        { key: 'style', label: 'スタイル', placeholder: 'manga / American comic / noir art' },
        { key: 'character', label: 'キャラクター', placeholder: 'a detective in a trench coat' },
        { key: 'scene', label: 'シーン', placeholder: 'a rainy alley at night / a rooftop chase' },
        { key: 'panels', label: 'パネル数', placeholder: '3 panel / single panel' },
      ],
      template: 'Make a [panels] comic in a [style] style. The character is [character]. Put the character in [scene]. Include speech bubbles and dynamic action lines.',
    },
    infographic: {
      label: 'インフォグラフィック',
      icon: '📊',
      description: '図解・データビジュアル',
      params: [
        { key: 'topic', label: 'トピック', placeholder: 'photosynthesis / coffee brewing process' },
        { key: 'style', label: 'スタイル', placeholder: 'fun recipe card / scientific diagram' },
        { key: 'color_scheme', label: '配色', placeholder: 'bright and colorful / earth tones' },
      ],
      template: 'Create a vibrant infographic that explains [topic] as if it were [style]. Use clear labels, icons, and a [color_scheme] color scheme. Make it educational and visually engaging.',
    },
    food: {
      label: 'フード写真',
      icon: '🍽️',
      description: '料理・食べ物の写真',
      params: [
        { key: 'dish', label: '料理', placeholder: 'sushi platter / chocolate lava cake' },
        { key: 'plating', label: '盛り付け', placeholder: 'elegant fine dining / rustic homestyle' },
        { key: 'background', label: '背景・テーブル', placeholder: 'dark slate table / wooden cutting board' },
        { key: 'lighting', label: '照明', placeholder: 'warm overhead light / natural window light' },
        { key: 'garnish', label: 'ガーニッシュ', placeholder: 'fresh herbs and microgreens' },
      ],
      template: 'A professional food photograph of [dish], [plating] style plating, on [background]. Lit with [lighting]. Garnished with [garnish]. Ultra-sharp focus, appetizing colors, food magazine quality.',
    },
    architecture: {
      label: '建築・インテリア',
      icon: '🏛️',
      description: '建築物・室内デザイン',
      params: [
        { key: 'type', label: '種類', placeholder: 'modern house exterior / cozy living room' },
        { key: 'style', label: 'デザインスタイル', placeholder: 'Scandinavian / Japanese minimalist / Art Deco' },
        { key: 'materials', label: '素材', placeholder: 'concrete and glass / warm wood and stone' },
        { key: 'lighting', label: '照明', placeholder: 'golden hour / soft ambient interior light' },
        { key: 'details', label: '特徴的なディテール', placeholder: 'floor-to-ceiling windows / floating staircase' },
      ],
      template: 'A photorealistic architectural visualization of [type] in [style] style. Built with [materials]. The scene is lit with [lighting]. Featuring [details]. Professional architectural photography quality.',
    },
    landscape: {
      label: '風景',
      icon: '🏔️',
      description: '自然・風景写真',
      params: [
        { key: 'scene', label: 'シーン', placeholder: 'mountain lake at sunrise / cherry blossom avenue' },
        { key: 'weather', label: '天候・時間帯', placeholder: 'misty morning / dramatic sunset / starry night' },
        { key: 'mood', label: '雰囲気', placeholder: 'serene and tranquil / epic and dramatic' },
        { key: 'camera', label: 'カメラ設定', placeholder: 'wide angle 16mm / drone aerial shot' },
      ],
      template: 'A breathtaking landscape photograph of [scene] during [weather]. The atmosphere is [mood]. Captured with [camera]. Vivid colors, incredible detail, National Geographic quality.',
    },
    fashion: {
      label: 'ファッション',
      icon: '👗',
      description: 'ファッション写真・ルックブック',
      params: [
        { key: 'model', label: 'モデル', placeholder: 'a confident young woman / a stylish man' },
        { key: 'outfit', label: '衣装', placeholder: 'oversized blazer with sneakers / flowing silk dress' },
        { key: 'setting', label: 'ロケーション', placeholder: 'urban rooftop / white studio' },
        { key: 'mood', label: 'ムード', placeholder: 'editorial high fashion / casual streetwear' },
        { key: 'lighting', label: '照明', placeholder: 'harsh flash / soft golden light' },
      ],
      template: 'A high-fashion editorial photograph of [model] wearing [outfit], shot in [setting]. The mood is [mood]. Lit with [lighting]. Vogue magazine quality, sharp focus on fabric textures and details.',
    },
  };

  // パラメータの日本語解説マップ（key → ラベル + 説明生成関数）
  const PARAM_LABELS = {
    shot_type: { icon: '📸', label: 'ショットタイプ' },
    subject: { icon: '🎯', label: '被写体' },
    action: { icon: '🏃', label: '動作・表情' },
    environment: { icon: '🌍', label: '環境' },
    lighting: { icon: '💡', label: '照明' },
    mood: { icon: '🎭', label: '雰囲気' },
    camera: { icon: '📷', label: 'カメラ・レンズ' },
    expression: { icon: '😊', label: '表情・ポーズ' },
    clothing: { icon: '👔', label: '服装' },
    background: { icon: '🖼️', label: '背景' },
    style: { icon: '🎨', label: 'スタイル' },
    characteristics: { icon: '✨', label: '特徴' },
    color_palette: { icon: '🎨', label: '配色' },
    line_style: { icon: '✏️', label: '線のスタイル' },
    shading: { icon: '🌑', label: '影のスタイル' },
    image_type: { icon: '🖼️', label: '種類' },
    brand: { icon: '🏷️', label: 'ブランド名' },
    text: { icon: '🔤', label: '表示テキスト' },
    font_style: { icon: '🔡', label: 'フォント' },
    style_desc: { icon: '✨', label: 'スタイル' },
    color_scheme: { icon: '🎨', label: '配色' },
    product: { icon: '📦', label: '商品' },
    angle: { icon: '📐', label: 'アングル' },
    feature: { icon: '🔍', label: '注目ポイント' },
    position: { icon: '📍', label: '配置' },
    bg_color: { icon: '🖌️', label: '背景色' },
    character: { icon: '🦸', label: 'キャラクター' },
    scene: { icon: '🎬', label: 'シーン' },
    panels: { icon: '📄', label: 'パネル数' },
    topic: { icon: '📚', label: 'トピック' },
    dish: { icon: '🍽️', label: '料理' },
    plating: { icon: '🍱', label: '盛り付け' },
    garnish: { icon: '🌿', label: 'ガーニッシュ' },
    type: { icon: '🏛️', label: '種類' },
    materials: { icon: '🧱', label: '素材' },
    details: { icon: '🔍', label: 'ディテール' },
    weather: { icon: '🌤️', label: '天候・時間帯' },
    model: { icon: '🧑', label: 'モデル' },
    outfit: { icon: '👗', label: '衣装' },
    setting: { icon: '📍', label: 'ロケーション' },
  };

  // 状態
  const state = {
    subMode: 'template', // 'template' | 'freeform'
    selectedCategory: null,
    templateValues: {},
    aspectRatio: '1:1',
    imageSize: '1K',
    categoryRendered: false,
    lastGeneratedImageData: null, // 最後に生成した画像データ
    lastGeneratedPrompt: '',      // 最後に使用したプロンプト
  };

  function init() {
    // サブタブ切替（アップロード / AI生成）
    const subTabUpload = document.getElementById('subTabUpload');
    const subTabGenerate = document.getElementById('subTabGenerate');
    if (subTabUpload) subTabUpload.addEventListener('click', () => switchSubTab('upload'));
    if (subTabGenerate) subTabGenerate.addEventListener('click', () => switchSubTab('generate'));

    // サブモード切替（テンプレート / 自由入力）
    const consultBtn = document.getElementById('consultModeBtn');
    const freeformBtn = document.getElementById('freeformModeBtn');
    if (consultBtn) consultBtn.addEventListener('click', () => switchSubMode('template'));
    if (freeformBtn) freeformBtn.addEventListener('click', () => switchSubMode('freeform'));

    // アスペクト比
    const aspectList = document.getElementById('aspectRatioList');
    if (aspectList) {
      aspectList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-ratio]');
        if (!btn) return;
        state.aspectRatio = btn.dataset.ratio;
        aspectList.querySelectorAll('.aspect-btn').forEach(b => {
          b.classList.remove('selected');
          b.classList.add('border-gray-200', 'text-gray-600');
        });
        btn.classList.add('selected');
        btn.classList.remove('border-gray-200', 'text-gray-600');
      });
    }

    // 解像度
    const sizeList = document.getElementById('imageSizeList');
    if (sizeList) {
      sizeList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-size]');
        if (!btn) return;
        state.imageSize = btn.dataset.size;
        sizeList.querySelectorAll('.size-btn').forEach(b => {
          b.classList.remove('selected');
          b.classList.add('border-gray-200', 'text-gray-600');
        });
        btn.classList.add('selected');
        btn.classList.remove('border-gray-200', 'text-gray-600');
      });
    }

    // プロンプト確認ボタン
    const reviewBtn = document.getElementById('promptReviewBtn');
    if (reviewBtn) reviewBtn.addEventListener('click', showPromptReview);

    // 承認して生成ボタン
    const approveBtn = document.getElementById('promptApproveBtn');
    if (approveBtn) approveBtn.addEventListener('click', approveAndGenerate);

    // 戻って修正ボタン
    const backBtn = document.getElementById('promptBackBtn');
    if (backBtn) backBtn.addEventListener('click', hidePromptReview);

    // 「この画像を編集する」ボタン
    const editGeneratedBtn = document.getElementById('editGeneratedBtn');
    if (editGeneratedBtn) editGeneratedBtn.addEventListener('click', editGeneratedImage);

    // 「再生成」ボタン
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (regenerateBtn) regenerateBtn.addEventListener('click', () => {
      // 生成結果プレビューを隠してプロンプト確認に戻る
      document.getElementById('generateResultPreview').classList.add('hidden');
      showPromptReview();
    });

    // 「ダウンロード」ボタン（生成結果プレビュー用）
    const downloadGeneratedBtn = document.getElementById('downloadGeneratedBtn');
    if (downloadGeneratedBtn) {
      downloadGeneratedBtn.addEventListener('click', () => {
        if (!state.lastGeneratedImageData) return;
        const link = document.createElement('a');
        link.href = `data:${state.lastGeneratedImageData.mimeType};base64,${state.lastGeneratedImageData.base64}`;
        link.download = 'ai_generated.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    // カテゴリカードを初期描画
    renderCategoryCards();
    state.categoryRendered = true;
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
      subTabGenerate.classList.add('text-gray-500');
      subTabUpload.classList.remove('text-gray-500');
    } else {
      uploadPanel.classList.add('hidden');
      generatePanel.classList.remove('hidden');
      subTabGenerate.classList.add('active');
      subTabUpload.classList.remove('active');
      subTabUpload.classList.add('text-gray-500');
      subTabGenerate.classList.remove('text-gray-500');
    }
  }

  // ========== サブモード切替（テンプレート / 自由入力） ==========
  function switchSubMode(mode) {
    state.subMode = mode;
    const templateMode = document.getElementById('templateMode');
    const freeformMode = document.getElementById('freeformMode');
    const consultBtn = document.getElementById('consultModeBtn');
    const freeformBtn = document.getElementById('freeformModeBtn');

    if (mode === 'template') {
      templateMode.classList.remove('hidden');
      freeformMode.classList.add('hidden');
      consultBtn.classList.add('bg-purple-500', 'text-white');
      consultBtn.classList.remove('bg-gray-200', 'text-gray-600');
      freeformBtn.classList.remove('bg-purple-500', 'text-white');
      freeformBtn.classList.add('bg-gray-200', 'text-gray-600');
    } else {
      templateMode.classList.add('hidden');
      freeformMode.classList.remove('hidden');
      freeformBtn.classList.add('bg-purple-500', 'text-white');
      freeformBtn.classList.remove('bg-gray-200', 'text-gray-600');
      consultBtn.classList.remove('bg-purple-500', 'text-white');
      consultBtn.classList.add('bg-gray-200', 'text-gray-600');
    }
  }

  // ========== プロンプト確認フロー ==========

  // プロンプト確認画面を表示
  function showPromptReview() {
    let prompt = '';

    if (state.subMode === 'freeform') {
      const textarea = document.getElementById('freeformPrompt');
      prompt = textarea ? textarea.value.trim() : '';
      if (!prompt) {
        UI.showError('プロンプトを入力してください。');
        return;
      }
    } else {
      if (!state.selectedCategory) {
        UI.showError('スタイルカテゴリを選択してください。');
        return;
      }
      // 未入力パラメータチェック
      const tmpl = TEMPLATES[state.selectedCategory];
      const emptyParams = tmpl.params.filter(p =>
        !state.templateValues[p.key] || !state.templateValues[p.key].trim()
      );
      if (emptyParams.length > 0) {
        UI.showError(`次のパラメータを入力してください: ${emptyParams.map(p => p.label).join(', ')}`);
        return;
      }
      prompt = buildPromptFromTemplate(state.selectedCategory, state.templateValues);
    }

    // テキストエリアにプロンプトをセット
    const promptEditArea = document.getElementById('promptEditArea');
    if (promptEditArea) promptEditArea.value = prompt;

    // 解説を生成・表示
    buildPromptExplanation();

    // 確認セクションを表示、生成結果プレビューを隠す
    document.getElementById('promptReviewSection').classList.remove('hidden');
    document.getElementById('generateResultPreview').classList.add('hidden');

    // スクロール
    requestAnimationFrame(() => {
      document.getElementById('promptReviewSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // プロンプト解説を生成
  function buildPromptExplanation() {
    const explanationEl = document.getElementById('promptExplanation');
    if (!explanationEl) return;

    explanationEl.innerHTML = '';

    if (state.subMode === 'freeform') {
      explanationEl.innerHTML = '<p class="text-gray-500 text-sm">自由入力モードです。上のテキストエリアで直接プロンプトを編集できます。</p>';
      return;
    }

    if (!state.selectedCategory) return;

    const tmpl = TEMPLATES[state.selectedCategory];
    const title = document.createElement('p');
    title.className = 'text-xs font-semibold text-gray-500 mb-2';
    title.textContent = `カテゴリ: ${tmpl.icon} ${tmpl.label}`;
    explanationEl.appendChild(title);

    // 各パラメータの解説
    tmpl.params.forEach(param => {
      const val = state.templateValues[param.key];
      if (!val || !val.trim()) return;

      const info = PARAM_LABELS[param.key] || { icon: '•', label: param.label };
      const row = document.createElement('div');
      row.className = 'flex items-start gap-2 py-1 border-b border-gray-100 last:border-0';
      row.innerHTML = `
        <span class="flex-shrink-0 text-base">${info.icon}</span>
        <div>
          <span class="font-medium text-gray-700 text-xs">${info.label}:</span>
          <span class="text-gray-600 text-xs ml-1">${escapeHtml(val)}</span>
        </div>
      `;
      explanationEl.appendChild(row);
    });
  }

  // プロンプト確認画面を閉じる
  function hidePromptReview() {
    document.getElementById('promptReviewSection').classList.add('hidden');
  }

  // 承認して生成
  async function approveAndGenerate() {
    const promptEditArea = document.getElementById('promptEditArea');
    const finalPrompt = promptEditArea ? promptEditArea.value.trim() : '';

    if (!finalPrompt) {
      UI.showError('プロンプトが空です。');
      return;
    }

    if (!GeminiAPI.getApiKey()) {
      UI.showError('APIキーを入力してください。');
      return;
    }

    state.lastGeneratedPrompt = finalPrompt;

    try {
      UI.showLoading('画像を生成中...（20〜60秒かかります）');

      const result = await GeminiAPI.generateFromText(finalPrompt, {
        aspectRatio: state.aspectRatio,
        imageSize: state.imageSize,
      });

      const imageData = { base64: result.base64, mimeType: result.mimeType };
      state.lastGeneratedImageData = imageData;

      // 生成結果プレビューを表示
      const previewSection = document.getElementById('generateResultPreview');
      const previewImg = document.getElementById('generateResultImage');
      previewImg.src = `data:${imageData.mimeType};base64,${imageData.base64}`;
      previewSection.classList.remove('hidden');

      // プロンプト確認画面を閉じる
      hidePromptReview();

      // 履歴に追加（resultSectionは表示しないが、履歴には追加）
      const label = '生成: ' + finalPrompt.slice(0, 30) + (finalPrompt.length > 30 ? '...' : '');
      await EditHistory.createEntry(
        imageData,
        { prompt: finalPrompt, mode: 'text-to-image', aspectRatio: state.aspectRatio },
        label
      );

      UI.hideLoading();
      UI.showSuccess('画像の生成が完了しました');

      // スクロール
      requestAnimationFrame(() => {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('生成をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    }
  }

  // ========== 生成結果からの連携 ==========

  // 生成した画像を編集モードへ渡す
  function editGeneratedImage() {
    if (!state.lastGeneratedImageData) return;

    // アップロードパネルに切り替え
    switchSubTab('upload');

    // App経由でアップロード済み画像として設定
    if (typeof App !== 'undefined') {
      App.onGeneratedImageEdit(state.lastGeneratedImageData);
    }

    // 生成結果プレビューを閉じる
    document.getElementById('generateResultPreview').classList.add('hidden');

    UI.showSuccess('生成した画像を編集モードにセットしました');

    // analysisSection にスクロール
    requestAnimationFrame(() => {
      const analysisSection = document.getElementById('analysisSection');
      if (analysisSection) analysisSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // ========== カテゴリ・パラメータ描画 ==========

  // カテゴリカード描画
  function renderCategoryCards() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(TEMPLATES).forEach(([key, tmpl]) => {
      const card = document.createElement('button');
      card.className = 'category-card bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center min-h-[100px]';
      card.dataset.category = key;
      card.innerHTML = `
        <span class="text-3xl">${tmpl.icon}</span>
        <span class="font-medium text-sm text-gray-800">${tmpl.label}</span>
        <span class="text-xs text-gray-500">${tmpl.description}</span>
      `;
      card.addEventListener('click', () => selectCategory(key));
      container.appendChild(card);
    });
  }

  // カテゴリ選択
  function selectCategory(key) {
    state.selectedCategory = key;
    state.templateValues = {};

    // カード選択状態
    const container = document.getElementById('categoryList');
    container.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    const selectedCard = container.querySelector(`[data-category="${key}"]`);
    if (selectedCard) selectedCard.classList.add('selected');

    // パラメータフォーム表示
    renderParamForm(key);
    document.getElementById('paramSection').classList.remove('hidden');

    // プロンプト確認画面は閉じる
    hidePromptReview();
    document.getElementById('generateResultPreview').classList.add('hidden');
  }

  // パラメータフォーム描画
  function renderParamForm(category) {
    const tmpl = TEMPLATES[category];
    const container = document.getElementById('paramForm');
    container.innerHTML = '';

    tmpl.params.forEach(param => {
      const row = document.createElement('div');
      row.className = 'param-row';
      row.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 mb-1">${param.label}</label>
        <input type="text" data-param-key="${param.key}"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          placeholder="${param.placeholder}">
      `;
      container.appendChild(row);

      // リアルタイムプレビュー更新
      const input = row.querySelector('input');
      input.addEventListener('input', () => {
        state.templateValues[param.key] = input.value;
        updatePromptPreview();
      });
    });

    updatePromptPreview();
  }

  // プロンプトプレビュー更新
  function updatePromptPreview() {
    const previewEl = document.getElementById('promptPreviewText');
    if (!previewEl || !state.selectedCategory) return;

    const prompt = buildPromptFromTemplate(state.selectedCategory, state.templateValues);
    previewEl.textContent = prompt;
  }

  // テンプレートからプロンプト生成
  function buildPromptFromTemplate(category, values) {
    const tmpl = TEMPLATES[category];
    if (!tmpl) return '';

    let prompt = tmpl.template;
    tmpl.params.forEach(param => {
      const val = values[param.key];
      if (val && val.trim()) {
        prompt = prompt.replace(`[${param.key}]`, val.trim());
      }
    });
    return prompt;
  }

  // ========== ユーティリティ ==========

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    init,
    switchSubTab,
    switchSubMode,
    showPromptReview,
    hidePromptReview,
    approveAndGenerate,
    editGeneratedImage,
  };
})();
