import { cn } from '../utils'

describe('cn utility', () => {
  it('combina clases correctamente', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('filtra valores falsy', () => {
    const result = cn('class1', false, 'class2', null, 'class3', undefined)
    expect(result).toBe('class1 class2 class3')
  })

  it('maneja strings vacíos', () => {
    const result = cn('', 'class1', '', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('retorna string vacío para inputs vacíos', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('maneja solo valores falsy', () => {
    const result = cn(false, null, undefined, '')
    expect(result).toBe('')
  })

  it('maneja mezcla de valores válidos y falsy', () => {
    const result = cn('class1', false, 'class2', null, 'class3', undefined)
    expect(result).toBe('class1 class2 class3')
  })

  it('maneja espacios en blanco', () => {
    const result = cn('class1', '  class2  ', 'class3')
    expect(result).toBe('class1   class2   class3')
  })
}) 