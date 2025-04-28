import {StackProps} from "aws-cdk-lib";
import {TableV2} from "aws-cdk-lib/aws-dynamodb";

export interface DynamoInterface extends StackProps {
    arnDynamodbTable: TableV2;
}