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
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';
import { PaymentMethodsPayPalPersistence } from './PaymentMethodsPayPalPersistence';
import { PaymentMethodsMongoDbPersistence } from './PaymentMethodsMongoDbPersistence';

export class PaymentMethodsPayPalMongoDbPersistence implements IPaymentMethodsPersistence, IConfigurable,
    IReferenceable, IOpenable, ICleanable {

    private _mongoPersistence: PaymentMethodsMongoDbPersistence;
    private _payPalPersistence: PaymentMethodsPayPalPersistence;

    public constructor() {
        this._mongoPersistence = new PaymentMethodsMongoDbPersistence;
        this._payPalPersistence = new PaymentMethodsPayPalPersistence();
    }

    public configure(config: ConfigParams): void {
        if (this._mongoPersistence) this._mongoPersistence.configure(config);
        if (this._payPalPersistence) this._payPalPersistence.configure(config);
    }

    public setReferences(references: IReferences): void {
        if (this._mongoPersistence) this._mongoPersistence.setReferences(references);
        if (this._payPalPersistence) this._payPalPersistence.setReferences(references);
    }

    public isOpen(): boolean {
        return this._mongoPersistence?.isOpen() || this._payPalPersistence?.isOpen();
    }

    public open(correlationId: string, callback: (err: any) => void): void {
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

    public close(correlationId: string, callback: (err: any) => void): void {
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

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
        this._mongoPersistence.getPageByFilter(correlationId, filter, paging, (err, page) => {
            if (err) {
                if (callback) callback(err, page);
                return;
            }

            if (page) {
                let cardIds = page.data.filter(x => x.type == PaymentMethodTypeV1.Card).map(x => x.id);
                if (cardIds.length == 0) {
                    if (callback) callback(err, page);
                    return;
                }

                let cardsFilter = FilterParams.fromValue({
                    ids: cardIds
                });

                this._payPalPersistence.getPageByFilter(correlationId, cardsFilter, paging, (err, cards) => {
                    if (err) {
                        if (callback) callback(err, page);
                        return;
                    }

                    cards.data.forEach((value, index, array) => {
                        let item = page.data.find(x => x.id == value.id);
                        if (item) {
                            item.card.number = value.card.number;
                        }
                    });

                    if (callback) callback(null, page);
                });
            }
        });
    }

    public getById(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void {
        this._mongoPersistence.getOneById(correlationId, id, (err, item) => {
            if (err || !item || item.type != PaymentMethodTypeV1.Card || item.payout) {
                if (callback) callback(err, item);
                return;
            }

            this._payPalPersistence.getById(correlationId, id, customerId, callback);
        });
    }

    public create(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void {
        if (item.type == PaymentMethodTypeV1.Card && !item.payout) {
            this._payPalPersistence.create(correlationId, item, (err, item) => {
                if (err) {
                    if (callback) callback(err, item);
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

    public update(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void {
        if (item.type == PaymentMethodTypeV1.Card && !item.payout) {
            this._payPalPersistence.update(correlationId, item, (err, item) => {
                if (err) {
                    if (callback) callback(err, item);
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

    public delete(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void {
        this._mongoPersistence.delete(correlationId, id, customerId, (err, item) => {
            if (err || !item || item.type != PaymentMethodTypeV1.Card || item.payout) {
                if (callback) callback(err, item);
                return;
            }

            this._payPalPersistence.delete(correlationId, id, customerId, callback)
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        async.parallel([
            (callback) => this._mongoPersistence.clear(correlationId, callback),
            (callback) => this._payPalPersistence.clear(correlationId, callback)
        ], (err) => {
            callback(err);
        });
    }

    private maskCardNumber(pan: string): string {
        let len: number = pan?.length ?? 0;

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