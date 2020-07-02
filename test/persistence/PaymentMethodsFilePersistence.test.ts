// import { ConfigParams } from 'pip-services3-commons-node';

// import { PaymentMethodsFilePersistence } from '../../src/persistence/PaymentMethodsFilePersistence';
// import { PaymentMethodsPersistenceFixture } from './PaymentMethodsPersistenceFixture';

// suite('PaymentMethodsFilePersistence', ()=> {
//     let persistence: PaymentMethodsFilePersistence;
//     let fixture: PaymentMethodsPersistenceFixture;
    
//     setup((done) => {
//         persistence = new PaymentMethodsFilePersistence('./data/payment_methods.test.json');

//         fixture = new PaymentMethodsPersistenceFixture(persistence);

//         persistence.open(null, (err) => {
//             persistence.clear(null, done);
//         });
//     });
    
//     teardown((done) => {
//         persistence.close(null, done);
//     });
        
//     test('CRUD Operations', (done) => {
//         fixture.testCrudOperations(done);
//     });

//     test('Get with Filters', (done) => {
//         fixture.testGetWithFilter(done);
//     });

// });