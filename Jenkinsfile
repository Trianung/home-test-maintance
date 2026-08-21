pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        // Mock environment variables for testing stage
        JWT_SECRET = 'ci-test-secret-key'
        DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/maintenance_test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                echo "Setting up Node.js version ${NODE_VERSION}"
                // Normally you would use a NodeJS plugin or Docker agent here
                // e.g., nodejs(nodeJSInstallationName: 'Node20')
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    echo "Running unit and integration tests (Vitest)"
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker Image Build') {
            // Optional deployment stage if we want to build containers
            steps {
                echo "Building Docker images using docker-compose"
                sh 'docker-compose build'
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        success {
            echo "All stages passed successfully!"
        }
        failure {
            echo "Pipeline failed! Please check the logs."
        }
    }
}
