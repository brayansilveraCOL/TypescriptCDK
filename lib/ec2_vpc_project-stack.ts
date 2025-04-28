import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {EC2Interface} from "../interfaces/EC2Interface";

export class EC2VpcProjectStack extends Stack {
    constructor(scope: Construct, id: string, environment: string, props: EC2Interface) {
        super(scope, id, props);
        const myIp = "192.168.0.1/24";
        const securityGroup = new ec2.SecurityGroup(this, `UStackSG_${environment}`, {
            vpc: props.vpc,
            description: 'Security Group for SSH (from my IP) and HTTP/HTTPS (from anywhere)',
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(
            ec2.Peer.ipv4(myIp),
            ec2.Port.tcp(22),
            'Allow SSH access from my IP'
        );
        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP access from anywhere'
        );
        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'Allow HTTPS access from anywhere'
        );
        new ec2.Instance(this, `UStackEC2_${environment}`, {
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.C7G, ec2.InstanceSize.LARGE),
            machineImage: ec2.MachineImage.latestAmazonLinux2023(),
            securityGroup: securityGroup,
        })

    }
}
