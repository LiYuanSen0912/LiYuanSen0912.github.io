# Lys 的小宇宙

基于 [Hexo](https://hexo.io/) 的个人博客，使用自定义轻量主题，并通过 GitHub Actions 自动部署至 GitHub Pages。

## 写文章

在 `source/_posts/` 新建 Markdown 文件，填写文章的标题、日期、标签和分类即可。

## 本地预览

```bash
pnpm install
pnpm serve
```

## 部署

推送到 `main` 后，GitHub Actions 会生成并发布 `public/` 目录。首次发布前，请在仓库的 **Settings → Pages** 中将发布来源设为 **GitHub Actions**。
