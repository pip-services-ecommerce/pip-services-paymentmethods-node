import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { FilterParamsSchema } from 'pip-services3-commons-node';
import { PagingParamsSchema } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { PaymentMethodV1Schema } from '../data/version1/PaymentMethodV1Schema';
import { IPaymentMethodsController } from './IPaymentMethodsController';

export class PaymentMethodsCommandSet extends CommandSet {
    private _logic: IPaymentMethodsController;

    constructor(logic: IPaymentMethodsController) {
        super();

        this._logic = logic;

        // Register commands to the database
		this.addCommand(this.makeGetPaymentMethodsCommand());
		this.addCommand(this.makeGetPaymentMethodByIdCommand());
		this.addCommand(this.makeCreatePaymentMethodCommand());
		this.addCommand(this.makeUpdatePaymentMethodCommand());
		this.addCommand(this.makeDeletePaymentMethodByIdCommand());
    }

	private makeGetPaymentMethodsCommand(): ICommand {
		return new Command(
			"get_payment_methods",
			new ObjectSchema(true)
				.withOptionalProperty('filter', new FilterParamsSchema())
				.withOptionalProperty('paging', new PagingParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let filter = FilterParams.fromValue(args.get("filter"));
                let paging = PagingParams.fromValue(args.get("paging"));
                this._logic.getPaymentMethods(correlationId, filter, paging, callback);
            }
		);
	}

	private makeGetPaymentMethodByIdCommand(): ICommand {
		return new Command(
			"get_payment_method_by_id",
			new ObjectSchema(true)
				.withRequiredProperty('method_id', TypeCode.String)
				.withRequiredProperty('customer_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let methodId = args.getAsString("method_id");
                let customerId = args.getAsString("customer_id");
                this._logic.getPaymentMethodById(correlationId, methodId, customerId, callback);
            }
		);
	}

	private makeCreatePaymentMethodCommand(): ICommand {
		return new Command(
			"create_payment_method",
			new ObjectSchema(true)
				.withRequiredProperty('method', new PaymentMethodV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let method = args.get("method");
                this._logic.createPaymentMethod(correlationId, method, callback);
            }
		);
	}

	private makeUpdatePaymentMethodCommand(): ICommand {
		return new Command(
			"update_payment_method",
			new ObjectSchema(true)
				.withRequiredProperty('method', new PaymentMethodV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let method = args.get("method");
                this._logic.updatePaymentMethod(correlationId, method, callback);
            }
		);
	}
	
	private makeDeletePaymentMethodByIdCommand(): ICommand {
		return new Command(
			"delete_payment_method_by_id",
			new ObjectSchema(true)
				.withRequiredProperty('method_id', TypeCode.String)
				.withRequiredProperty('customer_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let methodId = args.getAsNullableString("method_id");
                let customerId = args.getAsString("customer_id");
                this._logic.deletePaymentMethodById(correlationId, methodId, customerId, callback);
			}
		);
	}

}