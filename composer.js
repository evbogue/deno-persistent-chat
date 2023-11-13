import { h } from './lib/h.js'
import { ws } from './ws.js'
import { ed25519 } from './keys.js'
import { publish, open } from './sbog.js' 
import { find } from './blob.js'
import { box } from './sbox.js'

const pubkey = await ed25519.pubkey()

const search = h('input', {placeholder: 'Search'})

const searchButton = h('button', {onclick: () => {
  if (search.value.length === 44) {
    ws.send(search.value)
  }
}}, ['Search'])

const searchDiv = h('div', [
  search, 
  searchButton
])

const id = h('div', [pubkey])

const to = h('input', {placeholder: 'Pubkey', id: 'toinput'})

const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

const button = h('button', {
  onclick: async () => {
    if (to.value && to.value.length === 44 && textarea.value) {
      const boxed = await box(textarea.value, to.value)
      const signed = await publish(boxed)
      const opened = await open(signed)
      ws.send(JSON.stringify({
        type: 'post',
        payload: signed,
        boxed
      }))
      textarea.value = ''
    } else if (!to.value && textarea.value) {
      const signed = await publish(textarea.value)  
      const opened = await open(signed)
      const blob = await find(opened.data)
      ws.send(JSON.stringify({
        type: 'post',
        latest: true,
        payload: signed,
        blob
      }))
      textarea.value = ''
    } 
  }
}, ['Send'])

export const composer = h('div', [
  searchDiv,
  id,
  to,
  textarea,
  h('br'),
  button
])

