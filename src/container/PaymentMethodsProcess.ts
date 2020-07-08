import { ProcessContainer } from 'pip-services3-container-node';

import { PaymentMethodsServiceFactory } from '../build/PaymentMethodsServiceFactory';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

export class PaymentMethodsProcess extends ProcessContainer {

    public constructor() {
        super("payment_methods", "Payment methods microservice");
        this._factories.add(new PaymentMethodsServiceFactory);
        this._factories.add(new DefaultRpcFactory);
    }

}
