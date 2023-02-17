# version=0.1.0

YAMLPATH="/home/azureuser/aks"
KUBECONFIG="${JENKINS_HOME}/kubernetes/config"

## Update image version in yaml config

#Configuration
sed -i.bak "s/phr-service-configuration:v[0-9]*/phr-service-configuration:v${BUILD_NUMBER}/g" $YAMLPATH/02_00-service-configuration.yaml && rm $YAMLPATH/02_00-service-configuration.yaml.bak

#Controller
sed -i.bak "s/phr-service-controller:v[0-9]*/phr-service-controller:v${BUILD_NUMBER}/g" $YAMLPATH/02-service-controller.yaml && rm $YAMLPATH/02-service-controller.yaml.bak

#Database
sed -i.bak "s/phr-service-database:v[0-9]*/phr-service-database:v${BUILD_NUMBER}/g" $YAMLPATH/03-service-database.yaml && rm $YAMLPATH/03-service-database.yaml.bak

#Authentication
sed -i.bak "s/phr-service-authentication:v[0-9]*/phr-service-authentication:v${BUILD_NUMBER}/g" $YAMLPATH/04-service-authentication.yaml && rm $YAMLPATH/04-service-authentication.yaml.bak

#Accounts
sed -i.bak "s/phr-service-accounts:v[0-9]*/phr-service-accounts:v${BUILD_NUMBER}/g" $YAMLPATH/05-service-accounts.yaml && rm $YAMLPATH/05-service-accounts.yaml.bak

#Goals
sed -i.bak "s/phr-service-goals:v[0-9]*/phr-service-goals:v${BUILD_NUMBER}/g" $YAMLPATH/06-service-goals.yaml && rm $YAMLPATH/06-service-goals.yaml.bak

#Coping strategies
sed -i.bak "s/phr-service-coping-strategies:v[0-9]*/phr-service-coping-strategies:v${BUILD_NUMBER}/g" $YAMLPATH/07-service-coping-strategies.yaml && rm $YAMLPATH/07-service-coping-strategies.yaml.bak

#Sleep tracker
sed -i.bak "s/phr-service-sleep-tracker:v[0-9]*/phr-service-sleep-tracker:v${BUILD_NUMBER}/g" $YAMLPATH/08-service-sleep-tracker.yaml && rm $YAMLPATH/08-service-sleep-tracker.yaml.bak

#Problem tracker
sed -i.bak "s/phr-service-problem-tracker:v[0-9]*/phr-service-problem-tracker:v${BUILD_NUMBER}/g" $YAMLPATH/09-service-problem-tracker.yaml && rm $YAMLPATH/09-service-problem-tracker.yaml.bak

#Diary
sed -i.bak "s/phr-service-diary:v[0-9]*/phr-service-diary:v${BUILD_NUMBER}/g" $YAMLPATH/10-service-diary.yaml && rm $YAMLPATH/10-service-diary.yaml.bak

#Medication
sed -i.bak "s/phr-service-medication:v[0-9]*/phr-service-medication:v${BUILD_NUMBER}/g" $YAMLPATH/11-service-medication.yaml && rm $YAMLPATH/11-service-medication.yaml.bak

#Careplan
sed -i.bak "s/phr-service-careplan:v[0-9]*/phr-service-careplan:v${BUILD_NUMBER}/g" $YAMLPATH/12-service-careplan.yaml && rm $YAMLPATH/12-service-careplan.yaml.bak

#School feedback
sed -i.bak "s/phr-service-school-feedback:v[0-9]*/phr-service-school-feedback:v${BUILD_NUMBER}/g" $YAMLPATH/13-service-school-feedback.yaml && rm $YAMLPATH/13-service-school-feedback.yaml.bak

#About me
sed -i.bak "s/phr-service-aboutme:v[0-9]*/phr-service-aboutme:v${BUILD_NUMBER}/g" $YAMLPATH/14-service-about-me.yaml && rm $YAMLPATH/14-service-about-me.yaml.bak

