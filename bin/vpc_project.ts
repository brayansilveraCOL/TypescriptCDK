#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcProjectStack } from '../lib/vpc_project-stack';
import {DevelopmentEnv} from "../lib/environments/development";
import {ProductionEnv} from "../lib/environments/production";
import {tagResourceGeneral} from "../utils/tag-generals";
import {EC2VpcProjectStack} from "../lib/ec2_vpc_project-stack";
import {APIProjectStack} from "../lib/api_project-stack";

const app = new cdk.App();

/** Obtain environment running **/
const environment = app.node.tryGetContext('env');

/** validate if environment is not None **/
if (!environment) {
    throw new Error("Please send correct environments '-c env=dev' o '-c env=prod'");
}
/** Send environment variables **/
const envConfig = environment === 'prod' ? ProductionEnv : DevelopmentEnv;

/** Get Suffix for resources **/
const suffix = environment === 'prod' ? 'production' : 'development';
/** Stack VPC**/
const UStackVPC = new VpcProjectStack(app, `UStackVPC${suffix}`, suffix,  {env: envConfig})
tagResourceGeneral(UStackVPC, environment, `UStackVPC${suffix}`)

/** Stack EC2**/
const UStackEC2 = new EC2VpcProjectStack(app, `UStackEC2${suffix}`, suffix,  {env: envConfig, vpc: UStackVPC.vpc})
tagResourceGeneral(UStackEC2, environment, `UStackEC2${suffix}`)

/** Stack API**/
const UStackAPI = new APIProjectStack(app, `UStackAPI${suffix}`, suffix,  {env: envConfig, arnDynamodbTable: UStackVPC.arnDynamodbTable})
tagResourceGeneral(UStackAPI, environment, `UStackAPI${suffix}`)
