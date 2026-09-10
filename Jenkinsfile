// Jenkins Pipeline as Code for QAForge Playwright TypeScript framework
// Requires a Jenkins "Username with password" credential with ID: qaforge-test-account
//   - Username field -> EMAIL
//   - Password field -> PASSWORD
pipeline {
    agent any

    environment {
        // BASE_URL is not a secret; set/override it here or as a Jenkins job parameter.
        BASE_URL = 'https://dojo.upexgalaxy.com'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Install Playwright Browser') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Tests') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '12d2466b-9aff-486e-b9b9-94318c63d4b4',
                    usernameVariable: 'EMAIL',
                    passwordVariable: 'PASSWORD'
                )]) {
                    bat 'npx playwright test --project=chromium'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true, fingerprint: false

            script {
                if (fileExists('playwright-report/index.html')) {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Report'
                    ])
                }
            }
        }
    }
}
