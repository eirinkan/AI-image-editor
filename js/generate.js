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

  // 状態
  const state = {
    subMode: 'template', // 'template' | 'freeform'
    selectedCategory: null,
    templateValues: {},
    aspectRatio: '1:1',
    imageSize: '1K',
    categoryRendered: false,
  };

  function init() {
    // タブ切替
    const tabEdit = document.getElementById('tabEdit');
    const tabGenerate = document.getElementById('tabGenerate');
    if (tabEdit) tabEdit.addEventListener('click', () => switchTab('edit'));
    if (tabGenerate) tabGenerate.addEventListener('click', () => switchTab('generate'));

    // サブモード切替
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

    // 生成ボタン
    const genBtn = document.getElementById('textGenerateBtn');
    if (genBtn) genBtn.addEventListener('click', generate);
  }

  // タブ切替
  function switchTab(mode) {
    const editContent = document.getElementById('editModeContent');
    const genContent = document.getElementById('generateModeContent');
    const tabEdit = document.getElementById('tabEdit');
    const tabGenerate = document.getElementById('tabGenerate');

    if (mode === 'edit') {
      editContent.classList.remove('hidden');
      genContent.classList.add('hidden');
      tabEdit.classList.add('bg-white', 'shadow', 'text-blue-600');
      tabEdit.classList.remove('text-gray-500');
      tabGenerate.classList.remove('bg-white', 'shadow', 'text-blue-600');
      tabGenerate.classList.add('text-gray-500');
    } else {
      editContent.classList.add('hidden');
      genContent.classList.remove('hidden');
      tabGenerate.classList.add('bg-white', 'shadow', 'text-purple-600');
      tabGenerate.classList.remove('text-gray-500');
      tabEdit.classList.remove('bg-white', 'shadow', 'text-blue-600');
      tabEdit.classList.add('text-gray-500');
      if (!state.categoryRendered) {
        renderCategoryCards();
        state.categoryRendered = true;
      }
    }
  }

  // サブモード切替
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

  // 画像生成実行
  async function generate() {
    if (!GeminiAPI.getApiKey()) {
      UI.showError('APIキーを入力してください。');
      return;
    }

    let finalPrompt = '';
    if (state.subMode === 'freeform') {
      const textarea = document.getElementById('freeformPrompt');
      finalPrompt = textarea ? textarea.value.trim() : '';
    } else {
      if (!state.selectedCategory) {
        UI.showError('スタイルカテゴリを選択してください。');
        return;
      }
      finalPrompt = buildPromptFromTemplate(state.selectedCategory, state.templateValues);
    }

    if (!finalPrompt) {
      UI.showError('プロンプトを入力してください。');
      return;
    }

    // 未入力のプレースホルダーが残っている場合は警告
    if (state.subMode === 'template' && finalPrompt.includes('[')) {
      const hasEmpty = TEMPLATES[state.selectedCategory].params.some(p => {
        return !state.templateValues[p.key] || !state.templateValues[p.key].trim();
      });
      if (hasEmpty) {
        UI.showError('すべてのパラメータを入力してください。');
        return;
      }
    }

    try {
      UI.showLoading('画像を生成中...（20〜60秒かかります）');

      const result = await GeminiAPI.generateFromText(finalPrompt, {
        aspectRatio: state.aspectRatio,
        imageSize: state.imageSize,
      });

      const imageData = { base64: result.base64, mimeType: result.mimeType };

      UI.showResult(imageData);

      // 履歴に追加
      const label = '生成: ' + finalPrompt.slice(0, 30) + (finalPrompt.length > 30 ? '...' : '');
      await EditHistory.createEntry(
        imageData,
        { prompt: finalPrompt, mode: 'text-to-image', aspectRatio: state.aspectRatio },
        label
      );

      UI.hideLoading();
      UI.showSuccess('画像の生成が完了しました');
    } catch (err) {
      UI.hideLoading();
      if (err.name === 'AbortError') {
        UI.showSuccess('生成をキャンセルしました');
      } else {
        UI.showError(err.message);
      }
    }
  }

  return {
    init,
    switchTab,
  };
})();
