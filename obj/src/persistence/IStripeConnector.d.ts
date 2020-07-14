import { PaymentMethodV1 } from "../data/version1/PaymentMethodV1";
import { FilterParams } from "pip-services3-commons-node";
import { DataPage } from "pip-services3-commons-node";
import { PagingParams } from "pip-services3-commons-node";
import { IOpenable } from "pip-services3-commons-node";
import { IConfigurable } from "pip-services3-commons-node";
import { IReferenceable } from "pip-services3-commons-node";
export interface IStripeConnector extends IOpenable, IConfigurable, IReferenceable {
    getPageByFilterAsync(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<PaymentMethodV1>>;
    getByIdAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    createAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    updateAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    deleteAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    clearAsync(correlationId: string): Promise<void>;
}
