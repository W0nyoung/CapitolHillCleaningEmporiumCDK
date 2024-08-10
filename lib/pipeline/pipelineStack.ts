import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Config } from '../../bin/config';
import { PipelineStage } from './pipelineStage';

/**
 * AWS CodePipeline CDK Stack
 * GitHub Token for CDK Repo is stored in AWS Secrets Manager
 * Pipeline tracks main branch and will deploy changes whenever a change is pushed to main
 * Pipeline stages, staging and prod, are defined here
 */
export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'InfrastructurePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(Config.githubRepo, 'main', {
          authentication: SecretValue.secretsManager('GitHubToken')
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
      crossAccountKeys: true
    });

    pipeline.addStage(new PipelineStage(this, `StagingAccountStage`, {
      env: {
        account: Config.stagingAccount,
        region: Config.region
      }
    }));

    pipeline.addStage(new PipelineStage(this, `ProdAccountStage`, {
      env: {
        account: Config.prodAccount,
        region: Config.region
      }
    }));
  };
};