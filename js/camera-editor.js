// ビジュアルカメラエディタモジュール

const CameraEditor = (() => {
  // プリセット定義
  const PRESETS = [
    // 人物系
    { name: 'ポートレート', category: 'people', desc: '人物を美しく撮る定番', values: { angle: 'eye-level', shotType: 'medium', focalLength: 85, depthOfField: 2.0, composition: ['rule-of-thirds'] } },
    { name: '全身スナップ', category: 'people', desc: '人物全体をバランスよく', values: { angle: 'eye-level', shotType: 'full', focalLength: 50, depthOfField: 5.6, composition: ['center'] } },
    { name: '顔アップ', category: 'people', desc: '表情にフォーカス', values: { angle: 'eye-level', shotType: 'close-up', focalLength: 85, depthOfField: 1.8, composition: ['center'] } },
    { name: '見上げ迫力', category: 'people', desc: '被写体を大きく力強く', values: { angle: 'low', shotType: 'full', focalLength: 24, depthOfField: 8.0, composition: ['center'] } },
    { name: 'シネマティック', category: 'people', desc: '映画的な雰囲気', values: { angle: 'eye-level', shotType: 'medium', focalLength: 35, depthOfField: 2.0, composition: ['negative-space'] } },
    { name: 'ドラマチック', category: 'people', desc: '視線誘導で印象的に', values: { angle: 'high', shotType: 'medium', focalLength: 85, depthOfField: 2.8, composition: ['leading-lines'] } },
    // 商品系
    { name: '商品クローズアップ', category: 'product', desc: '商品ディテールを美しく', values: { angle: 'eye-level', shotType: 'close-up', focalLength: 100, depthOfField: 2.8, composition: ['center'] } },
    { name: 'フラットレイ', category: 'product', desc: '物を並べて真上から', values: { angle: 'birds-eye', shotType: 'wide', focalLength: 35, depthOfField: 11, composition: ['symmetry'] } },
    { name: '雰囲気商品', category: 'product', desc: '生活感のある商品写真', values: { angle: 'high', shotType: 'medium', focalLength: 50, depthOfField: 2.0, composition: ['rule-of-thirds'] } },
    // 風景・建物系
    { name: '風景パノラマ', category: 'landscape', desc: '広大な風景をくっきり', values: { angle: 'eye-level', shotType: 'wide', focalLength: 24, depthOfField: 11, composition: ['rule-of-thirds'] } },
    { name: '建物見上げ', category: 'landscape', desc: '建物を迫力ある構図で', values: { angle: 'low', shotType: 'wide', focalLength: 24, depthOfField: 8.0, composition: ['leading-lines'] } },
    { name: '街並みスナップ', category: 'landscape', desc: '奥行きのある街並み', values: { angle: 'eye-level', shotType: 'wide', focalLength: 35, depthOfField: 5.6, composition: ['leading-lines'] } },
    { name: 'ミニチュア風', category: 'landscape', desc: 'ジオラマ風のかわいい俯瞰', values: { angle: 'birds-eye', shotType: 'wide', focalLength: 200, depthOfField: 2.0, composition: ['center'] } },
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

  // コントロール定義
  const CONTROLS = {
    angle: {
      label: 'アングル（高さ）',
      type: 'select',
      options: [
        { value: 'worms-eye', label: '地面から', icon: '🐛', prompt: "Extreme low angle worm's eye view" },
        { value: 'low', label: '低い', icon: '⬇️', prompt: 'Low angle shot looking slightly upward' },
        { value: 'eye-level', label: '目線', icon: '👁', prompt: 'Eye-level shot' },
        { value: 'high', label: '斜め上', icon: '📐', prompt: 'High angle shot looking down at 45 degrees' },
        { value: 'birds-eye', label: '真上', icon: '🦅', prompt: "Bird's eye view, directly overhead" },
      ],
    },
    shotType: {
      label: '距離（ショットタイプ）',
      type: 'select',
      options: [
        { value: 'extreme-close', label: '超接写', icon: '🔍', prompt: 'Extreme close-up macro shot' },
        { value: 'close-up', label: '接写', icon: '👤', prompt: 'Close-up shot' },
        { value: 'medium', label: '上半身', icon: '🧑', prompt: 'Medium shot' },
        { value: 'full', label: '全身', icon: '🧍', prompt: 'Full body shot' },
        { value: 'wide', label: '広い', icon: '🏠', prompt: 'Wide establishing shot' },
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
    composition: {
      label: '構図',
      type: 'multi-select',
      options: [
        { value: 'rule-of-thirds', label: '三分割', icon: '▦', prompt: 'rule of thirds composition' },
        { value: 'symmetry', label: '対称', icon: '⟷', prompt: 'symmetrical composition' },
        { value: 'leading-lines', label: '導線', icon: '╲', prompt: 'leading lines drawing the eye' },
        { value: 'center', label: '中央', icon: '◎', prompt: 'centered subject composition' },
        { value: 'negative-space', label: '余白', icon: '□', prompt: 'negative space composition' },
      ],
    },
  };

  // 現在の値
  let currentValues = {};
  let keepFlags = {}; // 「今までと同じ」フラグ
  let onChangeCallback = null;

  // JSON値から初期状態を推測（全項目「今までと同じ」をデフォルトに）
  function inferFromJson(cameraJson) {
    const values = {};
    const keeps = {
      angle: true,
      shotType: true,
      focalLength: true,
      depthOfField: true,
      composition: true,
    };

    // カメラ情報がある場合でも、デフォルトは「今までと同じ」
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

      values.composition = [];
      const comp = (cameraJson.composition || '').toLowerCase();
      if (comp) {
        if (comp.includes('third')) values.composition.push('rule-of-thirds');
        if (comp.includes('symmetr')) values.composition.push('symmetry');
        if (comp.includes('leading')) values.composition.push('leading-lines');
        if (comp.includes('center')) values.composition.push('center');
        if (comp.includes('negative space') || comp.includes('余白')) values.composition.push('negative-space');
      }
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

  // 「今までと同じ」チェックボックス行を作成するヘルパー
  function createKeepCheckboxRow(key, onKeepChange) {
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('今までと同じ'));
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
      btn.className = 'preset-btn';
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
    // 値を適用
    currentValues = {
      angle: preset.values.angle,
      shotType: preset.values.shotType,
      focalLength: preset.values.focalLength,
      depthOfField: preset.values.depthOfField,
      composition: [...preset.values.composition],
    };
    // 全てのkeepフラグを外す
    keepFlags = {
      angle: false,
      shotType: false,
      focalLength: false,
      depthOfField: false,
      composition: false,
    };
    // 全体を再描画（inferFromJsonをスキップ）
    presetApplied = true;
    if (currentContainer) {
      render(currentContainer, currentCameraJson);
    }
  }

  // 組み合わせプレビューSVGを描画
  function renderCombinedPreview(container) {
    const section = document.createElement('div');
    section.className = 'camera-control-section';

    const title = document.createElement('p');
    title.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-2';
    title.textContent = '組み合わせプレビュー';
    section.appendChild(title);

    const previewWrap = document.createElement('div');
    previewWrap.id = 'cameraCombinedPreview';
    previewWrap.className = 'combined-preview-container';
    updateCombinedPreviewSvg(previewWrap);
    section.appendChild(previewWrap);

    container.appendChild(section);
  }

  // 組み合わせプレビューSVGを更新
  function updateCombinedPreviewSvg(container) {
    if (!container) container = document.getElementById('cameraCombinedPreview');
    if (!container) return;
    container.innerHTML = '';

    const W = 240, H = 160;
    const svg = svgEl('svg', { width: '100%', height: '100%', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });

    // 背景（空 + 地面）
    const bgG = svgEl('g');
    bgG.appendChild(svgEl('rect', { x: '0', y: '0', width: String(W), height: String(H), fill: '#e0f2fe', rx: '8' }));
    // 建物
    bgG.appendChild(svgEl('rect', { x: '10', y: '30', width: '30', height: '100', fill: '#cbd5e1', rx: '2' }));
    bgG.appendChild(svgEl('rect', { x: '45', y: '50', width: '25', height: '80', fill: '#94a3b8', rx: '2' }));
    bgG.appendChild(svgEl('rect', { x: '170', y: '35', width: '28', height: '95', fill: '#cbd5e1', rx: '2' }));
    bgG.appendChild(svgEl('rect', { x: '205', y: '55', width: '25', height: '75', fill: '#94a3b8', rx: '2' }));
    // 地面
    bgG.appendChild(svgEl('rect', { x: '0', y: '120', width: String(W), height: '40', fill: '#86efac', rx: '0' }));
    svg.appendChild(bgG);

    // 被写体（人物） — ショットタイプで表示範囲を変える
    const shotType = currentValues.shotType || 'medium';
    const angle = currentValues.angle || 'eye-level';

    // 人物のスケールと位置をショットタイプで調整
    const shotScales = {
      'extreme-close': { scale: 4.0, personY: -40 },
      'close-up': { scale: 2.5, personY: -10 },
      'medium': { scale: 1.5, personY: 20 },
      'full': { scale: 1.0, personY: 40 },
      'wide': { scale: 0.6, personY: 60 },
    };
    const shotDef = shotScales[shotType] || shotScales['medium'];

    // アングルによる人物のY位置調整
    const angleOffsets = {
      'worms-eye': -15,
      'low': -8,
      'eye-level': 0,
      'high': 8,
      'birds-eye': 20,
    };
    const angleOffset = angleOffsets[angle] || 0;

    // 人物描画
    const personG = svgEl('g', {
      transform: `translate(120, ${shotDef.personY + angleOffset}) scale(${shotDef.scale})`,
    });
    personG.appendChild(svgEl('path', {
      d: 'M0,-16 a6,6 0 1,0 0.01,0 M-6,-8 h12 q5,0 5,5 v10 h-5 v14 h-4 v-14 h-3 v14 h-4 v-14 h-5 v-10 q0,-5 5,-5',
      fill: '#6d28d9',
    }));
    svg.appendChild(personG);

    // ボケ効果（背景にぼかし）
    const dof = currentValues.depthOfField;
    if (dof && !keepFlags.depthOfField) {
      const maxBlur = 3;
      const ratio = 1 - (dof - 1.4) / (16 - 1.4);
      const blurPx = Math.max(0, ratio * maxBlur);
      if (blurPx > 0.3) {
        // SVG filterでぼかし
        const filterId = 'combinedDofBlur';
        const defs = svgEl('defs');
        const filter = svgEl('filter', { id: filterId, x: '-10%', y: '-10%', width: '120%', height: '120%' });
        filter.appendChild(svgEl('feGaussianBlur', { stdDeviation: String(blurPx.toFixed(1)) }));
        defs.appendChild(filter);
        svg.insertBefore(defs, svg.firstChild);
        bgG.setAttribute('filter', `url(#${filterId})`);
      }
    }

    // 構図ガイドライン（オーバーレイ）
    const compositions = (!keepFlags.composition && currentValues.composition) ? currentValues.composition : [];
    const guideG = svgEl('g', { opacity: '0.6' });

    compositions.forEach(comp => {
      if (comp === 'rule-of-thirds') {
        // 三分割線
        for (let i = 1; i <= 2; i++) {
          const x = (i / 3) * W;
          const y = (i / 3) * H;
          guideG.appendChild(svgEl('line', { x1: String(x), y1: '0', x2: String(x), y2: String(H), stroke: '#f59e0b', 'stroke-width': '1', 'stroke-dasharray': '6,3' }));
          guideG.appendChild(svgEl('line', { x1: '0', y1: String(y), x2: String(W), y2: String(y), stroke: '#f59e0b', 'stroke-width': '1', 'stroke-dasharray': '6,3' }));
        }
        // 交点
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 2; j++) {
            guideG.appendChild(svgEl('circle', { cx: String((i / 3) * W), cy: String((j / 3) * H), r: '4', fill: 'rgba(245,158,11,0.5)', stroke: '#f59e0b', 'stroke-width': '1' }));
          }
        }
      } else if (comp === 'symmetry') {
        // 中央対称線
        guideG.appendChild(svgEl('line', { x1: String(W / 2), y1: '0', x2: String(W / 2), y2: String(H), stroke: '#3b82f6', 'stroke-width': '1.5', 'stroke-dasharray': '8,4' }));
        guideG.appendChild(svgEl('line', { x1: '0', y1: String(H / 2), x2: String(W), y2: String(H / 2), stroke: '#3b82f6', 'stroke-width': '1.5', 'stroke-dasharray': '8,4' }));
      } else if (comp === 'leading-lines') {
        // 消失点に向かう導線
        const vpX = W / 2, vpY = H * 0.35;
        [[0, H], [W, H], [0, 0], [W, 0]].forEach(([sx, sy]) => {
          guideG.appendChild(svgEl('line', { x1: String(sx), y1: String(sy), x2: String(vpX), y2: String(vpY), stroke: '#10b981', 'stroke-width': '1', 'stroke-dasharray': '5,3' }));
        });
        guideG.appendChild(svgEl('circle', { cx: String(vpX), cy: String(vpY), r: '5', fill: 'rgba(16,185,129,0.4)', stroke: '#10b981', 'stroke-width': '1.5' }));
      } else if (comp === 'center') {
        // 中央十字 + 円
        guideG.appendChild(svgEl('line', { x1: String(W / 2), y1: String(H * 0.15), x2: String(W / 2), y2: String(H * 0.85), stroke: '#ef4444', 'stroke-width': '1', 'stroke-dasharray': '5,3' }));
        guideG.appendChild(svgEl('line', { x1: String(W * 0.15), y1: String(H / 2), x2: String(W * 0.85), y2: String(H / 2), stroke: '#ef4444', 'stroke-width': '1', 'stroke-dasharray': '5,3' }));
        guideG.appendChild(svgEl('circle', { cx: String(W / 2), cy: String(H / 2), r: '25', fill: 'none', stroke: '#ef4444', 'stroke-width': '1.5', 'stroke-dasharray': '5,3' }));
      } else if (comp === 'negative-space') {
        // 余白エリアを示す半透明の枠
        guideG.appendChild(svgEl('rect', { x: '8', y: '8', width: String(W - 16), height: String(H - 16), fill: 'none', stroke: '#8b5cf6', 'stroke-width': '1.5', 'stroke-dasharray': '8,4', rx: '4' }));
        // 被写体は小さいことを示すマーク
        guideG.appendChild(svgEl('circle', { cx: String(W * 0.7), cy: String(H * 0.65), r: '12', fill: 'none', stroke: '#8b5cf6', 'stroke-width': '1', 'stroke-dasharray': '3,2' }));
      }
    });
    svg.appendChild(guideG);

    // アングルインジケーター（右下）
    if (!keepFlags.angle && currentValues.angle) {
      const indG = svgEl('g', { transform: `translate(${W - 35}, 12)` });
      const angleLabelMap = { 'worms-eye': '地面', 'low': '低い', 'eye-level': '目線', 'high': '斜め上', 'birds-eye': '真上' };
      indG.appendChild(svgEl('rect', { x: '0', y: '0', width: '30', height: '16', rx: '4', fill: 'rgba(139,92,246,0.85)' }));
      const txt = svgEl('text', { x: '15', y: '12', 'text-anchor': 'middle', 'font-size': '8', fill: 'white', 'font-weight': 'bold' });
      txt.textContent = angleLabelMap[currentValues.angle] || '';
      indG.appendChild(txt);
      svg.appendChild(indG);
    }

    // レンズ情報（左下）
    if (!keepFlags.focalLength && currentValues.focalLength) {
      const lensG = svgEl('g', { transform: `translate(5, 12)` });
      lensG.appendChild(svgEl('rect', { x: '0', y: '0', width: '34', height: '16', rx: '4', fill: 'rgba(59,130,246,0.85)' }));
      const txt = svgEl('text', { x: '17', y: '12', 'text-anchor': 'middle', 'font-size': '8', fill: 'white', 'font-weight': 'bold' });
      txt.textContent = `${currentValues.focalLength}mm`;
      lensG.appendChild(txt);
      svg.appendChild(lensG);
    }

    // 何も設定されていない場合のメッセージ
    const hasAny = !keepFlags.angle || !keepFlags.shotType || !keepFlags.focalLength || !keepFlags.depthOfField || !keepFlags.composition;
    if (!hasAny) {
      const msgG = svgEl('g');
      msgG.appendChild(svgEl('rect', { x: String(W / 2 - 70), y: String(H / 2 - 12), width: '140', height: '24', rx: '6', fill: 'rgba(0,0,0,0.4)' }));
      const msg = svgEl('text', { x: String(W / 2), y: String(H / 2 + 4), 'text-anchor': 'middle', 'font-size': '11', fill: 'white' });
      msg.textContent = '設定を変更するとプレビュー表示';
      msgG.appendChild(msg);
      svg.appendChild(msgG);
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

    Object.entries(CONTROLS).forEach(([key, ctrl]) => {
      const section = document.createElement('div');
      section.className = 'camera-control-section';

      const label = document.createElement('p');
      label.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-2';
      label.textContent = ctrl.label;
      section.appendChild(label);

      if (key === 'angle') section.appendChild(renderAngleVisual(key, ctrl));
      else if (key === 'shotType') section.appendChild(renderShotTypeVisual(key, ctrl));
      else if (key === 'focalLength') section.appendChild(renderFocalLengthVisual(key, ctrl));
      else if (key === 'depthOfField') section.appendChild(renderDepthOfFieldVisual(key, ctrl));
      else if (key === 'composition') section.appendChild(renderCompositionVisual(key, ctrl));

      container.appendChild(section);
    });

    // 組み合わせプレビュー
    renderCombinedPreview(container);

    updatePreview();
  }

  // 1. アングル — カメラ位置ダイアグラムSVGカード
  function renderAngleVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-2';

    // カード群のコンテナ
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'flex flex-wrap gap-2';

    // 「今までと同じ」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        delete currentValues[key];
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        cardsContainer.style.pointerEvents = 'none';
      } else {
        cardsContainer.style.opacity = '1';
        cardsContainer.style.pointerEvents = '';
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      cardsContainer.style.pointerEvents = 'none';
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
        cardsContainer.style.pointerEvents = '';
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

    // 「今までと同じ」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        delete currentValues[key];
        cardsContainer.querySelectorAll('.cam-visual-card').forEach(c => c.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        cardsContainer.style.pointerEvents = 'none';
      } else {
        cardsContainer.style.opacity = '1';
        cardsContainer.style.pointerEvents = '';
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      cardsContainer.style.pointerEvents = 'none';
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
        cardsContainer.style.pointerEvents = '';
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

    // 「今までと同じ」チェックボックス
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('今までと同じ'));
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

    // 画角SVG
    const svgContainer = document.createElement('div');
    svgContainer.className = 'focal-svg-container';
    const fovSvg = createFovSvg(val);
    svgContainer.appendChild(fovSvg);
    wrap.appendChild(svgContainer);

    // keepチェック時にスライダーをdisabledにする
    function applyKeepState(isKeep) {
      keepFlags[key] = isKeep;
      input.disabled = isKeep;
      sliderRow.style.opacity = isKeep ? '0.4' : '1';
      svgContainer.style.opacity = isKeep ? '0.4' : '1';
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
      svgContainer.style.opacity = '1';
      valueDisplay.textContent = `${v}${ctrl.unit || ''}`;
      // 画角SVG更新
      svgContainer.innerHTML = '';
      svgContainer.appendChild(createFovSvg(v));
      updatePreview();
    });

    return wrap;
  }

  // 画角（FoV）扇形SVGを生成
  function createFovSvg(focalLength) {
    // 焦点距離→画角の近似変換（35mmフルフレーム基準）
    const fovDeg = 2 * Math.atan(18 / focalLength) * 180 / Math.PI;
    const svg = svgEl('svg', { width: '160', height: '50', viewBox: '0 0 160 50' });

    // カメラ位置（左端中央）
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

    // 「今までと同じ」チェックボックス
    const keepRow = document.createElement('label');
    keepRow.className = 'flex items-center gap-2 mb-1 cursor-pointer text-xs text-gray-500 dark:text-gray-400';
    const keepCheck = document.createElement('input');
    keepCheck.type = 'checkbox';
    keepCheck.checked = !!keepFlags[key];
    keepCheck.className = 'rounded border-gray-300';
    keepRow.appendChild(keepCheck);
    keepRow.appendChild(document.createTextNode('今までと同じ'));
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

    // ボケプレビュー（3層SVG）
    const previewContainer = document.createElement('div');
    previewContainer.className = 'dof-preview-container';

    // 背景層（建物シルエット）
    const bgSvg = svgEl('svg', { width: '100%', height: '100%', viewBox: '0 0 200 60', preserveAspectRatio: 'none', style: 'position:absolute;inset:0;' });
    // 空
    bgSvg.appendChild(svgEl('rect', { x: '0', y: '0', width: '200', height: '60', fill: '#bfdbfe' }));
    // 建物
    bgSvg.appendChild(svgEl('rect', { x: '10', y: '10', width: '25', height: '50', fill: '#94a3b8' }));
    bgSvg.appendChild(svgEl('rect', { x: '40', y: '20', width: '20', height: '40', fill: '#a1a1aa' }));
    bgSvg.appendChild(svgEl('rect', { x: '140', y: '15', width: '22', height: '45', fill: '#94a3b8' }));
    bgSvg.appendChild(svgEl('rect', { x: '170', y: '25', width: '25', height: '35', fill: '#a1a1aa' }));
    // 地面
    bgSvg.appendChild(svgEl('rect', { x: '0', y: '48', width: '200', height: '12', fill: '#86efac' }));

    const bgLayer = document.createElement('div');
    bgLayer.className = 'dof-layer background';
    bgLayer.appendChild(bgSvg);

    // 被写体層（人物）
    const subSvg = svgEl('svg', { width: '40', height: '55', viewBox: '0 0 40 46', style: 'display:block;' });
    subSvg.appendChild(svgEl('path', { d: PERSON_PATH, fill: '#6d28d9' }));
    const subLayer = document.createElement('div');
    subLayer.className = 'dof-layer subject';
    subLayer.style.cssText = 'bottom:4px;';
    subLayer.appendChild(subSvg);

    // 前景層（草）
    const fgSvg = svgEl('svg', { width: '100%', height: '20', viewBox: '0 0 200 20', preserveAspectRatio: 'none', style: 'display:block;' });
    for (let i = 0; i < 200; i += 8) {
      const h = 6 + Math.random() * 10;
      fgSvg.appendChild(svgEl('line', { x1: String(i), y1: '20', x2: String(i + 2), y2: String(20 - h), stroke: '#22c55e', 'stroke-width': '2', 'stroke-linecap': 'round' }));
    }
    const fgLayer = document.createElement('div');
    fgLayer.className = 'dof-layer foreground';
    fgLayer.appendChild(fgSvg);

    previewContainer.appendChild(bgLayer);
    previewContainer.appendChild(subLayer);
    previewContainer.appendChild(fgLayer);
    wrap.appendChild(previewContainer);

    // blur更新関数
    function updateDofBlur(fValue) {
      // f/1.4→blur 4px, f/16→blur 0px
      const maxBlur = 4;
      const ratio = 1 - (fValue - 1.4) / (16 - 1.4);
      const blurPx = Math.max(0, ratio * maxBlur);
      bgLayer.style.filter = `blur(${blurPx.toFixed(1)}px)`;
      fgLayer.style.filter = `blur(${(blurPx * 0.7).toFixed(1)}px)`;
    }
    updateDofBlur(val);

    // keepチェック時にスライダーをdisabledにする
    function applyKeepState(isKeep) {
      keepFlags[key] = isKeep;
      input.disabled = isKeep;
      sliderRow.style.opacity = isKeep ? '0.4' : '1';
      previewContainer.style.opacity = isKeep ? '0.4' : '1';
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
      previewContainer.style.opacity = '1';
      valueDisplay.textContent = `f/${v.toFixed(1)}`;
      updateDofBlur(v);
      updatePreview();
    });

    return wrap;
  }

  // 5. 構図 — ミニキャンバスSVGボタン
  function renderCompositionVisual(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-2';

    if (!currentValues[key]) currentValues[key] = [];

    // カード群のコンテナ
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'flex flex-wrap gap-2';

    // 「今までと同じ」チェックボックス
    const { keepRow, keepCheck } = createKeepCheckboxRow(key, (isKeep) => {
      keepFlags[key] = isKeep;
      if (isKeep) {
        currentValues[key] = [];
        cardsContainer.querySelectorAll('.comp-visual-btn').forEach(b => b.classList.remove('selected'));
        cardsContainer.style.opacity = '0.4';
        cardsContainer.style.pointerEvents = 'none';
      } else {
        cardsContainer.style.opacity = '1';
        cardsContainer.style.pointerEvents = '';
      }
      updatePreview();
    });
    wrap.appendChild(keepRow);

    // 初期状態反映
    if (keepFlags[key]) {
      cardsContainer.style.opacity = '0.4';
      cardsContainer.style.pointerEvents = 'none';
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
      btn.className = `comp-visual-btn${isSelected ? ' selected' : ''}`;

      const svg = svgEl('svg', { width: '48', height: '48', viewBox: '0 0 48 48' });
      // 枠線
      svg.appendChild(svgEl('rect', { x: '0.5', y: '0.5', width: '47', height: '47', rx: '3', fill: 'white', stroke: '#e5e7eb', 'stroke-width': '1' }));
      // パターン描画
      if (compDefs[opt.value]) compDefs[opt.value](svg);

      btn.appendChild(svg);
      const lbl = document.createElement('span');
      lbl.className = 'card-label';
      lbl.textContent = opt.label;
      btn.appendChild(lbl);

      btn.addEventListener('click', () => {
        keepFlags[key] = false;
        keepCheck.checked = false;
        cardsContainer.style.opacity = '1';
        cardsContainer.style.pointerEvents = '';
        const idx = currentValues[key].indexOf(opt.value);
        if (idx >= 0) {
          currentValues[key].splice(idx, 1);
          btn.classList.remove('selected');
        } else {
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

    // focalLength（keepなら除外）
    if (!keepFlags.focalLength && currentValues.focalLength) {
      parts.push(CONTROLS.focalLength.toPrompt(currentValues.focalLength));
    }

    // depthOfField（keepなら除外）
    if (!keepFlags.depthOfField && currentValues.depthOfField) {
      parts.push(CONTROLS.depthOfField.toPrompt(currentValues.depthOfField));
    }

    // composition（keepなら除外）
    if (!keepFlags.composition && currentValues.composition && currentValues.composition.length > 0) {
      currentValues.composition.forEach(v => {
        const opt = CONTROLS.composition.options.find(o => o.value === v);
        if (opt) parts.push(opt.prompt);
      });
    }

    return parts.length > 0 ? `Change camera to: ${parts.join(', ')}` : '';
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

  // 変更コールバック設定
  function onChange(cb) {
    onChangeCallback = cb;
  }

  return {
    render,
    getPromptText,
    getValues,
    onChange,
  };
})();
