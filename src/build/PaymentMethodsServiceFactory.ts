// import { Factory } from 'pip-services3-components-node';
// import { Descriptor } from 'pip-services3-commons-node';

// import { PaymentMethodsMongoDbPersistence } from '../persistence/PaymentMethodsMongoDbPersistence';
// import { PaymentMethodsFilePersistence } from '../persistence/PaymentMethodsFilePersistence';
// import { PaymentMethodsMemoryPersistence } from '../persistence/PaymentMethodsMemoryPersistence';
// import { PaymentMethodsPayPalPersistence } from '../persistence/PaymentMethodsPayPalPersistence';
// import { PaymentMethodsController } from '../logic/PaymentMethodsController';
// import { PaymentMethodsHttpServiceV1 } from '../services/version1/PaymentMethodsHttpServiceV1';

// export class PaymentMethodsServiceFactory extends Factory {
// 	public static Descriptor = new Descriptor("pip-services-paymentmethods", "factory", "default", "default", "1.0");
// 	public static MemoryPersistenceDescriptor = new Descriptor("pip-services-paymentmethods", "persistence", "memory", "*", "1.0");
// 	public static FilePersistenceDescriptor = new Descriptor("pip-services-paymentmethods", "persistence", "file", "*", "1.0");
// 	public static MongoDbPersistenceDescriptor = new Descriptor("pip-services-paymentmethods", "persistence", "mongodb", "*", "1.0");
// 	public static PayPalPersistenceDescriptor = new Descriptor("pip-services-paymentmethods", "persistence", "paypal", "*", "1.0");
// 	public static ControllerDescriptor = new Descriptor("pip-services-paymentmethods", "controller", "default", "*", "1.0");
// 	public static HttpServiceDescriptor = new Descriptor("pip-services-paymentmethods", "service", "http", "*", "1.0");
	
// 	constructor() {
// 		super();
// 		this.registerAsType(PaymentMethodsServiceFactory.MemoryPersistenceDescriptor, PaymentMethodsMemoryPersistence);
// 		this.registerAsType(PaymentMethodsServiceFactory.FilePersistenceDescriptor, PaymentMethodsFilePersistence);
// 		this.registerAsType(PaymentMethodsServiceFactory.MongoDbPersistenceDescriptor, PaymentMethodsMongoDbPersistence);
// 		this.registerAsType(PaymentMethodsServiceFactory.PayPalPersistenceDescriptor, PaymentMethodsPayPalPersistence);
// 		this.registerAsType(PaymentMethodsServiceFactory.ControllerDescriptor, PaymentMethodsController);
// 		this.registerAsType(PaymentMethodsServiceFactory.HttpServiceDescriptor, PaymentMethodsHttpServiceV1);
// 	}
	
// }
