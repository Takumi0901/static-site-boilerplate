# static-site-boilerplate

## 始め方

```
$ npm i
$ npm run build
$ npm start
```

http://localhost:3000

## サイトマップについて

sitemap.xml を自動で生成できるが、現状 `https://example.com/` になっているので、

```gulpfile.js
gulp.task("sitemap", function() {
  return gulp
    .src("dist/**/*.html", {
      read: false
    })
    .pipe(
      sitemap({
        siteUrl: "https://example.com/" // ここを変更する
      })
    )
    .pipe(gulp.dest("./dist"));
});

```

## データについて

`src/data/pages.json` で title と description を定義していて各ページで読みこんでいる。

### 手順

1. data に新しいページの情報を入力
2. name の部分を変更する。

```
{
  "pages": {
    "top": {
      "title": "タイトル",
      "description": "デスクリプション"
    },
    "about": {
      "title": "タイトル",
      "description": "デスクリプション"
    }
  }
}

```

```
<%- include('common/_head', {rel_path:'./', name: 'about'}) %>
```