#Chat
sed -i.bak "s/phr-service-chat:v[0-9]*/phr-service-chat:v${BUILD_NUMBER}/g" $YAMLPATH/15-service-chat.yaml && rm $YAMLPATH/15-service-chat.yaml.bak

#Message
sed -i.bak "s/phr-service-message:v[0-9]*/phr-service-message:v${BUILD_NUMBER}/g" $YAMLPATH/16-service-message.yaml && rm $YAMLPATH/16-service-message.yaml.bak

#Room
sed -i.bak "s/phr-service-room:v[0-9]*/phr-service-room:v${BUILD_NUMBER}/g" $YAMLPATH/17-service-room.yaml && rm $YAMLPATH/17-service-room.yaml.bak

#Survey builder
sed -i.bak "s/phr-service-survey-builder:v[0-9]*/phr-service-survey-builder:v${BUILD_NUMBER}/g" $YAMLPATH/18-survey-builder.yaml && rm $YAMLPATH/18-survey-builder.yaml.bak

#Survey circle
sed -i.bak "s/phr-service-circle:v[0-9]*/phr-service-circle:v${BUILD_NUMBER}/g" $YAMLPATH/19-service-circle.yaml && rm $YAMLPATH/19-service-circle.yaml.bak

#email
sed -i.bak "s/phr-service-email:v[0-9]*/phr-service-email:v${BUILD_NUMBER}/g" $YAMLPATH/20-service-email.yaml && rm $YAMLPATH/20-service-email.yaml.bak

#Survey Job
sed -i.bak "s/phr-service-job:v[0-9]*/phr-service-job:v${BUILD_NUMBER}/g" $YAMLPATH/21-service-jobs.yaml && rm $YAMLPATH/21-service-jobs.yaml.bak

#Mood tracker
sed -i.bak "s/phr-service-mood:v[0-9]*/phr-service-mood:v${BUILD_NUMBER}/g" $YAMLPATH/22-service-mood.yaml && rm $YAMLPATH/22-service-mood.yaml.bak

#ePJS
sed -i.bak "s/phr-service-epjs:v[0-9]*/phr-service-epjs:v${BUILD_NUMBER}/g" $YAMLPATH/101-service-epjs.yaml && rm $YAMLPATH/101-service-epjs.yaml.bak

#MCDNA
sed -i.bak "s/phr-service-mcdna:v[0-9]*/phr-service-mcdna:v${BUILD_NUMBER}/g" $YAMLPATH/102-service-mcdna.yaml && rm $YAMLPATH/102-service-mcdna.yaml.bak

## Update kubernetes components
kubectl apply -f $YAMLPATH/02_00-service-configuration.yaml -f $YAMLPATH/02-service-controller.yaml -f $YAMLPATH/03-service-database.yaml -f $YAMLPATH/04-service-authentication.yaml -f $YAMLPATH/05-service-accounts.yaml -f $YAMLPATH/06-service-goals.yaml  -f $YAMLPATH/07-service-coping-strategies.yaml -f $YAMLPATH/08-service-sleep-tracker.yaml  -f $YAMLPATH/09-service-problem-tracker.yaml -f $YAMLPATH/10-service-diary.yaml -f $YAMLPATH/11-service-medication.yaml -f $YAMLPATH/12-service-careplan.yaml -f $YAMLPATH/13-service-school-feedback.yaml -f $YAMLPATH/14-service-about-me.yaml -f $YAMLPATH/15-service-chat.yaml -f $YAMLPATH/16-service-message.yaml -f $YAMLPATH/17-service-room.yaml -f $YAMLPATH/18-survey-builder.yaml -f $YAMLPATH/19-service-circle.yaml -f $YAMLPATH/20-service-email.yaml -f $YAMLPATH/21-service-jobs.yaml -f $YAMLPATH/22-service-mood.yaml -f $YAMLPATH/101-service-epjs.yaml -f $YAMLPATH/102-service-mcdna.yaml --kubeconfig $KUBECONFIG
