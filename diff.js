const fs = require('fs')
const path = require('path')
const { createPatch } = require('diff')
const { Diff2Html } = require("diff2html")
const { highlight } = require('highlight.js')

const resolvePath = (...segments) => path.resolve(__dirname, ...segments)
const outDir = resolvePath('.diff')
fs.mkdirSync(outDir, { recursive: true })

const unescapeHtml = s => s
  .replace(/<\/?(ins|del)>/g, '')
  .replace(/&#x([0-9A-F]+);/g, (_, x) => String.fromCodePoint(parseInt(x, 16)))
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')

fs.readdirSync(resolvePath('src/codes'))
  .sort()
  .map(filename => resolvePath('src/codes', filename))
  .map(filepath => fs.promises.readFile(filepath, 'utf8').then(content => ({ filepath, content })))
  .map((file, i, files) => [files[i - 1] || Promise.resolve({ content: '' }), file])
  .forEach(async ([promiseBefore, promiseAfter]) => {
    const before = await promiseBefore
    const after = await promiseAfter
    const diff = createPatch(' ', before.content, after.content, undefined, undefined, { context: 1000 })
    const _html = Diff2Html.getPrettyHtml(diff)
    const html = _html.replace(/(<span class="d2h-code-line-ctn">)(.+?)(<\/span>)/g, (_, $1, $2, $3) => $1 + highlight('html', unescapeHtml($2)).value + $3)
    return fs.promises.writeFile(resolvePath(outDir, path.basename(after.filepath)), html, 'utf8')
  })
