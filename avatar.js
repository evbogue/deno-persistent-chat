import { h } from './lib/h.js'

export const avatar = async (pubkey) => {
  const span = h('span', [
    h('a', {
      href: pubkey,
      onclick: (e) => {
        e.preventDefault()
        const toinput = document.getElementById('toinput')
        toinput.value = pubkey
      }
    }, [pubkey.substring(0, 7) + '...'])
  ])

  return span
}
