(() => {
  // sketch/curcularArray.ts
  var CircularArray = class {
    constructor(size = 100) {
      this.size = size;
    }
    arr = [];
    lengths = [];
    pixelLength = 0;
    length() {
      return this.arr.length;
    }
    push(el) {
      if (this.arr.length > 1) {
        let nextSize = this.arr[this.arr.length - 1].distanceTo(el);
        this.pixelLength += nextSize;
        while (this.pixelLength > this.size) {
          this.pixelLength -= this.arr[0].distanceTo(this.arr[1]);
          this.arr.shift();
          this.lengths.shift();
        }
        this.lengths.push(nextSize);
      }
      this.arr.push(el);
    }
    pop() {
      this.arr.shift();
    }
    *[Symbol.iterator]() {
      let acc = 0;
      for (let i3 = 0; i3 < this.arr.length; i3++) {
        acc += this.lengths[i3];
        yield { point: this.arr[i3], fraction: acc / this.size };
      }
    }
  };

  // sketch/gradient.ts
  function parseGradient(input) {
    const terms = [];
    let acc = "";
    for (let i3 = 0; i3 < input.length; i3++) {
      let char = input[i3];
      if (char === ",") {
        terms.push(acc.trim());
        acc = "";
        i3++;
      }
      if (char === "(") {
        let notFoundCount = 0;
        while (input[i3] !== ")") {
          acc += input[i3];
          i3++;
          if (notFoundCount++ > 5e3) {
            throw new Error("incorect gradient");
          }
        }
      }
      acc += input[i3];
    }
    terms.push(acc.trim());
    return terms.map((t3) => {
      const res = /rgba\((\d+),(\d+),(\d+),([+-]?([0-9]*[.])?[0-9]+)\) +([+-]?([0-9]*[.])?[0-9]+)%/.exec(t3);
      if (!res) {
        return void 0;
      }
      return {
        color: [Number(res[1]), Number(res[2]), Number(res[3]), Number(res[4])],
        ratio: Number(res[6]) / 100
      };
    }).filter((x) => x);
  }
  function lerpColor(a3, b3, ratio) {
    return [lerp(a3[0], b3[0], ratio), lerp(a3[1], b3[1], ratio), lerp(a3[2], b3[2], ratio), lerp(a3[3], b3[3], ratio)];
  }
  function gradientColorAt(gradient, ration) {
    let from;
    let to;
    for (let i3 = 0; i3 < gradient.length; i3++) {
      if (ration < gradient[i3].ratio) {
        from = gradient[i3 - 1];
        to = gradient[i3];
        break;
      }
    }
    if (!from) {
      from = gradient[gradient.length - 2];
      to = gradient[gradient.length - 1];
    }
    const interpolateVal = (ration - from.ratio) / (to.ratio - from.ratio);
    return lerpColor(from.color, to.color, interpolateVal);
  }
  function updateColorAnimation(animation, dt) {
    const gradientA = animation.gradients[animation.currentIndex];
    animation.time += dt;
    if (animation.time >= gradientA.time) {
      animation.time = 0;
      animation.currentIndex = (animation.currentIndex + 1) % animation.gradients.length;
    }
  }
  function animationColorAt(animation, ration) {
    const gradientA = animation.gradients[animation.currentIndex];
    const gradientB = animation.gradients[(animation.currentIndex + 1) % animation.gradients.length];
    const colorA = gradientColorAt(gradientA.gradient, ration);
    const colorB = gradientColorAt(gradientB.gradient, ration);
    return lerpColor(colorA, colorB, animation.time / gradientA.time);
  }

  // sketch/vector.ts
  var Vector = class {
    x;
    y;
    constructor(x = 0, y2 = 0) {
      this.x = x;
      this.y = y2;
    }
    add(b3) {
      return new Vector(this.x + b3.x, this.y + b3.y);
    }
    subtract(b3) {
      return new Vector(this.x - b3.x, this.y - b3.y);
    }
    multiply(b3) {
      if (b3 instanceof Vector)
        return new Vector(this.x * b3.x, this.y * b3.y);
      else
        return new Vector(this.x * b3, this.y * b3);
    }
    divide(b3) {
      if (b3 instanceof Vector)
        return new Vector(this.x / b3.x, this.y / b3.y);
      else
        return new Vector(this.x / b3, this.y / b3);
    }
    equals(v3) {
      return this.x == v3.x && this.y == v3.y;
    }
    dot(v3) {
      return this.x * v3.x + this.y * v3.y;
    }
    cross(v3) {
      return this.x * v3.y - this.y * v3.x;
    }
    length() {
      return Math.sqrt(this.dot(this));
    }
    normalize() {
      return Vector.fromAngle(this.toAngles());
    }
    toAngles() {
      return -Math.atan2(-this.y, this.x);
    }
    angleTo(a3) {
      return Math.acos(this.dot(a3) / (this.length() * a3.length()));
    }
    clone() {
      return new Vector(this.x, this.y);
    }
    limit(length) {
      if (this.length() > length) {
        return this.normalize().multiply(length);
      } else {
        return this;
      }
    }
    distanceTo(a3) {
      return Math.hypot(this.x - a3.x, this.y - a3.y);
    }
    static negative(a3) {
      return new Vector(-a3.x, -a3.y);
    }
    static add(a3, b3) {
      if (b3 instanceof Vector)
        return new Vector(a3.x + b3.x, a3.y + b3.y);
      else
        return new Vector(a3.x + b3, a3.y + b3);
    }
    static subtract(a3, b3) {
      if (b3 instanceof Vector)
        return new Vector(a3.x - b3.x, a3.y - b3.y);
      else
        return new Vector(a3.x - b3, a3.y - b3);
    }
    static multiply(a3, b3) {
      if (b3 instanceof Vector)
        return new Vector(a3.x * b3.x, a3.y * b3.y);
      else
        return new Vector(a3.x * b3, a3.y * b3);
    }
    static divide(a3, b3) {
      if (b3 instanceof Vector)
        return new Vector(a3.x / b3.x, a3.y / b3.y);
      else
        return new Vector(a3.x / b3, a3.y / b3);
    }
    static equals(a3, b3) {
      return a3.x == b3.x && a3.y == b3.y;
    }
    static dot(a3, b3) {
      return a3.x * b3.x + a3.y * b3.y;
    }
    static cross(a3, b3) {
      return a3.x * b3.y - a3.y * b3.x;
    }
    static fromAngle(radians) {
      return new Vector(Math.cos(radians), Math.sin(radians));
    }
  };

  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var i;
  var t;
  var o;
  var r;
  var f = {};
  var e = [];
  var c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function s(n2, l3) {
    for (var u3 in l3)
      n2[u3] = l3[u3];
    return n2;
  }
  function a(n2) {
    var l3 = n2.parentNode;
    l3 && l3.removeChild(n2);
  }
  function h(l3, u3, i3) {
    var t3, o3, r3, f3 = {};
    for (r3 in u3)
      r3 == "key" ? t3 = u3[r3] : r3 == "ref" ? o3 = u3[r3] : f3[r3] = u3[r3];
    if (arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : i3), typeof l3 == "function" && l3.defaultProps != null)
      for (r3 in l3.defaultProps)
        f3[r3] === void 0 && (f3[r3] = l3.defaultProps[r3]);
    return v(l3, f3, t3, o3, null);
  }
  function v(n2, i3, t3, o3, r3) {
    var f3 = { type: n2, props: i3, key: t3, ref: o3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: r3 == null ? ++u : r3 };
    return r3 == null && l.vnode != null && l.vnode(f3), f3;
  }
  function p(n2) {
    return n2.children;
  }
  function d(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function _(n2, l3) {
    if (l3 == null)
      return n2.__ ? _(n2.__, n2.__.__k.indexOf(n2) + 1) : null;
    for (var u3; l3 < n2.__k.length; l3++)
      if ((u3 = n2.__k[l3]) != null && u3.__e != null)
        return u3.__e;
    return typeof n2.type == "function" ? _(n2) : null;
  }
  function k(n2) {
    var l3, u3;
    if ((n2 = n2.__) != null && n2.__c != null) {
      for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
        if ((u3 = n2.__k[l3]) != null && u3.__e != null) {
          n2.__e = n2.__c.base = u3.__e;
          break;
        }
      return k(n2);
    }
  }
  function b(n2) {
    (!n2.__d && (n2.__d = true) && t.push(n2) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || setTimeout)(g);
  }
  function g() {
    for (var n2; g.__r = t.length; )
      n2 = t.sort(function(n3, l3) {
        return n3.__v.__b - l3.__v.__b;
      }), t = [], n2.some(function(n3) {
        var l3, u3, i3, t3, o3, r3;
        n3.__d && (o3 = (t3 = (l3 = n3).__v).__e, (r3 = l3.__P) && (u3 = [], (i3 = s({}, t3)).__v = t3.__v + 1, j(r3, t3, i3, l3.__n, r3.ownerSVGElement !== void 0, t3.__h != null ? [o3] : null, u3, o3 == null ? _(t3) : o3, t3.__h), z(u3, t3), t3.__e != o3 && k(t3)));
      });
  }
  function w(n2, l3, u3, i3, t3, o3, r3, c3, s2, a3) {
    var h2, y2, d3, k3, b3, g3, w3, x = i3 && i3.__k || e, C2 = x.length;
    for (u3.__k = [], h2 = 0; h2 < l3.length; h2++)
      if ((k3 = u3.__k[h2] = (k3 = l3[h2]) == null || typeof k3 == "boolean" ? null : typeof k3 == "string" || typeof k3 == "number" || typeof k3 == "bigint" ? v(null, k3, null, null, k3) : Array.isArray(k3) ? v(p, { children: k3 }, null, null, null) : k3.__b > 0 ? v(k3.type, k3.props, k3.key, k3.ref ? k3.ref : null, k3.__v) : k3) != null) {
        if (k3.__ = u3, k3.__b = u3.__b + 1, (d3 = x[h2]) === null || d3 && k3.key == d3.key && k3.type === d3.type)
          x[h2] = void 0;
        else
          for (y2 = 0; y2 < C2; y2++) {
            if ((d3 = x[y2]) && k3.key == d3.key && k3.type === d3.type) {
              x[y2] = void 0;
              break;
            }
            d3 = null;
          }
        j(n2, k3, d3 = d3 || f, t3, o3, r3, c3, s2, a3), b3 = k3.__e, (y2 = k3.ref) && d3.ref != y2 && (w3 || (w3 = []), d3.ref && w3.push(d3.ref, null, k3), w3.push(y2, k3.__c || b3, k3)), b3 != null ? (g3 == null && (g3 = b3), typeof k3.type == "function" && k3.__k === d3.__k ? k3.__d = s2 = m(k3, s2, n2) : s2 = A(n2, k3, d3, x, b3, s2), typeof u3.type == "function" && (u3.__d = s2)) : s2 && d3.__e == s2 && s2.parentNode != n2 && (s2 = _(d3));
      }
    for (u3.__e = g3, h2 = C2; h2--; )
      x[h2] != null && N(x[h2], x[h2]);
    if (w3)
      for (h2 = 0; h2 < w3.length; h2++)
        M(w3[h2], w3[++h2], w3[++h2]);
  }
  function m(n2, l3, u3) {
    for (var i3, t3 = n2.__k, o3 = 0; t3 && o3 < t3.length; o3++)
      (i3 = t3[o3]) && (i3.__ = n2, l3 = typeof i3.type == "function" ? m(i3, l3, u3) : A(u3, i3, i3, t3, i3.__e, l3));
    return l3;
  }
  function A(n2, l3, u3, i3, t3, o3) {
    var r3, f3, e3;
    if (l3.__d !== void 0)
      r3 = l3.__d, l3.__d = void 0;
    else if (u3 == null || t3 != o3 || t3.parentNode == null)
      n:
        if (o3 == null || o3.parentNode !== n2)
          n2.appendChild(t3), r3 = null;
        else {
          for (f3 = o3, e3 = 0; (f3 = f3.nextSibling) && e3 < i3.length; e3 += 2)
            if (f3 == t3)
              break n;
          n2.insertBefore(t3, o3), r3 = o3;
        }
    return r3 !== void 0 ? r3 : t3.nextSibling;
  }
  function C(n2, l3, u3, i3, t3) {
    var o3;
    for (o3 in u3)
      o3 === "children" || o3 === "key" || o3 in l3 || H(n2, o3, null, u3[o3], i3);
    for (o3 in l3)
      t3 && typeof l3[o3] != "function" || o3 === "children" || o3 === "key" || o3 === "value" || o3 === "checked" || u3[o3] === l3[o3] || H(n2, o3, l3[o3], u3[o3], i3);
  }
  function $(n2, l3, u3) {
    l3[0] === "-" ? n2.setProperty(l3, u3) : n2[l3] = u3 == null ? "" : typeof u3 != "number" || c.test(l3) ? u3 : u3 + "px";
  }
  function H(n2, l3, u3, i3, t3) {
    var o3;
    n:
      if (l3 === "style")
        if (typeof u3 == "string")
          n2.style.cssText = u3;
        else {
          if (typeof i3 == "string" && (n2.style.cssText = i3 = ""), i3)
            for (l3 in i3)
              u3 && l3 in u3 || $(n2.style, l3, "");
          if (u3)
            for (l3 in u3)
              i3 && u3[l3] === i3[l3] || $(n2.style, l3, u3[l3]);
        }
      else if (l3[0] === "o" && l3[1] === "n")
        o3 = l3 !== (l3 = l3.replace(/Capture$/, "")), l3 = l3.toLowerCase() in n2 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u3, u3 ? i3 || n2.addEventListener(l3, o3 ? T : I, o3) : n2.removeEventListener(l3, o3 ? T : I, o3);
      else if (l3 !== "dangerouslySetInnerHTML") {
        if (t3)
          l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if (l3 !== "href" && l3 !== "list" && l3 !== "form" && l3 !== "tabIndex" && l3 !== "download" && l3 in n2)
          try {
            n2[l3] = u3 == null ? "" : u3;
            break n;
          } catch (n3) {
          }
        typeof u3 == "function" || (u3 == null || u3 === false && l3.indexOf("-") == -1 ? n2.removeAttribute(l3) : n2.setAttribute(l3, u3));
      }
  }
  function I(n2) {
    this.l[n2.type + false](l.event ? l.event(n2) : n2);
  }
  function T(n2) {
    this.l[n2.type + true](l.event ? l.event(n2) : n2);
  }
  function j(n2, u3, i3, t3, o3, r3, f3, e3, c3) {
    var a3, h2, v3, y2, _2, k3, b3, g3, m3, x, A2, C2, $2, H2, I2, T2 = u3.type;
    if (u3.constructor !== void 0)
      return null;
    i3.__h != null && (c3 = i3.__h, e3 = u3.__e = i3.__e, u3.__h = null, r3 = [e3]), (a3 = l.__b) && a3(u3);
    try {
      n:
        if (typeof T2 == "function") {
          if (g3 = u3.props, m3 = (a3 = T2.contextType) && t3[a3.__c], x = a3 ? m3 ? m3.props.value : a3.__ : t3, i3.__c ? b3 = (h2 = u3.__c = i3.__c).__ = h2.__E : ("prototype" in T2 && T2.prototype.render ? u3.__c = h2 = new T2(g3, x) : (u3.__c = h2 = new d(g3, x), h2.constructor = T2, h2.render = O), m3 && m3.sub(h2), h2.props = g3, h2.state || (h2.state = {}), h2.context = x, h2.__n = t3, v3 = h2.__d = true, h2.__h = [], h2._sb = []), h2.__s == null && (h2.__s = h2.state), T2.getDerivedStateFromProps != null && (h2.__s == h2.state && (h2.__s = s({}, h2.__s)), s(h2.__s, T2.getDerivedStateFromProps(g3, h2.__s))), y2 = h2.props, _2 = h2.state, v3)
            T2.getDerivedStateFromProps == null && h2.componentWillMount != null && h2.componentWillMount(), h2.componentDidMount != null && h2.__h.push(h2.componentDidMount);
          else {
            if (T2.getDerivedStateFromProps == null && g3 !== y2 && h2.componentWillReceiveProps != null && h2.componentWillReceiveProps(g3, x), !h2.__e && h2.shouldComponentUpdate != null && h2.shouldComponentUpdate(g3, h2.__s, x) === false || u3.__v === i3.__v) {
              for (h2.props = g3, h2.state = h2.__s, u3.__v !== i3.__v && (h2.__d = false), h2.__v = u3, u3.__e = i3.__e, u3.__k = i3.__k, u3.__k.forEach(function(n3) {
                n3 && (n3.__ = u3);
              }), A2 = 0; A2 < h2._sb.length; A2++)
                h2.__h.push(h2._sb[A2]);
              h2._sb = [], h2.__h.length && f3.push(h2);
              break n;
            }
            h2.componentWillUpdate != null && h2.componentWillUpdate(g3, h2.__s, x), h2.componentDidUpdate != null && h2.__h.push(function() {
              h2.componentDidUpdate(y2, _2, k3);
            });
          }
          if (h2.context = x, h2.props = g3, h2.__v = u3, h2.__P = n2, C2 = l.__r, $2 = 0, "prototype" in T2 && T2.prototype.render) {
            for (h2.state = h2.__s, h2.__d = false, C2 && C2(u3), a3 = h2.render(h2.props, h2.state, h2.context), H2 = 0; H2 < h2._sb.length; H2++)
              h2.__h.push(h2._sb[H2]);
            h2._sb = [];
          } else
            do {
              h2.__d = false, C2 && C2(u3), a3 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
            } while (h2.__d && ++$2 < 25);
          h2.state = h2.__s, h2.getChildContext != null && (t3 = s(s({}, t3), h2.getChildContext())), v3 || h2.getSnapshotBeforeUpdate == null || (k3 = h2.getSnapshotBeforeUpdate(y2, _2)), I2 = a3 != null && a3.type === p && a3.key == null ? a3.props.children : a3, w(n2, Array.isArray(I2) ? I2 : [I2], u3, i3, t3, o3, r3, f3, e3, c3), h2.base = u3.__e, u3.__h = null, h2.__h.length && f3.push(h2), b3 && (h2.__E = h2.__ = null), h2.__e = false;
        } else
          r3 == null && u3.__v === i3.__v ? (u3.__k = i3.__k, u3.__e = i3.__e) : u3.__e = L(i3.__e, u3, i3, t3, o3, r3, f3, c3);
      (a3 = l.diffed) && a3(u3);
    } catch (n3) {
      u3.__v = null, (c3 || r3 != null) && (u3.__e = e3, u3.__h = !!c3, r3[r3.indexOf(e3)] = null), l.__e(n3, u3, i3);
    }
  }
  function z(n2, u3) {
    l.__c && l.__c(u3, n2), n2.some(function(u4) {
      try {
        n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
          n3.call(u4);
        });
      } catch (n3) {
        l.__e(n3, u4.__v);
      }
    });
  }
  function L(l3, u3, i3, t3, o3, r3, e3, c3) {
    var s2, h2, v3, y2 = i3.props, p3 = u3.props, d3 = u3.type, k3 = 0;
    if (d3 === "svg" && (o3 = true), r3 != null) {
      for (; k3 < r3.length; k3++)
        if ((s2 = r3[k3]) && "setAttribute" in s2 == !!d3 && (d3 ? s2.localName === d3 : s2.nodeType === 3)) {
          l3 = s2, r3[k3] = null;
          break;
        }
    }
    if (l3 == null) {
      if (d3 === null)
        return document.createTextNode(p3);
      l3 = o3 ? document.createElementNS("http://www.w3.org/2000/svg", d3) : document.createElement(d3, p3.is && p3), r3 = null, c3 = false;
    }
    if (d3 === null)
      y2 === p3 || c3 && l3.data === p3 || (l3.data = p3);
    else {
      if (r3 = r3 && n.call(l3.childNodes), h2 = (y2 = i3.props || f).dangerouslySetInnerHTML, v3 = p3.dangerouslySetInnerHTML, !c3) {
        if (r3 != null)
          for (y2 = {}, k3 = 0; k3 < l3.attributes.length; k3++)
            y2[l3.attributes[k3].name] = l3.attributes[k3].value;
        (v3 || h2) && (v3 && (h2 && v3.__html == h2.__html || v3.__html === l3.innerHTML) || (l3.innerHTML = v3 && v3.__html || ""));
      }
      if (C(l3, p3, y2, o3, c3), v3)
        u3.__k = [];
      else if (k3 = u3.props.children, w(l3, Array.isArray(k3) ? k3 : [k3], u3, i3, t3, o3 && d3 !== "foreignObject", r3, e3, r3 ? r3[0] : i3.__k && _(i3, 0), c3), r3 != null)
        for (k3 = r3.length; k3--; )
          r3[k3] != null && a(r3[k3]);
      c3 || ("value" in p3 && (k3 = p3.value) !== void 0 && (k3 !== l3.value || d3 === "progress" && !k3 || d3 === "option" && k3 !== y2.value) && H(l3, "value", k3, y2.value, false), "checked" in p3 && (k3 = p3.checked) !== void 0 && k3 !== l3.checked && H(l3, "checked", k3, y2.checked, false));
    }
    return l3;
  }
  function M(n2, u3, i3) {
    try {
      typeof n2 == "function" ? n2(u3) : n2.current = u3;
    } catch (n3) {
      l.__e(n3, i3);
    }
  }
  function N(n2, u3, i3) {
    var t3, o3;
    if (l.unmount && l.unmount(n2), (t3 = n2.ref) && (t3.current && t3.current !== n2.__e || M(t3, null, u3)), (t3 = n2.__c) != null) {
      if (t3.componentWillUnmount)
        try {
          t3.componentWillUnmount();
        } catch (n3) {
          l.__e(n3, u3);
        }
      t3.base = t3.__P = null, n2.__c = void 0;
    }
    if (t3 = n2.__k)
      for (o3 = 0; o3 < t3.length; o3++)
        t3[o3] && N(t3[o3], u3, i3 || typeof n2.type != "function");
    i3 || n2.__e == null || a(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
  }
  function O(n2, l3, u3) {
    return this.constructor(n2, u3);
  }
  function P(u3, i3, t3) {
    var o3, r3, e3;
    l.__ && l.__(u3, i3), r3 = (o3 = typeof t3 == "function") ? null : t3 && t3.__k || i3.__k, e3 = [], j(i3, u3 = (!o3 && t3 || i3).__k = h(p, null, [u3]), r3 || f, f, i3.ownerSVGElement !== void 0, !o3 && t3 ? [t3] : r3 ? null : i3.firstChild ? n.call(i3.childNodes) : null, e3, !o3 && t3 ? t3 : r3 ? r3.__e : i3.firstChild, o3), z(e3, u3);
  }
  n = e.slice, l = { __e: function(n2, l3, u3, i3) {
    for (var t3, o3, r3; l3 = l3.__; )
      if ((t3 = l3.__c) && !t3.__)
        try {
          if ((o3 = t3.constructor) && o3.getDerivedStateFromError != null && (t3.setState(o3.getDerivedStateFromError(n2)), r3 = t3.__d), t3.componentDidCatch != null && (t3.componentDidCatch(n2, i3 || {}), r3 = t3.__d), r3)
            return t3.__E = t3;
        } catch (l4) {
          n2 = l4;
        }
    throw n2;
  } }, u = 0, i = function(n2) {
    return n2 != null && n2.constructor === void 0;
  }, d.prototype.setState = function(n2, l3) {
    var u3;
    u3 = this.__s != null && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), typeof n2 == "function" && (n2 = n2(s({}, u3), this.props)), n2 && s(u3, n2), n2 != null && this.__v && (l3 && this._sb.push(l3), b(this));
  }, d.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), b(this));
  }, d.prototype.render = p, t = [], g.__r = 0, r = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = [];
  var e2 = l.__b;
  var a2 = l.__r;
  var v2 = l.diffed;
  var l2 = l.__c;
  var m2 = l.unmount;
  function d2(t3, u3) {
    l.__h && l.__h(r2, t3, o2 || u3), o2 = 0;
    var i3 = r2.__H || (r2.__H = { __: [], __h: [] });
    return t3 >= i3.__.length && i3.__.push({ __V: c2 }), i3.__[t3];
  }
  function p2(n2) {
    return o2 = 1, y(B, n2);
  }
  function y(n2, u3, i3) {
    var o3 = d2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : B(void 0, u3), function(n3) {
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.u)) {
      r2.u = true;
      var f3 = r2.shouldComponentUpdate;
      r2.shouldComponentUpdate = function(n3, t3, r3) {
        if (!o3.__c.__H)
          return true;
        var u4 = o3.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u4.every(function(n4) {
          return !n4.__N;
        }))
          return !f3 || f3.call(this, n3, t3, r3);
        var i4 = false;
        return u4.forEach(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
          }
        }), !(!i4 && o3.__c.props === n3) && (!f3 || f3.call(this, n3, t3, r3));
      };
    }
    return o3.__N || o3.__;
  }
  function b2() {
    for (var t3; t3 = f2.shift(); )
      if (t3.__P && t3.__H)
        try {
          t3.__H.__h.forEach(k2), t3.__H.__h.forEach(w2), t3.__H.__h = [];
        } catch (r3) {
          t3.__H.__h = [], l.__e(r3, t3.__v);
        }
  }
  l.__b = function(n2) {
    typeof n2.type != "function" || n2.__m || n2.__ === null ? n2.__m || (n2.__m = n2.__ && n2.__.__m ? n2.__.__m : "") : n2.__m = (n2.__ && n2.__.__m ? n2.__.__m : "") + (n2.__ && n2.__.__k ? n2.__.__k.indexOf(n2) : 0), r2 = null, e2 && e2(n2);
  }, l.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i3 = (r2 = n2.__c).__H;
    i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.__V = c2, n3.__N = n3.i = void 0;
    })) : (i3.__h.forEach(k2), i3.__h.forEach(w2), i3.__h = [])), u2 = r2;
  }, l.diffed = function(t3) {
    v2 && v2(t3);
    var o3 = t3.__c;
    o3 && o3.__H && (o3.__H.__h.length && (f2.push(o3) !== 1 && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o3.__H.__.forEach(function(n2) {
      n2.i && (n2.__H = n2.i), n2.__V !== c2 && (n2.__ = n2.__V), n2.i = void 0, n2.__V = c2;
    })), u2 = r2 = null;
  }, l.__c = function(t3, r3) {
    r3.some(function(t4) {
      try {
        t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
          return !n2.__ || w2(n2);
        });
      } catch (u3) {
        r3.some(function(n2) {
          n2.__h && (n2.__h = []);
        }), r3 = [], l.__e(u3, t4.__v);
      }
    }), l2 && l2(t3, r3);
  }, l.unmount = function(t3) {
    m2 && m2(t3);
    var r3, u3 = t3.__c;
    u3 && u3.__H && (u3.__H.__.forEach(function(n2) {
      try {
        k2(n2);
      } catch (n3) {
        r3 = n3;
      }
    }), u3.__H = void 0, r3 && l.__e(r3, u3.__v));
  };
  var g2 = typeof requestAnimationFrame == "function";
  function j2(n2) {
    var t3, r3 = function() {
      clearTimeout(u3), g2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u3 = setTimeout(r3, 100);
    g2 && (t3 = requestAnimationFrame(r3));
  }
  function k2(n2) {
    var t3 = r2, u3 = n2.__c;
    typeof u3 == "function" && (n2.__c = void 0, u3()), r2 = t3;
  }
  function w2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function B(n2, t3) {
    return typeof t3 == "function" ? t3(n2) : t3;
  }

  // sketch/ui.tsx
  function NumberInput(props) {
    return /* @__PURE__ */ h("label", null, props.label, /* @__PURE__ */ h("input", {
      type: "range",
      step: "any",
      value: props.value,
      onInput: (event) => props.onChange(event.target.valueAsNumber),
      max: props.max,
      min: props.min
    }), /* @__PURE__ */ h("input", {
      type: "number",
      value: props.value,
      onInput: (event) => props.onChange(event.target.value)
    }));
  }
  var consts;
  function Group(props) {
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(NumberInput, {
      label: "stearing threshold",
      value: props.groupState.stearingThreshold,
      onChange: (v3) => props.onGroupState({ ...props.groupState, stearingThreshold: v3 }),
      max: 0.03,
      min: 0
    }), /* @__PURE__ */ h(NumberInput, {
      label: "max velocity",
      value: props.groupState.maxVelocity,
      onChange: (v3) => props.onGroupState({ ...props.groupState, maxVelocity: v3 }),
      max: 2,
      min: 0.05
    }));
  }
  function App() {
    const [state, setState] = p2([{
      stearingThreshold: 3e-3,
      maxVelocity: 0.5
    }]);
    consts = state;
    return /* @__PURE__ */ h("div", null, state.map((group, i3) => /* @__PURE__ */ h(Group, {
      groupState: group,
      onGroupState: (newState) => setState(Object.assign([], state, { [i3]: newState }))
    })));
  }
  P(/* @__PURE__ */ h(App, null), document.getElementById("ui"));

  // sketch/p.ts
  var uid = 0;
  function randomEntityEdge() {
    const w3 = new Vector(random(0, windowWidth), random(0, windowHeight));
    if (Math.random() > 0.5) {
      w3.x = Math.round(Math.random()) * windowWidth;
    } else {
      w3.y = Math.round(Math.random()) * windowHeight;
    }
    return {
      id: uid++,
      position: w3,
      vel: new Vector(0, 0),
      h: new CircularArray(),
      livetime: Infinity
    };
  }
  var groups = [];
  function updateGroup(group) {
    while (group.entities.length < 200) {
      group.entities.push(randomEntityEdge());
    }
    updateColorAnimation(group.colorAnimation, deltaTime);
    for (const e3 of group.entities) {
      e3.livetime -= deltaTime;
      if (e3.livetime < 0) {
        e3.h.pop();
        if (e3.h.length() <= 0) {
          group.entities = group.entities.filter((x) => x !== e3);
        }
        continue;
      }
      const noiseScaleValue = 500;
      let n2 = noise(e3.position.x / noiseScaleValue, e3.position.y / noiseScaleValue, millis() / 9e3);
      n2 = map(n2, 0.25, 0.75, 0, 1);
      const noiseVec = Vector.fromAngle(n2 * Math.PI * 2).multiply(3);
      const seekVec = seek(e3).multiply(0);
      const fellVec = flee(e3).multiply(0);
      const steering = fellVec.add(seekVec).add(noiseVec).limit(consts[0].stearingThreshold);
      e3.vel = e3.vel.add(steering.multiply(deltaTime)).limit(consts[0].maxVelocity);
      e3.position = e3.position.add(e3.vel.multiply(deltaTime));
      e3.h.push(e3.position);
      if (e3.position.x < 0 || e3.position.y < 0 || e3.position.x > windowWidth || e3.position.y > windowHeight) {
        e3.livetime = -1;
      }
    }
  }
  function seek(e3) {
    const target = new Vector(mouseX, mouseY);
    const desiered = target.subtract(e3.position).normalize().multiply(consts[0].maxVelocity * 10);
    return desiered.subtract(e3.vel);
  }
  function flee(e3) {
    const target = new Vector(mouseX, mouseY);
    const distance = e3.position.distanceTo(target);
    const desiered = e3.position.subtract(target).normalize();
    return desiered.divide(distance);
  }
  function drawGroup(group) {
    strokeWeight(4);
    strokeJoin(BEVEL);
    for (const e3 of group.entities) {
      let i3 = 0;
      let prev;
      for (const el of e3.h) {
        if (prev) {
          const color = animationColorAt(group.colorAnimation, el.fraction);
          stroke(color[0], color[1], color[2]);
          line(prev.point.x, prev.point.y, el.point.x, el.point.y);
        }
        prev = el;
        i3++;
      }
    }
  }
  window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    const colorAnimation = {
      currentIndex: 0,
      time: 0,
      gradients: [
        { time: 8e3, gradient: parseGradient("90deg, rgba(0,0,0,1) 0%, rgba(10,0,208,1) 100%") }
      ]
    };
    groups.push({ entities: [], colorAnimation });
  };
  window.windowResized = function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  };
  window.draw = function draw() {
    background(0);
    for (const group of groups) {
      updateGroup(group);
      drawGroup(group);
    }
  };
})();
