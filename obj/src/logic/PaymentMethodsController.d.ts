import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsController } from './IPaymentMethodsController';
export declare class PaymentMethodsController implements IConfigurable, IReferenceable, ICommandable, IPaymentMethodsController {
    private static _defaultConfig;
    private _dependencyResolver;
    private _persistence;
    private _commandSet;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    getPaymentMethods(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;
    getPaymentMethodById(correlationId: string, id: string, customerId: string, callback: (err: any, method: PaymentMethodV1) => void): void;
    createPaymentMethod(correlationId: string, method: PaymentMethodV1, callback: (err: any, payment_method: PaymentMethodV1) => void): void;
    updatePaymentMethod(correlationId: string, method: PaymentMethodV1, callback: (err: any, payment_method: PaymentMethodV1) => void): void;
    deletePaymentMethodById(correlationId: string, id: string, customerId: string, callback: (err: any, method: PaymentMethodV1) => void): void;
}
