// ビジュアルカメラエディタモジュール

const CameraEditor = (() => {
  // プリセット定義
  const PRESETS = [
    // 人物系
    { name: 'ポートレート', category: 'people', desc: '人物を美しく撮る定番', values: { angle: 'eye-level', shotType: 'medium', focalLength: 85, depthOfField: 2.0 } },
    { name: '全身スナップ', category: 'people', desc: '人物全体をバランスよく', values: { angle: 'eye-level', shotType: 'full', focalLength: 50, depthOfField: 5.6 } },
    { name: '顔アップ', category: 'people', desc: '表情にフォーカス', values: { angle: 'eye-level', shotType: 'close-up', focalLength: 85, depthOfField: 1.8 } },
    { name: '見上げ迫力', category: 'people', desc: '被写体を大きく力強く', values: { angle: 'low', shotType: 'full', focalLength: 24, depthOfField: 8.0 } },
    { name: 'シネマティック', category: 'people', desc: '映画的な雰囲気', values: { angle: 'eye-level', shotType: 'medium', focalLength: 35, depthOfField: 2.0 } },
    { name: 'ドラマチック', category: 'people', desc: '視線誘導で印象的に', values: { angle: 'high', shotType: 'medium', focalLength: 85, depthOfField: 2.8 } },
    // 商品系
    { name: '商品クローズアップ', category: 'product', desc: '商品ディテールを美しく', values: { angle: 'eye-level', shotType: 'close-up', focalLength: 100, depthOfField: 2.8 } },
    { name: 'フラットレイ', category: 'product', desc: '物を並べて真上から', values: { angle: 'birds-eye', shotType: 'wide', focalLength: 35, depthOfField: 11 } },
    { name: '雰囲気商品', category: 'product', desc: '生活感のある商品写真', values: { angle: 'high', shotType: 'medium', focalLength: 50, depthOfField: 2.0 } },
    // 風景・建物系
    { name: '風景パノラマ', category: 'landscape', desc: '広大な風景をくっきり', values: { angle: 'eye-level', shotType: 'wide', focalLength: 24, depthOfField: 11 } },
    { name: '建物見上げ', category: 'landscape', desc: '建物を迫力ある構図で', values: { angle: 'low', shotType: 'wide', focalLength: 24, depthOfField: 8.0 } },
    { name: '街並みスナップ', category: 'landscape', desc: '奥行きのある街並み', values: { angle: 'eye-level', shotType: 'wide', focalLength: 35, depthOfField: 5.6 } },
    { name: 'ミニチュア風', category: 'landscape', desc: 'ジオラマ風のかわいい俯瞰', values: { angle: 'birds-eye', shotType: 'wide', focalLength: 200, depthOfField: 2.0 } },
  ];

  const PRESET_CATEGORIES = [
    { key: 'people', label: '人物' },
    { key: 'product', label: '商品' },
    { key: 'landscape', label: '風景' },
  ];

  let currentPresetCategory = 'people';
  let currentContainer = null;
  let currentCameraJson = null;
  let presetApplied = false; // プリセット適用時にinferFromJsonをスキップするフラグ
  let selectedPresetName = null; // 現在選択中のプリセット名

  // コントロール定義
  const CONTROLS = {
    angle: {
      label: 'アングル（高さ）',
      type: 'select',
      options: [
        { value: 'worms-eye', label: '地面から', icon: '🐛', prompt: "extreme low-angle shot, worm's eye view from ground level looking steeply upward" },
        { value: 'low', label: '低い', icon: '⬇️', prompt: 'low-angle shot, camera positioned below subject looking upward' },
        { value: 'eye-level', label: '目線', icon: '👁', prompt: 'eye-level shot, camera at subject eye height, straight-on perspective' },
        { value: 'high', label: '斜め上', icon: '📐', prompt: 'elevated shot, high-angle shot looking down at 45 degrees' },
        { value: 'birds-eye', label: '真上', icon: '🦅', prompt: "bird's eye view, directly overhead top-down perspective" },
      ],
    },
    shotType: {
      label: '距離（ショットタイプ）',
      type: 'select',
      options: [
        { value: 'extreme-close', label: '超接写', icon: '🔍', prompt: 'extreme close-up of the main subject, tightly cropped to show fine details of the subject' },
        { value: 'close-up', label: '接写', icon: '👤', prompt: 'close-up shot, subject fills frame from face to shoulders' },
        { value: 'medium', label: '上半身', icon: '🧑', prompt: 'medium shot, waist-up framing of subject' },
        { value: 'full', label: '全身', icon: '🧍', prompt: 'full body shot, entire figure visible from head to toe' },
        { value: 'wide', label: '広い', icon: '🏠', prompt: 'wide shot, subject small within expansive environment and surroundings' },
      ],
    },
    focalLength: {
      label: 'レンズ（焦点距離）',
      type: 'slider',
      min: 14, max: 200, step: 1, default: 50, unit: 'mm',
      labels: ['広角', '標準', '望遠'],
      toPrompt: (val) => `${val}mm lens`,
    },
    depthOfField: {
      label: 'ボケ感（被写界深度）',
      type: 'slider',
      min: 1.4, max: 16, step: 0.2, default: 5.6,
      labels: ['ボケ強い', 'くっきり'],
      toPrompt: (val) => {
        const v = parseFloat(val).toFixed(1);
        if (val <= 2.8) return `shallow depth of field at f/${v}, beautiful bokeh`;
        if (val >= 11) return `deep depth of field at f/${v}, everything in sharp focus`;
        return `moderate depth of field at f/${v}`;
      },
    },
    // 構図は削除（既存画像の編集では配置変更が不自然になるため）
  };

  // 現在の値
  let currentValues = {};
  let keepFlags = {}; // 「変更しない」フラグ
  let onChangeCallback = null;

  // JSON値から初期状態を推測（全項目「変更しない」をデフォルトに）
  function inferFromJson(cameraJson) {
    const values = {};
    const keeps = {
      angle: true,
      shotType: true,
      focalLength: true,
      depthOfField: true,
    };

    // カメラ情報がある場合でも、デフォルトは「変更しない」
    // ユーザーが明示的に変更する形にする
    if (cameraJson) {
      // 推論値は保持するが、keepフラグはオンのまま
      const angle = (cameraJson.angle || '').toLowerCase();
      if (angle) {
        if (angle.includes('low')) values.angle = 'low';
        else if (angle.includes('high')) values.angle = 'high';
        else if (angle.includes('bird') || angle.includes('overhead') || angle.includes('top-down')) values.angle = 'birds-eye';
        else if (angle.includes('worm')) values.angle = 'worms-eye';
        else values.angle = 'eye-level';
      }

      // ショットタイプ推論（perspective, angle, shot_typeから）
      const shotInfo = (String(cameraJson.perspective || '') + ' ' + String(cameraJson.angle || '') + ' ' + String(cameraJson.shot_type || '')).toLowerCase();
      if (shotInfo.trim()) {
        if (shotInfo.includes('extreme close') || shotInfo.includes('macro')) values.shotType = 'extreme-close';
        else if (shotInfo.includes('close-up') || shotInfo.includes('close up')) values.shotType = 'close-up';
        else if (shotInfo.includes('medium') || shotInfo.includes('waist')) values.shotType = 'medium';
        else if (shotInfo.includes('full body') || shotInfo.includes('full shot') || shotInfo.includes('full length')) values.shotType = 'full';
        else if (shotInfo.includes('wide') || shotInfo.includes('establishing') || shotInfo.includes('long shot')) values.shotType = 'wide';
      }

      // 焦点距離（数値型にも対応、スライダー範囲にクランプ）
      const fl = String(cameraJson.focal_length || '');
      if (fl) {
        const flMatch = fl.match(/(\d+)/);
        if (flMatch) values.focalLength = Math.max(14, Math.min(200, parseInt(flMatch[1])));
        else if (fl.includes('wide')) values.focalLength = 24;
        else if (fl.includes('telephoto') || fl.includes('tele')) values.focalLength = 135;
        else values.focalLength = 50;
      }

      // 被写界深度（f値パースにも対応）
      const dof = String(cameraJson.depth_of_field || '').toLowerCase();
      if (dof) {
        if (dof.includes('shallow')) values.depthOfField = 2.0;
        else if (dof.includes('deep')) values.depthOfField = 11;
        else {
          const fMatch = dof.match(/f\/?(\d+\.?\d*)/);
          if (fMatch) {
            values.depthOfField = Math.max(1.4, Math.min(16, parseFloat(fMatch[1])));
          } else {
            values.depthOfField = 5.6;
          }
        }
      }

      // 構図の推論は廃止
    }

    keepFlags = keeps;
    return values;
  }

  // SVG要素作成ヘルパー
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs = {}, children = []) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    children.forEach(c => { if (typeof c === 'string') el.innerHTML += c; else el.appendChild(c); });
    return el;
  }

  // 人物シルエットパス（共通）
  const PERSON_PATH = 'M20,8 a4,4 0 1,0 0.01,0 M16,14 h8 q4,0 4,4 v8 h-4 v10 h-3 v-10 h-2 v10 h-3 v-10 h-4 v-8 q0,-4 4,-4';

  // 「変更しない」チェックボックス行を作成するヘルパー
  function createKeepCheckboxRow(key, onKeepChange) {
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('変更しない'));
    keepCheck.addEventListener('change', () => {
      onKeepChange(keepCheck.checked);
    });
    return { keepRow, keepCheck };
  }

  // プリセットUIを描画
  function renderPresetUI(container) {
    const presetSection = document.createElement('div');
    presetSection.className = 'camera-preset-section';

    // タイトル
    const title = document.createElement('p');
    title.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-2';
    title.textContent = 'プリセット（ワンタップで設定）';
    presetSection.appendChild(title);

    // カテゴリタブ
    const tabRow = document.createElement('div');
    tabRow.className = 'preset-tab-row';
    PRESET_CATEGORIES.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `preset-tab${currentPresetCategory === cat.key ? ' active' : ''}`;
      tab.textContent = cat.label;
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        currentPresetCategory = cat.key;
        renderPresetButtons(btnContainer);
        tabRow.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
      tabRow.appendChild(tab);
    });
    presetSection.appendChild(tabRow);

    // プリセットボタンコンテナ
    const btnContainer = document.createElement('div');
    btnContainer.className = 'preset-btn-container';
    renderPresetButtons(btnContainer);
    presetSection.appendChild(btnContainer);

    container.appendChild(presetSection);
  }

  // プリセットボタンを描画
  function renderPresetButtons(container) {
    container.innerHTML = '';
    const filtered = PRESETS.filter(p => p.category === currentPresetCategory);
    filtered.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = `preset-btn${selectedPresetName === preset.name ? ' selected' : ''}`;
      const nameSpan = document.createElement('span');
      nameSpan.className = 'preset-btn-name';
      nameSpan.textContent = preset.name;
      const descSpan = document.createElement('span');
      descSpan.className = 'preset-btn-desc';
      descSpan.textContent = preset.desc;
      btn.appendChild(nameSpan);
      btn.appendChild(descSpan);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        applyPreset(preset);
      });
      container.appendChild(btn);
    });
  }

  // プリセットを適用
  function applyPreset(preset) {
    selectedPresetName = preset.name;
    // 値を適用
    currentValues = {
      angle: preset.values.angle,
      shotType: preset.values.shotType,
      focalLength: preset.values.focalLength,
      depthOfField: preset.values.depthOfField,
      _presetCategory: preset.category, // プレビュー被写体切り替え用
    };
    // 全てのkeepフラグを外す
    keepFlags = {
      angle: false,
      shotType: false,
      focalLength: false,
      depthOfField: false,
    };
    // 全体を再描画（inferFromJsonをスキップ）
    presetApplied = true;
    if (currentContainer) {
      render(currentContainer, currentCameraJson);
    }
  }

  // 被写体カテゴリを判定（プリセットカテゴリ or デフォルト）
  function getSubjectCategory() {
    return currentValues._presetCategory || 'people';
  }

  // 組み合わせプレビューSVG — ダイアグラム方式（カメラと被写体の位置関係図）
  function updateCombinedPreviewSvg(container) {
    if (!container) container = document.getElementById('cameraCombinedPreview');
    if (!container) return;
    container.innerHTML = '';

    const hasAny = !keepFlags.angle || !keepFlags.shotType || !keepFlags.focalLength || !keepFlags.depthOfField;
    if (!hasAny) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:11px;text-align:center;padding:12px;">設定を変更すると<br>プレビュー表示</div>';
      return;
    }

    // ダイアグラム方式: 横から見た断面図でカメラと被写体の位置関係を表示
    // 各パラメータが独立した要素を制御（掛け算の影響なし）
    const W = 240, H = 160;
    const svg = svgEl('svg', { width: '100%', height: '100%', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });

    // 背景（薄いグレー）
    svg.appendChild(svgEl('rect', { x: '0', y: '0', width: String(W), height: String(H), fill: '#f8fafc', rx: '4' }));
    // 地面線
    const groundY = H - 20;
    svg.appendChild(svgEl('line', { x1: '0', y1: String(groundY), x2: String(W), y2: String(groundY), stroke: '#d1d5db', 'stroke-width': '1' }));
    svg.appendChild(svgEl('rect', { x: '0', y: String(groundY), width: String(W), height: String(H - groundY), fill: '#f0fdf4', rx: '0' }));

    // === 1. 被写体（右側に固定、常に同じサイズ） ===
    const subjectX = W - 50;
    const personH = 70; // 固定サイズ
    const personBottom = groundY;
    const personG = svgEl('g', { transform: `translate(${subjectX}, ${personBottom - personH / 2}) scale(${(personH / 35).toFixed(2)})` });
    personG.appendChild(svgEl('path', { d: 'M0,-16 a6,6 0 1,0 0.01,0 M-6,-8 h12 q5,0 5,5 v10 h-5 v14 h-4 v-14 h-3 v14 h-4 v-14 h-5 v-10 q0,-5 5,-5', fill: '#6d28d9' }));
    svg.appendChild(personG);

    // === 2. カメラアイコン（アングルで高さが変わる、距離で左右位置が変わる） ===
    const angle = currentValues.angle || 'eye-level';
    const shotType = currentValues.shotType || 'medium';

    // アングル → カメラの高さ（独立）
    const camYMap = {
      'worms-eye': groundY - 5,
      'low': groundY - 20,
      'eye-level': personBottom - personH * 0.6,
      'high': personBottom - personH - 15,
      'birds-eye': 15,
    };
    const camY = camYMap[angle] || (personBottom - personH * 0.6);

    // 距離（ショットタイプ）→ カメラのX位置（独立）
    const camXMap = {
      'extreme-close': subjectX - 35,
      'close-up': subjectX - 55,
      'medium': subjectX - 80,
      'full': subjectX - 110,
      'wide': subjectX - 140,
    };
    const camX = Math.max(15, camXMap[shotType] || (subjectX - 80));

    // カメラアイコン描画
    const camG = svgEl('g', { transform: `translate(${camX}, ${Math.round(camY)})` });
    camG.appendChild(svgEl('rect', { x: '-8', y: '-5', width: '16', height: '10', rx: '3', fill: '#8b5cf6' }));
    camG.appendChild(svgEl('rect', { x: '6', y: '-3', width: '6', height: '6', rx: '1', fill: '#7c3aed' }));
    svg.appendChild(camG);

    // === 3. レンズ（焦点距離）→ 画角の扇形（独立） ===
    const fl = currentValues.focalLength || 50;
    if (!keepFlags.focalLength) {
      const fovDeg = 2 * Math.atan(18 / fl) * 180 / Math.PI; // 35mm換算画角
      const halfRad = (fovDeg / 2) * Math.PI / 180;
      const fovLen = Math.min(subjectX - camX - 10, 120); // 扇形の長さ
      // カメラから被写体方向への扇形
      const dx = subjectX - camX;
      const dy = (personBottom - personH * 0.5) - camY;
      const baseAngle = Math.atan2(dy, dx);
      const topAngle = baseAngle - halfRad;
      const botAngle = baseAngle + halfRad;
      const topX = camX + 12 + Math.cos(topAngle) * fovLen;
      const topY = camY + Math.sin(topAngle) * fovLen;
      const botX = camX + 12 + Math.cos(botAngle) * fovLen;
      const botY = camY + Math.sin(botAngle) * fovLen;
      svg.appendChild(svgEl('path', {
        d: `M${camX + 12},${Math.round(camY)} L${Math.round(topX)},${Math.round(topY)} L${Math.round(botX)},${Math.round(botY)} Z`,
        fill: 'rgba(139, 92, 246, 0.08)', stroke: '#c4b5fd', 'stroke-width': '0.8'
      }));
    }

    // === 4. 視線（カメラ→被写体、破線） ===
    const targetY = personBottom - personH * 0.5;
    svg.appendChild(svgEl('line', {
      x1: String(camX + 12), y1: String(Math.round(camY)),
      x2: String(subjectX), y2: String(Math.round(targetY)),
      stroke: '#c4b5fd', 'stroke-width': '1', 'stroke-dasharray': '4,3'
    }));

    // === 5. ボケ感 → テキスト表示（独立） ===
    const dof = currentValues.depthOfField;
    if (dof && !keepFlags.depthOfField) {
      const dofLabel = dof <= 2.8 ? 'ボケ強' : dof >= 11 ? 'くっきり' : '適度';
      // 右下に配置
      const t = svgEl('text', { x: String(W - 5), y: String(H - 5), 'text-anchor': 'end', 'font-size': '7', fill: '#9ca3af', 'font-family': 'system-ui,sans-serif' });
      t.textContent = `f/${parseFloat(dof).toFixed(1)} ${dofLabel}`;
      svg.appendChild(t);
    }

    // === 7. ラベル（被らないよう配置） ===
    // カメラ横にレンズ+アングルをまとめて表示
    const labelParts = [];
    if (!keepFlags.focalLength && fl) labelParts.push(`${fl}mm`);
    if (!keepFlags.angle) {
      const angleLabels = { 'worms-eye': '地面から', 'low': '低い', 'eye-level': '目線', 'high': '斜め上', 'birds-eye': '真上' };
      labelParts.push(angleLabels[angle] || '');
    }
    if (labelParts.length > 0) {
      // カメラの上に表示（上に余裕がなければ右横に）
      const labelY = camY > 25 ? Math.round(camY) - 12 : Math.round(camY) + 20;
      const t = svgEl('text', { x: String(camX + 4), y: String(labelY), 'text-anchor': 'middle', 'font-size': '7', fill: '#8b5cf6', 'font-weight': 'bold', 'font-family': 'system-ui,sans-serif' });
      t.textContent = labelParts.join(' / ');
      svg.appendChild(t);
    }
    // 距離ラベル（左下）
    if (!keepFlags.shotType) {
      const shotLabels = { 'extreme-close': '超接写', 'close-up': '接写', 'medium': '上半身', 'full': '全身', 'wide': '広い' };
      const t = svgEl('text', { x: '5', y: String(H - 5), 'text-anchor': 'start', 'font-size': '7', fill: '#6b7280', 'font-family': 'system-ui,sans-serif' });
      t.textContent = `距離: ${shotLabels[shotType] || ''}`;
      svg.appendChild(t);
    }

    container.appendChild(svg);
  }

  // コンテナにビジュアルコントロールを描画
  function render(container, cameraJson) {
    currentContainer = container;
    currentCameraJson = cameraJson;
    // プリセット適用時は値を上書きしない
    if (!presetApplied) {
      currentValues = inferFromJson(cameraJson);
    }
    presetApplied = false;
    container.innerHTML = '';

    // プリセットUI
    renderPresetUI(container);

    // 区切り線
    const divider = document.createElement('div');
    divider.className = 'camera-divider';
    container.appendChild(divider);

    // 2カラムレイアウト: 左にアングル・距離、右にプレビュー
    const twoCol = document.createElement('div');
    twoCol.className = 'camera-two-col';

    const leftCol = document.createElement('div');
    leftCol.className = 'camera-col-left';

    const rightCol = document.createElement('div');
    rightCol.className = 'camera-col-right';

    // プレビューを右カラムに配置
    const previewWrap = document.createElement('div');
    previewWrap.id = 'cameraCombinedPreview';
    previewWrap.className = 'combined-preview-container';
    rightCol.appendChild(previewWrap);

    // アングルと距離は左カラムに
    ['angle', 'shotType'].forEach(key => {
      const ctrl = CONTROLS[key];
      const section = document.createElement('div');
      section.className = 'camera-control-section';
      const label = document.createElement('p');
      label.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-2';
      label.textContent = ctrl.label;
      section.appendChild(label);
      if (key === 'angle') section.appendChild(renderAngleVisual(key, ctrl));
      else section.appendChild(renderShotTypeVisual(key, ctrl));
      leftCol.appendChild(section);
    });

    twoCol.appendChild(leftCol);
    twoCol.appendChild(rightCol);
    container.appendChild(twoCol);

    // 残りのコントロール（レンズ・ボケ）は通常配置
    ['focalLength', 'depthOfField'].forEach(key => {
      const ctrl = CONTROLS[key];
      const section = document.createElement('div');
      section.className = 'camera-control-section';
      const label = document.createElement('p');
      label.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-2';
      label.textContent = ctrl.label;
      section.appendChild(label);
      if (key === 'focalLength') section.appendChild(renderFocalLengthVisual(key, ctrl));
      else section.appendChild(renderDepthOfFieldVisual(key, ctrl));
      container.appendChild(section);
    });

    updatePreview();
  }

  // 1. アングル — カメラ位置ダイアグラムSVGカード
  function renderAngleVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-2';

    // カード群のコンテナ
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'flex flex-wrap gap-2';

    // 「変更しない」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        delete currentValues[key];
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        /* pointerEvents維持: クリックでkeep解除可能 */
      } else {
        cardsContainer.style.opacity = '1';
        /* pointerEvents不要 */
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      /* pointerEvents維持: クリックでkeep解除可能 */
    }

    // 各アングルのカメラ位置・角度定義
    const angleDefs = {
      'worms-eye':  { camY: 42, camX: 8,  arrowAngle: -70, label: '地面から' },
      'low':        { camY: 34, camX: 8,  arrowAngle: -30, label: '低い' },
      'eye-level':  { camY: 20, camX: 8,  arrowAngle: 0,   label: '目線' },
      'high':       { camY: 10, camX: 8,  arrowAngle: 35,  label: '斜め上' },
      'birds-eye':  { camY: 2,  camX: 20, arrowAngle: 80,  label: '真上' },
    };

    ctrl.options.forEach(opt => {
      const card = document.createElement('button');
      const isSelected = !keepFlags[key] && currentValues[key] === opt.value;
      card.className = `cam-visual-card${isSelected ? ' selected' : ''}`;

      const def = angleDefs[opt.value];
      // SVG: 人物シルエット + カメラ矢印
      const svg = svgEl('svg', { width: '56', height: '48', viewBox: '0 0 56 48' });
      // 人物（右側）
      const person = svgEl('path', { d: 'M36,8 a3,3 0 1,0 0.01,0 M33,13 h6 q3,0 3,3 v6 h-3 v8 h-2.5 v-8 h-1 v8 h-2.5 v-8 h-3 v-6 q0,-3 3,-3', fill: '#9ca3af' });
      svg.appendChild(person);
      // 地面線
      svg.appendChild(svgEl('line', { x1: '28', y1: '44', x2: '50', y2: '44', stroke: '#d1d5db', 'stroke-width': '1' }));
      // カメラアイコン
      const camG = svgEl('g', { transform: `translate(${def.camX}, ${def.camY})` });
      camG.appendChild(svgEl('rect', { x: '0', y: '-4', width: '10', height: '8', rx: '2', fill: '#8b5cf6' }));
      camG.appendChild(svgEl('rect', { x: '8', y: '-2', width: '4', height: '4', rx: '1', fill: '#7c3aed' }));
      svg.appendChild(camG);
      // 矢印線（カメラ→人物方向）
      const arrowRad = def.arrowAngle * Math.PI / 180;
      const ax = def.camX + 12;
      const ay = def.camY;
      const bx = ax + Math.cos(arrowRad) * 14;
      const by = ay + Math.sin(arrowRad) * 14;
      svg.appendChild(svgEl('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: '#c4b5fd', 'stroke-width': '1.5', 'stroke-dasharray': '3,2' }));

      card.appendChild(svg);
      const lbl = document.createElement('span');
      lbl.className = 'card-label';
      lbl.textContent = def.label;
      card.appendChild(lbl);

      card.addEventListener('click', () => {
        keepFlags[key] = false;
        keepCheck.checked = false;
        currentValues[key] = opt.value;
        cardsContainer.style.opacity = '1';
        /* pointerEvents不要 */
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        updatePreview();
      });

      cardsContainer.appendChild(card);
    });

    wrap.appendChild(cardsContainer);
    return wrap;
  }

  // 2. 距離（ショットタイプ）— フレーム枠SVGカード
  function renderShotTypeVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-2';

    // カード群のコンテナ
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'flex flex-wrap gap-2';

    // 「変更しない」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        delete currentValues[key];
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        /* pointerEvents維持: クリックでkeep解除可能 */
      } else {
        cardsContainer.style.opacity = '1';
        /* pointerEvents不要 */
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      /* pointerEvents維持: クリックでkeep解除可能 */
    }

    // 各ショットタイプのクリップ範囲（人物の見える範囲をyで制御）
    const shotDefs = {
      'extreme-close': { clipY: 4, clipH: 14, label: '超接写' },
      'close-up':      { clipY: 2, clipH: 20, label: '接写' },
      'medium':        { clipY: 0, clipH: 28, label: '上半身' },
      'full':          { clipY: 0, clipH: 44, label: '全身' },
      'wide':          { clipY: 0, clipH: 48, label: '広い' },
    };

    ctrl.options.forEach(opt => {
      const card = document.createElement('button');
      const isSelected = !keepFlags[key] && currentValues[key] === opt.value;
      card.className = `cam-visual-card${isSelected ? ' selected' : ''}`;

      const def = shotDefs[opt.value];
      const svg = svgEl('svg', { width: '56', height: '48', viewBox: '0 0 56 48' });

      const clipId = `shot-clip-${opt.value}`;
      const defs = svgEl('defs');
      const clipPath = svgEl('clipPath', { id: clipId });
      clipPath.appendChild(svgEl('rect', { x: '0', y: String(def.clipY), width: '56', height: String(def.clipH) }));
      defs.appendChild(clipPath);
      svg.appendChild(defs);

      // グレーアウト背景（フレーム外）
      svg.appendChild(svgEl('rect', { x: '0', y: '0', width: '56', height: '48', fill: '#f3f4f6' }));
      // フレーム内の白背景
      svg.appendChild(svgEl('rect', { x: '0', y: String(def.clipY), width: '56', height: String(def.clipH), fill: 'white' }));

      // 人物シルエット（クリップ内のみ表示）
      const personG = svgEl('g', { 'clip-path': `url(#${clipId})` });
      personG.appendChild(svgEl('path', { d: 'M28,6 a5,5 0 1,0 0.01,0 M22,16 h12 q5,0 5,5 v9 h-5 v12 h-3.5 v-12 h-3 v12 h-3.5 v-12 h-5 v-9 q0,-5 5,-5', fill: '#9ca3af' }));
      svg.appendChild(personG);

      // フレーム枠線
      svg.appendChild(svgEl('rect', { x: '2', y: String(def.clipY + 1), width: '52', height: String(Math.max(def.clipH - 2, 8)), rx: '2', fill: 'none', stroke: '#8b5cf6', 'stroke-width': '1.5', 'stroke-dasharray': '4,2' }));

      // 広いショット: 背景の建物
      if (opt.value === 'wide') {
        svg.appendChild(svgEl('rect', { x: '4', y: '24', width: '8', height: '20', fill: '#d1d5db' }));
        svg.appendChild(svgEl('rect', { x: '44', y: '20', width: '8', height: '24', fill: '#d1d5db' }));
        svg.appendChild(svgEl('line', { x1: '0', y1: '44', x2: '56', y2: '44', stroke: '#d1d5db', 'stroke-width': '1' }));
      }

      card.appendChild(svg);
      const lbl = document.createElement('span');
      lbl.className = 'card-label';
      lbl.textContent = def.label;
      card.appendChild(lbl);

      card.addEventListener('click', () => {
        keepFlags[key] = false;
        keepCheck.checked = false;
        currentValues[key] = opt.value;
        cardsContainer.style.opacity = '1';
        /* pointerEvents不要 */
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        updatePreview();
      });

      cardsContainer.appendChild(card);
    });

    wrap.appendChild(cardsContainer);
    return wrap;
  }

  // 3. レンズ（焦点距離）— スライダー + 画角扇形SVG
  function renderFocalLengthVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-1';

    const val = currentValues[key] ?? ctrl.default;
    currentValues[key] = val;

    // 「変更しない」チェックボックス
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('変更しない'));
    wrap.appendChild(keepRow);

    // スライダー行
    const sliderRow = document.createElement('div');
    sliderRow.className = 'flex items-center gap-3';

    const labelLeft = document.createElement('span');
    labelLeft.className = 'text-[10px] text-gray-400 dark:text-gray-400 w-12 text-right flex-shrink-0';
    labelLeft.textContent = ctrl.labels[0];

    const input = document.createElement('input');
    input.type = 'range';
    input.min = ctrl.min;
    input.max = ctrl.max;
    input.step = ctrl.step || 1;
    input.value = val;
    input.className = 'cam-slider flex-1';

    const labelRight = document.createElement('span');
    labelRight.className = 'text-[10px] text-gray-400 dark:text-gray-400 w-12 flex-shrink-0';
    labelRight.textContent = ctrl.labels[ctrl.labels.length - 1];

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'text-xs font-mono font-medium text-purple-600 dark:text-purple-400 w-14 text-center flex-shrink-0';
    valueDisplay.textContent = `${val}${ctrl.unit || ''}`;

    sliderRow.appendChild(labelLeft);
    sliderRow.appendChild(input);
    sliderRow.appendChild(labelRight);
    sliderRow.appendChild(valueDisplay);
    wrap.appendChild(sliderRow);

    // keepチェック時にスライダーをdisabledにする
    function applyKeepState(isKeep) {
      keepFlags[key] = isKeep;
      /* disabledにしない: スライダー操作でkeep自動解除 */
      sliderRow.style.opacity = isKeep ? '0.4' : '1';
      updatePreview();
    }
    applyKeepState(!!keepFlags[key]);

    keepCheck.addEventListener('change', () => {
      applyKeepState(keepCheck.checked);
    });

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      currentValues[key] = v;
      keepFlags[key] = false;
      keepCheck.checked = false;
      sliderRow.style.opacity = '1';
      valueDisplay.textContent = `${v}${ctrl.unit || ''}`;
      updatePreview();
    });

    return wrap;
  }

  // 画角（FoV）扇形SVGを生成（未使用・将来用に保持）
  function createFovSvg(focalLength) {
    const fovDeg = 2 * Math.atan(18 / focalLength) * 180 / Math.PI;
    const svg = svgEl('svg', { width: '160', height: '50', viewBox: '0 0 160 50' });
    const cx = 10, cy = 25;
    const len = 140;
    const halfRad = (fovDeg / 2) * Math.PI / 180;
    const topX = cx + Math.cos(halfRad) * len;
    const topY = cy - Math.sin(halfRad) * len;
    const botX = cx + Math.cos(halfRad) * len;
    const botY = cy + Math.sin(halfRad) * len;

    // 扇形（画角）
    const path = `M${cx},${cy} L${topX},${Math.max(0, topY)} L${botX},${Math.min(50, botY)} Z`;
    svg.appendChild(svgEl('path', { d: path, fill: 'rgba(139, 92, 246, 0.12)', stroke: '#8b5cf6', 'stroke-width': '1' }));

    // カメラアイコン
    svg.appendChild(svgEl('rect', { x: '2', y: '21', width: '10', height: '8', rx: '2', fill: '#8b5cf6' }));
    svg.appendChild(svgEl('rect', { x: '10', y: '23', width: '4', height: '4', rx: '1', fill: '#7c3aed' }));

    // 画角数値
    const text = svgEl('text', { x: '80', y: '48', 'text-anchor': 'middle', 'font-size': '10', fill: '#8b5cf6', 'font-family': 'monospace' });
    text.textContent = `${Math.round(fovDeg)}°`;
    svg.appendChild(text);

    return svg;
  }

  // 4. ボケ感（被写界深度）— スライダー + CSS blurプレビュー
  function renderDepthOfFieldVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-1';

    const val = currentValues[key] ?? ctrl.default;
    currentValues[key] = val;

    // 「変更しない」チェックボックス
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('変更しない'));
    wrap.appendChild(keepRow);

    // スライダー行
    const sliderRow = document.createElement('div');
    sliderRow.className = 'flex items-center gap-3';

    const labelLeft = document.createElement('span');
    labelLeft.className = 'text-[10px] text-gray-400 dark:text-gray-400 w-12 text-right flex-shrink-0';
    labelLeft.textContent = ctrl.labels[0];

    const input = document.createElement('input');
    input.type = 'range';
    input.min = ctrl.min;
    input.max = ctrl.max;
    input.step = ctrl.step || 0.2;
    input.value = val;
    input.className = 'cam-slider flex-1';

    const labelRight = document.createElement('span');
    labelRight.className = 'text-[10px] text-gray-400 dark:text-gray-400 w-12 flex-shrink-0';
    labelRight.textContent = ctrl.labels[ctrl.labels.length - 1];

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'text-xs font-mono font-medium text-purple-600 dark:text-purple-400 w-14 text-center flex-shrink-0';
    valueDisplay.textContent = `f/${parseFloat(val).toFixed(1)}`;

    sliderRow.appendChild(labelLeft);
    sliderRow.appendChild(input);
    sliderRow.appendChild(labelRight);
    sliderRow.appendChild(valueDisplay);
    wrap.appendChild(sliderRow);

    // keepチェック時にスライダーをdisabledにする
    function applyKeepState(isKeep) {
      keepFlags[key] = isKeep;
      /* disabledにしない: スライダー操作でkeep自動解除 */
      sliderRow.style.opacity = isKeep ? '0.4' : '1';
      updatePreview();
    }
    applyKeepState(!!keepFlags[key]);

    keepCheck.addEventListener('change', () => {
      applyKeepState(keepCheck.checked);
    });

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      currentValues[key] = v;
      keepFlags[key] = false;
      keepCheck.checked = false;
      sliderRow.style.opacity = '1';
      valueDisplay.textContent = `f/${v.toFixed(1)}`;
      updatePreview();
    });

    return wrap;
  }

  // 5. 構図 — 解説付きカード
  function renderCompositionVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-2';

    if (!currentValues[key]) currentValues[key] = [];

    // カード群のコンテナ（縦並び）
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'comp-card-container';

    // 「変更しない」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        currentValues[key] = [];
        cardsContainer.querySelectorAll('.comp-card').forEach(b => b.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        /* pointerEvents維持: クリックでkeep解除可能 */
      } else {
        cardsContainer.style.opacity = '1';
        /* pointerEvents不要 */
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      /* pointerEvents維持: クリックでkeep解除可能 */
    }

    // 各構図のSVGパターン定義
    const compDefs = {
      'rule-of-thirds': (svg) => {
        // 3x3グリッド
        for (let i = 1; i <= 2; i++) {
          const pos = (i / 3) * 48;
          svg.appendChild(svgEl('line', { x1: String(pos), y1: '0', x2: String(pos), y2: '48', stroke: '#d1d5db', 'stroke-width': '0.8' }));
          svg.appendChild(svgEl('line', { x1: '0', y1: String(pos), x2: '48', y2: String(pos), stroke: '#d1d5db', 'stroke-width': '0.8' }));
        }
        // 交点の丸
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 2; j++) {
            svg.appendChild(svgEl('circle', { cx: String((i / 3) * 48), cy: String((j / 3) * 48), r: '2.5', fill: '#8b5cf6' }));
          }
        }
      },
      'symmetry': (svg) => {
        // 中央縦線
        svg.appendChild(svgEl('line', { x1: '24', y1: '0', x2: '24', y2: '48', stroke: '#8b5cf6', 'stroke-width': '1', 'stroke-dasharray': '3,2' }));
        // 左右対称アーチ
        svg.appendChild(svgEl('path', { d: 'M8,38 Q8,12 24,10 Q40,12 40,38', fill: 'none', stroke: '#c4b5fd', 'stroke-width': '1.5' }));
        // 中央ドット
        svg.appendChild(svgEl('circle', { cx: '24', cy: '10', r: '2', fill: '#8b5cf6' }));
      },
      'leading-lines': (svg) => {
        // 収束する斜め線
        const vp = { x: 34, y: 18 }; // 消失点
        [[0, 48], [0, 36], [48, 48], [48, 36], [0, 0], [48, 0]].forEach(([sx, sy]) => {
          svg.appendChild(svgEl('line', { x1: String(sx), y1: String(sy), x2: String(vp.x), y2: String(vp.y), stroke: '#c4b5fd', 'stroke-width': '0.8' }));
        });
        svg.appendChild(svgEl('circle', { cx: String(vp.x), cy: String(vp.y), r: '2.5', fill: '#8b5cf6' }));
      },
      'center': (svg) => {
        // 十字
        svg.appendChild(svgEl('line', { x1: '24', y1: '8', x2: '24', y2: '40', stroke: '#d1d5db', 'stroke-width': '0.8' }));
        svg.appendChild(svgEl('line', { x1: '8', y1: '24', x2: '40', y2: '24', stroke: '#d1d5db', 'stroke-width': '0.8' }));
        // 中央円
        svg.appendChild(svgEl('circle', { cx: '24', cy: '24', r: '8', fill: 'none', stroke: '#8b5cf6', 'stroke-width': '1.5' }));
        svg.appendChild(svgEl('circle', { cx: '24', cy: '24', r: '3', fill: '#8b5cf6' }));
      },
      'negative-space': (svg) => {
        // 広い余白 + 小さな主題
        svg.appendChild(svgEl('rect', { x: '0', y: '0', width: '48', height: '48', fill: '#f9fafb' }));
        // 小さな主題（右下）
        svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '5', fill: '#c4b5fd' }));
        svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '2', fill: '#8b5cf6' }));
      },
    };

    ctrl.options.forEach(opt => {
      const btn = document.createElement('button');
      const isSelected = !keepFlags[key] && currentValues[key].includes(opt.value);
      btn.className = `comp-card${isSelected ? ' selected' : ''}`;
      btn.dataset.value = opt.value;

      const svg = svgEl('svg', { width: '36', height: '36', viewBox: '0 0 48 48' });
      svg.appendChild(svgEl('rect', { x: '0.5', y: '0.5', width: '47', height: '47', rx: '3', fill: 'white', stroke: '#e5e7eb', 'stroke-width': '1' }));
      if (compDefs[opt.value]) compDefs[opt.value](svg);

      const textWrap = document.createElement('div');
      textWrap.className = 'comp-card-text';
      const lbl = document.createElement('span');
      lbl.className = 'comp-card-name';
      lbl.textContent = opt.label;
      textWrap.appendChild(lbl);
      if (opt.desc) {
        const descEl = document.createElement('span');
        descEl.className = 'comp-card-desc';
        descEl.textContent = opt.desc;
        textWrap.appendChild(descEl);
      }
      btn.appendChild(svg);
      btn.appendChild(textWrap);

      // 排他グループ: 被写体の位置に関する構図は1つだけ選べる
      const exclusiveGroup = ['rule-of-thirds', 'center', 'negative-space'];

      btn.addEventListener('click', () => {
        // keepがtrueからfalseに切り替わる瞬間、JSON由来の初期値をクリア
        if (keepFlags[key]) {
          currentValues[key] = [];
          cardsContainer.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));
        }
        keepFlags[key] = false;
        keepCheck.checked = false;
        cardsContainer.style.opacity = '1';
        const idx = currentValues[key].indexOf(opt.value);
        if (idx >= 0) {
          // 既に選択中 → 解除
          currentValues[key].splice(idx, 1);
          btn.classList.remove('selected');
        } else {
          // 排他グループ内の他の選択を解除
          if (exclusiveGroup.includes(opt.value)) {
            exclusiveGroup.forEach(exVal => {
              if (exVal !== opt.value) {
                const exIdx = currentValues[key].indexOf(exVal);
                if (exIdx >= 0) currentValues[key].splice(exIdx, 1);
              }
            });
            // UIの選択状態も更新
            cardsContainer.querySelectorAll('.comp-card').forEach(card => {
              const cardValue = card.dataset.value;
              if (exclusiveGroup.includes(cardValue) && cardValue !== opt.value) {
                card.classList.remove('selected');
              }
            });
          }
          currentValues[key].push(opt.value);
          btn.classList.add('selected');
        }
        updatePreview();
      });

      cardsContainer.appendChild(btn);
    });

    wrap.appendChild(cardsContainer);
    return wrap;
  }

  // プロンプトテキストを生成
  function getPromptText() {
    const parts = [];

    // angle（keepなら除外）
    if (!keepFlags.angle && currentValues.angle) {
      const opt = CONTROLS.angle.options.find(o => o.value === currentValues.angle);
      if (opt) parts.push(opt.prompt);
    }

    // shotType（keepなら除外）
    if (!keepFlags.shotType && currentValues.shotType) {
      const opt = CONTROLS.shotType.options.find(o => o.value === currentValues.shotType);
      if (opt) parts.push(opt.prompt);
    }

    // focalLength — プロンプトに含めない（画風に影響するため、プレビューのみで表示）
    // depthOfField — プロンプトに含めない（同上）

    // composition — 削除済み（既存画像の編集では構図変更が不自然になるため）

    if (parts.length === 0) return '';
    // 左右回転を防止: 元画像の水平方向の視点を維持する指示を追加
    parts.push('keep the same horizontal viewing angle as the original image (do not orbit left or right around the subject)');
    return `Change camera to: ${parts.join(', ')}`;
  }

  // プレビュー更新
  function updatePreview() {
    const el = document.getElementById('cameraPromptPreview');
    const text = getPromptText();
    if (el) el.textContent = text || '(カメラ設定は変更しません)';
    // 組み合わせプレビューも更新
    updateCombinedPreviewSvg();
    if (onChangeCallback) onChangeCallback();
  }

  // 値をJSON形式で取得
  function getValues() {
    return { ...currentValues };
  }

  // 既存のcamera JSONを確定的に更新（LLM不要）
  function buildCameraJson(existingCamera) {
    const cam = { ...(existingCamera || {}) };
    if (!keepFlags.angle && currentValues.angle) {
      const opt = CONTROLS.angle.options.find(o => o.value === currentValues.angle);
      cam.angle = opt ? opt.prompt : currentValues.angle;
    }
    if (!keepFlags.shotType && currentValues.shotType) {
      const opt = CONTROLS.shotType.options.find(o => o.value === currentValues.shotType);
      cam.shot_type = opt ? opt.prompt : currentValues.shotType;
    }
    if (!keepFlags.focalLength && currentValues.focalLength) {
      cam.focal_length = `${currentValues.focalLength}mm`;
    }
    if (!keepFlags.depthOfField && currentValues.depthOfField) {
      cam.depth_of_field = `f/${parseFloat(currentValues.depthOfField).toFixed(1)}`;
    }
    return cam;
  }

  // 画像生成AI向けの直接プロンプト（JSON差分を経由しない）
  function getImagePrompt() {
    const parts = [];
    if (!keepFlags.angle && currentValues.angle) {
      const opt = CONTROLS.angle.options.find(o => o.value === currentValues.angle);
      if (opt) parts.push(opt.prompt);
    }
    if (!keepFlags.shotType && currentValues.shotType) {
      const opt = CONTROLS.shotType.options.find(o => o.value === currentValues.shotType);
      if (opt) parts.push(opt.prompt);
    }
    return parts.join(', ');
  }

  // 変更コールバック設定
  function onChange(cb) {
    onChangeCallback = cb;
  }

  return {
    render,
    getPromptText,
    getImagePrompt,
    buildCameraJson,
    getValues,
    onChange,
  };
})();
