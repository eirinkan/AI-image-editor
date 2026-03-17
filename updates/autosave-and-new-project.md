# リロードでデータ保持 + 自動保存 + 新規作成ボタン

## Context
ブラウザリロードで編集中のデータ（画像・分析結果・履歴）がすべて消える問題を解決。自動保存でリロード耐性を持たせ、ヘッダーに「新規作成」ボタンを追加して確認ダイアログ付きでプロジェクト全体をクリアできるようにする。

## 変更内容

### 1. storage.js — セッション自動保存メソッド追加（v=1→2）
- `saveSession(data)`: 予約ID `__autosave__` でIndexedDBに保存（既存のprojectsストアを利用）
- `loadSession()`: `__autosave__` を読み込み（存在しなければnull）
- `clearSession()`: `__autosave__` を削除
- `listProjects()`: `__autosave__` はプロジェクト一覧から除外（cursorループ内でスキップ）

### 2. app.js — autoSave / restoreSession / clearProject 追加（v=18→19）

#### autoSave()（デバウンス500ms）
- 保存データ: state（originalImage, currentImage, currentJson, originalJson）、EditHistory全エントリ、currentIndex、currentProjectId、tabState、analysisCompleted
- 呼び出しタイミング:
  - `onImageUploaded` — 画像アップロード時
  - `onGeneratedImageReady` — AI生成画像準備完了時
  - `analyze()` 成功後
  - `generate()` 成功後（1枚・複数枚とも）
  - `onImageAdopted` — 複数枚から採用時
  - `onHistoryChange` — 履歴変更時

#### restoreSession()（init()内で呼び出し）
- IndexedDBから `__autosave__` を読み込み
- state（画像・JSON）を復元
- EditHistory.fromSerializable() + goTo(currentIndex) で履歴復元
- タブ状態（upload/generate）を復元
- 分析完了時はタブバー非表示
- 画像プレビュー・分析セクション・要素一覧・結果パネルを復元

#### clearProject()（confirm付き）
- 全state初期化（originalImage, currentImage, referenceImage, currentJson, originalJson, selectedElements, pendingJson, currentProjectId）
- EditHistory.clear() + UI.clearSelectedElements()
- 全UIパネルを初期状態に戻す（imagePreview非表示、uploadPrompt表示、analysisSection/elementsSection/editSection/resultSection非表示）
- タブバー復活、アップロードタブに戻す
- ProjectStorage.clearSession() で自動保存削除

#### onImageRemoved() にも追加
- `ProjectStorage.clearSession()` を呼び出し、画像削除時に自動保存もクリア

### 3. index.html — ヘッダーに「新規作成」ボタン追加
- 「保存」ボタンの左に `id="newProjectBtn"` を配置
- アイコン: ドキュメント新規（Heroicons: document-plus）
- キャッシュバスティング: storage.js v=2, ui.js v=30, app.js v=19

### 4. ui.js — 新規作成ボタンのイベント追加（v=29→30）
- `setupEventListeners()` 内で `newProjectBtn` クリック → `App.clearProject()` を呼ぶ

### 5. 自動保存データの構造
```js
{
  id: '__autosave__',
  originalImage: { base64, mimeType },
  currentImage: { base64, mimeType },
  currentJson: {...},
  originalJson: {...},
  entries: [...],        // EditHistory.toSerializable()
  currentIndex: N,
  currentProjectId: '...' | null,
  tabState: 'upload' | 'generate',
  analysisCompleted: true/false,
  updatedAt: ISO文字列
}
```

## 対象ファイル
- `js/storage.js` — saveSession/loadSession/clearSession追加、listProjectsから除外
- `js/app.js` — autoSave, restoreSession, clearProject追加、各所にautoSave呼び出し
- `js/ui.js` — newProjectBtnイベント追加
- `index.html` — ヘッダーにnewProjectBtn追加、キャッシュバスティング

## 検証
- [ ] 画像アップロード→リロード→画像が復元される
- [ ] 分析→リロード→分析結果・要素一覧が復元、タブバーが非表示
- [ ] 生成→リロード→生成結果プレビュー・履歴が復元
- [ ] ヘッダー「新規作成」→確認ダイアログ→全クリア→初期状態に戻る
- [ ] プロジェクト一覧に「自動保存」が混ざらない
- [ ] 画像×ボタンで削除→自動保存もクリアされる
