import { App } from "aws-cdk-lib";
import { Config } from "../../bin/config";
import { AmplifyStack } from "../../lib/amplify/amplifyStack";
import { Match, Template } from "aws-cdk-lib/assertions";

const app = new App();

const stagingStack = new AmplifyStack(app, 'StagingAmplifyStackProd', {
    env: {
      account: Config.stagingAccount,
      region: Config.region,
    }
});

const prodStack = new AmplifyStack(app, 'ProdAmplifyStack', {
    env: {
      account: Config.prodAccount,
      region: Config.region,
    }
});

const stagingTemplate = Template.fromStack(stagingStack);
const prodTemplate = Template.fromStack(prodStack);

describe('Testing Amplify Stack', () => {

    test('Test Staging Amplify App', () => {
        stagingTemplate.hasResourceProperties('AWS::Amplify::App', {
            Repository: `https://github.com/${Config.websiteGithubOwner}/${Config.websiteGithubRepo}`,
            OauthToken: `{{resolve:secretsmanager:${Config.githubTokenKey}:SecretString:::}}`
        });

        stagingTemplate.hasResourceProperties('AWS::Amplify::Branch', {
            BranchName: 'staging' 
        });

        stagingTemplate.hasResourceProperties('AWS::Amplify::Domain', {
            DomainName: `staging.${Config.rootLevelDomain}`,
            SubDomainSettings: Match.arrayWith([
                Match.objectLike({
                    Prefix: 'www'
                })
            ])
        });
    });

    test('Test Prod Amplify App', () => {
        prodTemplate.hasResourceProperties('AWS::Amplify::App', {
            Repository: `https://github.com/${Config.websiteGithubOwner}/${Config.websiteGithubRepo}`,
            OauthToken: `{{resolve:secretsmanager:${Config.githubTokenKey}:SecretString:::}}`
        });

        prodTemplate.hasResourceProperties('AWS::Amplify::Branch', {
            BranchName: 'main' 
        });

        prodTemplate.hasResourceProperties('AWS::Amplify::Domain', {
            DomainName: Config.rootLevelDomain,
            SubDomainSettings: Match.arrayWith([
                Match.objectLike({
                    Prefix: 'www'
                })
            ])
        });
    });
});