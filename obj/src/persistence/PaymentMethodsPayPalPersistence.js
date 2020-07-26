"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const PaymentMethodV1_1 = require("../data/version1/PaymentMethodV1");
const PaymentMethodTypeV1_1 = require("../data/version1/PaymentMethodTypeV1");
const version1_1 = require("../data/version1");
class PaymentMethodsPayPalPersistence {
    constructor() {
        this._sandbox = false;
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._logger = new pip_services3_components_node_2.CompositeLogger();
        this._client = null;
    }
    configure(config) {
        this._logger.configure(config);
        this._credentialsResolver.configure(config);
        this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._credentialsResolver.setReferences(references);
    }
    isOpen() {
        return this._client != null;
    }
    open(correlationId, callback) {
        let credentials;
        async.series([
            // Get credential params
            (callback) => {
                this._credentialsResolver.lookup(correlationId, (err, result) => {
                    credentials = result;
                    callback(err);
                });
            },
            // Connect
            (callback) => {
                this._client = require('paypal-rest-sdk');
                this._client.configure({
                    mode: this._sandbox ? 'sandbox' : 'live',
                    client_id: credentials.getAccessId(),
                    client_secret: credentials.getAccessKey()
                });
                callback();
            }
        ], callback);
    }
    close(correlationId, callback) {
        this._client = null;
        if (callback)
            callback(null);
    }
    toPublic(value) {
        if (value == null)
            return null;
        // let result = _.omit(value, 'external_customer_id', 'external_method_id',
        //     'external_method_id', 'valid_until', 'create_time', 'update_time', 'links');
        let result = new PaymentMethodV1_1.PaymentMethodV1();
        result.id = value.id;
        result.type = PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card;
        result.payout = false;
        result.card = new version1_1.CreditCardV1();
        result.card.brand = value.type;
        result.card.expire_month = parseInt(value.expire_month);
        result.card.expire_year = parseInt(value.expire_year);
        result.card.first_name = value.first_name;
        result.card.last_name = value.last_name;
        result.card.state = value.state;
        if (value.billing_address) {
            result.billing_address = new version1_1.AddressV1();
            result.billing_address.line1 = value.billing_address.line1;
            result.billing_address.line2 = value.billing_address.line2;
            result.billing_address.city = value.billing_address.city;
            result.billing_address.state = value.billing_address.state;
            result.billing_address.country_code = value.billing_address.country_code;
            result.billing_address.postal_code = value.billing_address.postal_code;
        }
        // Parse external_card_id
        let temp = value.external_card_id.split(';');
        result.card.number = temp.length > 0 ? temp[0] : '';
        result.name = temp.length > 1 ? temp[1] : '';
        result.card.ccv = temp.length > 2 ? temp[2] : '';
        result.saved = temp.length > 3 ? temp[3] == 'saved' : false;
        result.default = temp.length > 4 ? temp[4] == 'default' : false;
        result.customer_id = temp.length > 5 ? temp[5] : value.external_customer_id;
        return result;
    }
    fromPublic(value) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (value == null)
            return null;
        // delete value.create_time;
        // delete value.update_time;
        // let result = _.omit(value, 'id', 'state', 'customer_id', 'ccv', 'name', 'saved', 'default');
        let card = value.card;
        let result = {
            number: card.number,
            type: card.brand,
            expire_month: (_a = card.expire_month) === null || _a === void 0 ? void 0 : _a.toString(),
            expire_year: (_b = card.expire_year) === null || _b === void 0 ? void 0 : _b.toString(),
            first_name: card.first_name,
            last_name: card.last_name,
            billing_address: null,
            external_customer_id: value.customer_id,
            external_card_id: null
        };
        if (value.billing_address) {
            result.billing_address = {
                line1: (_c = value.billing_address) === null || _c === void 0 ? void 0 : _c.line1,
                line2: (_d = value.billing_address) === null || _d === void 0 ? void 0 : _d.line2,
                city: (_e = value.billing_address) === null || _e === void 0 ? void 0 : _e.city,
                state: (_f = value.billing_address) === null || _f === void 0 ? void 0 : _f.state,
                country_code: (_g = value.billing_address) === null || _g === void 0 ? void 0 : _g.country_code,
                postal_code: (_h = value.billing_address) === null || _h === void 0 ? void 0 : _h.postal_code,
            };
        }
        result.external_customer_id = value.customer_id;
        // Generate external_card_id
        let temp = value.card.number;
        temp += ';' + (value.name ? value.name.replace(';', '_') : '');
        temp += ';' + (value.card.ccv ? value.card.ccv.replace(';', '') : '');
        temp += ';' + (value.saved ? 'saved' : '');
        temp += ';' + (value.default ? 'default' : '');
        temp += ';' + (value.customer_id ? value.customer_id.replace(';', '') : '');
        result.external_card_id = temp;
        return result;
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        let id = filter.getAsNullableString('id');
        let state = filter.getAsNullableString('state');
        let customerId = filter.getAsNullableString('customer_id');
        let saved = filter.getAsNullableBoolean('saved');
        let ids = filter.getAsObject('ids');
        let _default = filter.getAsNullableBoolean('default');
        let payout = filter.getAsNullableBoolean('payout');
        // Process ids filter
        if (_.isString(ids))
            ids = ids.split(',');
        if (!_.isArray(ids))
            ids = null;
        let skip = paging.getSkip(0);
        let take = paging.getTake(100);
        let items = [];
        let page = 0;
        let pageSize = 20;
        let pageItems;
        async.doWhilst((callback) => {
            page++;
            // Set filters supported by PayPal
            let options = {
                page: page,
                page_size: pageSize
            };
            if (customerId)
                options.external_customer_id = customerId;
            this._client.creditCard.list(options, (err, data) => {
                if (err) {
                    callback(err);
                    return;
                }
                pageItems = _.map(data.items, (item) => this.toPublic(item));
                for (let item of pageItems) {
                    // Filter items
                    if (id != null && item.id != id)
                        continue;
                    if (saved != null && item.saved != saved)
                        continue;
                    if (state != null && item.card.state != state)
                        continue;
                    if (ids != null && _.indexOf(ids, item.id) < 0)
                        continue;
                    if (_default != null && item.default != null && item.default != _default)
                        continue;
                    if (payout != null && item.payout != payout)
                        continue;
                    // Process skip and take
                    if (skip > 0) {
                        skip--;
                        continue;
                    }
                    if (items.length < take)
                        items.push(item);
                }
                callback(null);
            });
        }, () => pageItems.length == pageSize && items.length < take, (err) => {
            let page = err == null ? new pip_services3_commons_node_1.DataPage(items) : null;
            callback(err, page);
        });
    }
    getById(correlationId, id, customerId, callback) {
        this._client.creditCard.get(id, (err, data) => {
            if (err != null && err.httpStatusCode == 404)
                err = null;
            let item = this.toPublic(data);
            callback(err, item);
        });
    }
    create(correlationId, item, callback) {
        if (item.type != PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card) {
            callback(new pip_services3_commons_node_2.BadRequestException(correlationId, 'ERR_PAYMENTMETHOD_TYPE', 'Payment method type not supported')
                .withDetails('item', item), null);
            return;
        }
        if (item.payout) {
            callback(new pip_services3_commons_node_2.BadRequestException(correlationId, 'ERR_PAYMENTMETHOD_PAYOUT', 'Payment method payout not supported')
                .withDetails('item', item), null);
            return;
        }
        item = _.omit(item, 'id');
        item = this.fromPublic(item);
        this._client.creditCard.create(item, (err, data) => {
            if (err != null) {
                var strErr = JSON.stringify(err);
                this._logger.trace(correlationId, "Error creating credit method with PayPal persistence: ", strErr);
                let code = err && err.response ? err.response.name : "UNKNOWN";
                let message = err && err.response ? err.response.message : strErr;
                let status = err && err.httpStatusCode ? err.httpStatusCode : "500";
                err = new pip_services3_commons_node_2.BadRequestException(null, code, message).withStatus(status);
            }
            item = this.toPublic(data);
            callback(err, item);
        });
    }
    update(correlationId, item, callback) {
        if (item.type != PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card) {
            callback(new pip_services3_commons_node_2.BadRequestException(correlationId, 'ERR_PAYMENTMETHOD_TYPE', 'Payment method type not supported')
                .withDetails('item', item), null);
            return;
        }
        if (item.payout) {
            callback(new pip_services3_commons_node_2.BadRequestException(correlationId, 'ERR_PAYMENTMETHOD_PAYOUT', 'Payment method payout not supported')
                .withDetails('item', item), null);
            return;
        }
        let id = item.id;
        let data = this.fromPublic(item);
        // Delete and then recreate, because some fields are read-only in PayPal
        // this._client.creditCard.del(id, (err) => {
        //     if (err) {
        //         callback(err, null);
        //         return;
        //     }
        //     this._client.creditCard.create(data, (err, data) => {
        //         item = this.toPublic(data);
        //         callback(err, item);
        //     });
        // });
        // First try to create then delete, because if user misstyped credit method will be just deleted
        this._client.creditCard.create(data, (err, data) => {
            if (err) {
                callback(err, null);
                return;
            }
            this._client.creditCard.del(id, (err) => {
                if (err) {
                    callback(err, null);
                    return;
                }
            });
            item = this.toPublic(data);
            callback(err, item);
        });
    }
    delete(correlationId, id, customerId, callback) {
        this._client.creditCard.get(id, (err, data) => {
            if (err != null || data == null) {
                callback(err, null);
                return;
            }
            let item = this.toPublic(data);
            this._client.creditCard.del(id, (err) => {
                callback(err, item);
            });
        });
    }
    clear(correlationId, callback) {
        let page = 0;
        let pageSize = 20;
        let creditCards = [];
        async.doWhilst((callback) => {
            page++;
            let options = {
                page_size: pageSize,
                page: page
            };
            this._client.creditCard.list(options, (err, page) => {
                if (err) {
                    callback(err);
                    return;
                }
                creditCards = page.items;
                async.each(creditCards, (creditCard, callback) => {
                    this._client.creditCard.del(creditCard.id, (err) => {
                        callback(err);
                    });
                }, callback);
            });
        }, () => creditCards.length == pageSize, callback);
    }
}
exports.PaymentMethodsPayPalPersistence = PaymentMethodsPayPalPersistence;
//# sourceMappingURL=PaymentMethodsPayPalPersistence.js.map