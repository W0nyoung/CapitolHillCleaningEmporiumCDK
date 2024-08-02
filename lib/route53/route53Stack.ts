import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Config } from '../../bin/config';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { AccountPrincipal, Effect, PolicyDocument, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';

export class Route53Stack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        if (this.account === Config.prodAccount) {
            const rootZone = new PublicHostedZone(this, `PublicHostedZone-${Config.rootLevelDomain}`, {
                zoneName: Config.rootLevelDomain
            });

            const crossAccountRole = new Role(this, 'CrossAccountRole', {
                roleName: 'Route53CrossAccountDelegationRole',
                assumedBy: new AccountPrincipal(Config.stagingAccount),
                inlinePolicies: {
                  crossAccountPolicy: new PolicyDocument({
                    statements: [
                      new PolicyStatement({
                        sid: 'ListHostedZonesByName',
                        effect: Effect.ALLOW,
                        actions: ['route53:ListHostedZonesByName'],
                        resources: ['*'],
                      }),
                      new PolicyStatement({
                        sid: 'GetHostedZoneAndChangeResourceRecordSets',
                        effect: Effect.ALLOW,
                        actions: ['route53:GetHostedZone', 'route53:ChangeResourceRecordSets'],
                        resources: [`arn:aws:route53:::hostedzone/${Config.rootHostedZoneID}`],
                        conditions: {
                          'ForAllValues:StringLike': {
                            'route53:ChangeResourceRecordSetsNormalizedRecordNames': [
                              `staging.${Config.rootLevelDomain}`,
                            ],
                          },
                        },
                      }),
                    ],
                  }),
                },
              });

              rootZone.grantDelegation(crossAccountRole);
        } else {
            const subZone = new PublicHostedZone(this, `PublicHostedZone-staging.${Config.rootLevelDomain}`, {
                zoneName: `staging.${Config.rootLevelDomain}`
            });

            // Todo: Create Cross Account Zone delegation
        }
    };
};