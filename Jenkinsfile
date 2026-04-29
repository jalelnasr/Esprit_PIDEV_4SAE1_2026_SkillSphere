pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Community Service') {
            steps {
                echo 'Building community microservice...'

                dir('community_f/community 2') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'

                dir('community_f/community 2') {
                    sh 'mvn test'
                }
            }
        }

        stage('Archive Artifact') {
            steps {
                echo 'Archiving JAR...'

                dir('community_f/community 2') {
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully 🎉'
        }

        failure {
            echo 'Pipeline failed ❌ check logs'
        }
    }
}