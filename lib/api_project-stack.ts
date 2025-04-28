import {aws_apigateway, Duration, Size, Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from 'aws-cdk-lib/aws-iam';
import {LogGroup} from "aws-cdk-lib/aws-logs";
import * as path from "node:path";
import {DynamoInterface} from "../interfaces/DynamoInterface";

export class APIProjectStack extends Stack {
    constructor(scope: Construct, id: string, environment: string, props: DynamoInterface) {
        super(scope, id, props);

        const envVars = {
            TABLE_NAME: props.arnDynamodbTable.tableName,
        }
        const latestPython = lambda.Runtime.PYTHON_3_12;

        const handlerFunctionName = 'lambda_handler';

        const logGroupFnUStackFunc = new LogGroup(this, `LogGroup-UStackFunc_${environment}`, {
            logGroupName: `/aws/lambda/UStackFunc_${environment}`,
        });
        const role = new iam.Role(this, `UStackFuncRole_${environment}`, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
        role.addToPolicy(new iam.PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [props.arnDynamodbTable.tableArn],
        }));
        const lambdaAPI = new lambda.Function(this, `UStackFunc_${environment}`, {
            code: lambda.Code.fromAsset(path.join(__dirname, 'api-code')),
            handler: handlerFunctionName,
            runtime: latestPython,
            timeout: Duration.seconds(15),
            memorySize: 150,
            ephemeralStorageSize: Size.mebibytes(120),
            logGroup: logGroupFnUStackFunc,
            environment: envVars,
            functionName: `UStackFunc_${environment}`,
            role: role,
        });

        const api = new aws_apigateway.RestApi(this, `UStackAPI_${environment}`, {
            restApiName: `UStackAPI${environment}`,
            description: "This is API",
            deploy: false
        });
        const register = api.root.addResource('register');
        register.addMethod("POST", new aws_apigateway.LambdaIntegration(lambdaAPI));
        const deployment = new aws_apigateway.Deployment(this, `UStackAPIDeployment_${environment}`, {
            api,
            description: `Deployment para entorno ${environment}`,
        });
        api.deploymentStage = new aws_apigateway.Stage(this, `UStackAPIStage_${environment}`, {
            stageName: environment,
            deployment,
            variables: {
                ENV: environment,
            },
        });
        lambdaAPI.addPermission(`AllowApiInvoke`, {
            principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
            action: "lambda:InvokeFunction",
            sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.restApiId}/${environment}/*/*`,
        });
    }
}
