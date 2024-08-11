import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Config } from '../../bin/config';
import { CrossAccountZoneDelegationRecord, HostedZone, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { AccountPrincipal, Effect, PolicyDocument, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';

/**
 * Route53 CDK Stack for creating Route53 Public Hosted Zones
 * Used to manage website DNS configuration
 * Root hosted zone is created automatically by Route53 when domain was registered
 */
export class Route53Stack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        if (this.account === Config.prodAccount) {
              /**
             * Prod DNS configuration
             * References root hosted zone through zone ID
             * Creates an IAM role for staging account to assume in order to create NS, subdomain, relationship in Prod Hosted Zone
             */
            const rootZone = HostedZone.fromHostedZoneId(this, `PublicHostedZone-${Config.rootLevelDomain}`, Config.rootHostedZoneID);

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
            /**
             * Staging DNS configuration
             * Creates Hosted Zone in Staging account
             */
            const subZone = new PublicHostedZone(this, `PublicHostedZone-staging.${Config.rootLevelDomain}`, {
                zoneName: `staging.${Config.rootLevelDomain}`
            });

            // import the delegation role from Prod account by constructing the roleArn
            const delegationRoleArn = Stack.of(this).formatArn({
              region: '', // IAM is global in each partition
              service: 'iam',
              account: Config.prodAccount,
              resource: 'role',
              resourceName: 'Route53CrossAccountDelegationRole',
            });
            const delegationRole = Role.fromRoleArn(this, 'CrossAccountRole', delegationRoleArn);

            new CrossAccountZoneDelegationRecord(this, 'delegate', {
              delegatedZone: subZone,
              parentHostedZoneId: Config.rootHostedZoneID,
              delegationRole
            });
        }
    };
};