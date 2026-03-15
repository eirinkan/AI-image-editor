# 実装プラン: AI画像エディタ ブラッシュアップ

> 5ラウンド×5エージェントによる包括的レビュー結果を統合。
> 指摘総数: Critical 12件 / High 40件 / Medium 30件 / Low 20件

---

## Phase 1: 致命的バグ・セキュリティ修正（即時対応）

### 1-1. APIキーをURLから除去 → ヘッダー送信に変更
- **ファイル:** `js/api.js` L326
- **内容:** `?key=${apiKey}` をURLから削除し、`x-goog-api-key` ヘッダーで送信
- **理由:** ブラウザ履歴・ログ・Refererにキーが露出する最大のセキュリティリスク

### 1-2. simpleMarkdown の XSS 修正
- **ファイル:** `js/generate.js` L269-279, L162-163
- **内容:** `simpleMarkdown()` の入力を先に `escapeHtml()` してからマークダウン変換する
- **理由:** APIレスポンスに `<script>` が含まれた場合にXSS成立

### 1-3. Race Condition 防止（ボタン無効化）
- **ファイル:** `js/app.js`, `js/ui.js`
- **内容:** `analyze()` / `generate()` 実行中に `analyzeBtn` / `generateBtn` を `disabled` にする
- **理由:** 連続クリックで状態不整合・二重リクエストが発生

### 1-4. onImageRemoved で cancelCurrentOperation 呼び出し
- **ファイル:** `js/app.js` L58
- **内容:** `onImageRemoved()` の先頭に `cancelCurrentOperation()` を追加
- **理由:** 分析/生成中に画像削除すると、レスポンス到着時に null 状態に書き込み

### 1-5. goToHistory 後の selectedElements クリア
- **ファイル:** `js/app.js` L238付近
- **内容:** `goToHistory()` 内で `UI.clearSelectedElements()` と `state.selectedElements = []` を実行
- **理由:** 履歴復元後に古い選択要素が残留し、意図しない指示が送信される

### 1-6. canvas.toBlob の null チェック追加
- **ファイル:** `js/api.js` L304
- **内容:** `if (!blob) { reject(new Error('画像の変換に失敗')); return; }` を追加
- **理由:** tainted canvas 等で blob が null になるとPromiseがhanging

### 1-7. TextToImage に AbortController 追加
- **ファイル:** `js/generate.js` L190-241
- **内容:** `approveAndGenerate()` に AbortController を追加、`showLoading` に `showCancel: true` を渡す
- **理由:** 20〜60秒の処理をキャンセルできない

---

## Phase 2: セキュリティ強化・バリデーション

### 2-1. ファイルアップロードのバリデーション強化
- **ファイル:** `js/ui.js` processUploadedFile, processReferenceFile
- **内容:** MIMEホワイトリスト（jpeg/png/webp）、サイズ上限（20MB）、SVG除外
- 非画像ドロップ時にエラーメッセージ表示

### 2-2. APIキーの保存方法改善
- **ファイル:** `js/api.js` L11-15
- **内容:** `localStorage` → `sessionStorage` に変更（タブ閉じで消える）
- `autocomplete="off"` を `apiKeyInput` に追加

### 2-3. CSP（Content Security Policy）追加
- **ファイル:** `index.html` `<head>`
- **内容:** `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.tailwindcss.com; ...">` 追加

### 2-4. Prompt Injection 対策
- **ファイル:** `js/api.js` buildAnalysisPrompt, buildUpdatePrompt
- **内容:** ユーザー入力を `<user_input>` デリミタで囲む、入力長上限（500文字）を追加

### 2-5. エラーメッセージからAPI生テキスト除去
- **ファイル:** `js/api.js` L473-474, L566-567
- **内容:** ユーザー向けメッセージを汎用化、詳細は `console.error` のみ

---

## Phase 3: UX改善

### 3-1. APIキー未設定時の初期状態案内
- **ファイル:** `index.html`, `js/ui.js`
- **内容:** APIキー未設定時にStep1の分析ボタンを `disabled` にし、インライン案内「まずAPIキーを設定してください」を表示。エラー時に `apiKeyInput.focus()` で入力欄にフォーカス移動

### 3-2. エラートーストにリカバリアクション追加
- **ファイル:** `js/ui.js` showError
- **内容:** エラーメッセージ内にアクションリンク（例:「APIキーを設定」→フォーカス移動）を追加
- `showError` / `showSuccess` のタイマー競合修正（`clearTimeout` 追加）

### 3-3. 要素選択数カウンター表示
- **ファイル:** `js/ui.js` selectElement
- **内容:** 要素一覧セクションのヘッダーに「N件選択中」バッジを表示

### 3-4. Before/Afterスライダーの発見性改善
- **ファイル:** `js/ui.js`, `css/style.css`
- **内容:** 結果表示時に一度だけスライダーの存在をアニメーションで示唆（1秒間50%位置→0%に戻す）
- モバイルではスライダーを常時表示（初期50%）

### 3-5. タブ切替時の状態リセット
- **ファイル:** `js/generate.js` switchSubTab
- **内容:** `switchSubTab('upload')` 時に `ideaInputSection` を表示、`promptReviewSection` / `generateResultPreview` を非表示にリセット

### 3-6. goToHistory でtext-to-image履歴時のUI整理
- **ファイル:** `js/app.js` goToHistory
- **内容:** text-to-image履歴に戻る際に `editSection` / `elementsSection` を非表示にする

---

## Phase 4: レスポンシブ・アクセシビリティ

