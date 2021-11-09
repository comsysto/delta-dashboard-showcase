#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { buildApp } from "../lib/build-app";

const REPO = "delta-dashboard-showcase";
const OWNER = "comsysto";
const BRANCH = "stage-2";

const app = new cdk.App();
buildApp(app, REPO, BRANCH, OWNER);
