# AI マーカーエディタ

写真をAIが自動分析し、要素を選んで日本語で指示するだけで画像を再生成するWebアプリ。

**公開URL:** https://ai-marker-editor.vercel.app

## 使い方

### 基本フロー: 選ぶ → 書く → 生成

1. **画像をアップロード** — ドラッグ&ドロップまたはクリックで選択
2. **AIが自動分析** — Gemini APIが画像の構成要素（背景・人物・商品など）をJSON形式で抽出
3. **要素を選んで指示** — 変更したい要素をクリックし、「もっと明るく」「服を赤に」など日本語で入力
4. **画像を生成** — AIがJSON差分を元に画像を再生成

### Text-to-Image モード

テキストから画像を新規生成するモード。プロンプトをAIが自動構築し、レビュー後に生成。

## 機能一覧

- **要素ベースの画像編集** — 分析された要素（背景・人物・商品・オブジェクト等）を個別に選択して変更指示
- **複数枚同時生成** — 1〜8枚を同時生成し、好みの1枚を採用
- **参照画像** — 生成時に参考にしたい画像を追加で指定可能
- **編集履歴** — タイムライン形式で全編集を記録。任意の時点に戻れる
- **Before/After比較** — 履歴の任意の時点をBefore画像として指定し、生成結果と並べて比較
- **プロジェクト保存** — IndexedDBに保存。エクスポート/インポート対応
- **セッション自動保存** — ブラウザを閉じても作業状態を復元
- **ダークモード** — システム設定連動またはヘッダーから手動切り替え
- **画像ダウンロード** — 生成結果を個別にダウンロード

## 技術スタック

- **フロントエンド:** Vanilla JavaScript（フレームワーク不使用）
- **スタイリング:** Tailwind CSS（CDN）+ カスタムCSS
- **フォント:** Noto Sans JP（Google Fonts）
- **AI API:** Google Gemini API
  - 分析・JSON更新: `gemini-2.5-pro` / `gemini-3.1-pro-preview`
  - 画像生成: `gemini-3.1-flash-image-preview` / `gemini-3-pro-image-preview`
- **ストレージ:** IndexedDB（ブラウザ内蔵）
- **デプロイ:** Vercel（静的サイト）

## フォルダ構成

```
AIマーカーエディタ/
├── index.html           # メインHTML（UIの全定義）
├── css/
│   └── style.css        # スタイル定義
├── js/
│   ├── app.js           # アプリ全体の状態管理・メイン制御
│   ├── api.js           # Gemini API呼び出し（分析・JSON更新・画像生成）
│   ├── ui.js            # UI描画・インタラクション
│   ├── generate.js      # Text-to-Imageモード
│   ├── storage.js       # IndexedDBによるプロジェクト保存・セッション管理
│   ├── history.js       # 編集履歴管理
│   └── camera-editor.js # カメラエディタ（現在無効化中）
└── ogp.png              # OGP画像
```

## セットアップ

ビルド不要・サーバー不要。`index.html` をブラウザで開くだけで動作。

1. リポジトリをクローン
2. `index.html` をブラウザで開く（または `python -m http.server 8080` 等でローカルサーバー起動）
3. 画面右上の ⚙ 設定アイコンから **Gemini APIキー** を登録

**Gemini APIキーの取得:** https://aistudio.google.com/app/apikey

## デプロイ

Vercel にデプロイ済み（静的ファイルのみ、サーバーサイド処理なし）。

```bash
npx vercel --prod
```
