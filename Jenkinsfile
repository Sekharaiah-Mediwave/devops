pipeline {
    agent any

    stages {
        stage('Build and Deploy Service 1') {
            when {
                changeset "./service1"
            }
            steps {
                sh 'cd service-1 && mvn clean package'
                sh 'cd service-1 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 2') {
            when {
                changeset "./service2"
            }
            steps {
                sh 'cd service-2 && mvn clean package'
                sh 'cd service-2 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 3') {
            when {
                changeset "./service3"
            }
            steps {
                sh 'cd service-3 && mvn clean package'
                sh 'cd service-3 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 4') {
            when {
                changeset "./service4"
            }
            steps {
                sh 'cd service-4 && mvn clean package'
                sh 'cd service-4 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 5') {
            when {
                changeset "./service5"
            }
            steps {
                sh 'cd service-5 && mvn clean package'
                sh 'cd service-5 && kubectl apply -f deployment.yaml'
            }
        }
    }
}
