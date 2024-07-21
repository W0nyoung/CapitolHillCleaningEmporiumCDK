import { Match } from "aws-cdk-lib/assertions";
import { Config } from "../../bin/config";
import { App } from 'aws-cdk-lib';
import { PipelineStack } from '../../lib/pipeline/pipelineStack';
import { Template } from 'aws-cdk-lib/assertions';

const app = new App();

const stack = new PipelineStack(app, 'PipelineStack', {
  env: {
    account: Config.pipelineAccount,
    region: Config.region,
  }
});

const template = Template.fromStack(stack);

describe('Testing Pipeline Stack', () => {

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
            Repo: 'CapitolHillCleaningEmporiumCDK',
            Branch: 'main',
            OAuthToken: `{{resolve:secretsmanager:${Config.githubTokenKey}:SecretString:::}}`,
            PollForSourceChanges: false
          })
        })])
      })])
    });
  });

  test('Test Staging Pipeline Stage Created', () => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Stages: Match.arrayWith([Match.objectLike({
        Name: 'StagingAccountStage'
      })])
    });
  });

  test('Test Prod Pipeline Stage Created', () => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Stages: Match.arrayWith([Match.objectLike({
        Name: 'ProdAccountStage'
      })])
    });
  });
});