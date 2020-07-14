let _ = require('lodash');
let async = require('async');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';

import { BadRequestException } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../data/version1/PaymentMethodTypeV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence'

import { IStripeConnector } from './IStripeConnector';
import { StripeCardsConnector } from './stripe/StripeCardsConnector';
import { StripeBankAccountsConnector } from './stripe/StripeBankAccountsConnector';

export class PaymentMethodsStripePersistence implements IPaymentMethodsPersistence, IConfigurable,
    IReferenceable, IOpenable, ICleanable {

    private _stripeCardsConnector: IStripeConnector;
    private _stripeBankAccountsConnector: IStripeConnector;

    public constructor() {
        this._stripeCardsConnector = new StripeCardsConnector();
        this._stripeBankAccountsConnector = new StripeBankAccountsConnector();
    }

    public configure(config: ConfigParams): void {
        if (this._stripeCardsConnector) this._stripeCardsConnector.configure(config);
        if (this._stripeBankAccountsConnector) this._stripeBankAccountsConnector.configure(config);
    }

    public setReferences(references: IReferences): void {
        if (this._stripeCardsConnector) this._stripeCardsConnector.setReferences(references);
        if (this._stripeBankAccountsConnector) this._stripeBankAccountsConnector.setReferences(references);
    }

    public isOpen(): boolean {
        return this._stripeCardsConnector?.isOpen() || this._stripeBankAccountsConnector?.isOpen();
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        async.series([
            // create stripe cards connector
            (callback) => {
                this._stripeCardsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
            // create stripe bank accounts connector
            (callback) => {
                this._stripeBankAccountsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
        ], callback);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        async.series([
            // close stripe cards connector
            (callback) => {
                this._stripeCardsConnector.close(correlationId, (err) => {
                    this._stripeCardsConnector = null;
                    callback(err);
                });
            },
            // close stripe bank accounts connector
            (callback) => {
                this._stripeBankAccountsConnector.close(correlationId, (err) => {
                    this._stripeBankAccountsConnector = null;
                    callback(err);
                });
            },
        ], callback);
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
        
        let pageSize = 100;
        
        Promise.all([
            this._stripeCardsConnector.getPageByFilterAsync(correlationId, filter, new PagingParams(0, pageSize)),
            this._stripeBankAccountsConnector.getPageByFilterAsync(correlationId, filter, new PagingParams(0, pageSize))
        ]).then(pages => {
            let methods = pages[0].data.concat(pages[1].data);
            if (callback) callback(null, this.buildPageByFilter(correlationId, filter, paging, methods))
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public getById(correlationId: string, id: string, customerId: string,
        callback: (err: any, item: PaymentMethodV1) => void): void {
        
        Promise.all([
            this._stripeCardsConnector.getByIdAsync(correlationId, id, customerId),
            this._stripeBankAccountsConnector.getByIdAsync(correlationId, id, customerId)
        ]).then(methods => {
            if (callback) callback(null, methods[0] ?? methods[1]);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public create(correlationId: string, item: PaymentMethodV1,
        callback: (err: any, item: PaymentMethodV1) => void): void {

        var connector = this.getConnectorByType(item);
        if (connector == null) {
            callback(new BadRequestException(correlationId, 'ERR_PAYMENT_TYPE', 'Payment type not supported')
                .withDetails('item.type', item.type), null);
            return;
        }

        connector.createAsync(correlationId, item).then(method => {
            if (callback) callback(null, method);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public update(correlationId: string, item: PaymentMethodV1,
        callback: (err: any, item: PaymentMethodV1) => void): void {

        var connector = this.getConnectorByType(item);
        if (connector == null) {
            callback(new BadRequestException(correlationId, 'ERR_PAYMENT_TYPE', 'Payment type not supported')
                .withDetails('item.type', item.type), null);
            return;
        }

        connector.updateAsync(correlationId, item).then(method => {
            if (callback) callback(null, method);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public delete(correlationId: string, id: string, customerId: string,
        callback: (err: any, item: PaymentMethodV1) => void): void {

        Promise.all([
            this._stripeCardsConnector.deleteAsync(correlationId, id, customerId),
            this._stripeBankAccountsConnector.deleteAsync(correlationId, id, customerId)
        ]).then(methods => {
            if (callback) callback(null, methods[0] ?? methods[1]);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public clear(correlationId: string, callback: (err: any) => void): void {
        Promise.all([
            this._stripeCardsConnector.clearAsync(correlationId),
            this._stripeBankAccountsConnector.clearAsync(correlationId)
        ]).then(() => {
            if (callback) callback(null);
        })
        .catch(err => {
            if (callback) callback(err);
        });
    }

    private buildPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, methods: PaymentMethodV1[])
    {
        let id = filter.getAsNullableString('id');
        let customerId = filter.getAsNullableString('customer_id');
        let saved = filter.getAsNullableBoolean('saved');
        let _default = filter.getAsNullableBoolean('default');
        let type = filter.getAsNullableString('type');
        let ids = filter.getAsObject('ids');

        // Process ids filter
        if (_.isString(ids))
            ids = ids.split(',');
        if (!_.isArray(ids))
            ids = null;

        let skip = paging.getSkip(0);
        let take = paging.getTake(100);
        let items: PaymentMethodV1[] = [];

        let checkFilter = {
            id: id,
            default: _default,
            saved: saved,
            type: type,
            ids: ids,
            customerId: customerId
        };

        for (let item of methods) {
            // Filter items
            if (!this.checkItem(checkFilter, item)) continue;

            // Process skip and take
            if (skip > 0) {
                skip--;
                continue;
            }

            if (items.length < take)
                items.push(item);

            if (items.length >= take)
                break;
        }

        return new DataPage(items);
    }

    private checkItem(filter, item): boolean {
        if (filter.id != null && item.id != filter.id)
            return false;
        if (filter.default != null && item.default != filter.default)
            return false;
        if (filter.saved != null && item.saved != filter.saved)
            return false;
        if (filter.type != null && item.type != filter.type)
            return false;
        if (filter.ids != null && _.indexOf(filter.ids, item.id) < 0)
            return false;
        if (filter.customerId != null && item.customer_id != filter.customerId)
            return false;

        return true;
    }

    private getConnectorByType(item: PaymentMethodV1): IStripeConnector {
        if (item.type == PaymentMethodTypeV1.CreditCard) return this._stripeCardsConnector;
        if (item.type == PaymentMethodTypeV1.BankAccount) return this._stripeBankAccountsConnector;

        return null;
    }
}