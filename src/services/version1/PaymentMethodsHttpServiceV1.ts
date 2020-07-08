import { Descriptor } from 'pip-services3-commons-node';
import { CommandableHttpService } from 'pip-services3-rpc-node';

export class PaymentMethodsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/payment_methods');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-paymentmethods', 'controller', 'default', '*', '1.0'));
    }
}