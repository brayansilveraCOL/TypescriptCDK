import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {StackProps} from "aws-cdk-lib";

export interface EC2Interface extends StackProps {
    vpc: ec2.IVpc;
}