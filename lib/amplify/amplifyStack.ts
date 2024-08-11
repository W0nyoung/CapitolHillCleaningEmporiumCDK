import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha' 
import { Config } from '../../bin/config';

/**
 * Amplify CDK Stack
 * Creates Amplify App in each account referencing respective GitHub branch depending on stage
 * GitHub token for UI Repo is stored in AWS Secrets Manager in each account
 * Configures custom domain from Route53 stack
 */
export class AmplifyStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        const amplify = new App(this, `Amplify-${this.account}-${this.region}`, {
            sourceCodeProvider: new GitHubSourceCodeProvider({
                owner: Config.websiteGithubOwner,
                repository: Config.websiteGithubRepo,
                oauthToken: SecretValue.secretsManager(Config.githubTokenKey)
            }),
            appName: `${Config.websiteGithubRepo}-${getBranch(this.account)}`
        });

        const branch = amplify.addBranch(getBranch(this.account));
        const domain = amplify.addDomain(getDomain(this.account));
        domain.mapRoot(branch);
        domain.mapSubDomain(branch, 'www');
    };
};

const getBranch = (accountId : string | undefined) : string => {
    return accountId === Config.prodAccount ? 'main' : 'staging'
};

const getDomain = (accountId: string | undefined) : string => accountId === Config.stagingAccount ? `staging.${Config.rootLevelDomain}` : Config.rootLevelDomain;