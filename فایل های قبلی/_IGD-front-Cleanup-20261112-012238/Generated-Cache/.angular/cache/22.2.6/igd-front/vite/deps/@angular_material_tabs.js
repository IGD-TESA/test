import { $n as Output, $o as ɵɵloadQuery, Ac as Injector, Ao as ɵɵgetCurrentView, Bl as ɵɵrestoreView, Bt as computed, C as ViewChildren, Ca as ɵɵclassProp, Cc as EventEmitter, Co as ɵɵelementStart, Cs as ɵɵreference, Da as ɵɵconditionalCreate, Dr as ViewEncapsulation, En as ElementRef, Er as ViewContainerRef, Es as ɵɵrepeaterTrackByIdentity, Gl as hasLift, Gs as ɵɵtemplate, Hl as BehaviorSubject, Hs as ɵɵstyleProp, In as Input, Js as ɵɵtextInterpolate, Kl as operate, Mr as afterNextRender, O as booleanAttribute, Oa as ɵɵcontentQuery, Qo as ɵɵlistener, Rc as NgZone, S as ViewChild, Sa as ɵɵclassMap, So as ɵɵelementEnd, Ta as ɵɵconditional, Tl as signal, Ts as ɵɵrepeaterCreate, Ul as Subject, Vl as map, Wi as setClassMetadata, Wl as createOperatorSubscriber, Zn as NgModuleRef$1, _c as DOCUMENT, _o as ɵɵdomTemplate, a as ContentChildren, an as ChangeDetectionStrategy, ao as ɵɵdefineNgModule, ar as RendererFactory2, ca as ɵɵInheritDefinitionFeature, cn as Component, cs as ɵɵprojectionDef, cu as __extends, da as ɵɵadvance, dl as inject, dr as Service, du as __spreadArray, es as ɵɵnextContext, eu as Subscription, f as HostAttributeToken, ga as ɵɵariaProperty, i as ContentChild, il as effect, io as ɵɵdefineDirective, ir as Renderer2, jl as ɵɵdefineInjector, jo as ɵɵgetInheritedFactory, kc as InjectionToken, la as ɵɵNgOnChangesFeature, lo as ɵɵdomElement, ls as ɵɵproperty, ml as isSignal, mo as ɵɵdomElementStart, nr as QueryList, ol as forwardRef, p as IterableDiffers, pc as APP_ID, po as ɵɵdomElementEnd, ql as Observable, qn as NgModule, qs as ɵɵtext, qt as untracked, r as ChangeDetectorRef, ro as ɵɵdefineComponent, rt as numberAttribute, so as ɵɵdefineService, ss as ɵɵprojection, tn as ApplicationRef, ua as ɵɵProvidersFeature, uc as ɵɵviewQuery, uu as __read, vc as DestroyRef, vo as ɵɵelement, vr as TemplateRef, wn as Directive, ws as ɵɵrepeater, xs as ɵɵqueryRefresh, ya as ɵɵattribute, zl as ɵɵresetView } from "./core-hsl8ukWr.js";
import { $ as of, J as switchMap, Z as filter, at as popScheduler, et as from, nt as innerFrom, ot as isScheduler, rt as popNumber } from "./http-Yo5eIwws.js";
import { i as mergeAll, n as startWith, t as takeUntil } from "./takeUntil-Cna_bGE4.js";
import { a as EMPTY } from "./take-DmTvGJfN.js";
import { S as dateTimestampProvider, _ as debounceTime, b as AsyncScheduler, c as _CdkPrivateStyleLoader, d as coerceElement, f as coerceNumberProperty, g as distinctUntilChanged, h as skip, l as CdkMonitorFocus, n as MAT_RIPPLE_GLOBAL_OPTIONS, o as _animationsDisabled, p as Platform, r as MatRipple, s as CdkObserveContent, t as _StructuralStylesLoader, u as FocusMonitor, v as async, x as AsyncAction, y as asyncScheduler } from "./_structural-styles-chunk-DreJsAi_.js";
import "./private-CanW9Ekb.js";
import { i as Directionality, t as BidiModule } from "./bidi-CSfNc4k7.js";
import { t as share } from "./share-Rr8eZZZX.js";
import { t as isObservable } from "./isObservable-Bepasph9.js";
import "./platform-browser-D8nwwU0Q.js";
import { t as tap } from "./tap-BKY530Qp.js";
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/refCount.js
function refCount() {
	return operate(function(source, subscriber) {
		var connection = null;
		source._refCount++;
		var refCounter = createOperatorSubscriber(subscriber, void 0, void 0, void 0, function() {
			if (!source || source._refCount <= 0 || 0 < --source._refCount) {
				connection = null;
				return;
			}
			var sharedConnection = source._connection;
			var conn = connection;
			connection = null;
			if (sharedConnection && (!conn || sharedConnection === conn)) sharedConnection.unsubscribe();
			subscriber.unsubscribe();
		});
		source.subscribe(refCounter);
		if (!refCounter.closed) connection = source.connect();
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js
var ConnectableObservable = function(_super) {
	__extends(ConnectableObservable, _super);
	function ConnectableObservable(source, subjectFactory) {
		var _this = _super.call(this) || this;
		_this.source = source;
		_this.subjectFactory = subjectFactory;
		_this._subject = null;
		_this._refCount = 0;
		_this._connection = null;
		if (hasLift(source)) _this.lift = source.lift;
		return _this;
	}
	ConnectableObservable.prototype._subscribe = function(subscriber) {
		return this.getSubject().subscribe(subscriber);
	};
	ConnectableObservable.prototype.getSubject = function() {
		var subject = this._subject;
		if (!subject || subject.isStopped) this._subject = this.subjectFactory();
		return this._subject;
	};
	ConnectableObservable.prototype._teardown = function() {
		this._refCount = 0;
		var _connection = this._connection;
		this._subject = this._connection = null;
		_connection === null || _connection === void 0 || _connection.unsubscribe();
	};
	ConnectableObservable.prototype.connect = function() {
		var _this = this;
		var connection = this._connection;
		if (!connection) {
			connection = this._connection = new Subscription();
			var subject_1 = this.getSubject();
			connection.add(this.source.subscribe(createOperatorSubscriber(subject_1, void 0, function() {
				_this._teardown();
				subject_1.complete();
			}, function(err) {
				_this._teardown();
				subject_1.error(err);
			}, function() {
				return _this._teardown();
			})));
			if (connection.closed) {
				this._connection = null;
				connection = Subscription.EMPTY;
			}
		}
		return connection;
	};
	ConnectableObservable.prototype.refCount = function() {
		return refCount()(this);
	};
	return ConnectableObservable;
}(Observable);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/animationFrameProvider.js
var animationFrameProvider = {
	schedule: function(callback) {
		var request = requestAnimationFrame;
		var cancel = cancelAnimationFrame;
		var delegate = animationFrameProvider.delegate;
		if (delegate) {
			request = delegate.requestAnimationFrame;
			cancel = delegate.cancelAnimationFrame;
		}
		var handle = request(function(timestamp) {
			cancel = void 0;
			callback(timestamp);
		});
		return new Subscription(function() {
			return cancel === null || cancel === void 0 ? void 0 : cancel(handle);
		});
	},
	requestAnimationFrame: function() {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
		var delegate = animationFrameProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.requestAnimationFrame) || requestAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
	},
	cancelAnimationFrame: function() {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
		var delegate = animationFrameProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.cancelAnimationFrame) || cancelAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
	},
	delegate: void 0
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/ReplaySubject.js
var ReplaySubject = function(_super) {
	__extends(ReplaySubject, _super);
	function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
		if (_bufferSize === void 0) _bufferSize = Infinity;
		if (_windowTime === void 0) _windowTime = Infinity;
		if (_timestampProvider === void 0) _timestampProvider = dateTimestampProvider;
		var _this = _super.call(this) || this;
		_this._bufferSize = _bufferSize;
		_this._windowTime = _windowTime;
		_this._timestampProvider = _timestampProvider;
		_this._buffer = [];
		_this._infiniteTimeWindow = true;
		_this._infiniteTimeWindow = _windowTime === Infinity;
		_this._bufferSize = Math.max(1, _bufferSize);
		_this._windowTime = Math.max(1, _windowTime);
		return _this;
	}
	ReplaySubject.prototype.next = function(value) {
		var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
		if (!isStopped) {
			_buffer.push(value);
			!_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
		}
		this._trimBuffer();
		_super.prototype.next.call(this, value);
	};
	ReplaySubject.prototype._subscribe = function(subscriber) {
		this._throwIfClosed();
		this._trimBuffer();
		var subscription = this._innerSubscribe(subscriber);
		var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var copy = _a._buffer.slice();
		for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) subscriber.next(copy[i]);
		this._checkFinalizedStatuses(subscriber);
		return subscription;
	};
	ReplaySubject.prototype._trimBuffer = function() {
		var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
		_bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
		if (!_infiniteTimeWindow) {
			var now = _timestampProvider.now();
			var last = 0;
			for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) last = i;
			last && _buffer.splice(0, last + 1);
		}
	};
	return ReplaySubject;
}(Subject);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/util/Immediate.js
var nextHandle = 1;
var resolved;
var activeHandles = {};
function findAndClearHandle(handle) {
	if (handle in activeHandles) {
		delete activeHandles[handle];
		return true;
	}
	return false;
}
var Immediate = {
	setImmediate: function(cb) {
		var handle = nextHandle++;
		activeHandles[handle] = true;
		if (!resolved) resolved = Promise.resolve();
		resolved.then(function() {
			return findAndClearHandle(handle) && cb();
		});
		return handle;
	},
	clearImmediate: function(handle) {
		findAndClearHandle(handle);
	}
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/immediateProvider.js
var setImmediate = Immediate.setImmediate;
var clearImmediate = Immediate.clearImmediate;
var immediateProvider = {
	setImmediate: function() {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
		var delegate = immediateProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
	},
	clearImmediate: function(handle) {
		var delegate = immediateProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
	},
	delegate: void 0
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/AsapAction.js
var AsapAction = function(_super) {
	__extends(AsapAction, _super);
	function AsapAction(scheduler, work) {
		var _this = _super.call(this, scheduler, work) || this;
		_this.scheduler = scheduler;
		_this.work = work;
		return _this;
	}
	AsapAction.prototype.requestAsyncId = function(scheduler, id, delay) {
		if (delay === void 0) delay = 0;
		if (delay !== null && delay > 0) return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
		scheduler.actions.push(this);
		return scheduler._scheduled || (scheduler._scheduled = immediateProvider.setImmediate(scheduler.flush.bind(scheduler, void 0)));
	};
	AsapAction.prototype.recycleAsyncId = function(scheduler, id, delay) {
		var _a;
		if (delay === void 0) delay = 0;
		if (delay != null ? delay > 0 : this.delay > 0) return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
		var actions = scheduler.actions;
		if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
			immediateProvider.clearImmediate(id);
			if (scheduler._scheduled === id) scheduler._scheduled = void 0;
		}
	};
	return AsapAction;
}(AsyncAction);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/asap.js
var asapScheduler = new (function(_super) {
	__extends(AsapScheduler, _super);
	function AsapScheduler() {
		return _super !== null && _super.apply(this, arguments) || this;
	}
	AsapScheduler.prototype.flush = function(action) {
		this._active = true;
		var flushId = this._scheduled;
		this._scheduled = void 0;
		var actions = this.actions;
		var error;
		action = action || actions.shift();
		do
			if (error = action.execute(action.state, action.delay)) break;
		while ((action = actions[0]) && action.id === flushId && actions.shift());
		this._active = false;
		if (error) {
			while ((action = actions[0]) && action.id === flushId && actions.shift()) action.unsubscribe();
			throw error;
		}
	};
	return AsapScheduler;
}(AsyncScheduler))(AsapAction);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameAction.js
var AnimationFrameAction = function(_super) {
	__extends(AnimationFrameAction, _super);
	function AnimationFrameAction(scheduler, work) {
		var _this = _super.call(this, scheduler, work) || this;
		_this.scheduler = scheduler;
		_this.work = work;
		return _this;
	}
	AnimationFrameAction.prototype.requestAsyncId = function(scheduler, id, delay) {
		if (delay === void 0) delay = 0;
		if (delay !== null && delay > 0) return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
		scheduler.actions.push(this);
		return scheduler._scheduled || (scheduler._scheduled = animationFrameProvider.requestAnimationFrame(function() {
			return scheduler.flush(void 0);
		}));
	};
	AnimationFrameAction.prototype.recycleAsyncId = function(scheduler, id, delay) {
		var _a;
		if (delay === void 0) delay = 0;
		if (delay != null ? delay > 0 : this.delay > 0) return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
		var actions = scheduler.actions;
		if (id != null && id === scheduler._scheduled && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
			animationFrameProvider.cancelAnimationFrame(id);
			scheduler._scheduled = void 0;
		}
	};
	return AnimationFrameAction;
}(AsyncAction);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/animationFrame.js
var animationFrameScheduler = new (function(_super) {
	__extends(AnimationFrameScheduler, _super);
	function AnimationFrameScheduler() {
		return _super !== null && _super.apply(this, arguments) || this;
	}
	AnimationFrameScheduler.prototype.flush = function(action) {
		this._active = true;
		var flushId;
		if (action) flushId = action.id;
		else {
			flushId = this._scheduled;
			this._scheduled = void 0;
		}
		var actions = this.actions;
		var error;
		action = action || actions.shift();
		do
			if (error = action.execute(action.state, action.delay)) break;
		while ((action = actions[0]) && action.id === flushId && actions.shift());
		this._active = false;
		if (error) {
			while ((action = actions[0]) && action.id === flushId && actions.shift()) action.unsubscribe();
			throw error;
		}
	};
	return AnimationFrameScheduler;
}(AsyncScheduler))(AnimationFrameAction);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/util/isDate.js
function isValidDate(value) {
	return value instanceof Date && !isNaN(value);
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/observable/timer.js
function timer(dueTime, intervalOrScheduler, scheduler) {
	if (dueTime === void 0) dueTime = 0;
	if (scheduler === void 0) scheduler = async;
	var intervalDuration = -1;
	if (intervalOrScheduler != null) {
		if (isScheduler(intervalOrScheduler)) scheduler = intervalOrScheduler;
		else intervalDuration = intervalOrScheduler;
	}
	return new Observable(function(subscriber) {
		var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
		if (due < 0) due = 0;
		var n = 0;
		return scheduler.schedule(function() {
			if (!subscriber.closed) {
				subscriber.next(n++);
				if (0 <= intervalDuration) this.schedule(void 0, intervalDuration);
				else subscriber.complete();
			}
		}, due);
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/observable/merge.js
function merge() {
	var args = [];
	for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
	var scheduler = popScheduler(args);
	var concurrent = popNumber(args, Infinity);
	var sources = args;
	return !sources.length ? EMPTY : sources.length === 1 ? innerFrom(sources[0]) : mergeAll(concurrent)(from(sources, scheduler));
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/audit.js
function audit(durationSelector) {
	return operate(function(source, subscriber) {
		var hasValue = false;
		var lastValue = null;
		var durationSubscriber = null;
		var isComplete = false;
		var endDuration = function() {
			durationSubscriber === null || durationSubscriber === void 0 || durationSubscriber.unsubscribe();
			durationSubscriber = null;
			if (hasValue) {
				hasValue = false;
				var value = lastValue;
				lastValue = null;
				subscriber.next(value);
			}
			isComplete && subscriber.complete();
		};
		var cleanupDuration = function() {
			durationSubscriber = null;
			isComplete && subscriber.complete();
		};
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			hasValue = true;
			lastValue = value;
			if (!durationSubscriber) innerFrom(durationSelector(value)).subscribe(durationSubscriber = createOperatorSubscriber(subscriber, endDuration, cleanupDuration));
		}, function() {
			isComplete = true;
			(!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
		}));
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/auditTime.js
function auditTime(duration, scheduler) {
	if (scheduler === void 0) scheduler = asyncScheduler;
	return audit(function() {
		return timer(duration, scheduler);
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/pairwise.js
function pairwise() {
	return operate(function(source, subscriber) {
		var prev;
		var hasPrev = false;
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			var p = prev;
			prev = value;
			hasPrev && subscriber.next([p, value]);
			hasPrev = true;
		}));
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js
function shareReplay(configOrBufferSize, windowTime, scheduler) {
	var _a, _b, _c;
	var bufferSize;
	var refCount = false;
	if (configOrBufferSize && typeof configOrBufferSize === "object") _a = configOrBufferSize.bufferSize, bufferSize = _a === void 0 ? Infinity : _a, _b = configOrBufferSize.windowTime, windowTime = _b === void 0 ? Infinity : _b, _c = configOrBufferSize.refCount, refCount = _c === void 0 ? false : _c, scheduler = configOrBufferSize.scheduler;
	else bufferSize = configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity;
	return share({
		connector: function() {
			return new ReplaySubject(bufferSize, windowTime, scheduler);
		},
		resetOnError: true,
		resetOnComplete: false,
		resetOnRefCountZero: refCount
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_typeahead-chunk.mjs
var DEFAULT_TYPEAHEAD_DEBOUNCE_INTERVAL_MS = 200;
var Typeahead = class {
	_letterKeyStream = new Subject();
	_items = [];
	_selectedItemIndex = -1;
	_pressedLetters = [];
	_skipPredicateFn;
	_selectedItem = new Subject();
	selectedItem = this._selectedItem;
	constructor(initialItems, config) {
		const typeAheadInterval = typeof config?.debounceInterval === "number" ? config.debounceInterval : DEFAULT_TYPEAHEAD_DEBOUNCE_INTERVAL_MS;
		if (config?.skipPredicate) this._skipPredicateFn = config.skipPredicate;
		if ((typeof ngDevMode === "undefined" || ngDevMode) && initialItems.length && initialItems.some((item) => typeof item.getLabel !== "function")) throw new Error("KeyManager items in typeahead mode must implement the `getLabel` method.");
		this.setItems(initialItems);
		this._setupKeyHandler(typeAheadInterval);
	}
	destroy() {
		this._pressedLetters = [];
		this._letterKeyStream.complete();
		this._selectedItem.complete();
	}
	setCurrentSelectedItemIndex(index) {
		this._selectedItemIndex = index;
	}
	setItems(items) {
		this._items = items;
	}
	handleKey(event) {
		const keyCode = event.keyCode;
		if (event.key && event.key.length === 1) this._letterKeyStream.next(event.key.toLocaleUpperCase());
		else if (keyCode >= 65 && keyCode <= 90 || keyCode >= 48 && keyCode <= 57) this._letterKeyStream.next(String.fromCharCode(keyCode));
	}
	isTyping() {
		return this._pressedLetters.length > 0;
	}
	reset() {
		this._pressedLetters = [];
	}
	_setupKeyHandler(typeAheadInterval) {
		this._letterKeyStream.pipe(tap((letter) => this._pressedLetters.push(letter)), debounceTime(typeAheadInterval), filter(() => this._pressedLetters.length > 0), map(() => this._pressedLetters.join("").toLocaleUpperCase())).subscribe((inputString) => {
			for (let i = 1; i < this._items.length + 1; i++) {
				const index = (this._selectedItemIndex + i) % this._items.length;
				const item = this._items[index];
				if (!this._skipPredicateFn?.(item) && item.getLabel?.().toLocaleUpperCase().trim().indexOf(inputString) === 0) {
					this._selectedItem.next(item);
					break;
				}
			}
			this._pressedLetters = [];
		});
	}
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/keycodes.mjs
function hasModifierKey(event, ...modifiers) {
	if (modifiers.length) return modifiers.some((modifier) => event[modifier]);
	return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_list-key-manager-chunk.mjs
var ListKeyManager = class {
	_items;
	_activeItemIndex = signal(-1, ...ngDevMode ? [{ debugName: "_activeItemIndex" }] : []);
	_activeItem = signal(null, ...ngDevMode ? [{ debugName: "_activeItem" }] : []);
	_wrap = false;
	_typeaheadSubscription = Subscription.EMPTY;
	_itemChangesSubscription;
	_vertical = true;
	_horizontal = null;
	_allowedModifierKeys = [];
	_homeAndEnd = false;
	_pageUpAndDown = {
		enabled: false,
		delta: 10
	};
	_effectRef;
	_typeahead;
	_skipPredicateFn = (item) => item.disabled;
	constructor(_items, injector) {
		this._items = _items;
		if (_items instanceof QueryList) this._itemChangesSubscription = _items.changes.subscribe((newItems) => this._itemsChanged(newItems.toArray()));
		else if (isSignal(_items)) {
			if (!injector && (typeof ngDevMode === "undefined" || ngDevMode)) throw new Error("ListKeyManager constructed with a signal must receive an injector");
			this._effectRef = effect(() => this._itemsChanged(_items()), {
				...ngDevMode ? { debugName: "_effectRef" } : {},
				injector
			});
		}
	}
	tabOut = new Subject();
	change = new Subject();
	skipPredicate(predicate) {
		this._skipPredicateFn = predicate;
		return this;
	}
	withWrap(shouldWrap = true) {
		this._wrap = shouldWrap;
		return this;
	}
	withVerticalOrientation(enabled = true) {
		this._vertical = enabled;
		return this;
	}
	withHorizontalOrientation(direction) {
		this._horizontal = direction;
		return this;
	}
	withAllowedModifierKeys(keys) {
		this._allowedModifierKeys = keys;
		return this;
	}
	withTypeAhead(debounceInterval = 200) {
		if (typeof ngDevMode === "undefined" || ngDevMode) {
			const items = this._getItemsArray();
			if (items.length > 0 && items.some((item) => typeof item.getLabel !== "function")) throw Error("ListKeyManager items in typeahead mode must implement the `getLabel` method.");
		}
		this._typeaheadSubscription.unsubscribe();
		const items = this._getItemsArray();
		this._typeahead = new Typeahead(items, {
			debounceInterval: typeof debounceInterval === "number" ? debounceInterval : void 0,
			skipPredicate: (item) => this._skipPredicateFn(item)
		});
		this._typeaheadSubscription = this._typeahead.selectedItem.subscribe((item) => {
			this.setActiveItem(item);
		});
		return this;
	}
	cancelTypeahead() {
		this._typeahead?.reset();
		return this;
	}
	withHomeAndEnd(enabled = true) {
		this._homeAndEnd = enabled;
		return this;
	}
	withPageUpDown(enabled = true, delta = 10) {
		this._pageUpAndDown = {
			enabled,
			delta
		};
		return this;
	}
	setActiveItem(item) {
		const previousActiveItem = this._activeItem();
		this.updateActiveItem(item);
		if (this._activeItem() !== previousActiveItem) this.change.next(this._activeItemIndex());
	}
	onKeydown(event) {
		const keyCode = event.keyCode;
		const isModifierAllowed = [
			"altKey",
			"ctrlKey",
			"metaKey",
			"shiftKey"
		].every((modifier) => {
			return !event[modifier] || this._allowedModifierKeys.indexOf(modifier) > -1;
		});
		switch (keyCode) {
			case 9:
				this.tabOut.next();
				return;
			case 40: if (this._vertical && isModifierAllowed) {
				this.setNextItemActive();
				break;
			} else return;
			case 38: if (this._vertical && isModifierAllowed) {
				this.setPreviousItemActive();
				break;
			} else return;
			case 39: if (this._horizontal && isModifierAllowed) {
				this._horizontal === "rtl" ? this.setPreviousItemActive() : this.setNextItemActive();
				break;
			} else return;
			case 37: if (this._horizontal && isModifierAllowed) {
				this._horizontal === "rtl" ? this.setNextItemActive() : this.setPreviousItemActive();
				break;
			} else return;
			case 36: if (this._homeAndEnd && isModifierAllowed) {
				this.setFirstItemActive();
				break;
			} else return;
			case 35: if (this._homeAndEnd && isModifierAllowed) {
				this.setLastItemActive();
				break;
			} else return;
			case 33: if (this._pageUpAndDown.enabled && isModifierAllowed) {
				const targetIndex = this._activeItemIndex() - this._pageUpAndDown.delta;
				this._setActiveItemByIndex(targetIndex > 0 ? targetIndex : 0, 1);
				break;
			} else return;
			case 34: if (this._pageUpAndDown.enabled && isModifierAllowed) {
				const targetIndex = this._activeItemIndex() + this._pageUpAndDown.delta;
				const itemsLength = this._getItemsArray().length;
				this._setActiveItemByIndex(targetIndex < itemsLength ? targetIndex : itemsLength - 1, -1);
				break;
			} else return;
			default:
				if (isModifierAllowed || hasModifierKey(event, "shiftKey")) this._typeahead?.handleKey(event);
				return;
		}
		this._typeahead?.reset();
		event.preventDefault();
	}
	get activeItemIndex() {
		return this._activeItemIndex();
	}
	get activeItem() {
		return this._activeItem();
	}
	isTyping() {
		return !!this._typeahead && this._typeahead.isTyping();
	}
	setFirstItemActive() {
		this._setActiveItemByIndex(0, 1);
	}
	setLastItemActive() {
		this._setActiveItemByIndex(this._getItemsArray().length - 1, -1);
	}
	setNextItemActive() {
		this._activeItemIndex() < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
	}
	setPreviousItemActive() {
		this._activeItemIndex() < 0 && this._wrap ? this.setLastItemActive() : this._setActiveItemByDelta(-1);
	}
	updateActiveItem(item) {
		const itemArray = this._getItemsArray();
		const index = typeof item === "number" ? item : itemArray.indexOf(item);
		const activeItem = itemArray[index];
		this._activeItem.set(activeItem == null ? null : activeItem);
		this._activeItemIndex.set(index);
		this._typeahead?.setCurrentSelectedItemIndex(index);
	}
	destroy() {
		this._typeaheadSubscription.unsubscribe();
		this._itemChangesSubscription?.unsubscribe();
		this._effectRef?.destroy();
		this._typeahead?.destroy();
		this.tabOut.complete();
		this.change.complete();
	}
	_setActiveItemByDelta(delta) {
		this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
	}
	_setActiveInWrapMode(delta) {
		const items = this._getItemsArray();
		for (let i = 1; i <= items.length; i++) {
			const index = (this._activeItemIndex() + delta * i + items.length) % items.length;
			const item = items[index];
			if (!this._skipPredicateFn(item)) {
				this.setActiveItem(index);
				return;
			}
		}
	}
	_setActiveInDefaultMode(delta) {
		this._setActiveItemByIndex(this._activeItemIndex() + delta, delta);
	}
	_setActiveItemByIndex(index, fallbackDelta) {
		const items = this._getItemsArray();
		if (!items[index]) return;
		while (this._skipPredicateFn(items[index])) {
			index += fallbackDelta;
			if (!items[index]) return;
		}
		this.setActiveItem(index);
	}
	_getItemsArray() {
		if (isSignal(this._items)) return this._items();
		return this._items instanceof QueryList ? this._items.toArray() : this._items;
	}
	_itemsChanged(newItems) {
		this._typeahead?.setItems(newItems);
		const activeItem = this._activeItem();
		if (activeItem) {
			const newIndex = newItems.indexOf(activeItem);
			if (newIndex > -1 && newIndex !== this._activeItemIndex()) {
				this._activeItemIndex.set(newIndex);
				this._typeahead?.setCurrentSelectedItemIndex(newIndex);
			}
		}
	}
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_focus-key-manager-chunk.mjs
var FocusKeyManager = class extends ListKeyManager {
	_origin = "program";
	setFocusOrigin(origin) {
		this._origin = origin;
		return this;
	}
	setActiveItem(item) {
		super.setActiveItem(item);
		if (this.activeItem) this.activeItem.focus(this._origin);
	}
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_id-generator-chunk.mjs
var counters = /* @__PURE__ */ new Map();
var _IdGenerator = class _IdGenerator {
	_appId = inject(APP_ID);
	static _infix = `a${Math.floor(Math.random() * 1e5).toString()}`;
	getId(prefix, randomize = false) {
		if (this._appId !== "ng") prefix += this._appId;
		let count = counters.get(prefix);
		if (count === void 0) count = 0;
		else count++;
		counters.set(prefix, count);
		return `${prefix}${randomize ? _IdGenerator._infix + "-" : ""}${count}`;
	}
	static ɵfac = function _IdGenerator_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || _IdGenerator)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: _IdGenerator,
		factory: _IdGenerator.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_IdGenerator, [{ type: Service }], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_scrolling-chunk.mjs
var RtlScrollAxisType;
(function(RtlScrollAxisType) {
	RtlScrollAxisType[RtlScrollAxisType["NORMAL"] = 0] = "NORMAL";
	RtlScrollAxisType[RtlScrollAxisType["NEGATED"] = 1] = "NEGATED";
	RtlScrollAxisType[RtlScrollAxisType["INVERTED"] = 2] = "INVERTED";
})(RtlScrollAxisType || (RtlScrollAxisType = {}));
var rtlScrollAxisType;
var scrollBehaviorSupported;
function supportsScrollBehavior() {
	if (scrollBehaviorSupported == null) {
		if (typeof document !== "object" || !document || typeof Element !== "function" || !Element) {
			scrollBehaviorSupported = false;
			return scrollBehaviorSupported;
		}
		if (document.documentElement?.style && "scrollBehavior" in document.documentElement.style) scrollBehaviorSupported = true;
		else {
			const scrollToFunction = Element.prototype.scrollTo;
			if (scrollToFunction) scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
			else scrollBehaviorSupported = false;
		}
	}
	return scrollBehaviorSupported;
}
function getRtlScrollAxisType() {
	if (typeof document !== "object" || !document) return RtlScrollAxisType.NORMAL;
	if (rtlScrollAxisType == null) {
		const scrollContainer = document.createElement("div");
		const containerStyle = scrollContainer.style;
		scrollContainer.dir = "rtl";
		containerStyle.width = "1px";
		containerStyle.overflow = "auto";
		containerStyle.visibility = "hidden";
		containerStyle.pointerEvents = "none";
		containerStyle.position = "absolute";
		const content = document.createElement("div");
		const contentStyle = content.style;
		contentStyle.width = "2px";
		contentStyle.height = "1px";
		scrollContainer.appendChild(content);
		document.body.appendChild(scrollContainer);
		rtlScrollAxisType = RtlScrollAxisType.NORMAL;
		if (scrollContainer.scrollLeft === 0) {
			scrollContainer.scrollLeft = 1;
			rtlScrollAxisType = scrollContainer.scrollLeft === 0 ? RtlScrollAxisType.NEGATED : RtlScrollAxisType.INVERTED;
		}
		scrollContainer.remove();
	}
	return rtlScrollAxisType;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/portal.mjs
function throwNullPortalError() {
	throw Error("Must provide a portal to attach");
}
function throwPortalAlreadyAttachedError() {
	throw Error("Host already has a portal attached");
}
function throwPortalOutletAlreadyDisposedError() {
	throw Error("This PortalOutlet has already been disposed");
}
function throwUnknownPortalTypeError() {
	throw Error("Attempting to attach an unknown Portal type. BasePortalOutlet accepts either a ComponentPortal or a TemplatePortal.");
}
function throwNullPortalOutletError() {
	throw Error("Attempting to attach a portal to a null PortalOutlet");
}
function throwNoPortalAttachedError() {
	throw Error("Attempting to detach a portal that is not attached to a host");
}
var Portal = class {
	_attachedHost = null;
	attach(host) {
		if (typeof ngDevMode === "undefined" || ngDevMode) {
			if (host == null) throwNullPortalOutletError();
			if (host.hasAttached()) throwPortalAlreadyAttachedError();
		}
		this._attachedHost = host;
		return host.attach(this);
	}
	detach() {
		let host = this._attachedHost;
		if (host != null) {
			this._attachedHost = null;
			host.detach();
		} else if (typeof ngDevMode === "undefined" || ngDevMode) throwNoPortalAttachedError();
	}
	get isAttached() {
		return this._attachedHost != null;
	}
	setAttachedHost(host) {
		this._attachedHost = host;
	}
};
var ComponentPortal = class extends Portal {
	component;
	viewContainerRef;
	injector;
	projectableNodes;
	bindings;
	directives;
	constructor(component, viewContainerRef, injector, projectableNodes, bindings, directives) {
		super();
		this.component = component;
		this.viewContainerRef = viewContainerRef;
		this.injector = injector;
		this.projectableNodes = projectableNodes;
		this.bindings = bindings || null;
		this.directives = directives || null;
	}
};
var TemplatePortal = class extends Portal {
	templateRef;
	viewContainerRef;
	context;
	injector;
	constructor(templateRef, viewContainerRef, context, injector) {
		super();
		this.templateRef = templateRef;
		this.viewContainerRef = viewContainerRef;
		this.context = context;
		this.injector = injector;
	}
	get origin() {
		return this.templateRef.elementRef;
	}
	attach(host, context = this.context) {
		this.context = context;
		return super.attach(host);
	}
	detach() {
		this.context = void 0;
		return super.detach();
	}
};
var DomPortal = class extends Portal {
	element;
	constructor(element) {
		super();
		this.element = element instanceof ElementRef ? element.nativeElement : element;
	}
};
var BasePortalOutlet = class {
	_attachedPortal = null;
	_disposeFn = null;
	_isDisposed = false;
	hasAttached() {
		return !!this._attachedPortal;
	}
	attach(portal) {
		if (typeof ngDevMode === "undefined" || ngDevMode) {
			if (!portal) throwNullPortalError();
			if (this.hasAttached()) throwPortalAlreadyAttachedError();
			if (this._isDisposed) throwPortalOutletAlreadyDisposedError();
		}
		if (portal instanceof ComponentPortal) {
			this._attachedPortal = portal;
			return this.attachComponentPortal(portal);
		} else if (portal instanceof TemplatePortal) {
			this._attachedPortal = portal;
			return this.attachTemplatePortal(portal);
		} else if (this.attachDomPortal && portal instanceof DomPortal) {
			this._attachedPortal = portal;
			return this.attachDomPortal(portal);
		}
		if (typeof ngDevMode === "undefined" || ngDevMode) throwUnknownPortalTypeError();
	}
	attachDomPortal = null;
	detach() {
		if (this._attachedPortal) {
			this._attachedPortal.setAttachedHost(null);
			this._attachedPortal = null;
		}
		this._invokeDisposeFn();
	}
	dispose() {
		if (this.hasAttached()) this.detach();
		this._invokeDisposeFn();
		this._isDisposed = true;
	}
	setDisposeFn(fn) {
		this._disposeFn = fn;
	}
	_invokeDisposeFn() {
		if (this._disposeFn) {
			this._disposeFn();
			this._disposeFn = null;
		}
	}
};
var CdkPortal = class CdkPortal extends TemplatePortal {
	constructor() {
		const templateRef = inject(TemplateRef);
		const viewContainerRef = inject(ViewContainerRef);
		super(templateRef, viewContainerRef);
	}
	static ɵfac = function CdkPortal_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkPortal)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkPortal,
		selectors: [[
			"",
			"cdkPortal",
			""
		]],
		exportAs: ["cdkPortal"],
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkPortal, [{
		type: Directive,
		args: [{
			selector: "[cdkPortal]",
			exportAs: "cdkPortal"
		}]
	}], () => [], null);
})();
var CdkPortalOutlet = class CdkPortalOutlet extends BasePortalOutlet {
	_moduleRef = inject(NgModuleRef$1, { optional: true });
	_document = inject(DOCUMENT);
	_viewContainerRef = inject(ViewContainerRef);
	_isInitialized = false;
	_attachedRef = null;
	get portal() {
		return this._attachedPortal;
	}
	set portal(portal) {
		if (this.hasAttached() && !portal && !this._isInitialized) return;
		if (this.hasAttached()) super.detach();
		if (portal) super.attach(portal);
		this._attachedPortal = portal || null;
	}
	attached = new EventEmitter();
	get attachedRef() {
		return this._attachedRef;
	}
	ngOnInit() {
		this._isInitialized = true;
	}
	ngOnDestroy() {
		super.dispose();
		this._attachedRef = this._attachedPortal = null;
	}
	attachComponentPortal(portal) {
		portal.setAttachedHost(this);
		const viewContainerRef = portal.viewContainerRef != null ? portal.viewContainerRef : this._viewContainerRef;
		const ref = viewContainerRef.createComponent(portal.component, {
			index: viewContainerRef.length,
			injector: portal.injector || viewContainerRef.injector,
			projectableNodes: portal.projectableNodes || void 0,
			ngModuleRef: this._moduleRef || void 0,
			bindings: portal.bindings || void 0,
			directives: portal.directives || void 0
		});
		if (viewContainerRef !== this._viewContainerRef) this._insertContent(ref.hostView.rootNodes[0]);
		super.setDisposeFn(() => ref.destroy());
		this._attachedPortal = portal;
		this._attachedRef = ref;
		this.attached.emit(ref);
		return ref;
	}
	attachTemplatePortal(portal) {
		portal.setAttachedHost(this);
		const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context, { injector: portal.injector });
		super.setDisposeFn(() => this._viewContainerRef.clear());
		this._attachedPortal = portal;
		this._attachedRef = viewRef;
		this.attached.emit(viewRef);
		return viewRef;
	}
	attachDomPortal = (portal) => {
		const element = portal.element;
		if (!element.parentNode && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("DOM portal content must be attached to a parent node.");
		const anchorNode = this._document.createComment("dom-portal");
		portal.setAttachedHost(this);
		element.parentNode.insertBefore(anchorNode, element);
		this._insertContent(element);
		this._attachedPortal = portal;
		super.setDisposeFn(() => anchorNode.parentNode?.replaceChild(element, anchorNode));
	};
	_insertContent(content) {
		const nativeElement = this._viewContainerRef.element.nativeElement;
		if (nativeElement.nodeType === nativeElement.ELEMENT_NODE) nativeElement.appendChild(content);
		else nativeElement.parentNode?.insertBefore(content, nativeElement);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵCdkPortalOutlet_BaseFactory = void 0;
		return function CdkPortalOutlet_Factory(__ngFactoryType__) {
			return (ɵCdkPortalOutlet_BaseFactory || (ɵCdkPortalOutlet_BaseFactory = ɵɵgetInheritedFactory(CdkPortalOutlet)))(__ngFactoryType__ || CdkPortalOutlet);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkPortalOutlet,
		selectors: [[
			"",
			"cdkPortalOutlet",
			""
		]],
		inputs: { portal: [
			0,
			"cdkPortalOutlet",
			"portal"
		] },
		outputs: { attached: "attached" },
		exportAs: ["cdkPortalOutlet"],
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkPortalOutlet, [{
		type: Directive,
		args: [{
			selector: "[cdkPortalOutlet]",
			exportAs: "cdkPortalOutlet"
		}]
	}], null, {
		portal: [{
			type: Input,
			args: ["cdkPortalOutlet"]
		}],
		attached: [{ type: Output }]
	});
})();
var PortalModule = class PortalModule {
	static ɵfac = function PortalModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || PortalModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: PortalModule,
		imports: [CdkPortal, CdkPortalOutlet],
		exports: [CdkPortal, CdkPortalOutlet]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PortalModule, [{
		type: NgModule,
		args: [{
			imports: [CdkPortal, CdkPortalOutlet],
			exports: [CdkPortal, CdkPortalOutlet]
		}]
	}], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/observers-private.mjs
var loopLimitExceededErrorHandler = (e) => {
	if (e instanceof ErrorEvent && e.message === "ResizeObserver loop limit exceeded") console.error(`${e.message}. This could indicate a performance issue with your app. See https://github.com/WICG/resize-observer/blob/master/explainer.md#error-handling`);
};
var SingleBoxSharedResizeObserver = class {
	_box;
	_destroyed = new Subject();
	_resizeSubject = new Subject();
	_resizeObserver;
	_elementObservables = /* @__PURE__ */ new Map();
	constructor(_box) {
		this._box = _box;
		if (typeof ResizeObserver !== "undefined") this._resizeObserver = new ResizeObserver((entries) => this._resizeSubject.next(entries));
	}
	observe(target) {
		if (!this._elementObservables.has(target)) this._elementObservables.set(target, new Observable((observer) => {
			const subscription = this._resizeSubject.subscribe(observer);
			this._resizeObserver?.observe(target, { box: this._box });
			return () => {
				this._resizeObserver?.unobserve(target);
				subscription.unsubscribe();
				this._elementObservables.delete(target);
			};
		}).pipe(map((entries) => entries.filter((entry) => entry.target === target)), filter((entries) => entries.length > 0), shareReplay({
			bufferSize: 1,
			refCount: true
		}), takeUntil(this._destroyed)));
		return this._elementObservables.get(target);
	}
	destroy() {
		this._destroyed.next();
		this._destroyed.complete();
		this._resizeSubject.complete();
		this._elementObservables.clear();
	}
};
var SharedResizeObserver = class SharedResizeObserver {
	_cleanupErrorListener;
	_observers = /* @__PURE__ */ new Map();
	_ngZone = inject(NgZone);
	constructor() {
		if (typeof ResizeObserver !== "undefined" && (typeof ngDevMode === "undefined" || ngDevMode)) this._ngZone.runOutsideAngular(() => {
			const renderer = inject(RendererFactory2).createRenderer(null, null);
			this._cleanupErrorListener = renderer.listen("window", "error", loopLimitExceededErrorHandler);
		});
	}
	ngOnDestroy() {
		for (const [, observer] of this._observers) observer.destroy();
		this._observers.clear();
		this._cleanupErrorListener?.();
	}
	observe(target, options) {
		const box = options?.box || "content-box";
		if (!this._observers.has(box)) this._observers.set(box, new SingleBoxSharedResizeObserver(box));
		return this._observers.get(box).observe(target);
	}
	static ɵfac = function SharedResizeObserver_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || SharedResizeObserver)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: SharedResizeObserver,
		factory: SharedResizeObserver.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SharedResizeObserver, [{ type: Service }], () => [], null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_data-source-chunk.mjs
var DataSource = class {};
function isDataSource(value) {
	return value && typeof value.connect === "function" && !(value instanceof ConnectableObservable);
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_recycle-view-repeater-strategy-chunk.mjs
var ArrayDataSource = class extends DataSource {
	_data;
	constructor(_data) {
		super();
		this._data = _data;
	}
	connect() {
		return isObservable(this._data) ? this._data : of(this._data);
	}
	disconnect() {}
};
var _ViewRepeaterOperation;
(function(_ViewRepeaterOperation) {
	_ViewRepeaterOperation[_ViewRepeaterOperation["REPLACED"] = 0] = "REPLACED";
	_ViewRepeaterOperation[_ViewRepeaterOperation["INSERTED"] = 1] = "INSERTED";
	_ViewRepeaterOperation[_ViewRepeaterOperation["MOVED"] = 2] = "MOVED";
	_ViewRepeaterOperation[_ViewRepeaterOperation["REMOVED"] = 3] = "REMOVED";
})(_ViewRepeaterOperation || (_ViewRepeaterOperation = {}));
var _RecycleViewRepeaterStrategy = class {
	viewCacheSize = 20;
	_viewCache = [];
	applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
		changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
			let view;
			let operation;
			if (record.previousIndex == null) {
				const viewArgsFactory = () => itemContextFactory(record, adjustedPreviousIndex, currentIndex);
				view = this._insertView(viewArgsFactory, currentIndex, viewContainerRef, itemValueResolver(record));
				operation = view ? _ViewRepeaterOperation.INSERTED : _ViewRepeaterOperation.REPLACED;
			} else if (currentIndex == null) {
				this._detachAndCacheView(adjustedPreviousIndex, viewContainerRef);
				operation = _ViewRepeaterOperation.REMOVED;
			} else {
				view = this._moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, itemValueResolver(record));
				operation = _ViewRepeaterOperation.MOVED;
			}
			if (itemViewChanged) itemViewChanged({
				context: view?.context,
				operation,
				record
			});
		});
	}
	detach() {
		for (const view of this._viewCache) view.destroy();
		this._viewCache = [];
	}
	_insertView(viewArgsFactory, currentIndex, viewContainerRef, value) {
		const cachedView = this._insertViewFromCache(currentIndex, viewContainerRef);
		if (cachedView) {
			cachedView.context.$implicit = value;
			return;
		}
		const viewArgs = viewArgsFactory();
		return viewContainerRef.createEmbeddedView(viewArgs.templateRef, viewArgs.context, viewArgs.index);
	}
	_detachAndCacheView(index, viewContainerRef) {
		const detachedView = viewContainerRef.detach(index);
		this._maybeCacheView(detachedView, viewContainerRef);
	}
	_moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, value) {
		const view = viewContainerRef.get(adjustedPreviousIndex);
		viewContainerRef.move(view, currentIndex);
		view.context.$implicit = value;
		return view;
	}
	_maybeCacheView(view, viewContainerRef) {
		if (this._viewCache.length < this.viewCacheSize) this._viewCache.push(view);
		else {
			const index = viewContainerRef.indexOf(view);
			if (index === -1) view.destroy();
			else viewContainerRef.remove(index);
		}
	}
	_insertViewFromCache(index, viewContainerRef) {
		const cachedView = this._viewCache.pop();
		if (cachedView) viewContainerRef.insert(cachedView, index);
		return cachedView || null;
	}
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/scrolling.mjs
var VIRTUAL_SCROLL_STRATEGY = new InjectionToken("VIRTUAL_SCROLL_STRATEGY");
var FixedSizeVirtualScrollStrategy = class {
	_scrolledIndexChange = new Subject();
	scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
	_viewport = null;
	_itemSize;
	_minBufferPx;
	_maxBufferPx;
	constructor(itemSize, minBufferPx, maxBufferPx) {
		this._itemSize = itemSize;
		this._minBufferPx = minBufferPx;
		this._maxBufferPx = maxBufferPx;
	}
	attach(viewport) {
		this._viewport = viewport;
		this._updateTotalContentSize();
		this._updateRenderedRange();
	}
	detach() {
		this._scrolledIndexChange.complete();
		this._viewport = null;
	}
	updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
		if (maxBufferPx < minBufferPx && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx");
		this._itemSize = itemSize;
		this._minBufferPx = minBufferPx;
		this._maxBufferPx = maxBufferPx;
		this._updateTotalContentSize();
		this._updateRenderedRange();
	}
	onContentScrolled() {
		this._updateRenderedRange();
	}
	onDataLengthChanged() {
		this._updateTotalContentSize();
		this._updateRenderedRange();
	}
	onContentRendered() {}
	onRenderedOffsetChanged() {}
	scrollToIndex(index, behavior) {
		if (this._viewport) this._viewport.scrollToOffset(index * this._itemSize, behavior);
	}
	_updateTotalContentSize() {
		if (!this._viewport) return;
		this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
	}
	_updateRenderedRange() {
		if (!this._viewport) return;
		const renderedRange = this._viewport.getRenderedRange();
		const newRange = {
			start: renderedRange.start,
			end: renderedRange.end
		};
		const viewportSize = this._viewport.getViewportSize();
		const dataLength = this._viewport.getDataLength();
		let scrollOffset = this._viewport.measureScrollOffset();
		let firstVisibleIndex = this._itemSize > 0 ? scrollOffset / this._itemSize : 0;
		if (newRange.end > dataLength) {
			const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
			const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
			if (firstVisibleIndex != newVisibleIndex) {
				firstVisibleIndex = newVisibleIndex;
				scrollOffset = newVisibleIndex * this._itemSize;
				newRange.start = Math.floor(firstVisibleIndex);
			}
			newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
		}
		const startBuffer = scrollOffset - newRange.start * this._itemSize;
		if (startBuffer < this._minBufferPx && newRange.start != 0) {
			const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
			newRange.start = Math.max(0, newRange.start - expandStart);
			newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
		} else {
			const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
			if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
				const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
				if (expandEnd > 0) {
					newRange.end = Math.min(dataLength, newRange.end + expandEnd);
					newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
				}
			}
		}
		this._viewport.setRenderedRange(newRange);
		this._viewport.setRenderedContentOffset(Math.round(this._itemSize * newRange.start));
		this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
	}
};
function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
	return fixedSizeDir._scrollStrategy;
}
var CdkFixedSizeVirtualScroll = class CdkFixedSizeVirtualScroll {
	get itemSize() {
		return this._itemSize;
	}
	set itemSize(value) {
		this._itemSize = coerceNumberProperty(value);
	}
	_itemSize = 20;
	get minBufferPx() {
		return this._minBufferPx;
	}
	set minBufferPx(value) {
		this._minBufferPx = coerceNumberProperty(value);
	}
	_minBufferPx = 100;
	get maxBufferPx() {
		return this._maxBufferPx;
	}
	set maxBufferPx(value) {
		this._maxBufferPx = coerceNumberProperty(value);
	}
	_maxBufferPx = 200;
	_scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
	ngOnChanges() {
		this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
	}
	static ɵfac = function CdkFixedSizeVirtualScroll_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkFixedSizeVirtualScroll)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkFixedSizeVirtualScroll,
		selectors: [[
			"cdk-virtual-scroll-viewport",
			"itemSize",
			""
		]],
		inputs: {
			itemSize: "itemSize",
			minBufferPx: "minBufferPx",
			maxBufferPx: "maxBufferPx"
		},
		features: [ɵɵProvidersFeature([{
			provide: VIRTUAL_SCROLL_STRATEGY,
			useFactory: _fixedSizeVirtualScrollStrategyFactory,
			deps: [forwardRef(() => CdkFixedSizeVirtualScroll)]
		}]), ɵɵNgOnChangesFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkFixedSizeVirtualScroll, [{
		type: Directive,
		args: [{
			selector: "cdk-virtual-scroll-viewport[itemSize]",
			providers: [{
				provide: VIRTUAL_SCROLL_STRATEGY,
				useFactory: _fixedSizeVirtualScrollStrategyFactory,
				deps: [forwardRef(() => CdkFixedSizeVirtualScroll)]
			}]
		}]
	}], null, {
		itemSize: [{ type: Input }],
		minBufferPx: [{ type: Input }],
		maxBufferPx: [{ type: Input }]
	});
})();
var ScrollDispatcher = class ScrollDispatcher {
	_ngZone = inject(NgZone);
	_platform = inject(Platform);
	_renderer = inject(RendererFactory2).createRenderer(null, null);
	_cleanupGlobalListener;
	_scrolled = new Subject();
	_scrolledCount = 0;
	scrollContainers = /* @__PURE__ */ new Map();
	register(target) {
		if (!this.scrollContainers.has(target)) this.scrollContainers.set(target, target.elementScrolled().subscribe(() => this._scrolled.next(target)));
	}
	deregister(target) {
		const ref = this.scrollContainers.get(target);
		if (ref) {
			ref.unsubscribe();
			this.scrollContainers.delete(target);
		}
	}
	scrolled(auditTimeInMs = 20) {
		if (!this._platform.isBrowser) return of();
		return new Observable((observer) => {
			if (!this._cleanupGlobalListener) this._cleanupGlobalListener = this._ngZone.runOutsideAngular(() => this._renderer.listen("document", "scroll", () => this._scrolled.next()));
			const subscription = auditTimeInMs > 0 ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer) : this._scrolled.subscribe(observer);
			this._scrolledCount++;
			return () => {
				subscription.unsubscribe();
				this._scrolledCount--;
				if (!this._scrolledCount) {
					this._cleanupGlobalListener?.();
					this._cleanupGlobalListener = void 0;
				}
			};
		});
	}
	ngOnDestroy() {
		this._cleanupGlobalListener?.();
		this._cleanupGlobalListener = void 0;
		this.scrollContainers.forEach((_, container) => this.deregister(container));
		this._scrolled.complete();
	}
	ancestorScrolled(elementOrElementRef, auditTimeInMs) {
		const ancestors = this.getAncestorScrollContainers(elementOrElementRef);
		return this.scrolled(auditTimeInMs).pipe(filter((target) => !target || ancestors.indexOf(target) > -1));
	}
	getAncestorScrollContainers(elementOrElementRef) {
		const scrollingContainers = [];
		this.scrollContainers.forEach((_, target) => {
			if (this._targetContainsElement(target, elementOrElementRef)) scrollingContainers.push(target);
		});
		return scrollingContainers;
	}
	_targetContainsElement(scrollable, elementOrElementRef) {
		let element = coerceElement(elementOrElementRef);
		let targetElement = scrollable.getElementRef().nativeElement;
		do
			if (element == targetElement) return true;
		while (element = element.parentElement);
		return false;
	}
	static ɵfac = function ScrollDispatcher_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ScrollDispatcher)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: ScrollDispatcher,
		factory: ScrollDispatcher.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScrollDispatcher, [{ type: Service }], null, null);
})();
var CdkScrollable = class CdkScrollable {
	elementRef = inject(ElementRef);
	scrollDispatcher = inject(ScrollDispatcher);
	ngZone = inject(NgZone);
	dir = inject(Directionality, { optional: true });
	_scrollElement = this.elementRef.nativeElement;
	_destroyed = new Subject();
	_renderer = inject(Renderer2);
	_cleanupScroll;
	_elementScrolled = new Subject();
	ngOnInit() {
		this._cleanupScroll = this.ngZone.runOutsideAngular(() => this._renderer.listen(this._scrollElement, "scroll", (event) => this._elementScrolled.next(event)));
		this.scrollDispatcher.register(this);
	}
	ngOnDestroy() {
		this._cleanupScroll?.();
		this._elementScrolled.complete();
		this.scrollDispatcher.deregister(this);
		this._destroyed.next();
		this._destroyed.complete();
	}
	elementScrolled() {
		return this._elementScrolled;
	}
	getElementRef() {
		return this.elementRef;
	}
	scrollTo(options) {
		const el = this.elementRef.nativeElement;
		const isRtl = this.dir && this.dir.value == "rtl";
		if (options.left == null) options.left = isRtl ? options.end : options.start;
		if (options.right == null) options.right = isRtl ? options.start : options.end;
		if (options.bottom != null) options.top = el.scrollHeight - el.clientHeight - options.bottom;
		if (isRtl && getRtlScrollAxisType() != RtlScrollAxisType.NORMAL) {
			if (options.left != null) options.right = el.scrollWidth - el.clientWidth - options.left;
			if (getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) options.left = options.right;
			else if (getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) options.left = options.right ? -options.right : options.right;
		} else if (options.right != null) options.left = el.scrollWidth - el.clientWidth - options.right;
		this._applyScrollToOptions(options);
	}
	_applyScrollToOptions(options) {
		const el = this.elementRef.nativeElement;
		if (supportsScrollBehavior()) el.scrollTo(options);
		else {
			if (options.top != null) el.scrollTop = options.top;
			if (options.left != null) el.scrollLeft = options.left;
		}
	}
	measureScrollOffset(from) {
		const LEFT = "left";
		const RIGHT = "right";
		const el = this.elementRef.nativeElement;
		if (from == "top") return el.scrollTop;
		if (from == "bottom") return el.scrollHeight - el.clientHeight - el.scrollTop;
		const isRtl = this.dir && this.dir.value == "rtl";
		if (from == "start") from = isRtl ? RIGHT : LEFT;
		else if (from == "end") from = isRtl ? LEFT : RIGHT;
		if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
			if (from == LEFT) return el.scrollWidth - el.clientWidth - el.scrollLeft;
			else return el.scrollLeft;
		} else if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
			if (from == LEFT) return el.scrollLeft + el.scrollWidth - el.clientWidth;
			else return -el.scrollLeft;
		} else if (from == LEFT) return el.scrollLeft;
		else return el.scrollWidth - el.clientWidth - el.scrollLeft;
	}
	static ɵfac = function CdkScrollable_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkScrollable)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkScrollable,
		selectors: [[
			"",
			"cdk-scrollable",
			""
		], [
			"",
			"cdkScrollable",
			""
		]]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkScrollable, [{
		type: Directive,
		args: [{ selector: "[cdk-scrollable], [cdkScrollable]" }]
	}], null, null);
})();
var ViewportRuler = class ViewportRuler {
	_platform = inject(Platform);
	_listeners;
	_viewportSize = null;
	_change = new Subject();
	_document = inject(DOCUMENT);
	constructor() {
		const ngZone = inject(NgZone);
		const renderer = inject(RendererFactory2).createRenderer(null, null);
		ngZone.runOutsideAngular(() => {
			if (this._platform.isBrowser) {
				const changeListener = (event) => this._change.next(event);
				this._listeners = [renderer.listen("window", "resize", changeListener), renderer.listen("window", "orientationchange", changeListener)];
			}
			this.change().subscribe(() => this._viewportSize = null);
		});
	}
	ngOnDestroy() {
		this._listeners?.forEach((cleanup) => cleanup());
		this._change.complete();
	}
	getViewportSize() {
		if (!this._viewportSize) this._updateViewportSize();
		const output = {
			width: this._viewportSize.width,
			height: this._viewportSize.height
		};
		if (!this._platform.isBrowser) this._viewportSize = null;
		return output;
	}
	getViewportRect() {
		const scrollPosition = this.getViewportScrollPosition();
		const { width, height } = this.getViewportSize();
		return {
			top: scrollPosition.top,
			left: scrollPosition.left,
			bottom: scrollPosition.top + height,
			right: scrollPosition.left + width,
			height,
			width
		};
	}
	getViewportScrollPosition() {
		if (!this._platform.isBrowser) return {
			top: 0,
			left: 0
		};
		const document = this._document;
		const window = this._getWindow();
		const documentElement = document.documentElement;
		const documentRect = documentElement.getBoundingClientRect();
		return {
			top: -documentRect.top || document.body?.scrollTop || window.scrollY || documentElement.scrollTop || 0,
			left: -documentRect.left || document.body?.scrollLeft || window.scrollX || documentElement.scrollLeft || 0
		};
	}
	change(throttleTime = 20) {
		return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
	}
	_getWindow() {
		return this._document.defaultView || window;
	}
	_updateViewportSize() {
		const window = this._getWindow();
		this._viewportSize = this._platform.isBrowser ? {
			width: window.innerWidth,
			height: window.innerHeight
		} : {
			width: 0,
			height: 0
		};
	}
	static ɵfac = function ViewportRuler_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ViewportRuler)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: ViewportRuler,
		factory: ViewportRuler.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ViewportRuler, [{ type: Service }], () => [], null);
})();
var VIRTUAL_SCROLLABLE = new InjectionToken("VIRTUAL_SCROLLABLE");
var CdkVirtualScrollable = class CdkVirtualScrollable extends CdkScrollable {
	measureViewportSize(orientation) {
		const viewportEl = this.elementRef.nativeElement;
		return orientation === "horizontal" ? viewportEl.clientWidth : viewportEl.clientHeight;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵCdkVirtualScrollable_BaseFactory = void 0;
		return function CdkVirtualScrollable_Factory(__ngFactoryType__) {
			return (ɵCdkVirtualScrollable_BaseFactory || (ɵCdkVirtualScrollable_BaseFactory = ɵɵgetInheritedFactory(CdkVirtualScrollable)))(__ngFactoryType__ || CdkVirtualScrollable);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkVirtualScrollable,
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollable, [{ type: Directive }], null, null);
})();
function rangesEqual(r1, r2) {
	return r1.start == r2.start && r1.end == r2.end;
}
var SCROLL_SCHEDULER = typeof requestAnimationFrame !== "undefined" ? animationFrameScheduler : asapScheduler;
var CDK_VIRTUAL_SCROLL_VIEWPORT = new InjectionToken("CDK_VIRTUAL_SCROLL_VIEWPORT");
var CdkVirtualScrollViewport = class CdkVirtualScrollViewport extends CdkVirtualScrollable {
	elementRef = inject(ElementRef);
	_changeDetectorRef = inject(ChangeDetectorRef);
	_scrollStrategy = inject(VIRTUAL_SCROLL_STRATEGY, { optional: true });
	scrollable = inject(VIRTUAL_SCROLLABLE, { optional: true });
	_platform = inject(Platform);
	_detachedSubject = new Subject();
	_renderedRangeSubject = new Subject();
	_renderedContentOffsetSubject = new Subject();
	get orientation() {
		return this._orientation;
	}
	set orientation(orientation) {
		if (this._orientation !== orientation) {
			this._orientation = orientation;
			this._calculateSpacerSize();
		}
	}
	_orientation = "vertical";
	appendOnly = false;
	scrolledIndexChange = new Observable((observer) => this._scrollStrategy.scrolledIndexChange.subscribe((index) => Promise.resolve().then(() => this.ngZone.run(() => observer.next(index)))));
	_contentWrapper;
	renderedRangeStream = this._renderedRangeSubject;
	renderedContentOffset = this._renderedContentOffsetSubject.pipe(filter((offset) => offset !== null), distinctUntilChanged());
	_totalContentSize = 0;
	_totalContentWidth = signal("", ...ngDevMode ? [{ debugName: "_totalContentWidth" }] : []);
	_totalContentHeight = signal("", ...ngDevMode ? [{ debugName: "_totalContentHeight" }] : []);
	_renderedContentTransform;
	_renderedRange = {
		start: 0,
		end: 0
	};
	_dataLength = 0;
	_viewportSize = 0;
	_forOf = null;
	_renderedContentOffset = 0;
	_renderedContentOffsetNeedsRewrite = false;
	_changeDetectionNeeded = signal(false, ...ngDevMode ? [{ debugName: "_changeDetectionNeeded" }] : []);
	_runAfterChangeDetection = [];
	_viewportChanges = Subscription.EMPTY;
	_injector = inject(Injector);
	_isDestroyed = false;
	constructor() {
		super();
		const viewportRuler = inject(ViewportRuler);
		if (!this._scrollStrategy && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("Error: cdk-virtual-scroll-viewport requires the \"itemSize\" property to be set.");
		this._viewportChanges = viewportRuler.change().subscribe(() => {
			this.checkViewportSize();
		});
		if (!this.scrollable) {
			this.elementRef.nativeElement.classList.add("cdk-virtual-scrollable");
			this.scrollable = this;
		}
		const ref = effect(() => {
			if (this._changeDetectionNeeded()) this._doChangeDetection();
		}, {
			...ngDevMode ? { debugName: "ref" } : {},
			injector: inject(ApplicationRef).injector
		});
		inject(DestroyRef).onDestroy(() => void ref.destroy());
	}
	ngOnInit() {
		if (!this._platform.isBrowser) return;
		if (this.scrollable === this) super.ngOnInit();
		this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
			this._measureViewportSize();
			this._scrollStrategy.attach(this);
			this.scrollable.elementScrolled().pipe(startWith(null), auditTime(0, SCROLL_SCHEDULER), takeUntil(this._destroyed)).subscribe(() => this._scrollStrategy.onContentScrolled());
			this._markChangeDetectionNeeded();
		}));
	}
	ngOnDestroy() {
		this.detach();
		this._scrollStrategy.detach();
		this._renderedRangeSubject.complete();
		this._detachedSubject.complete();
		this._viewportChanges.unsubscribe();
		this._isDestroyed = true;
		super.ngOnDestroy();
	}
	attach(forOf) {
		if (this._forOf && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("CdkVirtualScrollViewport is already attached.");
		this.ngZone.runOutsideAngular(() => {
			this._forOf = forOf;
			this._forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe((data) => {
				const newLength = data.length;
				if (newLength !== this._dataLength) {
					this._dataLength = newLength;
					this._scrollStrategy.onDataLengthChanged();
				}
				this._doChangeDetection();
			});
		});
	}
	detach() {
		this._forOf = null;
		this._detachedSubject.next();
	}
	getDataLength() {
		return this._dataLength;
	}
	getViewportSize() {
		return this._viewportSize;
	}
	getRenderedRange() {
		return this._renderedRange;
	}
	measureBoundingClientRectWithScrollOffset(from) {
		return this.getElementRef().nativeElement.getBoundingClientRect()[from];
	}
	setTotalContentSize(size) {
		if (this._totalContentSize !== size) {
			this._totalContentSize = size;
			this._calculateSpacerSize();
			this._markChangeDetectionNeeded();
		}
	}
	setRenderedRange(range) {
		if (!rangesEqual(this._renderedRange, range)) {
			if (this.appendOnly) range = {
				start: 0,
				end: Math.max(this._renderedRange.end, range.end)
			};
			this._renderedRangeSubject.next(this._renderedRange = range);
			this._markChangeDetectionNeeded(() => this._scrollStrategy.onContentRendered());
		}
	}
	getOffsetToRenderedContentStart() {
		return this._renderedContentOffsetNeedsRewrite ? null : this._renderedContentOffset;
	}
	setRenderedContentOffset(offset, to = "to-start") {
		offset = this.appendOnly && to === "to-start" ? 0 : offset;
		const isRtl = this.dir && this.dir.value == "rtl";
		const isHorizontal = this.orientation == "horizontal";
		const axis = isHorizontal ? "X" : "Y";
		let transform = `translate${axis}(${Number((isHorizontal && isRtl ? -1 : 1) * offset)}px)`;
		this._renderedContentOffset = offset;
		if (to === "to-end") {
			transform += ` translate${axis}(-100%)`;
			this._renderedContentOffsetNeedsRewrite = true;
		}
		if (this._renderedContentTransform != transform) {
			this._renderedContentTransform = transform;
			this._markChangeDetectionNeeded(() => {
				if (this._renderedContentOffsetNeedsRewrite) {
					this._renderedContentOffset -= this.measureRenderedContentSize();
					this._renderedContentOffsetNeedsRewrite = false;
					this.setRenderedContentOffset(this._renderedContentOffset);
				} else this._scrollStrategy.onRenderedOffsetChanged();
			});
		}
	}
	scrollToOffset(offset, behavior = "auto") {
		const options = { behavior };
		if (this.orientation === "horizontal") options.start = offset;
		else options.top = offset;
		this.scrollable.scrollTo(options);
	}
	scrollToIndex(index, behavior = "auto") {
		this._scrollStrategy.scrollToIndex(index, behavior);
	}
	measureScrollOffset(from) {
		let measureScrollOffset;
		if (this.scrollable == this) measureScrollOffset = (_from) => super.measureScrollOffset(_from);
		else measureScrollOffset = (_from) => this.scrollable.measureScrollOffset(_from);
		return Math.max(0, measureScrollOffset(from ?? (this.orientation === "horizontal" ? "start" : "top")) - this.measureViewportOffset());
	}
	measureViewportOffset(from) {
		let fromRect;
		const LEFT = "left";
		const RIGHT = "right";
		const isRtl = this.dir?.value == "rtl";
		if (from == "start") fromRect = isRtl ? RIGHT : LEFT;
		else if (from == "end") fromRect = isRtl ? LEFT : RIGHT;
		else if (from) fromRect = from;
		else fromRect = this.orientation === "horizontal" ? "left" : "top";
		const scrollerClientRect = this.scrollable.measureBoundingClientRectWithScrollOffset(fromRect);
		return this.elementRef.nativeElement.getBoundingClientRect()[fromRect] - scrollerClientRect;
	}
	measureRenderedContentSize() {
		const contentEl = this._contentWrapper.nativeElement;
		return this.orientation === "horizontal" ? contentEl.offsetWidth : contentEl.offsetHeight;
	}
	measureRangeSize(range) {
		if (!this._forOf) return 0;
		return this._forOf.measureRangeSize(range, this.orientation);
	}
	checkViewportSize() {
		this._measureViewportSize();
		this._scrollStrategy.onDataLengthChanged();
	}
	_measureViewportSize() {
		this._viewportSize = this.scrollable.measureViewportSize(this.orientation);
	}
	_markChangeDetectionNeeded(runAfter) {
		if (runAfter) this._runAfterChangeDetection.push(runAfter);
		if (untracked(this._changeDetectionNeeded)) return;
		this.ngZone.runOutsideAngular(() => {
			Promise.resolve().then(() => {
				this.ngZone.run(() => {
					this._changeDetectionNeeded.set(true);
				});
			});
		});
	}
	_doChangeDetection() {
		if (this._isDestroyed) return;
		this.ngZone.run(() => {
			this._changeDetectorRef.markForCheck();
			this._contentWrapper.nativeElement.style.transform = this._renderedContentTransform;
			this._renderedContentOffsetSubject.next(this.getOffsetToRenderedContentStart());
			afterNextRender(() => {
				this._changeDetectionNeeded.set(false);
				const runAfterChangeDetection = this._runAfterChangeDetection;
				this._runAfterChangeDetection = [];
				for (const fn of runAfterChangeDetection) fn();
			}, { injector: this._injector });
		});
	}
	_calculateSpacerSize() {
		this._totalContentHeight.set(this.orientation === "horizontal" ? "" : `${this._totalContentSize}px`);
		this._totalContentWidth.set(this.orientation === "horizontal" ? `${this._totalContentSize}px` : "");
	}
	static ɵfac = function CdkVirtualScrollViewport_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkVirtualScrollViewport)();
	};
	static ɵcmp = (function() {
		const _c0 = ["contentWrapper"];
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: CdkVirtualScrollViewport,
			selectors: [["cdk-virtual-scroll-viewport"]],
			viewQuery: function CdkVirtualScrollViewport_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(_c0, 7);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._contentWrapper = _t.first);
				}
			},
			hostAttrs: [1, "cdk-virtual-scroll-viewport"],
			hostVars: 4,
			hostBindings: function CdkVirtualScrollViewport_HostBindings(rf, ctx) {
				if (rf & 2) ɵɵclassProp("cdk-virtual-scroll-orientation-horizontal", ctx.orientation === "horizontal")("cdk-virtual-scroll-orientation-vertical", ctx.orientation !== "horizontal");
			},
			inputs: {
				orientation: "orientation",
				appendOnly: [
					2,
					"appendOnly",
					"appendOnly",
					booleanAttribute
				]
			},
			outputs: { scrolledIndexChange: "scrolledIndexChange" },
			features: [ɵɵProvidersFeature([{
				provide: CdkScrollable,
				useFactory: () => inject(VIRTUAL_SCROLLABLE, { optional: true }) || inject(CdkVirtualScrollViewport)
			}, {
				provide: CDK_VIRTUAL_SCROLL_VIEWPORT,
				useExisting: CdkVirtualScrollViewport
			}]), ɵɵInheritDefinitionFeature],
			ngContentSelectors: ["*"],
			decls: 4,
			vars: 4,
			consts: [
				["contentWrapper", ""],
				[1, "cdk-virtual-scroll-content-wrapper"],
				[1, "cdk-virtual-scroll-spacer"]
			],
			template: function CdkVirtualScrollViewport_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵdomElementStart(0, "div", 1, 0);
					ɵɵprojection(2);
					ɵɵdomElementEnd();
					ɵɵdomElement(3, "div", 2);
				}
				if (rf & 2) {
					ɵɵadvance(3);
					ɵɵstyleProp("width", ctx._totalContentWidth())("height", ctx._totalContentHeight());
				}
			},
			styles: ["cdk-virtual-scroll-viewport {\n  display: block;\n  position: relative;\n  transform: translateZ(0);\n}\n\n.cdk-virtual-scrollable {\n  overflow: auto;\n  will-change: scroll-position;\n  contain: strict;\n  overflow-anchor: none;\n  scroll-behavior: auto;\n}\n\n.cdk-virtual-scroll-content-wrapper {\n  position: absolute;\n  top: 0;\n  left: 0;\n  contain: content;\n}\n[dir=rtl] .cdk-virtual-scroll-content-wrapper {\n  right: 0;\n  left: auto;\n}\n\n.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {\n  min-height: 100%;\n}\n.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > dl:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > ol:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > table:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > ul:not([cdkVirtualFor]) {\n  padding-left: 0;\n  padding-right: 0;\n  margin-left: 0;\n  margin-right: 0;\n  border-left-width: 0;\n  border-right-width: 0;\n  outline: none;\n}\n\n.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper {\n  min-width: 100%;\n}\n.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > dl:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > ol:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > table:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > ul:not([cdkVirtualFor]) {\n  padding-top: 0;\n  padding-bottom: 0;\n  margin-top: 0;\n  margin-bottom: 0;\n  border-top-width: 0;\n  border-bottom-width: 0;\n  outline: none;\n}\n\n.cdk-virtual-scroll-spacer {\n  height: 1px;\n  transform-origin: 0 0;\n  flex: 0 0 auto;\n}\n[dir=rtl] .cdk-virtual-scroll-spacer {\n  transform-origin: 100% 0;\n}\n"],
			encapsulation: 2
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollViewport, [{
		type: Component,
		args: [{
			selector: "cdk-virtual-scroll-viewport",
			host: {
				"class": "cdk-virtual-scroll-viewport",
				"[class.cdk-virtual-scroll-orientation-horizontal]": "orientation === \"horizontal\"",
				"[class.cdk-virtual-scroll-orientation-vertical]": "orientation !== \"horizontal\""
			},
			encapsulation: ViewEncapsulation.None,
			providers: [{
				provide: CdkScrollable,
				useFactory: () => inject(VIRTUAL_SCROLLABLE, { optional: true }) || inject(CdkVirtualScrollViewport)
			}, {
				provide: CDK_VIRTUAL_SCROLL_VIEWPORT,
				useExisting: CdkVirtualScrollViewport
			}],
			template: "<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper class=\"cdk-virtual-scroll-content-wrapper\">\n  <ng-content></ng-content>\n</div>\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div class=\"cdk-virtual-scroll-spacer\"\n     [style.width]=\"_totalContentWidth()\" [style.height]=\"_totalContentHeight()\"></div>\n",
			styles: ["cdk-virtual-scroll-viewport {\n  display: block;\n  position: relative;\n  transform: translateZ(0);\n}\n\n.cdk-virtual-scrollable {\n  overflow: auto;\n  will-change: scroll-position;\n  contain: strict;\n  overflow-anchor: none;\n  scroll-behavior: auto;\n}\n\n.cdk-virtual-scroll-content-wrapper {\n  position: absolute;\n  top: 0;\n  left: 0;\n  contain: content;\n}\n[dir=rtl] .cdk-virtual-scroll-content-wrapper {\n  right: 0;\n  left: auto;\n}\n\n.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {\n  min-height: 100%;\n}\n.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > dl:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > ol:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > table:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper > ul:not([cdkVirtualFor]) {\n  padding-left: 0;\n  padding-right: 0;\n  margin-left: 0;\n  margin-right: 0;\n  border-left-width: 0;\n  border-right-width: 0;\n  outline: none;\n}\n\n.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper {\n  min-width: 100%;\n}\n.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > dl:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > ol:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > table:not([cdkVirtualFor]), .cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper > ul:not([cdkVirtualFor]) {\n  padding-top: 0;\n  padding-bottom: 0;\n  margin-top: 0;\n  margin-bottom: 0;\n  border-top-width: 0;\n  border-bottom-width: 0;\n  outline: none;\n}\n\n.cdk-virtual-scroll-spacer {\n  height: 1px;\n  transform-origin: 0 0;\n  flex: 0 0 auto;\n}\n[dir=rtl] .cdk-virtual-scroll-spacer {\n  transform-origin: 100% 0;\n}\n"]
		}]
	}], () => [], {
		orientation: [{ type: Input }],
		appendOnly: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		scrolledIndexChange: [{ type: Output }],
		_contentWrapper: [{
			type: ViewChild,
			args: ["contentWrapper", { static: true }]
		}]
	});
})();
function getOffset(orientation, direction, node) {
	const el = node;
	if (!el.getBoundingClientRect) return 0;
	const rect = el.getBoundingClientRect();
	if (orientation === "horizontal") return direction === "start" ? rect.left : rect.right;
	return direction === "start" ? rect.top : rect.bottom;
}
var CdkVirtualForOf = class CdkVirtualForOf {
	_viewContainerRef = inject(ViewContainerRef);
	_template = inject(TemplateRef);
	_differs = inject(IterableDiffers);
	_viewRepeater = new _RecycleViewRepeaterStrategy();
	_viewport = inject(CDK_VIRTUAL_SCROLL_VIEWPORT, { skipSelf: true });
	viewChange = new Subject();
	_dataSourceChanges = new Subject();
	get cdkVirtualForOf() {
		return this._cdkVirtualForOf;
	}
	set cdkVirtualForOf(value) {
		this._cdkVirtualForOf = value;
		if (isDataSource(value)) this._dataSourceChanges.next(value);
		else this._dataSourceChanges.next(new ArrayDataSource(isObservable(value) ? value : Array.from(value || [])));
	}
	_cdkVirtualForOf;
	get cdkVirtualForTrackBy() {
		return this._cdkVirtualForTrackBy;
	}
	set cdkVirtualForTrackBy(fn) {
		this._needsUpdate = true;
		this._cdkVirtualForTrackBy = fn ? (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item) : void 0;
	}
	_cdkVirtualForTrackBy;
	set cdkVirtualForTemplate(value) {
		if (value) {
			this._needsUpdate = true;
			this._template = value;
		}
	}
	get cdkVirtualForTemplateCacheSize() {
		return this._viewRepeater.viewCacheSize;
	}
	set cdkVirtualForTemplateCacheSize(size) {
		this._viewRepeater.viewCacheSize = coerceNumberProperty(size);
	}
	dataStream = this._dataSourceChanges.pipe(startWith(null), pairwise(), switchMap(([prev, cur]) => this._changeDataSource(prev, cur)), shareReplay(1));
	_differ = null;
	_data = [];
	_renderedItems = [];
	_renderedRange = {
		start: 0,
		end: 0
	};
	_needsUpdate = false;
	_destroyed = new Subject();
	constructor() {
		const ngZone = inject(NgZone);
		this.dataStream.subscribe((data) => {
			this._data = data;
			this._onRenderedDataChange();
		});
		this._viewport.renderedRangeStream.pipe(takeUntil(this._destroyed)).subscribe((range) => {
			this._renderedRange = range;
			if (this.viewChange.observers.length) ngZone.run(() => this.viewChange.next(this._renderedRange));
			this._onRenderedDataChange();
		});
		this._viewport.attach(this);
	}
	measureRangeSize(range, orientation) {
		if (range.start >= range.end) return 0;
		if ((range.start < this._renderedRange.start || range.end > this._renderedRange.end) && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error(`Error: attempted to measure an item that isn't rendered.`);
		const renderedStartIndex = range.start - this._renderedRange.start;
		const rangeLen = range.end - range.start;
		let firstNode;
		let lastNode;
		for (let i = 0; i < rangeLen; i++) {
			const view = this._viewContainerRef.get(i + renderedStartIndex);
			if (view && view.rootNodes.length) {
				firstNode = lastNode = view.rootNodes[0];
				break;
			}
		}
		for (let i = rangeLen - 1; i > -1; i--) {
			const view = this._viewContainerRef.get(i + renderedStartIndex);
			if (view && view.rootNodes.length) {
				lastNode = view.rootNodes[view.rootNodes.length - 1];
				break;
			}
		}
		return firstNode && lastNode ? getOffset(orientation, "end", lastNode) - getOffset(orientation, "start", firstNode) : 0;
	}
	ngDoCheck() {
		if (this._differ && this._needsUpdate) {
			const changes = this._differ.diff(this._renderedItems);
			if (!changes) this._updateContext();
			else this._applyChanges(changes);
			this._needsUpdate = false;
		}
	}
	ngOnDestroy() {
		this._viewport.detach();
		this._dataSourceChanges.next(void 0);
		this._dataSourceChanges.complete();
		this.viewChange.complete();
		this._destroyed.next();
		this._destroyed.complete();
		this._viewRepeater.detach();
	}
	_onRenderedDataChange() {
		if (!this._renderedRange) return;
		this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
		if (!this._differ) this._differ = this._differs.find(this._renderedItems).create((index, item) => {
			return this.cdkVirtualForTrackBy ? this.cdkVirtualForTrackBy(index, item) : item;
		});
		this._needsUpdate = true;
	}
	_changeDataSource(oldDs, newDs) {
		if (oldDs) oldDs.disconnect(this);
		this._needsUpdate = true;
		return newDs ? newDs.connect(this) : of();
	}
	_updateContext() {
		const count = this._data.length;
		let i = this._viewContainerRef.length;
		while (i--) {
			const view = this._viewContainerRef.get(i);
			view.context.index = this._renderedRange.start + i;
			view.context.count = count;
			this._updateComputedContextProperties(view.context);
			view.detectChanges();
		}
	}
	_applyChanges(changes) {
		this._viewRepeater.applyChanges(changes, this._viewContainerRef, (record, _adjustedPreviousIndex, currentIndex) => this._getEmbeddedViewArgs(record, currentIndex), (record) => record.item);
		changes.forEachIdentityChange((record) => {
			const view = this._viewContainerRef.get(record.currentIndex);
			view.context.$implicit = record.item;
		});
		const count = this._data.length;
		let i = this._viewContainerRef.length;
		while (i--) {
			const view = this._viewContainerRef.get(i);
			view.context.index = this._renderedRange.start + i;
			view.context.count = count;
			this._updateComputedContextProperties(view.context);
		}
	}
	_updateComputedContextProperties(context) {
		context.first = context.index === 0;
		context.last = context.index === context.count - 1;
		context.even = context.index % 2 === 0;
		context.odd = !context.even;
	}
	_getEmbeddedViewArgs(record, index) {
		return {
			templateRef: this._template,
			context: {
				$implicit: record.item,
				cdkVirtualForOf: this._cdkVirtualForOf,
				index: -1,
				count: -1,
				first: false,
				last: false,
				odd: false,
				even: false
			},
			index
		};
	}
	static ngTemplateContextGuard(directive, context) {
		return true;
	}
	static ɵfac = function CdkVirtualForOf_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkVirtualForOf)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkVirtualForOf,
		selectors: [[
			"",
			"cdkVirtualFor",
			"",
			"cdkVirtualForOf",
			""
		]],
		inputs: {
			cdkVirtualForOf: "cdkVirtualForOf",
			cdkVirtualForTrackBy: "cdkVirtualForTrackBy",
			cdkVirtualForTemplate: "cdkVirtualForTemplate",
			cdkVirtualForTemplateCacheSize: "cdkVirtualForTemplateCacheSize"
		}
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualForOf, [{
		type: Directive,
		args: [{ selector: "[cdkVirtualFor][cdkVirtualForOf]" }]
	}], () => [], {
		cdkVirtualForOf: [{ type: Input }],
		cdkVirtualForTrackBy: [{ type: Input }],
		cdkVirtualForTemplate: [{ type: Input }],
		cdkVirtualForTemplateCacheSize: [{ type: Input }]
	});
})();
var CdkVirtualScrollableElement = class CdkVirtualScrollableElement extends CdkVirtualScrollable {
	measureBoundingClientRectWithScrollOffset(from) {
		return this.getElementRef().nativeElement.getBoundingClientRect()[from] - this.measureScrollOffset(from);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵCdkVirtualScrollableElement_BaseFactory = void 0;
		return function CdkVirtualScrollableElement_Factory(__ngFactoryType__) {
			return (ɵCdkVirtualScrollableElement_BaseFactory || (ɵCdkVirtualScrollableElement_BaseFactory = ɵɵgetInheritedFactory(CdkVirtualScrollableElement)))(__ngFactoryType__ || CdkVirtualScrollableElement);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkVirtualScrollableElement,
		selectors: [[
			"",
			"cdkVirtualScrollingElement",
			""
		]],
		hostAttrs: [1, "cdk-virtual-scrollable"],
		features: [ɵɵProvidersFeature([{
			provide: VIRTUAL_SCROLLABLE,
			useExisting: CdkVirtualScrollableElement
		}]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollableElement, [{
		type: Directive,
		args: [{
			selector: "[cdkVirtualScrollingElement]",
			providers: [{
				provide: VIRTUAL_SCROLLABLE,
				useExisting: CdkVirtualScrollableElement
			}],
			host: { "class": "cdk-virtual-scrollable" }
		}]
	}], null, null);
})();
var CdkVirtualScrollableWindow = class CdkVirtualScrollableWindow extends CdkVirtualScrollable {
	constructor() {
		super();
		const document = inject(DOCUMENT);
		this.elementRef = new ElementRef(document.documentElement);
		this._scrollElement = document;
	}
	measureBoundingClientRectWithScrollOffset(from) {
		return this.getElementRef().nativeElement.getBoundingClientRect()[from];
	}
	static ɵfac = function CdkVirtualScrollableWindow_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkVirtualScrollableWindow)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkVirtualScrollableWindow,
		selectors: [[
			"cdk-virtual-scroll-viewport",
			"scrollWindow",
			""
		]],
		features: [ɵɵProvidersFeature([{
			provide: VIRTUAL_SCROLLABLE,
			useExisting: CdkVirtualScrollableWindow
		}]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollableWindow, [{
		type: Directive,
		args: [{
			selector: "cdk-virtual-scroll-viewport[scrollWindow]",
			providers: [{
				provide: VIRTUAL_SCROLLABLE,
				useExisting: CdkVirtualScrollableWindow
			}]
		}]
	}], () => [], null);
})();
var CdkScrollableModule = class CdkScrollableModule {
	static ɵfac = function CdkScrollableModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkScrollableModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: CdkScrollableModule,
		imports: [CdkScrollable],
		exports: [CdkScrollable]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkScrollableModule, [{
		type: NgModule,
		args: [{
			exports: [CdkScrollable],
			imports: [CdkScrollable]
		}]
	}], null, null);
})();
var ScrollingModule = class ScrollingModule {
	static ɵfac = function ScrollingModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ScrollingModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: ScrollingModule,
		imports: [
			BidiModule,
			CdkScrollableModule,
			CdkVirtualScrollViewport,
			CdkFixedSizeVirtualScroll,
			CdkVirtualForOf,
			CdkVirtualScrollableWindow,
			CdkVirtualScrollableElement
		],
		exports: [
			BidiModule,
			CdkScrollableModule,
			CdkFixedSizeVirtualScroll,
			CdkVirtualForOf,
			CdkVirtualScrollViewport,
			CdkVirtualScrollableWindow,
			CdkVirtualScrollableElement
		]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [
		BidiModule,
		CdkScrollableModule,
		BidiModule,
		CdkScrollableModule
	] });
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScrollingModule, [{
		type: NgModule,
		args: [{
			imports: [
				BidiModule,
				CdkScrollableModule,
				CdkVirtualScrollViewport,
				CdkFixedSizeVirtualScroll,
				CdkVirtualForOf,
				CdkVirtualScrollableWindow,
				CdkVirtualScrollableElement
			],
			exports: [
				BidiModule,
				CdkScrollableModule,
				CdkFixedSizeVirtualScroll,
				CdkVirtualForOf,
				CdkVirtualScrollViewport,
				CdkVirtualScrollableWindow,
				CdkVirtualScrollableElement
			]
		}]
	}], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/material/fesm2022/tabs.mjs
