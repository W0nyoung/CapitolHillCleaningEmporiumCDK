import { Match, Template } from "aws-cdk-lib/assertions";
import { PipelineStack } from "../../lib/pipeline/pipelineStack";
import { Config } from "../../bin/config";
import { App } from "aws-cdk-lib";

const app = new App();

const stack = new PipelineStack(app, 'PipelineStack', {
  env: {
    account: Config.pipelineAccount,
    region: Config.region,
  }
});

const template = Template.fromStack(stack);

describe('Testing PipelineStage Stack', () => {

    test('Staging stage has Amplify Stack', () => {
        template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
            Stages: Match.arrayWith([Match.objectLike({
              Name: 'StagingAccountStage',
              Actions: Match.arrayWith([Match.objectLike({
                Configuration: Match.objectLike({
                  StackName: Match.stringLikeRegexp('StagingAccountStage-AmplifyStack-*')
                })
              })])
            })])
        });
    });

    test('Prod stage has Amplify Stack', () => {
        template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
            Stages: Match.arrayWith([Match.objectLike({
              Name: 'ProdAccountStage',
              Actions: Match.arrayWith([Match.objectLike({
                Configuration: Match.objectLike({
                  StackName: Match.stringLikeRegexp('ProdAccountStage-AmplifyStack-*')
                })
              })])
            })])
        });
    });
});