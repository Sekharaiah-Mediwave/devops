pipeline {
    agent any

    stages {
        stage('Build and Deploy Service 1') {
            when {
<<<<<<< HEAD
                changesetRequest "./service1"
=======
                changeset "./service1"
>>>>>>> a7a88a7084b2aa76e9a80e70fe1a52506cd95066
            }
            steps {
                sh 'cd service-1 && mvn clean package'
                sh 'cd service-1 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 2') {
            when {
<<<<<<< HEAD
                changesetRequest target "./service2"
=======
                changeset "./service2"
>>>>>>> a7a88a7084b2aa76e9a80e70fe1a52506cd95066
            }
            steps {
                sh 'cd service-2 && mvn clean package'
                sh 'cd service-2 && kubectl apply -f deployment.yaml'
            }
        }
        stage('Build and Deploy Service 3') {
            when {
<<<<<<< HEAD
                changeset "./sevice3"
=======
                changeset "./service3"
>>>>>>> a7a88a7084b2aa76e9a80e70fe1a52506cd95066
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
