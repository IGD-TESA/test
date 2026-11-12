import { $n as Output, Ac as Injector, Bc as PLATFORM_ID, Ca as ɵɵclassProp, Cc as EventEmitter, Dr as ViewEncapsulation, En as ElementRef, Hl as BehaviorSubject, In as Input, Kl as operate, M as createComponent, Mr as afterNextRender, O as booleanAttribute, Rc as NgZone, Ul as Subject, Vl as map, Wi as setClassMetadata, Wl as createOperatorSubscriber, Yl as identity, _c as DOCUMENT, ao as ɵɵdefineNgModule, ar as RendererFactory2, cn as Component, cu as __extends, dl as inject, dr as Service, du as __spreadArray, eu as Subscription, fc as ANIMATION_MODULE_TYPE, hc as CSP_NONCE, io as ɵɵdefineDirective, jl as ɵɵdefineInjector, kc as InjectionToken, la as ɵɵNgOnChangesFeature, pc as APP_ID, ql as Observable, qn as NgModule, ro as ɵɵdefineComponent, so as ɵɵdefineService, tn as ApplicationRef, tu as arrRemove, uu as __read, wn as Directive, xc as EnvironmentInjector } from "./core-hsl8ukWr.js";
import { t as take } from "./take-DmTvGJfN.js";
import { $ as of, Z as filter } from "./http-Yo5eIwws.js";
import { a as combineLatest, n as startWith, r as concat, t as takeUntil } from "./takeUntil-Cna_bGE4.js";
import { L as isPlatformBrowser, r as DomSanitizer } from "./platform-browser-D8nwwU0Q.js";
import { n as _setInnerHtml, t as _VisuallyHiddenLoader } from "./private-CanW9Ekb.js";
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
	now: function() {
		return (dateTimestampProvider.delegate || Date).now();
	},
	delegate: void 0
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/Action.js
var Action = function(_super) {
	__extends(Action, _super);
	function Action(scheduler, work) {
		return _super.call(this) || this;
	}
	Action.prototype.schedule = function(state, delay) {
		if (delay === void 0) delay = 0;
		return this;
	};
	return Action;
}(Subscription);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js
var intervalProvider = {
	setInterval: function(handler, timeout) {
		var args = [];
		for (var _i = 2; _i < arguments.length; _i++) args[_i - 2] = arguments[_i];
		var delegate = intervalProvider.delegate;
		if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
		return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
	},
	clearInterval: function(handle) {
		var delegate = intervalProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
	},
	delegate: void 0
};
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js
var AsyncAction = function(_super) {
	__extends(AsyncAction, _super);
	function AsyncAction(scheduler, work) {
		var _this = _super.call(this, scheduler, work) || this;
		_this.scheduler = scheduler;
		_this.work = work;
		_this.pending = false;
		return _this;
	}
	AsyncAction.prototype.schedule = function(state, delay) {
		var _a;
		if (delay === void 0) delay = 0;
		if (this.closed) return this;
		this.state = state;
		var id = this.id;
		var scheduler = this.scheduler;
		if (id != null) this.id = this.recycleAsyncId(scheduler, id, delay);
		this.pending = true;
		this.delay = delay;
		this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
		return this;
	};
	AsyncAction.prototype.requestAsyncId = function(scheduler, _id, delay) {
		if (delay === void 0) delay = 0;
		return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
	};
	AsyncAction.prototype.recycleAsyncId = function(_scheduler, id, delay) {
		if (delay === void 0) delay = 0;
		if (delay != null && this.delay === delay && this.pending === false) return id;
		if (id != null) intervalProvider.clearInterval(id);
	};
	AsyncAction.prototype.execute = function(state, delay) {
		if (this.closed) return /* @__PURE__ */ new Error("executing a cancelled action");
		this.pending = false;
		var error = this._execute(state, delay);
		if (error) return error;
		else if (this.pending === false && this.id != null) this.id = this.recycleAsyncId(this.scheduler, this.id, null);
	};
	AsyncAction.prototype._execute = function(state, _delay) {
		var errored = false;
		var errorValue;
		try {
			this.work(state);
		} catch (e) {
			errored = true;
			errorValue = e ? e : /* @__PURE__ */ new Error("Scheduled action threw falsy error");
		}
		if (errored) {
			this.unsubscribe();
			return errorValue;
		}
	};
	AsyncAction.prototype.unsubscribe = function() {
		if (!this.closed) {
			var _a = this, id = _a.id, scheduler = _a.scheduler;
			var actions = scheduler.actions;
			this.work = this.state = this.scheduler = null;
			this.pending = false;
			arrRemove(actions, this);
			if (id != null) this.id = this.recycleAsyncId(scheduler, id, null);
			this.delay = null;
			_super.prototype.unsubscribe.call(this);
		}
	};
	return AsyncAction;
}(Action);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/Scheduler.js
var Scheduler = function() {
	function Scheduler(schedulerActionCtor, now) {
		if (now === void 0) now = Scheduler.now;
		this.schedulerActionCtor = schedulerActionCtor;
		this.now = now;
	}
	Scheduler.prototype.schedule = function(work, delay, state) {
		if (delay === void 0) delay = 0;
		return new this.schedulerActionCtor(this, work).schedule(state, delay);
	};
	Scheduler.now = dateTimestampProvider.now;
	return Scheduler;
}();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js
var AsyncScheduler = function(_super) {
	__extends(AsyncScheduler, _super);
	function AsyncScheduler(SchedulerAction, now) {
		if (now === void 0) now = Scheduler.now;
		var _this = _super.call(this, SchedulerAction, now) || this;
		_this.actions = [];
		_this._active = false;
		return _this;
	}
	AsyncScheduler.prototype.flush = function(action) {
		var actions = this.actions;
		if (this._active) {
			actions.push(action);
			return;
		}
		var error;
		this._active = true;
		do
			if (error = action.execute(action.state, action.delay)) break;
		while (action = actions.shift());
		this._active = false;
		if (error) {
			while (action = actions.shift()) action.unsubscribe();
			throw error;
		}
	};
	return AsyncScheduler;
}(Scheduler);
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/scheduler/async.js
var asyncScheduler = new AsyncScheduler(AsyncAction);
var async = asyncScheduler;
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/debounceTime.js
function debounceTime(dueTime, scheduler) {
	if (scheduler === void 0) scheduler = asyncScheduler;
	return operate(function(source, subscriber) {
		var activeTask = null;
		var lastValue = null;
		var lastTime = null;
		var emit = function() {
			if (activeTask) {
				activeTask.unsubscribe();
				activeTask = null;
				var value = lastValue;
				lastValue = null;
				subscriber.next(value);
			}
		};
		function emitWhenIdle() {
			var targetTime = lastTime + dueTime;
			var now = scheduler.now();
			if (now < targetTime) {
				activeTask = this.schedule(void 0, targetTime - now);
				subscriber.add(activeTask);
				return;
			}
			emit();
		}
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			lastValue = value;
			lastTime = scheduler.now();
			if (!activeTask) {
				activeTask = scheduler.schedule(emitWhenIdle, dueTime);
				subscriber.add(activeTask);
			}
		}, function() {
			emit();
			subscriber.complete();
		}, void 0, function() {
			lastValue = activeTask = null;
		}));
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js
function distinctUntilChanged(comparator, keySelector) {
	if (keySelector === void 0) keySelector = identity;
	comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
	return operate(function(source, subscriber) {
		var previousKey;
		var first = true;
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			var currentKey = keySelector(value);
			if (first || !comparator(previousKey, currentKey)) {
				first = false;
				previousKey = currentKey;
				subscriber.next(value);
			}
		}));
	});
}
function defaultCompare(a, b) {
	return a === b;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/operators/skip.js
function skip(count) {
	return filter(function(_, index) {
		return count <= index;
	});
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_fake-event-detection-chunk.mjs
function isFakeMousedownFromScreenReader(event) {
	return event.buttons === 0 || event.detail === 0;
}
function isFakeTouchstartFromScreenReader(event) {
	const touch = event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0];
	return !!touch && touch.identifier === -1 && (touch.radiusX == null || touch.radiusX === 1) && (touch.radiusY == null || touch.radiusY === 1);
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_shadow-dom-chunk.mjs
var shadowDomIsSupported;
function _supportsShadowDom() {
	if (shadowDomIsSupported == null) {
		const head = typeof document !== "undefined" ? document.head : null;
		shadowDomIsSupported = !!(head && (head.createShadowRoot || head.attachShadow));
	}
	return shadowDomIsSupported;
}
function _getShadowRoot(element) {
	if (_supportsShadowDom()) {
		const rootNode = element.getRootNode ? element.getRootNode() : null;
		if (typeof ShadowRoot !== "undefined" && ShadowRoot && rootNode instanceof ShadowRoot) return rootNode;
	}
	return null;
}
function _getFocusedElementPierceShadowDom() {
	let activeElement = typeof document !== "undefined" && document ? document.activeElement : null;
	while (activeElement && activeElement.shadowRoot) {
		const newActiveElement = activeElement.shadowRoot.activeElement;
		if (newActiveElement === activeElement) break;
		else activeElement = newActiveElement;
	}
	return activeElement;
}
function _getEventTarget(event) {
	if (event.composedPath) try {
		return event.composedPath()[0];
	} catch {}
	return event.target;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_platform-chunk.mjs
var hasV8BreakIterator;
try {
	hasV8BreakIterator = typeof Intl !== "undefined" && Intl.v8BreakIterator;
} catch {
	hasV8BreakIterator = false;
}
var Platform = class Platform {
	_platformId = inject(PLATFORM_ID);
	isBrowser = this._platformId ? isPlatformBrowser(this._platformId) : typeof document === "object" && !!document;
	EDGE = this.isBrowser && /(edge)/i.test(navigator.userAgent);
	TRIDENT = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);
	BLINK = this.isBrowser && !!(window.chrome || hasV8BreakIterator) && typeof CSS !== "undefined" && !this.EDGE && !this.TRIDENT;
	WEBKIT = this.isBrowser && /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;
	IOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
	FIREFOX = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
	ANDROID = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;
	SAFARI = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;
	static ɵfac = function Platform_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Platform)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: Platform,
		factory: Platform.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Platform, [{ type: Service }], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_passive-listeners-chunk.mjs
var supportsPassiveEvents;
function supportsPassiveEventListeners() {
	if (supportsPassiveEvents == null && typeof window !== "undefined") try {
		window.addEventListener("test", null, Object.defineProperty({}, "passive", { get: () => supportsPassiveEvents = true }));
	} finally {
		supportsPassiveEvents = supportsPassiveEvents || false;
	}
	return supportsPassiveEvents;
}
function normalizePassiveListenerOptions(options) {
	return supportsPassiveEventListeners() ? options : !!options.capture;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_element-chunk.mjs
function coerceNumberProperty(value, fallbackValue = 0) {
	if (_isNumberValue(value)) return Number(value);
	return arguments.length === 2 ? fallbackValue : 0;
}
function _isNumberValue(value) {
	return !isNaN(parseFloat(value)) && !isNaN(Number(value));
}
function coerceElement(elementOrRef) {
	return elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_focus-monitor-chunk.mjs
var INPUT_MODALITY_DETECTOR_OPTIONS = new InjectionToken("cdk-input-modality-detector-options");
var INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS = { ignoreKeys: [
	18,
	17,
	224,
	91,
	16
] };
var TOUCH_BUFFER_MS = 650;
var modalityEventListenerOptions = {
	passive: true,
	capture: true
};
var InputModalityDetector = class InputModalityDetector {
	_platform = inject(Platform);
	_listenerCleanups;
	modalityDetected;
	modalityChanged;
	get mostRecentModality() {
		return this._modality.value;
	}
	_mostRecentTarget = null;
	_modality = new BehaviorSubject(null);
	_options;
	_lastTouchMs = 0;
	_onKeydown = (event) => {
		if (this._options?.ignoreKeys?.some((keyCode) => keyCode === event.keyCode)) return;
		this._modality.next("keyboard");
		this._mostRecentTarget = _getEventTarget(event);
	};
	_onMousedown = (event) => {
		if (Date.now() - this._lastTouchMs < TOUCH_BUFFER_MS) return;
		this._modality.next(isFakeMousedownFromScreenReader(event) ? "keyboard" : "mouse");
		this._mostRecentTarget = _getEventTarget(event);
	};
	_onTouchstart = (event) => {
		if (isFakeTouchstartFromScreenReader(event)) {
			this._modality.next("keyboard");
			return;
		}
		this._lastTouchMs = Date.now();
		this._modality.next("touch");
		this._mostRecentTarget = _getEventTarget(event);
	};
	constructor() {
		const ngZone = inject(NgZone);
		const document = inject(DOCUMENT);
		const options = inject(INPUT_MODALITY_DETECTOR_OPTIONS, { optional: true });
		this._options = {
			...INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS,
			...options
		};
		this.modalityDetected = this._modality.pipe(skip(1));
		this.modalityChanged = this.modalityDetected.pipe(distinctUntilChanged());
		if (this._platform.isBrowser) {
			const renderer = inject(RendererFactory2).createRenderer(null, null);
			this._listenerCleanups = ngZone.runOutsideAngular(() => {
				return [
					renderer.listen(document, "keydown", this._onKeydown, modalityEventListenerOptions),
					renderer.listen(document, "mousedown", this._onMousedown, modalityEventListenerOptions),
					renderer.listen(document, "touchstart", this._onTouchstart, modalityEventListenerOptions)
				];
			});
		}
	}
	ngOnDestroy() {
		this._modality.complete();
		this._listenerCleanups?.forEach((cleanup) => cleanup());
	}
	static ɵfac = function InputModalityDetector_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || InputModalityDetector)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: InputModalityDetector,
		factory: InputModalityDetector.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InputModalityDetector, [{ type: Service }], () => [], null);
})();
var FocusMonitorDetectionMode;
(function(FocusMonitorDetectionMode) {
	FocusMonitorDetectionMode[FocusMonitorDetectionMode["IMMEDIATE"] = 0] = "IMMEDIATE";
	FocusMonitorDetectionMode[FocusMonitorDetectionMode["EVENTUAL"] = 1] = "EVENTUAL";
})(FocusMonitorDetectionMode || (FocusMonitorDetectionMode = {}));
var FOCUS_MONITOR_DEFAULT_OPTIONS = new InjectionToken("cdk-focus-monitor-default-options");
var captureEventListenerOptions = normalizePassiveListenerOptions({
	passive: true,
	capture: true
});
var FocusMonitor = class FocusMonitor {
	_ngZone = inject(NgZone);
	_platform = inject(Platform);
	_inputModalityDetector = inject(InputModalityDetector);
	_origin = null;
	_lastFocusOrigin = null;
	_windowFocused = false;
	_windowFocusTimeoutId;
	_originTimeoutId;
	_originFromTouchInteraction = false;
	_elementInfo = /* @__PURE__ */ new Map();
	_monitoredElementCount = 0;
	_rootNodeFocusListenerCount = /* @__PURE__ */ new Map();
	_detectionMode;
	_windowFocusListener = () => {
		this._windowFocused = true;
		this._windowFocusTimeoutId = setTimeout(() => this._windowFocused = false);
	};
	_document = inject(DOCUMENT);
	_stopInputModalityDetector = new Subject();
	constructor() {
		const options = inject(FOCUS_MONITOR_DEFAULT_OPTIONS, { optional: true });
		this._detectionMode = options?.detectionMode || FocusMonitorDetectionMode.IMMEDIATE;
	}
	_rootNodeFocusAndBlurListener = (event) => {
		const target = _getEventTarget(event);
		for (let element = target; element; element = element.parentElement) if (event.type === "focus") this._onFocus(event, element);
		else this._onBlur(event, element);
	};
	monitor(element, checkChildren = false) {
		const nativeElement = coerceElement(element);
		if (!this._platform.isBrowser || nativeElement.nodeType !== 1) return of();
		const rootNode = _getShadowRoot(nativeElement) || this._document;
		const cachedInfo = this._elementInfo.get(nativeElement);
		if (cachedInfo) {
			if (checkChildren) cachedInfo.checkChildren = true;
			return cachedInfo.subject;
		}
		const info = {
			checkChildren,
			subject: new Subject(),
			rootNode
		};
		this._elementInfo.set(nativeElement, info);
		this._registerGlobalListeners(info);
		return info.subject;
	}
	stopMonitoring(element) {
		const nativeElement = coerceElement(element);
		const elementInfo = this._elementInfo.get(nativeElement);
		if (elementInfo) {
			elementInfo.subject.complete();
			this._setClasses(nativeElement);
			this._elementInfo.delete(nativeElement);
			this._removeGlobalListeners(elementInfo);
		}
	}
	focusVia(element, origin, options) {
		const nativeElement = coerceElement(element);
		if (nativeElement === this._document.activeElement) this._getClosestElementsInfo(nativeElement).forEach(([currentElement, info]) => this._originChanged(currentElement, origin, info));
		else {
			this._setOrigin(origin);
			if (typeof nativeElement.focus === "function") nativeElement.focus(options);
		}
	}
	ngOnDestroy() {
		this._elementInfo.forEach((_info, element) => this.stopMonitoring(element));
	}
	_getWindow() {
		return this._document.defaultView || window;
	}
	_getFocusOrigin(focusEventTarget) {
		if (this._origin) {
			if (this._originFromTouchInteraction) return this._shouldBeAttributedToTouch(focusEventTarget) ? "touch" : "program";
			else return this._origin;
		}
		if (this._windowFocused && this._lastFocusOrigin) return this._lastFocusOrigin;
		if (focusEventTarget && this._isLastInteractionFromInputLabel(focusEventTarget)) return "mouse";
		return "program";
	}
	_shouldBeAttributedToTouch(focusEventTarget) {
		return this._detectionMode === FocusMonitorDetectionMode.EVENTUAL || !!focusEventTarget?.contains(this._inputModalityDetector._mostRecentTarget);
	}
	_setClasses(element, origin) {
		element.classList.toggle("cdk-focused", !!origin);
		element.classList.toggle("cdk-touch-focused", origin === "touch");
		element.classList.toggle("cdk-keyboard-focused", origin === "keyboard");
		element.classList.toggle("cdk-mouse-focused", origin === "mouse");
		element.classList.toggle("cdk-program-focused", origin === "program");
	}
	_setOrigin(origin, isFromInteraction = false) {
		this._ngZone.runOutsideAngular(() => {
			this._origin = origin;
			this._originFromTouchInteraction = origin === "touch" && isFromInteraction;
			if (this._detectionMode === FocusMonitorDetectionMode.IMMEDIATE) {
				clearTimeout(this._originTimeoutId);
				const ms = this._originFromTouchInteraction ? TOUCH_BUFFER_MS : 1;
				this._originTimeoutId = setTimeout(() => this._origin = null, ms);
			}
		});
	}
	_onFocus(event, element) {
		const elementInfo = this._elementInfo.get(element);
		const focusEventTarget = _getEventTarget(event);
		if (!elementInfo || !elementInfo.checkChildren && element !== focusEventTarget) return;
		this._originChanged(element, this._getFocusOrigin(focusEventTarget), elementInfo);
	}
	_onBlur(event, element) {
		const elementInfo = this._elementInfo.get(element);
		if (!elementInfo || elementInfo.checkChildren && event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
		this._setClasses(element);
		this._emitOrigin(elementInfo, null);
	}
	_emitOrigin(info, origin) {
		if (info.subject.observers.length) this._ngZone.run(() => info.subject.next(origin));
	}
	_registerGlobalListeners(elementInfo) {
		if (!this._platform.isBrowser) return;
		const rootNode = elementInfo.rootNode;
		const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode) || 0;
		if (!rootNodeFocusListeners) this._ngZone.runOutsideAngular(() => {
			rootNode.addEventListener("focus", this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
			rootNode.addEventListener("blur", this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
		});
		this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners + 1);
		if (++this._monitoredElementCount === 1) {
			this._ngZone.runOutsideAngular(() => {
				this._getWindow().addEventListener("focus", this._windowFocusListener);
			});
			this._inputModalityDetector.modalityDetected.pipe(takeUntil(this._stopInputModalityDetector)).subscribe((modality) => {
				this._setOrigin(modality, true);
			});
		}
	}
	_removeGlobalListeners(elementInfo) {
		const rootNode = elementInfo.rootNode;
		if (this._rootNodeFocusListenerCount.has(rootNode)) {
			const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode);
			if (rootNodeFocusListeners > 1) this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners - 1);
			else {
				rootNode.removeEventListener("focus", this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
				rootNode.removeEventListener("blur", this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
				this._rootNodeFocusListenerCount.delete(rootNode);
			}
		}
		if (!--this._monitoredElementCount) {
			this._getWindow().removeEventListener("focus", this._windowFocusListener);
			this._stopInputModalityDetector.next();
			clearTimeout(this._windowFocusTimeoutId);
			clearTimeout(this._originTimeoutId);
		}
	}
	_originChanged(element, origin, elementInfo) {
		this._setClasses(element, origin);
		this._emitOrigin(elementInfo, origin);
		this._lastFocusOrigin = origin;
	}
	_getClosestElementsInfo(element) {
		const results = [];
		this._elementInfo.forEach((info, currentElement) => {
			if (currentElement === element || info.checkChildren && currentElement.contains(element)) results.push([currentElement, info]);
		});
		return results;
	}
	_isLastInteractionFromInputLabel(focusEventTarget) {
		const { _mostRecentTarget: mostRecentTarget, mostRecentModality } = this._inputModalityDetector;
		if (mostRecentModality !== "mouse" || !mostRecentTarget || mostRecentTarget === focusEventTarget || focusEventTarget.nodeName !== "INPUT" && focusEventTarget.nodeName !== "TEXTAREA" || focusEventTarget.disabled) return false;
		const labels = focusEventTarget.labels;
		if (labels) {
			for (let i = 0; i < labels.length; i++) if (labels[i].contains(mostRecentTarget)) return true;
		}
		return false;
	}
	static ɵfac = function FocusMonitor_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FocusMonitor)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: FocusMonitor,
		factory: FocusMonitor.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FocusMonitor, [{ type: Service }], () => [], null);
})();
var CdkMonitorFocus = class CdkMonitorFocus {
	_elementRef = inject(ElementRef);
	_focusMonitor = inject(FocusMonitor);
	_monitorSubscription;
	_focusOrigin = null;
	cdkFocusChange = new EventEmitter();
	get focusOrigin() {
		return this._focusOrigin;
	}
	ngAfterViewInit() {
		const element = this._elementRef.nativeElement;
		this._monitorSubscription = this._focusMonitor.monitor(element, element.nodeType === 1 && element.hasAttribute("cdkMonitorSubtreeFocus")).subscribe((origin) => {
			this._focusOrigin = origin;
			this.cdkFocusChange.emit(origin);
		});
	}
	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef);
		this._monitorSubscription?.unsubscribe();
	}
	static ɵfac = function CdkMonitorFocus_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkMonitorFocus)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkMonitorFocus,
		selectors: [[
			"",
			"cdkMonitorElementFocus",
			""
		], [
			"",
			"cdkMonitorSubtreeFocus",
			""
		]],
		outputs: { cdkFocusChange: "cdkFocusChange" },
		exportAs: ["cdkMonitorFocus"]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkMonitorFocus, [{
		type: Directive,
		args: [{
			selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]",
			exportAs: "cdkMonitorFocus"
		}]
	}], null, { cdkFocusChange: [{ type: Output }] });
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_style-loader-chunk.mjs
var appsWithLoaders = /* @__PURE__ */ new WeakMap();
var _CdkPrivateStyleLoader = class _CdkPrivateStyleLoader {
	_appRef;
	_injector = inject(Injector);
	_environmentInjector = inject(EnvironmentInjector);
	load(loader) {
		const appRef = this._appRef = this._appRef || this._injector.get(ApplicationRef);
		let data = appsWithLoaders.get(appRef);
		if (!data) {
			data = {
				loaders: /* @__PURE__ */ new Set(),
				refs: []
			};
			appsWithLoaders.set(appRef, data);
			appRef.onDestroy(() => {
				appsWithLoaders.get(appRef)?.refs.forEach((ref) => ref.destroy());
				appsWithLoaders.delete(appRef);
			});
		}
		if (!data.loaders.has(loader)) {
			data.loaders.add(loader);
			data.refs.push(createComponent(loader, { environmentInjector: this._environmentInjector }));
		}
	}
	static ɵfac = function _CdkPrivateStyleLoader_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || _CdkPrivateStyleLoader)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: _CdkPrivateStyleLoader,
		factory: _CdkPrivateStyleLoader.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_CdkPrivateStyleLoader, [{ type: Service }], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_array-chunk.mjs
