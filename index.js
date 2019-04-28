function MyVue (options) {
  console.log('init')
  this._init(options)
}

// 初始化
MyVue.prototype._init = function (options) {
  this.$options = options
  this.$el = document.querySelector(options.el)
  this.$data = options.data
  this.$methods = options.methods
  this._binding = {}
  this._observe(this.$data)
  this._compile(this.$el)
}

// 数据劫持
MyVue.prototype._observe = function (obj) {
  var value
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      // model与view绑定
      this._binding[key] = {
        _directives: []
      }
      value = obj[key]
      if (typeof value === 'object') {
        this._observe(value)
      }
      var binding = this._binding[key]
      Object.defineProperty(this.$data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
          console.log(`get ${ value }`)
          return value
        },
        set: function (newVal) {
          console.log(`set ${ value }`)
          if (newVal !== value) {
            console.log(binding)
            value = newVal
            binding._directives.forEach(function (item) {
              item.update()
            })
          }
        }
      })
    }
  }
  // console.log(this._binding)
}

// watcher
function Watcher (name, el, vm, attr, exp) {
  this.name = name
  this.el = el
  this.vm = vm
  this.attr = attr
  this.exp = exp
  this.update()
}

Watcher.prototype.update = function () {
  this.el[this.attr] = this.vm.$data[this.exp]
}

// view 绑定 model
MyVue.prototype._compile = function (root) {
  console.log(this._binding)
  var _this = this
  var nodes = root.children
  for (let i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.length) {
      this._compile(node)
    }
    if (node.hasAttribute('v-click')) {
      console.log(11)
      var _this = this
      node.addEventListener('click', (function () {
        var attr = nodes[i].getAttribute('v-click')
        return _this.$methods[attr].bind(_this.$data)
      })(i))
    }
    if (node.hasAttribute('v-model') && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
      node.addEventListener('input', (function (key) {
        var attr = node.getAttribute('v-model')
        // console.log(key)
        _this._binding[attr]._directives.push(new Watcher(
          'input',
          node,
          _this,
          attr,
          'value'
        ))
        return function () {
          _this.$data[attr] = nodes[key].value
        }
      })(i))
    }
    // if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
    //   node.addEventListener('input', (function(key) {
    //     var attrVal = node.getAttribute('v-model');
    //     _this._binding[attrVal]._directives.push(new Watcher(
    //       'input',
    //       node,
    //       _this,
    //       attrVal,
    //       'value'
    //     ))

    //     return function() {
    //       _this.$data[attrVal] =  nodes[key].value;
    //     }
    //   })(i));
    // } 
  }
}
