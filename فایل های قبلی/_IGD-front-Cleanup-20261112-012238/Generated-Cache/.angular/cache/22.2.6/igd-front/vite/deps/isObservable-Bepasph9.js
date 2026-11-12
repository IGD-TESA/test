import { ql as Observable, ru as isFunction } from "./core-hsl8ukWr.js";
// D:/Program Files/IGD-Frontend/Libraries/IGD-Frontend/node_modules/rxjs/dist/esm5/internal/util/isObservable.js
function isObservable(obj) {
	return !!obj && (obj instanceof Observable || isFunction(obj.lift) && isFunction(obj.subscribe));
}
export { isObservable as t };
