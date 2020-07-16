import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence';
export declare class PaymentMethodsPayPalMongoDbPersistence implements IPaymentMethodsPersistence, IConfigurable, IReferenceable, IOpenable, ICleanable {
    private _mongoPersistence;
    private _payPalPersistence;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;
    getById(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
    create(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void;
    update(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void;
    delete(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
    private maskCardNumber;
}