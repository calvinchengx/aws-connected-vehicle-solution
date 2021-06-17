# AWS Connected Vehicle Solution
The AWS Connected Vehicle Solution is a reference implementation that provides a foundation for automotive product transformations for connected vehicle services, autonomous driving, electric powertrains, and shared mobility.

## Getting Started
To get started with the AWS Connected Vehicle Solution, please review the solution documentation. https://aws.amazon.com/answers/iot/connected-vehicle-solution/

## Building distributables for customization
* Configure the bucket name and the region your target Amazon S3 distribution bucket
```
export BUCKET_PREFIX=my-bucket-name
export REGION=us-east-1
```

* Create a Amazon S3 distribution bucket. The name has to be suffixed with the target region. _Note:_ you must have the AWS Command Line Interface installed.
```
aws s3api create-bucket --bucket $BUCKET_PREFIX-$REGION --region $REGION
```

* Clone the repository, then build the distibutables:
```
cd ./deployment
chmod +x build-s3-dist.sh
./build-s3-dist.sh
```

* Deploy the distributables to the Amazon S3 distribution bucket in your account.

```
cd ./deployment
s3 cp ./dist s3://$BUCKET_PREFIX-$REGION/connected-vehicle-solution/latest --recursive --profile aws-cred-profile-name
```

* Get the link of the aws-connected-vehicle-solution.template uploaded to your Amazon S3 bucket.
* Deploy the AWS Connected Vehicle Solution to your account by launching a new AWS CloudFormation stack using the link of the aws-connected-vehicle-solution.template.

## File Structure
The AWS Connected Vehicle Solution project consists of microservices that facilitate the functional areas of the platform. These microservices are deployed to a serverless environment in AWS Lambda.

<pre>
|-source/
  |-services/
    |-helper/       [ AWS CloudFormation custom resource deployment helper ]
  |-services/
    |-anomaly/      [ microservice for humanization and persistence of identified anomalies ]
    |-driversafety/ [ microservice to orchestrate the creation of driver scores ]
    |-dtc/          [ microservice to orchestrate the capture, humanization and persistence of diagnostic trouble codes ]
    |-jitr/         [ microservice to orchestrate registration and policy creation for just-in-time registration of devices ]    
    |-notification/ [ microservice to send SMS and MQTT notifications for the solution ]
    |-vehicle/      [ microservice to provide proxy interface for the AWS Connected Vehicle Solution API ]    
</pre>

Each microservice follows the structure of:

<pre>
|-service-name/
  |-lib/
    |-[ service module libraries and unit tests ]
  |-index.js [ injection point for microservice ]
  |-package.json
</pre>

### Using Serverless Application Model (command line tool) to test locally

```
# STEP 1

brew tap aws/tap
brew install aws-sam-cli

sam --version


# STEP 2

In each folder for aws-connected-vehicle-solution source code, we want to add in buildspec.yaml and template.yaml
```


Example of template.yaml

```
# This is the SAM template that represents the architecture of your serverless application
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-template-basics.html

# The AWSTemplateFormatVersion identifies the capabilities of the template
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/format-version-structure.html
AWSTemplateFormatVersion: 2010-09-09
Description: >-
  sam-app

# Transform section specifies one or more macros that AWS CloudFormation uses to process your template
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html
Transform:
- AWS::Serverless-2016-10-31

# Resources declares the AWS resources that you want to include in the stack
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html
Resources:
  # Each Lambda function is defined by properties:
  # https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction

  # This is a Lambda function config associated with the source code: index.js
  handler:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs12.x
      MemorySize: 128
      Timeout: 100
      Description: A Lambda function that returns a static string.
      Policies:
        # Give Lambda basic execution Permission to the helloFromLambda
        - AWSLambdaBasicExecutionRole
```

buildspec file is the same for every folder

```
version: 0.2

phases:
  install:
    commands:
      # Install all dependencies (including dependencies for running tests)
      - npm install
  pre_build:
    commands:
      # Discover and run unit tests in the '__tests__' directory
      - npm run test
      # Remove all unit tests to reduce the size of the package that will be ultimately uploaded to Lambda
      - rm -rf ./__tests__
      # Remove all dependencies not needed for the Lambda deployment package (the packages from devDependencies in package.json)
      - npm prune --production
  build:
    commands:
      # Use AWS SAM to package the application by using AWS CloudFormation
      - aws cloudformation package --template template.yml --s3-bucket $S3_BUCKET --output-template template-export.yml
artifacts:
  type: zip
  files:
    - template-export.yml
```

Each of these folders should have its own
- template.yaml
- buildspec.yaml

Each of the services and help functions are in these sub-folders
- source/resources/helper
- source/services/anomaly
- source/services/driversafety
- source/services/dtc
- source/services/jitr
- source/services/marketing
- source/services/notification
- source/services/vehicle

And once we have template.yaml and buildspec.yaml in each folder, we can one by one test each folder's serverless function using the command

```
# STEP 3
sam build && sam local invoke
```