var MAT_TAB_CONTENT = new InjectionToken("MatTabContent");
var MatTabContent = class MatTabContent {
	template = inject(TemplateRef);
	static ɵfac = function MatTabContent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabContent)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatTabContent,
		selectors: [[
			"",
			"matTabContent",
			""
		]],
		features: [ɵɵProvidersFeature([{
			provide: MAT_TAB_CONTENT,
			useExisting: MatTabContent
		}])]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabContent, [{
		type: Directive,
		args: [{
			selector: "[matTabContent]",
			providers: [{
				provide: MAT_TAB_CONTENT,
				useExisting: MatTabContent
			}]
		}]
	}], null, null);
})();
var MAT_TAB_LABEL = new InjectionToken("MatTabLabel");
var MAT_TAB = new InjectionToken("MAT_TAB");
var MatTabLabel = class MatTabLabel extends CdkPortal {
	_closestTab = inject(MAT_TAB, { optional: true });
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMatTabLabel_BaseFactory = void 0;
		return function MatTabLabel_Factory(__ngFactoryType__) {
			return (ɵMatTabLabel_BaseFactory || (ɵMatTabLabel_BaseFactory = ɵɵgetInheritedFactory(MatTabLabel)))(__ngFactoryType__ || MatTabLabel);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatTabLabel,
		selectors: [[
			"",
			"mat-tab-label",
			""
		], [
			"",
			"matTabLabel",
			""
		]],
		features: [ɵɵProvidersFeature([{
			provide: MAT_TAB_LABEL,
			useExisting: MatTabLabel
		}]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabLabel, [{
		type: Directive,
		args: [{
			selector: "[mat-tab-label], [matTabLabel]",
			providers: [{
				provide: MAT_TAB_LABEL,
				useExisting: MatTabLabel
			}]
		}]
	}], null, null);
})();
var MAT_TAB_GROUP = new InjectionToken("MAT_TAB_GROUP");
var MatTab = class MatTab {
	_viewContainerRef = inject(ViewContainerRef);
	_closestTabGroup = inject(MAT_TAB_GROUP, { optional: true });
	disabled = false;
	get templateLabel() {
		return this._templateLabel;
	}
	set templateLabel(value) {
		this._setTemplateLabelInput(value);
	}
	_templateLabel;
	_explicitContent = void 0;
	_implicitContent;
	textLabel = "";
	ariaLabel;
	ariaLabelledby;
	labelClass;
	bodyClass;
	id = null;
	_contentPortal = null;
	get content() {
		return this._contentPortal;
	}
	_stateChanges = new Subject();
	position = null;
	origin = null;
	isActive = false;
	constructor() {
		inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
	}
	ngOnChanges(changes) {
		if (Object.hasOwn(changes, "textLabel") || Object.hasOwn(changes, "disabled")) this._stateChanges.next();
	}
	ngOnDestroy() {
		this._stateChanges.complete();
	}
	ngOnInit() {
		this._contentPortal = new TemplatePortal(this._explicitContent || this._implicitContent, this._viewContainerRef);
	}
	_setTemplateLabelInput(value) {
		if (value && value._closestTab === this) this._templateLabel = value;
	}
	static ɵfac = function MatTab_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTab)();
	};
	static ɵcmp = (function() {
		const _c0 = ["*"];
		function MatTab_ng_template_0_Template(rf, ctx) {
			if (rf & 1) ɵɵprojection(0);
		}
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTab,
			selectors: [["mat-tab"]],
			contentQueries: function MatTab_ContentQueries(rf, ctx, dirIndex) {
				if (rf & 1) ɵɵcontentQuery(dirIndex, MatTabLabel, 5)(dirIndex, MatTabContent, 7, TemplateRef);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templateLabel = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._explicitContent = _t.first);
				}
			},
			viewQuery: function MatTab_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(TemplateRef, 7);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._implicitContent = _t.first);
				}
			},
			hostAttrs: ["hidden", ""],
			hostVars: 1,
			hostBindings: function MatTab_HostBindings(rf, ctx) {
				if (rf & 2) ɵɵattribute("id", null);
			},
			inputs: {
				disabled: [
					2,
					"disabled",
					"disabled",
					booleanAttribute
				],
				textLabel: [
					0,
					"label",
					"textLabel"
				],
				ariaLabel: [
					0,
					"aria-label",
					"ariaLabel"
				],
				ariaLabelledby: [
					0,
					"aria-labelledby",
					"ariaLabelledby"
				],
				labelClass: "labelClass",
				bodyClass: "bodyClass",
				id: "id"
			},
			exportAs: ["matTab"],
			features: [ɵɵProvidersFeature([{
				provide: MAT_TAB,
				useExisting: MatTab
			}]), ɵɵNgOnChangesFeature],
			ngContentSelectors: _c0,
			decls: 1,
			vars: 0,
			template: function MatTab_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵdomTemplate(0, MatTab_ng_template_0_Template, 1, 0, "ng-template");
				}
			},
			encapsulation: 2,
			changeDetection: 1
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTab, [{
		type: Component,
		args: [{
			selector: "mat-tab",
			changeDetection: ChangeDetectionStrategy.Eager,
			encapsulation: ViewEncapsulation.None,
			exportAs: "matTab",
			providers: [{
				provide: MAT_TAB,
				useExisting: MatTab
			}],
			host: {
				"hidden": "",
				"[attr.id]": "null"
			},
			template: "<!-- Create a template for the content of the <mat-tab> so that we can grab a reference to this\n    TemplateRef and use it in a Portal to render the tab content in the appropriate place in the\n    tab-group. -->\n<ng-template><ng-content></ng-content></ng-template>\n"
		}]
	}], () => [], {
		disabled: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		templateLabel: [{
			type: ContentChild,
			args: [MatTabLabel]
		}],
		_explicitContent: [{
			type: ContentChild,
			args: [MatTabContent, {
				read: TemplateRef,
				static: true
			}]
		}],
		_implicitContent: [{
			type: ViewChild,
			args: [TemplateRef, { static: true }]
		}],
		textLabel: [{
			type: Input,
			args: ["label"]
		}],
		ariaLabel: [{
			type: Input,
			args: ["aria-label"]
		}],
		ariaLabelledby: [{
			type: Input,
			args: ["aria-labelledby"]
		}],
		labelClass: [{ type: Input }],
		bodyClass: [{ type: Input }],
		id: [{ type: Input }]
	});
})();
var ACTIVE_CLASS = "mdc-tab-indicator--active";
var NO_TRANSITION_CLASS = "mdc-tab-indicator--no-transition";
var MatInkBar = class {
	_items;
	_currentItem;
	constructor(_items) {
		this._items = _items;
	}
	hide() {
		this._items.forEach((item) => item.deactivateInkBar());
		this._currentItem = void 0;
	}
	alignToElement(element) {
		const correspondingItem = this._items.find((item) => item.elementRef.nativeElement === element);
		const currentItem = this._currentItem;
		if (correspondingItem === currentItem) return;
		currentItem?.deactivateInkBar();
		if (correspondingItem) {
			const domRect = currentItem?.elementRef.nativeElement.getBoundingClientRect?.();
			correspondingItem.activateInkBar(domRect);
			this._currentItem = correspondingItem;
		}
	}
};
var InkBarItem = class InkBarItem {
	_elementRef = inject(ElementRef);
	_inkBarElement = null;
	_inkBarContentElement = null;
	_fitToContent = false;
	get fitInkBarToContent() {
		return this._fitToContent;
	}
	set fitInkBarToContent(newValue) {
		if (this._fitToContent !== newValue) {
			this._fitToContent = newValue;
			if (this._inkBarElement) this._appendInkBarElement();
		}
	}
	activateInkBar(previousIndicatorClientRect) {
		const element = this._elementRef.nativeElement;
		if (!previousIndicatorClientRect || !element.getBoundingClientRect || !this._inkBarContentElement) {
			element.classList.add(ACTIVE_CLASS);
			return;
		}
		const currentClientRect = element.getBoundingClientRect();
		const widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
		const xPosition = previousIndicatorClientRect.left - currentClientRect.left;
		element.classList.add(NO_TRANSITION_CLASS);
		this._inkBarContentElement.style.setProperty("transform", `translateX(${xPosition}px) scaleX(${widthDelta})`);
		element.getBoundingClientRect();
		element.classList.remove(NO_TRANSITION_CLASS);
		element.classList.add(ACTIVE_CLASS);
		this._inkBarContentElement.style.setProperty("transform", "");
	}
	deactivateInkBar() {
		this._elementRef.nativeElement.classList.remove(ACTIVE_CLASS);
	}
	ngOnInit() {
		this._createInkBarElement();
	}
	ngOnDestroy() {
		this._inkBarElement?.remove();
		this._inkBarElement = this._inkBarContentElement = null;
	}
	_createInkBarElement() {
		const documentNode = this._elementRef.nativeElement.ownerDocument || document;
		const inkBarElement = this._inkBarElement = documentNode.createElement("span");
		const inkBarContentElement = this._inkBarContentElement = documentNode.createElement("span");
		inkBarElement.className = "mdc-tab-indicator";
		inkBarContentElement.className = "mdc-tab-indicator__content mdc-tab-indicator__content--underline";
		inkBarElement.appendChild(this._inkBarContentElement);
		this._appendInkBarElement();
	}
	_appendInkBarElement() {
		if (!this._inkBarElement && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("Ink bar element has not been created and cannot be appended");
		const parentElement = this._fitToContent ? this._elementRef.nativeElement.querySelector(".mdc-tab__content") : this._elementRef.nativeElement;
		if (!parentElement && (typeof ngDevMode === "undefined" || ngDevMode)) throw Error("Missing element to host the ink bar");
		parentElement.appendChild(this._inkBarElement);
	}
	static ɵfac = function InkBarItem_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || InkBarItem)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: InkBarItem,
		inputs: { fitInkBarToContent: [
			2,
			"fitInkBarToContent",
			"fitInkBarToContent",
			booleanAttribute
		] }
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InkBarItem, [{ type: Directive }], null, { fitInkBarToContent: [{
		type: Input,
		args: [{ transform: booleanAttribute }]
	}] });
})();
var _MAT_INK_BAR_POSITIONER = new InjectionToken("MatInkBarPositioner", {
	providedIn: "root",
	factory: () => {
		const method = (element) => ({
			left: element ? (element.offsetLeft || 0) + "px" : "0",
			width: element ? (element.offsetWidth || 0) + "px" : "0"
		});
		return method;
	}
});
var MatTabLabelWrapper = class MatTabLabelWrapper extends InkBarItem {
	elementRef = inject(ElementRef);
	disabled = false;
	focus() {
		this.elementRef.nativeElement.focus();
	}
	getOffsetLeft() {
		return this.elementRef.nativeElement.offsetLeft;
	}
	getOffsetWidth() {
		return this.elementRef.nativeElement.offsetWidth;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMatTabLabelWrapper_BaseFactory = void 0;
		return function MatTabLabelWrapper_Factory(__ngFactoryType__) {
			return (ɵMatTabLabelWrapper_BaseFactory || (ɵMatTabLabelWrapper_BaseFactory = ɵɵgetInheritedFactory(MatTabLabelWrapper)))(__ngFactoryType__ || MatTabLabelWrapper);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatTabLabelWrapper,
		selectors: [[
			"",
			"matTabLabelWrapper",
			""
		]],
		hostVars: 3,
		hostBindings: function MatTabLabelWrapper_HostBindings(rf, ctx) {
			if (rf & 2) {
				ɵɵattribute("aria-disabled", !!ctx.disabled);
				ɵɵclassProp("mat-mdc-tab-disabled", ctx.disabled);
			}
		},
		inputs: { disabled: [
			2,
			"disabled",
			"disabled",
			booleanAttribute
		] },
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabLabelWrapper, [{
		type: Directive,
		args: [{
			selector: "[matTabLabelWrapper]",
			host: {
				"[class.mat-mdc-tab-disabled]": "disabled",
				"[attr.aria-disabled]": "!!disabled"
			}
		}]
	}], null, { disabled: [{
		type: Input,
		args: [{ transform: booleanAttribute }]
	}] });
})();
var passiveEventListenerOptions = { passive: true };
var HEADER_SCROLL_DELAY = 650;
var HEADER_SCROLL_INTERVAL = 100;
function normalizeDuration(value) {
	const stringValue = value + "";
	if (/^[0-9]+(?:\.[0-9]+)?$/.test(stringValue)) return `${value}ms`;
	else if (/^[0-9]+(?:\.[0-9]+)?(?:ms|s)$/.test(stringValue)) return stringValue;
	else return "";
}
var MatPaginatedTabHeader = class MatPaginatedTabHeader {
	_elementRef = inject(ElementRef);
	_changeDetectorRef = inject(ChangeDetectorRef);
	_viewportRuler = inject(ViewportRuler);
	_dir = inject(Directionality, { optional: true });
	_ngZone = inject(NgZone);
	_platform = inject(Platform);
	_sharedResizeObserver = inject(SharedResizeObserver);
	_injector = inject(Injector);
	_renderer = inject(Renderer2);
	_animationsDisabled = _animationsDisabled();
	_eventCleanups;
	_scrollDistance = 0;
	_selectedIndexChanged = false;
	_destroyed = new Subject();
	_showPaginationControls = false;
	_disableScrollAfter = true;
	_disableScrollBefore = true;
	_tabLabelCount;
	_scrollDistanceChanged = false;
	_keyManager;
	_currentTextContent;
	_stopScrolling = new Subject();
	disablePagination = false;
	get selectedIndex() {
		return this._selectedIndex;
	}
	set selectedIndex(v) {
		const value = isNaN(v) ? 0 : v;
		if (this._selectedIndex != value) {
			this._selectedIndexChanged = true;
			this._selectedIndex = value;
			if (this._keyManager) this._keyManager.updateActiveItem(value);
		}
	}
	_selectedIndex = 0;
	selectFocusedIndex = new EventEmitter();
	indexFocused = new EventEmitter();
	constructor() {
		this._eventCleanups = this._ngZone.runOutsideAngular(() => [this._renderer.listen(this._elementRef.nativeElement, "mouseleave", () => this._stopInterval())]);
	}
	ngAfterViewInit() {
		this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement, "touchstart", () => this._handlePaginatorPress("before"), passiveEventListenerOptions), this._renderer.listen(this._nextPaginator.nativeElement, "touchstart", () => this._handlePaginatorPress("after"), passiveEventListenerOptions));
	}
	ngAfterContentInit() {
		const dirChange = this._dir ? this._dir.change : of("ltr");
		const resize = this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe(debounceTime(32), takeUntil(this._destroyed));
		const viewportResize = this._viewportRuler.change(150).pipe(takeUntil(this._destroyed));
		const realign = () => {
			this.updatePagination();
			this._alignInkBarToSelectedTab();
		};
		this._keyManager = new FocusKeyManager(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(() => false);
		this._keyManager.updateActiveItem(Math.max(this._selectedIndex, 0));
		afterNextRender(realign, { injector: this._injector });
		merge(dirChange, viewportResize, resize, this._items.changes, this._itemsResized()).pipe(takeUntil(this._destroyed)).subscribe(() => {
			this._ngZone.run(() => {
				Promise.resolve().then(() => {
					this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), this._scrollDistance));
					realign();
				});
			});
			this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());
		});
		this._keyManager.change.subscribe((newFocusIndex) => {
			this.indexFocused.emit(newFocusIndex);
			this._setTabFocus(newFocusIndex);
		});
	}
	_itemsResized() {
		if (typeof ResizeObserver !== "function") return EMPTY;
		return this._items.changes.pipe(startWith(this._items), switchMap((tabItems) => new Observable((observer) => this._ngZone.runOutsideAngular(() => {
			const resizeObserver = new ResizeObserver((entries) => observer.next(entries));
			tabItems.forEach((item) => resizeObserver.observe(item.elementRef.nativeElement));
			return () => {
				resizeObserver.disconnect();
			};
		}))), skip(1), filter((entries) => entries.some((e) => e.contentRect.width > 0 && e.contentRect.height > 0)));
	}
	ngAfterContentChecked() {
		if (this._tabLabelCount != this._items.length) {
			this.updatePagination();
			this._tabLabelCount = this._items.length;
			this._changeDetectorRef.markForCheck();
		}
		if (this._selectedIndexChanged) {
			this._scrollToLabel(this._selectedIndex);
			this._checkScrollingControls();
			this._alignInkBarToSelectedTab();
			this._selectedIndexChanged = false;
			this._changeDetectorRef.markForCheck();
		}
		if (this._scrollDistanceChanged) {
			this._updateTabScrollPosition();
			this._scrollDistanceChanged = false;
			this._changeDetectorRef.markForCheck();
		}
	}
	ngOnDestroy() {
		this._eventCleanups.forEach((cleanup) => cleanup());
		this._keyManager?.destroy();
		this._destroyed.next();
		this._destroyed.complete();
		this._stopScrolling.complete();
	}
	_handleKeydown(event) {
		if (hasModifierKey(event)) return;
		switch (event.keyCode) {
			case 13:
			case 32:
				if (this.focusIndex !== this.selectedIndex) {
					const item = this._items.get(this.focusIndex);
					if (item && !item.disabled) {
						this.selectFocusedIndex.emit(this.focusIndex);
						this._itemSelected(event);
					}
				}
				break;
			default: this._keyManager?.onKeydown(event);
		}
	}
	_onContentChanges() {
		const textContent = this._elementRef.nativeElement.textContent;
		if (textContent !== this._currentTextContent) {
			this._currentTextContent = textContent || "";
			this._ngZone.run(() => {
				this.updatePagination();
				this._alignInkBarToSelectedTab();
				this._changeDetectorRef.markForCheck();
			});
		}
	}
	updatePagination() {
		this._checkPaginationEnabled();
		this._checkScrollingControls();
		this._updateTabScrollPosition();
	}
	get focusIndex() {
		return this._keyManager ? this._keyManager.activeItemIndex : 0;
	}
	set focusIndex(value) {
		if (!this._isValidIndex(value) || this.focusIndex === value || !this._keyManager) return;
		this._keyManager.setActiveItem(value);
	}
	_isValidIndex(index) {
		return this._items ? !!this._items.toArray()[index] : true;
	}
	_setTabFocus(tabIndex) {
		if (this._showPaginationControls) this._scrollToLabel(tabIndex);
		if (this._items && this._items.length) {
			this._items.toArray()[tabIndex].focus();
			const containerEl = this._tabListContainer.nativeElement;
			if (this._getLayoutDirection() == "ltr") containerEl.scrollLeft = 0;
			else containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
		}
	}
	_getLayoutDirection() {
		return this._dir && this._dir.value === "rtl" ? "rtl" : "ltr";
	}
	_updateTabScrollPosition() {
		if (this.disablePagination) return;
		const scrollDistance = this.scrollDistance;
		const translateX = this._getLayoutDirection() === "ltr" ? -scrollDistance : scrollDistance;
		this._tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;
		if (this._platform.TRIDENT || this._platform.EDGE) this._tabListContainer.nativeElement.scrollLeft = 0;
	}
	get scrollDistance() {
		return this._scrollDistance;
	}
	set scrollDistance(value) {
		this._scrollTo(value);
	}
	_scrollHeader(direction) {
		const viewLength = this._tabListContainer.nativeElement.offsetWidth;
		const scrollAmount = (direction == "before" ? -1 : 1) * viewLength / 3;
		return this._scrollTo(this._scrollDistance + scrollAmount);
	}
	_handlePaginatorClick(direction) {
		this._stopInterval();
		this._scrollHeader(direction);
	}
	_scrollToLabel(labelIndex) {
		if (this.disablePagination) return;
		const selectedLabel = this._items ? this._items.toArray()[labelIndex] : null;
		if (!selectedLabel) return;
		const viewLength = this._tabListContainer.nativeElement.offsetWidth;
		const { offsetLeft, offsetWidth } = selectedLabel.elementRef.nativeElement;
		let labelBeforePos, labelAfterPos;
		if (this._getLayoutDirection() == "ltr") {
			labelBeforePos = offsetLeft;
			labelAfterPos = labelBeforePos + offsetWidth;
		} else {
			labelAfterPos = this._tabListInner.nativeElement.offsetWidth - offsetLeft;
			labelBeforePos = labelAfterPos - offsetWidth;
		}
		const beforeVisiblePos = this.scrollDistance;
		const afterVisiblePos = this.scrollDistance + viewLength;
		if (labelBeforePos < beforeVisiblePos) this.scrollDistance -= beforeVisiblePos - labelBeforePos;
		else if (labelAfterPos > afterVisiblePos) this.scrollDistance += Math.min(labelAfterPos - afterVisiblePos, labelBeforePos - beforeVisiblePos);
	}
	_checkPaginationEnabled() {
		if (this.disablePagination) this._showPaginationControls = false;
		else {
			const isEnabled = this._tabListInner.nativeElement.scrollWidth - this._elementRef.nativeElement.offsetWidth >= 5;
			if (!isEnabled) this.scrollDistance = 0;
			if (isEnabled !== this._showPaginationControls) {
				this._showPaginationControls = isEnabled;
				this._changeDetectorRef.markForCheck();
			}
		}
	}
	_checkScrollingControls() {
		if (this.disablePagination) this._disableScrollAfter = this._disableScrollBefore = true;
		else {
			this._disableScrollBefore = this.scrollDistance == 0;
			this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();
			this._changeDetectorRef.markForCheck();
		}
	}
	_getMaxScrollDistance() {
		return this._tabListInner.nativeElement.scrollWidth - this._tabListContainer.nativeElement.offsetWidth || 0;
	}
	_alignInkBarToSelectedTab() {
		const selectedItem = this._items && this._items.length ? this._items.toArray()[this.selectedIndex] : null;
		const selectedLabelWrapper = selectedItem ? selectedItem.elementRef.nativeElement : null;
		if (selectedLabelWrapper) this._inkBar.alignToElement(selectedLabelWrapper);
		else this._inkBar.hide();
	}
	_stopInterval() {
		this._stopScrolling.next();
	}
	_handlePaginatorPress(direction, mouseEvent) {
		if (mouseEvent && mouseEvent.button != null && mouseEvent.button !== 0) return;
		this._stopInterval();
		timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL).pipe(takeUntil(merge(this._stopScrolling, this._destroyed))).subscribe(() => {
			const { maxScrollDistance, distance } = this._scrollHeader(direction);
			if (distance === 0 || distance >= maxScrollDistance) this._stopInterval();
		});
	}
	_scrollTo(position) {
		if (this.disablePagination) return {
			maxScrollDistance: 0,
			distance: 0
		};
		const maxScrollDistance = this._getMaxScrollDistance();
		this._scrollDistance = Math.max(0, Math.min(maxScrollDistance, position));
		this._scrollDistanceChanged = true;
		this._checkScrollingControls();
		return {
			maxScrollDistance,
			distance: this._scrollDistance
		};
	}
	static ɵfac = function MatPaginatedTabHeader_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatPaginatedTabHeader)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatPaginatedTabHeader,
		inputs: {
			disablePagination: [
				2,
				"disablePagination",
				"disablePagination",
				booleanAttribute
			],
			selectedIndex: [
				2,
				"selectedIndex",
				"selectedIndex",
				numberAttribute
			]
		},
		outputs: {
			selectFocusedIndex: "selectFocusedIndex",
			indexFocused: "indexFocused"
		}
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatPaginatedTabHeader, [{ type: Directive }], () => [], {
		disablePagination: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		selectedIndex: [{
			type: Input,
			args: [{ transform: numberAttribute }]
		}],
		selectFocusedIndex: [{ type: Output }],
		indexFocused: [{ type: Output }]
	});
})();
var MatTabHeader = class MatTabHeader extends MatPaginatedTabHeader {
	_items;
	_tabListContainer;
	_tabList;
	_tabListInner;
	_nextPaginator;
	_previousPaginator;
	_inkBar;
	ariaLabel;
	ariaLabelledby;
	disableRipple = false;
	ngAfterContentInit() {
		this._inkBar = new MatInkBar(this._items);
		super.ngAfterContentInit();
	}
	_itemSelected(event) {
		event.preventDefault();
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMatTabHeader_BaseFactory = void 0;
		return function MatTabHeader_Factory(__ngFactoryType__) {
			return (ɵMatTabHeader_BaseFactory || (ɵMatTabHeader_BaseFactory = ɵɵgetInheritedFactory(MatTabHeader)))(__ngFactoryType__ || MatTabHeader);
		};
	})();
	static ɵcmp = (function() {
		const _c0 = ["tabListContainer"];
		const _c1 = ["tabList"];
		const _c2 = ["tabListInner"];
		const _c3 = ["nextPaginator"];
		const _c4 = ["previousPaginator"];
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabHeader,
			selectors: [["mat-tab-header"]],
			contentQueries: function MatTabHeader_ContentQueries(rf, ctx, dirIndex) {
				if (rf & 1) ɵɵcontentQuery(dirIndex, MatTabLabelWrapper, 4);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._items = _t);
				}
			},
			viewQuery: function MatTabHeader_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(_c0, 7)(_c1, 7)(_c2, 7)(_c3, 5)(_c4, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabListContainer = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabList = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabListInner = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._nextPaginator = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._previousPaginator = _t.first);
				}
			},
			hostAttrs: [1, "mat-mdc-tab-header"],
			hostVars: 4,
			hostBindings: function MatTabHeader_HostBindings(rf, ctx) {
				if (rf & 2) ɵɵclassProp("mat-mdc-tab-header-pagination-controls-enabled", ctx._showPaginationControls)("mat-mdc-tab-header-rtl", ctx._getLayoutDirection() == "rtl");
			},
			inputs: {
				ariaLabel: [
					0,
					"aria-label",
					"ariaLabel"
				],
				ariaLabelledby: [
					0,
					"aria-labelledby",
					"ariaLabelledby"
				],
				disableRipple: [
					2,
					"disableRipple",
					"disableRipple",
					booleanAttribute
				]
			},
			features: [ɵɵInheritDefinitionFeature],
			ngContentSelectors: ["*"],
			decls: 13,
			vars: 10,
			consts: [
				["previousPaginator", ""],
				["tabListContainer", ""],
				["tabList", ""],
				["tabListInner", ""],
				["nextPaginator", ""],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-header-pagination",
					"mat-mdc-tab-header-pagination-before",
					3,
					"click",
					"mousedown",
					"touchend",
					"matRippleDisabled"
				],
				[1, "mat-mdc-tab-header-pagination-chevron"],
				[
					1,
					"mat-mdc-tab-label-container",
					3,
					"keydown"
				],
				[
					"role",
					"tablist",
					1,
					"mat-mdc-tab-list",
					3,
					"cdkObserveContent"
				],
				[1, "mat-mdc-tab-labels"],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-header-pagination",
					"mat-mdc-tab-header-pagination-after",
					3,
					"mousedown",
					"click",
					"touchend",
					"matRippleDisabled"
				]
			],
			template: function MatTabHeader_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵelementStart(0, "div", 5, 0);
					ɵɵlistener("click", function MatTabHeader_Template_div_click_0_listener() {
						return ctx._handlePaginatorClick("before");
					})("mousedown", function MatTabHeader_Template_div_mousedown_0_listener($event) {
						return ctx._handlePaginatorPress("before", $event);
					})("touchend", function MatTabHeader_Template_div_touchend_0_listener() {
						return ctx._stopInterval();
					});
					ɵɵelement(2, "div", 6);
					ɵɵelementEnd();
					ɵɵelementStart(3, "div", 7, 1);
					ɵɵlistener("keydown", function MatTabHeader_Template_div_keydown_3_listener($event) {
						return ctx._handleKeydown($event);
					});
					ɵɵelementStart(5, "div", 8, 2);
					ɵɵlistener("cdkObserveContent", function MatTabHeader_Template_div_cdkObserveContent_5_listener() {
						return ctx._onContentChanges();
					});
					ɵɵelementStart(7, "div", 9, 3);
					ɵɵprojection(9);
					ɵɵelementEnd()()();
					ɵɵelementStart(10, "div", 10, 4);
					ɵɵlistener("mousedown", function MatTabHeader_Template_div_mousedown_10_listener($event) {
						return ctx._handlePaginatorPress("after", $event);
					})("click", function MatTabHeader_Template_div_click_10_listener() {
						return ctx._handlePaginatorClick("after");
					})("touchend", function MatTabHeader_Template_div_touchend_10_listener() {
						return ctx._stopInterval();
					});
					ɵɵelement(12, "div", 6);
					ɵɵelementEnd();
				}
				if (rf & 2) {
					ɵɵclassProp("mat-mdc-tab-header-pagination-disabled", ctx._disableScrollBefore);
					ɵɵproperty("matRippleDisabled", ctx._disableScrollBefore || ctx.disableRipple);
					ɵɵadvance(3);
					ɵɵclassProp("_mat-animation-noopable", ctx._animationsDisabled);
					ɵɵadvance(2);
					ɵɵattribute("aria-label", ctx.ariaLabel || null)("aria-labelledby", ctx.ariaLabelledby || null);
					ɵɵadvance(5);
					ɵɵclassProp("mat-mdc-tab-header-pagination-disabled", ctx._disableScrollAfter);
					ɵɵproperty("matRippleDisabled", ctx._disableScrollAfter || ctx.disableRipple);
				}
			},
			dependencies: [MatRipple, CdkObserveContent],
			styles: [".mat-mdc-tab-header {\n  display: flex;\n  overflow: hidden;\n  position: relative;\n  flex-shrink: 0;\n}\n\n.mdc-tab-indicator .mdc-tab-indicator__content {\n  transition-duration: var(--%NS%mat-tab-header-animation-duration, 250ms);\n}\n\n.mat-mdc-tab-header-pagination {\n  -webkit-user-select: none;\n  user-select: none;\n  position: relative;\n  display: none;\n  justify-content: center;\n  align-items: center;\n  min-width: 32px;\n  cursor: pointer;\n  z-index: 2;\n  -webkit-tap-highlight-color: transparent;\n  touch-action: none;\n  box-sizing: content-box;\n  outline: 0;\n}\n.mat-mdc-tab-header-pagination::-moz-focus-inner {\n  border: 0;\n}\n.mat-mdc-tab-header-pagination .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {\n  display: flex;\n}\n\n.mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {\n  padding-left: 4px;\n}\n.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(-135deg);\n}\n\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-pagination-after {\n  padding-right: 4px;\n}\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(45deg);\n}\n\n.mat-mdc-tab-header-pagination-chevron {\n  border-style: solid;\n  border-width: 2px 2px 0 0;\n  height: 8px;\n  width: 8px;\n  border-color: var(--%NS%mat-tab-pagination-icon-color, var(--%NS%mat-sys-on-surface));\n}\n\n.mat-mdc-tab-header-pagination-disabled {\n  box-shadow: none;\n  cursor: default;\n  pointer-events: none;\n}\n.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {\n  opacity: 0.4;\n}\n\n.mat-mdc-tab-list {\n  flex-grow: 1;\n  position: relative;\n  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n._mat-animation-noopable .mat-mdc-tab-list {\n  transition: none;\n}\n\n.mat-mdc-tab-label-container {\n  display: flex;\n  flex-grow: 1;\n  overflow: hidden;\n  z-index: 1;\n  border-bottom-style: solid;\n  border-bottom-width: var(--%NS%mat-tab-divider-height, 1px);\n  border-bottom-color: var(--%NS%mat-tab-divider-color, var(--%NS%mat-sys-surface-variant));\n}\n.mat-mdc-tab-group-inverted-header .mat-mdc-tab-label-container {\n  border-bottom: none;\n  border-top-style: solid;\n  border-top-width: var(--%NS%mat-tab-divider-height, 1px);\n  border-top-color: var(--%NS%mat-tab-divider-color, var(--%NS%mat-sys-surface-variant));\n}\n\n.mat-mdc-tab-labels {\n  display: flex;\n  flex: 1 0 auto;\n}\n[mat-align-tabs=center] > .mat-mdc-tab-header .mat-mdc-tab-labels {\n  justify-content: center;\n}\n[mat-align-tabs=end] > .mat-mdc-tab-header .mat-mdc-tab-labels {\n  justify-content: flex-end;\n}\n.cdk-drop-list .mat-mdc-tab-labels, .mat-mdc-tab-labels.cdk-drop-list {\n  min-height: var(--%NS%mat-tab-container-height, 48px);\n}\n\n.mat-mdc-tab::before {\n  margin: 5px;\n}\n@media (forced-colors: active) {\n  .mat-mdc-tab[aria-disabled=true] {\n    color: GrayText;\n  }\n}\n"],
			encapsulation: 2,
			changeDetection: 1
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabHeader, [{
		type: Component,
		args: [{
			selector: "mat-tab-header",
			encapsulation: ViewEncapsulation.None,
			changeDetection: ChangeDetectionStrategy.Eager,
			host: {
				"class": "mat-mdc-tab-header",
				"[class.mat-mdc-tab-header-pagination-controls-enabled]": "_showPaginationControls",
				"[class.mat-mdc-tab-header-rtl]": "_getLayoutDirection() == 'rtl'"
			},
			imports: [MatRipple, CdkObserveContent],
			template: "<!--\n Note that this intentionally uses a `div` instead of a `button`, because it's not part of\n the regular tabs flow and is only here to support mouse users. It should also not be focusable.\n-->\n<div class=\"mat-mdc-tab-header-pagination mat-mdc-tab-header-pagination-before\"\n     #previousPaginator\n     mat-ripple\n     [matRippleDisabled]=\"_disableScrollBefore || disableRipple\"\n     [class.mat-mdc-tab-header-pagination-disabled]=\"_disableScrollBefore\"\n     (click)=\"_handlePaginatorClick('before')\"\n     (mousedown)=\"_handlePaginatorPress('before', $event)\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-mdc-tab-header-pagination-chevron\"></div>\n</div>\n\n<div\n  class=\"mat-mdc-tab-label-container\"\n  #tabListContainer\n  (keydown)=\"_handleKeydown($event)\"\n  [class._mat-animation-noopable]=\"_animationsDisabled\">\n  <div\n    #tabList\n    class=\"mat-mdc-tab-list\"\n    role=\"tablist\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"ariaLabelledby || null\"\n    (cdkObserveContent)=\"_onContentChanges()\">\n    <div class=\"mat-mdc-tab-labels\" #tabListInner>\n      <ng-content></ng-content>\n    </div>\n  </div>\n</div>\n\n<div class=\"mat-mdc-tab-header-pagination mat-mdc-tab-header-pagination-after\"\n     #nextPaginator\n     mat-ripple\n     [matRippleDisabled]=\"_disableScrollAfter || disableRipple\"\n     [class.mat-mdc-tab-header-pagination-disabled]=\"_disableScrollAfter\"\n     (mousedown)=\"_handlePaginatorPress('after', $event)\"\n     (click)=\"_handlePaginatorClick('after')\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-mdc-tab-header-pagination-chevron\"></div>\n</div>\n",
			styles: [".mat-mdc-tab-header {\n  display: flex;\n  overflow: hidden;\n  position: relative;\n  flex-shrink: 0;\n}\n\n.mdc-tab-indicator .mdc-tab-indicator__content {\n  transition-duration: var(--mat-tab-header-animation-duration, 250ms);\n}\n\n.mat-mdc-tab-header-pagination {\n  -webkit-user-select: none;\n  user-select: none;\n  position: relative;\n  display: none;\n  justify-content: center;\n  align-items: center;\n  min-width: 32px;\n  cursor: pointer;\n  z-index: 2;\n  -webkit-tap-highlight-color: transparent;\n  touch-action: none;\n  box-sizing: content-box;\n  outline: 0;\n}\n.mat-mdc-tab-header-pagination::-moz-focus-inner {\n  border: 0;\n}\n.mat-mdc-tab-header-pagination .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {\n  display: flex;\n}\n\n.mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {\n  padding-left: 4px;\n}\n.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(-135deg);\n}\n\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-pagination-after {\n  padding-right: 4px;\n}\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(45deg);\n}\n\n.mat-mdc-tab-header-pagination-chevron {\n  border-style: solid;\n  border-width: 2px 2px 0 0;\n  height: 8px;\n  width: 8px;\n  border-color: var(--mat-tab-pagination-icon-color, var(--mat-sys-on-surface));\n}\n\n.mat-mdc-tab-header-pagination-disabled {\n  box-shadow: none;\n  cursor: default;\n  pointer-events: none;\n}\n.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {\n  opacity: 0.4;\n}\n\n.mat-mdc-tab-list {\n  flex-grow: 1;\n  position: relative;\n  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n._mat-animation-noopable .mat-mdc-tab-list {\n  transition: none;\n}\n\n.mat-mdc-tab-label-container {\n  display: flex;\n  flex-grow: 1;\n  overflow: hidden;\n  z-index: 1;\n  border-bottom-style: solid;\n  border-bottom-width: var(--mat-tab-divider-height, 1px);\n  border-bottom-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));\n}\n.mat-mdc-tab-group-inverted-header .mat-mdc-tab-label-container {\n  border-bottom: none;\n  border-top-style: solid;\n  border-top-width: var(--mat-tab-divider-height, 1px);\n  border-top-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));\n}\n\n.mat-mdc-tab-labels {\n  display: flex;\n  flex: 1 0 auto;\n}\n[mat-align-tabs=center] > .mat-mdc-tab-header .mat-mdc-tab-labels {\n  justify-content: center;\n}\n[mat-align-tabs=end] > .mat-mdc-tab-header .mat-mdc-tab-labels {\n  justify-content: flex-end;\n}\n.cdk-drop-list .mat-mdc-tab-labels, .mat-mdc-tab-labels.cdk-drop-list {\n  min-height: var(--mat-tab-container-height, 48px);\n}\n\n.mat-mdc-tab::before {\n  margin: 5px;\n}\n@media (forced-colors: active) {\n  .mat-mdc-tab[aria-disabled=true] {\n    color: GrayText;\n  }\n}\n"]
		}]
	}], null, {
		_items: [{
			type: ContentChildren,
			args: [MatTabLabelWrapper, { descendants: false }]
		}],
		_tabListContainer: [{
			type: ViewChild,
			args: ["tabListContainer", { static: true }]
		}],
		_tabList: [{
			type: ViewChild,
			args: ["tabList", { static: true }]
		}],
		_tabListInner: [{
			type: ViewChild,
			args: ["tabListInner", { static: true }]
		}],
		_nextPaginator: [{
			type: ViewChild,
			args: ["nextPaginator"]
		}],
		_previousPaginator: [{
			type: ViewChild,
			args: ["previousPaginator"]
		}],
		ariaLabel: [{
			type: Input,
			args: ["aria-label"]
		}],
		ariaLabelledby: [{
			type: Input,
			args: ["aria-labelledby"]
		}],
		disableRipple: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}]
	});
})();
var MAT_TABS_CONFIG = new InjectionToken("MAT_TABS_CONFIG");
var MatTabBodyPortal = class MatTabBodyPortal extends CdkPortalOutlet {
	_host = inject(MatTabBody);
	_ngZone = inject(NgZone);
	_centeringSub = Subscription.EMPTY;
	_leavingSub = Subscription.EMPTY;
	ngOnInit() {
		super.ngOnInit();
		this._centeringSub = this._host._beforeCentering.pipe(startWith(this._host._isCenterPosition())).subscribe((isCentering) => {
			if (this._host._content && isCentering && !this.hasAttached()) this._ngZone.run(() => {
				Promise.resolve().then();
				this.attach(this._host._content);
			});
		});
		this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
			if (!this._host.preserveContent) this._ngZone.run(() => this.detach());
		});
	}
	ngOnDestroy() {
		super.ngOnDestroy();
		this._centeringSub.unsubscribe();
		this._leavingSub.unsubscribe();
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMatTabBodyPortal_BaseFactory = void 0;
		return function MatTabBodyPortal_Factory(__ngFactoryType__) {
			return (ɵMatTabBodyPortal_BaseFactory || (ɵMatTabBodyPortal_BaseFactory = ɵɵgetInheritedFactory(MatTabBodyPortal)))(__ngFactoryType__ || MatTabBodyPortal);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatTabBodyPortal,
		selectors: [[
			"",
			"matTabBodyHost",
			""
		]],
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabBodyPortal, [{
		type: Directive,
		args: [{ selector: "[matTabBodyHost]" }]
	}], null, null);
})();
var MatTabBody = class MatTabBody {
	_elementRef = inject(ElementRef);
	_dir = inject(Directionality, { optional: true });
	_ngZone = inject(NgZone);
	_injector = inject(Injector);
	_renderer = inject(Renderer2);
	_diAnimationsDisabled = _animationsDisabled();
	_eventCleanups;
	_initialized = false;
	_fallbackTimer;
	_positionIndex;
	_dirChangeSubscription = Subscription.EMPTY;
	_position;
	_previousPosition;
	_onCentering = new EventEmitter();
	_beforeCentering = new EventEmitter();
	_afterLeavingCenter = new EventEmitter();
	_onCentered = new EventEmitter(true);
	_portalHost;
	_contentElement;
	_content;
	animationDuration = "500ms";
	preserveContent = false;
	set position(position) {
		this._positionIndex = position;
		this._computePositionAnimationState();
	}
	constructor() {
		if (this._dir) {
			const changeDetectorRef = inject(ChangeDetectorRef);
			this._dirChangeSubscription = this._dir.change.subscribe((dir) => {
				this._computePositionAnimationState(dir);
				changeDetectorRef.markForCheck();
			});
		}
	}
	ngOnInit() {
		this._bindTransitionEvents();
		if (this._position === "center") {
			this._setActiveClass(true);
			afterNextRender(() => this._onCentering.emit(this._elementRef.nativeElement.clientHeight), { injector: this._injector });
		}
		this._initialized = true;
	}
	ngOnDestroy() {
		clearTimeout(this._fallbackTimer);
		this._eventCleanups?.forEach((cleanup) => cleanup());
		this._dirChangeSubscription.unsubscribe();
	}
	_bindTransitionEvents() {
		this._ngZone.runOutsideAngular(() => {
			const element = this._elementRef.nativeElement;
			const transitionDone = (event) => {
				if (event.target === this._contentElement?.nativeElement) {
					this._elementRef.nativeElement.classList.remove("mat-tab-body-animating");
					if (event.type === "transitionend") this._transitionDone();
				}
			};
			this._eventCleanups = [
				this._renderer.listen(element, "transitionstart", (event) => {
					if (event.target === this._contentElement?.nativeElement) {
						this._elementRef.nativeElement.classList.add("mat-tab-body-animating");
						this._transitionStarted();
					}
				}),
				this._renderer.listen(element, "transitionend", transitionDone),
				this._renderer.listen(element, "transitioncancel", transitionDone)
			];
		});
	}
	_transitionStarted() {
		clearTimeout(this._fallbackTimer);
		const isCentering = this._position === "center";
		this._beforeCentering.emit(isCentering);
		if (isCentering) this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
	}
	_transitionDone() {
		if (this._position === "center") this._onCentered.emit();
		else if (this._previousPosition === "center") this._afterLeavingCenter.emit();
	}
	_setActiveClass(isActive) {
		this._elementRef.nativeElement.classList.toggle("mat-mdc-tab-body-active", isActive);
	}
	_getLayoutDirection() {
		return this._dir && this._dir.value === "rtl" ? "rtl" : "ltr";
	}
	_isCenterPosition() {
		return this._positionIndex === 0;
	}
	_computePositionAnimationState(dir = this._getLayoutDirection()) {
		this._previousPosition = this._position;
		if (this._positionIndex < 0) this._position = dir == "ltr" ? "left" : "right";
		else if (this._positionIndex > 0) this._position = dir == "ltr" ? "right" : "left";
		else this._position = "center";
		if (this._animationsDisabled()) this._simulateTransitionEvents();
		else if (this._initialized && (this._position === "center" || this._previousPosition === "center")) {
			clearTimeout(this._fallbackTimer);
			this._fallbackTimer = this._ngZone.runOutsideAngular(() => setTimeout(() => this._simulateTransitionEvents(), 100));
		}
	}
	_simulateTransitionEvents() {
		this._transitionStarted();
		afterNextRender(() => this._transitionDone(), { injector: this._injector });
	}
	_animationsDisabled() {
		return this._diAnimationsDisabled || this.animationDuration === "0ms" || this.animationDuration === "0s";
	}
	static ɵfac = function MatTabBody_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabBody)();
	};
	static ɵcmp = (function() {
		const _c0 = ["content"];
		function MatTabBody_ng_template_2_Template(rf, ctx) {}
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabBody,
			selectors: [["mat-tab-body"]],
			viewQuery: function MatTabBody_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(MatTabBodyPortal, 5)(_c0, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._portalHost = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._contentElement = _t.first);
				}
			},
			hostAttrs: [1, "mat-mdc-tab-body"],
			hostVars: 1,
			hostBindings: function MatTabBody_HostBindings(rf, ctx) {
				if (rf & 2) ɵɵattribute("inert", ctx._position === "center" ? null : "");
			},
			inputs: {
				_content: [
					0,
					"content",
					"_content"
				],
				animationDuration: "animationDuration",
				preserveContent: "preserveContent",
				position: "position"
			},
			outputs: {
				_onCentering: "_onCentering",
				_beforeCentering: "_beforeCentering",
				_onCentered: "_onCentered"
			},
			decls: 3,
			vars: 6,
			consts: [
				["content", ""],
				[
					"cdkScrollable",
					"",
					1,
					"mat-mdc-tab-body-content"
				],
				["matTabBodyHost", ""]
			],
			template: function MatTabBody_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵelementStart(0, "div", 1, 0);
					ɵɵtemplate(2, MatTabBody_ng_template_2_Template, 0, 0, "ng-template", 2);
					ɵɵelementEnd();
				}
				if (rf & 2) ɵɵclassProp("mat-tab-body-content-left", ctx._position === "left")("mat-tab-body-content-right", ctx._position === "right")("mat-tab-body-content-can-animate", ctx._position === "center" || ctx._previousPosition === "center");
			},
			dependencies: [MatTabBodyPortal, CdkScrollable],
			styles: [".mat-mdc-tab-body {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  display: block;\n  overflow: hidden;\n  outline: 0;\n  flex-basis: 100%;\n}\n.mat-mdc-tab-body.mat-mdc-tab-body-active {\n  position: relative;\n  overflow-x: hidden;\n  overflow-y: auto;\n  z-index: 1;\n  flex-grow: 1;\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active {\n  overflow-y: hidden;\n}\n\n.mat-mdc-tab-body-content {\n  height: 100%;\n  overflow: auto;\n  transform: none;\n  visibility: hidden;\n}\n.mat-tab-body-animating > .mat-mdc-tab-body-content, .mat-mdc-tab-body-active > .mat-mdc-tab-body-content {\n  visibility: visible;\n}\n.mat-tab-body-animating > .mat-mdc-tab-body-content {\n  min-height: 1px;\n}\n.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content {\n  overflow: hidden;\n}\n\n.mat-tab-body-content-can-animate {\n  transition: transform var(--%NS%mat-tab-body-animation-duration) 1ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n.mat-mdc-tab-body-wrapper._mat-animation-noopable .mat-tab-body-content-can-animate {\n  transition: none;\n}\n\n.mat-tab-body-content-left {\n  transform: translate3d(-100%, 0, 0);\n}\n\n.mat-tab-body-content-right {\n  transform: translate3d(100%, 0, 0);\n}\n"],
			encapsulation: 2,
			changeDetection: 1
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabBody, [{
		type: Component,
		args: [{
			selector: "mat-tab-body",
			encapsulation: ViewEncapsulation.None,
			changeDetection: ChangeDetectionStrategy.Eager,
			host: {
				"class": "mat-mdc-tab-body",
				"[attr.inert]": "_position === \"center\" ? null : \"\""
			},
			imports: [MatTabBodyPortal, CdkScrollable],
			template: "<div\n   class=\"mat-mdc-tab-body-content\"\n   #content\n   cdkScrollable\n   [class.mat-tab-body-content-left]=\"_position === 'left'\"\n   [class.mat-tab-body-content-right]=\"_position === 'right'\"\n   [class.mat-tab-body-content-can-animate]=\"_position === 'center' || _previousPosition === 'center'\">\n  <ng-template matTabBodyHost></ng-template>\n</div>\n",
			styles: [".mat-mdc-tab-body {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  display: block;\n  overflow: hidden;\n  outline: 0;\n  flex-basis: 100%;\n}\n.mat-mdc-tab-body.mat-mdc-tab-body-active {\n  position: relative;\n  overflow-x: hidden;\n  overflow-y: auto;\n  z-index: 1;\n  flex-grow: 1;\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active {\n  overflow-y: hidden;\n}\n\n.mat-mdc-tab-body-content {\n  height: 100%;\n  overflow: auto;\n  transform: none;\n  visibility: hidden;\n}\n.mat-tab-body-animating > .mat-mdc-tab-body-content, .mat-mdc-tab-body-active > .mat-mdc-tab-body-content {\n  visibility: visible;\n}\n.mat-tab-body-animating > .mat-mdc-tab-body-content {\n  min-height: 1px;\n}\n.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content {\n  overflow: hidden;\n}\n\n.mat-tab-body-content-can-animate {\n  transition: transform var(--mat-tab-body-animation-duration) 1ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n.mat-mdc-tab-body-wrapper._mat-animation-noopable .mat-tab-body-content-can-animate {\n  transition: none;\n}\n\n.mat-tab-body-content-left {\n  transform: translate3d(-100%, 0, 0);\n}\n\n.mat-tab-body-content-right {\n  transform: translate3d(100%, 0, 0);\n}\n"]
		}]
	}], () => [], {
		_onCentering: [{ type: Output }],
		_beforeCentering: [{ type: Output }],
		_onCentered: [{ type: Output }],
		_portalHost: [{
			type: ViewChild,
			args: [MatTabBodyPortal]
		}],
		_contentElement: [{
			type: ViewChild,
			args: ["content"]
		}],
		_content: [{
			type: Input,
			args: ["content"]
		}],
		animationDuration: [{ type: Input }],
		preserveContent: [{ type: Input }],
		position: [{ type: Input }]
	});
})();
var MatTabGroup = class MatTabGroup {
	_elementRef = inject(ElementRef);
	_changeDetectorRef = inject(ChangeDetectorRef);
	_ngZone = inject(NgZone);
	_tabsSubscription = Subscription.EMPTY;
	_tabLabelSubscription = Subscription.EMPTY;
	_tabBodySubscription = Subscription.EMPTY;
	_diAnimationsDisabled = _animationsDisabled();
	_bodyAnimationDuration;
	_headerAnimationDuration;
	_allTabs;
	_tabBodies;
	_tabBodyWrapper;
	_tabHeader;
	_tabs = new QueryList();
	_indexToSelect = 0;
	_lastFocusedTabIndex = null;
	_tabBodyWrapperHeight = 0;
	color;
	get fitInkBarToContent() {
		return this._fitInkBarToContent;
	}
	set fitInkBarToContent(value) {
		this._fitInkBarToContent = value;
		this._changeDetectorRef.markForCheck();
	}
	_fitInkBarToContent = false;
	stretchTabs = true;
	alignTabs = null;
	dynamicHeight = false;
	get selectedIndex() {
		return this._selectedIndex;
	}
	set selectedIndex(value) {
		this._indexToSelect = isNaN(value) ? null : value;
	}
	_selectedIndex = null;
	headerPosition = "above";
	get animationDuration() {
		return this._animationDuration;
	}
	set animationDuration(value) {
		this._animationDuration = value;
		if (value && typeof value === "object") {
			this._bodyAnimationDuration = normalizeDuration(value.body);
			this._headerAnimationDuration = normalizeDuration(value.header);
		} else this._headerAnimationDuration = this._bodyAnimationDuration = normalizeDuration(value);
	}
	_animationDuration;
	get contentTabIndex() {
		return this._contentTabIndex;
	}
	set contentTabIndex(value) {
		this._contentTabIndex = isNaN(value) ? null : value;
	}
	_contentTabIndex = null;
	disablePagination = false;
	disableRipple = false;
	preserveContent = false;
	get backgroundColor() {
		return this._backgroundColor;
	}
	set backgroundColor(value) {
		const classList = this._elementRef.nativeElement.classList;
		classList.remove("mat-tabs-with-background", `mat-background-${this.backgroundColor}`);
		if (value) classList.add("mat-tabs-with-background", `mat-background-${value}`);
		this._backgroundColor = value;
	}
	_backgroundColor;
	ariaLabel;
	ariaLabelledby;
	selectedIndexChange = new EventEmitter();
	focusChange = new EventEmitter();
	animationDone = new EventEmitter();
	selectedTabChange = new EventEmitter(true);
	_groupId;
	_isServer = !inject(Platform).isBrowser;
	constructor() {
		const defaultConfig = inject(MAT_TABS_CONFIG, { optional: true });
		this._groupId = inject(_IdGenerator).getId("mat-tab-group-");
		this.animationDuration = defaultConfig && defaultConfig.animationDuration ? defaultConfig.animationDuration : "500ms";
		this.disablePagination = defaultConfig && defaultConfig.disablePagination != null ? defaultConfig.disablePagination : false;
		this.dynamicHeight = defaultConfig && defaultConfig.dynamicHeight != null ? defaultConfig.dynamicHeight : false;
		if (defaultConfig?.contentTabIndex != null) this.contentTabIndex = defaultConfig.contentTabIndex;
		this.preserveContent = !!defaultConfig?.preserveContent;
		this.fitInkBarToContent = defaultConfig && defaultConfig.fitInkBarToContent != null ? defaultConfig.fitInkBarToContent : false;
		this.stretchTabs = defaultConfig && defaultConfig.stretchTabs != null ? defaultConfig.stretchTabs : true;
		this.alignTabs = defaultConfig && defaultConfig.alignTabs != null ? defaultConfig.alignTabs : null;
	}
	ngAfterContentChecked() {
		const indexToSelect = this._indexToSelect = this._clampTabIndex(this._indexToSelect);
		if (this._selectedIndex != indexToSelect) {
			const isFirstRun = this._selectedIndex == null;
			if (!isFirstRun) {
				this.selectedTabChange.emit(this._createChangeEvent(indexToSelect));
				const wrapper = this._tabBodyWrapper.nativeElement;
				wrapper.style.minHeight = wrapper.clientHeight + "px";
			}
			Promise.resolve().then(() => {
				this._tabs.forEach((tab, index) => tab.isActive = index === indexToSelect);
				if (!isFirstRun) {
					this.selectedIndexChange.emit(indexToSelect);
					this._tabBodyWrapper.nativeElement.style.minHeight = "";
				}
			});
		}
		this._tabs.forEach((tab, index) => {
			tab.position = index - indexToSelect;
			if (this._selectedIndex != null && tab.position == 0 && !tab.origin) tab.origin = indexToSelect - this._selectedIndex;
		});
		if (this._selectedIndex !== indexToSelect) {
			this._selectedIndex = indexToSelect;
			this._lastFocusedTabIndex = null;
			this._changeDetectorRef.markForCheck();
		}
	}
	ngAfterContentInit() {
		this._subscribeToAllTabChanges();
		this._subscribeToTabLabels();
		this._tabsSubscription = this._tabs.changes.subscribe(() => {
			const indexToSelect = this._clampTabIndex(this._indexToSelect);
			if (indexToSelect === this._selectedIndex) {
				const tabs = this._tabs.toArray();
				let selectedTab;
				for (let i = 0; i < tabs.length; i++) if (tabs[i].isActive) {
					this._indexToSelect = this._selectedIndex = i;
					this._lastFocusedTabIndex = null;
					selectedTab = tabs[i];
					break;
				}
				if (!selectedTab && tabs[indexToSelect]) Promise.resolve().then(() => {
					tabs[indexToSelect].isActive = true;
					this.selectedTabChange.emit(this._createChangeEvent(indexToSelect));
				});
			}
			this._changeDetectorRef.markForCheck();
		});
	}
	ngAfterViewInit() {
		this._tabBodySubscription = this._tabBodies.changes.subscribe(() => this._bodyCentered(true));
	}
	_subscribeToAllTabChanges() {
		this._allTabs.changes.pipe(startWith(this._allTabs)).subscribe((tabs) => {
			this._tabs.reset(tabs.filter((tab) => {
				return tab._closestTabGroup === this || !tab._closestTabGroup;
			}));
			this._tabs.notifyOnChanges();
		});
	}
	ngOnDestroy() {
		this._tabs.destroy();
		this._tabsSubscription.unsubscribe();
		this._tabLabelSubscription.unsubscribe();
		this._tabBodySubscription.unsubscribe();
	}
	realignInkBar() {
		if (this._tabHeader) this._tabHeader._alignInkBarToSelectedTab();
	}
	updatePagination() {
		if (this._tabHeader) this._tabHeader.updatePagination();
	}
	focusTab(index) {
		const header = this._tabHeader;
		if (header) header.focusIndex = index;
	}
	_focusChanged(index) {
		this._lastFocusedTabIndex = index;
		this.focusChange.emit(this._createChangeEvent(index));
	}
	_createChangeEvent(index) {
		const event = new MatTabChangeEvent();
		event.index = index;
		if (this._tabs && this._tabs.length) event.tab = this._tabs.toArray()[index];
		return event;
	}
	_subscribeToTabLabels() {
		if (this._tabLabelSubscription) this._tabLabelSubscription.unsubscribe();
		this._tabLabelSubscription = merge(...this._tabs.map((tab) => tab._stateChanges)).subscribe(() => this._changeDetectorRef.markForCheck());
	}
	_clampTabIndex(index) {
		return Math.min(this._tabs.length - 1, Math.max(index || 0, 0));
	}
	_getTabLabelId(tab, index) {
		return tab.id || `${this._groupId}-label-${index}`;
	}
	_getTabContentId(index) {
		return `${this._groupId}-content-${index}`;
	}
	_setTabBodyWrapperHeight(tabHeight) {
		if (!this.dynamicHeight || !this._tabBodyWrapperHeight) {
			this._tabBodyWrapperHeight = tabHeight;
			return;
		}
		const wrapper = this._tabBodyWrapper.nativeElement;
		wrapper.style.height = this._tabBodyWrapperHeight + "px";
		if (this._tabBodyWrapper.nativeElement.offsetHeight) wrapper.style.height = tabHeight + "px";
	}
	_removeTabBodyWrapperHeight() {
		const wrapper = this._tabBodyWrapper.nativeElement;
		this._tabBodyWrapperHeight = wrapper.clientHeight;
		wrapper.style.height = "";
		this._ngZone.run(() => this.animationDone.emit());
	}
	_handleClick(tab, tabHeader, index) {
		tabHeader.focusIndex = index;
		if (!tab.disabled) this.selectedIndex = index;
	}
	_getTabIndex(index) {
		return index === (this._lastFocusedTabIndex ?? this.selectedIndex) ? 0 : -1;
	}
	_tabFocusChanged(focusOrigin, index) {
		if (focusOrigin && focusOrigin !== "mouse" && focusOrigin !== "touch") this._tabHeader.focusIndex = index;
	}
	_bodyCentered(isCenter) {
		if (isCenter) this._tabBodies?.forEach((body, i) => body._setActiveClass(i === this._selectedIndex));
	}
	_bodyAnimationsDisabled() {
		return this._diAnimationsDisabled || this._bodyAnimationDuration === "0" || this._bodyAnimationDuration === "0ms";
	}
	static ɵfac = function MatTabGroup_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabGroup)();
	};
	static ɵcmp = (function() {
		const _c0 = ["tabBodyWrapper"];
		const _c1 = ["tabHeader"];
		const _c2 = ["*"];
		function MatTabGroup_For_3_Conditional_6_ng_template_0_Template(rf, ctx) {}
		function MatTabGroup_For_3_Conditional_6_Template(rf, ctx) {
			if (rf & 1) ɵɵtemplate(0, MatTabGroup_For_3_Conditional_6_ng_template_0_Template, 0, 0, "ng-template", 12);
			if (rf & 2) {
				const tab_r3 = ɵɵnextContext().$implicit;
				ɵɵproperty("cdkPortalOutlet", tab_r3.templateLabel);
			}
		}
		function MatTabGroup_For_3_Conditional_7_Template(rf, ctx) {
			if (rf & 1) ɵɵtext(0);
			if (rf & 2) {
				const tab_r3 = ɵɵnextContext().$implicit;
				ɵɵtextInterpolate(tab_r3.textLabel);
			}
		}
		function MatTabGroup_For_3_Template(rf, ctx) {
			if (rf & 1) {
				const _r1 = ɵɵgetCurrentView();
				ɵɵelementStart(0, "div", 7, 2);
				ɵɵlistener("click", function MatTabGroup_For_3_Template_div_click_0_listener() {
					const ctx_r1 = ɵɵrestoreView(_r1);
					const tab_r3 = ctx_r1.$implicit;
					const $index_r4 = ctx_r1.$index;
					const ctx_r4 = ɵɵnextContext();
					const tabHeader_r6 = ɵɵreference(1);
					return ɵɵresetView(ctx_r4._handleClick(tab_r3, tabHeader_r6, $index_r4));
				})("cdkFocusChange", function MatTabGroup_For_3_Template_div_cdkFocusChange_0_listener($event) {
					const $index_r4 = ɵɵrestoreView(_r1).$index;
					const ctx_r4 = ɵɵnextContext();
					return ɵɵresetView(ctx_r4._tabFocusChanged($event, $index_r4));
				});
				ɵɵelement(2, "span", 8)(3, "div", 9);
				ɵɵelementStart(4, "span", 10)(5, "span", 11);
				ɵɵconditionalCreate(6, MatTabGroup_For_3_Conditional_6_Template, 1, 1, null, 12)(7, MatTabGroup_For_3_Conditional_7_Template, 1, 1);
				ɵɵelementEnd()()();
			}
			if (rf & 2) {
				const tab_r3 = ctx.$implicit;
				const $index_r4 = ctx.$index;
				const tabNode_r7 = ɵɵreference(1);
				const ctx_r4 = ɵɵnextContext();
				ɵɵclassMap(tab_r3.labelClass);
				ɵɵclassProp("mdc-tab--active", ctx_r4.selectedIndex === $index_r4);
				ɵɵproperty("id", ctx_r4._getTabLabelId(tab_r3, $index_r4))("disabled", tab_r3.disabled)("fitInkBarToContent", ctx_r4.fitInkBarToContent);
				ɵɵattribute("tabIndex", ctx_r4._getTabIndex($index_r4))("aria-posinset", $index_r4 + 1)("aria-setsize", ctx_r4._tabs.length)("aria-controls", ctx_r4._getTabContentId($index_r4))("aria-selected", ctx_r4.selectedIndex === $index_r4)("aria-label", tab_r3.ariaLabel || null)("aria-labelledby", !tab_r3.ariaLabel && tab_r3.ariaLabelledby ? tab_r3.ariaLabelledby : null);
				ɵɵadvance(3);
				ɵɵproperty("matRippleTrigger", tabNode_r7)("matRippleDisabled", tab_r3.disabled || ctx_r4.disableRipple);
				ɵɵadvance(3);
				ɵɵconditional(tab_r3.templateLabel ? 6 : 7);
			}
		}
		function MatTabGroup_Conditional_4_Template(rf, ctx) {
			if (rf & 1) ɵɵprojection(0);
		}
		function MatTabGroup_For_8_Template(rf, ctx) {
			if (rf & 1) {
				const _r8 = ɵɵgetCurrentView();
				ɵɵelementStart(0, "mat-tab-body", 13);
				ɵɵlistener("_onCentered", function MatTabGroup_For_8_Template_mat_tab_body__onCentered_0_listener() {
					ɵɵrestoreView(_r8);
					const ctx_r4 = ɵɵnextContext();
					return ɵɵresetView(ctx_r4._removeTabBodyWrapperHeight());
				})("_onCentering", function MatTabGroup_For_8_Template_mat_tab_body__onCentering_0_listener($event) {
					ɵɵrestoreView(_r8);
					const ctx_r4 = ɵɵnextContext();
					return ɵɵresetView(ctx_r4._setTabBodyWrapperHeight($event));
				})("_beforeCentering", function MatTabGroup_For_8_Template_mat_tab_body__beforeCentering_0_listener($event) {
					ɵɵrestoreView(_r8);
					const ctx_r4 = ɵɵnextContext();
					return ɵɵresetView(ctx_r4._bodyCentered($event));
				});
				ɵɵelementEnd();
			}
			if (rf & 2) {
				const tab_r9 = ctx.$implicit;
				const $index_r10 = ctx.$index;
				const ctx_r4 = ɵɵnextContext();
				ɵɵclassMap(tab_r9.bodyClass);
				ɵɵproperty("id", ctx_r4._getTabContentId($index_r10))("content", tab_r9.content)("position", tab_r9.position)("animationDuration", ctx_r4._bodyAnimationDuration)("preserveContent", ctx_r4.preserveContent);
				ɵɵattribute("tabindex", ctx_r4.contentTabIndex != null && ctx_r4.selectedIndex === $index_r10 ? ctx_r4.contentTabIndex : null)("aria-labelledby", ctx_r4._getTabLabelId(tab_r9, $index_r10))("aria-hidden", ctx_r4.selectedIndex !== $index_r10);
			}
		}
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabGroup,
			selectors: [["mat-tab-group"]],
			contentQueries: function MatTabGroup_ContentQueries(rf, ctx, dirIndex) {
				if (rf & 1) ɵɵcontentQuery(dirIndex, MatTab, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._allTabs = _t);
				}
			},
			viewQuery: function MatTabGroup_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(_c0, 5)(_c1, 5)(MatTabBody, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabBodyWrapper = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabHeader = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabBodies = _t);
				}
			},
			hostAttrs: [1, "mat-mdc-tab-group"],
			hostVars: 13,
			hostBindings: function MatTabGroup_HostBindings(rf, ctx) {
				if (rf & 2) {
					ɵɵattribute("mat-align-tabs", ctx.alignTabs);
					ɵɵclassMap("mat-" + (ctx.color || "primary"));
					ɵɵstyleProp("--%NS%mat-tab-body-animation-duration", ctx._bodyAnimationDuration)("--%NS%mat-tab-header-animation-duration", ctx._headerAnimationDuration);
					ɵɵclassProp("mat-mdc-tab-group-dynamic-height", ctx.dynamicHeight)("mat-mdc-tab-group-inverted-header", ctx.headerPosition === "below")("mat-mdc-tab-group-stretch-tabs", ctx.stretchTabs);
				}
			},
			inputs: {
				color: "color",
				fitInkBarToContent: [
					2,
					"fitInkBarToContent",
					"fitInkBarToContent",
					booleanAttribute
				],
				stretchTabs: [
					2,
					"mat-stretch-tabs",
					"stretchTabs",
					booleanAttribute
				],
				alignTabs: [
					0,
					"mat-align-tabs",
					"alignTabs"
				],
				dynamicHeight: [
					2,
					"dynamicHeight",
					"dynamicHeight",
					booleanAttribute
				],
				selectedIndex: [
					2,
					"selectedIndex",
					"selectedIndex",
					numberAttribute
				],
				headerPosition: "headerPosition",
				animationDuration: "animationDuration",
				contentTabIndex: [
					2,
					"contentTabIndex",
					"contentTabIndex",
					numberAttribute
				],
				disablePagination: [
					2,
					"disablePagination",
					"disablePagination",
					booleanAttribute
				],
				disableRipple: [
					2,
					"disableRipple",
					"disableRipple",
					booleanAttribute
				],
				preserveContent: [
					2,
					"preserveContent",
					"preserveContent",
					booleanAttribute
				],
				backgroundColor: "backgroundColor",
				ariaLabel: [
					0,
					"aria-label",
					"ariaLabel"
				],
				ariaLabelledby: [
					0,
					"aria-labelledby",
					"ariaLabelledby"
				]
			},
			outputs: {
				selectedIndexChange: "selectedIndexChange",
				focusChange: "focusChange",
				animationDone: "animationDone",
				selectedTabChange: "selectedTabChange"
			},
			exportAs: ["matTabGroup"],
			features: [ɵɵProvidersFeature([{
				provide: MAT_TAB_GROUP,
				useExisting: MatTabGroup
			}])],
			ngContentSelectors: _c2,
			decls: 9,
			vars: 8,
			consts: [
				["tabHeader", ""],
				["tabBodyWrapper", ""],
				["tabNode", ""],
				[
					3,
					"indexFocused",
					"selectFocusedIndex",
					"selectedIndex",
					"disableRipple",
					"disablePagination",
					"aria-label",
					"aria-labelledby"
				],
				[
					"role",
					"tab",
					"matTabLabelWrapper",
					"",
					"cdkMonitorElementFocus",
					"",
					1,
					"mdc-tab",
					"mat-mdc-tab",
					"mat-focus-indicator",
					3,
					"id",
					"mdc-tab--active",
					"class",
					"disabled",
					"fitInkBarToContent"
				],
				[1, "mat-mdc-tab-body-wrapper"],
				[
					"role",
					"tabpanel",
					3,
					"id",
					"class",
					"content",
					"position",
					"animationDuration",
					"preserveContent"
				],
				[
					"role",
					"tab",
					"matTabLabelWrapper",
					"",
					"cdkMonitorElementFocus",
					"",
					1,
					"mdc-tab",
					"mat-mdc-tab",
					"mat-focus-indicator",
					3,
					"click",
					"cdkFocusChange",
					"id",
					"disabled",
					"fitInkBarToContent"
				],
				[1, "mdc-tab__ripple"],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-ripple",
					3,
					"matRippleTrigger",
					"matRippleDisabled"
				],
				[1, "mdc-tab__content"],
				[1, "mdc-tab__text-label"],
				[3, "cdkPortalOutlet"],
				[
					"role",
					"tabpanel",
					3,
					"_onCentered",
					"_onCentering",
					"_beforeCentering",
					"id",
					"content",
					"position",
					"animationDuration",
					"preserveContent"
				]
			],
			template: function MatTabGroup_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵelementStart(0, "mat-tab-header", 3, 0);
					ɵɵlistener("indexFocused", function MatTabGroup_Template_mat_tab_header_indexFocused_0_listener($event) {
						return ctx._focusChanged($event);
					})("selectFocusedIndex", function MatTabGroup_Template_mat_tab_header_selectFocusedIndex_0_listener($event) {
						return ctx.selectedIndex = $event;
					});
					ɵɵrepeaterCreate(2, MatTabGroup_For_3_Template, 8, 17, "div", 4, ɵɵrepeaterTrackByIdentity);
					ɵɵelementEnd();
					ɵɵconditionalCreate(4, MatTabGroup_Conditional_4_Template, 1, 0);
					ɵɵelementStart(5, "div", 5, 1);
					ɵɵrepeaterCreate(7, MatTabGroup_For_8_Template, 1, 10, "mat-tab-body", 6, ɵɵrepeaterTrackByIdentity);
					ɵɵelementEnd();
				}
				if (rf & 2) {
					ɵɵproperty("selectedIndex", ctx.selectedIndex || 0)("disableRipple", ctx.disableRipple)("disablePagination", ctx.disablePagination);
					ɵɵariaProperty("aria-label", ctx.ariaLabel)("aria-labelledby", ctx.ariaLabelledby);
					ɵɵadvance(2);
					ɵɵrepeater(ctx._tabs);
					ɵɵadvance(2);
					ɵɵconditional(ctx._isServer ? 4 : -1);
					ɵɵadvance();
					ɵɵclassProp("_mat-animation-noopable", ctx._bodyAnimationsDisabled());
					ɵɵadvance(2);
					ɵɵrepeater(ctx._tabs);
				}
			},
			dependencies: [
				MatTabHeader,
				MatTabLabelWrapper,
				CdkMonitorFocus,
				MatRipple,
				CdkPortalOutlet,
				MatTabBody
			],
			styles: [".mdc-tab {\n  min-width: 90px;\n  padding: 0 24px;\n  display: flex;\n  flex: 1 0 auto;\n  justify-content: center;\n  box-sizing: border-box;\n  border: none;\n  outline: none;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 1;\n  touch-action: manipulation;\n}\n\n.mdc-tab__content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: inherit;\n  pointer-events: none;\n}\n\n.mdc-tab__text-label {\n  transition: 150ms color linear;\n  display: inline-block;\n  line-height: 1;\n  z-index: 2;\n}\n\n.mdc-tab--active .mdc-tab__text-label {\n  transition-delay: 100ms;\n}\n\n._mat-animation-noopable .mdc-tab__text-label {\n  transition: none;\n}\n\n.mdc-tab-indicator {\n  display: flex;\n  position: absolute;\n  top: 0;\n  left: 0;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.mdc-tab-indicator__content {\n  transition: var(--%NS%mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);\n  transform-origin: left;\n  opacity: 0;\n}\n\n.mdc-tab-indicator__content--underline {\n  align-self: flex-end;\n  box-sizing: border-box;\n  width: 100%;\n  border-top-style: solid;\n}\n\n.mdc-tab-indicator--active .mdc-tab-indicator__content {\n  opacity: 1;\n}\n\n._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {\n  transition: none;\n}\n\n.mat-mdc-tab-ripple.mat-mdc-tab-ripple {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  pointer-events: none;\n}\n\n.mat-mdc-tab {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-decoration: none;\n  background: none;\n  height: var(--%NS%mat-tab-container-height, 48px);\n  font-family: var(--%NS%mat-tab-label-text-font, var(--%NS%mat-sys-title-small-font));\n  font-size: var(--%NS%mat-tab-label-text-size, var(--%NS%mat-sys-title-small-size));\n  letter-spacing: var(--%NS%mat-tab-label-text-tracking, var(--%NS%mat-sys-title-small-tracking));\n  line-height: var(--%NS%mat-tab-label-text-line-height, var(--%NS%mat-sys-title-small-line-height));\n  font-weight: var(--%NS%mat-tab-label-text-weight, var(--%NS%mat-sys-title-small-weight));\n}\n.mat-mdc-tab.mdc-tab {\n  flex-grow: 0;\n}\n.mat-mdc-tab .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-indicator-color, var(--%NS%mat-sys-primary));\n  border-top-width: var(--%NS%mat-tab-active-indicator-height, 2px);\n  border-radius: var(--%NS%mat-tab-active-indicator-shape, 0);\n}\n.mat-mdc-tab:hover .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-hover-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab:focus .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-focus-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active .mdc-tab__ripple::before,\n.mat-mdc-tab.mdc-tab--active .mat-ripple-element {\n  background-color: var(--%NS%mat-tab-active-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--%NS%active:hover .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-hover-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--%NS%active:hover .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-hover-indicator-color, var(--%NS%mat-sys-primary));\n}\n.mat-mdc-tab.mdc-tab--%NS%active:focus .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-focus-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--%NS%active:focus .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-focus-indicator-color, var(--%NS%mat-sys-primary));\n}\n.mat-mdc-tab.mat-mdc-tab-disabled {\n  opacity: 0.4;\n  pointer-events: none;\n}\n.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__content {\n  pointer-events: none;\n}\n.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__ripple::before,\n.mat-mdc-tab.mat-mdc-tab-disabled .mat-ripple-element {\n  background-color: var(--%NS%mat-tab-disabled-ripple-color, var(--%NS%mat-sys-on-surface-variant));\n}\n.mat-mdc-tab .mdc-tab__ripple::before {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-label-text-color, var(--%NS%mat-sys-on-surface));\n  display: inline-flex;\n  align-items: center;\n}\n.mat-mdc-tab .mdc-tab__content {\n  position: relative;\n  pointer-events: auto;\n}\n.mat-mdc-tab:hover .mdc-tab__ripple::before {\n  opacity: 0.04;\n}\n.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before {\n  opacity: 0.12;\n}\n.mat-mdc-tab .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs > .mat-mdc-tab-header .mat-mdc-tab {\n  flex-grow: 1;\n}\n\n.mat-mdc-tab-group {\n  display: flex;\n  flex-direction: column;\n  max-width: 100%;\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination {\n  background-color: var(--%NS%mat-tab-background-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-focus-indicator::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mdc-tab__ripple::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {\n  background-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header {\n  flex-direction: column-reverse;\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline {\n  align-self: flex-start;\n}\n\n.mat-mdc-tab-body-wrapper {\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  transition: height 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n.mat-mdc-tab-body-wrapper._mat-animation-noopable {\n  transition: none !important;\n  animation: none !important;\n}\n"],
			encapsulation: 2,
			changeDetection: 1
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabGroup, [{
		type: Component,
		args: [{
			selector: "mat-tab-group",
			exportAs: "matTabGroup",
			encapsulation: ViewEncapsulation.None,
			changeDetection: ChangeDetectionStrategy.Eager,
			providers: [{
				provide: MAT_TAB_GROUP,
				useExisting: MatTabGroup
			}],
			host: {
				"class": "mat-mdc-tab-group",
				"[class]": "\"mat-\" + (color || \"primary\")",
				"[class.mat-mdc-tab-group-dynamic-height]": "dynamicHeight",
				"[class.mat-mdc-tab-group-inverted-header]": "headerPosition === \"below\"",
				"[class.mat-mdc-tab-group-stretch-tabs]": "stretchTabs",
				"[attr.mat-align-tabs]": "alignTabs",
				"[style.--mat-tab-body-animation-duration]": "_bodyAnimationDuration",
				"[style.--mat-tab-header-animation-duration]": "_headerAnimationDuration"
			},
			imports: [
				MatTabHeader,
				MatTabLabelWrapper,
				CdkMonitorFocus,
				MatRipple,
				CdkPortalOutlet,
				MatTabBody
			],
			template: "<mat-tab-header #tabHeader\n                [selectedIndex]=\"selectedIndex || 0\"\n                [disableRipple]=\"disableRipple\"\n                [disablePagination]=\"disablePagination\"\n                [aria-label]=\"ariaLabel\"\n                [aria-labelledby]=\"ariaLabelledby\"\n                (indexFocused)=\"_focusChanged($event)\"\n                (selectFocusedIndex)=\"selectedIndex = $event\">\n\n  @for (tab of _tabs; track tab) {\n    <div class=\"mdc-tab mat-mdc-tab mat-focus-indicator\"\n        #tabNode\n        role=\"tab\"\n        matTabLabelWrapper\n        cdkMonitorElementFocus\n        [id]=\"_getTabLabelId(tab, $index)\"\n        [attr.tabIndex]=\"_getTabIndex($index)\"\n        [attr.aria-posinset]=\"$index + 1\"\n        [attr.aria-setsize]=\"_tabs.length\"\n        [attr.aria-controls]=\"_getTabContentId($index)\"\n        [attr.aria-selected]=\"selectedIndex === $index\"\n        [attr.aria-label]=\"tab.ariaLabel || null\"\n        [attr.aria-labelledby]=\"(!tab.ariaLabel && tab.ariaLabelledby) ? tab.ariaLabelledby : null\"\n        [class.mdc-tab--active]=\"selectedIndex === $index\"\n        [class]=\"tab.labelClass\"\n        [disabled]=\"tab.disabled\"\n        [fitInkBarToContent]=\"fitInkBarToContent\"\n        (click)=\"_handleClick(tab, tabHeader, $index)\"\n        (cdkFocusChange)=\"_tabFocusChanged($event, $index)\">\n      <span class=\"mdc-tab__ripple\"></span>\n\n      <!-- Needs to be a separate element, because we can't put\n          `overflow: hidden` on tab due to the ink bar. -->\n      <div\n        class=\"mat-mdc-tab-ripple\"\n        mat-ripple\n        [matRippleTrigger]=\"tabNode\"\n        [matRippleDisabled]=\"tab.disabled || disableRipple\"></div>\n\n      <span class=\"mdc-tab__content\">\n        <span class=\"mdc-tab__text-label\">\n          <!--\n            If there is a label template, use it, otherwise fall back to the text label.\n            Note that we don't have indentation around the text label, because it adds\n            whitespace around the text which breaks some internal tests.\n          -->\n          @if (tab.templateLabel) {\n            <ng-template [cdkPortalOutlet]=\"tab.templateLabel\"></ng-template>\n          } @else {{{tab.textLabel}}}\n        </span>\n      </span>\n    </div>\n  }\n</mat-tab-header>\n\n<!--\n  We need to project the content somewhere to avoid hydration errors. Some observations:\n  1. This is only necessary on the server.\n  2. We get a hydration error if there aren't any nodes after the `ng-content`.\n  3. We get a hydration error if `ng-content` is wrapped in another element.\n-->\n@if (_isServer) {\n  <ng-content/>\n}\n\n<div\n  class=\"mat-mdc-tab-body-wrapper\"\n  [class._mat-animation-noopable]=\"_bodyAnimationsDisabled()\"\n  #tabBodyWrapper>\n  @for (tab of _tabs; track tab;) {\n    <mat-tab-body role=\"tabpanel\"\n                 [id]=\"_getTabContentId($index)\"\n                 [attr.tabindex]=\"(contentTabIndex != null && selectedIndex === $index) ? contentTabIndex : null\"\n                 [attr.aria-labelledby]=\"_getTabLabelId(tab, $index)\"\n                 [attr.aria-hidden]=\"selectedIndex !== $index\"\n                 [class]=\"tab.bodyClass\"\n                 [content]=\"tab.content!\"\n                 [position]=\"tab.position!\"\n                 [animationDuration]=\"_bodyAnimationDuration\"\n                 [preserveContent]=\"preserveContent\"\n                 (_onCentered)=\"_removeTabBodyWrapperHeight()\"\n                 (_onCentering)=\"_setTabBodyWrapperHeight($event)\"\n                 (_beforeCentering)=\"_bodyCentered($event)\"/>\n  }\n</div>\n",
			styles: [".mdc-tab {\n  min-width: 90px;\n  padding: 0 24px;\n  display: flex;\n  flex: 1 0 auto;\n  justify-content: center;\n  box-sizing: border-box;\n  border: none;\n  outline: none;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 1;\n  touch-action: manipulation;\n}\n\n.mdc-tab__content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: inherit;\n  pointer-events: none;\n}\n\n.mdc-tab__text-label {\n  transition: 150ms color linear;\n  display: inline-block;\n  line-height: 1;\n  z-index: 2;\n}\n\n.mdc-tab--active .mdc-tab__text-label {\n  transition-delay: 100ms;\n}\n\n._mat-animation-noopable .mdc-tab__text-label {\n  transition: none;\n}\n\n.mdc-tab-indicator {\n  display: flex;\n  position: absolute;\n  top: 0;\n  left: 0;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.mdc-tab-indicator__content {\n  transition: var(--mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);\n  transform-origin: left;\n  opacity: 0;\n}\n\n.mdc-tab-indicator__content--underline {\n  align-self: flex-end;\n  box-sizing: border-box;\n  width: 100%;\n  border-top-style: solid;\n}\n\n.mdc-tab-indicator--active .mdc-tab-indicator__content {\n  opacity: 1;\n}\n\n._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {\n  transition: none;\n}\n\n.mat-mdc-tab-ripple.mat-mdc-tab-ripple {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  pointer-events: none;\n}\n\n.mat-mdc-tab {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-decoration: none;\n  background: none;\n  height: var(--mat-tab-container-height, 48px);\n  font-family: var(--mat-tab-label-text-font, var(--mat-sys-title-small-font));\n  font-size: var(--mat-tab-label-text-size, var(--mat-sys-title-small-size));\n  letter-spacing: var(--mat-tab-label-text-tracking, var(--mat-sys-title-small-tracking));\n  line-height: var(--mat-tab-label-text-line-height, var(--mat-sys-title-small-line-height));\n  font-weight: var(--mat-tab-label-text-weight, var(--mat-sys-title-small-weight));\n}\n.mat-mdc-tab.mdc-tab {\n  flex-grow: 0;\n}\n.mat-mdc-tab .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-indicator-color, var(--mat-sys-primary));\n  border-top-width: var(--mat-tab-active-indicator-height, 2px);\n  border-radius: var(--mat-tab-active-indicator-shape, 0);\n}\n.mat-mdc-tab:hover .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-hover-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab:focus .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-focus-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {\n  color: var(--mat-tab-active-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active .mdc-tab__ripple::before,\n.mat-mdc-tab.mdc-tab--active .mat-ripple-element {\n  background-color: var(--mat-tab-active-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active:hover .mdc-tab__text-label {\n  color: var(--mat-tab-active-hover-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active:hover .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-hover-indicator-color, var(--mat-sys-primary));\n}\n.mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label {\n  color: var(--mat-tab-active-focus-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab.mdc-tab--active:focus .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-focus-indicator-color, var(--mat-sys-primary));\n}\n.mat-mdc-tab.mat-mdc-tab-disabled {\n  opacity: 0.4;\n  pointer-events: none;\n}\n.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__content {\n  pointer-events: none;\n}\n.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__ripple::before,\n.mat-mdc-tab.mat-mdc-tab-disabled .mat-ripple-element {\n  background-color: var(--mat-tab-disabled-ripple-color, var(--mat-sys-on-surface-variant));\n}\n.mat-mdc-tab .mdc-tab__ripple::before {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-label-text-color, var(--mat-sys-on-surface));\n  display: inline-flex;\n  align-items: center;\n}\n.mat-mdc-tab .mdc-tab__content {\n  position: relative;\n  pointer-events: auto;\n}\n.mat-mdc-tab:hover .mdc-tab__ripple::before {\n  opacity: 0.04;\n}\n.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before {\n  opacity: 0.12;\n}\n.mat-mdc-tab .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs > .mat-mdc-tab-header .mat-mdc-tab {\n  flex-grow: 1;\n}\n\n.mat-mdc-tab-group {\n  display: flex;\n  flex-direction: column;\n  max-width: 100%;\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination {\n  background-color: var(--mat-tab-background-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label {\n  color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {\n  color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-focus-indicator::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mdc-tab__ripple::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {\n  background-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {\n  color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header {\n  flex-direction: column-reverse;\n}\n.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline {\n  align-self: flex-start;\n}\n\n.mat-mdc-tab-body-wrapper {\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  transition: height 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n.mat-mdc-tab-body-wrapper._mat-animation-noopable {\n  transition: none !important;\n  animation: none !important;\n}\n"]
		}]
	}], () => [], {
		_allTabs: [{
			type: ContentChildren,
			args: [MatTab, { descendants: true }]
		}],
		_tabBodies: [{
			type: ViewChildren,
			args: [MatTabBody]
		}],
		_tabBodyWrapper: [{
			type: ViewChild,
			args: ["tabBodyWrapper"]
		}],
		_tabHeader: [{
			type: ViewChild,
			args: ["tabHeader"]
		}],
		color: [{ type: Input }],
		fitInkBarToContent: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		stretchTabs: [{
			type: Input,
			args: [{
				alias: "mat-stretch-tabs",
				transform: booleanAttribute
			}]
		}],
		alignTabs: [{
			type: Input,
			args: [{ alias: "mat-align-tabs" }]
		}],
		dynamicHeight: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		selectedIndex: [{
			type: Input,
			args: [{ transform: numberAttribute }]
		}],
		headerPosition: [{ type: Input }],
		animationDuration: [{ type: Input }],
		contentTabIndex: [{
			type: Input,
			args: [{ transform: numberAttribute }]
		}],
		disablePagination: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		disableRipple: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		preserveContent: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		backgroundColor: [{ type: Input }],
		ariaLabel: [{
			type: Input,
			args: ["aria-label"]
		}],
		ariaLabelledby: [{
			type: Input,
			args: ["aria-labelledby"]
		}],
		selectedIndexChange: [{ type: Output }],
		focusChange: [{ type: Output }],
		animationDone: [{ type: Output }],
		selectedTabChange: [{ type: Output }]
	});
})();
var MatTabChangeEvent = class {
	index;
	tab;
};
var MatTabNav = class MatTabNav extends MatPaginatedTabHeader {
	_focusedItem = signal(null, ...ngDevMode ? [{ debugName: "_focusedItem" }] : []);
	get fitInkBarToContent() {
		return this._fitInkBarToContent.value;
	}
	set fitInkBarToContent(value) {
		this._fitInkBarToContent.next(value);
		this._changeDetectorRef.markForCheck();
	}
	_fitInkBarToContent = new BehaviorSubject(false);
	stretchTabs = true;
	animationDuration = "";
	_items;
	get backgroundColor() {
		return this._backgroundColor;
	}
	set backgroundColor(value) {
		const classList = this._elementRef.nativeElement.classList;
		classList.remove("mat-tabs-with-background", `mat-background-${this.backgroundColor}`);
		if (value) classList.add("mat-tabs-with-background", `mat-background-${value}`);
		this._backgroundColor = value;
	}
	_backgroundColor;
	get disableRipple() {
		return this._disableRipple();
	}
	set disableRipple(value) {
		this._disableRipple.set(value);
	}
	_disableRipple = signal(false, ...ngDevMode ? [{ debugName: "_disableRipple" }] : []);
	color = "primary";
	tabPanel;
	_tabListContainer;
	_tabList;
	_tabListInner;
	_nextPaginator;
	_previousPaginator;
	_inkBar;
	constructor() {
		const defaultConfig = inject(MAT_TABS_CONFIG, { optional: true });
		super();
		this.disablePagination = defaultConfig && defaultConfig.disablePagination != null ? defaultConfig.disablePagination : false;
		this.fitInkBarToContent = defaultConfig && defaultConfig.fitInkBarToContent != null ? defaultConfig.fitInkBarToContent : false;
		this.stretchTabs = defaultConfig && defaultConfig.stretchTabs != null ? defaultConfig.stretchTabs : true;
	}
	_itemSelected() {}
	ngAfterContentInit() {
		this._inkBar = new MatInkBar(this._items);
		this._items.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => this.updateActiveLink());
		super.ngAfterContentInit();
		this._keyManager.change.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => this._focusedItem.set(this._keyManager?.activeItem || null));
	}
	ngAfterViewInit() {
		if (!this.tabPanel && (typeof ngDevMode === "undefined" || ngDevMode)) throw new Error("A mat-tab-nav-panel must be specified via [tabPanel].");
		super.ngAfterViewInit();
	}
	updateActiveLink() {
		if (!this._items) return;
		const items = this._items.toArray();
		for (let i = 0; i < items.length; i++) if (items[i].active) {
			this.selectedIndex = i;
			if (this.tabPanel) this.tabPanel._activeTabId = items[i].id;
			this._focusedItem.set(items[i]);
			this._changeDetectorRef.markForCheck();
			return;
		}
		this.selectedIndex = -1;
	}
	_getRole() {
		return this.tabPanel ? "tablist" : this._elementRef.nativeElement.getAttribute("role");
	}
	_hasFocus(link) {
		return this._keyManager?.activeItem === link;
	}
	static ɵfac = function MatTabNav_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabNav)();
	};
	static ɵcmp = (function() {
		const _c0 = ["tabListContainer"];
		const _c1 = ["tabList"];
		const _c2 = ["tabListInner"];
		const _c3 = ["nextPaginator"];
		const _c4 = ["previousPaginator"];
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabNav,
			selectors: [[
				"",
				"mat-tab-nav-bar",
				""
			]],
			contentQueries: function MatTabNav_ContentQueries(rf, ctx, dirIndex) {
				if (rf & 1) ɵɵcontentQuery(dirIndex, MatTabLink, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._items = _t);
				}
			},
			viewQuery: function MatTabNav_Query(rf, ctx) {
				if (rf & 1) ɵɵviewQuery(_c0, 7)(_c1, 7)(_c2, 7)(_c3, 5)(_c4, 5);
				if (rf & 2) {
					let _t = void 0;
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabListContainer = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabList = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._tabListInner = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._nextPaginator = _t.first);
					ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._previousPaginator = _t.first);
				}
			},
			hostAttrs: [
				1,
				"mat-mdc-tab-nav-bar",
				"mat-mdc-tab-header"
			],
			hostVars: 17,
			hostBindings: function MatTabNav_HostBindings(rf, ctx) {
				if (rf & 2) {
					ɵɵattribute("role", ctx._getRole());
					ɵɵstyleProp("--%NS%mat-tab-header-animation-duration", ctx.animationDuration);
					ɵɵclassProp("mat-mdc-tab-header-pagination-controls-enabled", ctx._showPaginationControls)("mat-mdc-tab-header-rtl", ctx._getLayoutDirection() == "rtl")("mat-mdc-tab-nav-bar-stretch-tabs", ctx.stretchTabs)("mat-primary", ctx.color !== "warn" && ctx.color !== "accent")("mat-accent", ctx.color === "accent")("mat-warn", ctx.color === "warn")("_mat-animation-noopable", ctx._animationsDisabled);
				}
			},
			inputs: {
				fitInkBarToContent: [
					2,
					"fitInkBarToContent",
					"fitInkBarToContent",
					booleanAttribute
				],
				stretchTabs: [
					2,
					"mat-stretch-tabs",
					"stretchTabs",
					booleanAttribute
				],
				animationDuration: [
					2,
					"animationDuration",
					"animationDuration",
					normalizeDuration
				],
				backgroundColor: "backgroundColor",
				disableRipple: [
					2,
					"disableRipple",
					"disableRipple",
					booleanAttribute
				],
				color: "color",
				tabPanel: "tabPanel"
			},
			exportAs: ["matTabNavBar", "matTabNav"],
			features: [ɵɵInheritDefinitionFeature],
			ngContentSelectors: ["*"],
			decls: 13,
			vars: 6,
			consts: [
				["previousPaginator", ""],
				["tabListContainer", ""],
				["tabList", ""],
				["tabListInner", ""],
				["nextPaginator", ""],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-header-pagination",
					"mat-mdc-tab-header-pagination-before",
					3,
					"click",
					"mousedown",
					"touchend",
					"matRippleDisabled"
				],
				[1, "mat-mdc-tab-header-pagination-chevron"],
				[
					1,
					"mat-mdc-tab-link-container",
					3,
					"keydown"
				],
				[
					1,
					"mat-mdc-tab-list",
					3,
					"cdkObserveContent"
				],
				[1, "mat-mdc-tab-links"],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-header-pagination",
					"mat-mdc-tab-header-pagination-after",
					3,
					"mousedown",
					"click",
					"touchend",
					"matRippleDisabled"
				]
			],
			template: function MatTabNav_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵelementStart(0, "div", 5, 0);
					ɵɵlistener("click", function MatTabNav_Template_div_click_0_listener() {
						return ctx._handlePaginatorClick("before");
					})("mousedown", function MatTabNav_Template_div_mousedown_0_listener($event) {
						return ctx._handlePaginatorPress("before", $event);
					})("touchend", function MatTabNav_Template_div_touchend_0_listener() {
						return ctx._stopInterval();
					});
					ɵɵelement(2, "div", 6);
					ɵɵelementEnd();
					ɵɵelementStart(3, "div", 7, 1);
					ɵɵlistener("keydown", function MatTabNav_Template_div_keydown_3_listener($event) {
						return ctx._handleKeydown($event);
					});
					ɵɵelementStart(5, "div", 8, 2);
					ɵɵlistener("cdkObserveContent", function MatTabNav_Template_div_cdkObserveContent_5_listener() {
						return ctx._onContentChanges();
					});
					ɵɵelementStart(7, "div", 9, 3);
					ɵɵprojection(9);
					ɵɵelementEnd()()();
					ɵɵelementStart(10, "div", 10, 4);
					ɵɵlistener("mousedown", function MatTabNav_Template_div_mousedown_10_listener($event) {
						return ctx._handlePaginatorPress("after", $event);
					})("click", function MatTabNav_Template_div_click_10_listener() {
						return ctx._handlePaginatorClick("after");
					})("touchend", function MatTabNav_Template_div_touchend_10_listener() {
						return ctx._stopInterval();
					});
					ɵɵelement(12, "div", 6);
					ɵɵelementEnd();
				}
				if (rf & 2) {
					ɵɵclassProp("mat-mdc-tab-header-pagination-disabled", ctx._disableScrollBefore);
					ɵɵproperty("matRippleDisabled", ctx._disableScrollBefore || ctx.disableRipple);
					ɵɵadvance(10);
					ɵɵclassProp("mat-mdc-tab-header-pagination-disabled", ctx._disableScrollAfter);
					ɵɵproperty("matRippleDisabled", ctx._disableScrollAfter || ctx.disableRipple);
				}
			},
			dependencies: [MatRipple, CdkObserveContent],
			styles: [".mdc-tab {\n  min-width: 90px;\n  padding: 0 24px;\n  display: flex;\n  flex: 1 0 auto;\n  justify-content: center;\n  box-sizing: border-box;\n  border: none;\n  outline: none;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 1;\n  touch-action: manipulation;\n}\n\n.mdc-tab__content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: inherit;\n  pointer-events: none;\n}\n\n.mdc-tab__text-label {\n  transition: 150ms color linear;\n  display: inline-block;\n  line-height: 1;\n  z-index: 2;\n}\n\n.mdc-tab--active .mdc-tab__text-label {\n  transition-delay: 100ms;\n}\n\n._mat-animation-noopable .mdc-tab__text-label {\n  transition: none;\n}\n\n.mdc-tab-indicator {\n  display: flex;\n  position: absolute;\n  top: 0;\n  left: 0;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.mdc-tab-indicator__content {\n  transition: var(--%NS%mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);\n  transform-origin: left;\n  opacity: 0;\n}\n\n.mdc-tab-indicator__content--underline {\n  align-self: flex-end;\n  box-sizing: border-box;\n  width: 100%;\n  border-top-style: solid;\n}\n\n.mdc-tab-indicator--active .mdc-tab-indicator__content {\n  opacity: 1;\n}\n\n._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {\n  transition: none;\n}\n\n.mat-mdc-tab-ripple.mat-mdc-tab-ripple {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  pointer-events: none;\n}\n\n.mat-mdc-tab-header {\n  display: flex;\n  overflow: hidden;\n  position: relative;\n  flex-shrink: 0;\n}\n\n.mdc-tab-indicator .mdc-tab-indicator__content {\n  transition-duration: var(--%NS%mat-tab-header-animation-duration, 250ms);\n}\n\n.mat-mdc-tab-header-pagination {\n  -webkit-user-select: none;\n  user-select: none;\n  position: relative;\n  display: none;\n  justify-content: center;\n  align-items: center;\n  min-width: 32px;\n  cursor: pointer;\n  z-index: 2;\n  -webkit-tap-highlight-color: transparent;\n  touch-action: none;\n  box-sizing: content-box;\n  outline: 0;\n}\n.mat-mdc-tab-header-pagination::-moz-focus-inner {\n  border: 0;\n}\n.mat-mdc-tab-header-pagination .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {\n  display: flex;\n}\n\n.mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {\n  padding-left: 4px;\n}\n.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(-135deg);\n}\n\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-pagination-after {\n  padding-right: 4px;\n}\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(45deg);\n}\n\n.mat-mdc-tab-header-pagination-chevron {\n  border-style: solid;\n  border-width: 2px 2px 0 0;\n  height: 8px;\n  width: 8px;\n  border-color: var(--%NS%mat-tab-pagination-icon-color, var(--%NS%mat-sys-on-surface));\n}\n\n.mat-mdc-tab-header-pagination-disabled {\n  box-shadow: none;\n  cursor: default;\n  pointer-events: none;\n}\n.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {\n  opacity: 0.4;\n}\n\n.mat-mdc-tab-list {\n  flex-grow: 1;\n  position: relative;\n  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n._mat-animation-noopable .mat-mdc-tab-list {\n  transition: none;\n}\n\n.mat-mdc-tab-links {\n  display: flex;\n  flex: 1 0 auto;\n}\n[mat-align-tabs=center] > .mat-mdc-tab-link-container .mat-mdc-tab-links {\n  justify-content: center;\n}\n[mat-align-tabs=end] > .mat-mdc-tab-link-container .mat-mdc-tab-links {\n  justify-content: flex-end;\n}\n.cdk-drop-list .mat-mdc-tab-links, .mat-mdc-tab-links.cdk-drop-list {\n  min-height: var(--%NS%mat-tab-container-height, 48px);\n}\n\n.mat-mdc-tab-link-container {\n  display: flex;\n  flex-grow: 1;\n  overflow: hidden;\n  z-index: 1;\n  border-bottom-style: solid;\n  border-bottom-width: var(--%NS%mat-tab-divider-height, 1px);\n  border-bottom-color: var(--%NS%mat-tab-divider-color, var(--%NS%mat-sys-surface-variant));\n}\n\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination {\n  background-color: var(--%NS%mat-tab-background-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mat-mdc-tab-link .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-focus-indicator::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {\n  border-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mdc-tab__ripple::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {\n  background-color: var(--%NS%mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {\n  color: var(--%NS%mat-tab-foreground-color);\n}\n"],
			encapsulation: 2,
			changeDetection: 1
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabNav, [{
		type: Component,
		args: [{
			selector: "[mat-tab-nav-bar]",
			exportAs: "matTabNavBar, matTabNav",
			host: {
				"[attr.role]": "_getRole()",
				"class": "mat-mdc-tab-nav-bar mat-mdc-tab-header",
				"[class.mat-mdc-tab-header-pagination-controls-enabled]": "_showPaginationControls",
				"[class.mat-mdc-tab-header-rtl]": "_getLayoutDirection() == 'rtl'",
				"[class.mat-mdc-tab-nav-bar-stretch-tabs]": "stretchTabs",
				"[class.mat-primary]": "color !== \"warn\" && color !== \"accent\"",
				"[class.mat-accent]": "color === \"accent\"",
				"[class.mat-warn]": "color === \"warn\"",
				"[class._mat-animation-noopable]": "_animationsDisabled",
				"[style.--mat-tab-header-animation-duration]": "animationDuration"
			},
			encapsulation: ViewEncapsulation.None,
			changeDetection: ChangeDetectionStrategy.Eager,
			imports: [MatRipple, CdkObserveContent],
			template: "<!--\n Note that this intentionally uses a `div` instead of a `button`, because it's not part of\n the regular tabs flow and is only here to support mouse users. It should also not be focusable.\n-->\n<div class=\"mat-mdc-tab-header-pagination mat-mdc-tab-header-pagination-before\"\n     #previousPaginator\n     mat-ripple\n     [matRippleDisabled]=\"_disableScrollBefore || disableRipple\"\n     [class.mat-mdc-tab-header-pagination-disabled]=\"_disableScrollBefore\"\n     (click)=\"_handlePaginatorClick('before')\"\n     (mousedown)=\"_handlePaginatorPress('before', $event)\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-mdc-tab-header-pagination-chevron\"></div>\n</div>\n\n<div class=\"mat-mdc-tab-link-container\" #tabListContainer (keydown)=\"_handleKeydown($event)\">\n  <div class=\"mat-mdc-tab-list\" #tabList (cdkObserveContent)=\"_onContentChanges()\">\n    <div class=\"mat-mdc-tab-links\" #tabListInner>\n      <ng-content></ng-content>\n    </div>\n  </div>\n</div>\n\n<div class=\"mat-mdc-tab-header-pagination mat-mdc-tab-header-pagination-after\"\n     #nextPaginator\n     mat-ripple\n     [matRippleDisabled]=\"_disableScrollAfter || disableRipple\"\n     [class.mat-mdc-tab-header-pagination-disabled]=\"_disableScrollAfter\"\n     (mousedown)=\"_handlePaginatorPress('after', $event)\"\n     (click)=\"_handlePaginatorClick('after')\"\n     (touchend)=\"_stopInterval()\">\n  <div class=\"mat-mdc-tab-header-pagination-chevron\"></div>\n</div>\n",
			styles: [".mdc-tab {\n  min-width: 90px;\n  padding: 0 24px;\n  display: flex;\n  flex: 1 0 auto;\n  justify-content: center;\n  box-sizing: border-box;\n  border: none;\n  outline: none;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 1;\n  touch-action: manipulation;\n}\n\n.mdc-tab__content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: inherit;\n  pointer-events: none;\n}\n\n.mdc-tab__text-label {\n  transition: 150ms color linear;\n  display: inline-block;\n  line-height: 1;\n  z-index: 2;\n}\n\n.mdc-tab--active .mdc-tab__text-label {\n  transition-delay: 100ms;\n}\n\n._mat-animation-noopable .mdc-tab__text-label {\n  transition: none;\n}\n\n.mdc-tab-indicator {\n  display: flex;\n  position: absolute;\n  top: 0;\n  left: 0;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.mdc-tab-indicator__content {\n  transition: var(--mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);\n  transform-origin: left;\n  opacity: 0;\n}\n\n.mdc-tab-indicator__content--underline {\n  align-self: flex-end;\n  box-sizing: border-box;\n  width: 100%;\n  border-top-style: solid;\n}\n\n.mdc-tab-indicator--active .mdc-tab-indicator__content {\n  opacity: 1;\n}\n\n._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {\n  transition: none;\n}\n\n.mat-mdc-tab-ripple.mat-mdc-tab-ripple {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  pointer-events: none;\n}\n\n.mat-mdc-tab-header {\n  display: flex;\n  overflow: hidden;\n  position: relative;\n  flex-shrink: 0;\n}\n\n.mdc-tab-indicator .mdc-tab-indicator__content {\n  transition-duration: var(--mat-tab-header-animation-duration, 250ms);\n}\n\n.mat-mdc-tab-header-pagination {\n  -webkit-user-select: none;\n  user-select: none;\n  position: relative;\n  display: none;\n  justify-content: center;\n  align-items: center;\n  min-width: 32px;\n  cursor: pointer;\n  z-index: 2;\n  -webkit-tap-highlight-color: transparent;\n  touch-action: none;\n  box-sizing: content-box;\n  outline: 0;\n}\n.mat-mdc-tab-header-pagination::-moz-focus-inner {\n  border: 0;\n}\n.mat-mdc-tab-header-pagination .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {\n  display: flex;\n}\n\n.mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {\n  padding-left: 4px;\n}\n.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(-135deg);\n}\n\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,\n.mat-mdc-tab-header-pagination-after {\n  padding-right: 4px;\n}\n.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {\n  transform: rotate(45deg);\n}\n\n.mat-mdc-tab-header-pagination-chevron {\n  border-style: solid;\n  border-width: 2px 2px 0 0;\n  height: 8px;\n  width: 8px;\n  border-color: var(--mat-tab-pagination-icon-color, var(--mat-sys-on-surface));\n}\n\n.mat-mdc-tab-header-pagination-disabled {\n  box-shadow: none;\n  cursor: default;\n  pointer-events: none;\n}\n.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {\n  opacity: 0.4;\n}\n\n.mat-mdc-tab-list {\n  flex-grow: 1;\n  position: relative;\n  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);\n}\n._mat-animation-noopable .mat-mdc-tab-list {\n  transition: none;\n}\n\n.mat-mdc-tab-links {\n  display: flex;\n  flex: 1 0 auto;\n}\n[mat-align-tabs=center] > .mat-mdc-tab-link-container .mat-mdc-tab-links {\n  justify-content: center;\n}\n[mat-align-tabs=end] > .mat-mdc-tab-link-container .mat-mdc-tab-links {\n  justify-content: flex-end;\n}\n.cdk-drop-list .mat-mdc-tab-links, .mat-mdc-tab-links.cdk-drop-list {\n  min-height: var(--mat-tab-container-height, 48px);\n}\n\n.mat-mdc-tab-link-container {\n  display: flex;\n  flex-grow: 1;\n  overflow: hidden;\n  z-index: 1;\n  border-bottom-style: solid;\n  border-bottom-width: var(--mat-tab-divider-height, 1px);\n  border-bottom-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));\n}\n\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination {\n  background-color: var(--mat-tab-background-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mat-mdc-tab-link .mdc-tab__text-label {\n  color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background.mat-primary > .mat-mdc-tab-link-container .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab__text-label {\n  color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-link-container .mat-mdc-tab-link:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-focus-indicator::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {\n  border-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mdc-tab__ripple::before, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {\n  background-color: var(--mat-tab-foreground-color);\n}\n.mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-link-container .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-nav-bar.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {\n  color: var(--mat-tab-foreground-color);\n}\n"]
		}]
	}], () => [], {
		fitInkBarToContent: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		stretchTabs: [{
			type: Input,
			args: [{
				alias: "mat-stretch-tabs",
				transform: booleanAttribute
			}]
		}],
		animationDuration: [{
			type: Input,
			args: [{ transform: normalizeDuration }]
		}],
		_items: [{
			type: ContentChildren,
			args: [forwardRef(() => MatTabLink), { descendants: true }]
		}],
		backgroundColor: [{ type: Input }],
		disableRipple: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		color: [{ type: Input }],
		tabPanel: [{ type: Input }],
		_tabListContainer: [{
			type: ViewChild,
			args: ["tabListContainer", { static: true }]
		}],
		_tabList: [{
			type: ViewChild,
			args: ["tabList", { static: true }]
		}],
		_tabListInner: [{
			type: ViewChild,
			args: ["tabListInner", { static: true }]
		}],
		_nextPaginator: [{
			type: ViewChild,
			args: ["nextPaginator"]
		}],
		_previousPaginator: [{
			type: ViewChild,
			args: ["previousPaginator"]
		}]
	});
})();
var MatTabLink = class MatTabLink extends InkBarItem {
	_tabNavBar = inject(MatTabNav);
	elementRef = inject(ElementRef);
	_focusMonitor = inject(FocusMonitor);
	_destroyed = new Subject();
	_isActive = false;
	_tabIndex = computed(() => this._tabNavBar._focusedItem() === this ? this.tabIndex : -1, ...ngDevMode ? [{ debugName: "_tabIndex" }] : []);
	get active() {
		return this._isActive;
	}
	set active(value) {
		if (value !== this._isActive) {
			this._isActive = value;
			this._tabNavBar.updateActiveLink();
		}
	}
	disabled = false;
	get disableRipple() {
		return this._disableRipple();
	}
	set disableRipple(value) {
		this._disableRipple.set(value);
	}
	_disableRipple = signal(false, ...ngDevMode ? [{ debugName: "_disableRipple" }] : []);
	tabIndex = 0;
	rippleConfig;
	get rippleDisabled() {
		return this.disabled || this.disableRipple || this._tabNavBar.disableRipple || !!this.rippleConfig.disabled;
	}
	id = inject(_IdGenerator).getId("mat-tab-link-");
	constructor() {
		super();
		inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
		const globalRippleOptions = inject(MAT_RIPPLE_GLOBAL_OPTIONS, { optional: true });
		const tabIndex = inject(new HostAttributeToken("tabindex"), { optional: true });
		this.rippleConfig = globalRippleOptions || {};
		this.tabIndex = tabIndex == null ? 0 : parseInt(tabIndex) || 0;
		if (_animationsDisabled()) this.rippleConfig.animation = {
			enterDuration: 0,
			exitDuration: 0
		};
		this._tabNavBar._fitInkBarToContent.pipe(takeUntil(this._destroyed)).subscribe((fitInkBarToContent) => {
			this.fitInkBarToContent = fitInkBarToContent;
		});
	}
	focus() {
		this.elementRef.nativeElement.focus();
	}
	ngAfterViewInit() {
		this._focusMonitor.monitor(this.elementRef);
	}
	ngOnDestroy() {
		this._destroyed.next();
		this._destroyed.complete();
		super.ngOnDestroy();
		this._focusMonitor.stopMonitoring(this.elementRef);
	}
	_handleFocus() {
		this._tabNavBar.focusIndex = this._tabNavBar._items.toArray().indexOf(this);
	}
	_handleKeydown(event) {
		if (event.keyCode === 32 || event.keyCode === 13) {
			if (this.disabled) event.preventDefault();
			else if (this._tabNavBar.tabPanel) {
				if (event.keyCode === 32) event.preventDefault();
				this.elementRef.nativeElement.click();
			}
		}
	}
	_getAriaControls() {
		return this._tabNavBar.tabPanel ? this._tabNavBar.tabPanel?.id : this.elementRef.nativeElement.getAttribute("aria-controls");
	}
	_getAriaSelected() {
		if (this._tabNavBar.tabPanel) return this.active ? "true" : "false";
		else return this.elementRef.nativeElement.getAttribute("aria-selected");
	}
	_getAriaCurrent() {
		return this.active && !this._tabNavBar.tabPanel ? "page" : null;
	}
	_getRole() {
		return this._tabNavBar.tabPanel ? "tab" : this.elementRef.nativeElement.getAttribute("role");
	}
	static ɵfac = function MatTabLink_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabLink)();
	};
	static ɵcmp = (function() {
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabLink,
			selectors: [[
				"",
				"mat-tab-link",
				""
			], [
				"",
				"matTabLink",
				""
			]],
			hostAttrs: [
				1,
				"mdc-tab",
				"mat-mdc-tab-link",
				"mat-focus-indicator"
			],
			hostVars: 11,
			hostBindings: function MatTabLink_HostBindings(rf, ctx) {
				if (rf & 1) ɵɵlistener("focus", function MatTabLink_focus_HostBindingHandler() {
					return ctx._handleFocus();
				})("keydown", function MatTabLink_keydown_HostBindingHandler($event) {
					return ctx._handleKeydown($event);
				});
				if (rf & 2) {
					ɵɵattribute("aria-controls", ctx._getAriaControls())("aria-current", ctx._getAriaCurrent())("aria-disabled", ctx.disabled)("aria-selected", ctx._getAriaSelected())("id", ctx.id)("tabIndex", ctx._tabIndex())("role", ctx._getRole());
					ɵɵclassProp("mat-mdc-tab-disabled", ctx.disabled)("mdc-tab--active", ctx.active);
				}
			},
			inputs: {
				active: [
					2,
					"active",
					"active",
					booleanAttribute
				],
				disabled: [
					2,
					"disabled",
					"disabled",
					booleanAttribute
				],
				disableRipple: [
					2,
					"disableRipple",
					"disableRipple",
					booleanAttribute
				],
				tabIndex: [
					2,
					"tabIndex",
					"tabIndex",
					(value) => value == null ? 0 : numberAttribute(value)
				],
				id: "id"
			},
			exportAs: ["matTabLink"],
			features: [ɵɵInheritDefinitionFeature],
			ngContentSelectors: ["*"],
			decls: 5,
			vars: 2,
			consts: [
				[1, "mdc-tab__ripple"],
				[
					"mat-ripple",
					"",
					1,
					"mat-mdc-tab-ripple",
					3,
					"matRippleTrigger",
					"matRippleDisabled"
				],
				[1, "mdc-tab__content"],
				[1, "mdc-tab__text-label"]
			],
			template: function MatTabLink_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵelement(0, "span", 0)(1, "div", 1);
					ɵɵelementStart(2, "span", 2)(3, "span", 3);
					ɵɵprojection(4);
					ɵɵelementEnd()();
				}
				if (rf & 2) {
					ɵɵadvance();
					ɵɵproperty("matRippleTrigger", ctx.elementRef.nativeElement)("matRippleDisabled", ctx.rippleDisabled);
				}
			},
			dependencies: [MatRipple],
			styles: [".mat-mdc-tab-link {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-decoration: none;\n  background: none;\n  height: var(--%NS%mat-tab-container-height, 48px);\n  font-family: var(--%NS%mat-tab-label-text-font, var(--%NS%mat-sys-title-small-font));\n  font-size: var(--%NS%mat-tab-label-text-size, var(--%NS%mat-sys-title-small-size));\n  letter-spacing: var(--%NS%mat-tab-label-text-tracking, var(--%NS%mat-sys-title-small-tracking));\n  line-height: var(--%NS%mat-tab-label-text-line-height, var(--%NS%mat-sys-title-small-line-height));\n  font-weight: var(--%NS%mat-tab-label-text-weight, var(--%NS%mat-sys-title-small-weight));\n}\n.mat-mdc-tab-link.mdc-tab {\n  flex-grow: 0;\n}\n.mat-mdc-tab-link .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-indicator-color, var(--%NS%mat-sys-primary));\n  border-top-width: var(--%NS%mat-tab-active-indicator-height, 2px);\n  border-radius: var(--%NS%mat-tab-active-indicator-shape, 0);\n}\n.mat-mdc-tab-link:hover .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-hover-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link:focus .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-focus-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active .mdc-tab__ripple::before,\n.mat-mdc-tab-link.mdc-tab--active .mat-ripple-element {\n  background-color: var(--%NS%mat-tab-active-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--%NS%active:hover .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-hover-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--%NS%active:hover .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-hover-indicator-color, var(--%NS%mat-sys-primary));\n}\n.mat-mdc-tab-link.mdc-tab--%NS%active:focus .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-active-focus-label-text-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--%NS%active:focus .mdc-tab-indicator__content--underline {\n  border-color: var(--%NS%mat-tab-active-focus-indicator-color, var(--%NS%mat-sys-primary));\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled {\n  opacity: 0.4;\n  pointer-events: none;\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__content {\n  pointer-events: none;\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__ripple::before,\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mat-ripple-element {\n  background-color: var(--%NS%mat-tab-disabled-ripple-color, var(--%NS%mat-sys-on-surface-variant));\n}\n.mat-mdc-tab-link .mdc-tab__ripple::before {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-link .mdc-tab__text-label {\n  color: var(--%NS%mat-tab-inactive-label-text-color, var(--%NS%mat-sys-on-surface));\n  display: inline-flex;\n  align-items: center;\n}\n.mat-mdc-tab-link .mdc-tab__content {\n  position: relative;\n  pointer-events: auto;\n}\n.mat-mdc-tab-link:hover .mdc-tab__ripple::before {\n  opacity: 0.04;\n}\n.mat-mdc-tab-link.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab-link.cdk-keyboard-focused .mdc-tab__ripple::before {\n  opacity: 0.12;\n}\n.mat-mdc-tab-link .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--%NS%mat-tab-inactive-ripple-color, var(--%NS%mat-sys-on-surface));\n}\n.mat-mdc-tab-header.mat-mdc-tab-nav-bar-stretch-tabs .mat-mdc-tab-link {\n  flex-grow: 1;\n}\n.mat-mdc-tab-link::before {\n  margin: 5px;\n}\n\n@media (max-width: 599px) {\n  .mat-mdc-tab-link {\n    min-width: 72px;\n  }\n}\n"],
			encapsulation: 2
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabLink, [{
		type: Component,
		args: [{
			selector: "[mat-tab-link], [matTabLink]",
			exportAs: "matTabLink",
			encapsulation: ViewEncapsulation.None,
			host: {
				"class": "mdc-tab mat-mdc-tab-link mat-focus-indicator",
				"[attr.aria-controls]": "_getAriaControls()",
				"[attr.aria-current]": "_getAriaCurrent()",
				"[attr.aria-disabled]": "disabled",
				"[attr.aria-selected]": "_getAriaSelected()",
				"[attr.id]": "id",
				"[attr.tabIndex]": "_tabIndex()",
				"[attr.role]": "_getRole()",
				"[class.mat-mdc-tab-disabled]": "disabled",
				"[class.mdc-tab--active]": "active",
				"(focus)": "_handleFocus()",
				"(keydown)": "_handleKeydown($event)"
			},
			imports: [MatRipple],
			template: "<span class=\"mdc-tab__ripple\"></span>\n\n<div\n  class=\"mat-mdc-tab-ripple\"\n  mat-ripple\n  [matRippleTrigger]=\"elementRef.nativeElement\"\n  [matRippleDisabled]=\"rippleDisabled\"></div>\n\n<span class=\"mdc-tab__content\">\n  <span class=\"mdc-tab__text-label\">\n    <ng-content></ng-content>\n  </span>\n</span>\n\n",
			styles: [".mat-mdc-tab-link {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-decoration: none;\n  background: none;\n  height: var(--mat-tab-container-height, 48px);\n  font-family: var(--mat-tab-label-text-font, var(--mat-sys-title-small-font));\n  font-size: var(--mat-tab-label-text-size, var(--mat-sys-title-small-size));\n  letter-spacing: var(--mat-tab-label-text-tracking, var(--mat-sys-title-small-tracking));\n  line-height: var(--mat-tab-label-text-line-height, var(--mat-sys-title-small-line-height));\n  font-weight: var(--mat-tab-label-text-weight, var(--mat-sys-title-small-weight));\n}\n.mat-mdc-tab-link.mdc-tab {\n  flex-grow: 0;\n}\n.mat-mdc-tab-link .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-indicator-color, var(--mat-sys-primary));\n  border-top-width: var(--mat-tab-active-indicator-height, 2px);\n  border-radius: var(--mat-tab-active-indicator-shape, 0);\n}\n.mat-mdc-tab-link:hover .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-hover-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link:focus .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-focus-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active .mdc-tab__text-label {\n  color: var(--mat-tab-active-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active .mdc-tab__ripple::before,\n.mat-mdc-tab-link.mdc-tab--active .mat-ripple-element {\n  background-color: var(--mat-tab-active-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active:hover .mdc-tab__text-label {\n  color: var(--mat-tab-active-hover-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active:hover .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-hover-indicator-color, var(--mat-sys-primary));\n}\n.mat-mdc-tab-link.mdc-tab--active:focus .mdc-tab__text-label {\n  color: var(--mat-tab-active-focus-label-text-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link.mdc-tab--active:focus .mdc-tab-indicator__content--underline {\n  border-color: var(--mat-tab-active-focus-indicator-color, var(--mat-sys-primary));\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled {\n  opacity: 0.4;\n  pointer-events: none;\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__content {\n  pointer-events: none;\n}\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mdc-tab__ripple::before,\n.mat-mdc-tab-link.mat-mdc-tab-disabled .mat-ripple-element {\n  background-color: var(--mat-tab-disabled-ripple-color, var(--mat-sys-on-surface-variant));\n}\n.mat-mdc-tab-link .mdc-tab__ripple::before {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-link .mdc-tab__text-label {\n  color: var(--mat-tab-inactive-label-text-color, var(--mat-sys-on-surface));\n  display: inline-flex;\n  align-items: center;\n}\n.mat-mdc-tab-link .mdc-tab__content {\n  position: relative;\n  pointer-events: auto;\n}\n.mat-mdc-tab-link:hover .mdc-tab__ripple::before {\n  opacity: 0.04;\n}\n.mat-mdc-tab-link.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab-link.cdk-keyboard-focused .mdc-tab__ripple::before {\n  opacity: 0.12;\n}\n.mat-mdc-tab-link .mat-ripple-element {\n  opacity: 0.12;\n  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));\n}\n.mat-mdc-tab-header.mat-mdc-tab-nav-bar-stretch-tabs .mat-mdc-tab-link {\n  flex-grow: 1;\n}\n.mat-mdc-tab-link::before {\n  margin: 5px;\n}\n\n@media (max-width: 599px) {\n  .mat-mdc-tab-link {\n    min-width: 72px;\n  }\n}\n"]
		}]
	}], () => [], {
		active: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		disabled: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		disableRipple: [{
			type: Input,
			args: [{ transform: booleanAttribute }]
		}],
		tabIndex: [{
			type: Input,
			args: [{ transform: (value) => value == null ? 0 : numberAttribute(value) }]
		}],
		id: [{ type: Input }]
	});
})();
var MatTabNavPanel = class MatTabNavPanel {
	id = inject(_IdGenerator).getId("mat-tab-nav-panel-");
	_activeTabId;
	static ɵfac = function MatTabNavPanel_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabNavPanel)();
	};
	static ɵcmp = (function() {
		return /*@__PURE__*/ ɵɵdefineComponent({
			type: MatTabNavPanel,
			selectors: [["mat-tab-nav-panel"]],
			hostAttrs: [
				"role",
				"tabpanel",
				1,
				"mat-mdc-tab-nav-panel"
			],
			hostVars: 2,
			hostBindings: function MatTabNavPanel_HostBindings(rf, ctx) {
				if (rf & 2) ɵɵattribute("aria-labelledby", ctx._activeTabId)("id", ctx.id);
			},
			inputs: { id: "id" },
			exportAs: ["matTabNavPanel"],
			ngContentSelectors: ["*"],
			decls: 1,
			vars: 0,
			template: function MatTabNavPanel_Template(rf, ctx) {
				if (rf & 1) {
					ɵɵprojectionDef();
					ɵɵprojection(0);
				}
			},
			encapsulation: 2
		});
	})();
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabNavPanel, [{
		type: Component,
		args: [{
			selector: "mat-tab-nav-panel",
			exportAs: "matTabNavPanel",
			template: "<ng-content></ng-content>",
			host: {
				"[attr.aria-labelledby]": "_activeTabId",
				"[attr.id]": "id",
				"class": "mat-mdc-tab-nav-panel",
				"role": "tabpanel"
			},
			encapsulation: ViewEncapsulation.None
		}]
	}], null, { id: [{ type: Input }] });
})();
var MatTabsModule = class MatTabsModule {
	static ɵfac = function MatTabsModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatTabsModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: MatTabsModule,
		imports: [
			MatTabContent,
			MatTabLabel,
			MatTab,
			MatTabGroup,
			MatTabNav,
			MatTabNavPanel,
			MatTabLink
		],
		exports: [
			BidiModule,
			MatTabContent,
			MatTabLabel,
			MatTab,
			MatTabGroup,
			MatTabNav,
			MatTabNavPanel,
			MatTabLink
		]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [BidiModule] });
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTabsModule, [{
		type: NgModule,
		args: [{
			imports: [
				MatTabContent,
				MatTabLabel,
				MatTab,
				MatTabGroup,
				MatTabNav,
				MatTabNavPanel,
				MatTabLink
			],
			exports: [
				BidiModule,
				MatTabContent,
				MatTabLabel,
				MatTab,
				MatTabGroup,
				MatTabNav,
				MatTabNavPanel,
				MatTabLink
			]
		}]
	}], null, null);
})();
export { MAT_TAB, MAT_TABS_CONFIG, MAT_TAB_CONTENT, MAT_TAB_GROUP, MAT_TAB_LABEL, MatInkBar, MatPaginatedTabHeader, MatTab, MatTabBody, MatTabBodyPortal, MatTabChangeEvent, MatTabContent, MatTabGroup, MatTabHeader, MatTabLabel, MatTabLabelWrapper, MatTabLink, MatTabNav, MatTabNavPanel, MatTabsModule, _MAT_INK_BAR_POSITIONER };
