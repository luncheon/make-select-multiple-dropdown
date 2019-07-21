
import Reveal from 'reveal.js'
import 'reveal.js/css/reveal.css'
import './theme.scss'

import 'highlight.js/styles/github.css'
import 'diff2html/dist/diff2html.min.css'

import './typeface.css'
import './styles.css'

function onSlideShown(event) {
  var code = event.currentSlide.getElementsByClassName('code')[0]
  var firstChangedCell = code && code.querySelector('td.d2h-del,td.d2h-ins')
  var firstChangedRow = firstChangedCell && firstChangedCell.parentElement
  if (!firstChangedRow || firstChangedRow.rowIndex < 12) {
    return
  }
  for (
    var row = firstChangedRow.previousElementSibling;
    row && !row.querySelector('.hljs-selector-attr,.hljs-tag');
    row = row.previousElementSibling
  );
  row && row.previousElementSibling && row.previousElementSibling.scrollIntoView()
}

Reveal.addEventListener('ready', onSlideShown)
Reveal.addEventListener('slidechanged', onSlideShown)
Reveal.initialize({ hash: true })
