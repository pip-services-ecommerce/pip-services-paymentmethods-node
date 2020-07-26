"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const PaymentMethodTypeV1_1 = require("../data/version1/PaymentMethodTypeV1");
const PaymentMethodsPayPalPersistence_1 = require("./PaymentMethodsPayPalPersistence");
const PaymentMethodsMongoDbPersistence_1 = require("./PaymentMethodsMongoDbPersistence");
class PaymentMethodsPayPalMongoDbPersistence {
    constructor() {
        this._mongoPersistence = new PaymentMethodsMongoDbPersistence_1.PaymentMethodsMongoDbPersistence;
        this._payPalPersistence = new PaymentMethodsPayPalPersistence_1.PaymentMethodsPayPalPersistence();
    }
    configure(config) {
        if (this._mongoPersistence)
            this._mongoPersistence.configure(config);
        if (this._payPalPersistence)
            this._payPalPersistence.configure(config);
    }
    setReferences(references) {
        if (this._mongoPersistence)
            this._mongoPersistence.setReferences(references);
        if (this._payPalPersistence)
            this._payPalPersistence.setReferences(references);
    }
    isOpen() {
        var _a, _b;
        return ((_a = this._mongoPersistence) === null || _a === void 0 ? void 0 : _a.isOpen()) || ((_b = this._payPalPersistence) === null || _b === void 0 ? void 0 : _b.isOpen());
    }
    open(correlationId, callback) {
        async.series([
            // open mongodb persistence
            (callback) => {
                this._mongoPersistence.open(correlationId, (err) => {
                    callback(err);
                });
            },
            // open paypal persistence
            (callback) => {
                this._payPalPersistence.open(correlationId, (err) => {
                    callback(err);
                });
            },
        ], callback);
    }
    close(correlationId, callback) {
        async.series([
            // close mongodb persistence
            (callback) => {
                this._mongoPersistence.close(correlationId, (err) => {
                    this._mongoPersistence = null;
                    callback(err);
                });
            },
            // close paypal persistence
            (callback) => {
                this._payPalPersistence.close(correlationId, (err) => {
                    this._payPalPersistence = null;
                    callback(err);
                });
            },
        ], callback);
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        this._mongoPersistence.getPageByFilter(correlationId, filter, paging, (err, page) => {
            if (err) {
                if (callback)
                    callback(err, page);
                return;
            }
            if (page) {
                let cardIds = page.data.filter(x => x.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card).map(x => x.id);
                if (cardIds.length == 0) {
                    if (callback)
                        callback(err, page);
                    return;
                }
                let cardsFilter = pip_services3_commons_node_1.FilterParams.fromValue({
                    ids: cardIds
                });
                this._payPalPersistence.getPageByFilter(correlationId, cardsFilter, paging, (err, cards) => {
                    if (err) {
                        if (callback)
                            callback(err, page);
                        return;
                    }
                    cards.data.forEach((value, index, array) => {
                        let item = page.data.find(x => x.id == value.id);
                        if (item) {
                            item.card.number = value.card.number;
                        }
                    });
                    if (callback)
                        callback(null, page);
                });
            }
        });
    }
    getById(correlationId, id, customerId, callback) {
        this._mongoPersistence.getOneById(correlationId, id, (err, item) => {
            if (err || !item || item.type != PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card || item.payout) {
                if (callback)
                    callback(err, item);
                return;
            }
            this._payPalPersistence.getById(correlationId, id, customerId, callback);
        });
    }
    create(correlationId, item, callback) {
        if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card && !item.payout) {
            this._payPalPersistence.create(correlationId, item, (err, item) => {
                if (err) {
                    if (callback)
                        callback(err, item);
                    return;
                }
                item.card.number = this.maskCardNumber(item.card.number);
                this._mongoPersistence.create(correlationId, item, callback);
            });
        }
        else {
            this._mongoPersistence.create(correlationId, item, callback);
        }
    }
    update(correlationId, item, callback) {
        if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card && !item.payout) {
            this._payPalPersistence.update(correlationId, item, (err, item) => {
                if (err) {
                    if (callback)
                        callback(err, item);
                    return;
                }
                item.card.number = this.maskCardNumber(item.card.number);
                this._mongoPersistence.update(correlationId, item, callback);
            });
        }
        else {
            this._mongoPersistence.update(correlationId, item, callback);
        }
    }
    delete(correlationId, id, customerId, callback) {
        this._mongoPersistence.delete(correlationId, id, customerId, (err, item) => {
            if (err || !item || item.type != PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card || item.payout) {
                if (callback)
                    callback(err, item);
                return;
            }
            this._payPalPersistence.delete(correlationId, id, customerId, callback);
        });
    }
    clear(correlationId, callback) {
        async.parallel([
            (callback) => this._mongoPersistence.clear(correlationId, callback),
            (callback) => this._payPalPersistence.clear(correlationId, callback)
        ], (err) => {
            callback(err);
        });
    }
    maskCardNumber(pan) {
        var _a, _b;
        let len = (_b = (_a = pan) === null || _a === void 0 ? void 0 : _a.length, (_b !== null && _b !== void 0 ? _b : 0));
        if (len > 10) {
            let bin = pan.substr(0, 6);
            let last4 = pan.substr(len - 4);
            return bin + '*'.repeat(len - 10) + last4;
        }
        if (len > 4) {
            let last4 = pan.substr(len - 4);
            return '*'.repeat(len - 10) + last4;
        }
        return pan;
    }
}
exports.PaymentMethodsPayPalMongoDbPersistence = PaymentMethodsPayPalMongoDbPersistence;
//# sourceMappingURL=PaymentMethodsPayPalMongoDbPersistence.js.map