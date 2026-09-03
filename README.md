# Cary-Yale Tarot

Cary-Yale Tarot独自構成の89枚から、過去・現在・未来の3枚を引く完全静的Webアプリです。

HTML・CSS・Vanilla JavaScriptだけで動作します。外部サーバー、データベース、Node.js、npm、APIキーは必要ありません。

## Features

- 89枚（Major Arcana 25枚＋Minor Arcana 64枚）から重複なしで3枚抽選
- 各カードの正位置／逆位置を独立して50%で決定
- 過去・現在・未来を自由な順番で開けるカードフリップ
- 3枚を開いた後のリーディング一覧
- 同じ結果を整形済みテキストとして表示し、ボタンでコピー
- ページを再読み込みしない再抽選
- 画像未配置時のカード名入りプレースホルダー
- PC・タブレット・スマートフォン対応
- タッチ・Enter・Space操作、読み上げ用ラベル、動きを減らす設定に対応

## Folder Structure

```text
/
├─ index.html
├─ README.md
├─ css/
│  └─ style.css
├─ js/
│  ├─ cards.js
│  └─ app.js
└─ assets/
   └─ cards/
      ├─ card-back.webp
      ├─ major/
      ├─ wands/
      ├─ cups/
      ├─ swords/
      └─ coins/
```

## Adding Card Images

画像は1200×1800px、縦横比2:3のWebPを推奨します。画像がなくてもアプリは動作し、カード名入りのプレースホルダーが表示されます。

### Major Arcana

`assets/cards/major/` に次の形式で配置します。

```text
00-fool.webp
01-magician.webp
02-high-priestess.webp
...
21-world.webp
22-faith.webp
23-hope.webp
24-charity.webp
```

### Minor Arcana

各スートのフォルダへ、以下のファイル名で配置します。

```text
ace.webp
two.webp
three.webp
four.webp
five.webp
six.webp
seven.webp
eight.webp
nine.webp
ten.webp
page.webp
maid.webp
knight.webp
female-knight.webp
queen.webp
king.webp
```

対象フォルダは次の4つです。

```text
assets/cards/wands/
assets/cards/cups/
assets/cards/swords/
assets/cards/coins/
```

共通の裏面画像は `assets/cards/card-back.webp` に配置します。画像形式やファイル名を変える場合は、`js/cards.js` の `image` と、裏面のみ `js/app.js` のパスを変更してください。

## Editing Card Meanings

カード名・画像パス・正位置／逆位置の意味は、すべて `js/cards.js` にあります。

各定義の末尾2項目が正位置と逆位置です。

```js
[3, "three", "THREE", "正位置の意味", "逆位置の意味"]
```

Major Arcana、WANDS、CUPS、SWORDS、COINSの各ブロックを直接編集してください。アプリ本体の `js/app.js` を変える必要はありません。

## Local Use

`index.html` をブラウザで開くだけで動作します。

## GitHub Pages Deployment

1. GitHubで新しいリポジトリを作成します。
2. このフォルダの `index.html`、`css`、`js`、`assets`、`README.md` をリポジトリ直下へアップロードします。
3. リポジトリの **Settings** を開き、**Pages** の公開設定へ進みます。
4. 公開元に **Deploy from a branch** を選びます。
5. Branchを `main`、Folderを `/root` にして保存します。
6. 表示された公開URLへアクセスします。

すべて相対パスで参照しているため、`https://USERNAME.github.io/REPOSITORY/` のようなサブディレクトリURLでも動作します。

## Privacy

ログイン、Cookie、Analytics、個人データ保存はありません。カード抽選はブラウザ内だけで行われます。
