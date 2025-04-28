import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";
import {AvailableStages} from "../interfaces/common";

export const tagResourceGeneral = (scope: Construct, stage: AvailableStages, application: string) => {
    const tags = Tags.of(scope);
    tags.add("environment", stage);
    tags.add("managedBy", "CDK");
    tags.add("application", application);
};
