// 編集履歴管理モジュール

const EditHistory = (() => {
  let entries = [];
  let currentIndex = -1;
  let listeners = [];

  // サムネイルを生成（メモリ軽量化）
  function createThumbnail(imageData, maxSize = 128) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxSize && height <= maxSize) {
          resolve(`data:${imageData.mimeType};base64,${imageData.base64}`);
          return;
        }
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve('');
      img.src = `data:${imageData.mimeType};base64,${imageData.base64}`;
    });
  }

  // 履歴エントリの作成
  async function createEntry(imageData, json, instruction = null, parentId = null) {
    // サムネイルを非同期生成
    const thumbnailUrl = await createThumbnail(imageData);

    const entry = {
      id: entries.length,
      label: instruction || 'オリジナル',
      image: imageData, // { base64, mimeType }
      json: json,
      instruction: instruction,
      parentId: parentId,
      timestamp: new Date().toISOString(),
      thumbnailUrl: thumbnailUrl, // 軽量サムネイル
    };
    entries.push(entry);
    currentIndex = entry.id;
    notifyListeners();
    save();
    return entry;
  }

  // 現在のエントリの画像を更新（再採用時に使用）
  async function updateCurrentEntry(imageData) {
    if (currentIndex < 0 || currentIndex >= entries.length) return;
    const entry = entries[currentIndex];
    entry.image = imageData;
    entry.thumbnailUrl = await createThumbnail(imageData);
    notifyListeners();
    save();
  }

  // 指定時点に戻る
  function goTo(id) {
    if (id < 0 || id >= entries.length) return null;
    currentIndex = id;
    notifyListeners();
    return entries[id];
  }

  // 現在のエントリを取得
  function getCurrent() {
    if (currentIndex < 0 || currentIndex >= entries.length) return null;
    return entries[currentIndex];
  }

  // 現在のインデックスを取得
  function getCurrentIndex() {
    return currentIndex;
  }

  // 全履歴を取得
  function getAll() {
    return [...entries];
  }

  // 個別エントリを削除
  function removeEntry(id) {
    if (id < 0 || id >= entries.length) return;
    // オリジナル（id=0）は削除不可
    if (id === 0 && entries.length > 1) return;
    entries.splice(id, 1);
    // IDを振り直す
    entries.forEach((e, i) => { e.id = i; });
    // currentIndexの調整
    if (currentIndex >= entries.length) {
      currentIndex = entries.length - 1;
    } else if (currentIndex > id) {
      currentIndex--;
    } else if (currentIndex === id) {
      currentIndex = Math.min(id, entries.length - 1);
    }
    if (entries.length === 0) {
      currentIndex = -1;
    }
    notifyListeners();
    save();
  }

  // 履歴をクリア
  function clear() {
    entries = [];
    currentIndex = -1;
    notifyListeners();
    sessionStorage.removeItem('edit_history');
  }

  // リスナー登録
  function onChange(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  }

  // リスナー通知
  function notifyListeners() {
    listeners.forEach(cb => cb(entries, currentIndex));
  }

  // sessionStorageに保存（履歴のメタデータのみ・画像データはセッション中のみ）
  function save() {
    try {
      const meta = entries.map(e => ({
        id: e.id,
        label: e.label,
        instruction: e.instruction,
        parentId: e.parentId,
        timestamp: e.timestamp,
      }));
      sessionStorage.setItem('edit_history_meta', JSON.stringify(meta));
    } catch {
      // sessionStorageの容量制限を超えた場合は無視
    }
  }

  // サムネイル用のDataURLを取得（軽量版があればそれを使用）
  function getThumbnailUrl(entry) {
    if (!entry) return '';
    if (entry.thumbnailUrl) return entry.thumbnailUrl;
    if (!entry.image) return '';
    return `data:${entry.image.mimeType};base64,${entry.image.base64}`;
  }

  // 画像のダウンロード
  function downloadImage(entry, filename) {
    if (!entry || !entry.image) return;
    const link = document.createElement('a');
    link.href = `data:${entry.image.mimeType};base64,${entry.image.base64}`;
    link.download = filename || `edit_v${entry.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 全エントリをシリアライズ可能な形で返す（保存用）
  function toSerializable() {
    return entries.map(e => ({
      id: e.id,
      label: e.label,
      image: e.image,
      json: e.json,
      instruction: e.instruction,
      parentId: e.parentId,
      timestamp: e.timestamp,
      thumbnailUrl: e.thumbnailUrl,
      selectedElements: e.selectedElements || null,
      editInstructions: e.editInstructions || null,
      model: e.model || null,
    }));
  }

  // シリアライズデータから履歴を復元
  function fromSerializable(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    entries = data.map((e, i) => ({
      id: i,
      label: e.label || 'オリジナル',
      image: e.image,
      json: e.json,
      instruction: e.instruction || null,
      parentId: e.parentId != null ? e.parentId : null,
      timestamp: e.timestamp || new Date().toISOString(),
      thumbnailUrl: e.thumbnailUrl || '',
      selectedElements: e.selectedElements || null,
      editInstructions: e.editInstructions || null,
      model: e.model || null,
    }));
    currentIndex = entries.length - 1;
    notifyListeners();
  }

  return {
    createEntry,
    updateCurrentEntry,
    goTo,
    getCurrent,
    getCurrentIndex,
    getAll,
    clear,
    removeEntry,
    onChange,
    getThumbnailUrl,
    downloadImage,
    toSerializable,
    fromSerializable,
  };
})();
