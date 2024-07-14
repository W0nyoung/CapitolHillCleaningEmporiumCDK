import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipelineStack';
import { Config } from '../bin/config';
import { Match, Template } from 'aws-cdk-lib/assertions';

const app = new cdk.App();

const stack = new PipelineStack(app, 'PipelineStack', {
  env: {
    account: Config.pipelineAccount,
    region: Config.region,
  }
});

const template = Template.fromStack(stack);

test('Test Pipeline Creation', () => {
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Name: 'InfrastructurePipeline'
  });
});

test('Test Correct Github Repo and Token', () => {
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Stages: Match.arrayWith([Match.objectLike({
      Name: 'Source',
      Actions: Match.arrayWith([Match.objectLike({
        Configuration: Match.objectLike({
          Owner: 'W0nyoung',
          Repo: 'CapitalHillCleaningEmporiumCDK',
          Branch: 'main',
          OAuthToken: '{{resolve:secretsmanager:GitHubToken:SecretString:::}}',
          PollForSourceChanges: false
        })
      })])
    })])
  });
});
