#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline/pipelineStack';
import { Config } from './config';

const app = new App();

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: Config.pipelineAccount,
    region: Config.region,
  }
});

app.synth();