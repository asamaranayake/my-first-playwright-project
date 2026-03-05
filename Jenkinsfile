// ============================================================
// Jenkins Pipeline: Playwright Tests (Local, No Docker)
// ============================================================
// Pre-requisites:
//   - Node.js installed on Jenkins agent
//   - HTML Publisher plugin for report viewing
// ============================================================

pipeline {
    agent any

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                sh '''
                    # Check if Node.js is installed
                    if ! command -v node &> /dev/null; then
                        echo "Node.js not found. Installing Node.js..."
                        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
                        apt-get install -y nodejs
                    fi
                    # Verify Node.js and npm versions
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Smoke Tests') {
            steps {
                sh 'npx playwright test --grep @smoke'
            }
        }

        stage('Run Full Test Suite') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Archive HTML report
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            // Archive test artifacts
            archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
            archiveArtifacts artifacts: 'test-results/**', fingerprint: true, allowEmptyArchive: true

            // Publish JUnit results
            junit testResults: 'test-results/junit-results.xml', allowEmptyResults: true
        }
        failure {
            echo 'Playwright tests failed! Check the report for details.'
        }
        success {
            echo 'All Playwright tests passed!'
        }
    }
}
