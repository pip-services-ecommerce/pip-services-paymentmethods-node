import { IStripeConnector } from "../IStripeConnector";
import { FilterParams, PagingParams, DataPage } from "pip-services3-commons-node";
import { PaymentMethodV1 } from "../../data/version1";
import Stripe from "stripe";
export declare class StripeBankAccountsConnector implements IStripeConnector {
    private _client;
    constructor(client: Stripe);
    getPageByFilterAsync(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<PaymentMethodV1>>;
    getByIdAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    createAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    updateAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    deleteAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    clearAsync(correlationId: string): Promise<void>;
    private getCustomerIdAsync;
    private toPublicAsync;
    private toPublicCustomerAsync;
    private fromPublicCustomerAsync;
    private getAllCustomerIds;
    private toMetadata;
    private fromMetadata;
}
