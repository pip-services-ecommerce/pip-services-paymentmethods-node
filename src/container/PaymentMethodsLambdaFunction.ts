// import { Descriptor } from 'pip-services3-commons-node';
// import { CommandableLambdaFunction } from 'pip-services3-aws-node';
// import { PaymentMethodsServiceFactory } from '../build/PaymentMethodsServiceFactory';

// export class PaymentMethodsLambdaFunction extends CommandableLambdaFunction {
//     public constructor() {
//         super("payment_methods", "Payment methods function");
//         this._dependencyResolver.put('controller', new Descriptor('pip-services-paymentmethods', 'controller', 'default', '*', '*'));
//         this._factories.add(new PaymentMethodsServiceFactory());
//     }
// }

// export const handler = new PaymentMethodsLambdaFunction().getHandler();