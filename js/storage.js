// プロジェクト永続保存モジュール（IndexedDB）

const ProjectStorage = (() => {
  const DB_NAME = 'ai_image_editor';
  const DB_VERSION = 1;
  const STORE_NAME = 'projects';
  let db = null;

  // DB接続
  function init() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      request.onerror = (e) => {
        reject(new Error('IndexedDBの初期化に失敗しました: ' + e.target.error));
      };
    });
  }

  // トランザクション取得ヘルパー
  function getStore(mode = 'readonly') {
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  // プロジェクト保存（新規 or 上書き）
  function saveProject(data) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const project = {
        id: data.id || crypto.randomUUID(),
        name: data.name || `プロジェクト ${new Date().toLocaleString('ja-JP')}`,
        createdAt: data.createdAt || now,
        updatedAt: now,
        thumbnail: data.thumbnail || '',
        originalImage: data.originalImage || null,
        entries: data.entries || [],
      };
      const store = getStore('readwrite');
      const request = store.put(project);
      request.onsuccess = () => resolve(project);
      request.onerror = (e) => reject(new Error('プロジェクトの保存に失敗しました: ' + e.target.error));
    });
  }

  // プロジェクト読み込み
  function loadProject(id) {
    return new Promise((resolve, reject) => {
      const store = getStore('readonly');
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error('プロジェクトが見つかりません'));
        }
      };
      request.onerror = (e) => reject(new Error('プロジェクトの読み込みに失敗しました: ' + e.target.error));
    });
  }

  // 一覧取得（サムネイル + メタデータのみ、画像データは除外）
  // __autosave__ はプロジェクト一覧から除外
  function listProjects() {
    return new Promise((resolve, reject) => {
      const store = getStore('readonly');
      const request = store.index('updatedAt').openCursor(null, 'prev');
      const projects = [];
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const p = cursor.value;
          if (p.id !== '__autosave__') {
            projects.push({
              id: p.id,
              name: p.name,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              thumbnail: p.thumbnail,
              entryCount: p.entries ? p.entries.length : 0,
            });
          }
          cursor.continue();
        } else {
          resolve(projects);
        }
      };
      request.onerror = (e) => reject(new Error('プロジェクト一覧の取得に失敗しました: ' + e.target.error));
    });
  }

  // セッション自動保存（予約ID __autosave__）
  function saveSession(data) {
    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const record = Object.assign({}, data, {
        id: '__autosave__',
        updatedAt: new Date().toISOString(),
      });
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(new Error('自動保存に失敗: ' + e.target.error));
    });
  }

  // セッション自動保存の読み込み
  function loadSession() {
    return new Promise((resolve, reject) => {
      const store = getStore('readonly');
      const request = store.get('__autosave__');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(new Error('自動保存の読み込みに失敗: ' + e.target.error));
    });
  }

  // セッション自動保存を削除
  function clearSession() {
    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const request = store.delete('__autosave__');
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(new Error('自動保存の削除に失敗: ' + e.target.error));
    });
  }

  // プロジェクト削除
  function deleteProject(id) {
    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(new Error('プロジェクトの削除に失敗しました: ' + e.target.error));
    });
  }

  // JSONファイルとしてエクスポート
  async function exportProject(id) {
    const project = await loadProject(id);
    const exportData = {
      format: 'ai-marker-editor-project',
      version: 1,
      project: project,
    };
    const json = JSON.stringify(exportData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // JSONファイルからインポート
  function importProject(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.format !== 'ai-marker-editor-project' && data.format !== 'ai-image-editor-project' || !data.project) {
            reject(new Error('無効なファイル形式です。AIマーカーエディタのプロジェクトファイルを選択してください。'));
            return;
          }
          // 新しいIDを割り当てて重複を防ぐ
          const project = data.project;
          project.id = crypto.randomUUID();
          project.updatedAt = new Date().toISOString();
          const saved = await saveProject(project);
          resolve(saved);
        } catch (err) {
          if (err.message.includes('無効なファイル形式')) {
            reject(err);
          } else {
            reject(new Error('ファイルの読み込みに失敗しました: ' + err.message));
          }
        }
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file);
    });
  }

  return {
    init,
    saveProject,
    loadProject,
    listProjects,
    deleteProject,
    exportProject,
    importProject,
    saveSession,
    loadSession,
    clearSession,
  };
})();
