// ビジュアルカメラエディタモジュール

const CameraEditor = (() => {
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
  let onChangeCallback = null;

  // JSON値から初期状態を推測
  function inferFromJson(cameraJson) {
    const values = {};
    if (!cameraJson) return values;

    // angle
    const angle = (cameraJson.angle || '').toLowerCase();
    if (angle.includes('low')) values.angle = 'low';
    else if (angle.includes('high')) values.angle = 'high';
    else if (angle.includes('bird')) values.angle = 'birds-eye';
    else if (angle.includes('worm')) values.angle = 'worms-eye';
    else values.angle = 'eye-level';

    // focal_length
    const fl = cameraJson.focal_length || '';
    const flMatch = fl.match(/(\d+)\s*mm/i);
    if (flMatch) values.focalLength = parseInt(flMatch[1]);
    else if (fl.includes('wide')) values.focalLength = 24;
    else if (fl.includes('telephoto')) values.focalLength = 135;
    else values.focalLength = 50;

    // depth_of_field
    const dof = (cameraJson.depth_of_field || '').toLowerCase();
    if (dof.includes('shallow')) values.depthOfField = 2.0;
    else if (dof.includes('deep')) values.depthOfField = 11;
    else values.depthOfField = 5.6;

    // composition
    values.composition = [];
    const comp = (cameraJson.composition || '').toLowerCase();
    if (comp.includes('third')) values.composition.push('rule-of-thirds');
    if (comp.includes('symmetr')) values.composition.push('symmetry');
    if (comp.includes('leading')) values.composition.push('leading-lines');
    if (comp.includes('center')) values.composition.push('center');

    return values;
  }

  // コンテナにビジュアルコントロールを描画
  function render(container, cameraJson) {
    currentValues = inferFromJson(cameraJson);
    container.innerHTML = '';

    Object.entries(CONTROLS).forEach(([key, ctrl]) => {
      const section = document.createElement('div');
      section.className = 'camera-control-section';

      const label = document.createElement('p');
      label.className = 'text-xs font-medium text-gray-500 mb-2';
      label.textContent = ctrl.label;
      section.appendChild(label);

      if (ctrl.type === 'select') {
        section.appendChild(renderSelect(key, ctrl));
      } else if (ctrl.type === 'slider') {
        section.appendChild(renderSlider(key, ctrl));
      } else if (ctrl.type === 'multi-select') {
        section.appendChild(renderMultiSelect(key, ctrl));
      }

      container.appendChild(section);
    });

    // プロンプトプレビュー
    const preview = document.createElement('div');
    preview.className = 'camera-prompt-preview bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3';
    preview.innerHTML = `
      <p class="text-[10px] text-purple-400 mb-1">生成されるカメラ指示</p>
      <p id="cameraPromptPreview" class="text-xs text-purple-700 font-mono leading-relaxed"></p>
    `;
    container.appendChild(preview);

    updatePreview();
  }

  // セレクトボタン群
  function renderSelect(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap gap-1.5';

    ctrl.options.forEach(opt => {
      const btn = document.createElement('button');
      const isSelected = currentValues[key] === opt.value;
      btn.className = `cam-select-btn px-2.5 py-1.5 rounded-lg border-2 text-xs transition-all flex items-center gap-1 ${isSelected ? 'selected' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`;
      btn.dataset.key = key;
      btn.dataset.value = opt.value;
      btn.innerHTML = `<span>${opt.icon}</span><span>${opt.label}</span>`;
      btn.addEventListener('click', () => {
        currentValues[key] = opt.value;
        wrap.querySelectorAll('.cam-select-btn').forEach(b => {
          b.classList.remove('selected');
          b.classList.add('border-gray-200', 'text-gray-600');
        });
        btn.classList.add('selected');
        btn.classList.remove('border-gray-200', 'text-gray-600');
        updatePreview();
      });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  // スライダー
  function renderSlider(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'space-y-1';

    const val = currentValues[key] ?? ctrl.default;
    currentValues[key] = val;

    // スライダー行
    const sliderRow = document.createElement('div');
    sliderRow.className = 'flex items-center gap-3';

    const labelLeft = document.createElement('span');
    labelLeft.className = 'text-[10px] text-gray-400 w-12 text-right flex-shrink-0';
    labelLeft.textContent = ctrl.labels[0];

    const input = document.createElement('input');
    input.type = 'range';
    input.min = ctrl.min;
    input.max = ctrl.max;
    input.step = ctrl.step || 1;
    input.value = val;
    input.className = 'cam-slider flex-1';

    const labelRight = document.createElement('span');
    labelRight.className = 'text-[10px] text-gray-400 w-12 flex-shrink-0';
    labelRight.textContent = ctrl.labels[ctrl.labels.length - 1];

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'text-xs font-mono font-medium text-purple-600 w-14 text-center flex-shrink-0';
    valueDisplay.textContent = `${val}${ctrl.unit || ''}`;

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      currentValues[key] = v;
      valueDisplay.textContent = `${key === 'depthOfField' ? `f/${v.toFixed(1)}` : `${v}${ctrl.unit || ''}`}`;
      updatePreview();
    });

    sliderRow.appendChild(labelLeft);
    sliderRow.appendChild(input);
    sliderRow.appendChild(labelRight);
    sliderRow.appendChild(valueDisplay);
    wrap.appendChild(sliderRow);

    return wrap;
  }

  // 複数選択ボタン群
  function renderMultiSelect(key, ctrl) {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap gap-1.5';

    if (!currentValues[key]) currentValues[key] = [];

    ctrl.options.forEach(opt => {
      const btn = document.createElement('button');
      const isSelected = currentValues[key].includes(opt.value);
      btn.className = `cam-select-btn px-2.5 py-1.5 rounded-lg border-2 text-xs transition-all flex items-center gap-1 ${isSelected ? 'selected' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`;
      btn.dataset.key = key;
      btn.dataset.value = opt.value;
      btn.innerHTML = `<span>${opt.icon}</span><span>${opt.label}</span>`;
      btn.addEventListener('click', () => {
        const idx = currentValues[key].indexOf(opt.value);
        if (idx >= 0) {
          currentValues[key].splice(idx, 1);
          btn.classList.remove('selected');
          btn.classList.add('border-gray-200', 'text-gray-600');
        } else {
          currentValues[key].push(opt.value);
          btn.classList.add('selected');
          btn.classList.remove('border-gray-200', 'text-gray-600');
        }
        updatePreview();
      });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  // プロンプトテキストを生成
  function getPromptText() {
    const parts = [];

    // angle
    if (currentValues.angle) {
      const opt = CONTROLS.angle.options.find(o => o.value === currentValues.angle);
      if (opt) parts.push(opt.prompt);
    }

    // shotType
    if (currentValues.shotType) {
      const opt = CONTROLS.shotType.options.find(o => o.value === currentValues.shotType);
      if (opt) parts.push(opt.prompt);
    }

    // focalLength
    if (currentValues.focalLength) {
      parts.push(CONTROLS.focalLength.toPrompt(currentValues.focalLength));
    }

    // depthOfField
    if (currentValues.depthOfField) {
      parts.push(CONTROLS.depthOfField.toPrompt(currentValues.depthOfField));
    }

    // composition
    if (currentValues.composition && currentValues.composition.length > 0) {
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
    if (el) el.textContent = getPromptText() || '(コントロールを操作してください)';
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
