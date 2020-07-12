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
import { CredentialParams } from 'pip-services3-components-node';
import { CredentialResolver } from 'pip-services3-components-node';
import { CompositeLogger } from 'pip-services3-components-node';

import { BadRequestException } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../data/version1/PaymentMethodTypeV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence'

import { Stripe } from 'stripe';
import { StripeOptions } from './StripeOptions';
import { AddressV1 } from '../data/version1';
import { IStripeConnector } from './IStripeConnector';
import { StripeCardsConnector } from './stripe/StripeCardsConnector';
import { StripeBankAccountsConnector } from './stripe/StripeBankAccountsConnector';

export class PaymentMethodsStripePersistence implements IPaymentMethodsPersistence, IConfigurable,
    IReferenceable, IOpenable, ICleanable {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();
    private _logger: CompositeLogger = new CompositeLogger();
    private _client: Stripe = null;
    private _stripeOptions: StripeOptions;
    private _stripeCardsConnector: IStripeConnector;
    private _stripeBankAccountsConnector: IStripeConnector;

    public constructor() { }

    public configure(config: ConfigParams): void {
        this._logger.configure(config);
        this._credentialsResolver.configure(config);

        this._stripeOptions = new StripeOptions(config);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._credentialsResolver.setReferences(references);
    }

    public isOpen(): boolean {
        return this._client != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        let credentials: CredentialParams;

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
                let secretKey = credentials.getAccessKey();

                this._client = new Stripe(secretKey, {
                    apiVersion: this._stripeOptions.apiVersion,
                    maxNetworkRetries: this._stripeOptions.maxNetworkRetries,
                    httpAgent: this._stripeOptions.httpAgent,
                    timeout: this._stripeOptions.timeout,
                    host: this._stripeOptions.host,
                    port: this._stripeOptions.port,
                    protocol: this._stripeOptions.protocol,
                    telemetry: this._stripeOptions.telemetry
                });

                this._stripeCardsConnector = new StripeCardsConnector(this._client);
                this._stripeBankAccountsConnector = new StripeBankAccountsConnector(this._client);

                callback();
            }
        ], callback);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        this._stripeCardsConnector = null;
        this._stripeBankAccountsConnector = null;
        this._client = null;

        if (callback) callback(null);
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
        this.getPageByFilterAsync(correlationId, filter, paging).then(page => {
            if (callback) callback(null, page);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public getById(correlationId: string, id: string, customerId: string,
        callback: (err: any, item: PaymentMethodV1) => void): void {
        this._stripeCardsConnector.getByIdAsync(correlationId, id, customerId).then(method => {
            if (callback && method) {
                callback(null, method);
                return;
            }

            this._stripeBankAccountsConnector.getByIdAsync(correlationId, id, customerId).then(method => {
                callback(null, method);
            }).catch(err => {
                if (callback) callback(err, null);
            });

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

        this._stripeCardsConnector.deleteAsync(correlationId, id, customerId).then(method => {
            if (callback && method) {
                callback(null, method);
                return;
            }

            this._stripeBankAccountsConnector.deleteAsync(correlationId, id, customerId).then(method => {
                callback(null, method);
            }).catch(err => {
                if (callback) callback(err, null);
            });

        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public clear(correlationId: string, callback: (err: any) => void): void {
        this.clearAsync(correlationId).then(() => {
            if (callback) callback(null);
        }).catch(err => {
            if (callback) callback(err);
        });
    }

    private async getPageByFilterAsync(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<PaymentMethodV1>> {
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

        let pageSize = 100;

        let checkFilter = {
            id: id,
            default: _default,
            saved: saved,
            type: type,
            ids: ids,
            customerId: customerId
        };

        let pageCards = await this._stripeCardsConnector.getPageByFilterAsync(correlationId, filter, new PagingParams(0, pageSize));

        for (let item of pageCards.data) {
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

        if (items.length >= take) {
            return new DataPage(items);
        }

        let pageBankAccounts = await this._stripeBankAccountsConnector.getPageByFilterAsync(correlationId, filter, new PagingParams(0, pageSize));

        for (let item of pageBankAccounts.data) {
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

    private async clearAsync(correlationId: string) {
        await this._stripeCardsConnector.clearAsync(correlationId);
        await this._stripeBankAccountsConnector.clearAsync(correlationId);
    }

    private getConnectorByType(item: PaymentMethodV1): IStripeConnector {
        if (item.type == PaymentMethodTypeV1.CreditCard) return this._stripeCardsConnector;
        if (item.type == PaymentMethodTypeV1.BankAccount) return this._stripeBankAccountsConnector;

        return null;
    }
}