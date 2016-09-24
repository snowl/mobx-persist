"use strict";
var mobx_1 = require("mobx");
var serializr_1 = require("serializr");
var Storage = require("./storage");
var types = {
    'object': function (s) { return s ? serializr_1.object(s) : serializr_1.custom(function (v) { return v; }, function (v) { return v; }); },
    'list': function (s) { return s ? serializr_1.list(serializr_1.object(s)) : serializr_1.list(serializr_1.primitive()); },
    'map': function (s) { return s ? serializr_1.map(serializr_1.object(s)) : serializr_1.map(serializr_1.primitive()); }
};
function persist(arg1, arg2, arg3) {
    return (arg1 in types) ? serializr_1.serializable(types[arg1](arg2)) : serializr_1.serializable.apply(null, arguments);
}
exports.persist = persist;
function create(options) {
    var storage = Storage;
    if (options.storage && options.storage !== localStorage) {
        storage = options.storage;
    }
    return function createStore(key, storeClass) {
        var store = new storeClass;
        storage.getItem(key)
            .then(function (d) { return JSON.parse(d); })
            .then(function (persisted) {
            if (persisted && typeof persisted === 'object') {
                serializr_1.update(store, persisted);
            }
        });
        mobx_1.reaction(key, function () { return serializr_1.serialize(store); }, function (data) { return storage.setItem(key, JSON.stringify(data)); });
        return store;
    };
}
exports.create = create;