import { serveDir } from 'https://deno.land/std/http/file_server.ts'
import { open } from 'https://raw.githubusercontent.com/evbogue/deno-secure-chat/master/sbog.js'

const sockets = new Set()
const channel = new BroadcastChannel("")

const kv = await Deno.openKv()

channel.onmessage = async e => {
  (e.target != channel) && channel.postMessage(e.data)
  if (e.data.length > 44) {
    const msg = JSON.parse(e.data)
    console.log(msg)
    const opened = await open(msg.payload)
    kv.set([opened.hash], opened.raw)
    if (msg.blob) {
      kv.set([opened.data], msg.blob)
      opened.text = msg.blob
    }
    if (msg.boxed) {
      kv.set([opened.data], msg.boxed)
    }
    if (msg.latest) {
      kv.set([opened.author], opened.raw)
    }
    sockets.forEach(s => s.send(e.data))
  } 
  if (e.data.length === 44) {
    console.log(e.data)
    const msg = await kv.get([e.data])
    const opened = await open(msg.value)
    console.log(msg.value)
    const blob = await kv.get([opened.data])
    console.log(blob)
    
    const tosend = {
      type: 'post',
      payload: msg.value,
      blob: blob.value
    }
    console.log(tosend)
    sockets.forEach(s => s.send(JSON.stringify(tosend)))
  }
}

Deno.serve((r) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    sockets.add(socket)
    socket.onmessage = channel.onmessage
    socket.onclose = _ => sockets.delete(socket)
    return response
  } catch {
    return serveDir(r)
  }
})