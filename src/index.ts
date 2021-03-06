// export const _ = Symbol.for('placeholder');
class Placeholder {
  constructor(public type: NumberConstructor | StringConstructor) {}
}

export function _(type: NumberConstructor | StringConstructor) {
  return new Placeholder(type);
}

export function match(
  matcher: Generator<any, any, boolean>
) {
  function matches(a: any, b: any): boolean {
    if (a == null || b == null) {
      return (a === b);
    }
    
    if (b === _) {
      return true;
    } else if (b instanceof Placeholder) {
      return Object(a) instanceof b.type;
    }
    
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false;
      if (a.length !== b.length) return false;
      
      return a.every((value, index) => matches(value, b[index]));
    }
    
    if (typeof a === 'object') {
      if (Object.getPrototypeOf(b) === Object.prototype) {
        return Object.keys(b).every(key => key in a && matches(a[key], b[key]));
      }
      
      if (a instanceof Error && b instanceof Error) {
        return a.message === b.message;
      }
      
      if (a instanceof URL && b instanceof URL) {
        return a.href === b.href;
      }
      
      return false;
    }
    
    if (b instanceof RegExp && typeof a === 'string') {
      return b.test(a);
    }
    
    if (typeof a === typeof b) {
      return Object.is(a, b);
    }
    
    return false;
  }
  
  const iterator = matcher[Symbol.iterator]();
  const { value } = iterator.next();
  let yielded: boolean = true;
  
  while (true) {
    const item = iterator.next(yielded);
    yielded = matches(value, item.value);
    
    if (item.done) {
      return item.value;
    }
  }
}
