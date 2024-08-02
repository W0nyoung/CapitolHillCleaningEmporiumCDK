import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AmplifyStack } from '../amplify/amplifyStack';
import { Route53Stack } from '../route53/route53Stack';

export class PipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const amplifyStack = new AmplifyStack(this, `AmplifyStack-${this.account}`);
        amplifyStack.addDependency(new Route53Stack(this, `Route53Stack-${this.account}`));
    };
};
