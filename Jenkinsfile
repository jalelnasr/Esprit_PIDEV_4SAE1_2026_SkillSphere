// Jenkinsfile - CI/CD Pipeline for Platform Evaluation Service (Backend)
// This pipeline handles: Build → Test → SonarQube → Docker → Nexus

pipeline {
    agent any

    options {
        // Keep last 30 builds
        buildDiscarder(logRotator(numToKeepStr: '30'))
        // Timeout after 1 hour
        timeout(time: 1, unit: 'HOURS')
        // Disable concurrent builds
        disableConcurrentBuilds()
        // Add timestamps to logs
        timestamps()
    }

    environment {
        // Project information
        PROJECT_NAME = 'platform-evaluation-service'
        PROJECT_VERSION = '0.0.1-SNAPSHOT'
        
        // Docker registry
        DOCKER_REGISTRY = '4.223.111.246:8081'
        DOCKER_IMAGE_NAME = "${DOCKER_REGISTRY}/${PROJECT_NAME}"
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        
        // SonarQube
        SONAR_HOST_URL = 'http://4.223.111.246:9000'
        SONAR_PROJECT_KEY = 'platform-evaluation-backend'
        
        // Nexus
        NEXUS_URL = 'http://4.223.111.246:8081'
        NEXUS_CREDENTIALS = credentials('nexus-credentials')
        
        // Maven
        MAVEN_HOME = '/usr/share/maven'
        PATH = "${MAVEN_HOME}/bin:${PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "=== Checking out source code ==="
                    checkout scm
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "=== Building Spring Boot application ==="
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    echo "=== Running unit tests ==="
                    sh 'mvn test'
                }
            }
            post {
                always {
                    // Publish test results
                    junit 'target/surefire-reports/*.xml'
                    // Publish code coverage
                    jacoco(execPattern: 'target/jacoco.exec')
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "=== Running SonarQube analysis ==="
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            mvn sonar:sonar \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName="Platform Evaluation Backend" \
                              -Dsonar.sources=src/main \
                              -Dsonar.tests=src/test \
                              -Dsonar.java.binaries=target/classes \
                              -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    echo "=== Waiting for SonarQube Quality Gate ==="
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: false
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "=== Building Docker image ==="
                    sh '''
                        docker build \
                          --tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                          --tag ${DOCKER_IMAGE_NAME}:latest \
                          --build-arg BUILD_NUMBER=${BUILD_NUMBER} \
                          .
                    '''
                }
            }
        }

        stage('Push to Nexus Registry') {
            when {
                branch 'main'  // Only push on main branch
            }
            steps {
                script {
                    echo "=== Pushing Docker image to Nexus ==="
                    sh '''
                        echo "${NEXUS_CREDENTIALS_PSW}" | docker login \
                          --username "${NEXUS_CREDENTIALS_USR}" \
                          --password-stdin \
                          ${DOCKER_REGISTRY}
                        
                        docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        docker push ${DOCKER_IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Security Scanning') {
            steps {
                script {
                    echo "=== Running security checks ==="
                    sh 'mvn org.owasp:dependency-check-maven:check || echo "Security scan completed with warnings"'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                script {
                    echo "=== Archiving build artifacts ==="
                    archiveArtifacts artifacts: 'target/*.jar', 
                                    fingerprint: true, 
                                    allowEmptyArchive: false
                }
            }
        }
    }

    post {
        always {
            script {
                echo "=== Cleaning up workspace ==="
                cleanWs deleteDirs: true
            }
        }
        success {
            script {
                echo "✅ Pipeline succeeded!"
                // TODO: Send success notification (email, Slack, etc.)
            }
        }
        failure {
            script {
                echo "❌ Pipeline failed!"
                // TODO: Send failure notification (email, Slack, etc.)
            }
        }
    }
}