function coerceArray(value) {
	return Array.isArray(value) ? value : [value];
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_breakpoints-observer-chunk.mjs
var mediaQueriesForWebkitCompatibility = /* @__PURE__ */ new Set();
var mediaQueryStyleNode;
var MediaMatcher = class MediaMatcher {
	_platform = inject(Platform);
	_nonce = inject(CSP_NONCE, { optional: true });
	_matchMedia;
	constructor() {
		this._matchMedia = this._platform.isBrowser && window.matchMedia ? window.matchMedia.bind(window) : noopMatchMedia;
	}
	matchMedia(query) {
		if (this._platform.WEBKIT || this._platform.BLINK) createEmptyStyleRule(query, this._nonce);
		return this._matchMedia(query);
	}
	static ɵfac = function MediaMatcher_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MediaMatcher)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: MediaMatcher,
		factory: MediaMatcher.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MediaMatcher, [{ type: Service }], () => [], null);
})();
function createEmptyStyleRule(query, nonce) {
	if (mediaQueriesForWebkitCompatibility.has(query)) return;
	try {
		if (!mediaQueryStyleNode) {
			mediaQueryStyleNode = document.createElement("style");
			if (nonce) mediaQueryStyleNode.setAttribute("nonce", nonce);
			mediaQueryStyleNode.setAttribute("type", "text/css");
			document.head.appendChild(mediaQueryStyleNode);
		}
		if (mediaQueryStyleNode.sheet) {
			mediaQueryStyleNode.sheet.insertRule(`@media ${query.replace(/[{}]/g, "")} {body{ }}`, 0);
			mediaQueriesForWebkitCompatibility.add(query);
		}
	} catch (e) {
		console.error(e);
	}
}
function noopMatchMedia(query) {
	return {
		matches: query === "all" || query === "",
		media: query,
		addListener: () => {},
		removeListener: () => {}
	};
}
var BreakpointObserver = class BreakpointObserver {
	_mediaMatcher = inject(MediaMatcher);
	_zone = inject(NgZone);
	_queries = /* @__PURE__ */ new Map();
	_destroySubject = new Subject();
	ngOnDestroy() {
		this._destroySubject.next();
		this._destroySubject.complete();
	}
	isMatched(value) {
		return splitQueries(coerceArray(value)).some((mediaQuery) => this._registerQuery(mediaQuery).mql.matches);
	}
	observe(value) {
		const observables = splitQueries(coerceArray(value)).map((query) => this._registerQuery(query).observable);
		let stateObservable = combineLatest(observables);
		stateObservable = concat(stateObservable.pipe(take(1)), stateObservable.pipe(skip(1), debounceTime(0)));
		return stateObservable.pipe(map((breakpointStates) => {
			const response = {
				matches: false,
				breakpoints: {}
			};
			breakpointStates.forEach(({ matches, query }) => {
				response.matches = response.matches || matches;
				response.breakpoints[query] = matches;
			});
			return response;
		}));
	}
	_registerQuery(query) {
		if (this._queries.has(query)) return this._queries.get(query);
		const mql = this._mediaMatcher.matchMedia(query);
		const output = {
			observable: new Observable((observer) => {
				const handler = (e) => this._zone.run(() => observer.next(e));
				mql.addListener(handler);
				return () => {
					mql.removeListener(handler);
				};
			}).pipe(startWith(mql), map(({ matches }) => ({
				query,
				matches
			})), takeUntil(this._destroySubject)),
			mql
		};
		this._queries.set(query, output);
		return output;
	}
	static ɵfac = function BreakpointObserver_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BreakpointObserver)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: BreakpointObserver,
		factory: BreakpointObserver.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BreakpointObserver, [{ type: Service }], null, null);
})();
function splitQueries(queries) {
	return queries.map((query) => query.split(",")).reduce((a1, a2) => a1.concat(a2)).map((query) => query.trim());
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/observers.mjs
function shouldIgnoreRecord(record) {
	if (record.type === "characterData" && record.target instanceof Comment) return true;
	if (record.type === "childList") {
		for (let i = 0; i < record.addedNodes.length; i++) if (!(record.addedNodes[i] instanceof Comment)) return false;
		for (let i = 0; i < record.removedNodes.length; i++) if (!(record.removedNodes[i] instanceof Comment)) return false;
		return true;
	}
	return false;
}
var MutationObserverFactory = class MutationObserverFactory {
	create(callback) {
		return typeof MutationObserver === "undefined" ? null : new MutationObserver(callback);
	}
	static ɵfac = function MutationObserverFactory_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MutationObserverFactory)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: MutationObserverFactory,
		factory: MutationObserverFactory.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MutationObserverFactory, [{ type: Service }], null, null);
})();
var ContentObserver = class ContentObserver {
	_mutationObserverFactory = inject(MutationObserverFactory);
	_observedElements = /* @__PURE__ */ new Map();
	_ngZone = inject(NgZone);
	ngOnDestroy() {
		this._observedElements.forEach((_, element) => this._cleanupObserver(element));
	}
	observe(elementOrRef) {
		const element = coerceElement(elementOrRef);
		return new Observable((observer) => {
			const subscription = this._observeElement(element).pipe(map((records) => records.filter((record) => !shouldIgnoreRecord(record))), filter((records) => !!records.length)).subscribe((records) => {
				this._ngZone.run(() => {
					observer.next(records);
				});
			});
			return () => {
				subscription.unsubscribe();
				this._unobserveElement(element);
			};
		});
	}
	_observeElement(element) {
		return this._ngZone.runOutsideAngular(() => {
			if (!this._observedElements.has(element)) {
				const stream = new Subject();
				const observer = this._mutationObserverFactory.create((mutations) => stream.next(mutations));
				if (observer) observer.observe(element, {
					characterData: true,
					childList: true,
					subtree: true
				});
				this._observedElements.set(element, {
					observer,
					stream,
					count: 1
				});
			} else this._observedElements.get(element).count++;
			return this._observedElements.get(element).stream;
		});
	}
	_unobserveElement(element) {
		if (this._observedElements.has(element)) {
			this._observedElements.get(element).count--;
			if (!this._observedElements.get(element).count) this._cleanupObserver(element);
		}
	}
	_cleanupObserver(element) {
		if (this._observedElements.has(element)) {
			const { observer, stream } = this._observedElements.get(element);
			if (observer) observer.disconnect();
			stream.complete();
			this._observedElements.delete(element);
		}
	}
	static ɵfac = function ContentObserver_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentObserver)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: ContentObserver,
		factory: ContentObserver.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ContentObserver, [{ type: Service }], null, null);
})();
var CdkObserveContent = class CdkObserveContent {
	_contentObserver = inject(ContentObserver);
	_elementRef = inject(ElementRef);
	event = new EventEmitter();
	get disabled() {
		return this._disabled;
	}
	set disabled(value) {
		this._disabled = value;
		this._disabled ? this._unsubscribe() : this._subscribe();
	}
	_disabled = false;
	get debounce() {
		return this._debounce;
	}
	set debounce(value) {
		this._debounce = coerceNumberProperty(value);
		this._subscribe();
	}
	_debounce;
	_currentSubscription = null;
	ngAfterContentInit() {
		if (!this._currentSubscription && !this.disabled) this._subscribe();
	}
	ngOnDestroy() {
		this._unsubscribe();
	}
	_subscribe() {
		this._unsubscribe();
		const stream = this._contentObserver.observe(this._elementRef);
		this._currentSubscription = (this.debounce ? stream.pipe(debounceTime(this.debounce)) : stream).subscribe(this.event);
	}
	_unsubscribe() {
		this._currentSubscription?.unsubscribe();
	}
	static ɵfac = function CdkObserveContent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkObserveContent)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkObserveContent,
		selectors: [[
			"",
			"cdkObserveContent",
			""
		]],
		inputs: {
			disabled: [
				2,
				"cdkObserveContentDisabled",
				"disabled",
				booleanAttribute
			],
			debounce: "debounce"
		},
		outputs: { event: "cdkObserveContent" },
		exportAs: ["cdkObserveContent"]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkObserveContent, [{
		type: Directive,
		args: [{
			selector: "[cdkObserveContent]",
			exportAs: "cdkObserveContent"
		}]
	}], null, {
		event: [{
			type: Output,
			args: ["cdkObserveContent"]
		}],
		disabled: [{
			type: Input,
			args: [{
				alias: "cdkObserveContentDisabled",
				transform: booleanAttribute
			}]
		}],
		debounce: [{ type: Input }]
	});
})();
var ObserversModule = class ObserversModule {
	static ɵfac = function ObserversModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ObserversModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: ObserversModule,
		imports: [CdkObserveContent],
		exports: [CdkObserveContent]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ providers: [MutationObserverFactory] });
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ObserversModule, [{
		type: NgModule,
		args: [{
			imports: [CdkObserveContent],
			exports: [CdkObserveContent],
			providers: [MutationObserverFactory]
		}]
	}], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/_a11y-module-chunk.mjs
