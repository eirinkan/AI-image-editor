// 編集履歴管理モジュール

const EditHistory = (() => {
  let entries = [];
  let currentIndex = -1;
  let listeners = [];

  // 履歴エントリの作成
  function createEntry(imageData, json, instruction = null, parentId = null) {
    const entry = {
      id: entries.length,
      label: instruction || 'オリジナル',
      image: imageData, // { base64, mimeType }
      json: json,
      instruction: instruction,
      parentId: parentId,
      timestamp: new Date().toISOString(),
    };
    entries.push(entry);
    currentIndex = entry.id;
    notifyListeners();
    save();
    return entry;
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

  // sessionStorageに保存（画像データが大きいので最新10件のみ）
  function save() {
    try {
      const toSave = entries.slice(-10).map(e => ({
        ...e,
        // サムネイル用に画像を小さくして保存はしない（メモリ内で管理）
      }));
      // 履歴のメタデータのみ保存（画像データはセッション中のみ）
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

  // サムネイル用のDataURLを生成
  function getThumbnailUrl(entry) {
    if (!entry || !entry.image) return '';
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

  return {
    createEntry,
    goTo,
    getCurrent,
    getCurrentIndex,
    getAll,
    clear,
    onChange,
    getThumbnailUrl,
    downloadImage,
  };
})();
