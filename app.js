import { h } from './lib/h.js'
import { composer }  from './composer.js'
import { ws } from './ws.js'
import { process } from './process.js'
 
ws.onmessage = async e => {
  const msg = await process(e.data, scroller) 
}

const screen = h('div')
document.body.appendChild(screen)

screen.appendChild(composer)

const scroller = h('div')
document.body.appendChild(scroller)
