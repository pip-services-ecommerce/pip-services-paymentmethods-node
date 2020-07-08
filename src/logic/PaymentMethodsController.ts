let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { BadRequestException } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsPersistence } from '../persistence/IPaymentMethodsPersistence';
import { IPaymentMethodsController } from './IPaymentMethodsController';
import { PaymentMethodsCommandSet } from './PaymentMethodsCommandSet';
import { UnauthorizedException } from 'pip-services3-commons-node/obj/src/errors/UnauthorizedException';

export class PaymentMethodsController implements  IConfigurable, IReferenceable, ICommandable, IPaymentMethodsController {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.persistence', 'pip-services-paymentmethods:persistence:*:*:1.0'
    );

    private _dependencyResolver: DependencyResolver = new DependencyResolver(PaymentMethodsController._defaultConfig);
    private _persistence: IPaymentMethodsPersistence;
    private _commandSet: PaymentMethodsCommandSet;

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired<IPaymentMethodsPersistence>('persistence');
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new PaymentMethodsCommandSet(this);
        return this._commandSet;
    }
    
    public getPaymentMethods(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }

    public getPaymentMethodById(correlationId: string, id: string, customerId: string,
        callback: (err: any, method: PaymentMethodV1) => void): void {
        this._persistence.getOneById(correlationId, id, (err, method) => {
            // Do not allow to access method of different customer
            if (method && method.customer_id != customerId)
                method = null;
            
            callback(err, method);
        });
    }

    public createPaymentMethod(correlationId: string, method: PaymentMethodV1, 
        callback: (err: any, payment_method: PaymentMethodV1) => void): void {

        method.create_time = new Date();
        method.update_time = new Date();

        this._persistence.create(correlationId, method, callback);
    }

    public updatePaymentMethod(correlationId: string, method: PaymentMethodV1, 
        callback: (err: any, payment_method: PaymentMethodV1) => void): void {

        let newCard: PaymentMethodV1;

        method.update_time = new Date();
    
        async.series([
            (callback) => {
                this._persistence.getOneById(correlationId, method.id, (err, data) => {
                    if (err == null && data && data.customer_id != method.customer_id) {
                        err = new BadRequestException(correlationId, 'WRONG_CUST_ID', 'Wrong credit method customer id')
                            .withDetails('id', method.id)
                            .withDetails('customer_id', method.customer_id);
                    }
                    callback(err);
                });
            },
            (callback) => {
                this._persistence.update(correlationId, method, (err, data) => {
                    newCard = data;
                    callback(err);
                });
            }
        ], (err) => {
            callback(err, newCard);
        });
    }

    public deletePaymentMethodById(correlationId: string, id: string, customerId: string,
        callback: (err: any, method: PaymentMethodV1) => void): void {  

        let oldCard: PaymentMethodV1;

        async.series([
            (callback) => {
                this._persistence.getOneById(correlationId, id, (err, data) => {
                    if (err == null && data && data.customer_id != customerId) {
                        err = new BadRequestException(correlationId, 'WRONG_CUST_ID', 'Wrong credit method customer id')
                            .withDetails('id', id)
                            .withDetails('customer_id', customerId);
                    }
                    callback(err);
                });
            },
            (callback) => {
                this._persistence.deleteById(correlationId, id, (err, data) => {
                    oldCard = data;
                    callback(err);
                });
            }
        ], (err) => {
            if (callback) callback(err, oldCard);
        });
    }

}
