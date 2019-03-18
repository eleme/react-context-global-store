(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
    typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
    (global = global || self, factory(global.index = {}, global.React));
}(this, function (exports, React) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /* eslint-disable no-console */
    var adapters = {
        memory: {
            get: function () { },
            set: function () { },
        },
        localStorage: {
            set: function (name, store) {
                var data = __assign({}, store);
                delete data.set;
                window.localStorage.setItem(name, JSON.stringify(data));
            },
            get: function (name) {
                var data = window.localStorage.getItem(name);
                if (data) {
                    try {
                        return JSON.parse(data);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
                return {};
            },
        },
    };
    function inject(injectAdapters) {
        try {
            Object.keys(injectAdapters).map(function (key) {
                adapters[key] = injectAdapters[key];
                return adapters[key];
            });
            return adapters;
        }
        catch (e) {
            console.error(e);
            return adapters;
        }
    }

    function contextFactory (name, defaultValue, adapter, extractSetStateFunc) {
        if (defaultValue === void 0) { defaultValue = {}; }
        if (adapter === void 0) { adapter = 'memory'; }
        var Context = React.createContext({});
        var Provider = Context.Provider;
        var ContextHoc = /** @class */ (function (_super) {
            __extends(ContextHoc, _super);
            function ContextHoc(props) {
                var _this = _super.call(this, props) || this;
                if (!adapters[adapter]) {
                    throw new Error("KV Store:\n Uncaught ReferenceError: " + adapter + " Adapter is not defined.");
                }
                _this.state = __assign({}, defaultValue, adapters[adapter].get(name));
                extractSetStateFunc(name, function (store, callback) {
                    _this.setState(store, function () {
                        adapters[adapter].set(name, _this.state);
                        if (typeof callback === 'function') {
                            callback(_this.state);
                        }
                    });
                });
                return _this;
            }
            ContextHoc.prototype.render = function () {
                return (React.createElement(Provider, { value: this.state }, this.props.children));
            };
            return ContextHoc;
        }(React.Component));
        var Factory = /** @class */ (function () {
            function Factory() {
            }
            Object.defineProperty(Factory.prototype, "ctx", {
                get: function () {
                    return Context;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Factory.prototype, "component", {
                get: function () {
                    return ContextHoc;
                },
                enumerable: true,
                configurable: true
            });
            return Factory;
        }());
        return new Factory();
    }

    /* eslint-disable no-param-reassign */
    function isType(obj, type) {
        if (type) {
            return Object.prototype.toString.call(obj) === "[object " + type + "]";
        }
        else {
            return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0];
        }
    }
    function assign(a, b) {
        if (isType(a, 'Object') && isType(b, 'Object')) {
            Object.keys(b).map(function (key) {
                if ((isType(a[key]) !== isType(b[key])) || !isType(a[key], 'Object')) {
                    a[key] = b[key];
                }
                else {
                    a[key] = assign(a[key], b[key]);
                }
                return key;
            });
        }
        return a;
    }

    var Store = /** @class */ (function () {
        function Store(defaultData) {
            this.store = defaultData;
            this.updaters = {};
        }
        Object.defineProperty(Store.prototype, "data", {
            get: function () {
                return this.store;
            },
            enumerable: true,
            configurable: true
        });
        Store.prototype.update = function (store, callback) {
            var _this = this;
            Object.keys(store).map(function (key) {
                if (!_this.updaters[key]) {
                    throw new Error("KV Store:\n Uncaught ReferenceError: " + store + " Store is not defined.");
                }
                var newStore = assign(stores.data[key].dataCopy, store[key]);
                stores.data[key].dataCopy = newStore;
                _this.updaters[key](newStore, callback);
                return key;
            });
        };
        return Store;
    }());
    var stores = new Store({});
    var Adapter = /** @class */ (function () {
        function Adapter(adapter, values) {
            this.values = values;
            this.adapter = adapter;
        }
        return Adapter;
    }());
    var setStore = function (updateStore, callback) {
        stores.update(updateStore, callback);
    };
    var getStore = function (key) {
        return stores.data[key];
    };
    var extractSetStateFunc = function (storeName, fn) {
        stores.updaters[storeName] = fn;
    };
    function store (storeTemp) {
        if (!isType(storeTemp, 'Object') && !isType(storeTemp, 'Function')) {
            throw new Error("KV Store:\n TypeError: The argument to the createStore method must be an object or function, But got an " + isType(storeTemp) + ".");
        }
        var waitBoundStore = null;
        if (typeof storeTemp === 'function') {
            waitBoundStore = storeTemp();
        }
        else {
            waitBoundStore = storeTemp;
        }
        Object.keys(waitBoundStore).map(function (key) {
            var nowBuilder = waitBoundStore[key];
            if (nowBuilder instanceof Adapter) {
                stores.data[key] = {
                    visitor: contextFactory(key, nowBuilder.values, nowBuilder.adapter, extractSetStateFunc),
                    dataCopy: nowBuilder.values,
                };
            }
            else {
                stores.data[key] = {
                    visitor: contextFactory(key, nowBuilder, 'memory', extractSetStateFunc),
                    dataCopy: nowBuilder,
                };
            }
            return nowBuilder;
        });
        return stores.data;
    }

    /* eslint-disable react/prop-types */
    var Providers = /** @class */ (function (_super) {
        __extends(Providers, _super);
        function Providers() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Providers.prototype.loopContext = function (ctxs) {
            if (ctxs.length) {
                var Ctx = ctxs.shift();
                return (React.createElement(Ctx.visitor.component, null, this.loopContext(ctxs)));
            }
            else {
                return (React.createElement(React.Fragment, null, this.props.children));
            }
        };
        Providers.prototype.render = function () {
            var _this = this;
            var Ctxs = Object.keys(this.props.store).map(function (ctx) { return _this.props.store[ctx]; });
            return this.loopContext(Ctxs);
        };
        return Providers;
    }(React.Component));

    function connect (Component, contextArgs) {
        return /** @class */ (function (_super) {
            __extends(ConnectionHoc, _super);
            function ConnectionHoc() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.contexts = {};
                return _this;
            }
            ConnectionHoc.prototype.renderContext = function (ctxs, cacheLen) {
                var _this = this;
                var CtxLen = (typeof cacheLen === 'number' && !isNaN(cacheLen)) ? cacheLen : ctxs.length - 1;
                var CtxName = ctxs[CtxLen - 1];
                return (function (ctxname, len) {
                    if (ctxname && len >= 0) {
                        if (!stores.data[ctxname]) {
                            throw new Error("KV Store:\n Uncaught ReferenceError: " + CtxName + " Context is not defined.\nPlease check the connect method of the wrapped " + Component.prototype.constructor.name + " component.");
                        }
                        var Ctx = stores.data[ctxname];
                        return (React.createElement(Ctx.visitor.ctx.Consumer, { name: ctxname }, function (data) {
                            _this.contexts[CtxName] = data;
                            return _this.renderContext(ctxs, len - 1);
                        }));
                    }
                    else {
                        if (_this.props.store !== undefined || _this.props.setStore !== undefined) {
                            throw new Error('KV Store:\n Error: Keyword store and setStore are reserved words. Check your props and replace them with other keys.');
                        }
                        return React.createElement(Component, __assign({ setStore: setStore, store: _this.contexts }, _this.props));
                    }
                })(CtxName, CtxLen);
            };
            ConnectionHoc.prototype.render = function () {
                return (React.createElement(React.Fragment, null, this.renderContext(contextArgs.slice(), contextArgs.length)));
            };
            return ConnectionHoc;
        }(React.Component));
    }

    var AdapterStore = Adapter;
    var injectAdapter = inject;

    exports.AdapterStore = AdapterStore;
    exports.injectAdapter = injectAdapter;
    exports.StoreProvider = Providers;
    exports.connect = connect;
    exports.createStore = store;
    exports.setStore = setStore;
    exports.getStore = getStore;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