var InteractivityChecker = class InteractivityChecker {
	_platform = inject(Platform);
	isDisabled(element) {
		return element.hasAttribute("disabled");
	}
	isVisible(element) {
		return hasGeometry(element) && getComputedStyle(element).visibility === "visible";
	}
	isTabbable(element) {
		if (!this._platform.isBrowser) return false;
		const frameElement = getFrameElement(getWindow(element));
		if (frameElement) {
			if (getTabIndexValue(frameElement) === -1) return false;
			if (!this.isVisible(frameElement)) return false;
		}
		let nodeName = element.nodeName.toLowerCase();
		let tabIndexValue = getTabIndexValue(element);
		if (element.hasAttribute("contenteditable")) return tabIndexValue !== -1;
		if (nodeName === "iframe" || nodeName === "object") return false;
		if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) return false;
		if (nodeName === "audio") {
			if (!element.hasAttribute("controls")) return false;
			return tabIndexValue !== -1;
		}
		if (nodeName === "video") {
			if (tabIndexValue === -1) return false;
			if (tabIndexValue !== null) return true;
			return this._platform.FIREFOX || element.hasAttribute("controls");
		}
		return element.tabIndex >= 0;
	}
	isFocusable(element, config) {
		return isPotentiallyFocusable(element) && !this.isDisabled(element) && (config?.ignoreInert || !element.closest?.("[inert]")) && (config?.ignoreVisibility || this.isVisible(element));
	}
	static ɵfac = function InteractivityChecker_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || InteractivityChecker)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: InteractivityChecker,
		factory: InteractivityChecker.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InteractivityChecker, [{ type: Service }], null, null);
})();
function getFrameElement(window) {
	try {
		return window.frameElement;
	} catch {
		return null;
	}
}
function hasGeometry(element) {
	return !!(element.offsetWidth || element.offsetHeight || typeof element.getClientRects === "function" && element.getClientRects().length);
}
function isNativeFormElement(element) {
	let nodeName = element.nodeName.toLowerCase();
	return nodeName === "input" || nodeName === "select" || nodeName === "button" || nodeName === "textarea";
}
function isHiddenInput(element) {
	return isInputElement(element) && element.type == "hidden";
}
function isAnchorWithHref(element) {
	return isAnchorElement(element) && element.hasAttribute("href");
}
function isInputElement(element) {
	return element.nodeName.toLowerCase() == "input";
}
function isAnchorElement(element) {
	return element.nodeName.toLowerCase() == "a";
}
function hasValidTabIndex(element) {
	if (!element.hasAttribute("tabindex") || element.tabIndex === void 0) return false;
	let tabIndex = element.getAttribute("tabindex");
	return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}
