# Capitol Hill Cleaning Emporium Website CDK 

AWS CDK repository for creating AWS resources required for hosting Single Page Web application using AWS Amplify. 

UI Repository: https://github.com/tyrakrehbiel/CapitolHillCleaningEmporiumUI

https://capitolhillcleaningemporium.com

## AWS CodePipeline

Pipeline Account: `767397769142`<br/>
Staging Account: `211125385437`<br/>
Production Account: `533267364721`<br/>
Region: `us-east-1`

CodePipeline is configured to synthesize latest changes from this repository's main branch. GitHub personal access token was stored manually in AWS Secrets Manager. CodePipeline is configured to deploy CDK changes to the pipeline in the Pipeline account along with Amplify and Route53 changes to both the staging and production accounts in that order.

```
Pipeline Account -> Staging Account -> Production Account
```

| Pipeline Accounnt | Staging Account | Production Account |
| -------- | ------- | ------- |
| CodePipeline Stack  | Route53 Stack | Route53 Stack | 
| | Amplify Stack | Amplify Stack |

## AWS Route53

Production Endpoint: https://capitolhillcleaningemporium.com<br/>
Staging Endpoint: https://staging.capitolhillcleaningemporium.com

Route53 Stacks are configured to created Route53 Public Hosted Zones for staging and production endpoints in respective accounts. Permissions were granted for Staging account to read NS Records of Production Public Hosted Zone to create subdomain delegation. 

Domain name `capitolhillcleaningemporium.com` was purchased through AWS Route53 in Production account. 

## AWS Amplify 

Separate AWS Amplify apps were created in staging and production accounts. GitHub tokens were stored manually in AWS Secrets Manager in each account. Staging and Main branches were added to each app respectively. Amplify branches, Staging and Main, are configured to consume latest changes from GitHub UI repository Staging and Main branches respectively. Staging and Production domains were configured respectively to each branch. Amplify Redirect/Rewrite rule is configured to inform Amplify on how to handle routing for Single Page Applications. Password was manually created for Staging app. 

`amplify.yml` is located in the root of the GitHub UI repository. 

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
