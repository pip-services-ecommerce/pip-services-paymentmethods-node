import { DataPage } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';

export interface IPaymentMethodsController {
    getPaymentMethods(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;

    getPaymentMethodById(correlationId: string, method_id: string, customer_id: string,
        callback: (err: any, method: PaymentMethodV1) => void): void;

    createPaymentMethod(correlationId: string, method: PaymentMethodV1, 
        callback: (err: any, method: PaymentMethodV1) => void): void;

    updatePaymentMethod(correlationId: string, method: PaymentMethodV1, 
        callback: (err: any, method: PaymentMethodV1) => void): void;

    deletePaymentMethodById(correlationId: string, method_id: string, customer_id: string,
        callback: (err: any, method: PaymentMethodV1) => void): void;
}