### 4-1. ヘッダーのモバイル対応
- **ファイル:** `index.html` L14
- **内容:** `flex-col sm:flex-row` でモバイル時にタイトルとAPIキー欄を縦積み

### 4-2. タップターゲット拡大
- **ファイル:** `css/style.css`
- **内容:**
  - `.image-marker`: `::before` 疑似要素で44×44pxの不可視タップ領域
  - `#removeImage`, `#removeReference`: padding追加で44px以上に
  - 履歴の `history-dl-btn`, `history-del-btn`: パディング追加

### 4-3. ARIA属性の追加（一括）
- **ファイル:** `index.html`, `js/ui.js`
- **内容:**
  - `label[for="apiKeyInput"]` 追加
  - `#errorToast`: `role="alert" aria-live="assertive"`
  - `#loadingText`: `role="status" aria-live="polite"`
  - `#customElementModal`: `role="dialog" aria-modal="true" aria-labelledby`
  - フォーカスタグ: `aria-pressed` のトグル
  - 要素カード: `aria-pressed` のトグル
  - `.image-marker`: `role="button"` + `aria-label`
  - 削除ボタン: `aria-label="画像を削除"` 等
  - カメラスライダー: `aria-label` + `aria-valuetext`

### 4-4. モーダルのフォーカストラップ実装
- **ファイル:** `js/ui.js`
- **内容:** `customElementModal` 表示中にTab循環。閉じた時に開いた要素にフォーカスを戻す

### 4-5. prefers-reduced-motion 対応
- **ファイル:** `css/style.css`
- **内容:** `@media (prefers-reduced-motion: reduce)` でアニメーション・トランジション無効化

### 4-6. コントラスト比改善
- **ファイル:** `css/style.css`, `index.html`
- **内容:** `text-gray-400` → `text-gray-500` 以上に、`text-[10px]` の使用箇所を `text-xs` に

---

## Phase 5: パフォーマンス・コード品質

### 5-1. renderElements / renderMarkers の共通化
- **ファイル:** `js/ui.js`
- **内容:** `flattenElements(json)` ヘルパーを作成し、両関数から呼び出す

### 5-2. escapeHtml を文字列置換ベースに変更
- **ファイル:** `js/ui.js` L1072-1077
- **内容:** `text.replace(/&/g, '&amp;').replace(/</g, '&lt;')...` に変更

### 5-3. cancelBtn の cloneNode 廃止
- **ファイル:** `js/ui.js` L973-978
- **内容:** `{ once: true }` または名前付き関数 + `removeEventListener` に変更

### 5-4. history.js の未使用変数 toSave 削除
- **ファイル:** `js/history.js` L130-133
- **内容:** `toSave` 変数を削除（デッドコード）

### 5-5. onerror ハンドラにErrorオブジェクト付与
- **ファイル:** `js/api.js` L269, L310, L314
- **内容:** `img.onerror = () => reject(new Error('...'))` に変更

### 5-6. ダウンロードファイル名の拡張子修正
- **ファイル:** `js/app.js` L271, `js/generate.js` L66
- **内容:** `mimeType` から拡張子を判定（`image/png` → `.png`）

### 5-7. API リトライ戦略追加
- **ファイル:** `js/api.js` callAPI
- **内容:** 429/5xxに対して最大3回、指数バックオフ（1s/2s/4s）でリトライ

### 5-8. computeJsonDiff の改善（IDベース配列比較）
- **ファイル:** `js/api.js` computeJsonDiff
- **内容:** 配列要素を `id` フィールドで紐付けて比較し、順序変更に耐える

### 5-9. document レベル touchmove リスナーの最適化
- **ファイル:** `js/ui.js` setupCompareSlider
- **内容:** ドラッグ開始時にのみ `document` にリスナーを追加、終了時に `removeEventListener`

---

## Phase 6: 長期的アーキテクチャ改善（次期イテレーション）

### 6-1. UI↔App 循環結合の解消
- `typeof App !== 'undefined'` パターンを廃止
- `UI.init(callbacks)` で依存性注入、またはカスタムイベントパターンに移行

### 6-2. selectedElements の Single Source of Truth 化
- `UI.selectedElements` を廃止、`App.state.selectedElements` のみに一本化
- UI側はAppからのコールバックで表示更新

### 6-3. TextToImage の EditHistory 直接操作を App に委譲
- 全履歴書き込みパスを App 経由に統一

### 6-4. Base64 メモリ管理の改善
- `URL.createObjectURL(blob)` への移行を検討
- 履歴エントリのフル画像保持を最新5件に制限

### 6-5. Tailwind CDN → ビルド済みCSS
- `npx tailwindcss -o css/tailwind.css --minify` でローカルCSS生成
- オフライン動作対応、初期ロード速度改善

### 6-6. CameraEditor のインスタンス化
- シングルトン → インスタンスベースに変更
- `new CameraEditor(container, cameraJson)` パターン

---

## 実行順序サマリー

| Phase | 内容 | 工数目安 | 優先度 |
|-------|------|----------|--------|
| **1** | 致命的バグ・セキュリティ（7件） | 小 | 最優先 |
| **2** | セキュリティ強化（5件） | 小〜中 | 高 |
| **3** | UX改善（6件） | 中 | 高 |
| **4** | レスポンシブ・a11y（6件） | 中 | 中 |
| **5** | パフォーマンス・品質（9件） | 中 | 中 |
| **6** | アーキテクチャ改善（6件） | 大 | 長期 |

> **Phase 1-2 を最初に実施**（セキュリティ・安定性）→ **Phase 3-4**（ユーザー体験）→ **Phase 5**（品質）→ **Phase 6**（将来性）
