import {Duration, Stack, StackProps, RemovalPolicy} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {TableV2} from "aws-cdk-lib/aws-dynamodb";

export class VpcProjectStack extends Stack {

  public readonly vpc: ec2.Vpc;
  public readonly arnDynamodbTable: TableV2;

  constructor(scope: Construct, id: string, environment: string, props?: StackProps) {
    super(scope, id, props);
    this.vpc = new ec2.Vpc(this, `UStackVPC_${environment}`, {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
    this.arnDynamodbTable = new dynamodb.TableV2(this, `UStackDynamoDB_${environment}`, {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING }
    });
  }
}
