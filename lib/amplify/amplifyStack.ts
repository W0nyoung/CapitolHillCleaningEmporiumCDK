import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha' 
import { Config } from '../../bin/config';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

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

        amplify.addBranch(getBranch(this.account));
    };
};

const getBranch = (accountId : string | undefined) : string => {
    return accountId === Config.prodAccount ? 'main' : 'staging'
};