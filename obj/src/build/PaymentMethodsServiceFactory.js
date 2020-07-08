"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const PaymentMethodsMongoDbPersistence_1 = require("../persistence/PaymentMethodsMongoDbPersistence");
const PaymentMethodsFilePersistence_1 = require("../persistence/PaymentMethodsFilePersistence");
const PaymentMethodsMemoryPersistence_1 = require("../persistence/PaymentMethodsMemoryPersistence");
// import { PaymentMethodsPayPalPersistence } from '../persistence/PaymentMethodsPayPalPersistence';
const PaymentMethodsController_1 = require("../logic/PaymentMethodsController");
const PaymentMethodsHttpServiceV1_1 = require("../services/version1/PaymentMethodsHttpServiceV1");
class PaymentMethodsServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(PaymentMethodsServiceFactory.MemoryPersistenceDescriptor, PaymentMethodsMemoryPersistence_1.PaymentMethodsMemoryPersistence);
        this.registerAsType(PaymentMethodsServiceFactory.FilePersistenceDescriptor, PaymentMethodsFilePersistence_1.PaymentMethodsFilePersistence);
        this.registerAsType(PaymentMethodsServiceFactory.MongoDbPersistenceDescriptor, PaymentMethodsMongoDbPersistence_1.PaymentMethodsMongoDbPersistence);
        // this.registerAsType(PaymentMethodsServiceFactory.PayPalPersistenceDescriptor, PaymentMethodsPayPalPersistence);
        this.registerAsType(PaymentMethodsServiceFactory.ControllerDescriptor, PaymentMethodsController_1.PaymentMethodsController);
        this.registerAsType(PaymentMethodsServiceFactory.HttpServiceDescriptor, PaymentMethodsHttpServiceV1_1.PaymentMethodsHttpServiceV1);
    }
}
exports.PaymentMethodsServiceFactory = PaymentMethodsServiceFactory;
PaymentMethodsServiceFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "factory", "default", "default", "1.0");
PaymentMethodsServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "persistence", "memory", "*", "1.0");
PaymentMethodsServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "persistence", "file", "*", "1.0");
PaymentMethodsServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "persistence", "mongodb", "*", "1.0");
// public static PayPalPersistenceDescriptor = new Descriptor("pip-services-paymentmethods", "persistence", "paypal", "*", "1.0");
PaymentMethodsServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "controller", "default", "*", "1.0");
PaymentMethodsServiceFactory.HttpServiceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-paymentmethods", "service", "http", "*", "1.0");
//# sourceMappingURL=PaymentMethodsServiceFactory.js.map