function getTabIndexValue(element) {
	if (!hasValidTabIndex(element)) return null;
	const tabIndex = parseInt(element.getAttribute("tabindex") || "", 10);
	return isNaN(tabIndex) ? -1 : tabIndex;
}
function isPotentiallyTabbableIOS(element) {
	let nodeName = element.nodeName.toLowerCase();
	let inputType = nodeName === "input" && element.type;
	return inputType === "text" || inputType === "password" || nodeName === "select" || nodeName === "textarea";
}
function isPotentiallyFocusable(element) {
	if (isHiddenInput(element)) return false;
	return isNativeFormElement(element) || isAnchorWithHref(element) || element.hasAttribute("contenteditable") || hasValidTabIndex(element);
}
function getWindow(node) {
	return node.ownerDocument && node.ownerDocument.defaultView || window;
}
var FocusTrap = class {
	_element;
	_checker;
	_ngZone;
	_document;
	_injector;
	_startAnchor = null;
	_endAnchor = null;
	_hasAttached = false;
	startAnchorListener = () => {
		if (!this.focusLastTabbableElement() && this._checker.isFocusable(this._element)) this._element.focus();
	};
	endAnchorListener = () => {
		if (!this.focusFirstTabbableElement() && this._checker.isFocusable(this._element)) this._element.focus();
	};
	get enabled() {
		return this._enabled;
	}
	set enabled(value) {
		this._enabled = value;
		if (this._startAnchor && this._endAnchor) {
			this._toggleAnchorTabIndex(value, this._startAnchor);
			this._toggleAnchorTabIndex(value, this._endAnchor);
		}
	}
	_enabled = true;
	constructor(_element, _checker, _ngZone, _document, deferAnchors = false, _injector) {
		this._element = _element;
		this._checker = _checker;
		this._ngZone = _ngZone;
		this._document = _document;
		this._injector = _injector;
		if (!deferAnchors) this.attachAnchors();
	}
	destroy() {
		const startAnchor = this._startAnchor;
		const endAnchor = this._endAnchor;
		if (startAnchor) {
			startAnchor.removeEventListener("focus", this.startAnchorListener);
			startAnchor.remove();
		}
		if (endAnchor) {
			endAnchor.removeEventListener("focus", this.endAnchorListener);
			endAnchor.remove();
		}
		this._startAnchor = this._endAnchor = null;
		this._hasAttached = false;
	}
	attachAnchors() {
		if (this._hasAttached) return true;
		this._ngZone.runOutsideAngular(() => {
			if (!this._startAnchor) {
				this._startAnchor = this._createAnchor();
				this._startAnchor.addEventListener("focus", this.startAnchorListener);
			}
			if (!this._endAnchor) {
				this._endAnchor = this._createAnchor();
				this._endAnchor.addEventListener("focus", this.endAnchorListener);
			}
		});
		if (this._element.parentNode) {
			this._element.parentNode.insertBefore(this._startAnchor, this._element);
			this._element.parentNode.insertBefore(this._endAnchor, this._element.nextSibling);
			this._hasAttached = true;
		}
		return this._hasAttached;
	}
	focusInitialElementWhenReady(options) {
		return new Promise((resolve) => {
			this._executeOnStable(() => resolve(this.focusInitialElement(options)));
		});
	}
	focusFirstTabbableElementWhenReady(options) {
		return new Promise((resolve) => {
			this._executeOnStable(() => resolve(this.focusFirstTabbableElement(options)));
		});
	}
	focusLastTabbableElementWhenReady(options) {
		return new Promise((resolve) => {
			this._executeOnStable(() => resolve(this.focusLastTabbableElement(options)));
		});
	}
	_getRegionBoundary(bound) {
		const markers = this._element.querySelectorAll(`[cdk-focus-region-${bound}], [cdkFocusRegion${bound}], [cdk-focus-${bound}]`);
		if (typeof ngDevMode === "undefined" || ngDevMode) {
			for (let i = 0; i < markers.length; i++) if (markers[i].hasAttribute(`cdk-focus-${bound}`)) console.warn(`Found use of deprecated attribute 'cdk-focus-${bound}', use 'cdkFocusRegion${bound}' instead. The deprecated attribute will be removed in 8.0.0.`, markers[i]);
			else if (markers[i].hasAttribute(`cdk-focus-region-${bound}`)) console.warn(`Found use of deprecated attribute 'cdk-focus-region-${bound}', use 'cdkFocusRegion${bound}' instead. The deprecated attribute will be removed in 8.0.0.`, markers[i]);
		}
		if (bound == "start") return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
		return markers.length ? markers[markers.length - 1] : this._getLastTabbableElement(this._element);
	}
	focusInitialElement(options) {
		const redirectToElement = this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]");
		if (redirectToElement) {
			if ((typeof ngDevMode === "undefined" || ngDevMode) && redirectToElement.hasAttribute(`cdk-focus-initial`)) console.warn("Found use of deprecated attribute 'cdk-focus-initial', use 'cdkFocusInitial' instead. The deprecated attribute will be removed in 8.0.0", redirectToElement);
			if ((typeof ngDevMode === "undefined" || ngDevMode) && !this._checker.isFocusable(redirectToElement)) console.warn(`Element matching '[cdkFocusInitial]' is not focusable.`, redirectToElement);
			if (!this._checker.isFocusable(redirectToElement)) {
				const focusableChild = this._getFirstTabbableElement(redirectToElement);
				focusableChild?.focus(options);
				return !!focusableChild;
			}
			redirectToElement.focus(options);
			return true;
		}
		return this.focusFirstTabbableElement(options);
	}
	focusFirstTabbableElement(options) {
		const redirectToElement = this._getRegionBoundary("start");
		if (redirectToElement) redirectToElement.focus(options);
		return !!redirectToElement;
	}
	focusLastTabbableElement(options) {
		const redirectToElement = this._getRegionBoundary("end");
		if (redirectToElement) redirectToElement.focus(options);
		return !!redirectToElement;
	}
	hasAttached() {
		return this._hasAttached;
	}
	_getFirstTabbableElement(root) {
		if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) return root;
		const children = root.children;
		for (let i = 0; i < children.length; i++) {
			const tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ? this._getFirstTabbableElement(children[i]) : null;
			if (tabbableChild) return tabbableChild;
		}
		return null;
	}
	_getLastTabbableElement(root) {
		if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) return root;
		const children = root.children;
		for (let i = children.length - 1; i >= 0; i--) {
			const tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ? this._getLastTabbableElement(children[i]) : null;
			if (tabbableChild) return tabbableChild;
		}
		return null;
	}
	_createAnchor() {
		const anchor = this._document.createElement("div");
		this._toggleAnchorTabIndex(this._enabled, anchor);
		anchor.classList.add("cdk-visually-hidden");
		anchor.classList.add("cdk-focus-trap-anchor");
		anchor.setAttribute("aria-hidden", "true");
		return anchor;
	}
	_toggleAnchorTabIndex(isEnabled, anchor) {
		isEnabled ? anchor.setAttribute("tabindex", "0") : anchor.removeAttribute("tabindex");
	}
	toggleAnchors(enabled) {
		if (this._startAnchor && this._endAnchor) {
			this._toggleAnchorTabIndex(enabled, this._startAnchor);
			this._toggleAnchorTabIndex(enabled, this._endAnchor);
		}
	}
	_executeOnStable(fn) {
		afterNextRender(fn, { injector: this._injector });
	}
};
var FocusTrapFactory = class FocusTrapFactory {
	_checker = inject(InteractivityChecker);
	_ngZone = inject(NgZone);
	_document = inject(DOCUMENT);
	_injector = inject(Injector);
	constructor() {
		inject(_CdkPrivateStyleLoader).load(_VisuallyHiddenLoader);
	}
	create(element, deferCaptureElements = false) {
		return new FocusTrap(element, this._checker, this._ngZone, this._document, deferCaptureElements, this._injector);
	}
	static ɵfac = function FocusTrapFactory_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FocusTrapFactory)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: FocusTrapFactory,
		factory: FocusTrapFactory.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FocusTrapFactory, [{ type: Service }], () => [], null);
})();
var CdkTrapFocus = class CdkTrapFocus {
	_elementRef = inject(ElementRef);
	_focusTrapFactory = inject(FocusTrapFactory);
	focusTrap = void 0;
	_previouslyFocusedElement = null;
	get enabled() {
		return this.focusTrap?.enabled || false;
	}
	set enabled(value) {
		if (this.focusTrap) this.focusTrap.enabled = value;
	}
	autoCapture = false;
	constructor() {
		if (inject(Platform).isBrowser) this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
	}
	ngOnDestroy() {
		this.focusTrap?.destroy();
		if (this._previouslyFocusedElement) {
			this._previouslyFocusedElement.focus();
			this._previouslyFocusedElement = null;
		}
	}
	ngAfterContentInit() {
		this.focusTrap?.attachAnchors();
		if (this.autoCapture) this._captureFocus();
	}
	ngDoCheck() {
		if (this.focusTrap && !this.focusTrap.hasAttached()) this.focusTrap.attachAnchors();
	}
	ngOnChanges(changes) {
		const autoCaptureChange = changes["autoCapture"];
		if (autoCaptureChange && !autoCaptureChange.firstChange && this.autoCapture && this.focusTrap?.hasAttached()) this._captureFocus();
	}
	_captureFocus() {
		this._previouslyFocusedElement = _getFocusedElementPierceShadowDom();
		this.focusTrap?.focusInitialElementWhenReady();
	}
	static ɵfac = function CdkTrapFocus_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkTrapFocus)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkTrapFocus,
		selectors: [[
			"",
			"cdkTrapFocus",
			""
		]],
		inputs: {
			enabled: [
				2,
				"cdkTrapFocus",
				"enabled",
				booleanAttribute
			],
			autoCapture: [
				2,
				"cdkTrapFocusAutoCapture",
				"autoCapture",
				booleanAttribute
			]
		},
		exportAs: ["cdkTrapFocus"],
		features: [ɵɵNgOnChangesFeature]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkTrapFocus, [{
		type: Directive,
		args: [{
			selector: "[cdkTrapFocus]",
			exportAs: "cdkTrapFocus"
		}]
	}], () => [], {
		enabled: [{
			type: Input,
			args: [{
				alias: "cdkTrapFocus",
				transform: booleanAttribute
			}]
		}],
		autoCapture: [{
			type: Input,
			args: [{
				alias: "cdkTrapFocusAutoCapture",
				transform: booleanAttribute
			}]
		}]
	});
})();
var LIVE_ANNOUNCER_ELEMENT_TOKEN = new InjectionToken("liveAnnouncerElement", {
	providedIn: "root",
	factory: () => null
});
var LIVE_ANNOUNCER_DEFAULT_OPTIONS = new InjectionToken("LIVE_ANNOUNCER_DEFAULT_OPTIONS");
var uniqueIds = 0;
var LiveAnnouncer = class LiveAnnouncer {
	_ngZone = inject(NgZone);
	_defaultOptions = inject(LIVE_ANNOUNCER_DEFAULT_OPTIONS, { optional: true });
	_liveElement;
	_document = inject(DOCUMENT);
	_sanitizer = inject(DomSanitizer);
	_previousTimeout;
	_currentPromise;
	_currentResolve;
	constructor() {
		const elementToken = inject(LIVE_ANNOUNCER_ELEMENT_TOKEN, { optional: true });
		this._liveElement = elementToken || this._createLiveElement();
	}
	announce(message, ...args) {
		const defaultOptions = this._defaultOptions;
		let politeness;
		let duration;
		if (args.length === 1 && typeof args[0] === "number") duration = args[0];
		else [politeness, duration] = args;
		this.clear();
		clearTimeout(this._previousTimeout);
		if (!politeness) politeness = defaultOptions && defaultOptions.politeness ? defaultOptions.politeness : "polite";
		if (duration == null && defaultOptions) duration = defaultOptions.duration;
		this._liveElement.setAttribute("aria-live", politeness);
		if (this._liveElement.id) this._exposeAnnouncerToModals(this._liveElement.id);
		return this._ngZone.runOutsideAngular(() => {
			if (!this._currentPromise) this._currentPromise = new Promise((resolve) => this._currentResolve = resolve);
			clearTimeout(this._previousTimeout);
			this._previousTimeout = setTimeout(() => {
				if (!message || typeof message === "string") this._liveElement.textContent = message;
				else _setInnerHtml(this._liveElement, message, this._sanitizer);
				if (typeof duration === "number") this._previousTimeout = setTimeout(() => this.clear(), duration);
				this._currentResolve?.();
				this._currentPromise = this._currentResolve = void 0;
			}, 100);
			return this._currentPromise;
		});
	}
	clear() {
		if (this._liveElement) this._liveElement.textContent = "";
	}
	ngOnDestroy() {
		clearTimeout(this._previousTimeout);
		this._liveElement?.remove();
		this._liveElement = null;
		this._currentResolve?.();
		this._currentPromise = this._currentResolve = void 0;
	}
	_createLiveElement() {
		const elementClass = "cdk-live-announcer-element";
		const previousElements = this._document.getElementsByClassName(elementClass);
		const liveEl = this._document.createElement("div");
		for (let i = 0; i < previousElements.length; i++) previousElements[i].remove();
		liveEl.classList.add(elementClass);
		liveEl.classList.add("cdk-visually-hidden");
		liveEl.setAttribute("aria-atomic", "true");
		liveEl.setAttribute("aria-live", "polite");
		liveEl.id = `cdk-live-announcer-${uniqueIds++}`;
		this._document.body.appendChild(liveEl);
		return liveEl;
	}
	_exposeAnnouncerToModals(id) {
		const modals = this._document.querySelectorAll("body > .cdk-overlay-container [aria-modal=\"true\"]");
		for (let i = 0; i < modals.length; i++) {
			const modal = modals[i];
			const ariaOwns = modal.getAttribute("aria-owns");
			if (!ariaOwns) modal.setAttribute("aria-owns", id);
			else if (ariaOwns.indexOf(id) === -1) modal.setAttribute("aria-owns", ariaOwns + " " + id);
		}
	}
	static ɵfac = function LiveAnnouncer_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LiveAnnouncer)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: LiveAnnouncer,
		factory: LiveAnnouncer.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LiveAnnouncer, [{ type: Service }], () => [], null);
})();
var CdkAriaLive = class CdkAriaLive {
	_elementRef = inject(ElementRef);
	_liveAnnouncer = inject(LiveAnnouncer);
	_contentObserver = inject(ContentObserver);
	_ngZone = inject(NgZone);
	get politeness() {
		return this._politeness;
	}
	set politeness(value) {
		this._politeness = value === "off" || value === "assertive" ? value : "polite";
		if (this._politeness === "off") {
			if (this._subscription) {
				this._subscription.unsubscribe();
				this._subscription = void 0;
			}
		} else if (!this._subscription) this._subscription = this._ngZone.runOutsideAngular(() => {
			return this._contentObserver.observe(this._elementRef).subscribe(() => {
				const elementText = this._elementRef.nativeElement.textContent;
				if (elementText !== this._previousAnnouncedText) {
					this._liveAnnouncer.announce(elementText, this._politeness, this.duration);
					this._previousAnnouncedText = elementText;
				}
			});
		});
	}
	_politeness = "polite";
	duration;
	_previousAnnouncedText;
	_subscription;
	constructor() {
		inject(_CdkPrivateStyleLoader).load(_VisuallyHiddenLoader);
	}
	ngOnDestroy() {
		this._subscription?.unsubscribe();
	}
	static ɵfac = function CdkAriaLive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CdkAriaLive)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CdkAriaLive,
		selectors: [[
			"",
			"cdkAriaLive",
			""
		]],
		inputs: {
			politeness: [
				0,
				"cdkAriaLive",
				"politeness"
			],
			duration: [
				0,
				"cdkAriaLiveDuration",
				"duration"
			]
		},
		exportAs: ["cdkAriaLive"]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkAriaLive, [{
		type: Directive,
		args: [{
			selector: "[cdkAriaLive]",
			exportAs: "cdkAriaLive"
		}]
	}], () => [], {
		politeness: [{
			type: Input,
			args: ["cdkAriaLive"]
		}],
		duration: [{
			type: Input,
			args: ["cdkAriaLiveDuration"]
		}]
	});
})();
var HighContrastMode;
(function(HighContrastMode) {
	HighContrastMode[HighContrastMode["NONE"] = 0] = "NONE";
	HighContrastMode[HighContrastMode["BLACK_ON_WHITE"] = 1] = "BLACK_ON_WHITE";
	HighContrastMode[HighContrastMode["WHITE_ON_BLACK"] = 2] = "WHITE_ON_BLACK";
})(HighContrastMode || (HighContrastMode = {}));
var BLACK_ON_WHITE_CSS_CLASS = "cdk-high-contrast-black-on-white";
var WHITE_ON_BLACK_CSS_CLASS = "cdk-high-contrast-white-on-black";
var HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = "cdk-high-contrast-active";
var HighContrastModeDetector = class HighContrastModeDetector {
	_platform = inject(Platform);
	_hasCheckedHighContrastMode = false;
	_document = inject(DOCUMENT);
	_breakpointSubscription;
	constructor() {
		this._breakpointSubscription = inject(BreakpointObserver).observe("(forced-colors: active)").subscribe(() => {
			if (this._hasCheckedHighContrastMode) {
				this._hasCheckedHighContrastMode = false;
				this._applyBodyHighContrastModeCssClasses();
			}
		});
	}
	getHighContrastMode() {
		if (!this._platform.isBrowser) return HighContrastMode.NONE;
		const testElement = this._document.createElement("div");
		testElement.style.backgroundColor = "rgb(1,2,3)";
		testElement.style.position = "absolute";
		this._document.body.appendChild(testElement);
		const documentWindow = this._document.defaultView || window;
		const computedStyle = documentWindow && documentWindow.getComputedStyle ? documentWindow.getComputedStyle(testElement) : null;
		const computedColor = (computedStyle && computedStyle.backgroundColor || "").replace(/ /g, "");
		testElement.remove();
		switch (computedColor) {
			case "rgb(0,0,0)":
			case "rgb(45,50,54)":
			case "rgb(32,32,32)": return HighContrastMode.WHITE_ON_BLACK;
			case "rgb(255,255,255)":
			case "rgb(255,250,239)": return HighContrastMode.BLACK_ON_WHITE;
		}
		return HighContrastMode.NONE;
	}
	ngOnDestroy() {
		this._breakpointSubscription.unsubscribe();
	}
	_applyBodyHighContrastModeCssClasses() {
		if (!this._hasCheckedHighContrastMode && this._platform.isBrowser && this._document.body) {
			const bodyClasses = this._document.body.classList;
			bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
			this._hasCheckedHighContrastMode = true;
			const mode = this.getHighContrastMode();
			if (mode === HighContrastMode.BLACK_ON_WHITE) bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS);
			else if (mode === HighContrastMode.WHITE_ON_BLACK) bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
		}
	}
	static ɵfac = function HighContrastModeDetector_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || HighContrastModeDetector)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: HighContrastModeDetector,
		factory: HighContrastModeDetector.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HighContrastModeDetector, [{ type: Service }], () => [], null);
})();
var A11yModule = class A11yModule {
	constructor() {
		inject(HighContrastModeDetector)._applyBodyHighContrastModeCssClasses();
	}
	static ɵfac = function A11yModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || A11yModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({
		type: A11yModule,
		imports: [
			ObserversModule,
			CdkAriaLive,
			CdkTrapFocus,
			CdkMonitorFocus
		],
		exports: [
			CdkAriaLive,
			CdkTrapFocus,
			CdkMonitorFocus
		]
	});
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [ObserversModule] });
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(A11yModule, [{
		type: NgModule,
		args: [{
			imports: [
				ObserversModule,
				CdkAriaLive,
				CdkTrapFocus,
				CdkMonitorFocus
			],
			exports: [
				CdkAriaLive,
				CdkTrapFocus,
				CdkMonitorFocus
			]
		}]
	}], () => [], null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/a11y.mjs
var ID_DELIMITER = " ";
function addAriaReferencedId(el, attr, id) {
	const ids = getAriaReferenceIds(el, attr);
	id = id.trim();
	if (ids.some((existingId) => existingId.trim() === id)) return;
	ids.push(id);
	el.setAttribute(attr, ids.join(ID_DELIMITER));
}
function removeAriaReferencedId(el, attr, id) {
	const ids = getAriaReferenceIds(el, attr);
	id = id.trim();
	const filteredIds = ids.filter((val) => val !== id);
	if (filteredIds.length) el.setAttribute(attr, filteredIds.join(ID_DELIMITER));
	else el.removeAttribute(attr);
}
function getAriaReferenceIds(el, attr) {
	return el.getAttribute(attr)?.match(/\S+/g) ?? [];
}
var CDK_DESCRIBEDBY_ID_PREFIX = "cdk-describedby-message";
var CDK_DESCRIBEDBY_HOST_ATTRIBUTE = "cdk-describedby-host";
var nextId = 0;
var AriaDescriber = class AriaDescriber {
	_platform = inject(Platform);
	_document = inject(DOCUMENT);
	_messageRegistry = /* @__PURE__ */ new Map();
	_messagesContainer = null;
	_id = `${nextId++}`;
	constructor() {
		inject(_CdkPrivateStyleLoader).load(_VisuallyHiddenLoader);
		this._id = inject(APP_ID) + "-" + nextId++;
	}
	describe(hostElement, message, role) {
		if (!this._canBeDescribed(hostElement, message)) return;
		const key = getKey(message, role);
		if (typeof message !== "string") {
			setMessageId(message, this._id);
			this._messageRegistry.set(key, {
				messageElement: message,
				referenceCount: 0
			});
		} else if (!this._messageRegistry.has(key)) this._createMessageElement(message, role);
		if (!this._isElementDescribedByMessage(hostElement, key)) this._addMessageReference(hostElement, key);
	}
	removeDescription(hostElement, message, role) {
		if (!message || !this._isElementNode(hostElement)) return;
		const key = getKey(message, role);
		if (this._isElementDescribedByMessage(hostElement, key)) this._removeMessageReference(hostElement, key);
		if (typeof message === "string") {
			const registeredMessage = this._messageRegistry.get(key);
			if (registeredMessage && registeredMessage.referenceCount === 0) this._deleteMessageElement(key);
		}
		if (this._messagesContainer?.childNodes.length === 0) {
			this._messagesContainer.remove();
			this._messagesContainer = null;
		}
	}
	ngOnDestroy() {
		const describedElements = this._document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}="${this._id}"]`);
		for (let i = 0; i < describedElements.length; i++) {
			this._removeCdkDescribedByReferenceIds(describedElements[i]);
			describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
		}
		this._messagesContainer?.remove();
		this._messagesContainer = null;
		this._messageRegistry.clear();
	}
	_createMessageElement(message, role) {
		const messageElement = this._document.createElement("div");
		setMessageId(messageElement, this._id);
		messageElement.textContent = message;
		if (role) messageElement.setAttribute("role", role);
		this._createMessagesContainer();
		this._messagesContainer.appendChild(messageElement);
		this._messageRegistry.set(getKey(message, role), {
			messageElement,
			referenceCount: 0
		});
	}
	_deleteMessageElement(key) {
		this._messageRegistry.get(key)?.messageElement?.remove();
		this._messageRegistry.delete(key);
	}
	_createMessagesContainer() {
		if (this._messagesContainer) return;
		const containerClassName = "cdk-describedby-message-container";
		const serverContainers = this._document.querySelectorAll(`.${containerClassName}[platform="server"]`);
		for (let i = 0; i < serverContainers.length; i++) serverContainers[i].remove();
		const messagesContainer = this._document.createElement("div");
		messagesContainer.style.visibility = "hidden";
		messagesContainer.classList.add(containerClassName);
		messagesContainer.classList.add("cdk-visually-hidden");
		if (!this._platform.isBrowser) messagesContainer.setAttribute("platform", "server");
		this._document.body.appendChild(messagesContainer);
		this._messagesContainer = messagesContainer;
	}
	_removeCdkDescribedByReferenceIds(element) {
		const originalReferenceIds = getAriaReferenceIds(element, "aria-describedby").filter((id) => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
		element.setAttribute("aria-describedby", originalReferenceIds.join(" "));
	}
	_addMessageReference(element, key) {
		const registeredMessage = this._messageRegistry.get(key);
		addAriaReferencedId(element, "aria-describedby", registeredMessage.messageElement.id);
		element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, this._id);
		registeredMessage.referenceCount++;
	}
	_removeMessageReference(element, key) {
		const registeredMessage = this._messageRegistry.get(key);
		registeredMessage.referenceCount--;
		removeAriaReferencedId(element, "aria-describedby", registeredMessage.messageElement.id);
		element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
	}
	_isElementDescribedByMessage(element, key) {
		const referenceIds = getAriaReferenceIds(element, "aria-describedby");
		const registeredMessage = this._messageRegistry.get(key);
		const messageId = registeredMessage && registeredMessage.messageElement.id;
		return !!messageId && referenceIds.indexOf(messageId) != -1;
	}
	_canBeDescribed(element, message) {
		if (!this._isElementNode(element)) return false;
		if (message && typeof message === "object") return true;
		const trimmedMessage = message == null ? "" : `${message}`.trim();
		const ariaLabel = element.getAttribute("aria-label");
		return trimmedMessage ? !ariaLabel || ariaLabel.trim() !== trimmedMessage : false;
	}
	_isElementNode(element) {
		return element.nodeType === this._document.ELEMENT_NODE;
	}
	static ɵfac = function AriaDescriber_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || AriaDescriber)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: AriaDescriber,
		factory: AriaDescriber.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AriaDescriber, [{ type: Service }], () => [], null);
})();
function getKey(message, role) {
	return typeof message === "string" ? `${role || ""}/${message}` : message;
}
function setMessageId(element, serviceId) {
	if (!element.id) element.id = `${CDK_DESCRIBEDBY_ID_PREFIX}-${serviceId}-${nextId++}`;
}
var ConfigurableFocusTrap = class extends FocusTrap {
	_focusTrapManager;
	_inertStrategy;
	get enabled() {
		return this._enabled;
	}
	set enabled(value) {
		this._enabled = value;
		if (this._enabled) this._focusTrapManager.register(this);
		else this._focusTrapManager.deregister(this);
	}
	constructor(_element, _checker, _ngZone, _document, _focusTrapManager, _inertStrategy, config, injector) {
		super(_element, _checker, _ngZone, _document, config.defer, injector);
		this._focusTrapManager = _focusTrapManager;
		this._inertStrategy = _inertStrategy;
		this._focusTrapManager.register(this);
	}
	destroy() {
		this._focusTrapManager.deregister(this);
		super.destroy();
	}
	_enable() {
		this._inertStrategy.preventFocus(this);
		this.toggleAnchors(true);
	}
	_disable() {
		this._inertStrategy.allowFocus(this);
		this.toggleAnchors(false);
	}
};
var EventListenerFocusTrapInertStrategy = class {
	_listener = null;
	preventFocus(focusTrap) {
		if (this._listener) focusTrap._document.removeEventListener("focus", this._listener, true);
		this._listener = (e) => this._trapFocus(focusTrap, e);
		focusTrap._ngZone.runOutsideAngular(() => {
			focusTrap._document.addEventListener("focus", this._listener, true);
		});
	}
	allowFocus(focusTrap) {
		if (!this._listener) return;
		focusTrap._document.removeEventListener("focus", this._listener, true);
		this._listener = null;
	}
	_trapFocus(focusTrap, event) {
		const target = event.target;
		const focusTrapRoot = focusTrap._element;
		if (target && !focusTrapRoot.contains(target) && !target.closest?.("div.cdk-overlay-pane")) setTimeout(() => {
			if (focusTrap.enabled && !focusTrapRoot.contains(focusTrap._document.activeElement)) focusTrap.focusFirstTabbableElement();
		});
	}
};
var FOCUS_TRAP_INERT_STRATEGY = new InjectionToken("FOCUS_TRAP_INERT_STRATEGY");
var FocusTrapManager = class FocusTrapManager {
	_focusTrapStack = [];
	register(focusTrap) {
		this._focusTrapStack = this._focusTrapStack.filter((ft) => ft !== focusTrap);
		let stack = this._focusTrapStack;
		if (stack.length) stack[stack.length - 1]._disable();
		stack.push(focusTrap);
		focusTrap._enable();
	}
	deregister(focusTrap) {
		focusTrap._disable();
		const stack = this._focusTrapStack;
		const i = stack.indexOf(focusTrap);
		if (i !== -1) {
			stack.splice(i, 1);
			if (stack.length) stack[stack.length - 1]._enable();
		}
	}
	static ɵfac = function FocusTrapManager_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FocusTrapManager)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: FocusTrapManager,
		factory: FocusTrapManager.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FocusTrapManager, [{ type: Service }], null, null);
})();
var ConfigurableFocusTrapFactory = class ConfigurableFocusTrapFactory {
	_checker = inject(InteractivityChecker);
	_ngZone = inject(NgZone);
	_focusTrapManager = inject(FocusTrapManager);
	_document = inject(DOCUMENT);
	_inertStrategy;
	_injector = inject(Injector);
	constructor() {
		const inertStrategy = inject(FOCUS_TRAP_INERT_STRATEGY, { optional: true });
		this._inertStrategy = inertStrategy || new EventListenerFocusTrapInertStrategy();
	}
	create(element, config = { defer: false }) {
		return new ConfigurableFocusTrap(element, this._checker, this._ngZone, this._document, this._focusTrapManager, this._inertStrategy, config, this._injector);
	}
	static ɵfac = function ConfigurableFocusTrapFactory_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ConfigurableFocusTrapFactory)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: ConfigurableFocusTrapFactory,
		factory: ConfigurableFocusTrapFactory.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ConfigurableFocusTrapFactory, [{ type: Service }], () => [], null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/platform.mjs
var PlatformModule = class PlatformModule {
	static ɵfac = function PlatformModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || PlatformModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: PlatformModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformModule, [{
		type: NgModule,
		args: [{}]
	}], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/cdk/fesm2022/layout.mjs
var LayoutModule = class LayoutModule {
	static ɵfac = function LayoutModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LayoutModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: LayoutModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LayoutModule, [{
		type: NgModule,
		args: [{}]
	}], null, null);
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/material/fesm2022/_animation-chunk.mjs
var MATERIAL_ANIMATIONS = new InjectionToken("MATERIAL_ANIMATIONS");
var reducedMotion = null;
function _getAnimationsState() {
	if (inject(MATERIAL_ANIMATIONS, { optional: true })?.animationsDisabled || inject(ANIMATION_MODULE_TYPE, { optional: true }) === "NoopAnimations") return "di-disabled";
	reducedMotion ??= inject(MediaMatcher).matchMedia("(prefers-reduced-motion)").matches;
	return reducedMotion ? "reduced-motion" : "enabled";
}
function _animationsDisabled() {
	return _getAnimationsState() !== "enabled";
}
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/material/fesm2022/_ripple-chunk.mjs
var RippleState;
(function(RippleState) {
	RippleState[RippleState["FADING_IN"] = 0] = "FADING_IN";
	RippleState[RippleState["VISIBLE"] = 1] = "VISIBLE";
	RippleState[RippleState["FADING_OUT"] = 2] = "FADING_OUT";
	RippleState[RippleState["HIDDEN"] = 3] = "HIDDEN";
})(RippleState || (RippleState = {}));
var RippleRef = class {
	_renderer;
	element;
	config;
	_animationForciblyDisabledThroughCss;
	state = RippleState.HIDDEN;
	constructor(_renderer, element, config, _animationForciblyDisabledThroughCss = false) {
		this._renderer = _renderer;
		this.element = element;
		this.config = config;
		this._animationForciblyDisabledThroughCss = _animationForciblyDisabledThroughCss;
	}
	fadeOut() {
		this._renderer.fadeOutRipple(this);
	}
};
var passiveCapturingEventOptions$1 = normalizePassiveListenerOptions({
	passive: true,
	capture: true
});
var RippleEventManager = class {
	_events = /* @__PURE__ */ new Map();
	addHandler(ngZone, name, element, handler) {
		const handlersForEvent = this._events.get(name);
		if (handlersForEvent) {
			const handlersForElement = handlersForEvent.get(element);
			if (handlersForElement) handlersForElement.add(handler);
			else handlersForEvent.set(element, /* @__PURE__ */ new Set([handler]));
		} else {
			this._events.set(name, /* @__PURE__ */ new Map([[element, /* @__PURE__ */ new Set([handler])]]));
			ngZone.runOutsideAngular(() => {
				document.addEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions$1);
			});
		}
	}
	removeHandler(name, element, handler) {
		const handlersForEvent = this._events.get(name);
		if (!handlersForEvent) return;
		const handlersForElement = handlersForEvent.get(element);
		if (!handlersForElement) return;
		handlersForElement.delete(handler);
		if (handlersForElement.size === 0) handlersForEvent.delete(element);
		if (handlersForEvent.size === 0) {
			this._events.delete(name);
			document.removeEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions$1);
		}
	}
	_delegateEventHandler = (event) => {
		const target = _getEventTarget(event);
		if (target) this._events.get(event.type)?.forEach((handlers, element) => {
			if (element === target || element.contains(target)) handlers.forEach((handler) => handler.handleEvent(event));
		});
	};
};
var defaultRippleAnimationConfig = {
	enterDuration: 225,
	exitDuration: 150
};
var ignoreMouseEventsTimeout = 800;
var passiveCapturingEventOptions = normalizePassiveListenerOptions({
	passive: true,
	capture: true
});
var pointerDownEvents = ["mousedown", "touchstart"];
var pointerUpEvents = [
	"mouseup",
	"mouseleave",
	"touchend",
	"touchcancel"
];
var _MatRippleStylesLoader = class _MatRippleStylesLoader {
	static ɵfac = function _MatRippleStylesLoader_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || _MatRippleStylesLoader)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: _MatRippleStylesLoader,
		selectors: [["ng-component"]],
		hostAttrs: ["mat-ripple-style-loader", ""],
		decls: 0,
		vars: 0,
		template: function _MatRippleStylesLoader_Template(rf, ctx) {},
		styles: [".mat-ripple {\n  overflow: hidden;\n  position: relative;\n}\n.mat-ripple:not(:empty) {\n  transform: translateZ(0);\n}\n\n.mat-ripple.mat-ripple-unbounded {\n  overflow: visible;\n}\n\n.mat-ripple-element {\n  position: absolute;\n  border-radius: 50%;\n  pointer-events: none;\n  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);\n  transform: scale3d(0, 0, 0);\n  background-color: var(--%NS%mat-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 10%, transparent));\n}\n@media (forced-colors: active) {\n  .mat-ripple-element {\n    display: none;\n  }\n}\n.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {\n  display: none;\n}\n"],
		encapsulation: 2
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_MatRippleStylesLoader, [{
		type: Component,
		args: [{
			template: "",
			encapsulation: ViewEncapsulation.None,
			host: { "mat-ripple-style-loader": "" },
			styles: [".mat-ripple {\n  overflow: hidden;\n  position: relative;\n}\n.mat-ripple:not(:empty) {\n  transform: translateZ(0);\n}\n\n.mat-ripple.mat-ripple-unbounded {\n  overflow: visible;\n}\n\n.mat-ripple-element {\n  position: absolute;\n  border-radius: 50%;\n  pointer-events: none;\n  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);\n  transform: scale3d(0, 0, 0);\n  background-color: var(--mat-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent));\n}\n@media (forced-colors: active) {\n  .mat-ripple-element {\n    display: none;\n  }\n}\n.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {\n  display: none;\n}\n"]
		}]
	}], null, null);
})();
var RippleRenderer = class RippleRenderer {
	_target;
	_ngZone;
	_platform;
	_containerElement;
	_triggerElement = null;
	_isPointerDown = false;
	_activeRipples = /* @__PURE__ */ new Map();
	_mostRecentTransientRipple = null;
	_lastTouchStartEvent;
	_pointerUpEventsRegistered = false;
	_containerRect = null;
	static _eventManager = new RippleEventManager();
	constructor(_target, _ngZone, elementOrElementRef, _platform, injector) {
		this._target = _target;
		this._ngZone = _ngZone;
		this._platform = _platform;
		if (_platform.isBrowser) this._containerElement = coerceElement(elementOrElementRef);
		if (injector) injector.get(_CdkPrivateStyleLoader).load(_MatRippleStylesLoader);
	}
	fadeInRipple(x, y, config = {}) {
		const containerRect = this._containerRect = this._containerRect || this._containerElement.getBoundingClientRect();
		const animationConfig = {
			...defaultRippleAnimationConfig,
			...config.animation
		};
		if (config.centered) {
			x = containerRect.left + containerRect.width / 2;
			y = containerRect.top + containerRect.height / 2;
		}
		const radius = config.radius || distanceToFurthestCorner(x, y, containerRect);
		const offsetX = x - containerRect.left;
		const offsetY = y - containerRect.top;
		const enterDuration = animationConfig.enterDuration;
		const ripple = document.createElement("div");
		ripple.classList.add("mat-ripple-element");
		ripple.style.left = `${offsetX - radius}px`;
		ripple.style.top = `${offsetY - radius}px`;
		ripple.style.height = `${radius * 2}px`;
		ripple.style.width = `${radius * 2}px`;
		if (config.color != null) ripple.style.backgroundColor = config.color;
		ripple.style.transitionDuration = `${enterDuration}ms`;
		this._containerElement.appendChild(ripple);
		const computedStyles = window.getComputedStyle(ripple);
		const userTransitionProperty = computedStyles.transitionProperty;
		const userTransitionDuration = computedStyles.transitionDuration;
		const animationForciblyDisabledThroughCss = userTransitionProperty === "none" || userTransitionDuration === "0s" || userTransitionDuration === "0s, 0s" || containerRect.width === 0 && containerRect.height === 0;
		const rippleRef = new RippleRef(this, ripple, config, animationForciblyDisabledThroughCss);
		ripple.style.transform = "scale3d(1, 1, 1)";
		rippleRef.state = RippleState.FADING_IN;
		if (!config.persistent) this._mostRecentTransientRipple = rippleRef;
		let eventListeners = null;
		if (!animationForciblyDisabledThroughCss && (enterDuration || animationConfig.exitDuration)) this._ngZone.runOutsideAngular(() => {
			const onTransitionEnd = () => {
				if (eventListeners) eventListeners.fallbackTimer = null;
				clearTimeout(fallbackTimer);
				this._finishRippleTransition(rippleRef);
			};
			const onTransitionCancel = () => this._destroyRipple(rippleRef);
			const fallbackTimer = setTimeout(onTransitionCancel, enterDuration + 100);
			ripple.addEventListener("transitionend", onTransitionEnd);
			ripple.addEventListener("transitioncancel", onTransitionCancel);
			eventListeners = {
				onTransitionEnd,
				onTransitionCancel,
				fallbackTimer
			};
		});
		this._activeRipples.set(rippleRef, eventListeners);
		if (animationForciblyDisabledThroughCss || !enterDuration) this._finishRippleTransition(rippleRef);
		return rippleRef;
	}
	fadeOutRipple(rippleRef) {
		if (rippleRef.state === RippleState.FADING_OUT || rippleRef.state === RippleState.HIDDEN) return;
		const rippleEl = rippleRef.element;
		const animationConfig = {
			...defaultRippleAnimationConfig,
			...rippleRef.config.animation
		};
		rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
		rippleEl.style.opacity = "0";
		rippleRef.state = RippleState.FADING_OUT;
		if (rippleRef._animationForciblyDisabledThroughCss || !animationConfig.exitDuration) this._finishRippleTransition(rippleRef);
	}
	fadeOutAll() {
		this._getActiveRipples().forEach((ripple) => ripple.fadeOut());
	}
	fadeOutAllNonPersistent() {
		this._getActiveRipples().forEach((ripple) => {
			if (!ripple.config.persistent) ripple.fadeOut();
		});
	}
	setupTriggerEvents(elementOrElementRef) {
		const element = coerceElement(elementOrElementRef);
		if (!this._platform.isBrowser || !element || element === this._triggerElement) return;
		this._removeTriggerEvents();
		this._triggerElement = element;
		pointerDownEvents.forEach((type) => {
			RippleRenderer._eventManager.addHandler(this._ngZone, type, element, this);
		});
	}
	handleEvent(event) {
		if (event.type === "mousedown") this._onMousedown(event);
		else if (event.type === "touchstart") this._onTouchStart(event);
		else this._onPointerUp();
		if (!this._pointerUpEventsRegistered) {
			this._ngZone.runOutsideAngular(() => {
				pointerUpEvents.forEach((type) => {
					this._triggerElement.addEventListener(type, this, passiveCapturingEventOptions);
				});
			});
			this._pointerUpEventsRegistered = true;
		}
	}
	_finishRippleTransition(rippleRef) {
		if (rippleRef.state === RippleState.FADING_IN) this._startFadeOutTransition(rippleRef);
		else if (rippleRef.state === RippleState.FADING_OUT) this._destroyRipple(rippleRef);
	}
	_startFadeOutTransition(rippleRef) {
		const isMostRecentTransientRipple = rippleRef === this._mostRecentTransientRipple;
		const { persistent } = rippleRef.config;
		rippleRef.state = RippleState.VISIBLE;
		if (!persistent && (!isMostRecentTransientRipple || !this._isPointerDown)) rippleRef.fadeOut();
	}
	_destroyRipple(rippleRef) {
		const eventListeners = this._activeRipples.get(rippleRef) ?? null;
		this._activeRipples.delete(rippleRef);
		if (!this._activeRipples.size) this._containerRect = null;
		if (rippleRef === this._mostRecentTransientRipple) this._mostRecentTransientRipple = null;
		rippleRef.state = RippleState.HIDDEN;
		if (eventListeners !== null) {
			rippleRef.element.removeEventListener("transitionend", eventListeners.onTransitionEnd);
			rippleRef.element.removeEventListener("transitioncancel", eventListeners.onTransitionCancel);
			if (eventListeners.fallbackTimer !== null) clearTimeout(eventListeners.fallbackTimer);
		}
		rippleRef.element.remove();
	}
	_onMousedown(event) {
		const isFakeMousedown = isFakeMousedownFromScreenReader(event);
		const isSyntheticEvent = this._lastTouchStartEvent && Date.now() < this._lastTouchStartEvent + ignoreMouseEventsTimeout;
		if (!this._target.rippleDisabled && !isFakeMousedown && !isSyntheticEvent) {
			this._isPointerDown = true;
			this.fadeInRipple(event.clientX, event.clientY, this._target.rippleConfig);
		}
	}
	_onTouchStart(event) {
		if (!this._target.rippleDisabled && !isFakeTouchstartFromScreenReader(event)) {
			this._lastTouchStartEvent = Date.now();
			this._isPointerDown = true;
			const touches = event.changedTouches;
			if (touches) for (let i = 0; i < touches.length; i++) this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
		}
	}
	_onPointerUp() {
		if (!this._isPointerDown) return;
		this._isPointerDown = false;
		this._getActiveRipples().forEach((ripple) => {
			const isVisible = ripple.state === RippleState.VISIBLE || ripple.config.terminateOnPointerUp && ripple.state === RippleState.FADING_IN;
			if (!ripple.config.persistent && isVisible) ripple.fadeOut();
		});
	}
	_getActiveRipples() {
		return Array.from(this._activeRipples.keys());
	}
	_removeTriggerEvents() {
		const trigger = this._triggerElement;
		if (trigger) {
			pointerDownEvents.forEach((type) => RippleRenderer._eventManager.removeHandler(type, trigger, this));
			if (this._pointerUpEventsRegistered) {
				pointerUpEvents.forEach((type) => trigger.removeEventListener(type, this, passiveCapturingEventOptions));
				this._pointerUpEventsRegistered = false;
			}
		}
	}
};
function distanceToFurthestCorner(x, y, rect) {
	const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
	const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
	return Math.sqrt(distX * distX + distY * distY);
}
var MAT_RIPPLE_GLOBAL_OPTIONS = new InjectionToken("mat-ripple-global-options");
var MatRipple = class MatRipple {
	_elementRef = inject(ElementRef);
	_animationsDisabled = _animationsDisabled();
	color;
	unbounded = false;
	centered = false;
	radius = 0;
	animation;
	get disabled() {
		return this._disabled;
	}
	set disabled(value) {
		if (value) this.fadeOutAllNonPersistent();
		this._disabled = value;
		this._setupTriggerEventsIfEnabled();
	}
	_disabled = false;
	get trigger() {
		return this._trigger || this._elementRef.nativeElement;
	}
	set trigger(trigger) {
		this._trigger = trigger;
		this._setupTriggerEventsIfEnabled();
	}
	_trigger;
	_rippleRenderer;
	_globalOptions;
	_isInitialized = false;
	constructor() {
		const ngZone = inject(NgZone);
		const platform = inject(Platform);
		const globalOptions = inject(MAT_RIPPLE_GLOBAL_OPTIONS, { optional: true });
		const injector = inject(Injector);
		this._globalOptions = globalOptions || {};
		this._rippleRenderer = new RippleRenderer(this, ngZone, this._elementRef, platform, injector);
	}
	ngOnInit() {
		this._isInitialized = true;
		this._setupTriggerEventsIfEnabled();
	}
	ngOnDestroy() {
		this._rippleRenderer._removeTriggerEvents();
	}
	fadeOutAll() {
		this._rippleRenderer.fadeOutAll();
	}
	fadeOutAllNonPersistent() {
		this._rippleRenderer.fadeOutAllNonPersistent();
	}
	get rippleConfig() {
		return {
			centered: this.centered,
			radius: this.radius,
			color: this.color,
			animation: {
				...this._globalOptions.animation,
				...this._animationsDisabled ? {
					enterDuration: 0,
					exitDuration: 0
				} : {},
				...this.animation
			},
			terminateOnPointerUp: this._globalOptions.terminateOnPointerUp
		};
	}
	get rippleDisabled() {
		return this.disabled || !!this._globalOptions.disabled;
	}
	_setupTriggerEventsIfEnabled() {
		if (!this.disabled && this._isInitialized) this._rippleRenderer.setupTriggerEvents(this.trigger);
	}
	launch(configOrX, y = 0, config) {
		if (typeof configOrX === "number") return this._rippleRenderer.fadeInRipple(configOrX, y, {
			...this.rippleConfig,
			...config
		});
		else return this._rippleRenderer.fadeInRipple(0, 0, {
			...this.rippleConfig,
			...configOrX
		});
	}
	static ɵfac = function MatRipple_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MatRipple)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MatRipple,
		selectors: [[
			"",
			"mat-ripple",
			""
		], [
			"",
			"matRipple",
			""
		]],
		hostAttrs: [1, "mat-ripple"],
		hostVars: 2,
		hostBindings: function MatRipple_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵclassProp("mat-ripple-unbounded", ctx.unbounded);
		},
		inputs: {
			color: [
				0,
				"matRippleColor",
				"color"
			],
			unbounded: [
				0,
				"matRippleUnbounded",
				"unbounded"
			],
			centered: [
				0,
				"matRippleCentered",
				"centered"
			],
			radius: [
				0,
				"matRippleRadius",
				"radius"
			],
			animation: [
				0,
				"matRippleAnimation",
				"animation"
			],
			disabled: [
				0,
				"matRippleDisabled",
				"disabled"
			],
			trigger: [
				0,
				"matRippleTrigger",
				"trigger"
			]
		},
		exportAs: ["matRipple"]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatRipple, [{
		type: Directive,
		args: [{
			selector: "[mat-ripple], [matRipple]",
			exportAs: "matRipple",
			host: {
				"class": "mat-ripple",
				"[class.mat-ripple-unbounded]": "unbounded"
			}
		}]
	}], () => [], {
		color: [{
			type: Input,
			args: ["matRippleColor"]
		}],
		unbounded: [{
			type: Input,
			args: ["matRippleUnbounded"]
		}],
		centered: [{
			type: Input,
			args: ["matRippleCentered"]
		}],
		radius: [{
			type: Input,
			args: ["matRippleRadius"]
		}],
		animation: [{
			type: Input,
			args: ["matRippleAnimation"]
		}],
		disabled: [{
			type: Input,
			args: ["matRippleDisabled"]
		}],
		trigger: [{
			type: Input,
			args: ["matRippleTrigger"]
		}]
	});
})();
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/@angular/material/fesm2022/_structural-styles-chunk.mjs
var _StructuralStylesLoader = class _StructuralStylesLoader {
	static ɵfac = function _StructuralStylesLoader_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || _StructuralStylesLoader)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: _StructuralStylesLoader,
		selectors: [["structural-styles"]],
		decls: 0,
		vars: 0,
		template: function _StructuralStylesLoader_Template(rf, ctx) {},
		styles: [".mat-focus-indicator {\n  position: relative;\n}\n.mat-focus-indicator::before {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  box-sizing: border-box;\n  pointer-events: none;\n  display: var(--%NS%mat-focus-indicator-display, none);\n  border-width: var(--%NS%mat-focus-indicator-border-width, 3px);\n  border-style: var(--%NS%mat-focus-indicator-border-style, solid);\n  border-color: var(--%NS%mat-focus-indicator-border-color, transparent);\n  border-radius: var(--%NS%mat-focus-indicator-border-radius, 4px);\n}\n.mat-focus-indicator:focus-visible::before {\n  content: \"\";\n}\n\n@media (forced-colors: active) {\n  html {\n    --%NS%mat-focus-indicator-display: block;\n    --%NS%mat-focus-indicator-fallback-border-style: none;\n  }\n}\n"],
		encapsulation: 2
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_StructuralStylesLoader, [{
		type: Component,
		args: [{
			selector: "structural-styles",
			encapsulation: ViewEncapsulation.None,
			template: "",
			styles: [".mat-focus-indicator {\n  position: relative;\n}\n.mat-focus-indicator::before {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  box-sizing: border-box;\n  pointer-events: none;\n  display: var(--mat-focus-indicator-display, none);\n  border-width: var(--mat-focus-indicator-border-width, 3px);\n  border-style: var(--mat-focus-indicator-border-style, solid);\n  border-color: var(--mat-focus-indicator-border-color, transparent);\n  border-radius: var(--mat-focus-indicator-border-radius, 4px);\n}\n.mat-focus-indicator:focus-visible::before {\n  content: \"\";\n}\n\n@media (forced-colors: active) {\n  html {\n    --mat-focus-indicator-display: block;\n    --mat-focus-indicator-fallback-border-style: none;\n  }\n}\n"]
		}]
	}], null, null);
})();
export { dateTimestampProvider as S, debounceTime as _, defaultRippleAnimationConfig as a, AsyncScheduler as b, _CdkPrivateStyleLoader as c, coerceElement as d, coerceNumberProperty as f, distinctUntilChanged as g, skip as h, RippleRenderer as i, CdkMonitorFocus as l, _getEventTarget as m, MAT_RIPPLE_GLOBAL_OPTIONS as n, _animationsDisabled as o, Platform as p, MatRipple as r, CdkObserveContent as s, _StructuralStylesLoader as t, FocusMonitor as u, async as v, AsyncAction as x, asyncScheduler as y };
