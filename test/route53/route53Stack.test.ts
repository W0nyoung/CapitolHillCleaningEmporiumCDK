import { App } from "aws-cdk-lib";
import { Route53Stack } from "../../lib/route53/route53Stack";
import { Config } from "../../bin/config";
import { Match, Template } from "aws-cdk-lib/assertions";

const app = new App();

const stagingStack = new Route53Stack(app, 'StagingRoute53Stack', {
    env: {
        account: Config.stagingAccount,
        region: Config.region,
      }
});

const prodStack = new Route53Stack(app, 'ProdRoute53Stack', {
    env: {
        account: Config.prodAccount,
        region: Config.region,
      }
});

const stagingTemplate = Template.fromStack(stagingStack);
const prodTemplate = Template.fromStack(prodStack);

describe('Testing Route53 Stack', () => {
    test('Test Staging Route53 Stack', () => {
        stagingTemplate.hasResourceProperties('AWS::Route53::HostedZone', {
            Name: `staging.${Config.rootLevelDomain}.`
        });

        stagingTemplate.resourceCountIs('AWS::IAM::Role', 0);
    });

    test('Test Prod Route53 Stack', () => {
        prodTemplate.hasResourceProperties('AWS::Route53::HostedZone', {
            Name: `${Config.rootLevelDomain}.`
        });

        prodTemplate.hasResourceProperties('AWS::IAM::Role', {
            RoleName: 'Route53CrossAccountDelegationRole',
            AssumeRolePolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Principal: {
                            AWS: {
                                'Fn::Join': [
                                    '', 
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        `:iam::${Config.stagingAccount}:root`
                                    ]
                                ]
                            }
                        }
                    })
                ])
            }
        });
    });
});