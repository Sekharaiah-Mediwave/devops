pipeline {
  agent any
  stages {
    stage('Build Services 5') {
      parallel {
        stage('Build alcohol') {
           steps {
             acrQuickTask(azureCredentialsId: "$env.AZURE_SP", local: "services/alcohol", imageNames: [[image: "$env.PHR_REGISTRY/phr-$env.MAIA3_NAMESPACE-service-alcohol:v$env.BUILD_NUMBER" ], [image: "$env.PHR_REGISTRY/phr-$env.MAIA3_NAMESPACE-service-alcohol:latest"]], registryName: "$env.AZURE_CONTAINER_REGISTRY", resourceGroupName: "$env.AZURE_RG", timeout:600)
           }
        }
      }
    }


    stage('Deployment') {
      parallel {
        stage('Deploy alcohol') {
          steps {
            kubernetesDeploy(kubeConfig: [path:"$KUBERNETES_CONFIG"], configs: 'scripts/k8s/3004_alcohol.yaml')
          }
        }
      }
    }
  }
}
