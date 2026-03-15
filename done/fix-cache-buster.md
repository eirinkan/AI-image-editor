# 修正: キャッシュバスター追加

## 問題
`file://` でHTMLを開くとブラウザキャッシュにより古いJS（`gemini-2.0-flash-exp`）が読み込まれ、APIエラー404が発生する。

## 修正箇所
`/Users/shigetomieirin/dev/JSON画像変更/index.html` 225〜228行目

## 修正内容
```html
<!-- 現在 -->
<script src="js/api.js"></script>
<script src="js/history.js"></script>
<script src="js/ui.js"></script>
<script src="js/app.js"></script>

<!-- 修正後 -->
<script src="js/api.js?v=2"></script>
<script src="js/history.js?v=2"></script>
<script src="js/ui.js?v=2"></script>
<script src="js/app.js?v=2"></script>
```

## 注意
- 今後コード更新時は `?v=3`, `?v=4` と上げる

## 完了後
実装完了したらこのファイルを `updates/done/` に移動すること
