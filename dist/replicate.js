(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Replicate = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * tiny event emitter
     */
    var EventEmitter = /** @class */ (function () {
        function EventEmitter() {
            this.eventMap = new Map();
        }
        /**
         * 监听
         * @param eventName
         * @param callback
         * @returns
         */
        EventEmitter.prototype.on = function (eventName, callback) {
            var eventMap = this.eventMap;
            var listeners = eventMap.get(eventName);
            if (!listeners) {
                eventMap.set(eventName, []);
                listeners = eventMap.get(eventName);
            }
            listeners.push(callback);
            return this;
        };
        /**
         * off
         * @param eventName
         * @param callback
         * @returns
         */
        EventEmitter.prototype.off = function (eventName, callback) {
            var eventMap = this.eventMap;
            var listeners = eventMap[eventName];
            if (!listeners)
                return this;
            if (!callback) {
                eventMap.delete(eventName);
                return this;
            }
            var index = listeners.findIndex(function (i) { return i === callback || i.origin === callback; });
            if (index >= 0) {
                listeners.splice(index, 1);
            }
            return this;
        };
        /**
         * once
         * @param eventName
         * @param callback
         */
        EventEmitter.prototype.once = function (eventName, callback) {
            var _this = this;
            var listener = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.off(eventName, listener);
                callback.apply(_this, args);
            };
            listener.origin = callback;
            this.on(eventName, listener);
        };
        /**
         * emit
         * @param eventName
         * @param args
         * @returns
         */
        EventEmitter.prototype.emit = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var listeners = this.eventMap.get(eventName);
            if (!listeners || !listeners.length)
                return;
            var _listeners = listeners.slice();
            for (var i = 0; i < _listeners.length; i++) {
                _listeners[i].apply(this, args);
            }
            return this;
        };
        return EventEmitter;
    }());

    // action 
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum["COPY"] = "copy";
        ActionEnum["CUT"] = "cut";
    })(ActionEnum || (ActionEnum = {}));

    /**
     * get attribute value
     * @param element
     * @param suffix
     */
    function getAttributeValue(element, suffix) {
        var dataKey = "replicate" + suffix.replace(/^[a-z]{1}/, function (k) { return k.toUpperCase(); });
        return element.dataset[dataKey];
    }

    /**
     * select element
     * @param element
     */
    function select(element) {
        var selectedText = '';
        var nodeName = element.nodeName;
        if (nodeName === 'SELECT') {
            element.focus();
            selectedText = element.value;
        }
        else if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
            var value = element.value;
            element.focus();
            element.setSelectionRange(0, value.length);
            selectedText = value;
        }
        else {
            if (element.hasAttribute('contenteditable')) {
                element.focus();
            }
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
            selectedText = selection.toString();
        }
        return selectedText;
    }

    /**
     * @description Replicate
     */
    var Replicate = /** @class */ (function (_super) {
        __extends(Replicate, _super);
        function Replicate(trigger, options) {
            var _this = _super.call(this) || this;
            var text = options.text, action = options.action, target = options.target;
            _this.text = typeof text === 'function' ? text : function (trigger) { return getAttributeValue(trigger, 'text'); };
            _this.action = typeof action === 'function' ? action : function (trigger) { return getAttributeValue(trigger, 'action'); };
            _this.target = typeof target === 'function' ? target : function (trigger) { return getAttributeValue(trigger, 'target'); };
            _this.listen(trigger);
            return _this;
        }
        /**
         * Initial listener
         * @param trigger
         */
        Replicate.prototype.listen = function (trigger) {
            var _this = this;
            if (trigger) {
                trigger.addEventListener('click', function (e) { return _this.clickListener(e); });
            }
        };
        /**
         * Cabllback
         * @param e
         */
        Replicate.prototype.clickListener = function (e) {
            var trigger = e.target;
            var text = this.text(trigger);
            var action = this.action(trigger);
            var target = document.querySelector(this.target(trigger));
            if (text) {
                this.selectFake(text, action);
            }
            else if (target) {
                this.selectTarget(target, action);
            }
        };
        /**
         * Select a fake element
         * @param text
         * @param action
         */
        Replicate.prototype.selectFake = function (text, action) {
            var element = this.createFakeElement(text);
            document.body.appendChild(element);
            this.selectedContent = select(element);
            this.copyText(action);
            document.body.removeChild(element);
        };
        /**
         * Select target element
         * @param target
         * @param action
         */
        Replicate.prototype.selectTarget = function (target, action) {
            this.selectedContent = select(target);
            this.copyText(action);
        };
        /**
         * Copy selected content
         * @param action
         */
        Replicate.prototype.copyText = function (action) {
            var succeeded = false;
            var err = null;
            try {
                succeeded = document.execCommand(action);
            }
            catch (error) {
                err = error;
            }
            this.handleResult(succeeded, err);
        };
        /**
         * Emit a event
         * @param succeeded
         * @param error
         */
        Replicate.prototype.handleResult = function (succeeded, error) {
            this.emit(succeeded ? 'success' : 'error', {
                error: error,
                text: this.selectedContent,
            });
        };
        /**
         * Create fake input element
         * @param text
         * @returns
         */
        Replicate.prototype.createFakeElement = function (text) {
            var ele = document.createElement('input');
            var isRTL = document.documentElement.dir === 'rtl';
            ele.style.position = 'absolute';
            ele.style[isRTL ? 'right' : 'left'] = '-9999px';
            ele.value = text;
            return ele;
        };
        /**
         * Returns the support of the given action
         * @param actions
         * @returns
         */
        Replicate.isSupported = function (actions) {
            if (actions === void 0) { actions = [ActionEnum.COPY, ActionEnum.CUT]; }
            var supported = !!document.queryCommandSupported;
            if (!supported)
                return supported;
            return actions.every(function (action) { return document.queryCommandSupported(action); });
        };
        return Replicate;
    }(EventEmitter));

    return Replicate;

})));
