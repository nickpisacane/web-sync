import { spy } from 'sinon'
import { expect } from 'chai'

import AsyncEventEmitter from '../../src/AsyncEventEmitter'

describe('AsyncEventEmitter', () => {
  it('executes listeners one-by-one, in order', async () => {
    // paranoid testing
    const ee = new AsyncEventEmitter()
    const results = []
    const spies = [spy(), spy(), spy()]
    const one = () => new Promise<void>(r => {
      setTimeout(() => {
        expect(spies[1].called).to.equal(false)
        expect(spies[2].called).to.equal(false)

        spies[0]()
        results.push(1)
        r()
      }, 100)
    })
    const two = () => new Promise<void>(r => {
      setTimeout(() => {
        expect(spies[0].called).to.equal(true)
        expect(spies[2].called).to.equal(false)

        spies[1]()
        results.push(2)
        r()
      }, 100)
    })
    const three = () => new Promise<void>(r => {
      setTimeout(() => {
        expect(spies[0].called).to.equal(true)
        expect(spies[1].called).to.equal(true)

        spies[2]()
        results.push(3)
        r()
      }, 100)
    })

    ee.on('test', one)
    ee.on('test', two)
    ee.on('test', three)

    const start = Date.now()
    await ee.emit('test')
    const end = Date.now()

    expect(results).to.deep.equal([1, 2, 3])
    expect(end - start >= 300).to.equal(true)
  })

  it('removeListener()', async () => {
    const ee = new AsyncEventEmitter()
    const s = spy()
    ee.on('foo', s)
    await ee.emit('foo')
    ee.removeListener('foo', s)
    await ee.emit('foo')
    expect(s.callCount).to.equal(1)
  })

  it('once()', async () => {
    const ee = new AsyncEventEmitter()
    const s = spy()
    ee.once('foo', s)
    await ee.emit('foo')
    await ee.emit('foo')
    expect(s.callCount).to.equal(1)
  })

  it('removeAllListeners(event)', async () => {
    const ee = new AsyncEventEmitter()
    const s = spy()
    const s2 = spy()
    ee.on('foo', s)
    ee.on('bar', s2)
    await ee.emit('foo')
    await ee.emit('bar')
    ee.removeAllListeners('foo')
    await ee.emit('foo')
    await ee.emit('bar')
    expect(s.callCount).to.equal(1)
    expect(s2.callCount).to.equal(2)
  })

  it('removeAllListeners()', async () => {
    const ee = new AsyncEventEmitter()
    const s = spy()
    const s2 = spy()
    ee.on('foo', s)
    ee.on('bar', s2)
    await ee.emit('foo')
    await ee.emit('bar')
    ee.removeAllListeners()
    await ee.emit('foo')
    await ee.emit('bar')
    expect(s.callCount).to.equal(1)
    expect(s2.callCount).to.equal(1)
  })
})